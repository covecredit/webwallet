import { create } from 'zustand';
import { NetworkConfig, defaultNetworks } from '../types/network';
import { STORAGE_KEYS } from '../constants/storage';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface NetworkState {
  networks: NetworkConfig[];
  selectedNetwork: NetworkConfig;
  addNetwork: (network: NetworkConfig) => void;
  selectNetwork: (networkId: string) => void;
}

// Initialize with testnet by default
const DEFAULT_NETWORK = defaultNetworks.find(n => n.id === 'testnet-ripple') || defaultNetworks[0];

// Validate network configuration
const validateNetwork = (network: NetworkConfig): boolean => {
  return !!(
    network &&
    network.id &&
    network.name &&
    network.type &&
    network.url?.startsWith('wss://')
  );
};

// Load and validate saved networks
const loadNetworks = (): NetworkConfig[] => {
  const saved = loadFromStorage<NetworkConfig[]>(STORAGE_KEYS.NETWORKS);
  if (saved?.length) {
    // Filter out invalid networks
    const validNetworks = saved.filter(validateNetwork);
    if (validNetworks.length) {
      return validNetworks;
    }
  }
  return defaultNetworks;
};

// Load and validate selected network
const loadSelectedNetwork = (networks: NetworkConfig[]): NetworkConfig => {
  const saved = loadFromStorage<NetworkConfig>(STORAGE_KEYS.SELECTED_NETWORK);
  if (saved && validateNetwork(saved)) {
    // Ensure the network exists in our list
    const exists = networks.find(n => n.id === saved.id);
    if (exists) {
      return saved;
    }
  }
  return DEFAULT_NETWORK;
};

// Initialize store
const initialNetworks = loadNetworks();

export const useNetworkStore = create<NetworkState>((set, get) => ({
  networks: initialNetworks,
  selectedNetwork: loadSelectedNetwork(initialNetworks),

  addNetwork: (network) => {
    if (!validateNetwork(network)) {
      throw new Error('Invalid network configuration');
    }
    const { networks } = get();
    const updatedNetworks = [...networks, network];
    saveToStorage(STORAGE_KEYS.NETWORKS, updatedNetworks);
    set({ networks: updatedNetworks });
  },

  selectNetwork: (networkId) => {
    const { networks } = get();
    const network = networks.find(n => n.id === networkId);
    if (network && validateNetwork(network)) {
      saveToStorage(STORAGE_KEYS.SELECTED_NETWORK, network);
      set({ selectedNetwork: network });
    }
  }
}));