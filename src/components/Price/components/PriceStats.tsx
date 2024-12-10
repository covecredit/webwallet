import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { PriceData } from '../../../types';
import type { ExchangeName } from '../../../services/exchanges';

interface PriceStatsProps {
  exchangeData: Record<string, PriceData[]>;
  selectedExchange: ExchangeName | 'All';
}

const PriceStats: React.FC<PriceStatsProps> = ({ exchangeData, selectedExchange }) => {
  const formatValue = (value: number | undefined): string => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return value.toFixed(4);
  };

  const formatVolume = (volume: number | undefined): string => {
    if (typeof volume !== 'number' || isNaN(volume)) return 'N/A';
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
    return volume.toFixed(2);
  };

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
      <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
        <div className="text-text/70 mb-1">Last Price</div>
        <div className="text-lg font-bold text-primary">
          ${formatValue(latestData?.lastPrice)}
        </div>
      </div>

      <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
        <div className="text-text/70 mb-1">24h Volume</div>
        <div className="text-lg font-bold text-primary">
          {formatVolume(latestData?.volume)} XRP
        </div>
      </div>

      <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
        <div className="text-text/70 mb-1">24h High</div>
        <div className="text-lg font-bold text-primary">
          ${formatValue(latestData?.high)}
        </div>
      </div>

      <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
        <div className="text-text/70 mb-1">24h Low</div>
        <div className="text-lg font-bold text-primary">
          ${formatValue(latestData?.low)}
        </div>
      </div>

      {latestData?.bid && (
        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">Bid</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(latestData.bid)}
          </div>
        </div>
      )}

      {latestData?.ask && (
        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">Ask</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(latestData.ask)}
          </div>
        </div>
      )}

      {latestData?.dailyChangePercent !== undefined && (
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

      {latestData?.vwap && (
        <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
          <div className="text-text/70 mb-1">24h VWAP</div>
          <div className="text-lg font-bold text-primary">
            ${formatValue(latestData.vwap)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceStats;