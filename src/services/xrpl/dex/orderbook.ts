import { Client, BookOffersRequest, OfferCreate } from 'xrpl';
import { OrderBookOffer, PlaceOrderParams } from './types';
import { XRPLError } from '../errors';

export class OrderBookService {
  constructor(private client: Client) {}

  async fetchOrderBook(
    baseCurrency: string,
    baseIssuer: string,
    quoteCurrency: string,
    quoteIssuer?: string
  ): Promise<{ bids: OrderBookOffer[]; asks: OrderBookOffer[] }> {
    try {
      const [bids, asks] = await Promise.all([
        this.fetchOffers(baseCurrency, baseIssuer, quoteCurrency, quoteIssuer),
        this.fetchOffers(quoteCurrency, quoteIssuer, baseCurrency, baseIssuer)
      ]);

      return {
        bids: this.processOffers(bids, 'bid'),
        asks: this.processOffers(asks, 'ask')
      };
    } catch (error) {
      throw new XRPLError('ORDERBOOK_FETCH_ERROR', 'Failed to fetch orderbook', error);
    }
  }

  private async fetchOffers(
    takerGetsCurrency: string,
    takerGetsIssuer: string | undefined,
    takerPaysCurrency: string,
    takerPaysIssuer: string | undefined
  ) {
    const request: BookOffersRequest = {
      command: 'book_offers',
      taker_gets: takerGetsCurrency === 'XRP' 
        ? { currency: 'XRP' }
        : { currency: takerGetsCurrency, issuer: takerGetsIssuer! },
      taker_pays: takerPaysCurrency === 'XRP'
        ? { currency: 'XRP' }
        : { currency: takerPaysCurrency, issuer: takerPaysIssuer! },
      limit: 100
    };

    const response = await this.client.request(request);
    return response.result.offers || [];
  }

  private processOffers(offers: any[], type: 'bid' | 'ask'): OrderBookOffer[] {
    return offers.map(offer => {
      const getTsValue = typeof offer.TakerGets === 'string' 
        ? offer.TakerGets 
        : offer.TakerGets.value;
      const paysValue = typeof offer.TakerPays === 'string'
        ? offer.TakerPays
        : offer.TakerPays.value;

      const price = Number(paysValue) / Number(getTsValue);
      const amount = Number(getTsValue);
      const total = price * amount;

      return {
        price,
        amount,
        total,
        type,
        account: offer.Account,
        sequence: offer.Sequence
      };
    }).sort((a, b) => type === 'bid' ? b.price - a.price : a.price - b.price);
  }

  async placeOrder(params: PlaceOrderParams): Promise<string> {
    try {
      const offerCreate: OfferCreate = {
        TransactionType: 'OfferCreate',
        Account: params.account,
        TakerGets: params.takerGets,
        TakerPays: params.takerPays
      };

      const prepared = await this.client.autofill(offerCreate);
      const response = await this.client.submitAndWait(prepared);

      if (response.result.meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Order placement failed: ${response.result.meta?.TransactionResult}`);
      }

      return response.result.hash;
    } catch (error) {
      throw new XRPLError('ORDER_PLACE_ERROR', 'Failed to place order', error);
    }
  }
}
