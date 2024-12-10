import React, { useState, useEffect } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import Widget from '../Widget/Widget';
import { useWalletStore } from '../../store/walletStore';
import { xrplService } from '../../services/xrpl';
import SendConfirmationDialog from './SendConfirmationDialog';

interface SendModalProps {
  onClose: () => void;
}

const SendModal: React.FC<SendModalProps> = ({ onClose }) => {
  const { balance, isConnected } = useWalletStore();
  const [address, setAddress] = useState('');
  const [destinationTag, setDestinationTag] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0.000012');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const validateInput = () => {
    if (!address) {
      setError('Please enter a destination address');
      return false;
    }

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }

    const totalAmount = amountNumber + parseFloat(fee);
    if (totalAmount > balance) {
      setError(
        `Insufficient balance. Total required: ${totalAmount.toFixed(6)} XRP (including fee)`
      );
      return false;
    }

    const feeNumber = parseFloat(fee);
    if (isNaN(feeNumber) || feeNumber < 0.000012) {
      setError('Network fee must be at least 0.000012 XRP');
      return false;
    }

    if (destinationTag) {
      const tagNumber = parseInt(destinationTag, 10);
      if (isNaN(tagNumber) || tagNumber < 0 || !Number.isInteger(tagNumber)) {
        setError('Destination tag must be a positive integer');
        return false;
      }
    }

    return true;
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      setError(null);

      const amountNumber = parseFloat(amount);
      const destinationTagNumber = destinationTag ? parseInt(destinationTag, 10) : undefined;

      if (isNaN(amountNumber) || amountNumber <= 0) {
        setError('Invalid amount. Please enter a valid number.');
        setIsSending(false);
        return;
      }

      const feeNumber = parseFloat(fee);
      if (isNaN(feeNumber) || feeNumber < 0.000012) {
        setError('Invalid fee. Please enter a valid number.');
        setIsSending(false);
        return;
      }

      const hash = await xrplService.sendXRP({
        amount: amountNumber.toFixed(6), // Ensure the amount is formatted correctly
        destination: address,
        destinationTag: destinationTagNumber,
        fee: feeNumber.toFixed(6), // Ensure the fee is formatted correctly
      });

      console.log('Transaction successful:', hash);
      setShowConfirmation(false);
      onClose();
    } catch (error: any) {
      console.error('Transaction error:', error);
      setError(error.message || 'Failed to send XRP');
      setShowConfirmation(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirm = async () => {
    if (!isConnected) {
      setError('Wallet not connected');
      return;
    }

    if (!validateInput()) return;

    setShowConfirmation(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid decimal number
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid decimal number
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFee(value);
    }
  };

  return (
    <Widget
      id="send"
      title="Send XRP"
      icon={Send}
      defaultPosition={{
        x: Math.max(100, window.innerWidth / 2 - 250),
        y: Math.max(100, window.innerHeight / 2 - 350),
      }}
      defaultSize={{ width: 500, height: 600 }}
      onClose={onClose}
    >
      <div className="p-6 space-y-6">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-text/70">Destination Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                     text-text placeholder-text/50 focus:outline-none focus:border-primary"
            placeholder="Enter destination address"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text/70">
            Destination Tag (optional)
          </label>
          <input
            type="text"
            value={destinationTag}
            onChange={(e) => setDestinationTag(e.target.value)}
            className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                     text-text placeholder-text/50 focus:outline-none focus:border-primary"
            placeholder="Enter destination tag"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text/70">Amount (XRP)</label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                     text-text placeholder-text/50 focus:outline-none focus:border-primary"
            placeholder="Enter amount"
          />
          <div className="text-xs text-text/50">Available balance: {balance.toFixed(6)} XRP</div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-text/70">Network Fee (XRP)</label>
          <input
            type="text"
            value={fee}
            onChange={handleFeeChange}
            className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                     text-text placeholder-text/50 focus:outline-none focus:border-primary"
          />
          <div className="text-xs text-text/50">Minimum fee: 0.000012 XRP</div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSend}
            disabled={isSending}
            className="w-full px-4 py-3 bg-primary text-background rounded-lg font-medium
                     hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send XRP'}
          </button>
        </div>
      </div>

      <SendConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        address={address}
        amount={amount}
        fee={fee}
      />
    </Widget>
  );
};

export default SendModal;
