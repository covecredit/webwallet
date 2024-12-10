import { Buffer } from 'buffer';
import { Wallet } from 'xrpl';

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

      console.log('Generating brain wallet from passphrase...');
      
      // Convert passphrase to bytes
      const encoder = new TextEncoder();
      const data = encoder.encode(passphrase);
      
      // Generate SHA-512 hash
      const hashBuffer = await crypto.subtle.digest('SHA-512', data);
      
      // Take first 16 bytes (128 bits) of the hash
      const seedBytes = Buffer.from(hashBuffer).slice(0, 16);
      
      // Convert to hex string
      const seedHex = seedBytes.toString('hex').toUpperCase();
      console.log('Generated seed hex:', seedHex);

      // Create wallet from the seed hex
      const wallet = Wallet.fromSeed(seedHex, { algorithm: 'secp256k1' });
      console.log('Generated wallet address:', wallet.address);

      return wallet.seed;
    } catch (error: any) {
      console.error('Brain wallet generation failed:', error);
      throw new Error(error.message || 'Failed to generate wallet from passphrase');
    }
  }

  validatePassphrase(passphrase: string): boolean {
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