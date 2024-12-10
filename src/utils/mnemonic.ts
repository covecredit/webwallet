import { generateMnemonic as bip39GenerateMnemonic, validateMnemonic as bip39ValidateMnemonic, mnemonicToSeedSync } from 'bip39';
import { Wallet } from 'xrpl';
import randomBytes from 'randombytes';

// Use native crypto when available, fallback to randomBytes
const getRandomValues = (buffer: Uint8Array): Uint8Array => {
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    return window.crypto.getRandomValues(buffer);
  }
  const bytes = randomBytes(buffer.length);
  buffer.set(new Uint8Array(bytes));
  return buffer;
};

export function generateMnemonic(): string[] {
  try {
    // Generate entropy using crypto API
    const entropy = new Uint8Array(32); // 256 bits
    getRandomValues(entropy);
    
    // Convert entropy to mnemonic
    const mnemonic = bip39GenerateMnemonic(256, () => entropy);
    return mnemonic.split(' ');
  } catch (error) {
    console.error('Failed to generate mnemonic:', error);
    throw new Error('Failed to generate secure wallet');
  }
}

export async function validateMnemonic(words: string[]): Promise<string> {
  try {
    if (!Array.isArray(words) || words.length !== 24) {
      throw new Error('Invalid mnemonic: must be exactly 24 words');
    }

    const mnemonic = words.join(' ').toLowerCase();
    
    // Validate mnemonic format
    if (!bip39ValidateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase format');
    }

    // Generate seed from mnemonic
    const seed = mnemonicToSeedSync(mnemonic);
    
    // Convert first 16 bytes of seed to hex string
    const seedHex = Buffer.from(seed.slice(0, 16)).toString('hex').toUpperCase();

    // Derive XRPL family seed format
    const familySeed = 's' + seedHex;

    try {
      // Create XRPL wallet from family seed
      const wallet = Wallet.fromSeed(familySeed);
      
      if (!wallet || !wallet.seed) {
        throw new Error('Failed to generate wallet from seed');
      }

      return wallet.seed;
    } catch (error) {
      console.error('Wallet creation error:', error);
      throw new Error('Failed to create valid XRPL wallet from seed');
    }
  } catch (error: any) {
    console.error('Mnemonic validation failed:', error);
    throw new Error(error.message || 'Invalid mnemonic phrase');
  }
}