export interface Message {
  id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: Date;
  conversation: string;
}

export interface Conversation {
  peerAddress: string;
  messages(): Promise<any[]>;
  send(content: string): Promise<void>;
  streamMessages(): AsyncIterable<any>;
}

export interface XMTPConfig {
  env: 'production' | 'dev';
  timeout?: number;
  apiUrl?: string;
}