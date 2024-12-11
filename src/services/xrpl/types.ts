import { Payment } from 'xrpl';

export interface TransactionParams {
  amount: string;
  destination: string;
  destinationTag?: string;
  wallet: any;
  fee?: string;
}

export interface PaymentParams {
  account: string;
  destination: string;
  amount: string;
  sequence: number;
  lastLedgerSequence: number;
  destinationTag?: string;
  fee?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface PreparedPayment extends Payment {
  Sequence: number;
  LastLedgerSequence: number;
  Fee?: string;
}