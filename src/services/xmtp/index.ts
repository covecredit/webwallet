import { Wallet } from 'xrpl';
import { EventEmitter } from '../../utils/EventEmitter';
import { Message } from './types';
import { XMTPClient } from './client';
import { ConversationManager } from './conversation';
import { MessageManager } from './message';

class XMTPService extends EventEmitter {
  private static instance: XMTPService;
  private client: XMTPClient;
  private conversationManager: ConversationManager | null = null;
  private messageManager: MessageManager | null = null;

  private constructor() {
    super();
    this.client = new XMTPClient();
  }

  static getInstance(): XMTPService {
    if (!XMTPService.instance) {
      XMTPService.instance = new XMTPService();
    }
    return XMTPService.instance;
  }

  async initialize(wallet: Wallet): Promise<void> {
    try {
      const xmtpClient = await this.client.initialize(wallet);
      this.conversationManager = new ConversationManager(xmtpClient);
      this.messageManager = new MessageManager(this.conversationManager);

      // Forward message events
      this.conversationManager.on('message', (message: Message) => {
        this.emit('message', message);
      });

      // Start listening for conversations
      await this.conversationManager.startConversationStream();
    } catch (error) {
      console.error('Failed to initialize XMTP service:', error);
      throw error;
    }
  }

  async sendMessage(recipientAddress: string, content: string): Promise<void> {
    if (!this.messageManager) {
      throw new Error('XMTP service not initialized');
    }
    await this.messageManager.sendMessage(recipientAddress, content);
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

  disconnect(): void {
    if (this.conversationManager) {
      this.conversationManager.cleanup();
    }
    this.client.disconnect();
    this.conversationManager = null;
    this.messageManager = null;
  }

  isConnected(): boolean {
    return this.client.isConnected();
  }
}

export const xmtpService = XMTPService.getInstance();