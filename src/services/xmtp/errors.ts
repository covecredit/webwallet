export class XMTPError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'XMTPError';
  }
}

export class ClientNotInitializedError extends XMTPError {
  constructor() {
    super('XMTP client is not initialized', 'CLIENT_NOT_INITIALIZED');
  }
}

export class ConversationError extends XMTPError {
  constructor(message: string) {
    super(message, 'CONVERSATION_ERROR');
  }
}

export class MessageError extends XMTPError {
  constructor(message: string) {
    super(message, 'MESSAGE_ERROR');
  }
}