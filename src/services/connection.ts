import { Client } from 'xrpl';
import { NetworkConfig } from '../types/network';
import { EventEmitter } from '../utils/EventEmitter';

class ConnectionManager extends EventEmitter {
  private static instance: ConnectionManager;
  private client: Client | null = null;
  private connectionPromise: Promise<void> | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private network: NetworkConfig | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly INITIAL_RETRY_DELAY = 2000;
  private readonly MAX_RETRY_DELAY = 30000;
  private readonly FALLBACK_NETWORKS = new Map<string, string[]>([
    ['mainnet', [
      'wss://xrplcluster.com',
      'wss://s1.ripple.com',
      'wss://s2.ripple.com'
    ]],
    ['testnet', [
      'wss://s.altnet.rippletest.net:51233',
      'wss://testnet.xrpl-labs.com',
      'wss://clio.altnet.rippletest.net:51233'
    ]],
    ['devnet', [
      'wss://s.devnet.rippletest.net:51233',
      'wss://clio.devnet.rippletest.net:51233'
    ]]
  ]);

  private constructor() {
    super();
  }

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  async connect(network: NetworkConfig): Promise<Client> {
    // If already connecting, wait for that connection
    if (this.connectionPromise) {
      await this.connectionPromise;
      if (this.client?.isConnected()) {
        return this.client;
      }
    }

    // If already connected to the same network, return existing client
    if (this.client?.isConnected() && this.network?.id === network.id) {
      return this.client;
    }

    // Disconnect from any existing connection
    await this.disconnect();

    // Establish new connection
    this.connectionPromise = this.establishConnection(network);
    await this.connectionPromise;
    this.connectionPromise = null;

    if (!this.client) {
      throw new Error('Failed to establish connection');
    }

    return this.client;
  }

  private async establishConnection(network: NetworkConfig): Promise<void> {
    try {
      console.log('Connecting to network:', network.name);
      
      // Get fallback URLs for the network type
      const fallbackUrls = this.FALLBACK_NETWORKS.get(network.type) || [];
      const urls = [network.url, ...fallbackUrls];
      let lastError: Error | null = null;

      // Try each URL until one works
      for (const url of urls) {
        try {
          this.client = new Client(url, {
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
              this.reconnectAttempts = 0;
              this.emit('connected');
              console.log('Connected to', network.name, 'via', url);
              resolve();
            });

            this.client.on('error', (error) => {
              clearTimeout(timeoutId);
              reject(error);
            });

            this.client.connect().catch(reject);
          });

          this.network = { ...network, url }; // Store successful URL
          return;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Failed to connect to ${url}:`, error);
          if (this.client) {
            this.client.removeAllListeners();
            this.client = null;
          }
        }
      }

      // If all URLs failed, throw the last error
      throw lastError || new Error('All connection attempts failed');
    } catch (error) {
      this.client = null;
      this.network = null;
      console.error('Connection error:', error);
      this.emit('error', error);
      throw new Error(`Failed to connect to ${network.name}. Please try again or select a different network.`);
    }
  }

  private scheduleReconnect(useFallback: boolean = false): void {
    if (this.reconnectTimer || !this.network) return;

    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    const delay = Math.min(
      this.INITIAL_RETRY_DELAY * Math.pow(2, this.reconnectAttempts),
      this.MAX_RETRY_DELAY
    );

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts + 1} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        this.reconnectAttempts++;
        if (useFallback) {
          // Try next fallback URL if available
          const fallbackUrls = this.FALLBACK_NETWORKS.get(this.network!.type) || [];
          const currentIndex = fallbackUrls.indexOf(this.network!.url);
          const nextUrl = fallbackUrls[(currentIndex + 1) % fallbackUrls.length];
          await this.connect({ ...this.network!, url: nextUrl });
        } else {
          await this.connect(this.network!);
        }
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.emit('reconnectFailed', error);
      } finally {
        this.reconnectTimer = null;
      }
    }, delay);
  }

  async disconnect(): Promise<void> {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

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
        this.reconnectAttempts = 0;
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
    return this.network;
  }
}

export const connectionManager = ConnectionManager.getInstance();