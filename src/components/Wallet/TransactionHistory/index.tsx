import React, { useState } from 'react';
import { History } from 'lucide-react';
import Widget from '../../Widget/Widget';
import { useWalletStore } from '../../../store/walletStore';
import { LAYOUT } from '../../../constants/layout';
import { useNetworkStore } from '../../../store/networkStore';
import { Transaction } from './types';
import { TransactionRow } from './TransactionRow';
import { TransactionHeader } from './TransactionHeader';
import { LoadingState } from './LoadingState';
import { exportToCSV } from './utils';
import { useTransactions } from './hooks/useTransactions';
import { useCopyToClipboard } from './hooks/useCopyToClipboard';
import { TABLE_HEADERS } from './constants';

interface TransactionHistoryProps {
  onClose: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onClose }) => {
  const { address } = useWalletStore();
  const { selectedNetwork } = useNetworkStore();
  const { transactions, loading, error } = useTransactions(address);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const { copiedItem, handleCopy } = useCopyToClipboard();

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(selectedTx?.hash === tx.hash ? null : tx);
  };

  return (
    <Widget
      id="history"
      title="Transaction History"
      icon={History}
      defaultPosition={{ x: window.innerWidth - 340, y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN }}
      defaultSize={{ width: 800, height: 600 }}
      onClose={onClose}
    >
      <div className="flex flex-col h-full">
        <TransactionHeader 
          address={address}
          copiedItem={copiedItem}
          onCopy={handleCopy}
          onExport={() => exportToCSV(transactions, address)}
        />

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <div className="p-4 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center text-text text-opacity-50 p-4">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100%-2rem)]">
              <table className="w-full">
                <thead className="sticky top-0 bg-background z-10">
                  <tr className="text-left border-b border-primary border-opacity-30">
                    {TABLE_HEADERS.map(header => (
                      <th key={header.key} className="px-4 py-2 text-primary">
                        {header.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <TransactionRow
                      key={tx.hash}
                      tx={tx}
                      isSelected={selectedTx?.hash === tx.hash}
                      networkType={selectedNetwork.type}
                      copiedItem={copiedItem}
                      onCopy={handleCopy}
                      onClick={() => handleRowClick(tx)}
                    />
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