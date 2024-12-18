import React, { useState } from 'react';
import { Key, Plus, Trash2, Settings } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { motion } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../constants/layout';
import ConnectWalletModal from '../Wallet/ConnectWalletModal';
import NewWalletModal from '../Wallet/NewWalletModal';
import ForgetMeModal from './ForgetMeModal';
import SettingsModal from './SettingsModal';
import { clearStorage } from '../../utils/storage';

const AccountHeader: React.FC = () => {
  const { isConnected, disconnect } = useWalletStore();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showNewWalletModal, setShowNewWalletModal] = useState(false);
  const [showForgetMeModal, setShowForgetMeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE}px)`);

  return (
    <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
      {isConnected ? (
        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => disconnect()}
          className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
          title="Disconnect"
        >
          <Key className="w-5 h-5" />
        </motion.button>
      ) : (
        <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowConnectModal(true)}
            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
            title="Connect Wallet"
          >
            <Key className="w-5 h-5" />
          </motion.button>
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setShowNewWalletModal(true)}
            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
            title="New Wallet"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      )}

      <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-2'}`}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForgetMeModal(true)}
          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
          title="Clear Data"
        >
          <Trash2 className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSettingsModal(true)}
          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>

      {showConnectModal && <ConnectWalletModal onClose={() => setShowConnectModal(false)} />}
      {showNewWalletModal && <NewWalletModal onClose={() => setShowNewWalletModal(false)} />}
      {showForgetMeModal && (
        <ForgetMeModal
          isOpen={showForgetMeModal}
          onClose={() => setShowForgetMeModal(false)}
          onConfirm={() => {
            clearStorage();
            window.location.reload();
          }}
        />
      )}
      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default AccountHeader;
