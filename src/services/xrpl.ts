import { Client, Wallet, dropsToXrp, xrpToDrops, SubmitResponse, Payment } from 'xrpl';
import { NetworkConfig } from '../types/network';

class XRPLService {
  private static instance: XRPLService;
  private client: Client | null = null;
  private wallet: Wallet | null = null;

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

    this.connectionPromise = this.establishConnectionWithRetry(network);

    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async establishConnectionWithRetry(
    network: NetworkConfig,
    retries = 3,
    delay = 1000
  ): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.establishConnection(network);
        return;
      } catch (error) {
        console.error(`Connection attempt ${attempt} failed:`, error);
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw new Error('Failed to connect to network after multiple attempts.');
        }
      }
    }
  }

  private async establishConnection(network: NetworkConfig): Promise<void> {
    await this.disconnect();

    try {
      this.connectionAttempts++;
      console.log('Attempting to connect to', network.name);

      this.client = new Client(network.url, {
        timeout: 20000,
        connectionTimeout: 15000,
        retry: {
          maxAttempts: 3,
          minDelay: 1000,
          maxDelay: 5000,
        },
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
          this.connectionAttempts = 0;
          this.isReconnecting = false;
          console.log('Connected to', network.name);
          resolve();
        });

        this.client.on('error', (error) => {
          clearTimeout(timeoutId);
          reject(error);
        });

        this.client.connect().catch(reject);
      });

      this.network = network;
    } catch (error) {
      console.error('Connection error:', error);
      if (this.connectionAttempts < this.MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
        return this.establishConnection(network);
      }
      this.connectionAttempts = 0;
      throw new Error(
        'Failed to connect to network. Please try again or select a different network.'
      );
    }
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
        this.isReconnecting = false;
      }
    }
  }

  async createWallet(seed: string): Promise<{ wallet: Wallet; balance: number }> {
    if (!this.client?.isConnected()) {
      throw new Error('Not connected to network. Please try reconnecting.');
    }

    try {
      this.wallet = Wallet.fromSeed(seed);

      try {
        const response = await this.client.request({
          command: 'account_info',
          account: this.wallet.address,
          ledger_index: 'validated',
        });

        const balance = Number(dropsToXrp(response.result.account_data.Balance));
        return { wallet: this.wallet, balance };
      } catch (error: any) {
        if (error.data?.error === 'actNotFound') {
          return { wallet: this.wallet, balance: 0 };
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Failed to create wallet:', error);
      if (error.message?.includes('Invalid seed')) {
        throw new Error('Invalid wallet seed. Please check and try again.');
      }
      throw new Error('Failed to create wallet. Please try again.');
    }
  }

  async sendXRP(params: {
    amount: string;
    destination: string;
    destinationTag?: number;
    fee: string;
  }): Promise<string> {
    if (!this.client?.isConnected() || !this.wallet) {
      throw new Error(
        'Not connected to network or wallet not initialized. Please try reconnecting.'
      );
    }

    const amountInDrops = xrpToDrops(params.amount);
    const feeInDrops = xrpToDrops(params.fee);

    try {
      const currentLedger = await this.client.getLedgerIndex();
      const nextSequence = await this.client
        .request({
          command: 'account_info',
          account: this.wallet.address,
          ledger_index: 'validated',
        })
        .then((response) => response.result.account_data.Sequence);

      const transaction: Payment = {
        TransactionType: 'Payment',
        Account: this.wallet.address,
        Destination: params.destination,
        Amount: amountInDrops,
        Sequence: nextSequence,
        LastLedgerSequence: currentLedger + 10,
        Fee: feeInDrops,
      };

      if (params.destinationTag) {
        transaction.DestinationTag = params.destinationTag;
      }

      const prepared = await this.client.autofill(transaction);
      const signed = this.wallet.sign(prepared);
      const result: SubmitResponse = await this.client.submitAndWait(signed.tx_blob);

      if (result.result.meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Transaction failed: ${result.result.meta?.TransactionResult}`);
      }

      return result.result.hash;
    } catch (error: any) {
      console.error('Failed to send XRP:', error);
      throw new Error(error.message || 'Failed to send XRP. Please try again.');
    }
  }

  getClient(): Client | null {
    return this.client;
  }

  getWallet(): Wallet | null {
    return this.wallet;
  }

  isConnected(): boolean {
    return this.client?.isConnected() || false;
  }

  getCurrentNetwork(): NetworkConfig | null {
    return this.network;
  }
}

const xrplService = XRPLService.getInstance();
export { xrplService };
