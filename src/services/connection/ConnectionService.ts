```typescript
import { Client } from 'xrpl';
import { NetworkConfig } from '../../types/network';
import { connectionManager, ConnectionState } from './ConnectionManager';
import { ConnectionError } from './errors';

export class ConnectionService {
  private static instance: ConnectionService;
  private client: Client | null = null;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): ConnectionService {
    if (!ConnectionService.instance) {
      ConnectionService.instance = new ConnectionService();
    }
    return ConnectionService.instance;
  }

  async connect(network: NetworkConfig): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.client?.isConnected() && connectionManager.getNetwork()?.id === network.id) {
      return;
    }

    this.connectionPromise = this.establishConnection(network);

    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async establishConnection(network: NetworkConfig): Promise<void> {
    try {
      connectionManager.setState(ConnectionState.CONNECTING);
      connectionManager.setNetwork(network);
      console.log('Connecting to', network.name);

      await this.disconnect();

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
          reject(new ConnectionError('Client not initialized'));
          return;
        }

        const timeoutId = setTimeout(() => {
          reject(new ConnectionError('Connection timeout'));
        }, 20000);

        this.client.on('connected', () => {
          clearTimeout(timeoutId);
          connectionManager.setState(ConnectionState.CONNECTED);
          console.log('Connected to', network.name);
          resolve();
        });

        this.client.on('disconnected', () => {
          console.log('Disconnected from network');
          connectionManager.setState(ConnectionState.DISCONNECTED);
          if (!connectionManager.isConnecting()) {
            this.scheduleReconnect();
          }
        });

        this.client.on('error', (error) => {
          console.error('Client error:', error);
          connectionManager.setState(ConnectionState.ERROR, error);
          if (!connectionManager.isConnecting()) {
            this.scheduleReconnect();
          }
        });

        this.client.connect().catch(reject);
      });
    } catch (error) {
      console.error('Connection error:', error);
      connectionManager.setState(ConnectionState.ERROR, error as Error);
      
      if (connectionManager.canReconnect()) {
        await new Promise(resolve => setTimeout(resolve, connectionManager.getReconnectDelay()));
        return this.establishConnection(network);
      }
      
      throw error;
    }
  }

  private scheduleReconnect(): void {
    const network = connectionManager.getNetwork();
    if (!network || !connectionManager.canReconnect()) return;

    connectionManager.setState(ConnectionState.RECONNECTING);
    const delay = connectionManager.getReconnectDelay();
    
    console.log(`Scheduling reconnect in ${delay}ms`);
    setTimeout(() => {
      this.connect(network).catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
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
        connectionManager.setState(ConnectionState.DISCONNECTED);
        connectionManager.setNetwork(null);
      }
    }
  }

  getClient(): Client | null {
    return this.client;
  }

  isConnected(): boolean {
    return connectionManager.isConnected();
  }

  getCurrentNetwork(): NetworkConfig | null {
    return connectionManager.getNetwork();
  }
}

export const connectionService = ConnectionService.getInstance();
```