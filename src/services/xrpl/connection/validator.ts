import { NetworkConfig } from '../../../types/network';

export class ConnectionValidator {
  static validateNetworkUrl(url: string | undefined): boolean {
    return !!url?.startsWith('wss://');
  }

  static validateNetwork(network: NetworkConfig | null): void {
    if (!network) {
      throw new Error('Network configuration is required');
    }
    if (!this.validateNetworkUrl(network.url)) {
      throw new Error('Invalid network URL. Must start with wss://');
    }
    if (!network.id || !network.name || !network.type) {
      throw new Error('Invalid network configuration');
    }
  }
}