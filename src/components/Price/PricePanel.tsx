import React, { useState, useEffect } from 'react';
import { LineChart } from 'lucide-react';
import Widget from '../../Widget/Widget';
import { exchangeManager } from '../../../services/exchanges';
import { coincapService } from '../../../services/coincap';
import { CandlestickChart, PriceStats, MarketInfo, ExchangeSelector } from '.';
import { LAYOUT } from '../../../constants/layout';
import type { PriceData } from '../../../types';
import type { ExchangeName } from '../../../services/exchanges';

const PricePanel: React.FC = () => {
  const [selectedExchange, setSelectedExchange] = useState<ExchangeName | 'All'>('Bitfinex');
  const [exchangeData, setExchangeData] = useState<Record<string, PriceData[]>>({});
  const [marketData, setMarketData] = useState<any>(null);

  useEffect(() => {
    exchangeManager.connect();
    coincapService.connect();

    const handleExchangeUpdate = ({ exchange, data }: { exchange: string; data: PriceData }) => {
      if (!data?.lastPrice) return;
      
      setExchangeData(prev => ({
        ...prev,
        [exchange]: [...(prev[exchange] || []).slice(-100), data].sort((a, b) => a.timestamp - b.timestamp)
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
        prices.forEach(price => {
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

    return (exchangeData[selectedExchange] || []).filter(data => data?.lastPrice);
  };

  return (
    <Widget
      id="price"
      title="XRP/USD Market"
      icon={LineChart}
      defaultPosition={{ x: 440, y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN }}
      defaultSize={{ width: 1000, height: 600 }}
    >
      <div className="p-4 space-y-4">
        <MarketInfo data={marketData} />

        <div className="space-y-4">
          <ExchangeSelector
            selectedExchange={selectedExchange}
            onExchangeChange={setSelectedExchange}
          />

          <PriceStats 
            exchangeData={exchangeData} 
            selectedExchange={selectedExchange}
          />

          <div className="h-[300px] bg-background/50 rounded-lg border border-primary/30">
            <CandlestickChart
              data={getChartData()}
              exchange={selectedExchange}
            />
          </div>
        </div>
      </div>
    </Widget>
  );
};

export default PricePanel;