import { Client, Wallet } from 'xrpl';
import { DEXService } from './dex';
import { NetworkConfig } from '../../types/network';
import { XRPLError } from './errors';

class XRPLService {
  private static instance: XRPLService;
  private client: Client | null = null;
  private wallet: Wallet | null = null;
  private dexService: DEXService | null = null;
  private network: NetworkConfig | null = null;

  private constructor() {}

  static getInstance(): XRPLService {
    if (!XRPLService.instance) {
      XRPLService.instance = new XRPLService();
    }
    return XRPLService.instance;
  }

  async connect(network: NetworkConfig): Promise<void> {
    if (this.client?.isConnected() && this.network?.id === network.id) {
      return;
    }

    await this.disconnect();

    try {
      this.client = new Client(network.url, {
        timeout: 20000,
        connectionTimeout: 15000,
        retry: {
          maxAttempts: 3,
          minDelay: 1000,
          maxDelay: 5000
        }
      });

      await this.client.connect();
      this.network = network;
      
      // Initialize DEX service after successful connection
      if (!this.dexService) {
        this.dexService = new DEXService(this.client);
      }
      
      console.log('Connected to XRPL network:', network.name);
    } catch (error) {
      console.error('Connection error:', error);
      throw new XRPLError('CONNECTION_ERROR', 'Failed to connect to XRPL network', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client?.isConnected()) {
      await this.client.disconnect();
    }
    this.client = null;
    this.wallet = null;
    this.dexService = null;
    this.network = null;
  }

  getDEX(): DEXService {
    if (!this.client?.isConnected()) {
      throw new Error('Not connected to network');
    }
    if (!this.dexService) {
      throw new Error('DEX service not initialized');
    }
    return this.dexService;
  }

  getClient(): Client | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.isConnected() || false;
  }

  getCurrentNetwork(): NetworkConfig | null {
    return this.network;
  }
}

export const xrplService = XRPLService.getInstance();