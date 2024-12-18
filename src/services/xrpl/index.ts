import { Client, Wallet } from 'xrpl';
import { DEXService } from './dex';
import { NetworkConfig } from '../../types/network';
import { XRPLError } from './errors';
import { connectionService } from './connection';

class XRPLService {
  private static instance: XRPLService;
  private dexService: DEXService | null = null;
  private wallet: Wallet | null = null;

  private constructor() {}

  static getInstance(): XRPLService {
    if (!XRPLService.instance) {
      XRPLService.instance = new XRPLService();
    }
    return XRPLService.instance;
  }

  async connect(network: NetworkConfig): Promise<void> {
    try {
      await connectionService.connect(network);
      const client = connectionService.getClient();
      if (!client) throw new Error('Failed to initialize client');
      
      // Initialize DEX service with connected client
      this.dexService = new DEXService(client);
    } catch (error) {
      console.error('XRPL connection error:', error);
      throw new XRPLError('CONNECTION_ERROR', 'Failed to connect to XRPL network', error);
    }
  }

  async disconnect(): Promise<void> {
    this.dexService = null;
    this.wallet = null;
    await connectionService.disconnect();
  }

  getDEX(): DEXService {
    if (!this.dexService) {
      throw new XRPLError('SERVICE_ERROR', 'DEX service not initialized');
    }
    return this.dexService;
  }

  getClient(): Client | null {
    return connectionService.getClient();
  }

  isConnected(): boolean {
    return connectionService.isConnected();
  }

  getCurrentNetwork(): NetworkConfig | null {
    return connectionService.getCurrentNetwork();
  }
}

export const xrplService = XRPLService.getInstance();