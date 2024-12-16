import { create } from 'zustand';
import { TokenPair } from '../types';

interface DEXState {
  pairs: TokenPair[];
  selectedPair: TokenPair | null;
  loading: boolean;
  error: string | null;
  setPairs: (pairs: TokenPair[]) => void;
  setSelectedPair: (pair: TokenPair) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  pairs: [],
  selectedPair: null,
  loading: false,
  error: null,
};

export const useDEXStore = create<DEXState>((set) => ({
  ...initialState,
  setPairs: (pairs) => set({ pairs }),
  setSelectedPair: (pair) => set({ selectedPair: pair }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
