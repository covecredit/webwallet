import React from 'react';
import { TrendingUp, TrendingDown, Award, Database, DollarSign, BarChart2 } from 'lucide-react';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../../constants/layout';
import { formatMarketValue } from './utils';
import { MarketInfoProps } from './types';

const MarketInfo: React.FC<MarketInfoProps> = ({ data }) => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE}px)`);
  
  if (!data) return null;

  return (
    <div className={`grid ${isMobile ? 'grid-cols-2 gap-2 text-xs' : 'grid-cols-4 gap-4 text-sm'}`}>
      <div className="bg-background bg-opacity-50 rounded-lg p-3 border border-primary border-opacity-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-primary`} />
            <span className="text-text text-opacity-70">Rank</span>
          </div>
          <span className="text-primary font-bold">{data.rank ? `#${data.rank}` : 'N/A'}</span>
        </div>
      </div>

      <div className="bg-background bg-opacity-50 rounded-lg p-3 border border-primary border-opacity-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-primary`} />
            <span className="text-text text-opacity-70">Supply</span>
          </div>
          <div className="text-right">
            <div className="text-primary font-bold">{formatMarketValue(data.supply, 0)}</div>
            {data.maxSupply && (
              <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-text text-opacity-50`}>
                Max: {formatMarketValue(data.maxSupply, 0)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-background bg-opacity-50 rounded-lg p-3 border border-primary border-opacity-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-primary`} />
            <span className={`text-text text-opacity-70 ${isMobile ? 'text-[10px]' : ''}`}>Market Cap</span>
          </div>
          <span className="text-primary font-bold">{formatMarketValue(data.marketCapUsd)}</span>
        </div>
      </div>

      <div className="bg-background bg-opacity-50 rounded-lg p-3 border border-primary border-opacity-30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart2 className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-primary`} />
            <span className={`text-text text-opacity-70 ${isMobile ? 'text-[10px]' : ''}`}>24h Change</span>
          </div>
          {typeof data.changePercent24Hr === 'number' ? (
            <div className={`flex items-center space-x-1 ${
              data.changePercent24Hr >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {data.changePercent24Hr >= 0 ? (
                <TrendingUp className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              ) : (
                <TrendingDown className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
              )}
              <span className="font-bold">
                {Math.abs(data.changePercent24Hr).toFixed(2)}%
              </span>
            </div>
          ) : (
            <span className="text-text text-opacity-50">N/A</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketInfo;
