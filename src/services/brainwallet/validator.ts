export class BrainWalletValidator {
  private static instance: BrainWalletValidator;

  private constructor() {}

  static getInstance(): BrainWalletValidator {
    if (!BrainWalletValidator.instance) {
      BrainWalletValidator.instance = new BrainWalletValidator();
    }
    return BrainWalletValidator.instance;
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

export const brainWalletValidator = BrainWalletValidator.getInstance();