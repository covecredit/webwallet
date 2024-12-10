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

  async buildTransactionGraph(
    searchTerm: string, 
    options: TransactionGraphOptions = {}
  ): Promise<GraphData> {
    const client = xrplService.getClient();
    if (!client) {
      throw new Error('Not connected to network');
    }

    try {
      this.builder.clear();

      if (options.type === 'transaction') {
        // Build graph for transaction hash
        const tx = await client.request({
          command: 'tx',
          transaction: searchTerm
        });

        const transaction = tx.result;
        this.builder.addTransactionNode(transaction);
        
        // Add source and destination accounts
        await this.builder.addAccountNode(transaction.Account);
        if (transaction.Destination) {
          await this.builder.addAccountNode(transaction.Destination);
        }

        // Add ledger info
        await this.builder.addLedgerNode(transaction.ledger_index);

      } else if (options.type === 'ledger') {
        // Build graph for ledger sequence
        const ledger = await client.request({
          command: 'ledger',
          ledger_index: parseInt(searchTerm),
          transactions: true
        });

        this.builder.addLedgerNode(ledger.result.ledger_index);

        // Add transactions in ledger
        for (const txHash of ledger.result.ledger.transactions) {
          const tx = await client.request({
            command: 'tx',
            transaction: txHash
          });
          this.builder.addTransactionNode(tx.result);
        }

      } else {
        // Default: build graph for account
        return this.buildAccountGraph(searchTerm, options);
      }

      return this.builder.build();

    } catch (error: any) {
      console.error('Failed to build graph:', error);
      throw new Error(error.message || 'Failed to build transaction graph');
    }
  }

  private async buildAccountGraph(address: string, options: TransactionGraphOptions): Promise<GraphData> {
    const client = xrplService.getClient();
    if (!client) {
      throw new Error('Not connected to network');
    }

    // Get account transactions
    const response = await client.request({
      command: 'account_tx',
      account: address,
      limit: options.limit || 20
    });

    // Add account node
    await this.builder.addAccountNode(address);

    // Process transactions
    for (const tx of response.result.transactions) {
      this.builder.addTransactionNode(tx.tx);
      
      // Add other accounts involved
      if (tx.tx.Destination) {
        await this.builder.addAccountNode(tx.tx.Destination);
      }
      
      // Add ledger info
      await this.builder.addLedgerNode(tx.tx.ledger_index);
    }

    return this.builder.build();
  }
}

export const graphService = GraphService.getInstance();