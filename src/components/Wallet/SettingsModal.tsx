import React, { useState, useEffect } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { themes, themeNames } from '../../constants/theme';
import { Download, Trash2, Lock, Check, Terminal } from 'lucide-react';
import Modal from '../Modal/Modal';
import { pwaManager } from '../../utils/pwa';
import { passphraseService } from '../../services/crypto/passphrase';
import PassphraseModal from '../Wallet/PassphraseModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme } = useThemeStore();
  const { isDeveloperMode, toggleDeveloperMode } = useSettingsStore();
  const [showPassphraseModal, setShowPassphraseModal] = useState(false);
  const [canInstallPWA, setCanInstallPWA] = useState(false);
  const isPWAInstalled = pwaManager.isPWA();

  useEffect(() => {
    const checkPWAStatus = () => {
      setCanInstallPWA(pwaManager.canInstall());
    };

    checkPWAStatus();
    pwaManager.on('canInstall', checkPWAStatus);
    pwaManager.on('installed', checkPWAStatus);

    return () => {
      pwaManager.removeAllListeners();
    };
  }, []);

  const handleInstallPWA = async () => {
    try {
      const outcome = await pwaManager.install();
      if (outcome === 'accepted') {
        console.log('PWA installed successfully');
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  const handleUninstallPWA = async () => {
    try {
      await pwaManager.uninstall();
      console.log('PWA uninstalled successfully');
    } catch (error) {
      console.error('PWA uninstallation failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal title="Settings" onClose={onClose}>
        <div className="space-y-6">
          {/* Security Section */}
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
          <div>
            <h3 className="text-sm font-medium text-text/70 mb-3">Application</h3>
            {canInstallPWA && (
              <button
                onClick={handleInstallPWA}
                className="w-full flex items-center space-x-2 p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5 text-primary" />
                <span>Install Application</span>
              </button>
            )}
            {isPWAInstalled && (
              <button
                onClick={handleUninstallPWA}
                className="w-full flex items-center space-x-2 p-3 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
                <span className="text-red-500">Remove Application</span>
              </button>
            )}
          </div>

          {/* Developer Mode */}
          <div>
            <h3 className="text-sm font-medium text-text/70 mb-3">Developer Options</h3>
            <button
              onClick={toggleDeveloperMode}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                isDeveloperMode 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-primary/10 hover:bg-primary/20'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5" />
                <span>Developer Mode</span>
              </div>
              <div className={`text-sm ${isDeveloperMode ? 'text-green-400' : 'text-text/50'}`}>
                {isDeveloperMode ? 'Enabled' : 'Disabled'}
              </div>
            </button>
          </div>
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