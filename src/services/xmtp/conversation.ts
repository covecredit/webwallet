import { Client, DecodedMessage } from '@xmtp/xmtp-js';
import { Message, Conversation } from './types';
import { EventEmitter } from '../../utils/EventEmitter';
import { ConversationError } from './errors';

export class ConversationManager extends EventEmitter {
  private conversations: Map<string, Conversation> = new Map();
  private messageListeners: Map<string, () => void> = new Map();

  constructor(private client: Client) {
    super();
  }

  async startConversationStream(): Promise<void> {
    try {
      const stream = await this.client.conversations.stream();
      for await (const conversation of stream) {
        await this.handleNewConversation(conversation);
      }
    } catch (error) {
      console.error('Error in conversation stream:', error);
      throw new ConversationError('Failed to start conversation stream');
    }
  }

  private async handleNewConversation(conversation: Conversation): Promise<void> {
    const peerAddress = conversation.peerAddress;
    this.conversations.set(peerAddress, conversation);

    try {
      const messageStream = await conversation.streamMessages();
      const listener = async () => {
        try {
          for await (const message of messageStream) {
            this.handleNewMessage(message, peerAddress);
          }
        } catch (error) {
          console.error('Error in message stream:', error);
        }
      };

      this.messageListeners.set(peerAddress, listener);
      listener();
    } catch (error) {
      console.error('Failed to handle conversation:', error);
      throw new ConversationError('Failed to handle conversation');
    }
  }

  private handleNewMessage(message: DecodedMessage, peerAddress: string): void {
    this.emit('message', {
      id: message.id,
      sender: message.senderAddress,
      recipient: message.recipientAddress,
      content: message.content,
      timestamp: message.sent,
      conversation: peerAddress
    });
  }

  async getConversation(peerAddress: string): Promise<Conversation | null> {
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
      return conversations.map(conv => conv.peerAddress);
    } catch (error) {
      console.error('Failed to list conversations:', error);
      throw new ConversationError('Failed to list conversations');
    }
  }

  cleanup(): void {
    this.messageListeners.clear();
    this.conversations.clear();
  }
}