import { TokenInfo } from '../services/xrpl/dex/types';

export const DEFAULT_TOKENS: TokenInfo[] = [
  {
    currency: 'USD',
    issuer: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De',
    name: 'Ripple USD',
    description: 'Official Ripple USD Stablecoin',
    imageUrl: null,
    network: 'mainnet'
  },
  {
    currency: 'USD',
    issuer: 'rQhWct2fv4Vc4KRjRgMrxa8xPN9Zx9iLKV',
    name: 'Ripple USD Testnet',
    description: 'Ripple USD Stablecoin (Testnet)',
    imageUrl: null,
    network: 'testnet'
  }
];