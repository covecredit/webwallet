import { Message } from './types';

export function validateMessage(message: any): message is Message {
  return (
    typeof message === 'object' &&
    typeof message.id === 'string' &&
    typeof message.sender === 'string' &&
    typeof message.recipient === 'string' &&
    typeof message.content === 'string' &&
    message.timestamp instanceof Date &&
    typeof message.conversation === 'string'
  );
}

export function validateAddress(address: string): boolean {
  return address.startsWith('r') && address.length >= 25 && address.length <= 35;
}

export function validateContent(content: string): boolean {
  return content.length > 0 && content.length <= 10000; // 10KB limit
}