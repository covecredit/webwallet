import React, { useState, useEffect } from 'react';
import { LineChart } from 'lucide-react';
import Widget from '../Widget/Widget';
import { exchangeManager } from '../../services/exchanges';
import { coincapService } from '../../services/coincap';
import { CandlestickChart, PriceStats, MarketInfo, ExchangeSelector } from './components';
import { LAYOUT } from '../../constants/layout';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../constants/layout';
import type { PriceData } from '../../types';
import type { ExchangeName } from '../../services/exchanges';

const PricePanel: React.FC = () => {
  const [selectedExchange, setSelectedExchange] = useState<ExchangeName | 'All'>('Bitfinex');
  const [exchangeData, setExchangeData] = useState<Record<string, PriceData[]>>({});
  const [marketData, setMarketData] = useState<any>(null);
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE}px)`);

  useEffect(() => {
    exchangeManager.connect();
    coincapService.connect();

    const handleExchangeUpdate = ({ exchange, data }: { exchange: string; data: PriceData }) => {
      if (!data?.lastPrice) return;
      setExchangeData((prev) => ({
        ...prev,
        [exchange]: [...(prev[exchange] || []).slice(-100), data].sort(
          (a, b) => a.timestamp - b.timestamp
        ),
      }));
    };

    const handleMarketUpdate = (data: any) => {
      if (!data) return;
      setMarketData(data);
    };

    exchangeManager.on('price', handleExchangeUpdate);
    coincapService.on('update', handleMarketUpdate);

    return () => {
      exchangeManager.off('price', handleExchangeUpdate);
      coincapService.off('update', handleMarketUpdate);
      exchangeManager.disconnect();
      coincapService.disconnect();
    };
  }, []);

  const getChartData = (): PriceData[] => {
    if (selectedExchange === 'All') {
      const combinedData = new Map<number, PriceData>();
      Object.entries(exchangeData).forEach(([exchange, prices]) => {
        prices.forEach((price) => {
          if (!price?.lastPrice) return;
          const timestamp = Math.floor(price.timestamp / 1000) * 1000;
          const existing = combinedData.get(timestamp);
          if (!existing) {
            combinedData.set(timestamp, { ...price });
          } else {
            const count = existing.count || 1;
            existing.lastPrice = ((existing.lastPrice || 0) * count + (price.lastPrice || 0)) / (count + 1);
            existing.high = Math.max(existing.high || 0, price.high || 0);
            existing.low = Math.min(existing.low || 0, price.low || 0);
            existing.volume = (existing.volume || 0) + (price.volume || 0);
            existing.count = count + 1;
          }
        });
      });
      return Array.from(combinedData.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ count, ...data }) => data);
    }
    return (exchangeData[selectedExchange] || []).filter((data) => data?.lastPrice);
  };

  return (
    <Widget
      id="price"
      title="XRP/USD Market"
      icon={LineChart}
      defaultPosition={{ x: 440, y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN }}
      defaultSize={{ width: isMobile ? window.innerWidth - (LAYOUT.WIDGET_MARGIN * 2) : 1000, height: 600 }}
    >
      <div className={`p-4 space-y-4 ${isMobile ? 'overflow-x-hidden' : ''}`}>
        <div className={`${isMobile ? 'overflow-x-auto pb-2' : ''}`}>
          <MarketInfo data={marketData} />
        </div>

        <div className="space-y-4">
          <div className={`${isMobile ? 'overflow-x-auto pb-2 -mx-4 px-4' : ''}`}>
            <ExchangeSelector
              selectedExchange={selectedExchange}
              onExchangeChange={setSelectedExchange}
            />
          </div>

          <div className={`${isMobile ? 'overflow-x-auto pb-2 -mx-4 px-4' : ''}`}>
            <PriceStats exchangeData={exchangeData} selectedExchange={selectedExchange} />
          </div>

          <div className={`${isMobile ? 'h-[250px]' : 'h-[300px]'} bg-background/50 rounded-lg border border-primary/30`}>
            <CandlestickChart data={getChartData()} exchange={selectedExchange} />
          </div>
        </div>
      </div>
    </Widget>
  );
};

export default PricePanel;