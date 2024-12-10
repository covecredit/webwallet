import { Wallet } from 'xrpl';
import { hashService } from './hash';

export class SeedService {
  private static instance: SeedService;

  private constructor() {}

  static getInstance(): SeedService {
    if (!SeedService.instance) {
      SeedService.instance = new SeedService();
    }
    return SeedService.instance;
  }

  async generateSeedFromPassphrase(passphrase: string): Promise<string> {
    try {
      console.log('Generating seed from passphrase...');
      
      // Get first 16 bytes of SHA-512 hash
      const seedBytes = await hashService.sha512Half(passphrase);
      
      // Convert to hex string
      const seedHex = seedBytes.toString('hex').toUpperCase();
      console.log('Generated seed hex:', seedHex);

      // Create wallet from the seed hex
      const wallet = Wallet.fromSeed(seedHex);
      console.log('Generated wallet address:', wallet.address);

      return wallet.seed;
    } catch (error) {
      console.error('Seed generation failed:', error);
      throw new Error('Failed to generate wallet seed');
    }
  }

  validateSeed(seed: string): boolean {
    try {
      Wallet.fromSeed(seed);
      return true;
    } catch {
      return false;
    }
  }
}

export const seedService = SeedService.getInstance();