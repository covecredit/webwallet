import { Client } from 'xrpl';
import { ConnectionTimeout } from './timeout';
import { ConnectionEventHandler } from './handlers';
import { CONNECTION_CONFIG } from './config';
import { ConnectionState } from '../state';

export class Connector {
  private timeout: ConnectionTimeout;
  private eventHandler: ConnectionEventHandler;

  constructor() {
    this.timeout = new ConnectionTimeout(CONNECTION_CONFIG.TIMEOUT);
    this.eventHandler = new ConnectionEventHandler();
  }

  async connect(url: string, setState: (state: ConnectionState) => void): Promise<Client> {
    if (!url.startsWith('wss://')) {
      throw new Error('Invalid WebSocket URL');
    }

    const client = new Client(url, {
      timeout: CONNECTION_CONFIG.TIMEOUT,
      connectionTimeout: CONNECTION_CONFIG.CONNECTION_TIMEOUT,
      retry: {
        ...CONNECTION_CONFIG.RETRY,
        forever: true
      }
    });

    return new Promise((resolve, reject) => {
      this.timeout.start(() => {
        reject(new Error('Connection timeout'));
        this.cleanup(client);
      });

      client.once('connected', () => {
        this.timeout.clear();
        this.eventHandler.handleConnected(client, setState);
        resolve(client);
      });

      client.once('error', (error) => {
        this.timeout.clear();
        this.eventHandler.handleError(error, setState);
        reject(error);
      });

      client.once('disconnected', () => {
        this.timeout.clear();
        this.eventHandler.handleDisconnected(setState);
      });

      client.connect().catch((error) => {
        this.timeout.clear();
        this.eventHandler.handleError(error, setState);
        reject(error);
      });
    });
  }

  private cleanup(client: Client): void {
    this.timeout.clear();
    client.removeAllListeners();
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.eventHandler.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    this.eventHandler.off(event, callback);
  }
}