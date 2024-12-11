import { bitfinexService } from './bitfinex';
import { bitstampService } from './bitstamp';
import { krakenService } from './kraken';
import { PriceData } from '../../types';
import { EventEmitter } from '../../utils/EventEmitter';

export type ExchangeName = 'Bitfinex' | 'Bitstamp' | 'Kraken';

class ExchangeManager extends EventEmitter {
  private static instance: ExchangeManager;
  private currentExchange: ExchangeName = 'Bitfinex';
  private priceHistory: Map<ExchangeName, PriceData[]> = new Map();
  private readonly MAX_HISTORY = 1000;
  private isInitialized = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {
    super();
    this.setupExchanges();
  }

  static getInstance(): ExchangeManager {
    if (!ExchangeManager.instance) {
      ExchangeManager.instance = new ExchangeManager();
    }
    return ExchangeManager.instance;
  }

  private setupExchanges(): void {
    this.priceHistory.set('Bitfinex', []);
    this.priceHistory.set('Bitstamp', []);
    this.priceHistory.set('Kraken', []);

    bitfinexService.on('price', (data) => this.handlePrice('Bitfinex', data));
    bitstampService.on('price', (data) => this.handlePrice('Bitstamp', data));
    krakenService.on('price', (data) => this.handlePrice('Kraken', data));
  }

  private handlePrice(exchange: ExchangeName, data: PriceData): void {
    const history = this.priceHistory.get(exchange) || [];

    // Only add if price has changed
    const lastPrice = history[history.length - 1]?.lastPrice;
    if (lastPrice !== data.lastPrice) {
      history.push(data);

      if (history.length > this.MAX_HISTORY) {
        history.shift();
      }

      this.priceHistory.set(exchange, history);
      this.emit('price', { exchange, data });
    }
  }

  async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise<void>((resolve) => {
      // Stagger exchange connections to prevent overwhelming the system
      setTimeout(() => bitfinexService.connect(), 0);
      setTimeout(() => bitstampService.connect(), 1000);
      setTimeout(() => krakenService.connect(), 2000);

      // Consider connected after all exchanges have had time to initialize
      setTimeout(() => {
        this.isInitialized = true;
        this.connectionPromise = null;
        resolve();
      }, 3000);
    });

    return this.connectionPromise;
  }

  disconnect(): void {
    bitfinexService.disconnect();
    bitstampService.disconnect();
    krakenService.disconnect();
    this.isInitialized = false;
    this.connectionPromise = null;
  }

  setExchange(exchange: ExchangeName): void {
    this.currentExchange = exchange;
    this.emit('exchange', exchange);
  }

  getCurrentExchange(): ExchangeName {
    return this.currentExchange;
  }

  getPriceHistory(exchange: ExchangeName): PriceData[] {
    return this.priceHistory.get(exchange) || [];
  }

  getLastPrice(exchange: ExchangeName): PriceData | null {
    const history = this.priceHistory.get(exchange);
    return history ? history[history.length - 1] : null;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

export const exchangeManager = ExchangeManager.getInstance();
