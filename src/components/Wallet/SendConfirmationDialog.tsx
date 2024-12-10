import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../Modal/Modal';

interface SendConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  address: string;
  amount: string;
  destinationTag?: string;
  fee: string;
  onFeeChange: (fee: string) => void;
}

const SendConfirmationDialog: React.FC<SendConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  address,
  amount,
  destinationTag,
  fee,
  onFeeChange,
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose(); // Close the confirmation dialog immediately
  };

  return (
    <Modal title="Confirm Transaction" onClose={onClose}>
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-200 space-y-1">
            <p>Please review the transaction details carefully.</p>
            <p>Sent funds cannot be recovered if sent to the wrong address.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text/70">Recipient Address</span>
              <span className="text-primary font-medium">{address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text/70">Amount</span>
              <span className="text-primary font-medium">{amount} XRP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text/70">Network Fee</span>
              <input
                type="number"
                value={fee}
                onChange={(e) => onFeeChange(e.target.value)}
                className="text-text bg-background border border-primary rounded-lg px-2 py-1"
              />
            </div>
            <div className="flex justify-between">
              <span className="text-text/70">Total</span>
              <span className="text-primary font-medium">
                {(Number(amount) + Number(fee)).toFixed(6)} XRP
              </span>
            </div>
            {destinationTag && (
              <div className="flex justify-between">
                <span className="text-text/70">Destination Tag</span>
                <span className="text-primary font-medium">{destinationTag}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-primary text-background rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SendConfirmationDialog;
