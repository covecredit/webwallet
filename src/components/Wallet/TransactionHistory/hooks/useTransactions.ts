import { useState, useEffect } from 'react';
import { dropsToXrp } from 'xrpl';
import { xrplService } from '../../../../services/xrpl';
import { Transaction } from '../types';

export const useTransactions = (address: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const client = xrplService.getClient();
      if (!client) throw new Error('Not connected to network');

      const response = await client.request({
        command: 'account_tx',
        account: address,
        limit: 100
      });

      const txs = response.result.transactions.map((tx: any) => {
        const transaction = tx.tx;
        const meta = tx.meta;
        
        const memos = transaction.Memos?.map((memo: any) => ({
          type: memo.Memo.MemoType ? Buffer.from(memo.Memo.MemoType, 'hex').toString('utf8') : undefined,
          data: memo.Memo.MemoData ? Buffer.from(memo.Memo.MemoData, 'hex').toString('utf8') : undefined,
          format: memo.Memo.MemoFormat ? Buffer.from(memo.Memo.MemoFormat, 'hex').toString('utf8') : undefined
        }));

        return {
          type: transaction.TransactionType,
          hash: transaction.hash,
          date: tx.date,
          amount: transaction.Amount ? dropsToXrp(transaction.Amount) : undefined,
          fee: dropsToXrp(transaction.Fee),
          sender: transaction.Account,
          receiver: transaction.Destination,
          result: meta.TransactionResult,
          sequence: transaction.Sequence,
          memos
        };
      });

      setTransactions(txs);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      setError(error.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    const client = xrplService.getClient();
    if (client) {
      const handleTransaction = async (event: any) => {
        if (event.transaction.Account === address || event.transaction.Destination === address) {
          await fetchTransactions();
        }
      };

      client.on('transaction', handleTransaction);
      const refreshInterval = setInterval(fetchTransactions, 30000);

      return () => {
        client.off('transaction', handleTransaction);
        clearInterval(refreshInterval);
      };
    }
  }, [address]);

  return { transactions, loading, error };
};