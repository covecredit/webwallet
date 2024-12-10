import { EventEmitter } from '../../utils/EventEmitter';
import { PriceData } from '../../types';

class KrakenService extends EventEmitter {
  private static instance: KrakenService;
  private ws: WebSocket | null = null;
  private lastData: PriceData | null = null;
  private candleData: Map<number, PriceData> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly RECONNECT_DELAY = 5000;
  private readonly MAX_RETRIES = 3;
  private retryCount = 0;
  private lastUpdate = 0;
  private readonly MIN_UPDATE_INTERVAL = 1000; // 1 second minimum between updates
  private readonly CANDLE_INTERVAL = 60000; // 1 minute candles

  private constructor() {
    super();
  }

  static getInstance(): KrakenService {
    if (!KrakenService.instance) {
      KrakenService.instance = new KrakenService();
    }
    return KrakenService.instance;
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
      
      if (Array.isArray(data) && data[2] === 'ticker') {
        const now = Date.now();
        if (now - this.lastUpdate < this.MIN_UPDATE_INTERVAL) return;
        this.lastUpdate = now;

        const ticker = data[1];
        const currentPrice = Number(ticker.c[0]);
        const currentVolume = Number(ticker.v[0]);

        // Calculate candle timestamp (floor to nearest minute)
        const candleTimestamp = Math.floor(now / this.CANDLE_INTERVAL) * this.CANDLE_INTERVAL;
        let candle = this.candleData.get(candleTimestamp);

        if (!candle) {
          // Create new candle
          candle = {
            timestamp: candleTimestamp,
            open: currentPrice,
            high: currentPrice,
            low: currentPrice,
            close: currentPrice,
            volume: currentVolume,
            lastPrice: currentPrice,
            bid: Number(ticker.b[0]),
            ask: Number(ticker.a[0]),
            vwap: Number(ticker.p[1]),
            numTrades: Number(ticker.t[1]),
            exchange: 'Kraken'
          };
          this.candleData.set(candleTimestamp, candle);
        } else {
          // Update existing candle
          candle.high = Math.max(candle.high, currentPrice);
          candle.low = Math.min(candle.low, currentPrice);
          candle.close = currentPrice;
          candle.volume += currentVolume;
          candle.lastPrice = currentPrice;
          candle.bid = Number(ticker.b[0]);
          candle.ask = Number(ticker.a[0]);
          candle.vwap = Number(ticker.p[1]);
          candle.numTrades = Number(ticker.t[1]);
        }

        // Clean up old candles (keep last hour)
        const cutoff = now - (60 * 60 * 1000);
        for (const [timestamp] of this.candleData) {
          if (timestamp < cutoff) {
            this.candleData.delete(timestamp);
          }
        }

        this.lastData = candle;
        this.emit('price', candle);
      }
    } catch (error) {
      console.error('Error processing Kraken data:', error);
      this.emit('error', error);
    }
  }

  private subscribe(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      event: 'subscribe',
      pair: ['XRP/USD'],
      subscription: { name: 'ticker' }
    }));
  }

  private cleanup(): void {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onopen = null;
      this.ws = null;
    }
    this.candleData.clear();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    this.retryCount++;
    if (this.retryCount > this.MAX_RETRIES) {
      this.emit('error', new Error('Failed to connect to Kraken after maximum retries'));
      return;
    }

    const delay = this.RECONNECT_DELAY * Math.pow(2, this.retryCount - 1);
    console.log(`Scheduling Kraken reconnect in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, delay);
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.close();
    }

    this.cleanup();
  }

  getLastData(): PriceData | null {
    return this.lastData;
  }
}

export const krakenService = KrakenService.getInstance();