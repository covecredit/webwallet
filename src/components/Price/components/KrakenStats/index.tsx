import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { KrakenStatsProps } from './types';
import { StatCard } from './StatCard';
import {
  formatValue,
  formatVolume,
  formatCount,
  calculatePriceChange,
  extractSafeStats,
} from './utils';

const KrakenStats: React.FC<KrakenStatsProps> = ({ data }) => {
  // Early return if no data
  if (!data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <StatCard
            label="Status"
            value="No Data Available"
            subValue="Waiting for market data..."
          />
        </div>
      </div>
    );
  }

  // Extract safe numeric values with fallbacks
  const stats = extractSafeStats(data);

  // Calculate price changes safely
  const { change: priceChange, percentage: priceChangePercent } = calculatePriceChange(
    stats.close,
    stats.open
  );

  return (
    <div className="space-y-4">
      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <StatCard
          label="Last Price"
          value={`$${formatValue(stats.lastPrice)}`}
          subValue={
            <div
              className={`flex items-center space-x-1 text-xs ${
                priceChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {priceChange >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(priceChangePercent).toFixed(2)}%</span>
            </div>
          }
        />

        <StatCard
          label="24h Volume"
          value={`${formatVolume(stats.volume)} XRP`}
          // Only show trade count if it exists and is valid
          subValue={
            typeof stats.count === 'number' && stats.count > 0
              ? `${formatCount(stats.count)} trades`
              : undefined
          }
        />

        <StatCard
          label="24h Range"
          value={`$${formatValue(stats.high)}`}
          subValue={`Low: $${formatValue(stats.low)}`}
        />

        <StatCard label="VWAP" value={`$${formatValue(stats.vwap)}`} subValue="24h weighted avg" />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <StatCard
          label="Best Bid"
          value={`$${formatValue(stats.bid)}`}
          subValue={`Ask: $${formatValue(stats.ask)}`}
        />

        <StatCard
          label="Opening Price"
          value={`$${formatValue(stats.open)}`}
          subValue={`Close: $${formatValue(stats.close)}`}
        />

        {/* Only show spread if we have both ask and bid prices */}
        {typeof stats.ask === 'number' && typeof stats.bid === 'number' && (
          <StatCard
            label="Spread"
            value={`$${formatValue(stats.ask - stats.bid)}`}
            subValue={`${(((stats.ask - stats.bid) / stats.ask) * 100).toFixed(3)}%`}
          />
        )}

        <StatCard label="Market Status" value="Active" subValue="Real-time data" />
      </div>
    </div>
  );
};

export default KrakenStats;
