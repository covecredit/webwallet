import React from 'react';
import { Copy, CheckCircle } from 'lucide-react';
import { dropsToXrp } from 'xrpl';
import { AccountData } from './types';

export function formatAccountInfo(
  accountInfo: AccountData,
  onCopy: (text: string) => void,
  copiedAddress: string | null
) {
  const isActivated = Number(accountInfo.Balance) >= 10000000; // 10 XRP
  const hasRegularKey = accountInfo.RegularKey;
  const hasMasterKeyDisabled = (accountInfo.Flags & 0x00100000) !== 0;
  const requiresDestTag = (accountInfo.Flags & 0x00020000) !== 0;
  const requiresAuth = (accountInfo.Flags & 0x00040000) !== 0;
  const disallowXRP = (accountInfo.Flags & 0x00080000) !== 0;
  const trustLines = accountInfo.lines?.length || 0;

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-primary border-b border-primary/30 pb-2">
          Basic Information
        </h3>
        {renderField('Address', accountInfo.Account, true, onCopy, copiedAddress)}
        {renderField('Balance', `${dropsToXrp(accountInfo.Balance)} XRP`)}
        {renderField('Sequence', accountInfo.Sequence)}
        {renderField('Owner Count', accountInfo.OwnerCount)}
        {renderField('Trust Lines', trustLines)}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-primary border-b border-primary/30 pb-2">
          Account Settings
        </h3>
        {renderFlags({
          isActivated,
          hasRegularKey,
          hasMasterKeyDisabled,
          requiresDestTag,
          requiresAuth,
          disallowXRP
        })}
      </div>
    </>
  );
}

function renderField(
  label: string,
  value: string | number,
  copyable = false,
  onCopy?: (text: string) => void,
  copiedAddress?: string | null
) {
  return (
    <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-primary/30">
      <span className="text-sm text-text/70">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-text">{value}</span>
        {copyable && onCopy && (
          <button
            onClick={() => onCopy(value.toString())}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
          >
            {copiedAddress === value.toString() ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-primary" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function renderFlags(flags: {
  isActivated: boolean;
  hasRegularKey: boolean;
  hasMasterKeyDisabled: boolean;
  requiresDestTag: boolean;
  requiresAuth: boolean;
  disallowXRP: boolean;
}) {
  return (
    <div className="space-y-1">
      {Object.entries(flags).map(([flag, value]) => (
        <div key={flag} className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-sm text-text/70">{formatFlagName(flag)}</span>
        </div>
      ))}
    </div>
  );
}

function formatFlagName(flag: string): string {
  return flag
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}