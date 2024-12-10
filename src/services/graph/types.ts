import { Transaction } from 'xrpl';

export interface GraphNode {
  id: string;
  label: string;
  type: 'wallet' | 'transaction' | 'ledger';
  data?: any;
}

export interface GraphLink {
  source: string;
  target: string;
  type?: string;
  data?: any;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface TransactionGraphOptions {
  limit?: number;
  includeDetails?: boolean;
}