import { Client, Wallet } from 'xrpl';
import { NetworkConfig } from '../../types/network';
import { EventEmitter } from '../../utils/EventEmitter';
import { ConnectionState } from './state';
import { TransactionService } from './transaction';
import { XRPLErrorHandler } from './error';

export class XRPLService extends EventEmitter {
  private static instance: XRPLService;
  private client: Client | null = null;
  private wallet: Wallet | null = null;
  private network: NetworkConfig | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionPromise: Promise<void> | null = null;
  private transactionService: TransactionService | null = null;
  private readonly RETRY_DELAY = 5000;
  private readonly MAX_RETRIES = 3;
  private retryCount = 0;

  private constructor() {
    super();
  }

  static getInstance(): XRPLService {
    if (!XRPLService.instance) {
      XRPLService.instance = new XRPLService();
    }
    return XRPLService.instance;
  }

  async connect(network: NetworkConfig): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.client?.isConnected() && this.network?.id === network.id) {
      return;
    }

    await this.disconnect();
    this.connectionPromise = this.establishConnection(network);
    
    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async establishConnection(network: NetworkConfig): Promise<void> {
    try {
      this.connectionState = ConnectionState.CONNECTING;
      this.network = network;
      console.log('Connecting to', network.name);

      this.client = new Client(network.url, {
        timeout: 20000,
        connectionTimeout: 15000,
        retry: {
          maxAttempts: 3,
          minDelay: 1000,
          maxDelay: 5000
        }
      });

      await new Promise<void>((resolve, reject) => {
        if (!this.client) {
          reject(new Error('Client not initialized'));
          return;
        }

        const timeoutId = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 20000);

        this.client.on('connected', () => {
          clearTimeout(timeoutId);
          this.connectionState = ConnectionState.CONNECTED;
          this.retryCount = 0;
          if (this.client) {
            this.transactionService = new TransactionService(this.client);
          }
          console.log('Connected to', network.name);
          this.emit('connected');
          resolve();
        });

        this.client.on('disconnected', () => {
          console.log('Disconnected from network');
          this.connectionState = ConnectionState.DISCONNECTED;
          this.emit('disconnected');
          this.scheduleReconnect();
        });

        this.client.on('error', (error) => {
          console.error('Client error:', error);
          this.connectionState = ConnectionState.ERROR;
          this.emit('error', error);
          this.scheduleReconnect();
        });

        this.client.connect().catch(reject);
      });
    } catch (error) {
      console.error('Connection error:', error);
      this.connectionState = ConnectionState.ERROR;
      
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.establishConnection(network);
      }
      
      throw error;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout || !this.network || this.retryCount >= this.MAX_RETRIES) return;

    this.connectionState = ConnectionState.RECONNECTING;
    const delay = this.RETRY_DELAY * Math.pow(2, this.retryCount);
    
    console.log(`Scheduling reconnect in ${delay}ms`);
    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      this.retryCount++;
      try {
        await this.connect(this.network!);
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.emit('reconnectFailed', error);
      }
    }, delay);
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.client) {
      try {
        this.client.removeAllListeners();
        if (this.client.isConnected()) {
          await this.client.disconnect();
        }
      } catch (error) {
        console.error('Error during disconnect:', error);
      } finally {
        this.client = null;
        this.wallet = null;
        this.network = null;
        this.transactionService = null;
        this.connectionState = ConnectionState.DISCONNECTED;
        this.emit('disconnected');
      }
    }
  }

  async createWallet(seed: string): Promise<{ wallet: Wallet; balance: number }> {
    if (!this.client?.isConnected()) {
      throw new Error('Not connected to network');
    }

    try {
      this.wallet = Wallet.fromSeed(seed);

      try {
        const response = await this.client.request({
          command: 'account_info',
          account: this.wallet.address,
          ledger_index: 'validated'
        });

        const balance = Number(response.result.account_data.Balance) / 1000000;
        return { wallet: this.wallet, balance };
      } catch (error: any) {
        if (error.data?.error === 'actNotFound') {
          return { wallet: this.wallet, balance: 0 };
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Failed to create wallet:', error);
      const handledError = XRPLErrorHandler.handleWalletError(error);
      throw handledError;
    }
  }

  async sendXRP(params: {
    amount: string;
    destination: string;
    destinationTag?: string;
  }): Promise<string> {
    if (!this.transactionService) {
      throw new Error('Transaction service not initialized');
    }
    if (!this.wallet) {
      throw new Error('No wallet connected');
    }

    try {
      return await this.transactionService.sendXRP({
        ...params,
        wallet: this.wallet
      });
    } catch (error) {
      const handledError = XRPLErrorHandler.handleTransactionError(error);
      throw handledError;
    }
  }

  getClient(): Client | null {
    return this.client;
  }

  getWallet(): Wallet | null {
    return this.wallet;
  }

  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED;
  }

  getCurrentNetwork(): NetworkConfig | null {
    return this.network;
  }
}

export const xrplService = XRPLService.getInstance();