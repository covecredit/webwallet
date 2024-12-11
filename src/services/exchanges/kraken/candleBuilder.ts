import { KrakenTickerData, KrakenPriceData } from './types';

export class KrakenCandleBuilder {
  private candles: Map<number, KrakenPriceData> = new Map();
  private readonly CANDLE_INTERVAL = 60000; // 1 minute

  updateCandle(timestamp: number, tickerData: KrakenTickerData): KrakenPriceData {
    const candleTime = Math.floor(timestamp / this.CANDLE_INTERVAL) * this.CANDLE_INTERVAL;
    const currentPrice = Number(tickerData.last[0]);
    
    let candle = this.candles.get(candleTime);
    
    if (!candle) {
      // Create new candle
      candle = {
        timestamp: candleTime,
        open: Number(tickerData.opening),
        high: Number(tickerData.high[0]),
        low: Number(tickerData.low[0]),
        close: currentPrice,
        volume: Number(tickerData.volume[0]),
        vwap: Number(tickerData.volumeWeightedAverage[0]),
        count: tickerData.numberOfTrades[0],
        ask: Number(tickerData.ask[0]),
        bid: Number(tickerData.bid[0]),
        lastPrice: currentPrice
      };
    } else {
      // Update existing candle
      candle.high = Math.max(candle.high, Number(tickerData.high[0]));
      candle.low = Math.min(candle.low, Number(tickerData.low[0]));
      candle.close = currentPrice;
      candle.volume = Number(tickerData.volume[0]);
      candle.vwap = Number(tickerData.volumeWeightedAverage[0]);
      candle.count = tickerData.numberOfTrades[0];
      candle.ask = Number(tickerData.ask[0]);
      candle.bid = Number(tickerData.bid[0]);
      candle.lastPrice = currentPrice;
    }

    this.candles.set(candleTime, candle);
    return candle;
  }

  cleanOldCandles(cutoffTime: number): void {
    for (const [timestamp] of this.candles) {
      if (timestamp < cutoffTime) {
        this.candles.delete(timestamp);
      }
    }
  }

  getCandles(): KrakenPriceData[] {
    return Array.from(this.candles.values())
      .sort((a, b) => a.timestamp - b.timestamp);
  }
}