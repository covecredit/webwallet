import { EventEmitter } from '../../utils/EventEmitter';
import { PriceData } from '../../types';

class BitstampService extends EventEmitter {
  private static instance: BitstampService;
  private ws: WebSocket | null = null;
  private lastData: PriceData | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly RECONNECT_DELAY = 5000;
  private readonly MAX_RETRIES = 3;
  private retryCount = 0;
  private lastUpdate = 0;
  private readonly MIN_UPDATE_INTERVAL = 5000; // 5 seconds minimum between updates

  private constructor() {
    super();
  }

  static getInstance(): BitstampService {
    if (!BitstampService.instance) {
      BitstampService.instance = new BitstampService();
    }
    return BitstampService.instance;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      console.log('Connecting to Bitstamp WebSocket...');
      this.ws = new WebSocket('wss://ws.bitstamp.net');

      this.ws.onopen = () => {
        console.log('Connected to Bitstamp');
        this.retryCount = 0;
        this.subscribe();
      };

      this.ws.onmessage = this.handleMessage.bind(this);

      this.ws.onclose = () => {
        console.log('Disconnected from Bitstamp');
        this.cleanup();
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Bitstamp WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to connect to Bitstamp:', error);
      this.scheduleReconnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      if (data.event === 'trade') {
        const now = Date.now();
        if (now - this.lastUpdate < this.MIN_UPDATE_INTERVAL) return;
        this.lastUpdate = now;

        const priceData: PriceData = {
          timestamp: now,
          lastPrice: Number(data.data.price),
          volume: Number(data.data.amount),
          open: Number(data.data.open_24),
          high: Number(data.data.high_24),
          low: Number(data.data.low_24),
          close: Number(data.data.price),
          vwap: Number(data.data.vwap),
          bid: Number(data.data.bid),
          ask: Number(data.data.ask),
          exchange: 'Bitstamp'
        };

        // Only emit if values have changed
        if (!this.lastData || 
            this.lastData.lastPrice !== priceData.lastPrice ||
            this.lastData.volume !== priceData.volume) {
          this.lastData = priceData;
          this.emit('price', priceData);
        }
      }
    } catch (error) {
      console.error('Error processing Bitstamp data:', error);
      this.emit('error', error);
    }
  }

  private subscribe(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      event: 'bts:subscribe',
      data: { channel: 'live_trades_xrpusd' }
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
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) return;

    this.retryCount++;
    if (this.retryCount > this.MAX_RETRIES) {
      this.emit('error', new Error('Failed to connect to Bitstamp after maximum retries'));
      return;
    }

    const delay = this.RECONNECT_DELAY * Math.pow(2, this.retryCount - 1);
    console.log(`Scheduling Bitstamp reconnect in ${delay}ms`);

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

export const bitstampService = BitstampService.getInstance();