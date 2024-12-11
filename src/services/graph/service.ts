import { Client } from 'xrpl';
import { GraphBuilder } from './builder';
import { GraphData, TransactionGraphOptions } from './types';
import { dropsToXrp } from 'xrpl';
import { xrplService } from '../xrpl';

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
    if (!client?.isConnected()) {
      throw new Error('Not connected to network');
    }

    try {
      this.builder = new GraphBuilder(); // Reset builder for new graph

      if (searchTerm.startsWith('r') && searchTerm.length >= 25) {
        return this.buildAccountBasedGraph(client, searchTerm, options);
      } else if (/^[A-F0-9]{64}$/i.test(searchTerm)) {
        return this.buildTransactionBasedGraph(client, searchTerm);
      } else if (/^\d+$/.test(searchTerm)) {
        return this.buildLedgerBasedGraph(client, parseInt(searchTerm));
      } else {
        throw new Error('Invalid search term. Enter an account address, transaction hash, or ledger sequence.');
      }
    } catch (error: any) {
      console.error('Failed to build graph:', error);
      throw new Error(error.message || 'Failed to build transaction graph');
    }
  }

  private async buildAccountBasedGraph(
    client: Client,
    address: string,
    options: TransactionGraphOptions
  ): Promise<GraphData> {
    try {
      const response = await client.request({
        command: 'account_tx',
        account: address,
        limit: options.limit || 20
      });

      // Add main account node
      const accountInfo = await this.getAccountInfo(client, address);
      this.builder.addNode({
        id: address,
        label: `Account: ${address}`,
        type: 'wallet',
        data: accountInfo
      });

      // Process transactions
      for (const tx of response.result.transactions) {
        const transaction = tx.tx;
        
        // Add transaction node
        this.builder.addNode({
          id: transaction.hash,
          label: `TX: ${transaction.TransactionType}${
            transaction.Amount ? ` (${dropsToXrp(transaction.Amount)} XRP)` : ''
          }`,
          type: transaction.TransactionType.toLowerCase() === 'payment' ? 'payment' : 'transaction',
          data: transaction
        });

        // Add ledger node
        this.builder.addNode({
          id: `ledger-${transaction.ledger_index}`,
          label: `Ledger: ${transaction.ledger_index}`,
          type: 'ledger',
          data: { sequence: transaction.ledger_index }
        });

        // Add links
        this.builder.addLink({
          source: transaction.Account,
          target: transaction.hash,
          data: { amount: transaction.Amount ? dropsToXrp(transaction.Amount) : undefined }
        });

        this.builder.addLink({
          source: transaction.hash,
          target: `ledger-${transaction.ledger_index}`
        });

        if (transaction.Destination) {
          // Add destination account node
          const destInfo = await this.getAccountInfo(client, transaction.Destination);
          this.builder.addNode({
            id: transaction.Destination,
            label: `Account: ${transaction.Destination}`,
            type: 'wallet',
            data: destInfo
          });

          this.builder.addLink({
            source: transaction.hash,
            target: transaction.Destination,
            data: { amount: transaction.Amount ? dropsToXrp(transaction.Amount) : undefined }
          });
        }
      }

      return this.builder.build();
    } catch (error) {
      console.error('Failed to build account graph:', error);
      throw error;
    }
  }

  private async buildTransactionBasedGraph(
    client: Client,
    hash: string
  ): Promise<GraphData> {
    try {
      const tx = await client.request({
        command: 'tx',
        transaction: hash,
        binary: false
      });

      const transaction = tx.result;
      
      // Add transaction node
      this.builder.addNode({
        id: transaction.hash,
        label: `TX: ${transaction.TransactionType}${
          transaction.Amount ? ` (${dropsToXrp(transaction.Amount)} XRP)` : ''
        }`,
        type: transaction.TransactionType.toLowerCase() === 'payment' ? 'payment' : 'transaction',
        data: transaction
      });

      // Add source account
      const sourceInfo = await this.getAccountInfo(client, transaction.Account);
      this.builder.addNode({
        id: transaction.Account,
        label: `Account: ${transaction.Account}`,
        type: 'wallet',
        data: sourceInfo
      });

      // Add destination if present
      if (transaction.Destination) {
        const destInfo = await this.getAccountInfo(client, transaction.Destination);
        this.builder.addNode({
          id: transaction.Destination,
          label: `Account: ${transaction.Destination}`,
          type: 'wallet',
          data: destInfo
        });

        // Add links
        this.builder.addLink({
          source: transaction.Account,
          target: transaction.hash,
          data: { amount: transaction.Amount ? dropsToXrp(transaction.Amount) : undefined }
        });
        this.builder.addLink({
          source: transaction.hash,
          target: transaction.Destination,
          data: { amount: transaction.Amount ? dropsToXrp(transaction.Amount) : undefined }
        });
      }

      // Add ledger node
      this.builder.addNode({
        id: `ledger-${transaction.ledger_index}`,
        label: `Ledger: ${transaction.ledger_index}`,
        type: 'ledger',
        data: { sequence: transaction.ledger_index }
      });

      // Link transaction to ledger
      this.builder.addLink({
        source: transaction.hash,
        target: `ledger-${transaction.ledger_index}`
      });

      return this.builder.build();
    } catch (error) {
      console.error('Failed to build transaction graph:', error);
      throw error;
    }
  }

  private async buildLedgerBasedGraph(
    client: Client,
    sequence: number
  ): Promise<GraphData> {
    try {
      const ledger = await client.request({
        command: 'ledger',
        ledger_index: sequence,
        transactions: true,
        expand: true
      });

      // Add ledger node
      this.builder.addNode({
        id: `ledger-${sequence}`,
        label: `Ledger #${sequence}`,
        type: 'ledger',
        data: ledger.result.ledger
      });

      // Process each transaction
      for (const tx of ledger.result.ledger.transactions) {
        if (typeof tx === 'object') {
          // Add transaction node
          this.builder.addNode({
            id: tx.hash,
            label: `TX: ${tx.TransactionType}`,
            type: tx.TransactionType.toLowerCase() === 'payment' ? 'payment' : 'transaction',
            data: tx
          });

          // Link transaction to ledger
          this.builder.addLink({
            source: tx.hash,
            target: `ledger-${sequence}`
          });

          // Add and link accounts
          this.builder.addNode({
            id: tx.Account,
            label: `Account: ${tx.Account}`,
            type: 'wallet',
            data: await this.getAccountInfo(client, tx.Account)
          });

          this.builder.addLink({
            source: tx.Account,
            target: tx.hash
          });

          if (tx.Destination) {
            this.builder.addNode({
              id: tx.Destination,
              label: `Account: ${tx.Destination}`,
              type: 'wallet',
              data: await this.getAccountInfo(client, tx.Destination)
            });

            this.builder.addLink({
              source: tx.hash,
              target: tx.Destination
            });
          }
        }
      }

      return this.builder.build();
    } catch (error) {
      console.error('Failed to build ledger graph:', error);
      throw error;
    }
  }

  private async getAccountInfo(client: Client, address: string) {
    try {
      const response = await client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });
      return response.result.account_data;
    } catch (error: any) {
      if (error.data?.error === 'actNotFound') {
        return { Balance: '0' };
      }
      throw error;
    }
  }
}

export const graphService = GraphService.getInstance();