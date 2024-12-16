import { Client } from 'xrpl';
import { NetworkConfig } from '../../../types/network';
import { EventEmitter } from '../../../utils/EventEmitter';
import { ConnectionState } from '../state';
import { ConnectionValidator } from './validator';
import { FallbackUrlProvider } from './fallback';
import { Connector } from './connector';

export class ConnectionManager extends EventEmitter {
  private client: Client | null = null;
  private network: NetworkConfig | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private connector: Connector;

  constructor() {
    super();
    this.connector = new Connector();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.connector.on('connected', () => this.emit('connected'));
    this.connector.on('disconnected', () => this.emit('disconnected'));
    this.connector.on('error', (error) => this.emit('error', error));
  }

  async connect(network: NetworkConfig): Promise<void> {
    try {
      ConnectionValidator.validateNetwork(network);

      if (this.client?.isConnected() && this.network?.id === network.id) {
        return;
      }

      await this.disconnect();
      this.network = network;
      this.setState(ConnectionState.CONNECTING);

      try {
        this.client = await this.connector.connect(network.url, this.setState.bind(this));
        return;
      } catch (error) {
        console.warn(`Primary connection failed: ${network.url}`, error);
        
        const fallbackUrls = FallbackUrlProvider.getFallbackUrls(network.type);
        for (const url of fallbackUrls) {
          try {
            this.client = await this.connector.connect(url, this.setState.bind(this));
            this.network = { ...network, url };
            return;
          } catch (error) {
            console.warn(`Fallback connection failed: ${url}`, error);
          }
        }
      }

      throw new Error('All connection attempts failed');
    } catch (error) {
      this.setState(ConnectionState.ERROR);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client?.isConnected()) {
      try {
        await this.client.disconnect();
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
    this.client = null;
    this.network = null;
    this.setState(ConnectionState.DISCONNECTED);
  }

  private setState(state: ConnectionState): void {
    this.connectionState = state;
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