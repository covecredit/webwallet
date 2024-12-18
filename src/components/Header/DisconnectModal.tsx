import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../Modal/Modal';

interface DisconnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DisconnectModal: React.FC<DisconnectModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <Modal title="Disconnect Wallet" onClose={onClose}>
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
          <div className="space-y-2">
            <p className="text-text/70">
              Are you sure you want to disconnect your wallet? You will need to reconnect using your seed phrase to access your wallet again.
            </p>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DisconnectModal;