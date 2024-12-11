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
  private readonly CONNECTION_TIMEOUT = 20000;
  private readonly PING_INTERVAL = 30000;
  private pingTimer: NodeJS.Timeout | null = null;

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

      // Try main URL first
      try {
        await this.tryConnect(network.url);
        return;
      } catch (error) {
        console.warn(`Failed to connect to primary URL ${network.url}:`, error);
      }

      // Try fallback URLs based on network type
      const fallbackUrls = this.getFallbackUrls(network.type);
      for (const url of fallbackUrls) {
        try {
          await this.tryConnect(url);
          // Update network URL to successful fallback
          this.network = { ...network, url };
          return;
        } catch (error) {
          console.warn(`Failed to connect to fallback URL ${url}:`, error);
        }
      }

      throw new Error('All connection attempts failed');
    } catch (error) {
      console.error('Connection error:', error);
      this.connectionState = ConnectionState.ERROR;
      
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * Math.pow(2, this.retryCount - 1)));
        return this.establishConnection(network);
      }
      
      throw error;
    }
  }

  private async tryConnect(url: string): Promise<void> {
    if (this.client) {
      await this.disconnect();
    }

    this.client = new Client(url, {
      timeout: this.CONNECTION_TIMEOUT,
      connectionTimeout: 15000,
      retry: {
        maxAttempts: 2,
        minDelay: 1000,
        maxDelay: 5000
      }
    });

    return new Promise<void>((resolve, reject) => {
      if (!this.client) {
        reject(new Error('Client not initialized'));
        return;
      }

      const timeoutId = setTimeout(() => {
        this.cleanup();
        reject(new Error('Connection timeout'));
      }, this.CONNECTION_TIMEOUT);

      const cleanup = () => {
        clearTimeout(timeoutId);
        if (this.client) {
          this.client.removeAllListeners();
        }
      };

      this.client.on('connected', () => {
        cleanup();
        this.connectionState = ConnectionState.CONNECTED;
        this.retryCount = 0;
        if (this.client) {
          this.transactionService = new TransactionService(this.client);
          this.setupPingInterval();
        }
        console.log('Connected to', url);
        this.emit('connected');
        resolve();
      });

      this.client.on('disconnected', () => {
        cleanup();
        console.log('Disconnected from network');
        this.connectionState = ConnectionState.DISCONNECTED;
        this.emit('disconnected');
        this.scheduleReconnect();
        reject(new Error('Disconnected'));
      });

      this.client.on('error', (error) => {
        cleanup();
        console.error('Client error:', error);
        this.connectionState = ConnectionState.ERROR;
        this.emit('error', error);
        this.scheduleReconnect();
        reject(error);
      });

      this.client.connect().catch((error) => {
        cleanup();
        reject(error);
      });
    });
  }

  private setupPingInterval(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
    }
    this.pingTimer = setInterval(async () => {
      try {
        if (this.client?.isConnected()) {
          await this.client.request({ command: 'ping' });
        }
      } catch (error) {
        console.warn('Ping failed:', error);
        this.scheduleReconnect();
      }
    }, this.PING_INTERVAL);
  }

  private getFallbackUrls(networkType: string): string[] {
    switch (networkType) {
      case 'mainnet':
        return [
          'wss://xrplcluster.com',
          'wss://s1.ripple.com',
          'wss://s2.ripple.com'
        ];
      case 'testnet':
        return [
          'wss://s.altnet.rippletest.net:51233',
          'wss://testnet.xrpl-labs.com'
        ];
      case 'devnet':
        return [
          'wss://s.devnet.rippletest.net:51233'
        ];
      default:
        return [];
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout || !this.network || this.retryCount >= this.MAX_RETRIES) return;

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

  private cleanup(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.client) {
      this.client.removeAllListeners();
    }
  }

  async disconnect(): Promise<void> {
    this.cleanup();

    if (this.client) {
      try {
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