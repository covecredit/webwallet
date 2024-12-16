import { Client, TrustSet } from 'xrpl';
import { TrustLine, CreateTrustLineParams, TokenInfo } from './types';
import { XRPLError } from '../errors';

export class TrustLineService {
  constructor(private client: Client) {}

  async fetchTrustLines(account: string): Promise<TrustLine[]> {
    try {
      const response = await this.client.request({
        command: 'account_lines',
        account: account,
        ledger_index: 'validated'
      });

      return response.result.lines.map(line => ({
        account: account,
        currency: line.currency,
        issuer: line.account,
        balance: line.balance,
        limit: line.limit,
        limitPeer: line.limit_peer,
        frozen: line.freeze || line.freeze_peer
      }));
    } catch (error) {
      throw new XRPLError('TRUSTLINE_FETCH_ERROR', 'Failed to fetch trust lines', error);
    }
  }

  async createTrustLine(params: CreateTrustLineParams): Promise<string> {
    try {
      const trustSet: TrustSet = {
        TransactionType: 'TrustSet',
        Account: params.account,
        LimitAmount: {
          currency: params.currency,
          issuer: params.issuer,
          value: params.limit
        }
      };

      const prepared = await this.client.autofill(trustSet);
      const response = await this.client.submitAndWait(prepared);

      if (response.result.meta?.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`Trust line creation failed: ${response.result.meta?.TransactionResult}`);
      }

      return response.result.hash;
    } catch (error) {
      throw new XRPLError('TRUSTLINE_CREATE_ERROR', 'Failed to create trust line', error);
    }
  }

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
        holders: 0, // Requires additional processing to get accurate count
        frozen: false // Requires checking individual trust lines
      };
    } catch (error) {
      throw new XRPLError('TOKEN_INFO_ERROR', 'Failed to fetch token information', error);
    }
  }
}
