export class XRPLError extends Error {
  constructor(
    public code: string,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'XRPLError';
  }
}

export class ConnectionError extends XRPLError {
  constructor(message: string, originalError?: any) {
    super('CONNECTION_ERROR', message, originalError);
    this.name = 'ConnectionError';
  }
}

export class WalletError extends XRPLError {
  constructor(message: string, originalError?: any) {
    super('WALLET_ERROR', message, originalError);
    this.name = 'WalletError';
  }
}

export class TransactionError extends XRPLError {
  constructor(message: string, originalError?: any) {
    super('TRANSACTION_ERROR', message, originalError);
    this.name = 'TransactionError';
  }
}