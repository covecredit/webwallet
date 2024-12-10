import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { useWalletStore } from '../../store/walletStore';
import { useNetworkStore } from '../../store/networkStore';
import { xrplService } from '../../services/xrpl';
import Widget from '../Widget/Widget';
import { LAYOUT } from '../../constants/layout';

interface ReceiveModalProps {
  onClose: () => void;
}

const ReceiveModal: React.FC<ReceiveModalProps> = ({ onClose }) => {
  const { address, balance, isActivated } = useWalletStore();
  const { selectedNetwork } = useNetworkStore();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedTag, setCopiedTag] = useState(false);
  const [destinationTag, setDestinationTag] = useState('');
  const [accountInfo, setAccountInfo] = useState<any>(null);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        const client = xrplService.getClient();
        if (!client) return;

        const response = await client.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated'
        });

        setAccountInfo(response.result.account_data);
      } catch (error: any) {
        if (error.data?.error !== 'actNotFound') {
          console.error('Failed to fetch account info:', error);
        }
      }
    };

    fetchAccountInfo();
  }, [address]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleCopyTag = async () => {
    try {
      await navigator.clipboard.writeText(destinationTag);
      setCopiedTag(true);
      setTimeout(() => setCopiedTag(false), 2000);
    } catch (error) {
      console.error('Failed to copy tag:', error);
    }
  };

  const generateDestinationTag = () => {
    const tag = Math.floor(Math.random() * 4294967295);
    setDestinationTag(tag.toString());
  };

  return (
    <Widget
      id="receive"
      title="Receive XRP"
      icon={QRCodeSVG}
      defaultPosition={{ x: Math.max(100, window.innerWidth / 2 - 300), y: Math.max(100, window.innerHeight / 2 - 350) }}
      defaultSize={{ width: 600, height: 700 }}
      onClose={onClose}
    >
      <div className="p-6 space-y-6">
        {!isActivated && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="text-red-500 font-medium">Account Not Activated</p>
              <p className="text-red-400">
                This account needs at least 10 XRP to become activated. The first 10 XRP will be reserved 
                as the account reserve and cannot be withdrawn.
              </p>
            </div>
          </div>
        )}

        {isActivated && (
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="text-green-500 font-medium">Account Activated</p>
              <p className="text-green-400">
                Base Reserve: 10 XRP<br />
                Owner Reserve: {accountInfo?.OwnerCount ? `${accountInfo.OwnerCount * 2} XRP` : '0 XRP'}<br />
                Total Reserve: {accountInfo?.OwnerCount ? `${10 + (accountInfo.OwnerCount * 2)} XRP` : '10 XRP'}
              </p>
            </div>
          </div>
        )}

        <div className="bg-primary/10 p-4 rounded-lg flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm">
            <p>Make sure you're sending XRP from another XRPL wallet or exchange.</p>
            <p>Always verify the address and destination tag (if required) before sending.</p>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={address}
              size={200}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/vite.svg",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text/70 mb-1">
              Your XRPL Address
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={address}
                readOnly
                className="flex-1 px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                         text-text font-mono focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleCopyAddress}
                className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
              >
                {copiedAddress ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <Copy className="w-6 h-6 text-primary" />
                )}
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-text/70">
                Destination Tag (Optional)
              </label>
              <button
                onClick={generateDestinationTag}
                className="text-sm text-primary hover:text-primary/80"
              >
                Generate New Tag
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={destinationTag}
                onChange={(e) => setDestinationTag(e.target.value)}
                placeholder="Enter or generate a destination tag"
                className="flex-1 px-4 py-2 bg-background/50 border border-primary/30 rounded-lg 
                         text-text font-mono focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleCopyTag}
                className="p-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
              >
                {copiedTag ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <Copy className="w-6 h-6 text-primary" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-primary">Network Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-background/50 rounded-lg border border-primary/30">
              <div className="text-sm text-text/70">Network</div>
              <div className="font-medium text-text">{selectedNetwork.name}</div>
            </div>
            <div className="p-3 bg-background/50 rounded-lg border border-primary/30">
              <div className="text-sm text-text/70">Type</div>
              <div className="font-medium text-text capitalize">{selectedNetwork.type}</div>
            </div>
          </div>
        </div>
      </div>
    </Widget>
  );
};

export default ReceiveModal;