import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'xrpl';
import { XMTPWalletAdapter } from './wallet';
import { ClientNotInitializedError } from './errors';

export class XMTPClient {
  private client: Client | null = null;
  private isInitialized = false;

  async initialize(wallet: Wallet): Promise<Client> {
    try {
      if (this.isInitialized && this.client) {
        return this.client;
      }

      console.log('Initializing XMTP client...');
      const signer = new XMTPWalletAdapter(wallet);
      this.client = await Client.create(signer, { env: 'production' });
      this.isInitialized = true;
      console.log('XMTP client initialized successfully');

      return this.client;
    } catch (error) {
      console.error('Failed to initialize XMTP client:', error);
      throw new ClientNotInitializedError();
    }
  }

  getClient(): Client | null {
    return this.client;
  }

  disconnect(): void {
    this.client = null;
    this.isInitialized = false;
  }

  isConnected(): boolean {
    return this.isInitialized && this.client !== null;
  }
}