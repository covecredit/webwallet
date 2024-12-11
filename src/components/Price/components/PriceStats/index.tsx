import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PriceStatsProps } from './types';
import { StatCard } from './StatCard';
import { formatValue, formatVolume } from './utils';

const PriceStats: React.FC<PriceStatsProps> = ({ exchangeData, selectedExchange }) => {
  const getLatestData = () => {
    if (selectedExchange === 'All') {
      let totalVolume = 0;
      let weightedPrice = 0;
      let totalWeight = 0;

      Object.values(exchangeData).forEach(data => {
        const latest = data[data.length - 1];
        if (latest?.lastPrice && latest.volume) {
          totalVolume += latest.volume;
          weightedPrice += latest.lastPrice * latest.volume;
          totalWeight += latest.volume;
        }
      });

      if (totalWeight > 0) {
        return {
          timestamp: Date.now(),
          lastPrice: weightedPrice / totalWeight,
          volume: totalVolume,
          exchange: 'All'
        };
      }
      return null;
    }

    const data = exchangeData[selectedExchange] || [];
    return data[data.length - 1] || null;
  };

  const latestData = getLatestData();
  if (!latestData) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
      <StatCard
        label="Last Price"
        value={`$${formatValue(latestData.lastPrice)}`}
      />

      <StatCard
        label="24h Volume"
        value={`${formatVolume(latestData.volume)} XRP`}
      />

      {typeof latestData.high === 'number' && (
        <StatCard
          label="24h High"
          value={`$${formatValue(latestData.high)}`}
        />
      )}

      {typeof latestData.low === 'number' && (
        <StatCard
          label="24h Low"
          value={`$${formatValue(latestData.low)}`}
        />
      )}

      {typeof latestData.dailyChangePercent === 'number' && (
        <StatCard
          label="24h Change"
          value={
            <div className={`text-lg font-bold flex items-center space-x-1 ${
              latestData.dailyChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {latestData.dailyChangePercent >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span>{Math.abs(latestData.dailyChangePercent).toFixed(2)}%</span>
            </div>
          }
        />
      )}
    </div>
  );
};

export default PriceStats;