export interface KrakenTickerData {
  ask?: [string, string, string]; // [price, wholeLotVolume, lotVolume]
  bid?: [string, string, string]; // [price, wholeLotVolume, lotVolume]
  last?: [string, string]; // [price, volume]
  volume?: [string, string]; // [today, last24Hours]
  volumeWeightedAverage?: [string, string]; // [today, last24Hours]
  numberOfTrades?: [number, number]; // [today, last24Hours]
  low?: [string, string]; // [today, last24Hours]
  high?: [string, string]; // [today, last24Hours]
  opening?: string; // Today's opening price
}

export interface KrakenPriceData {
  timestamp: number;
  lastPrice: number;
  volume: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  vwap?: number;
  count?: number;
  bid?: number;
  ask?: number;
}