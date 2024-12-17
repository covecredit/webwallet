import { Message } from './types';
import { ConversationManager } from './conversation';
import { validateMessage, validateAddress, validateContent } from './validation';
import { ERROR_CODES } from './constants';
import { MessageError } from './errors';

export class MessageManager {
  constructor(private conversationManager: ConversationManager) {}

  async sendMessage(recipientAddress: string, content: string): Promise<void> {
    try {
      // Validate inputs
      if (!validateAddress(recipientAddress)) {
        throw new MessageError('Invalid recipient address');
      }
      if (!validateContent(content)) {
        throw new MessageError('Invalid message content');
      }

      const conversation = await this.conversationManager.getConversation(recipientAddress);
      if (!conversation) {
        throw new MessageError('Failed to create or find conversation');
      }

      await conversation.send(content);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new MessageError(
        error instanceof Error ? error.message : 'Failed to send message'
      );
    }
  }

  async getMessages(peerAddress: string): Promise<Message[]> {
    try {
      if (!validateAddress(peerAddress)) {
        throw new MessageError('Invalid peer address');
      }

      const conversation = await this.conversationManager.getConversation(peerAddress);
      if (!conversation) {
        return [];
      }

      const messages = await conversation.messages();
      return messages
        .map(msg => ({
          id: msg.id,
          sender: msg.senderAddress,
          recipient: msg.recipientAddress,
          content: msg.content,
          timestamp: msg.sent,
          conversation: peerAddress
        }))
        .filter(validateMessage);
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw new MessageError(
        error instanceof Error ? error.message : 'Failed to get messages'
      );
    }
  }
}