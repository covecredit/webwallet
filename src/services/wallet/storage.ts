import { storageService } from '../storage';
import { passphraseService } from '../crypto/passphrase';
import { STORAGE_KEYS } from '../../constants/storage';
import { EventEmitter } from '../../utils/EventEmitter';

class WalletStorageService extends EventEmitter {
  private static instance: WalletStorageService;

  private constructor() {
    super();
  }

  static getInstance(): WalletStorageService {
    if (!WalletStorageService.instance) {
      WalletStorageService.instance = new WalletStorageService();
    }
    return WalletStorageService.instance;
  }

  async saveSeed(seed: string): Promise<void> {
    try {
      if (!passphraseService.hasPassphrase()) {
        throw new Error('Please set a passphrase before saving wallet');
      }

      console.log('Encrypting wallet seed...');
      const encryptedSeed = await passphraseService.encrypt(seed);
      await storageService.set(STORAGE_KEYS.SEED, encryptedSeed);
      console.log('Wallet seed encrypted and stored successfully');
      this.emit('seedStored');
    } catch (error) {
      console.error('Failed to save wallet seed:', error);
      throw error;
    }
  }

  async loadSeed(): Promise<string | null> {
    try {
      const encryptedSeed = await storageService.get(STORAGE_KEYS.SEED);
      if (!encryptedSeed) {
        console.log('No encrypted seed found');
        return null;
      }

      if (!passphraseService.hasPassphrase()) {
        console.log('Cannot load seed: No passphrase set');
        throw new Error('Please enter your passphrase to unlock the wallet');
      }

      console.log('Decrypting wallet seed...');
      const seed = await passphraseService.decrypt(encryptedSeed);
      console.log('Wallet seed decrypted successfully');
      return seed;
    } catch (error: any) {
      console.error('Failed to load wallet seed:', error);
      throw error;
    }
  }

  async clearSeed(): Promise<void> {
    try {
      await storageService.remove(STORAGE_KEYS.SEED);
      console.log('Wallet seed cleared successfully');
      this.emit('seedCleared');
    } catch (error) {
      console.error('Failed to clear wallet seed:', error);
      throw error;
    }
  }

  hasStoredSeed(): boolean {
    return storageService.has(STORAGE_KEYS.SEED);
  }
}

export const walletStorageService = WalletStorageService.getInstance();