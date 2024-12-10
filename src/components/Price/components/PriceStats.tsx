import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { PriceData } from '../../../types';
import type { ExchangeName } from '../../../services/exchanges';
import { formatValue, formatVolume } from '../../../utils/format';

interface PriceStatsProps {
  exchangeData: Record<string, PriceData[]>;
  selectedExchange: ExchangeName | 'All';
}

const PriceStats: React.FC<PriceStatsProps> = ({ exchangeData, selectedExchange }) => {
  const getLatestData = (): PriceData | null => {
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
        } as PriceData;
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
      <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
        <div className="text-text/70 mb-1">Last Price</div>
        <div className="text-lg font-bold text-primary">
          ${formatValue(latestData.lastPrice)}
        </div>
      </div>

      <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
        <div className="text-text/70 mb-1">24h Volume</div>
        <div className="text-lg font-bold text-primary">
          {formatVolume(latestData.volume)} XRP
        </div>
      </div>

      {typeof latestData.high === 'number' && (
        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">24h High</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(latestData.high)}
          </div>
        </div>
      )}

      {typeof latestData.low === 'number' && (
        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">24h Low</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(latestData.low)}
          </div>
        </div>
      )}

      {typeof latestData.dailyChangePercent === 'number' && (
        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">24h Change</div>
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
        </div>
      )}
    </div>
  );
};

export default PriceStats;
