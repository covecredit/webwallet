import { seedService } from '../crypto/seed';
import { brainWalletValidator } from './validator';

export class BrainWalletGenerator {
  private static instance: BrainWalletGenerator;

  private constructor() {}

  static getInstance(): BrainWalletGenerator {
    if (!BrainWalletGenerator.instance) {
      BrainWalletGenerator.instance = new BrainWalletGenerator();
    }
    return BrainWalletGenerator.instance;
  }

  async generateSeedFromPassphrase(passphrase: string): Promise<string> {
    try {
      if (!brainWalletValidator.validatePassphrase(passphrase)) {
        throw new Error('Invalid passphrase format');
      }

      console.log('Generating brain wallet...');
      const seed = await seedService.generateSeedFromPassphrase(passphrase);
      console.log('Brain wallet seed generated successfully');
      
      return seed;
    } catch (error: any) {
      console.error('Brain wallet generation failed:', error);
      throw new Error(error.message || 'Failed to generate wallet from passphrase');
    }
  }
}

export const brainWalletGenerator = BrainWalletGenerator.getInstance();