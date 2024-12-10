import { Client } from 'xrpl';
import { TransactionValidator } from './validator';
import { TransactionBuilder } from './builder';
import { TransactionParams } from './types';

export class TransactionService {
  private validator: TransactionValidator;
  private builder: TransactionBuilder;

  constructor(private client: Client) {
    this.validator = new TransactionValidator(client);
    this.builder = new TransactionBuilder();
  }

  async sendXRP(params: TransactionParams): Promise<string> {
    if (!this.client?.isConnected()) {
      throw new Error('Not connected to network');
    }

    try {
      // Validate all parameters
      const validations = await Promise.all([
        this.validator.validateAmount(params.amount),
        this.validator.validateDestinationTag(params.destinationTag),
        this.validator.validateSourceAccount(params.wallet.address, params.amount),
        this.validator.validateDestinationAccount(params.destination),
        params.fee ? this.validator.validateFee(params.fee) : { isValid: true }
      ]);

      // Check for validation errors
      const validationError = validations.find(v => !v.isValid);
      if (validationError) {
        throw new Error(validationError.error);
      }

      // Get current ledger and sequence
      const [currentLedger, accountInfo] = await Promise.all([
        this.client.getLedgerIndex(),
        this.client.request({
          command: 'account_info',
          account: params.wallet.address,
          ledger_index: 'validated'
        })
      ]);

      // Build payment transaction
      const payment = this.builder.buildPayment({
        account: params.wallet.address,
        destination: params.destination,
        amount: params.amount,
        sequence: accountInfo.result.account_data.Sequence,
        lastLedgerSequence: currentLedger + 75,
        destinationTag: params.destinationTag,
        fee: params.fee
      });

      // Auto-fill transaction fields
      const prepared = await this.client.autofill(payment);
      console.log('Prepared transaction:', prepared);

      // Sign and submit
      const signed = params.wallet.sign(prepared);
      console.log('Signed transaction:', signed);

      const result = await this.client.submitAndWait(signed.tx_blob);
      console.log('Transaction result:', result);

      // Verify success
      if (result.result.meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Transaction failed: ${result.result.meta?.TransactionResult}`);
      }

      return result.result.hash;
    } catch (error: any) {
      console.error('Transaction failed:', error);
      
      // Handle specific error cases
      if (error.message.includes('tecUNFUNDED_PAYMENT')) {
        throw new Error('Insufficient balance to complete the transaction');
      }
      if (error.message.includes('temREDUNDANT')) {
        throw new Error('Duplicate transaction detected');
      }
      if (error.message.includes('tecDST_TAG_NEEDED')) {
        throw new Error('Destination tag is required for this address');
      }
      if (error.message.includes('tecNO_DST_INSUF_XRP')) {
        throw new Error('Destination account requires activation deposit');
      }
      if (error.message.includes('tecPATH_DRY')) {
        throw new Error('Payment would leave insufficient XRP reserve');
      }
      if (error.message.includes('temBAD_FEE')) {
        throw new Error('Invalid transaction fee');
      }
      if (error.message.includes('temBAD_SEQUENCE')) {
        throw new Error('Invalid transaction sequence');
      }

      throw error;
    }
  }
}