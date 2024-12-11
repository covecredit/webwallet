import { exchangeManager } from '../exchanges';
import { xrplService } from '../xrpl';
import { NetworkConfig } from '../../types/network';
import { EventEmitter } from '../../utils/EventEmitter';
import { InitializationOptions } from './types';

class InitializationService extends EventEmitter {
  private static instance: InitializationService;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;

  private constructor() {
    super();
  }

  static getInstance(): InitializationService {
    if (!InitializationService.instance) {
      InitializationService.instance = new InitializationService();
    }
    return InitializationService.instance;
  }

  async initialize(options: InitializationOptions): Promise<void> {
    if (this.isInitializing) {
      return this.initPromise!;
    }

    this.isInitializing = true;
    this.initPromise = this.performInitialization(options);

    try {
      await this.initPromise;
      this.retryCount = 0;
    } catch (error) {
      this.retryCount++;
      if (this.retryCount < this.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, options.retryDelay || 2000));
        return this.initialize(options);
      }
      throw error;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  private async performInitialization(options: InitializationOptions): Promise<void> {
    try {
      this.emit('status', 'Connecting to XRPL network...');
      await xrplService.connect(options.network);

      this.emit('status', 'Initializing market data feeds...');
      await exchangeManager.connect();

      // Allow time for initial data to load
      this.emit('status', 'Loading initial data...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.emit('complete');
    } catch (error) {
      console.error('Initialization error:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      await Promise.all([
        exchangeManager.disconnect(),
        xrplService.disconnect()
      ]);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

export const initializationService = InitializationService.getInstance();