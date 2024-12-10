import { xrplService } from './xrpl';
import { NetworkConfig } from '../types/network';

class FaucetService {
  private static instance: FaucetService;
  private isFunding = false;

  private constructor() {}

  static getInstance(): FaucetService {
    if (!FaucetService.instance) {
      FaucetService.instance = new FaucetService();
    }
    return FaucetService.instance;
  }

  async fundWallet(address: string, network: NetworkConfig): Promise<void> {
    if (this.isFunding) {
      throw new Error('Funding request already in progress');
    }

    try {
      this.isFunding = true;
      console.log('Requesting faucet funds for:', address);
      
      let faucetUrl: string;
      if (network.type === 'testnet') {
        faucetUrl = 'https://faucet.altnet.rippletest.net/accounts';
      } else if (network.type === 'devnet') {
        faucetUrl = 'https://faucet.devnet.rippletest.net/accounts';
      } else {
        throw new Error('Faucet is only available on testnet and devnet');
      }

      const response = await fetch(faucetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destination: address })
      });

      if (!response.ok) {
        throw new Error(`Faucet request failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Faucet response:', data);

      // Wait for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Refresh account info
      const client = xrplService.getClient();
      if (client) {
        await client.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated'
        });
      }

      console.log('Faucet funding completed successfully');
    } catch (error) {
      console.error('Failed to fund wallet:', error);
      throw error;
    } finally {
      this.isFunding = false;
    }
  }

  canFund(network: NetworkConfig): boolean {
    return network.type === 'testnet' || network.type === 'devnet';
  }

  isInProgress(): boolean {
    return this.isFunding;
  }
}

export const faucetService = FaucetService.getInstance();