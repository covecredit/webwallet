import React, { useState } from 'react';
import { Key, Lock, Trash2, Settings } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import ConnectWalletModal from '../Wallet/ConnectWalletModal';
import ForgetMeModal from './ForgetMeModal';
import SettingsModal from './SettingsModal';
import { clearStorage } from '../../utils/storage';

const AccountHeader: React.FC = () => {
  const { isConnected, disconnect } = useWalletStore();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showForgetMeModal, setShowForgetMeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleConnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConnectModal(true);
  };

  const handleDisconnect = (e: React.MouseEvent) => {
    e.stopPropagation();
    disconnect();
  };

  const handleForgetMe = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowForgetMeModal(true);
  };

  const handleConfirmForgetMe = () => {
    clearStorage();
    window.location.reload();
  };

  return (
    <>
      <div 
        className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {isConnected ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-primary bg-background flex items-center justify-center"
            >
              <span className="text-xl md:text-2xl">🎉</span>
            </motion.div>
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleDisconnect}
              className="flex items-center space-x-2 hover:text-primary text-primary/70 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors duration-200 text-sm md:text-base"
            >
              <Lock className="w-4 h-4 md:w-5 md:h-5" />
              <span>Disconnect</span>
            </motion.button>
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-gray-400 bg-background flex items-center justify-center"
            >
              <span className="text-xl md:text-2xl text-gray-400">?</span>
            </motion.div>
            <motion.button 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleConnect}
              className="flex items-center space-x-2 hover:text-primary text-primary/70 px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors duration-200 text-sm md:text-base"
            >
              <Key className="w-4 h-4 md:w-5 md:h-5" />
              <span>Connect</span>
            </motion.button>
          </>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleForgetMe}
          className="p-2 rounded-lg hover:text-primary text-primary/70 transition-colors duration-200"
        >
          <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettingsModal(true)}
          className="p-2 rounded-lg hover:text-primary text-primary/70 transition-colors duration-200"
        >
          <Settings className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
      </div>

      <AnimatePresence>
        {showConnectModal && <ConnectWalletModal onClose={() => setShowConnectModal(false)} />}
        {showForgetMeModal && (
          <ForgetMeModal
            isOpen={showForgetMeModal}
            onClose={() => setShowForgetMeModal(false)}
            onConfirm={handleConfirmForgetMe}
          />
        )}
        {showSettingsModal && (
          <SettingsModal
            isOpen={showSettingsModal}
            onClose={() => setShowSettingsModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default AccountHeader;