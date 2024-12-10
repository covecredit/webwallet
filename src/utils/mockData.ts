import { GraphNode, PriceData } from '../types';

const generatePriceData = (hours: number): PriceData[] => {
  const data: PriceData[] = [];
  const now = Date.now();
  const points = 200;
  const minPrice = 0.4;
  const maxPrice = 5.1;
  const priceRange = maxPrice - minPrice;
  
  for (let i = 0; i < points; i++) {
    const timestamp = now - (hours * 3600000 * (1 - i/points));
    const progress = i / points;
    
    // Create more realistic price movements
    const trend = Math.sin(progress * Math.PI * 2) * 0.3; // Overall trend
    const volatility = Math.sin(progress * Math.PI * 8) * 0.1; // Short-term volatility
    const noise = (Math.random() - 0.5) * 0.05; // Random noise
    
    const basePrice = minPrice + (priceRange * progress);
    const price = basePrice * (1 + trend + volatility + noise);
    
    data.push({
      timestamp,
      price: Math.max(minPrice, Math.min(maxPrice, price))
    });
  }
  
  return data.sort((a, b) => a.timestamp - b.timestamp);
};

export const mockPriceData: Record<string, PriceData[]> = {
  '1H': generatePriceData(1),
  '3H': generatePriceData(3),
  '1D': generatePriceData(24),
  '1W': generatePriceData(168),
  '1M': generatePriceData(720),
  '3M': generatePriceData(2160),
  '6M': generatePriceData(4320),
  '1Y': generatePriceData(8760),
  '5Y': generatePriceData(43800),
  'ALL': generatePriceData(87600)
};

export const mockGraphData = {
  nodes: [
    { id: 'wallet1', label: 'r9KaDwiFkWRDZAC3sKZfhsNuz4apjFvq3D', type: 'wallet', value: 1000 },
    { id: 'wallet2', label: 'rBTwLga3i2gz3doX6Gva3MgEV8ZCD8jjah', type: 'wallet', value: 500 },
    { id: 'wallet3', label: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh', type: 'wallet', value: 750 },
    { id: 'tx1', label: 'TX: 2,740,800M BLUE', type: 'transaction', value: 100 },
    { id: 'tx2', label: 'TX: 314,999,999 Miami', type: 'transaction', value: 50 },
    { id: 'tx3', label: 'TX: 95.44 XRP', type: 'transaction', value: 75 },
    { id: 'ledger1', label: 'Ledger #92,599,487', type: 'ledger', value: 0 },
    { id: 'ledger2', label: 'Previous Ledger', type: 'ledger', value: 0 }
  ],
  links: [
    { source: 'wallet1', target: 'tx1', value: 1 },
    { source: 'tx1', target: 'ledger1', value: 1 },
    { source: 'ledger1', target: 'tx2', value: 1 },
    { source: 'tx2', target: 'wallet2', value: 1 },
    { source: 'wallet2', target: 'tx3', value: 1 },
    { source: 'tx3', target: 'ledger2', value: 1 },
    { source: 'ledger2', target: 'wallet3', value: 1 }
  ]
};