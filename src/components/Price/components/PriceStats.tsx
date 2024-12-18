import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../../constants/layout';
import { formatValue, formatVolume } from '../../../utils/format';
import type { PriceData } from '../../../types';
import type { ExchangeName } from '../../../services/exchanges';

interface PriceStatsProps {
  exchangeData: Record<string, PriceData[]>;
  selectedExchange: ExchangeName | 'All';
}

const PriceStats: React.FC<PriceStatsProps> = ({ exchangeData, selectedExchange }) => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE}px)`);

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
    <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-4'} text-sm`}>
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
    </div>
  );
};

export default PriceStats;