import { Client, Payment, xrpToDrops } from 'xrpl';
import { TransactionOptions } from './types';

export class TransactionService {
  constructor(private client: Client) {}

  async sendXRP(params: {
    amount: string;
    destination: string;
    destinationTag?: string;
    wallet: any;
  }): Promise<string> {
    if (!this.client?.isConnected()) {
      throw new Error('Not connected to network');
    }

    // Validate parameters
    if (!params.amount || isNaN(Number(params.amount)) || Number(params.amount) <= 0) {
      throw new Error('Invalid amount');
    }

    if (!params.destination || typeof params.destination !== 'string') {
      throw new Error('Invalid destination address');
    }

    if (params.destinationTag && isNaN(Number(params.destinationTag))) {
      throw new Error('Invalid destination tag');
    }

    try {
      console.log('Preparing payment transaction...');

      // Convert amount to drops
      const drops = xrpToDrops(params.amount);

      // Get current ledger sequence
      const currentLedger = await this.client.getLedgerIndex();

      // Get next sequence number
      const accountInfo = await this.client.request({
        command: 'account_info',
        account: params.wallet.address,
        ledger_index: 'validated'
      });

      const sequence = accountInfo.result.account_data.Sequence;

      // Prepare transaction
      const payment: Payment = {
        TransactionType: 'Payment',
        Account: params.wallet.address,
        Amount: drops,
        Destination: params.destination,
        Sequence: sequence,
        LastLedgerSequence: currentLedger + 75, // Give more time for validation
      };

      // Add destination tag if provided
      if (params.destinationTag) {
        payment.DestinationTag = parseInt(params.destinationTag, 10);
      }

      // Auto-fill transaction fields
      const prepared = await this.client.autofill(payment);
      console.log('Auto-filled transaction:', prepared);

      // Sign the transaction
      const signed = params.wallet.sign(prepared);
      console.log('Signed transaction:', signed);

      // Submit transaction and wait for validation
      const result = await this.client.submitAndWait(signed.tx_blob);
      console.log('Transaction result:', result);

      // Verify transaction success
      if (result.result.meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Transaction failed: ${result.result.meta?.TransactionResult}`);
      }

      // Return transaction hash
      return result.result.hash;
    } catch (error: any) {
      console.error('Send XRP failed:', error);
      
      // Handle specific error cases
      if (error.message.includes('tecUNFUNDED_PAYMENT')) {
        throw new Error('Insufficient balance to complete the transaction');
      } else if (error.message.includes('temREDUNDANT')) {
        throw new Error('Duplicate transaction detected');
      } else if (error.message.includes('tecDST_TAG_NEEDED')) {
        throw new Error('Destination tag is required for this address');
      } else if (error.message.includes('tecNO_DST_INSUF_XRP')) {
        throw new Error('Destination account requires activation deposit');
      } else if (error.message.includes('tecPATH_DRY')) {
        throw new Error('Payment would leave insufficient XRP reserve');
      } else if (error.message.includes('temBAD_FEE')) {
        throw new Error('Invalid transaction fee');
      } else if (error.message.includes('temBAD_SEQUENCE')) {
        throw new Error('Invalid transaction sequence');
      } else {
        throw new Error(error.message || 'Failed to send XRP. Please try again.');
      }
    }
  }
}