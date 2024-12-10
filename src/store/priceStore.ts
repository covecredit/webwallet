import { create } from 'zustand';

interface PriceData {
  timestamp: number;
  price: number;
}

interface PriceState {
  priceHistory: PriceData[];
  currentPrice: number;
  setPriceHistory: (history: PriceData[]) => void;
  setCurrentPrice: (price: number) => void;
}

export const usePriceStore = create<PriceState>((set) => ({
  priceHistory: [
    { timestamp: Date.now() - 24 * 60 * 60 * 1000, price: 0.50 },
    { timestamp: Date.now() - 12 * 60 * 60 * 1000, price: 0.55 },
    { timestamp: Date.now(), price: 0.60 },
  ],
  currentPrice: 0.60,
  setPriceHistory: (history) => set({ priceHistory: history }),
  setCurrentPrice: (price) => set({ currentPrice: price }),
}));