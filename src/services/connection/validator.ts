import { NetworkConfig } from '../../types/network';

export class ConnectionValidator {
  static validateNetwork(network: NetworkConfig | null): void {
    if (!network) {
      throw new Error('Network configuration is required');
    }

    if (!network.url?.startsWith('wss://')) {
      throw new Error('Invalid network URL. Must start with wss://');
    }

    if (!network.id || !network.name || !network.type) {
      throw new Error('Invalid network configuration');
    }
  }

  static validateClientConfig(config: any): void {
    if (!config.timeout || config.timeout < 5000) {
      throw new Error('Invalid timeout configuration');
    }

    if (!config.connectionTimeout || config.connectionTimeout < 5000) {
      throw new Error('Invalid connection timeout configuration');
    }
  }
}
