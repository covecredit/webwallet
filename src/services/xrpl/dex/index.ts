import { Client } from 'xrpl';
import { TrustLineService } from './trustlines';
import { OrderBookService } from './orderbook';
import { TokenService } from './tokens';

export class DEXService {
  private trustLineService: TrustLineService;
  private orderBookService: OrderBookService;
  private tokenService: TokenService;

  constructor(private client: Client) {
    this.trustLineService = new TrustLineService(client);
    this.orderBookService = new OrderBookService(client);
    this.tokenService = new TokenService(client);
  }

  getTrustLineService(): TrustLineService {
    return this.trustLineService;
  }

  getOrderBookService(): OrderBookService {
    return this.orderBookService;
  }

  getTokenService(): TokenService {
    return this.tokenService;
  }

  isReady(): boolean {
    return this.client.isConnected();
  }
}

export * from './types';
export * from './trustlines';
export * from './orderbook';
export * from './tokens';