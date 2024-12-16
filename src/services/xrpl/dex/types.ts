import { Amount, IssuedCurrencyAmount } from 'xrpl';

export interface TrustLine {
  account: string;
  currency: string;
  issuer: string;
  balance: string;
  limit: string;
  limitPeer: string;
  frozen: boolean;
}

export interface TokenInfo {
  currency: string;
  issuer: string;
  balance: string;
  trustlines: number;
  holders: number;
  frozen: boolean;
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

export interface CreateTrustLineParams {
  currency: string;
  issuer: string;
  limit: string;
  account: string;
}
