import { brainWalletGenerator } from './generator';

export const brainWalletService = {
  generateSeedFromPassphrase: (passphrase: string) => 
    brainWalletGenerator.generateSeedFromPassphrase(passphrase)
};