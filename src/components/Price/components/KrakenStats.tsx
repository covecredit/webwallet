import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { KrakenPriceData } from '../../../services/exchanges/kraken/types';
import { formatValue, formatVolume } from '../../../utils/format';

interface KrakenStatsProps {
  data: KrakenPriceData | null;
}

export const KrakenStats: React.FC<KrakenStatsProps> = ({ data }) => {
  if (!data) return null;

  const priceChange = data.close - data.open;
  const priceChangePercent = (priceChange / data.open) * 100;

  return (
    <div className="space-y-4">
      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">Last Price</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(data.lastPrice)}
          </div>
          <div className={`flex items-center space-x-1 text-xs ${
            priceChange >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {priceChange >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(priceChangePercent).toFixed(2)}%</span>
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">24h Volume</div>
          <div className="text-lg font-bold text-primary">
            {formatVolume(data.volume)} XRP
          </div>
          <div className="text-xs text-text/50">
            {data.count} trades
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">24h Range</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(data.high)}
          </div>
          <div className="text-xs text-text/50">
            Low: ${formatValue(data.low)}
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">VWAP</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(data.vwap)}
          </div>
          <div className="text-xs text-text/50">
            24h weighted avg
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">Best Bid</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(data.bid)}
          </div>
          <div className="text-xs text-text/50">
            Ask: ${formatValue(data.ask)}
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">Opening Price</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(data.open)}
          </div>
          <div className="text-xs text-text/50">
            Close: ${formatValue(data.close)}
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">Spread</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(data.ask - data.bid)}
          </div>
          <div className="text-xs text-text/50">
            {((data.ask - data.bid) / data.ask * 100).toFixed(3)}%
          </div>
        </div>

        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">Market Status</div>
          <div className="text-lg font-bold text-primary">
            Active
          </div>
          <div className="text-xs text-text/50">
            Real-time data
          </div>
        </div>
      </div>
    </div>
  );
};

export default KrakenStats;
