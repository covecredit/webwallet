import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../Modal/Modal';

interface OverwriteWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const OverwriteWarningModal: React.FC<OverwriteWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <Modal title="Warning: Existing Wallet" onClose={onClose}>
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-200 space-y-2">
            <p className="font-medium">You already have a wallet configured.</p>
            <p>Creating or importing a new wallet will replace your existing wallet. Make sure you have backed up your current wallet's recovery phrase before proceeding.</p>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Replace Existing Wallet
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OverwriteWarningModal;