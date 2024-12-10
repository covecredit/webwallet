import { create } from 'zustand';
import { NetworkConfig, defaultNetworks } from '../types/network';
import { saveToStorage, loadFromStorage } from '../utils/storage';

interface NetworkState {
  networks: NetworkConfig[];
  selectedNetwork: NetworkConfig;
  addNetwork: (network: NetworkConfig) => void;
  selectNetwork: (networkId: string) => void;
}

// Always start with testnet for development
const savedNetworks = loadFromStorage('NETWORKS') || defaultNetworks;
const savedSelectedNetwork = loadFromStorage('SELECTED_NETWORK') || defaultNetworks[1]; // Default to testnet

export const useNetworkStore = create<NetworkState>((set, get) => ({
  networks: savedNetworks,
  selectedNetwork: savedSelectedNetwork,

  addNetwork: (network) => {
    const { networks } = get();
    const updatedNetworks = [...networks, network];
    saveToStorage('NETWORKS', updatedNetworks);
    set({ networks: updatedNetworks });
  },

  selectNetwork: (networkId) => {
    const { networks } = get();
    const network = networks.find(n => n.id === networkId);
    if (network) {
      saveToStorage('SELECTED_NETWORK', network);
      set({ selectedNetwork: network });
    }
  }
}));