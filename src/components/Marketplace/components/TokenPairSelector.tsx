import React from 'react';
import { Search } from 'lucide-react';
import { TokenPair } from '../types';

interface TokenPairSelectorProps {
  pairs: TokenPair[];
  selectedPair: TokenPair;
  onSelect: (pair: TokenPair) => void;
}

const TokenPairSelector: React.FC<TokenPairSelectorProps> = ({
  pairs,
  selectedPair,
  onSelect
}) => {
  const [search, setSearch] = React.useState('');

  const filteredPairs = pairs.filter(pair => 
    `${pair.baseToken}/${pair.quoteToken}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pairs..."
          className="w-full pl-10 pr-4 py-2 bg-background/50 border border-primary/30 rounded-lg"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary/50" />
      </div>

      <div className="max-h-[300px] overflow-y-auto space-y-2">
        {filteredPairs.map((pair) => (
          <button
            key={`${pair.baseToken}/${pair.quoteToken}`}
            onClick={() => onSelect(pair)}
            className={`w-full p-3 rounded-lg transition-colors ${
              selectedPair === pair
                ? 'bg-primary/20 border-primary'
                : 'bg-background/50 border-primary/30 hover:bg-primary/10'
            } border`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {pair.imageUrl && (
                  <img src={pair.imageUrl} alt={pair.baseToken} className="w-6 h-6 rounded-full" />
                )}
                <span className="font-medium">{pair.baseToken}/{pair.quoteToken}</span>
              </div>
              <span className={`${pair.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TokenPairSelector;
