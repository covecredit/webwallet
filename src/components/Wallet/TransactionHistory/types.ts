export interface Transaction {
  type: string;
  hash: string;
  date: number; // Raw Ripple timestamp
  amount?: string;
  fee: string;
  sender: string;
  receiver?: string;
  result: string;
  sequence: number;
  memos?: Array<{
    type?: string;
    data?: string;
    format?: string;
  }>;
}

export interface TransactionHistoryProps {
  onClose: () => void;
}