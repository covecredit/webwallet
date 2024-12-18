import { Client } from 'xrpl';
import { NetworkConfig } from '../../types/network';
import { EventEmitter } from '../../utils/EventEmitter';
import { ConnectionState } from './state';
import { ConnectionError } from './errors';
import { RetryStrategy } from './retry';
import { ConnectionValidator } from './validator';

export class ConnectionService extends EventEmitter {
  private client: Client | null = null;
  private retryStrategy: RetryStrategy;
  private connectionPromise: Promise<void> | null = null;
  private currentNetwork: NetworkConfig | null = null;

  constructor() {
    super();
    this.retryStrategy = new RetryStrategy();
  }

  async connect(network: NetworkConfig): Promise<void> {
    try {
      // Validate network configuration
      ConnectionValidator.validateNetwork(network);

      // Check if already connected to the same network
      if (this.client?.isConnected() && this.currentNetwork?.id === network.id) {
        return;
      }

      // Ensure clean state before connecting
      await this.disconnect();
      this.currentNetwork = network;

      console.log('Connecting to', network.name);
      this.emit('connecting', network);

      // Create and configure client
      this.client = new Client(network.url, {
        timeout: 20000,
        connectionTimeout: 15000,
        retry: {
          maxAttempts: 3,
          minDelay: 1000,
          maxDelay: 5000
        }
      });

      // Set up event handlers
      this.setupEventHandlers();

      // Attempt connection
      await this.client.connect();
      
      console.log('Connected successfully to', network.name);
      this.emit('connected', network);
      this.retryStrategy.reset();

    } catch (error) {
      console.error('Connection error:', error);
      
      if (this.retryStrategy.shouldRetry()) {
        console.log(`Retrying connection (attempt ${this.retryStrategy.getAttempts() + 1})...`);
        await this.retryStrategy.wait();
        return this.connect(network);
      }

      this.emit('error', new ConnectionError('Failed to connect after maximum retries'));
      throw error;
    }
  }

  private setupEventHandlers(): void {
    if (!this.client) return;

    this.client.on('connected', () => {
      this.emit('connected', this.currentNetwork);
    });

    this.client.on('disconnected', () => {
      this.emit('disconnected');
      if (this.retryStrategy.shouldRetry()) {
        this.reconnect();
      }
    });

    this.client.on('error', (error) => {
      console.error('Client error:', error);
      this.emit('error', error);
      if (this.retryStrategy.shouldRetry()) {
        this.reconnect();
      }
    });
  }

  private async reconnect(): Promise<void> {
    if (!this.currentNetwork) return;
    
    try {
      await this.retryStrategy.wait();
      await this.connect(this.currentNetwork);
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }

  async disconnect(): Promise<void> {
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
        this.currentNetwork = null;
        this.emit('disconnected');
      }
    }
  }

  getClient(): Client | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.isConnected() || false;
  }

  getCurrentNetwork(): NetworkConfig | null {
    return this.currentNetwork;
  }
}

export const connectionService = new ConnectionService();
