import { SafeKrakenStats } from './types';

/**
 * Format a numeric value to 4 decimal places with fallback
 */
export function formatValue(value: number | undefined | null): string {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return value.toFixed(4);
}

/**
 * Format volume with appropriate suffixes (M, K) and fallback
 */
export function formatVolume(volume: number | undefined | null): string {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
  return volume.toFixed(2);
}

/**
 * Format count with safe number formatting and fallback
 */
export function formatCount(count: number | undefined | null): string {
  if (typeof count !== 'number' || isNaN(count)) return 'N/A';
  try {
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  } catch (error) {
    return count.toString();
  }
}

/**
 * Calculate price change percentage with null safety
 */
export function calculatePriceChange(close?: number | null, open?: number | null): {
  change: number;
  percentage: number;
} {
  const closePrice = typeof close === 'number' && !isNaN(close) ? close : 0;
  const openPrice = typeof open === 'number' && !isNaN(open) ? open : closePrice;
  
  if (!openPrice) return { change: 0, percentage: 0 };
  
  const change = closePrice - openPrice;
  const percentage = (change / openPrice) * 100;
  
  return { change, percentage };
}

/**
 * Safely extract numeric values with fallbacks
 */
export function extractSafeStats(data: any): SafeKrakenStats {
  const safeNumber = (value: any): number | undefined => {
    const num = Number(value);
    return !isNaN(num) ? num : undefined;
  };

  return {
    lastPrice: safeNumber(data?.lastPrice) ?? 0,
    volume: safeNumber(data?.volume) ?? 0,
    count: safeNumber(data?.count),
    high: safeNumber(data?.high) ?? 0,
    low: safeNumber(data?.low) ?? 0,
    vwap: safeNumber(data?.vwap) ?? 0,
    bid: safeNumber(data?.bid),
    ask: safeNumber(data?.ask),
    open: safeNumber(data?.open) ?? 0,
    close: safeNumber(data?.close) ?? 0
  };
}