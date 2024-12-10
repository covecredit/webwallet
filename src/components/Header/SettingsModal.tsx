import React, { useState } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { useNetworkStore } from '../../store/networkStore';
import { useWalletStore } from '../../store/walletStore';
import { themes, themeNames } from '../../constants/theme';
import { AlertTriangle } from 'lucide-react';
import type { ThemeName } from '../../types/theme';
import type { NetworkType } from '../../types/network';
import Modal from '../Modal/Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme } = useThemeStore();
  const { networks, selectedNetwork, selectNetwork } = useNetworkStore();
  const { disconnect, isConnected } = useWalletStore();
  const [showMainnetWarning, setShowMainnetWarning] = useState(false);
  const [pendingNetworkId, setPendingNetworkId] = useState<string | null>(null);

  const handleNetworkChange = async (networkId: string) => {
    const network = networks.find(n => n.id === networkId);
    if (!network) return;

    if (network.type === 'mainnet' && selectedNetwork.type !== 'mainnet') {
      setShowMainnetWarning(true);
      setPendingNetworkId(networkId);
      return;
    }

    if (isConnected) {
      await disconnect();
    }
    selectNetwork(networkId);
  };

  const confirmMainnetSwitch = async () => {
    if (pendingNetworkId) {
      if (isConnected) {
        await disconnect();
      }
      selectNetwork(pendingNetworkId);
      setShowMainnetWarning(false);
      setPendingNetworkId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-text/70 mb-3">Network</h3>
          <div className="space-y-2">
            {['mainnet', 'testnet', 'devnet'].map((type) => (
              <div key={type} className="space-y-2">
                <div className="text-xs text-text/50 uppercase">{type}</div>
                {networks
                  .filter(n => n.type === type)
                  .map(network => (
                    <button
                      key={network.id}
                      onClick={() => handleNetworkChange(network.id)}
                      className={`
                        w-full p-2 rounded-lg text-left transition-colors
                        ${selectedNetwork.id === network.id 
                          ? 'bg-primary/20 text-primary' 
                          : 'hover:bg-primary/10 text-text'
                        }
                      `}
                    >
                      {network.name}
                    </button>
                  ))
                }
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-text/70 mb-3">Theme</h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(themes) as ThemeName[]).map((theme) => (
              <button
                key={theme}
                onClick={() => {
                  setTheme(theme);
                  onClose();
                }}
                className={`
                  p-3 rounded-lg border transition-colors flex items-center space-x-2
                  ${currentTheme === theme 
                    ? 'bg-primary/20 border-primary' 
                    : 'border-primary/30 hover:bg-primary/10'
                  }
                `}
              >
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: themes[theme].primary }}
                />
                <span className="text-sm">{themeNames[theme]}</span>
              </button>
            ))}
          </div>
        </div>

        {showMainnetWarning && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-background border border-primary/30 rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-start space-x-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-red-500 mb-2">Warning: Mainnet Selected</h3>
                  <p className="text-text/70">
                    You are switching to mainnet where transactions use real XRP. 
                    Make sure you understand the implications before proceeding.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowMainnetWarning(false);
                    setPendingNetworkId(null);
                  }}
                  className="px-4 py-2 text-text hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmMainnetSwitch}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  I Understand, Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SettingsModal;