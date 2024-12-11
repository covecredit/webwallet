import { Client, Wallet } from 'xrpl';
import { NetworkConfig } from '../../types/network';

export interface XRPLServiceInterface {
  connect(network: NetworkConfig): Promise<void>;
  disconnect(): Promise<void>;
  createWallet(seed: string): Promise<{ wallet: Wallet; balance: number }>;
  sendXRP(params: {
    amount: string;
    destination: string;
    destinationTag?: string;
  }): Promise<string>;
  getClient(): Client | null;
  getWallet(): Wallet | null;
  isConnected(): boolean;
  getCurrentNetwork(): NetworkConfig | null;
}

export interface TransactionOptions {
  amount: string;
  destination: string;
  destinationTag?: string;
  wallet: Wallet;
}

export interface TransactionError extends Error {
  data?: {
    error?: string;
    error_code?: number;
    error_message?: string;
  };
}