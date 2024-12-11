import React from 'react';
import MainLayout from './components/Layout/MainLayout';
import WalletPanel from './components/Wallet/WalletPanel';
import GraphPanel from './components/Graph/GraphPanel';
import PricePanel from './components/Price/PricePanel';
import MarketPanel from './components/Marketplace/MarketPanel';
import UtilitiesPanel from './components/Utilities/UtilitiesPanel';
import ChatWidget from './components/Chat/ChatWidget';
import { useWidgetStore } from './store/widgetStore';
import { useTheme } from './hooks/useTheme';
import { useInitialization } from './hooks/useInitialization';
import { useNetworkStore } from './store/networkStore';
import { Anchor, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const { widgets } = useWidgetStore();
  const { selectedNetwork } = useNetworkStore();
  const { isLoading, error, status, retries } = useInitialization(selectedNetwork);
  
  // Initialize theme
  useTheme();

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
          <div className="text-sm text-text/70 mt-4">{status}</div>
          {error && (
            <div className="flex items-start space-x-2 mt-4 max-w-md mx-auto bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-500">
                <div className="font-medium mb-1">Initialization Error</div>
                <div>{error}</div>
                {retries >= 3 && (
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-2 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Refresh Page
                  </button>
                )}
              </div>
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