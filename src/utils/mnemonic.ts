import { generateMnemonic as bip39GenerateMnemonic, validateMnemonic as bip39ValidateMnemonic, mnemonicToSeedSync } from 'bip39';
import { Wallet } from 'xrpl';
import randomBytes from 'randombytes';
import { bytesToWords, wordsToBytes } from './rfc1751';

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
    console.log('Generating new mnemonic...');
    
    // Generate entropy using crypto API
    const entropy = new Uint8Array(32); // 256 bits
    getRandomValues(entropy);
    
    // Convert entropy to mnemonic
    const mnemonic = bip39GenerateMnemonic(256, () => entropy);
    const words = mnemonic.split(' ');
    
    console.log('Generated BIP39 mnemonic:', words);

    // Generate RFC1751 words for debugging
    const seed = mnemonicToSeedSync(mnemonic);
    const rfc1751Words = bytesToWords(seed.slice(0, 16));
    console.log('RFC1751 equivalent:', rfc1751Words);

    return words;
  } catch (error) {
    console.error('Failed to generate mnemonic:', error);
    throw new Error('Failed to generate secure wallet');
  }
}

export async function validateMnemonic(words: string[] | string): Promise<string> {
  try {
    console.log('Validating mnemonic:', words);
    
    const mnemonic = Array.isArray(words) ? words.join(' ').toLowerCase() : words.toLowerCase();
    
    // Validate mnemonic format
    if (!bip39ValidateMnemonic(mnemonic)) {
      console.error('Invalid BIP39 mnemonic format');
      throw new Error('Invalid mnemonic phrase format');
    }

    // Generate seed from mnemonic
    console.log('Generating seed from mnemonic...');
    const seed = mnemonicToSeedSync(mnemonic);
    console.log('Generated seed:', seed.toString('hex'));
    
    // Take first 16 bytes of seed
    const seedBytes = seed.slice(0, 16);
    console.log('Using first 16 bytes:', seedBytes.toString('hex'));

    // Generate RFC1751 words for verification
    const rfc1751Words = bytesToWords(seedBytes);
    console.log('RFC1751 words:', rfc1751Words);

    // Convert to hex for XRPL
    const seedHex = seedBytes.toString('hex').toUpperCase();
    console.log('Final seed hex:', seedHex);

    // Validate the seed can create a valid wallet
    try {
      const wallet = Wallet.fromSeed(seedHex);
      console.log('Generated wallet address:', wallet.address);
      
      if (!wallet || !wallet.address) {
        throw new Error('Failed to generate valid wallet');
      }
      
      return seedHex;
    } catch (error) {
      console.error('Wallet creation error:', error);
      throw new Error('Failed to create valid XRPL wallet from seed');
    }
  } catch (error: any) {
    console.error('Mnemonic validation failed:', error);
    throw error;
  }
}