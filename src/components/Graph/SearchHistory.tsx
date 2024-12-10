import React from 'react';
import { History, X } from 'lucide-react';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storage';

interface SearchHistoryProps {
  onSelect: (address: string) => void;
  limit?: number;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ onSelect, limit = 10 }) => {
  const [searches, setSearches] = React.useState<string[]>(() => 
    loadFromStorage<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || []
  );

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, []);
    setSearches([]);
  };

  const handleRemoveSearch = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newSearches = [...searches];
    newSearches.splice(index, 1);
    saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, newSearches);
    setSearches(newSearches);
  };

  if (!searches.length) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-primary/30 rounded-lg shadow-lg z-10">
      <div className="flex items-center justify-between p-3 border-b border-primary/30">
        <div className="flex items-center space-x-2 text-sm text-text/70">
          <History className="w-4 h-4" />
          <span>Recent Searches</span>
        </div>
        <button
          onClick={handleClearHistory}
          className="text-xs hover:text-primary transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {searches.slice(0, limit).map((search, index) => (
          <div
            key={index}
            onClick={() => onSelect(search)}
            className="flex items-center justify-between p-3 hover:text-primary cursor-pointer group"
          >
            <span className="text-sm font-mono">{search}</span>
            <button
              onClick={(e) => handleRemoveSearch(e, index)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:text-primary rounded transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
