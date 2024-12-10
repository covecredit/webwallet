import React, { useState, useEffect } from 'react';
import { History, ExternalLink, Copy, Check } from 'lucide-react';
import Widget from '../Widget/Widget';
import { useWalletStore } from '../../store/walletStore';
import { xrplService } from '../../services/xrpl';
import { dropsToXrp } from 'xrpl';
import { LAYOUT } from '../../constants/layout';
import { useNetworkStore } from '../../store/networkStore';
import { formatRippleTime } from '../../utils/ripple';

interface Transaction {
  type: string;
  hash: string;
  date: number; // Ripple timestamp
  amount?: string;
  fee: string;
  sender: string;
  receiver?: string;
  result: string;
  sequence: number;
  memos?: Array<{
    type?: string;
    data?: string;
    format?: string;
  }>;
}

interface TransactionHistoryProps {
  onClose: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onClose }) => {
  const { address } = useWalletStore();
  const { selectedNetwork } = useNetworkStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const getExplorerUrl = (hash: string): string => {
    switch (selectedNetwork.type) {
      case 'mainnet':
        return `https://livenet.xrpl.org/transactions/${hash}`;
      case 'testnet':
        return `https://testnet.xrpl.org/transactions/${hash}`;
      case 'devnet':
        return `https://devnet.xrpl.org/transactions/${hash}`;
      default:
        return `https://livenet.xrpl.org/transactions/${hash}`;
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(`${type}-${text}`);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const exportToCSV = () => {
    const headers = ['Type', 'Timestamp', 'Amount', 'Fee', 'From', 'To', 'Status', 'Hash'];
    const csvData = transactions.map((tx) => [
      tx.type,
      formatRippleTime(tx.date),
      tx.amount ? `${tx.amount} XRP` : '-',
      `${tx.fee} XRP`,
      tx.sender,
      tx.receiver || '-',
      tx.result,
      tx.hash,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `xrpl-transactions-${address}-${Date.now()}.csv`;
    link.click();
  };

  useEffect(() => {
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
          limit: 100,
        });

        const txs = response.result.transactions.map((tx: any) => {
          const transaction = tx.tx;
          const meta = tx.meta;

          const memos = transaction.Memos?.map((memo: any) => ({
            type: memo.Memo.MemoType
              ? Buffer.from(memo.Memo.MemoType, 'hex').toString('utf8')
              : undefined,
            data: memo.Memo.MemoData
              ? Buffer.from(memo.Memo.MemoData, 'hex').toString('utf8')
              : undefined,
            format: memo.Memo.MemoFormat
              ? Buffer.from(memo.Memo.MemoFormat, 'hex').toString('utf8')
              : undefined,
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
            memos,
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

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(selectedTx?.hash === tx.hash ? null : tx);
  };

  return (
    <Widget
      id="history"
      title="Transaction History"
      icon={History}
      defaultPosition={{
        x: window.innerWidth - 340,
        y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN,
      }}
      defaultSize={{ width: 800, height: 600 }}
      onClose={onClose}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg text-primary">Transaction History for</h2>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm">{address}</span>
              <button
                onClick={() => handleCopy(address, 'address')}
                className="p-1 hover:bg-primary/20 rounded transition-colors"
              >
                {copiedItem === `address-${address}` ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-primary" />
                )}
              </button>
            </div>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors text-primary"
          >
            <span>Export CSV</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-text text-opacity-50 p-4">No transactions found</div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100%-2rem)]">
              <table className="w-full">
                <thead className="sticky top-0 bg-background z-10">
                  <tr className="text-left border-b border-primary border-opacity-30">
                    <th className="px-4 py-2 text-primary">Type</th>
                    <th className="px-4 py-2 text-primary">Timestamp</th>
                    <th className="px-4 py-2 text-primary">From</th>
                    <th className="px-4 py-2 text-primary">To</th>
                    <th className="px-4 py-2 text-primary">Amount</th>
                    <th className="px-4 py-2 text-primary">Fee</th>
                    <th className="px-4 py-2 text-primary">Status</th>
                    <th className="px-4 py-2 text-primary">Hash</th>
                    <th className="px-4 py-2 text-primary">Explorer</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <React.Fragment key={tx.hash}>
                      <tr
                        onClick={() => handleRowClick(tx)}
                        className={`
                          border-b border-primary/10 hover:bg-primary/5 cursor-pointer
                          ${selectedTx?.hash === tx.hash ? 'bg-primary/10' : ''}
                        `}
                      >
                        <td className="px-4 py-3 text-primary">{tx.type}</td>
                        <td className="px-4 py-3 text-text whitespace-nowrap">
                          {formatRippleTime(tx.date)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1 max-w-[200px] overflow-hidden">
                            <span className="font-mono text-sm truncate">{tx.sender}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(tx.sender, 'sender');
                              }}
                              className="p-1 hover:bg-primary/20 rounded transition-colors"
                            >
                              {copiedItem === `sender-${tx.sender}` ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-primary" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {tx.receiver && (
                            <div className="flex items-center space-x-1 max-w-[200px] overflow-hidden">
                              <span className="font-mono text-sm truncate">{tx.receiver}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(tx.receiver!, 'receiver');
                                }}
                                className="flex-shrink-0 p-1 hover:bg-primary hover:bg-opacity-20 rounded transition-colors"
                              >
                                {copiedItem === `receiver-${tx.receiver}` ? (
                                  <Check className="w-3 h-3 text-green-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-primary" />
                                )}
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-text">
                          {tx.amount ? `${tx.amount} XRP` : '-'}
                        </td>
                        <td className="px-4 py-3 text-text">{tx.fee} XRP</td>
                        <td className="px-4 py-3">
                          <span
                            className={`
                            px-2 py-1 rounded-full text-xs
                            ${
                              tx.result === 'tesSUCCESS'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }
                          `}
                          >
                            {tx.result}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1 max-w-[200px] overflow-hidden">
                            <span className="font-mono text-sm truncate">{tx.hash}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(tx.hash, 'hash');
                              }}
                              className="p-1 hover:bg-primary/20 rounded transition-colors"
                            >
                              {copiedItem === `hash-${tx.hash}` ? (
                                <Check className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-primary" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={getExplorerUrl(tx.hash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                      {selectedTx?.hash === tx.hash && tx.memos?.length > 0 && (
                        <tr>
                          <td colSpan={9} className="bg-background/30 px-4 py-3">
                            <div className="space-y-2">
                              <div className="text-text/70 text-sm mb-1">Memos</div>
                              {tx.memos.map((memo, index) => (
                                <div key={index} className="bg-background/30 p-2 rounded text-sm">
                                  {memo.data && <div className="break-all">{memo.data}</div>}
                                  {memo.type && (
                                    <div className="text-xs text-text/50 mt-1">
                                      Type: {memo.type}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Widget>
  );
};

export default TransactionHistory;
