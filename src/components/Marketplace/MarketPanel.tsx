import React, { useState, useEffect } from 'react';
import { Tent } from 'lucide-react';
import Widget from '../Widget/Widget';
import { useWalletStore } from '../../store/walletStore';
import { xrplService } from '../../services/xrpl';
import { useDEXStore } from './store/dexStore';
import { DEFAULT_TOKENS } from '../../constants/tokens';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS, LAYOUT } from '../../constants/layout';

// Component imports
import ConnectWalletPrompt from './components/ConnectWalletPrompt';
import TokenPairSelector from './components/TokenPairSelector';
import TokenInfo from './components/TokenInfo';
import OrderBook from './components/OrderBook';
import PlaceOrder from './components/PlaceOrder';
import AddTokenModal from './components/AddTokenModal';
import SearchTokensModal from './components/SearchTokensModal';
import NoTrustlinesPrompt from './components/NoTrustlinesPrompt';

const MarketPanel: React.FC = () => {
  const { isConnected, address } = useWalletStore();
  const { pairs, selectedPair, setPairs, setSelectedPair, loading, setLoading, error, setError } = useDEXStore();
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [showAddToken, setShowAddToken] = useState(false);
  const [showSearchTokens, setShowSearchTokens] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE}px)`);

  useEffect(() => {
    if (isConnected) {
      loadMarketData();
    } else {
      // Reset state when disconnected
      setPairs([]);
      setSelectedPair(null);
      setOrderBook({ bids: [], asks: [] });
    }
  }, [isConnected]);

  useEffect(() => {
    if (selectedPair) {
      loadOrderBook();
    }
  }, [selectedPair]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      const dex = xrplService.getDEX();
      const trustLineService = dex.getTrustLineService();

      // Load default tokens first
      const defaultTokensInfo = await Promise.all(
        DEFAULT_TOKENS.map(async (token) => {
          try {
            const info = await trustLineService.getTokenInfo(token.currency, token.issuer);
            return {
              baseToken: token.currency,
              quoteToken: 'XRP',
              lastPrice: 0,
              priceUSD: 0,
              change24h: 0,
              volume24h: 0,
              trustlines: info.trustlines,
              holders: info.holders,
              rank: 0,
              issuerFee: 0,
              marketCap: 0,
              circulatingSupply: 0,
              totalSupply: 0,
              imageUrl: token.imageUrl,
              issuer: token.issuer,
              name: token.name,
              description: token.description
            };
          } catch (err) {
            console.warn(`Failed to load token info for ${token.currency}:`, err);
            return null;
          }
        })
      );

      // Filter out failed token loads
      const validTokens = defaultTokensInfo.filter(Boolean);

      // If connected, add user's trustlines
      if (address) {
        const trustLines = await trustLineService.fetchTrustLines(address);
        const userTokensInfo = await Promise.all(
          trustLines.map(async (line) => {
            try {
              const info = await trustLineService.getTokenInfo(line.currency, line.issuer);
              return {
                baseToken: line.currency,
                quoteToken: 'XRP',
                lastPrice: 0,
                priceUSD: 0,
                change24h: 0,
                volume24h: 0,
                trustlines: info.trustlines,
                holders: info.holders,
                rank: 0,
                issuerFee: 0,
                marketCap: 0,
                circulatingSupply: 0,
                totalSupply: 0,
                issuer: line.issuer
              };
            } catch (err) {
              console.warn(`Failed to load trustline info:`, err);
              return null;
            }
          })
        );

        // Combine default and user tokens, removing duplicates
        const allTokens = [...validTokens, ...userTokensInfo.filter(Boolean)];
        const uniqueTokens = Array.from(
          new Map(allTokens.map(t => [`${t.baseToken}-${t.issuer}`, t])).values()
        );
        setPairs(uniqueTokens);

        // Set first token as selected if none selected
        if (!selectedPair && uniqueTokens.length > 0) {
          setSelectedPair(uniqueTokens[0]);
        }
      } else {
        setPairs(validTokens);
        if (!selectedPair && validTokens.length > 0) {
          setSelectedPair(validTokens[0]);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderBook = async () => {
    if (!selectedPair) return;

    try {
      const dex = xrplService.getDEX();
      const book = await dex.getOrderBookService().fetchOrderBook(
        selectedPair.baseToken,
        selectedPair.issuer,
        'XRP'
      );
      setOrderBook(book);
    } catch (err: any) {
      console.error('Failed to load orderbook:', err);
    }
  };

  if (!isConnected) {
    return (
      <Widget
        id="market"
        title="XRPL Market"
        icon={Tent}
        defaultPosition={{ x: 360, y: 80 }}
        defaultSize={{ 
          width: isMobile ? window.innerWidth - (LAYOUT.MOBILE_PADDING * 2) : 1200, 
          height: isMobile ? 400 : 800 
        }}
      >
        <ConnectWalletPrompt />
      </Widget>
    );
  }

  const showNoTrustlines = !loading && pairs.length === 0;

  return (
    <Widget
      id="market"
      title="XRPL Market"
      icon={Tent}
      defaultPosition={{ x: 360, y: 80 }}
      defaultSize={{ 
        width: isMobile ? window.innerWidth - (LAYOUT.MOBILE_PADDING * 2) : 1200, 
        height: isMobile ? 600 : 800 
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : showNoTrustlines ? (
        <NoTrustlinesPrompt
          onSearch={() => setShowSearchTokens(true)}
          onAddToken={() => setShowAddToken(true)}
        />
      ) : (
        <div className={`h-full flex ${isMobile ? 'flex-col' : 'flex-row'} p-4 gap-4`}>
          <div className={`${isMobile ? 'w-full' : 'w-1/4'} space-y-4`}>
            <TokenPairSelector
              pairs={pairs}
              selectedPair={selectedPair}
              onSelect={setSelectedPair}
            />
          </div>
          
          <div className={`${isMobile ? 'w-full' : 'w-3/4'} space-y-4`}>
            {selectedPair && <TokenInfo pair={selectedPair} />}
            
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <OrderBook orderBook={orderBook} />
              {selectedPair && <PlaceOrder pair={selectedPair} onSubmit={console.log} />}
            </div>
          </div>
        </div>
      )}

      {showAddToken && (
        <AddTokenModal
          onClose={() => setShowAddToken(false)}
          onSuccess={loadMarketData}
        />
      )}

      {showSearchTokens && (
        <SearchTokensModal
          onClose={() => setShowSearchTokens(false)}
          onSuccess={loadMarketData}
        />
      )}
    </Widget>
  );
};

export default MarketPanel;
