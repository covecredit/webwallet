import { Client } from 'xrpl';
import { NetworkConfig } from '../../../types/network';
import { EventEmitter } from '../../../utils/EventEmitter';
import { ConnectionState } from '../state';
import { ConnectionValidator } from './validator';
import { FallbackUrlProvider } from './fallback';
import { RetryStrategy } from './retry';
import { CONNECTION_CONFIG } from './config';

export class ConnectionManager extends EventEmitter {
  private client: Client | null = null;
  private network: NetworkConfig | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private connectionPromise: Promise<void> | null = null;
  private retryStrategy: RetryStrategy;

  constructor() {
    super();
    this.retryStrategy = new RetryStrategy();
  }

  async connect(network: NetworkConfig): Promise<void> {
    try {
      // Validate network configuration first
      ConnectionValidator.validateNetwork(network);

      // Don't reconnect if already connected to same network
      if (this.client?.isConnected() && this.network?.id === network.id) {
        return;
      }

      // Ensure clean state
      await this.disconnect();

      this.connectionState = ConnectionState.CONNECTING;
      this.network = network;
      console.log('Connecting to', network.name, 'at', network.url);

      // Try main URL
      try {
        await this.tryConnect(network.url);
        return;
      } catch (error) {
        console.warn(`Primary connection failed: ${network.url}`, error);
      }

      // Try fallback URLs
      const fallbackUrls = FallbackUrlProvider.getFallbackUrls(network.type);
      for (const url of fallbackUrls) {
        try {
          await this.tryConnect(url);
          this.network = { ...network, url };
          return;
        } catch (error) {
          console.warn(`Fallback connection failed: ${url}`, error);
        }
      }

      throw new Error('All connection attempts failed');
    } catch (error) {
      this.connectionState = ConnectionState.ERROR;
      console.error('Connection failed:', error);
      throw error;
    }
  }

  private async tryConnect(url: string): Promise<void> {
    if (!url.startsWith('wss://')) {
      throw new Error('Invalid WebSocket URL');
    }

    this.client = new Client(url, {
      timeout: CONNECTION_CONFIG.TIMEOUT,
      connectionTimeout: CONNECTION_CONFIG.CONNECTION_TIMEOUT,
      retry: CONNECTION_CONFIG.RETRY
    });

    return new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, CONNECTION_CONFIG.TIMEOUT);

      this.client?.once('connected', () => {
        clearTimeout(timeoutId);
        this.connectionState = ConnectionState.CONNECTED;
        this.emit('connected');
        resolve();
      });

      this.client?.once('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });

      this.client?.connect().catch(reject);
    });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      try {
        this.client.removeAllListeners();
        if (this.client.isConnected()) {
          await this.client.disconnect();
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      } finally {
        this.client = null;
        this.network = null;
        this.connectionState = ConnectionState.DISCONNECTED;
        this.emit('disconnected');
      }
    }
  }

  getClient(): Client | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED;
  }

  getCurrentNetwork(): NetworkConfig | null {
    return this.network;
  }
}