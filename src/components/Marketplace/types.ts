export interface TokenPair {
  baseToken: string;
  quoteToken: string;
  lastPrice: number;
  priceUSD: number;
  change24h: number;
  volume24h: number;
  trustlines: number;
  holders: number;
  rank: number;
  issuerFee: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  imageUrl?: string;
}

export interface OrderBook {
  bids: Order[];
  asks: Order[];
}

export interface Order {
  price: number;
  amount: number;
  total: number;
  type: 'bid' | 'ask';
}

export type OrderType = 'limit' | 'market' | 'send';

export interface PlaceOrderParams {
  type: OrderType;
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  pair: TokenPair;
}
