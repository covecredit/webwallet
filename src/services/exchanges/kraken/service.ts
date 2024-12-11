import { EventEmitter } from '../../../utils/EventEmitter';
import { KrakenWebSocket } from './websocket';
import { KrakenPriceData, KrakenTickerData } from './types';
import { validateKrakenData } from './validator';

export class KrakenService extends EventEmitter {
  private static instance: KrakenService;
  private webSocket: KrakenWebSocket;
  private lastData: KrakenPriceData | null = null;

  private constructor() {
    super();
    this.webSocket = new KrakenWebSocket();
    this.setupWebSocket();
  }

  static getInstance(): KrakenService {
    if (!KrakenService.instance) {
      KrakenService.instance = new KrakenService();
    }
    return KrakenService.instance;
  }

  private setupWebSocket(): void {
    this.webSocket.on('price', (data: KrakenTickerData) => {
      // Validate and normalize the data before emitting
      const validatedData = validateKrakenData(data);
      if (validatedData) {
        this.lastData = validatedData;
        this.emit('price', validatedData);
      }
    });

    this.webSocket.on('error', (error: Error) => {
      this.emit('error', error);
    });
  }

  connect(): void {
    this.webSocket.connect();
  }

  disconnect(): void {
    this.webSocket.disconnect();
  }

  getLastData(): KrakenPriceData | null {
    return this.lastData;
  }
}

export const krakenService = KrakenService.getInstance();