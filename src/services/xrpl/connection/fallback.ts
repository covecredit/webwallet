import { NetworkType } from '../../../types/network';

export class FallbackUrlProvider {
  private static readonly FALLBACK_URLS: Record<NetworkType, string[]> = {
    mainnet: [
      'wss://xrplcluster.com',
      'wss://s1.ripple.com',
      'wss://s2.ripple.com'
    ],
    testnet: [
      'wss://s.altnet.rippletest.net:51233',
      'wss://testnet.xrpl-labs.com'
    ],
    devnet: [
      'wss://s.devnet.rippletest.net:51233'
    ],
    custom: []
  };

  static getFallbackUrls(networkType: NetworkType): string[] {
    return this.FALLBACK_URLS[networkType] || [];
  }
}