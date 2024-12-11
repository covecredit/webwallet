import { KrakenTickerData, KrakenPriceData } from './types';

export function validateKrakenData(data: KrakenTickerData): KrakenPriceData | null {
  try {
    // Helper function to safely parse numeric values
    const safeNumber = (value: any): number | undefined => {
      const num = Number(value);
      return !isNaN(num) ? num : undefined;
    };

    // Extract and validate required fields
    const lastPrice = safeNumber(data.last?.[0]);
    const volume = safeNumber(data.volume?.[1]); // Use 24h volume

    // If essential data is missing, return null
    if (lastPrice === undefined || volume === undefined) {
      console.warn('Missing essential Kraken data:', { lastPrice, volume });
      return null;
    }

    // Build validated price data object
    const priceData: KrakenPriceData = {
      timestamp: Date.now(),
      lastPrice,
      volume,
      // Optional fields with safe fallbacks
      open: safeNumber(data.opening),
      high: safeNumber(data.high?.[1]), // 24h high
      low: safeNumber(data.low?.[1]), // 24h low
      close: lastPrice,
      vwap: safeNumber(data.volumeWeightedAverage?.[1]), // 24h VWAP
      count: safeNumber(data.numberOfTrades?.[1]), // 24h trades
      bid: safeNumber(data.bid?.[0]),
      ask: safeNumber(data.ask?.[0])
    };

    return priceData;
  } catch (error) {
    console.error('Error validating Kraken data:', error);
    return null;
  }
}