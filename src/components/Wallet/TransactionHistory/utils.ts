import { Transaction } from './types';
import { formatRippleTimeForCSV } from '../../../utils/ripple';

export const exportTransactionsToCSV = (transactions: Transaction[], address: string): void => {
  const headers = ['Type', 'Timestamp', 'Amount', 'Fee', 'From', 'To', 'Status', 'Hash'];
  
  const csvData = transactions.map(tx => [
    tx.type,
    formatRippleTimeForCSV(tx.date),
    tx.amount ? `${tx.amount} XRP` : '-',
    `${tx.fee} XRP`,
    tx.sender,
    tx.receiver || '-',
    tx.result,
    tx.hash
  ]);

  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `xrpl-transactions-${address}-${Date.now()}.csv`;
  link.click();
};