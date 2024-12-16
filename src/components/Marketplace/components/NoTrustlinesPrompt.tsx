import React from 'react';
import { Search, Plus } from 'lucide-react';

interface NoTrustlinesPromptProps {
  onSearch: () => void;
  onAddToken: () => void;
}

const NoTrustlinesPrompt: React.FC<NoTrustlinesPromptProps> = ({ onSearch, onAddToken }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-primary">No Tokens Found</h3>
        <p className="text-text/70">Your wallet has no trustlines established yet.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onSearch}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
        >
          <Search className="w-5 h-5" />
          <span>Discover Tokens</span>
        </button>

        <button
          onClick={onAddToken}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Token</span>
        </button>
      </div>
    </div>
  );
};

export default NoTrustlinesPrompt;
