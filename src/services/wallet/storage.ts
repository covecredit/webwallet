import { cryptoService } from '../crypto';
import { storageService } from '../storage';
import { STORAGE_KEYS } from '../../constants/storage';

export class WalletStorageService {
  private static instance: WalletStorageService;

  private constructor() {}

  static getInstance(): WalletStorageService {
    if (!WalletStorageService.instance) {
      WalletStorageService.instance = new WalletStorageService();
    }
    return WalletStorageService.instance;
  }

  async saveSeed(seed: string): Promise<void> {
    try {
      console.log('Encrypting and saving wallet seed...');
      const encryptedSeed = await cryptoService.encrypt(seed);
      await storageService.set(STORAGE_KEYS.SEED, encryptedSeed);
      console.log('Wallet seed saved successfully');
    } catch (error) {
      console.error('Failed to save wallet seed:', error);
      throw new Error('Failed to securely store wallet credentials');
    }
  }

  async loadSeed(): Promise<string | null> {
    try {
      const encryptedSeed = await storageService.get(STORAGE_KEYS.SEED);
      if (!encryptedSeed) {
        return null;
      }
      return await cryptoService.decrypt(encryptedSeed);
    } catch (error) {
      console.error('Failed to load wallet seed:', error);
      return null;
    }
  }

  async clearSeed(): Promise<void> {
    try {
      await storageService.remove(STORAGE_KEYS.SEED);
      console.log('Wallet seed cleared successfully');
    } catch (error) {
      console.error('Failed to clear wallet seed:', error);
    }
  }
}

export const walletStorageService = WalletStorageService.getInstance();
