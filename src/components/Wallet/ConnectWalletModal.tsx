import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import NetworkSelector from './NetworkSelector';
import Modal from '../Modal/Modal';

interface ConnectWalletModalProps {
  onClose: () => void;
}

const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ onClose }) => {
  const [seed, setSeed] = useState('');
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect } = useWalletStore();

  const handleConnect = async () => {
    try {
      setError('');
      setIsConnecting(true);

      if (!seed) {
        throw new Error('Please enter a valid wallet seed');
      }

      await connect(seed);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Modal title="Connect Wallet" onClose={onClose}>
      <div className="space-y-6">
        <div className="bg-primary/10 p-4 rounded-lg flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text">
            Enter your wallet seed to connect. Never share your seed phrase with anyone.
          </p>
        </div>

        <NetworkSelector />

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-text">Wallet Seed</label>
            <input
              type="text"
              value={seed}
              onChange={(e) => {
                setError('');
                setSeed(e.target.value);
              }}
              placeholder="Enter your wallet seed"
              className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                       text-text placeholder-text/50 focus:outline-none focus:border-primary"
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-primary/30 text-primary rounded-lg font-medium
                       hover:bg-primary/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={!seed || isConnecting}
              className="flex-1 px-4 py-3 bg-primary text-background rounded-lg font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConnectWalletModal;