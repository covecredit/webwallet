import React from 'react';
import { History, X } from 'lucide-react';
import { loadFromStorage } from '../../../utils/storage';
import { STORAGE_KEYS } from '../../../constants/storage';

interface SearchHistoryProps {
  onSelect: (term: string) => void;
  onClear?: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ onSelect, onClear }) => {
  // Component implementation remains the same
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-primary/30 rounded-lg shadow-lg z-10">
      {/* Component JSX remains the same */}
    </div>
  );
};

export default SearchHistory;