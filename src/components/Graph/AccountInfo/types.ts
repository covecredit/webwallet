export interface AccountInfoProps {
  selectedNode: {
    id: string;
    type: string;
    data?: any;
  } | null;
}

export interface AccountData {
  Account: string;
  Balance: string;
  Sequence: number;
  OwnerCount: number;
  PreviousTxnID: string;
  Flags: number;
  lines?: any[];
}