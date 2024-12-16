import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import Modal from '../../Modal/Modal';
import { xrplService } from '../../../services/xrpl';
import { useWalletStore } from '../../../store/walletStore';
import { TokenInfo } from '../../../services/xrpl/dex/types';

interface SearchTokensModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SearchTokensModal: React.FC<SearchTokensModalProps> = ({ onClose, onSuccess }) => {
  const { address } = useWalletStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<TokenInfo[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);

  const handleSearch = async () => {
    if (!searchQuery) return;

    try {
      setLoading(true);
      setError(null);

      // If the search query looks like an address, search for tokens issued by that address
      if (searchQuery.startsWith('r') && searchQuery.length >= 25) {
        const dex = xrplService.getDEX();
        const trustLines = await dex.getTrustLineService().fetchTrustLines(searchQuery);
        const tokens = await Promise.all(
          trustLines.map(line => 
            dex.getTrustLineService().getTokenInfo(line.currency, line.issuer)
          )
        );
        setResults(tokens);
      } else {
        setError('Please enter a valid XRPL address');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search tokens');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async (token: TokenInfo) => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const dex = xrplService.getDEX();
      await dex.getTrustLineService().createTrustLine({
        account: address,
        currency: token.currency,
        issuer: token.issuer,
        limit: '1000000000'
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Search Tokens" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 bg-background/50 border border-primary/30 rounded-lg"
            placeholder="Enter issuer address"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="max-h-[400px] overflow-y-auto space-y-2">
          {results.map((token) => (
            <div
              key={`${token.currency}-${token.issuer}`}
              className="flex items-center justify-between p-4 bg-background/50 border border-primary/30 rounded-lg"
            >
              <div>
                <div className="font-medium">{token.currency}</div>
                <div className="text-sm text-text/70 truncate">{token.issuer}</div>
              </div>
              <button
                onClick={() => handleAddToken(token)}
                className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default SearchTokensModal;
