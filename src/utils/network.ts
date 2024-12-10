import { NetworkType } from '../types/network';

export function getExplorerUrl(hash: string, networkType: NetworkType): string {
  switch (networkType) {
    case 'mainnet':
      return `https://livenet.xrpl.org/transactions/${hash}`;
    case 'testnet':
      return `https://testnet.xrpl.org/transactions/${hash}`;
    case 'devnet':
      return `https://devnet.xrpl.org/transactions/${hash}`;
    default:
      return `https://livenet.xrpl.org/transactions/${hash}`;
  }
}