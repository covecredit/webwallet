import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Shield, Copy, Check } from 'lucide-react';
import Modal from '../Modal/Modal';
import { generateMnemonic, validateMnemonic } from '../../utils/mnemonic';
import { useWalletStore } from '../../store/walletStore';

interface NewWalletModalProps {
  onClose: () => void;
}

const NewWalletModal: React.FC<NewWalletModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string[]>(Array(24).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [hasAcknowledged, setHasAcknowledged] = useState(false);
  const [copiedPhrase, setCopiedPhrase] = useState(false);
  const { connect } = useWalletStore();

  useEffect(() => {
    if (!isRecovery) {
      try {
        const words = generateMnemonic();
        setMnemonic(words);
      } catch (error: any) {
        setError(error.message || 'Failed to generate wallet');
      }
    }
  }, [isRecovery]);

  const handleCopyPhrase = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic.join(' '));
      setCopiedPhrase(true);
      setTimeout(() => setCopiedPhrase(false), 2000);
    } catch (error) {
      console.error('Failed to copy phrase:', error);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const words = text.trim().split(/\s+/);
    if (words.length === 24) {
      setUserInput(words);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    const newInput = [...userInput];
    newInput[index] = value.toLowerCase().trim();
    setUserInput(newInput);
    setError(null);
  };

  const handleVerify = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      if (userInput.some(word => !word.trim())) {
        throw new Error('Please enter all 24 words');
      }

      if (!isRecovery) {
        const inputMnemonic = userInput.join(' ').toLowerCase();
        const originalMnemonic = mnemonic.join(' ').toLowerCase();

        if (inputMnemonic !== originalMnemonic) {
          throw new Error('The words you entered do not match. Please check and try again.');
        }
      }

      if (!hasAcknowledged) {
        throw new Error(isRecovery 
          ? 'Please acknowledge that you will never share this phrase'
          : 'Please acknowledge that you have written down your recovery phrase'
        );
      }

      const seed = await validateMnemonic(isRecovery ? userInput : mnemonic);
      await connect(seed);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create wallet');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal 
      title={isRecovery ? "Recover Wallet" : "Create New Wallet"} 
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {step === 1 && !isRecovery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-lg flex items-start space-x-2">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-primary">Security Notice</p>
                <p className="text-text/70">Write these 24 words on paper and store securely. Never save digitally. Cannot be recovered if lost.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-background/50 p-4 rounded-lg border border-primary/20">
              {mnemonic.map((word, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-background/30 rounded"
                >
                  <span className="text-primary/70 text-sm w-6">{index + 1}.</span>
                  <span className="font-mono">{word}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCopyPhrase}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                {copiedPhrase ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Phrase to Clipboard</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-primary/10 pt-4">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={isRecovery}
                  onChange={(e) => {
                    setIsRecovery(e.target.checked);
                    setUserInput(Array(24).fill(''));
                    setError(null);
                  }}
                  className="rounded border-primary/30 text-primary focus:ring-primary"
                />
                <span>Recover existing wallet</span>
              </label>

              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {(step === 2 || isRecovery) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {isRecovery ? (
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-500">Recovery Mode</p>
                  <p className="text-red-400">
                    Only enter your recovery phrase if you are restoring an existing wallet. 
                    Verify you are on the correct website.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-text/70">
                Enter your 24 words in order to verify:
              </div>
            )}

            <div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-background/50 p-4 rounded-lg border border-primary/20"
              onPaste={handlePaste}
            >
              {userInput.map((word, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-primary/70 text-sm w-6">{index + 1}.</span>
                  <input
                    type="text"
                    value={word}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 bg-background/30 border border-primary/20 rounded text-sm font-mono focus:outline-none focus:border-primary"
                    placeholder={`Word ${index + 1}`}
                    spellCheck="false"
                    autoComplete="off"
                    autoCapitalize="off"
                    disabled={isProcessing}
                  />
                </div>
              ))}
            </div>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={hasAcknowledged}
                onChange={(e) => setHasAcknowledged(e.target.checked)}
                className="rounded border-primary/30 text-primary focus:ring-primary"
                disabled={isProcessing}
              />
              <span>{isRecovery 
                ? "I will never give this phrase to anyone or type it into unknown websites"
                : "I have written down my recovery phrase in a secure location"
              }</span>
            </label>

            {error && (
              <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <div className="flex justify-between border-t border-primary/10 pt-4">
              {!isRecovery && (
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-primary/30 text-primary rounded-lg hover:bg-primary/10 transition-colors"
                  disabled={isProcessing}
                >
                  Back
                </button>
              )}
              <button
                onClick={handleVerify}
                className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                disabled={isProcessing || !hasAcknowledged}
              >
                {isProcessing ? 'Processing...' : (isRecovery ? 'Recover Wallet' : 'Create Wallet')}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};

export default NewWalletModal;