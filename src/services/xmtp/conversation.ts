import { Client, DecodedMessage } from '@xmtp/xmtp-js';
import { Message, Conversation } from './types';
import { EventEmitter } from '../../utils/EventEmitter';
import { ConversationError } from './errors';
import { validateAddress } from './validation';
import { XMTP_CONSTANTS } from './constants';
import { connectionStateManager, ConnectionState } from './state';

export class ConversationManager extends EventEmitter {
  private conversations: Map<string, Conversation> = new Map();
  private messageListeners: Map<string, () => void> = new Map();
  private streamTimeout: NodeJS.Timeout | null = null;

  constructor(private client: Client) {
    super();
    this.setupStreamTimeout();
  }

  private setupStreamTimeout(): void {
    if (this.streamTimeout) {
      clearTimeout(this.streamTimeout);
    }
    this.streamTimeout = setTimeout(() => {
      if (connectionStateManager.isConnected()) {
        this.restartConversationStream().catch(console.error);
      }
    }, XMTP_CONSTANTS.STREAM_TIMEOUT);
  }

  private async restartConversationStream(): Promise<void> {
    try {
      await this.cleanup();
      await this.startConversationStream();
    } catch (error) {
      console.error('Failed to restart conversation stream:', error);
      connectionStateManager.setState(ConnectionState.ERROR, error as Error);
    }
  }

  async startConversationStream(): Promise<void> {
    try {
      connectionStateManager.setState(ConnectionState.CONNECTING);
      const stream = await this.client.conversations.stream();
      
      for await (const conversation of stream) {
        await this.handleNewConversation(conversation);
      }
      
      connectionStateManager.setState(ConnectionState.CONNECTED);
      this.setupStreamTimeout();
    } catch (error) {
      console.error('Error in conversation stream:', error);
      connectionStateManager.setState(ConnectionState.ERROR, error as Error);
      throw new ConversationError('Failed to start conversation stream');
    }
  }

  private async handleNewConversation(conversation: Conversation): Promise<void> {
    if (!validateAddress(conversation.peerAddress)) {
      console.warn('Invalid peer address:', conversation.peerAddress);
      return;
    }

    this.conversations.set(conversation.peerAddress, conversation);

    try {
      const messageStream = await conversation.streamMessages();
      const listener = async () => {
        try {
          for await (const message of messageStream) {
            this.handleNewMessage(message, conversation.peerAddress);
          }
        } catch (error) {
          console.error('Error in message stream:', error);
          this.restartConversationStream().catch(console.error);
        }
      };

      this.messageListeners.set(conversation.peerAddress, listener);
      listener();
    } catch (error) {
      console.error('Failed to handle conversation:', error);
      throw new ConversationError('Failed to handle conversation');
    }
  }

  private handleNewMessage(message: DecodedMessage, peerAddress: string): void {
    try {
      const formattedMessage: Message = {
        id: message.id,
        sender: message.senderAddress,
        recipient: message.recipientAddress,
        content: message.content,
        timestamp: message.sent,
        conversation: peerAddress
      };
      this.emit('message', formattedMessage);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async getConversation(peerAddress: string): Promise<Conversation | null> {
    if (!validateAddress(peerAddress)) {
      throw new ConversationError('Invalid peer address');
    }

    let conversation = this.conversations.get(peerAddress);
    if (!conversation) {
      try {
        conversation = await this.client.conversations.newConversation(peerAddress);
        this.conversations.set(peerAddress, conversation);
      } catch (error) {
        console.error('Failed to create conversation:', error);
        throw new ConversationError('Failed to create conversation');
      }
    }
    return conversation;
  }

  async listConversations(): Promise<string[]> {
    try {
      const conversations = await this.client.conversations.list();
      return conversations
        .map(conv => conv.peerAddress)
        .filter(validateAddress);
    } catch (error) {
      console.error('Failed to list conversations:', error);
      throw new ConversationError('Failed to list conversations');
    }
  }

  async cleanup(): Promise<void> {
    if (this.streamTimeout) {
      clearTimeout(this.streamTimeout);
      this.streamTimeout = null;
    }
    this.messageListeners.clear();
    this.conversations.clear();
    connectionStateManager.reset();
  }
}