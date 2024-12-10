import React, { useState } from 'react';
import { Wallet, Send, QrCode, History, Key } from 'lucide-react';
import WalletButton from '../WalletButton';
import { useWalletStore } from '../../store/walletStore';
import { motion, AnimatePresence } from 'framer-motion';

const WalletSection: React.FC = () => {
  const { balance, isConnected, setConnected } = useWalletStore();
  const [showQR, setShowQR] = useState(false);

  const handleConnect = () => {
    setConnected(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background/50 backdrop-blur-md p-6 rounded-lg border border-primary/20"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Wallet className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-primary">XRPL Wallet</h2>
        </div>
        {!isConnected && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConnect}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-background rounded-lg font-medium"
          >
            <Key className="w-4 h-4" />
            <span>Connect</span>
          </motion.button>
        )}
      </div>
      
      <AnimatePresence>
        {isConnected ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div>
              <div className="text-sm text-gray-400 mb-1">Balance</div>
              <div className="text-2xl font-bold text-primary">{balance.toFixed(2)} XRP</div>
            </div>

            <div className="space-y-3">
              <WalletButton icon={Send} label="Send XRP" onClick={() => {}} />
              <WalletButton icon={QrCode} label="Receive" onClick={() => setShowQR(true)} />
              <WalletButton icon={History} label="History" onClick={() => {}} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-400 py-8"
          >
            Connect your wallet to get started
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default WalletSection;