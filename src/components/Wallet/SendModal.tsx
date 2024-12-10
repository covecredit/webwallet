import React, { useState } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Widget from '../Widget/Widget';
import { useWalletStore } from '../../store/walletStore';
import { xrplService } from '../../services/xrpl';
import SendConfirmationDialog from './SendConfirmationDialog';

interface SendModalProps {
  onClose: () => void;
}

const SendModal: React.FC<SendModalProps> = ({ onClose }) => {
  const { balance } = useWalletStore();
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
    const amountNumber = Number(amount);
    if (!amount || isNaN(amountNumber) || amountNumber <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (amountNumber > balance) {
      setError('Insufficient balance');
      return false;
    }
    return true;
  };

  const handleSend = async () => {
    try {
      if (!validateInput()) return;

      setError(null);
      setShowConfirmation(true);
    } catch (error: any) {
      console.error('Validation error:', error);
      setError(error.message || 'Failed to validate transaction');
    }
  };

  const handleConfirm = async () => {
    setIsSending(true);
    try {
      await xrplService.sendXRP(address, Number(amount), Number(destinationTag), fee);
      setShowConfirmation(false);
      onClose();
    } catch (error: any) {
      console.error('Transaction error:', error);
      setError(error.message || 'Failed to send XRP');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Widget>
      <div>
        <h2>Send XRP</h2>
        {error && <div className="error">{error}</div>}
        <div>
          <label>
            Address:
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Destination Tag:
            <input
              type="text"
              value={destinationTag}
              onChange={(e) => setDestinationTag(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Amount:
            <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Fee:
            <input type="text" value={fee} onChange={(e) => setFee(e.target.value)} />
          </label>
        </div>
        <div>
          <button onClick={handleSend} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send'}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
      <SendConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirm}
        address={address}
        amount={amount}
        destinationTag={destinationTag}
        fee={fee}
        onFeeChange={setFee}
      />
    </Widget>
  );
};

export default SendModal;
