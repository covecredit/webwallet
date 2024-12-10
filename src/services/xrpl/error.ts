import { TransactionError } from './types';

export class XRPLErrorHandler {
  static handleTransactionError(error: any): Error {
    console.error('XRPL Transaction Error:', error);

    // Handle specific transaction errors
    if (error.message?.includes('tecUNFUNDED_PAYMENT')) {
      return new Error('Insufficient balance to complete the transaction');
    }
    if (error.message?.includes('temREDUNDANT')) {
      return new Error('Duplicate transaction detected');
    }
    if (error.message?.includes('tecDST_TAG_NEEDED')) {
      return new Error('Destination tag is required for this address');
    }
    if (error.message?.includes('tecNO_DST_INSUF_XRP')) {
      return new Error('Destination account requires activation deposit');
    }
    if (error.message?.includes('tecPATH_DRY')) {
      return new Error('Payment would leave insufficient XRP reserve');
    }
    if (error.message?.includes('temBAD_FEE')) {
      return new Error('Invalid transaction fee');
    }
    if (error.message?.includes('temBAD_SEQUENCE')) {
      return new Error('Invalid transaction sequence');
    }

    // Handle connection errors
    if (error.message?.includes('Not connected')) {
      return new Error('Not connected to network. Please try again.');
    }
    if (error.message?.includes('Connection timeout')) {
      return new Error('Network connection timeout. Please try again.');
    }

    // Handle validation errors
    if (error.message?.includes('Invalid seed')) {
      return new Error('Invalid wallet seed format');
    }
    if (error.message?.includes('Invalid amount')) {
      return new Error('Invalid transaction amount');
    }
    if (error.message?.includes('Invalid destination')) {
      return new Error('Invalid destination address');
    }

    // Return original error message or generic error
    return new Error(error.message || 'An unexpected error occurred. Please try again.');
  }

  static handleConnectionError(error: any): Error {
    console.error('XRPL Connection Error:', error);

    if (error.message?.includes('timeout')) {
      return new Error('Connection timeout. Please check your network connection.');
    }
    if (error.message?.includes('WebSocket')) {
      return new Error('WebSocket connection failed. Please try again.');
    }
    if (error.message?.includes('Network request failed')) {
      return new Error('Network request failed. Please check your internet connection.');
    }

    return new Error(error.message || 'Failed to connect to network. Please try again.');
  }

  static handleWalletError(error: any): Error {
    console.error('XRPL Wallet Error:', error);

    if (error.message?.includes('Invalid seed')) {
      return new Error('Invalid wallet seed format');
    }
    if (error.message?.includes('actNotFound')) {
      return new Error('Account not found or not activated');
    }
    if (error.message?.includes('Account disabled')) {
      return new Error('Account is disabled');
    }

    return new Error(error.message || 'Wallet operation failed. Please try again.');
  }
}