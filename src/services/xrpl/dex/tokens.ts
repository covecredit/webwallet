import { Client } from 'xrpl';
import { TokenInfo } from './types';
import { XRPLError } from '../errors';

export class TokenService {
  constructor(private client: Client) {}

  async getTokenInfo(currency: string, issuer: string): Promise<TokenInfo> {
    try {
      const [rippleState, accountInfo] = await Promise.all([
        this.client.request({
          command: 'ledger_entry',
          ripple_state: {
            currency,
            accounts: [issuer]
          }
        }),
        this.client.request({
          command: 'account_info',
          account: issuer
        })
      ]);

      return {
        currency,
        issuer,
        balance: rippleState.result.node.Balance.value,
        trustlines: accountInfo.result.account_data.OwnerCount,
        holders: 0, // Requires additional processing
        frozen: false,
        network: this.getNetworkType()
      };
    } catch (error) {
      throw new XRPLError('TOKEN_INFO_ERROR', 'Failed to fetch token information', error);
    }
  }

  private getNetworkType(): 'mainnet' | 'testnet' | 'devnet' {
    const url = this.client.url;
    if (url.includes('testnet')) return 'testnet';
    if (url.includes('devnet')) return 'devnet';
    return 'mainnet';
  }
}