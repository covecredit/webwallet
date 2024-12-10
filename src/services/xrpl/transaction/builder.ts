import { xrpToDrops } from 'xrpl';
import { PaymentParams, PreparedPayment } from './types';

export class TransactionBuilder {
  buildPayment(params: PaymentParams): PreparedPayment {
    const payment: PreparedPayment = {
      TransactionType: 'Payment',
      Account: params.account,
      Destination: params.destination,
      Amount: xrpToDrops(params.amount),
      Sequence: params.sequence,
      LastLedgerSequence: params.lastLedgerSequence,
    };

    if (params.destinationTag) {
      payment.DestinationTag = parseInt(params.destinationTag, 10);
    }

    if (params.fee) {
      payment.Fee = xrpToDrops(params.fee);
    }

    return payment;
  }
}