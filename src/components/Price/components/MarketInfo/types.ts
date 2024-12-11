export interface MarketData {
  rank?: number;
  supply?: number;
  maxSupply?: number;
  marketCapUsd?: number;
  volumeUsd24Hr?: number;
  priceUsd?: number;
  changePercent24Hr?: number;
  vwap24Hr?: number;
}

export interface MarketInfoProps {
  data: MarketData | null;
}