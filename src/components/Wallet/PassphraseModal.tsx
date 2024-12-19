import React, { useState } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import Modal from '../Modal/Modal';
import { passphraseService } from '../../services/crypto/passphrase';
import { walletStorageService } from '../../services/wallet/storage';
import { useWalletStore } from '../../store/walletStore';

interface PassphraseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PassphraseModal: React.FC<PassphraseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasEncryptedWallet = walletStorageService.hasStoredSeed();
  const { connect } = useWalletStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      // For new passphrase, validate confirmation
      if (!hasEncryptedWallet) {
        if (passphrase.length < 8) {
          throw new Error('Passphrase must be at least 8 characters');
        }
        if (passphrase !== confirmPassphrase) {
          throw new Error('Passphrases do not match');
        }
      }

      // Set the passphrase
      await passphraseService.setPassphrase(passphrase);

      // If we have a stored seed, try to decrypt and connect
      if (hasEncryptedWallet) {
        const seed = await walletStorageService.loadSeed();
        if (seed) {
          await connect(seed);
        }
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Failed to process passphrase');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title={hasEncryptedWallet ? "Unlock Wallet" : "Set Wallet Passphrase"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex items-start space-x-3">
          <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-medium text-primary">Security Notice</p>
            <p className="text-text/70">
              {hasEncryptedWallet
                ? "Enter your passphrase to unlock your encrypted wallet."
                : "Set a passphrase to encrypt your wallet data. You'll need this passphrase to access your wallet in the future."}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm text-text/70">
              {hasEncryptedWallet ? "Enter Passphrase" : "Set Passphrase"}
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                       text-text placeholder-text/50 focus:outline-none focus:border-primary"
              placeholder="Enter passphrase"
              autoFocus
              minLength={8}
            />
          </div>

          {!hasEncryptedWallet && (
            <div className="space-y-2">
              <label className="block text-sm text-text/70">
                Confirm Passphrase
              </label>
              <input
                type="password"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                         text-text placeholder-text/50 focus:outline-none focus:border-primary"
                placeholder="Confirm passphrase"
                minLength={8}
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-primary/30 text-primary rounded-lg 
                     hover:bg-primary/10 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing || !passphrase || (!hasEncryptedWallet && !confirmPassphrase)}
            className="flex-1 px-4 py-2 bg-primary text-background rounded-lg 
                     hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : (hasEncryptedWallet ? 'Unlock' : 'Set Passphrase')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PassphraseModal;