import { create } from 'zustand';
import { Wallet } from 'xrpl';
import { useNetworkStore } from './networkStore';
import { xrplService } from '../services/xrpl';
import { walletManager } from '../services/wallet/manager';
import { balanceService } from '../services/balance';

interface WalletState {
  balance: number;
  isActivated: boolean;
  address: string;
  wallet: Wallet | null;
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
  wallet: null,
  isConnected: false,
  isConnecting: false,
  error: null,

  autoConnect: async () => {
    try {
      const { selectedNetwork } = useNetworkStore.getState();
      
      // Connect to network first
      await xrplService.connect(selectedNetwork);

      // Try to load saved wallet
      const result = await walletManager.loadSavedWallet();
      if (result) {
        const { wallet, balance, isActivated } = result;
        
        set({
          wallet,
          address: wallet.address,
          balance,
          isActivated,
          isConnected: true,
          error: null
        });

        // Subscribe to balance updates
        const unsubscribe = await balanceService.subscribeToBalanceUpdates(
          wallet.address,
          (newBalance, newIsActivated) => {
            set({ balance: newBalance, isActivated: newIsActivated });
          }
        );

        // Store unsubscribe function for cleanup
        (window as any).__balanceUnsubscribe = unsubscribe;
      }
    } catch (error: any) {
      console.error('Auto-connect failed:', error);
      set({ error: error.message || 'Failed to auto-connect wallet' });
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
      const { wallet, balance, isActivated } = await walletManager.createWallet(seed);

      // Update state
      set({
        wallet,
        address: wallet.address,
        balance,
        isActivated,
        isConnected: true,
        error: null
      });

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

    // Clear wallet and disconnect
    await walletManager.clearWallet();
    
    set({
      wallet: null,
      address: '',
      balance: 0,
      isActivated: false,
      isConnected: false,
      error: null
    });
  },

  updateBalance: (balance: number, isActivated: boolean) => {
    set({ balance, isActivated });
  },

  clearError: () => {
    set({ error: null });
  }
}));