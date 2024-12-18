import { Wallet } from 'xrpl';
import { walletStorageService } from './storage';
import { xrplService } from '../xrpl';
import { EventEmitter } from '../../utils/EventEmitter';
import { passphraseService } from '../crypto/passphrase';

class WalletManager extends EventEmitter {
  private static instance: WalletManager;
  private wallet: Wallet | null = null;

  private constructor() {
    super();
  }

  static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }

  async createWallet(seed: string): Promise<{ wallet: Wallet; balance: number; isActivated: boolean }> {
    try {
      // Create wallet first
      console.log('Creating wallet from seed...');
      this.wallet = Wallet.fromSeed(seed);
      
      // Try to save if passphrase is set
      if (passphraseService.hasPassphrase()) {
        try {
          await walletStorageService.saveSeed(seed);
          console.log('Wallet seed encrypted and stored');
        } catch (error) {
          console.error('Failed to save wallet seed:', error);
        }
      }

      // Get account info
      const { balance, isActivated } = await this.getAccountInfo();
      
      this.emit('walletCreated', {
        address: this.wallet.address,
        balance,
        isActivated
      });

      return { wallet: this.wallet, balance, isActivated };
    } catch (error: any) {
      console.error('Failed to create wallet:', error);
      this.wallet = null;
      throw error;
    }
  }

  async loadSavedWallet(): Promise<{ wallet: Wallet; balance: number; isActivated: boolean } | null> {
    try {
      // Check if we have both encrypted data and passphrase
      if (!walletStorageService.hasStoredSeed() || !passphraseService.hasPassphrase()) {
        return null;
      }

      const seed = await walletStorageService.loadSeed();
      if (!seed) {
        console.log('No saved wallet found');
        return null;
      }

      // Create new wallet from saved seed
      console.log('Creating wallet from saved seed...');
      this.wallet = Wallet.fromSeed(seed);

      // Get account info
      const { balance, isActivated } = await this.getAccountInfo();

      return { wallet: this.wallet, balance, isActivated };
    } catch (error: any) {
      console.error('Failed to load saved wallet:', error);
      throw error;
    }
  }

  private async getAccountInfo(): Promise<{ balance: number; isActivated: boolean }> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }

    try {
      const client = xrplService.getClient();
      if (!client) {
        throw new Error('Not connected to network');
      }

      try {
        const response = await client.request({
          command: 'account_info',
          account: this.wallet.address,
          ledger_index: 'validated'
        });

        const balance = Number(response.result.account_data.Balance) / 1000000;
        const isActivated = balance >= 10;

        return { balance, isActivated };
      } catch (error: any) {
        if (error.data?.error === 'actNotFound') {
          return { balance: 0, isActivated: false };
        }
        throw error;
      }
    } catch (error) {
      console.error('Failed to get account info:', error);
      throw error;
    }
  }

  async clearWallet(): Promise<void> {
    try {
      await walletStorageService.clearSeed();
      this.wallet = null;
      this.emit('walletCleared');
    } catch (error) {
      console.error('Failed to clear wallet:', error);
      throw error;
    }
  }

  getWallet(): Wallet | null {
    return this.wallet;
  }

  hasStoredWallet(): boolean {
    return walletStorageService.hasStoredSeed();
  }
}

export const walletManager = WalletManager.getInstance();