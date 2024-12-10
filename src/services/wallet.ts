import { Wallet, dropsToXrp } from 'xrpl';
import { connectionManager } from './connection';

class WalletManager {
  private static instance: WalletManager;
  private wallet: Wallet | null = null;

  private constructor() {}

  static getInstance(): WalletManager {
    if (!WalletManager.instance) {
      WalletManager.instance = new WalletManager();
    }
    return WalletManager.instance;
  }

  async createWallet(seed: string): Promise<{ wallet: Wallet; balance: number; isActivated: boolean }> {
    const client = connectionManager.getClient();
    if (!client?.isConnected()) {
      throw new Error('Not connected to network');
    }

    try {
      console.log('Creating wallet from seed...');
      this.wallet = Wallet.fromSeed(seed);
      console.log('Wallet created successfully:', {
        address: this.wallet.address,
        publicKey: this.wallet.publicKey
      });

      try {
        const { account_data } = await client.request({
          command: 'account_info',
          account: this.wallet.address,
          ledger_index: 'validated'
        });

        const balance = Number(dropsToXrp(account_data.Balance));
        const isActivated = balance >= 10;

        console.log('Account info retrieved:', {
          address: this.wallet.address,
          balance,
          isActivated
        });

        return {
          wallet: this.wallet,
          balance,
          isActivated
        };
      } catch (error: any) {
        if (error.data?.error === 'actNotFound') {
          console.log('Account not found (not activated):', this.wallet.address);
          return {
            wallet: this.wallet,
            balance: 0,
            isActivated: false
          };
        }
        throw error;
      }
    } catch (error: any) {
      console.error('Failed to create wallet:', error);
      this.wallet = null;
      if (error.message?.includes('Invalid seed') || error.message?.includes('Unsupported seed format')) {
        throw new Error('Invalid wallet seed format');
      }
      throw error;
    }
  }

  getWallet(): Wallet | null {
    return this.wallet;
  }

  clear(): void {
    this.wallet = null;
  }
}

export const walletManager = WalletManager.getInstance();