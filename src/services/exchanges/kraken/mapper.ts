import { KrakenTickerData, KrakenOHLCData, KrakenPriceData } from './types';

export class KrakenDataMapper {
  static mapTickerToPrice(ticker: KrakenTickerData): Partial<KrakenPriceData> {
    return {
      ask: Number(ticker.ask[0]),
      bid: Number(ticker.bid[0]),
      lastPrice: Number(ticker.last[0]),
      volume: Number(ticker.volume[1]), // last 24h volume
      vwap: Number(ticker.volumeWeightedAverage[1]), // last 24h vwap
      count: ticker.numberOfTrades[1], // last 24h trades
      high: Number(ticker.high[1]), // last 24h high
      low: Number(ticker.low[1]), // last 24h low
      open: Number(ticker.opening)
    };
  }

  static mapOHLCToPrice(ohlc: KrakenOHLCData): KrakenPriceData {
    return {
      timestamp: ohlc.time * 1000, // Convert to milliseconds
      open: ohlc.open,
      high: ohlc.high,
      low: ohlc.low,
      close: ohlc.close,
      vwap: ohlc.vwap,
      volume: ohlc.volume,
      count: ohlc.count,
      ask: 0, // Will be updated from ticker
      bid: 0, // Will be updated from ticker
      lastPrice: ohlc.close
    };
  }

  static mergeTickerAndOHLC(
    ohlc: KrakenPriceData,
    ticker: Partial<KrakenPriceData>
  ): KrakenPriceData {
    return {
      ...ohlc,
      ask: ticker.ask || ohlc.ask,
      bid: ticker.bid || ohlc.bid,
      lastPrice: ticker.lastPrice || ohlc.lastPrice
    };
  }
}