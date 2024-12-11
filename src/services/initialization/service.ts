import { exchangeManager } from '../exchanges';
import { EventEmitter } from '../../utils/EventEmitter';
import { InitializationOptions } from './types';

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

  async initialize(): Promise<void> {
    if (this.isInitializing) {
      return this.initPromise!;
    }

    this.isInitializing = true;
    this.initPromise = this.performInitialization();

    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  private async performInitialization(): Promise<void> {
    try {
      // Initialize market data feeds only
      this.emit('status', 'Initializing market data...');
      await exchangeManager.connect();

      // Complete initialization
      this.emit('complete');
    } catch (error) {
      console.error('Market data initialization error:', error);
      this.emit('error', error);
      // Don't throw error to allow app to load even if market data fails
    }
  }

  async cleanup(): Promise<void> {
    await exchangeManager.disconnect();
  }
}

export const initializationService = InitializationService.getInstance();