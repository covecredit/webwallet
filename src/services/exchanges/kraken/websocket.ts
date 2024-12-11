import { EventEmitter } from '../../../utils/EventEmitter';
import { KrakenTickerData, KrakenPriceData } from './types';
import { KrakenCandleBuilder } from './candleBuilder';

export class KrakenWebSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private candleBuilder: KrakenCandleBuilder;
  private readonly RECONNECT_DELAY = 5000;
  private readonly MAX_RETRIES = 3;
  private retryCount = 0;
  private lastUpdate = 0;
  private readonly MIN_UPDATE_INTERVAL = 1000;

  constructor() {
    super();
    this.candleBuilder = new KrakenCandleBuilder();
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      console.log('Connecting to Kraken WebSocket...');
      this.ws = new WebSocket('wss://ws.kraken.com');

      this.ws.onopen = () => {
        console.log('Connected to Kraken');
        this.retryCount = 0;
        this.subscribe();
      };

      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = () => {
        console.log('Disconnected from Kraken');
        this.cleanup();
        this.scheduleReconnect();
      };
      this.ws.onerror = (error) => {
        console.error('Kraken WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to connect to Kraken:', error);
      this.scheduleReconnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        const [channelID, rawData, channelName, pair] = data;

        if (channelName === 'ticker' && pair === 'XRP/USD') {
          const now = Date.now();
          if (now - this.lastUpdate < this.MIN_UPDATE_INTERVAL) return;
          this.lastUpdate = now;

          const tickerData: KrakenTickerData = {
            ask: rawData.a,
            bid: rawData.b,
            last: rawData.c,
            volume: rawData.v,
            volumeWeightedAverage: rawData.p,
            numberOfTrades: [Number(rawData.t[0]), Number(rawData.t[1])],
            low: rawData.l,
            high: rawData.h,
            opening: rawData.o
          };

          const candle = this.candleBuilder.updateCandle(now, tickerData);
          
          // Clean up old candles (keep last hour)
          const cutoff = now - (60 * 60 * 1000);
          this.candleBuilder.cleanOldCandles(cutoff);

          this.emit('price', candle);
        }
      }
    } catch (error) {
      console.error('Error processing Kraken data:', error);
      this.emit('error', error);
    }
  }

  // ... rest of the implementation remains the same
}