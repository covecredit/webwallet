import { Message } from './types';
import { ConversationManager } from './conversation';

export class MessageManager {
  constructor(private conversationManager: ConversationManager) {}

  async sendMessage(recipientAddress: string, content: string): Promise<void> {
    const conversation = await this.conversationManager.getConversation(recipientAddress);
    if (!conversation) {
      throw new Error('Failed to create or find conversation');
    }

    await conversation.send(content);
  }

  async getMessages(peerAddress: string): Promise<Message[]> {
    const conversation = await this.conversationManager.getConversation(peerAddress);
    if (!conversation) {
      return [];
    }

    const messages = await conversation.messages();
    return messages.map(msg => ({
      id: msg.id,
      sender: msg.senderAddress,
      recipient: msg.recipientAddress,
      content: msg.content,
      timestamp: msg.sent,
      conversation: peerAddress
    }));
  }
}