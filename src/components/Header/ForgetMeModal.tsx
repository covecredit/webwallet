import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../Modal/Modal';
import { useThemeStore } from '../../store/themeStore';
import { themes } from '../../constants/theme';
import type { ThemeName } from '../../types/theme';

interface ForgetMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ForgetMeModal: React.FC<ForgetMeModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { setTheme } = useThemeStore();

  const handleConfirm = () => {
    // Select random theme before clearing storage
    const themeNames = Object.keys(themes) as ThemeName[];
    const randomTheme = themeNames[Math.floor(Math.random() * themeNames.length)];
    setTheme(randomTheme);
    
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <Modal title="Forget Me Feature" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
          <p className="text-text/70">
            This will erase your COVE stored data. Are you sure you want us to forget you?
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Yes, forget me
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ForgetMeModal;