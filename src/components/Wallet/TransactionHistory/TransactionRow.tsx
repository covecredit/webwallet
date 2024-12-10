import React from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { NetworkType } from '../../../types/network';
import { Transaction } from './types';
import { formatRippleTime } from '../../../utils/ripple';
import { getExplorerUrl } from './utils';

interface TransactionRowProps {
  tx: Transaction;
  isSelected: boolean;
  networkType: NetworkType;
  copiedItem: string | null;
  onCopy: (text: string, type: string) => void;
  onClick: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  tx,
  isSelected,
  networkType,
  copiedItem,
  onCopy,
  onClick,
}) => (
  <React.Fragment>
    <tr
      onClick={onClick}
      className={`
        border-b border-primary border-opacity-10 hover:bg-primary hover:bg-opacity-5 cursor-pointer
        ${isSelected ? 'bg-primary bg-opacity-10' : ''}
      `}
    >
      <td className="px-4 py-3 text-primary">{tx.type}</td>
      <td className="px-4 py-3 text-text whitespace-nowrap">{formatRippleTime(tx.date)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-1 max-w-[200px] overflow-hidden">
          <span className="font-mono text-sm truncate">{tx.sender}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy(tx.sender, 'sender');
            }}
            className="flex-shrink-0 p-1 hover:bg-primary hover:bg-opacity-20 rounded transition-colors"
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
                onCopy(tx.receiver!, 'receiver');
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
      <td className="px-4 py-3 text-text">{tx.amount ? `${tx.amount} XRP` : '-'}</td>
      <td className="px-4 py-3 text-text">{tx.fee} XRP</td>
      <td className="px-4 py-3">
        <span
          className={`
          px-2 py-1 rounded-full text-xs
          ${
            tx.result === 'tesSUCCESS'
              ? 'bg-green-500 bg-opacity-20 text-green-400'
              : 'bg-red-500 bg-opacity-20 text-red-400'
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
              onCopy(tx.hash, 'hash');
            }}
            className="flex-shrink-0 p-1 hover:bg-primary hover:bg-opacity-20 rounded transition-colors"
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
          href={getExplorerUrl(tx.hash, networkType)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-primary hover:text-primary/80"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </td>
    </tr>
    {isSelected && tx.memos?.length > 0 && (
      <tr>
        <td colSpan={9} className="bg-background bg-opacity-30 px-4 py-3">
          <div className="space-y-2">
            <div className="text-text text-opacity-70 text-sm mb-1">Memos</div>
            {tx.memos.map((memo, index) => (
              <div key={index} className="bg-background bg-opacity-30 p-2 rounded text-sm">
                {memo.data && <div className="break-all">{memo.data}</div>}
                {memo.type && (
                  <div className="text-xs text-text text-opacity-50 mt-1">Type: {memo.type}</div>
                )}
              </div>
            ))}
          </div>
        </td>
      </tr>
    )}
  </React.Fragment>
);
