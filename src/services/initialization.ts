import { exchangeManager } from './exchanges';
import { xrplService } from './xrpl';
import { NetworkConfig } from '../types/network';
import { EventEmitter } from '../utils/EventEmitter';

class InitializationService extends EventEmitter {
  private static instance: InitializationService;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {
    super();
  }

  static getInstance(): InitializationService {
    if (!InitializationService.instance) {
      InitializationService.instance = new InitializationService();
    }
    return InitializationService.instance;
  }

  async initialize(network: NetworkConfig): Promise<void> {
    if (this.isInitializing) {
      return this.initPromise!;
    }

    this.isInitializing = true;
    this.initPromise = this.performInitialization(network);

    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  private async performInitialization(network: NetworkConfig): Promise<void> {
    try {
      this.emit('status', 'Connecting to XRPL network...');
      await xrplService.connect(network);

      this.emit('status', 'Initializing market data feeds...');
      await exchangeManager.connect();

      // Allow time for initial data to load
      this.emit('status', 'Loading initial data...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.emit('complete');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    await Promise.all([
      exchangeManager.disconnect(),
      xrplService.disconnect()
    ]);
  }
}

export const initializationService = InitializationService.getInstance();