import React from 'react';
import { TrendingUp, TrendingDown, Award, Database, DollarSign, BarChart2 } from 'lucide-react';
import { formatMarketValue } from './utils';
import { MarketInfoProps } from './types';

const MarketInfo: React.FC<MarketInfoProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
      {/* Component content remains the same */}
    </div>
  );
};

export default MarketInfo;