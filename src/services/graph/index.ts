import { xrplService } from '../xrpl';
import { GraphBuilder } from './builder';
import { GraphData, TransactionGraphOptions } from './types';
import { dropsToXrp } from 'xrpl';

class GraphService {
  private static instance: GraphService;
  private builder: GraphBuilder;

  private constructor() {
    this.builder = new GraphBuilder();
  }

  static getInstance(): GraphService {
    if (!GraphService.instance) {
      GraphService.instance = new GraphService();
    }
    return GraphService.instance;
  }

  async buildTransactionGraph(address: string, options: TransactionGraphOptions = {}): Promise<GraphData> {
    const client = xrplService.getClient();
    if (!client) {
      throw new Error('Not connected to network');
    }

    try {
      this.builder.clear();

      // Get account info for the main address
      try {
        const accountInfo = await client.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated'
        });
        const balance = dropsToXrp(accountInfo.result.account_data.Balance);
        this.builder.setAccountBalance(address, balance);
      } catch (error) {
        console.warn('Could not fetch balance for', address);
      }

      // Add the main account node
      this.builder.addNode({
        id: address,
        label: `Account: ${address}`,
        type: 'wallet'
      });

      // Get account transactions
      const response = await client.request({
        command: 'account_tx',
        account: address,
        limit: options.limit || 20
      });

      // Process transactions
      for (const tx of response.result.transactions) {
        const transaction = tx.tx;
        const meta = tx.meta;
        const hash = transaction.hash;

        // Format amount if present
        let amount = '';
        if (transaction.Amount) {
          amount = typeof transaction.Amount === 'string' 
            ? dropsToXrp(transaction.Amount)
            : JSON.stringify(transaction.Amount);
        }

        // Add transaction node with detailed info
        this.builder.addNode({
          id: hash,
          label: `TX: ${transaction.TransactionType}\n` +
                 `Amount: ${amount} XRP\n` +
                 `Fee: ${dropsToXrp(transaction.Fee)} XRP\n` +
                 `Sequence: ${transaction.Sequence}`,
          type: 'transaction',
          data: transaction
        });

        // Add source account node and link
        this.builder.addNode({
          id: transaction.Account,
          label: `Account: ${transaction.Account}`,
          type: 'wallet'
        });

        // Try to get balance for source account
        try {
          const accountInfo = await client.request({
            command: 'account_info',
            account: transaction.Account,
            ledger_index: 'validated'
          });
          const balance = dropsToXrp(accountInfo.result.account_data.Balance);
          this.builder.setAccountBalance(transaction.Account, balance);
        } catch (error) {
          console.warn('Could not fetch balance for', transaction.Account);
        }

        this.builder.addLink({
          source: transaction.Account,
          target: hash,
          type: 'sends',
          data: {
            amount: transaction.Amount,
            timestamp: tx.date
          }
        });

        // Add destination account node and link if present
        if (transaction.Destination) {
          this.builder.addNode({
            id: transaction.Destination,
            label: `Account: ${transaction.Destination}`,
            type: 'wallet'
          });

          // Try to get balance for destination account
          try {
            const accountInfo = await client.request({
              command: 'account_info',
              account: transaction.Destination,
              ledger_index: 'validated'
            });
            const balance = dropsToXrp(accountInfo.result.account_data.Balance);
            this.builder.setAccountBalance(transaction.Destination, balance);
          } catch (error) {
            console.warn('Could not fetch balance for', transaction.Destination);
          }

          this.builder.addLink({
            source: hash,
            target: transaction.Destination,
            type: 'receives',
            data: {
              amount: transaction.Amount,
              timestamp: tx.date
            }
          });
        }

        // Add ledger node and link
        const ledgerIndex = tx.ledger_index;
        const ledgerId = `ledger-${ledgerIndex}`;
        
        this.builder.addNode({
          id: ledgerId,
          label: `Ledger #${ledgerIndex}`,
          type: 'ledger'
        });

        this.builder.addLink({
          source: hash,
          target: ledgerId,
          type: 'in_ledger'
        });
      }

      return this.builder.build();
    } catch (error) {
      console.error('Failed to build transaction graph:', error);
      throw error;
    }
  }
}

export const graphService = GraphService.getInstance();