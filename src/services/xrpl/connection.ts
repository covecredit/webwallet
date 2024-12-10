import { Client } from 'xrpl';
import { NetworkConfig } from '../../types/network';
import { EventEmitter } from '../../utils/EventEmitter';
import { XRPLErrorHandler } from './error';
import { connectionStateManager, ConnectionState } from './state';

export class ConnectionService extends EventEmitter {
  private client: Client | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly RETRY_DELAY = 5000;
  private connectionPromise: Promise<void> | null = null;

  async connect(network: NetworkConfig): Promise<Client> {
    if (this.connectionPromise) {
      await this.connectionPromise;
      if (this.client?.isConnected()) {
        return this.client;
      }
    }

    if (this.client?.isConnected() && connectionStateManager.getNetwork()?.id === network.id) {
      return this.client;
    }

    await this.disconnect();
    this.connectionPromise = this.establishConnection(network);
    
    try {
      await this.connectionPromise;
      if (!this.client) {
        throw new Error('Failed to initialize client');
      }
      return this.client;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async establishConnection(network: NetworkConfig): Promise<void> {
    try {
      connectionStateManager.setState(ConnectionState.CONNECTING);
      connectionStateManager.setNetwork(network);
      console.log('Connecting to', network.name);

      this.client = new Client(network.url, {
        timeout: 20000,
        connectionTimeout: 15000,
        retry: {
          maxAttempts: 3,
          minDelay: 1000,
          maxDelay: 5000
        }
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
          connectionStateManager.setState(ConnectionState.CONNECTED);
          console.log('Connected to', network.name);
          this.emit('connected');
          resolve();
        });

        this.client.on('disconnected', () => {
          console.log('Disconnected from network');
          connectionStateManager.setState(ConnectionState.DISCONNECTED);
          this.emit('disconnected');
          if (!connectionStateManager.isConnecting()) {
            this.scheduleReconnect();
          }
        });

        this.client.on('error', (error) => {
          const handledError = XRPLErrorHandler.handleConnectionError(error);
          console.error('Client error:', handledError);
          connectionStateManager.setState(ConnectionState.ERROR, handledError);
          this.emit('error', handledError);
          if (!connectionStateManager.isConnecting()) {
            this.scheduleReconnect();
          }
        });

        this.client.connect().catch(reject);
      });
    } catch (error) {
      const handledError = XRPLErrorHandler.handleConnectionError(error);
      console.error('Connection error:', handledError);
      connectionStateManager.setState(ConnectionState.ERROR, handledError);
      
      if (connectionStateManager.canReconnect()) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.establishConnection(network);
      }
      
      throw handledError;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout || !connectionStateManager.canReconnect()) return;

    const network = connectionStateManager.getNetwork();
    if (!network) return;

    connectionStateManager.setState(ConnectionState.RECONNECTING);
    const delay = this.RETRY_DELAY * Math.pow(2, connectionStateManager.getState() === ConnectionState.ERROR ? 1 : 0);
    
    console.log(`Scheduling reconnect in ${delay}ms`);
    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      try {
        await this.connect(network);
      } catch (error) {
        const handledError = XRPLErrorHandler.handleConnectionError(error);
        console.error('Reconnection failed:', handledError);
        this.emit('reconnectFailed', handledError);
      }
    }, delay);
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
        connectionStateManager.setState(ConnectionState.DISCONNECTED);
        connectionStateManager.setNetwork(null);
        this.emit('disconnected');
      }
    }
  }

  getClient(): Client | null {
    return this.client;
  }

  isConnected(): boolean {
    return connectionStateManager.isConnected();
  }

  getCurrentNetwork(): NetworkConfig | null {
    return connectionStateManager.getNetwork();
  }
}

export const connectionService = new ConnectionService();