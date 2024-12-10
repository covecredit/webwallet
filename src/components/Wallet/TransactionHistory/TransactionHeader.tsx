import React from 'react';
import { Copy, Check } from 'lucide-react';

interface TransactionHeaderProps {
  address: string;
  copiedItem: string | null;
  onCopy: (text: string, type: string) => void;
  onExport: () => void;
}

export const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  address,
  copiedItem,
  onCopy,
  onExport
}) => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center space-x-2">
      <h2 className="text-lg text-primary">Transaction History for</h2>
      <div className="flex items-center space-x-2">
        <span className="font-mono text-sm">{address}</span>
        <button
          onClick={() => onCopy(address, 'address')}
          className="p-1 hover:bg-primary hover:bg-opacity-20 rounded transition-colors"
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
      onClick={onExport}
      className="flex items-center space-x-2 px-3 py-1.5 bg-primary bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors text-primary"
    >
      <span>Export CSV</span>
    </button>
  </div>
);