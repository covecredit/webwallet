import { Client } from 'xrpl';
import { TrustLineService } from './trustlines';
import { OrderBookService } from './orderbook';

export class DEXService {
  private trustLineService: TrustLineService;
  private orderBookService: OrderBookService;

  constructor(private client: Client) {
    this.trustLineService = new TrustLineService(client);
    this.orderBookService = new OrderBookService(client);
  }

  getTrustLineService(): TrustLineService {
    return this.trustLineService;
  }

  getOrderBookService(): OrderBookService {
    return this.orderBookService;
  }

  isReady(): boolean {
    return this.client.isConnected();
  }
}

export * from './types';
export * from './trustlines';
export * from './orderbook';