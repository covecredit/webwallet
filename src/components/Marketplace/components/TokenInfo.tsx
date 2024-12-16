import React from 'react';
import { TokenPair } from '../types';
import { Award, Users, Activity, DollarSign } from 'lucide-react';

interface TokenInfoProps {
  pair: TokenPair;
}

const TokenInfo: React.FC<TokenInfoProps> = ({ pair }) => {
  return (
    <div className="flex items-center justify-between bg-background">
      {/* Left side - Token info */}
      <div className="flex items-center space-x-4">
        {pair.imageUrl && (
          <img src={pair.imageUrl} alt={pair.baseToken} className="w-10 h-10 rounded-full" />
        )}
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold">{pair.baseToken}/{pair.quoteToken}</h2>
            <span className={`text-sm ${pair.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ({pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%)
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-text/70">
            <span>{pair.lastPrice} {pair.quoteToken}</span>
            <span>${pair.priceUSD.toFixed(3)} USD</span>
          </div>
        </div>
      </div>

      {/* Right side - Quick stats */}
      <div className="flex space-x-6">
        <Stat icon={Users} label="Trustlines" value={pair.trustlines.toLocaleString()} />
        <Stat icon={Activity} label="Holders" value={pair.holders.toLocaleString()} />
        <Stat icon={Award} label="Rank" value={`#${pair.rank}`} />
        <Stat icon={DollarSign} label="Market Cap" value={`$${(pair.marketCap / 1000000).toFixed(1)}M`} />
      </div>
    </div>
  );
};

const Stat: React.FC<{ icon: any; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center space-x-1 text-sm text-text/70">
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
    <span className="font-medium">{value}</span>
  </div>
);

export default TokenInfo;
