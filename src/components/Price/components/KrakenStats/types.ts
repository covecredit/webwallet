import { KrakenPriceData } from '../../../../services/exchanges/kraken/types';

export interface KrakenStatsProps {
  data: KrakenPriceData | null;
}

export interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
  subValue?: string | React.ReactNode;
}

export interface SafeKrakenStats {
  lastPrice: number;
  volume: number;
  count: number;
  high: number;
  low: number;
  vwap: number;
  bid: number;
  ask: number;
  open: number;
  close: number;
}