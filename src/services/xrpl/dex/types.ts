import { Amount } from 'xrpl';

export interface TokenInfo {
  currency: string;
  issuer: string;
  name?: string;
  description?: string;
  imageUrl?: string | null;
  balance?: string;
  trustlines?: number;
  holders?: number;
  frozen?: boolean;
  network?: 'mainnet' | 'testnet' | 'devnet';
}

export interface TrustLine {
  account: string;
  currency: string;
  issuer: string;
  balance: string;
  limit: string;
  limitPeer: string;
  frozen: boolean;
}

export interface CreateTrustLineParams {
  account: string;
  currency: string;
  issuer: string;
  limit: string;
}

export interface OrderBookOffer {
  price: number;
  amount: number;
  total: number;
  type: 'bid' | 'ask';
  account: string;
  sequence: number;
}

export interface PlaceOrderParams {
  type: 'limit' | 'market';
  side: 'buy' | 'sell';
  takerGets: Amount;
  takerPays: Amount;
  account: string;
}