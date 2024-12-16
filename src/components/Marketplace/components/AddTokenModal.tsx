import React, { useState } from 'react';
import Modal from '../../Modal/Modal';
import { xrplService } from '../../../services/xrpl';
import { useWalletStore } from '../../../store/walletStore';
import { DEFAULT_TOKENS } from '../../../constants/tokens';

interface AddTokenModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddTokenModal: React.FC<AddTokenModalProps> = ({ onClose, onSuccess }) => {
  const { address } = useWalletStore();
  const [currency, setCurrency] = useState('');
  const [issuer, setIssuer] = useState('');
  const [limit, setLimit] = useState('1000000000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddDefaultToken = async (currency: string, issuer: string) => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const dex = xrplService.getDEX();
      await dex.getTrustLineService().createTrustLine({
        account: address,
        currency,
        issuer,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const dex = xrplService.getDEX();
      await dex.getTrustLineService().createTrustLine({
        account: address,
        currency: currency.toUpperCase(),
        issuer,
        limit
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
    <Modal title="Add Token" onClose={onClose}>
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-text/70">Popular Tokens</h3>
          <div className="grid grid-cols-2 gap-2">
            {DEFAULT_TOKENS.map((token) => (
              <button
                key={`${token.currency}-${token.issuer}`}
                onClick={() => handleAddDefaultToken(token.currency, token.issuer)}
                className="p-3 bg-background/50 border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors text-left"
              >
                <div className="font-medium">{token.name}</div>
                <div className="text-xs text-text/50 truncate">{token.currency}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-primary/30"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-2 bg-background text-sm text-text/50">Or add custom token</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-text/70">Currency Code</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg"
              placeholder="e.g. USD"
              required
              maxLength={3}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-text/70">Issuer Address</label>
            <input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg"
              placeholder="Enter issuer's XRPL address"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-text/70">Trust Line Limit</label>
            <input
              type="text"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg"
              placeholder="Enter trust line limit"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Token'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddTokenModal;