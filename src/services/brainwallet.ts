import { cryptoService } from './crypto';

class BrainWalletService {
  private static instance: BrainWalletService;

  private constructor() {}

  static getInstance(): BrainWalletService {
    if (!BrainWalletService.instance) {
      BrainWalletService.instance = new BrainWalletService();
    }
    return BrainWalletService.instance;
  }

  async generateSeedFromPassphrase(passphrase: string): Promise<string> {
    try {
      if (!this.validatePassphrase(passphrase)) {
        throw new Error('Invalid passphrase format');
      }

      console.log('Generating brain wallet...');
      const seed = await cryptoService.generateSeedFromPassphrase(passphrase);
      console.log('Brain wallet seed generated successfully');
      
      return seed;
    } catch (error: any) {
      console.error('Brain wallet generation failed:', error);
      throw new Error(error.message || 'Failed to generate wallet from passphrase');
    }
  }

  private validatePassphrase(passphrase: string): boolean {
    if (!passphrase || typeof passphrase !== 'string') {
      console.log('Invalid passphrase: empty or not a string');
      return false;
    }

    // Ensure passphrase is ASCII and reasonable length
    if (!/^[\x20-\x7E]+$/.test(passphrase)) {
      console.log('Invalid passphrase: contains non-ASCII characters');
      return false;
    }

    if (passphrase.length < 1) {
      console.log('Invalid passphrase: too short');
      return false;
    }

    console.log('Passphrase validation passed');
    return true;
  }
}

export const brainWalletService = BrainWalletService.getInstance();