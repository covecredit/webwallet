export type NetworkType = 'mainnet' | 'testnet' | 'devnet' | 'custom';

export interface NetworkConfig {
  id: string;
  name: string;
  url: string;
  type: NetworkType;
}

export const defaultNetworks: NetworkConfig[] = [
  {
    id: 'mainnet-xrplcluster',
    name: 'Mainnet (XRPL Foundation)',
    url: 'wss://xrplcluster.com',
    type: 'mainnet'
  },
  {
    id: 'mainnet-ripple-1',
    name: 'Mainnet (Ripple s1)',
    url: 'wss://s1.ripple.com',
    type: 'mainnet'
  },
  {
    id: 'mainnet-ripple-2',
    name: 'Mainnet (Ripple s2)',
    url: 'wss://s2.ripple.com',
    type: 'mainnet'
  },
  {
    id: 'testnet-ripple',
    name: 'Testnet (Ripple)',
    url: 'wss://s.altnet.rippletest.net:51233',
    type: 'testnet'
  },
  {
    id: 'testnet-xrpl-labs',
    name: 'Testnet (XRPL Labs)',
    url: 'wss://testnet.xrpl-labs.com',
    type: 'testnet'
  },
  {
    id: 'testnet-ripple-clio',
    name: 'Testnet Clio (Ripple)',
    url: 'wss://clio.altnet.rippletest.net:51233',
    type: 'testnet'
  },
  {
    id: 'devnet-ripple',
    name: 'Devnet (Ripple)',
    url: 'wss://s.devnet.rippletest.net:51233',
    type: 'devnet'
  },
  {
    id: 'devnet-ripple-clio',
    name: 'Devnet Clio (Ripple)',
    url: 'wss://clio.devnet.rippletest.net:51233',
    type: 'devnet'
  }
];