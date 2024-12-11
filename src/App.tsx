import React, { useState } from 'react';
import MainLayout from './components/Layout/MainLayout';
import WalletPanel from './components/Wallet/WalletPanel';
import GraphPanel from './components/Graph/GraphPanel';
import PricePanel from './components/Price/PricePanel';
import MarketPanel from './components/Marketplace/MarketPanel';
import UtilitiesPanel from './components/Utilities/UtilitiesPanel';
import ChatWidget from './components/Chat/ChatWidget';
import { useWidgetStore } from './store/widgetStore';
import { useTheme } from './hooks/useTheme';
import { exchangeManager } from './services/exchanges';
import { xrplService } from './services/xrpl';
import { useNetworkStore } from './store/networkStore';
import { Anchor } from 'lucide-react';

const App: React.FC = () => {
  const { widgets } = useWidgetStore();
  const { selectedNetwork } = useNetworkStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  
  // Initialize theme
  useTheme();

  React.useEffect(() => {
    const initializeServices = async () => {
      try {
        setError(null);
        
        // Connect to XRPL network first
        setLoadingStatus('Connecting to XRPL network...');
        await xrplService.connect(selectedNetwork);
        
        // Then initialize exchange data with staggered connections
        setLoadingStatus('Initializing market data feeds...');
        await exchangeManager.connect();
        
        // Wait a bit to ensure initial data is loaded
        setLoadingStatus('Loading initial data...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        console.error('Service initialization error:', error);
        setError(error.message || 'Failed to initialize services');
      } finally {
        setIsLoading(false);
      }
    };

    initializeServices();

    return () => {
      exchangeManager.disconnect();
      xrplService.disconnect();
    };
  }, [selectedNetwork]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="initial-loader">
          <div className="logo">
            <Anchor className="w-8 h-8 text-primary" />
            <div className="logo-text">
              C<span>O</span>VE
            </div>
          </div>
          <div className="spinner" />
          <div className="text-sm text-text/70 mt-4">{loadingStatus}</div>
          {error && (
            <div className="text-red-500 text-sm max-w-md mx-auto mt-2">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {widgets.find(w => w.id === 'wallet')?.isVisible && <WalletPanel />}
      {widgets.find(w => w.id === 'graph')?.isVisible && <GraphPanel />}
      {widgets.find(w => w.id === 'price')?.isVisible && <PricePanel />}
      {widgets.find(w => w.id === 'market')?.isVisible && <MarketPanel />}
      {widgets.find(w => w.id === 'utilities')?.isVisible && <UtilitiesPanel />}
      {widgets.find(w => w.id === 'chat')?.isVisible && <ChatWidget />}
    </MainLayout>
  );
};

export default App;