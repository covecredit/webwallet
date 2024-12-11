import React from 'react';
import { KrakenChart } from './CandlestickChart/KrakenChart';
import { BitfinexChart } from './CandlestickChart/BitfinexChart';
import { BitstampChart } from './CandlestickChart/BitstampChart';
import { PriceData } from '../../../types';
import { KrakenPriceData } from '../../../services/exchanges/kraken/types';

interface CandlestickChartProps {
  data: PriceData[] | KrakenPriceData[];
  exchange: string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, exchange }) => {
  // Early return if no data
  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-full text-text/50">
        No price data available
      </div>
    );
  }

  // Determine which chart component to render based on exchange
  switch (exchange) {
    case 'Kraken':
      return <KrakenChart data={data as KrakenPriceData[]} />;
    case 'Bitfinex':
      return <BitfinexChart data={data as PriceData[]} />;
    case 'Bitstamp':
      return <BitstampChart data={data as PriceData[]} />;
    case 'All':
      return <BitfinexChart data={data as PriceData[]} />;
    default:
      return (
        <div className="flex items-center justify-center h-full text-text/50">
          Unsupported exchange
        </div>
      );
  }
};

export default CandlestickChart;
