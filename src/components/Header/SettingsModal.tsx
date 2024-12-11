import React from 'react';
import { useThemeStore } from '../../store/themeStore';
import { themes, themeNames } from '../../constants/theme';
import type { ThemeName } from '../../types/theme';
import Modal from '../Modal/Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme } = useThemeStore();

  if (!isOpen) return null;

  return (
    <Modal title="Settings" onClose={onClose}>
      <div className="space-y-6">
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
      </div>
    </Modal>
  );
};

export default SettingsModal;