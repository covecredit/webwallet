import { Client } from '@xmtp/xmtp-js';
import { Wallet } from 'xrpl';
import { EventEmitter } from '../../utils/EventEmitter';
import { Message } from './types';
import { XMTPWalletAdapter } from './wallet';
import { ConversationManager } from './conversation';
import { MessageManager } from './message';

class XMTPService extends EventEmitter {
  private static instance: XMTPService;
  private client: Client | null = null;
  private conversationManager: ConversationManager | null = null;
  private messageManager: MessageManager | null = null;
  private isInitializing = false;

  private constructor() {
    super();
  }

  static getInstance(): XMTPService {
    if (!XMTPService.instance) {
      XMTPService.instance = new XMTPService();
    }
    return XMTPService.instance;
  }

  async initialize(wallet: Wallet): Promise<void> {
    if (this.isInitializing) {
      throw new Error('XMTP initialization already in progress');
    }

    try {
      this.isInitializing = true;
      console.log('Initializing XMTP service with wallet:', wallet.address);

      // Create XMTP-compatible wallet adapter
      const xmtpWallet = new XMTPWalletAdapter(wallet);
      
      // Create XMTP client
      this.client = await Client.create(xmtpWallet, { env: 'production' });
      
      // Initialize managers
      this.conversationManager = new ConversationManager(this.client);
      this.messageManager = new MessageManager(this.conversationManager);

      // Set up message forwarding
      this.conversationManager.on('message', (message: Message) => {
        console.log('New message received:', message);
        this.emit('message', message);
      });

      // Start conversation stream
      await this.conversationManager.startConversationStream();
      console.log('XMTP service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize XMTP service:', error);
      this.cleanup();
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async sendMessage(recipientAddress: string, content: string): Promise<void> {
    if (!this.messageManager) {
      throw new Error('XMTP service not initialized');
    }
    
    console.log('Sending message to:', recipientAddress);
    try {
      await this.messageManager.sendMessage(recipientAddress, content);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async getMessages(peerAddress: string): Promise<Message[]> {
    if (!this.messageManager) {
      throw new Error('XMTP service not initialized');
    }
    return this.messageManager.getMessages(peerAddress);
  }

  async listConversations(): Promise<string[]> {
    if (!this.conversationManager) {
      throw new Error('XMTP service not initialized');
    }
    return this.conversationManager.listConversations();
  }

  private cleanup(): void {
    if (this.conversationManager) {
      this.conversationManager.cleanup();
    }
    this.client = null;
    this.conversationManager = null;
    this.messageManager = null;
  }

  disconnect(): void {
    this.cleanup();
  }

  isConnected(): boolean {
    return this.client !== null;
  }
}

export const xmtpService = XMTPService.getInstance();
