import { Client, Wallet } from 'xrpl';
import { XRPLError } from '../errors';

export class WalletManager {
  private wallet: Wallet | null = null;

  async createWallet(seed: string, client: Client): Promise<{ wallet: Wallet; balance: number }> {
    try {
      this.wallet = Wallet.fromSeed(seed);

      try {
        const response = await client.request({
          command: 'account_info',
          account: this.wallet.address,
          ledger_index: 'validated'
        });

        const balance = Number(response.result.account_data.Balance) / 1000000;
        return { wallet: this.wallet, balance };
      } catch (error: any) {
        if (error.data?.error === 'actNotFound') {
          return { wallet: this.wallet, balance: 0 };
        }
        throw error;
      }
    } catch (error: any) {
      throw new XRPLError('WALLET_CREATE_ERROR', 'Failed to create wallet', error);
    }
  }

  getWallet(): Wallet | null {
    return this.wallet;
  }

  clear(): void {
    this.wallet = null;
  }
}