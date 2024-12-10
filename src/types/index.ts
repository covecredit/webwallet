import { ThemeColors, ThemeName } from './theme';
import { Widget } from './widget';
import { NetworkConfig } from './network';

export interface StorageData {
  theme: ThemeName;
  widgets: Widget[];
  network: NetworkConfig | null;
  seed: string | null;
}

export interface Notification {
  id: string;
  message: string;
  type: 'price' | 'system' | 'transaction';
}

export interface PriceData {
  timestamp: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  bid?: number;
  ask?: number;
  lastPrice?: number;
  vwap?: number;
  dailyChange?: number;
  dailyChangePercent?: number;
  numTrades?: number;
  exchange: string;
}

export interface MarketData {
  rank: number;
  supply: number;
  maxSupply: number;
  marketCapUsd: number;
  volumeUsd24Hr: number;
  priceUsd: number;
  changePercent24Hr: number;
  vwap24Hr: number;
}