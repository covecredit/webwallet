import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { themes, themeNames } from '../../constants/theme';
import { Download, Trash2, Lock, Check } from 'lucide-react';
import Modal from '../Modal/Modal';
import { canInstallPWA, installPWA, uninstallPWA, isPWA } from '../../utils/pwa';
import { passphraseService } from '../../services/crypto/passphrase';
import { walletStorageService } from '../../services/wallet/storage';
import PassphraseModal from '../Wallet/PassphraseModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme } = useThemeStore();
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const canInstall = canInstallPWA();
  const isInstalled = isPWA();

  if (!isOpen) return null;

  return (
    <>
      <Modal title="Settings" onClose={onClose}>
        <div className="space-y-6">
          {/* Security Section - Always First */}
          <div>
            <h3 className="text-sm font-medium text-text/70 mb-3">Security</h3>
            {!passphraseService.hasPassphrase() && (
              <button
                onClick={() => setShowPassphraseModal(true)}
                className="w-full flex items-center justify-between p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <span>Set Wallet Passphrase</span>
                </div>
                <span className="text-red-400 text-sm">Not Set</span>
              </button>
            )}
            {passphraseService.hasPassphrase() && (
              <div className="w-full flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Lock className="w-5 h-5 text-primary" />
                  <span>Wallet Passphrase</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">Set</span>
                </div>
              </div>
            )}
          </div>

          {/* Theme Selection */}
          <div>
            <h3 className="text-sm font-medium text-text/70 mb-3">Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(themes) as Array<keyof typeof themes>).map((theme) => (
                <button
                  key={theme}
                  onClick={() => setTheme(theme)}
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

          {/* PWA Installation */}
          {(canInstall || isInstalled) && (
            <div>
              <h3 className="text-sm font-medium text-text/70 mb-3">Application</h3>
              {canInstall ? (
                <button
                  onClick={installPWA}
                  className="w-full flex items-center space-x-2 p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5 text-primary" />
                  <span>Install Application</span>
                </button>
              ) : (
                <button
                  onClick={uninstallPWA}
                  className="w-full flex items-center space-x-2 p-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <span className="text-red-500">Remove Application</span>
                </button>
              )}
            </div>
          )}
        </div>
      </Modal>

      {showPassphraseModal && (
        <PassphraseModal
          isOpen={showPassphraseModal}
          onClose={() => setShowPassphraseModal(false)}
          onSuccess={() => {
            setShowPassphraseModal(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default SettingsModal;