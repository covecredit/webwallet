import React, { useEffect, useState } from 'react';
import MainLayout from './Layout/MainLayout';
import { useWalletStore } from '../store/walletStore';
import { useTheme } from '../hooks/useTheme';
import { passphraseService } from '../services/crypto/passphrase';
import { walletStorageService } from '../services/wallet/storage';
import PassphraseModal from './Wallet/PassphraseModal';

const App: React.FC = () => {
  const { autoConnect } = useWalletStore();
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme
  useTheme();

  useEffect(() => {
    const init = async () => {
      try {
        // Check if we have an encrypted wallet that needs unlocking
        if (walletStorageService.hasStoredSeed() && !passphraseService.hasPassphrase()) {
          setShowPassphrase(true);
        } else {
          await autoConnect();
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [autoConnect]);

  const handlePassphraseSuccess = async () => {
    setShowPassphrase(false);
    await autoConnect();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <MainLayout />
      {showPassphrase && (
        <PassphraseModal
          isOpen={showPassphrase}
          onClose={() => setShowPassphrase(false)}
          onSuccess={handlePassphraseSuccess}
        />
      )}
    </>
  );
};

export default App;