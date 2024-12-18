import { EventEmitter } from '../../utils/EventEmitter';
import { connectionService } from '../connection';
import { NetworkConfig } from '../../types/network';

export class InitializationService extends EventEmitter {
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
      this.emit('complete');
    } catch (error) {
      this.emit('error', error);
      throw error;
    } finally {
      this.isInitializing = false;
      this.initPromise = null;
    }
  }

  private async performInitialization(network: NetworkConfig): Promise<void> {
    try {
      this.emit('status', 'Connecting to XRPL network...');
      
      // Set up connection event handlers
      connectionService.on('connecting', () => {
        this.emit('status', 'Establishing connection...');
      });

      connectionService.on('error', (error) => {
        this.emit('status', `Connection error: ${error.message}`);
      });

      // Connect to network
      await connectionService.connect(network);
      
      this.emit('status', 'Connected successfully');

    } catch (error) {
      console.error('Initialization failed:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    await connectionService.disconnect();
  }
}

export const initializationService = InitializationService.getInstance();
