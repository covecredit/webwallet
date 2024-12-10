import { EventEmitter } from '../../utils/EventEmitter';

export interface PriceData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  bid?: number;
  ask?: number;
  lastPrice?: number;
  vwap?: number;
  dailyChange?: number;
  dailyChangePercent?: number;
  numTrades?: number;
  exchange: string;
}

export interface ExchangeService extends EventEmitter {
  connect(): void;
  disconnect(): void;
  getLastData(): PriceData | null;
}