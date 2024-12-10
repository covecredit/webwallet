import React, { useState } from 'react';
import { Anchor, Send, QrCode, History, Image, Copy } from 'lucide-react';
import Widget from '../Widget/Widget';
import WalletButton from '../WalletButton';
import { useWalletStore } from '../../store/walletStore';
import { useNetworkStore } from '../../store/networkStore';
import ReceiveModal from './ReceiveModal';
import SendModal from './SendModal';
import TransactionHistory from './TransactionHistory';
import NFTViewer from '../NFT/NFTViewer';
import { useWidgetStore } from '../../store/widgetStore';
import { faucetService } from '../../services/faucet';
import { LAYOUT } from '../../constants/layout';

const WalletPanel: React.FC = () => {
  const { balance, address, isConnected } = useWalletStore();
  const { selectedNetwork } = useNetworkStore();
  const { widgets, updateWidget } = useWidgetStore();
  const [isFunding, setIsFunding] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  
  const showReceiveModal = widgets.find(w => w.id === 'receive')?.isVisible;
  const showSendModal = widgets.find(w => w.id === 'send')?.isVisible;
  const showHistory = widgets.find(w => w.id === 'history')?.isVisible;
  const showNFTViewer = widgets.find(w => w.id === 'nft')?.isVisible;
  const canUseFaucet = selectedNetwork.type === 'testnet' || selectedNetwork.type === 'devnet';

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const handleFaucetFund = async () => {
    if (!address || !canUseFaucet || isFunding) return;
    
    try {
      setIsFunding(true);
      await faucetService.fundWallet(address, selectedNetwork);
    } catch (error) {
      console.error('Failed to fund wallet:', error);
    } finally {
      setIsFunding(false);
    }
  };

  const handleShowReceive = () => {
    if (!isConnected) return;
    updateWidget({
      id: 'receive',
      isVisible: true,
      x: Math.max(100, window.innerWidth / 2 - 250),
      y: Math.max(100, window.innerHeight / 2 - 350),
      width: 500,
      height: 700,
      zIndex: Math.max(...widgets.map(w => w.zIndex)) + 1
    });
  };

  const handleShowSend = () => {
    if (!isConnected) return;
    updateWidget({
      id: 'send',
      isVisible: true,
      x: Math.max(100, window.innerWidth / 2 - 250),
      y: Math.max(100, window.innerHeight / 2 - 350),
      width: 500,
      height: 700,
      zIndex: Math.max(...widgets.map(w => w.zIndex)) + 1
    });
  };

  const handleShowHistory = () => {
    if (!isConnected) return;
    updateWidget({
      id: 'history',
      isVisible: true,
      x: Math.max(100, window.innerWidth / 2 - 400),
      y: Math.max(100, window.innerHeight / 2 - 350),
      width: 800,
      height: 700,
      zIndex: Math.max(...widgets.map(w => w.zIndex)) + 1
    });
  };

  const handleShowNFTViewer = () => {
    if (!isConnected) return;
    updateWidget({
      id: 'nft',
      isVisible: true,
      x: Math.max(100, window.innerWidth / 2 - 400),
      y: Math.max(100, window.innerHeight / 2 - 350),
      width: 800,
      height: 700,
      zIndex: Math.max(...widgets.map(w => w.zIndex)) + 1
    });
  };

  const handleCloseWidget = (id: string) => {
    updateWidget({ id, isVisible: false });
  };

  return (
    <>
      <Widget
        id="wallet"
        title={<span>CØVE Wallet</span>}
        icon={Anchor}
        defaultPosition={{ x: LAYOUT.WIDGET_MARGIN, y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN }}
        defaultSize={{ width: 400, height: 400 }}
      >
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="text-sm text-text/70">Balance</div>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-primary">{balance.toFixed(6)} XRP</div>
              {canUseFaucet && (
                <button
                  onClick={handleFaucetFund}
                  disabled={isFunding}
                  className={`
                    flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors
                    ${isFunding 
                      ? 'bg-primary/10 text-primary/50 cursor-not-allowed'
                      : 'bg-primary/20 hover:bg-primary/30 text-primary cursor-pointer'
                    }
                  `}
                >
                  <span>{isFunding ? 'Funding...' : 'Faucet'}</span>
                </button>
              )}
            </div>
            {address && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-text/50 font-mono break-all">
                  {address}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-primary/20 rounded transition-colors"
                  title="Copy Address"
                >
                  <Copy className="w-4 h-4 text-primary" />
                </button>
                {copiedAddress && (
                  <span className="text-green-400 text-sm">Copied!</span>
                )}
              </div>
            )}
          </div>

          {isConnected ? (
            <div className="space-y-3">
              <WalletButton icon={Send} label="Send XRP" onClick={handleShowSend} />
              <WalletButton icon={QrCode} label="Receive XRP" onClick={handleShowReceive} />
              <WalletButton icon={History} label="Transaction History" onClick={handleShowHistory} />
              <WalletButton icon={Image} label="NFT Viewer" onClick={handleShowNFTViewer} />
            </div>
          ) : (
            <div className="text-center text-text/50 py-8">
              Connect your wallet to get started
            </div>
          )}
        </div>
      </Widget>

      {isConnected && showReceiveModal && (
        <ReceiveModal onClose={() => handleCloseWidget('receive')} />
      )}

      {isConnected && showSendModal && (
        <SendModal onClose={() => handleCloseWidget('send')} />
      )}

      {isConnected && showHistory && (
        <TransactionHistory onClose={() => handleCloseWidget('history')} />
      )}

      {isConnected && showNFTViewer && (
        <NFTViewer onClose={() => handleCloseWidget('nft')} />
      )}
    </>
  );
};

export default WalletPanel;