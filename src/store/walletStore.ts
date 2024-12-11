import { create } from 'zustand';
import { Wallet } from 'xrpl';
import { storageService } from '../services/storage';
import { useNetworkStore } from './networkStore';
import { xrplService } from '../services/xrpl';
import { balanceService } from '../services/balance';
import { STORAGE_KEYS } from '../constants/storage';

interface WalletState {
  balance: number;
  isActivated: boolean;
  address: string;
  seed: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (seed: string) => Promise<void>;
  disconnect: () => Promise<void>;
  updateBalance: (balance: number, isActivated: boolean) => void;
  clearError: () => void;
  autoConnect: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  isActivated: false,
  address: '',
  seed: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  autoConnect: async () => {
    const savedSeed = await storageService.get(STORAGE_KEYS.SEED);
    if (savedSeed) {
      try {
        await get().connect(savedSeed);
      } catch (error) {
        console.error('Auto-connect failed:', error);
        // Clear invalid saved data
        storageService.remove(STORAGE_KEYS.SEED);
      }
    }
  },

  connect: async (seed: string) => {
    try {
      set({ isConnecting: true, error: null });
      const { selectedNetwork } = useNetworkStore.getState();
      
      if (!selectedNetwork?.url?.startsWith('wss://')) {
        throw new Error('Please select a valid network before connecting');
      }

      // Connect to network
      await xrplService.connect(selectedNetwork);

      // Create wallet
      const { wallet, balance } = await xrplService.createWallet(seed);
      const isActivated = balance >= 10;

      // Update state
      set({
        seed,
        address: wallet.address,
        balance,
        isActivated,
        isConnected: true,
        error: null
      });

      // Store seed securely
      await storageService.set(STORAGE_KEYS.SEED, seed);

      // Subscribe to balance updates
      const unsubscribe = await balanceService.subscribeToBalanceUpdates(
        wallet.address,
        (newBalance, newIsActivated) => {
          set({ balance: newBalance, isActivated: newIsActivated });
        }
      );

      // Store unsubscribe function for cleanup
      (window as any).__balanceUnsubscribe = unsubscribe;

    } catch (error: any) {
      console.error('Connection error:', error);
      set({ error: error.message || 'Failed to connect wallet' });
      throw error;
    } finally {
      set({ isConnecting: false });
    }
  },

  disconnect: async () => {
    // Clean up balance subscription
    if ((window as any).__balanceUnsubscribe) {
      (window as any).__balanceUnsubscribe();
      delete (window as any).__balanceUnsubscribe;
    }

    await xrplService.disconnect();
    set({
      seed: null,
      address: '',
      balance: 0,
      isActivated: false,
      isConnected: false,
      error: null
    });
    storageService.remove(STORAGE_KEYS.SEED);
  },

  updateBalance: (balance: number, isActivated: boolean) => {
    set({ balance, isActivated });
  },

  clearError: () => {
    set({ error: null });
  }
}));