import React, { useState, useEffect } from 'react';
import { Info, Copy, CheckCircle } from 'lucide-react';
import Widget from '../Widget/Widget';
import { useWalletStore } from '../../store/walletStore';
import { xrplService } from '../../services/xrpl';
import { formatRippleTime } from '../../utils/ripple';

interface AccountInfoWidget {
  onClose: () => void;
}

const AccountInfoWidget: React.FC<AccountInfoWidget> = ({ onClose }) => {
  const { address } = useWalletStore();
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  useEffect(() => {
    fetchAccountInfo();
  }, [address]);

  const fetchAccountInfo = async () => {
    if (!address) return;

    try {
      setLoading(true);
      setError(null);

      const client = xrplService.getClient();
      if (!client) throw new Error('Not connected to network');

      // Get comprehensive account information
      const [accountInfo, accountObjects, accountTx] = await Promise.all([
        client.request({
          command: 'account_info',
          account: address,
          ledger_index: 'validated',
          strict: true,
          signer_lists: true
        }),
        client.request({
          command: 'account_objects',
          account: address,
          ledger_index: 'validated',
          type: 'state'
        }),
        client.request({
          command: 'account_tx',
          account: address,
          ledger_index_min: -1,
          ledger_index_max: -1,
          limit: 1
        })
      ]);

      const info = {
        ...accountInfo.result.account_data,
        objects: accountObjects.result.account_objects,
        firstTransaction: accountTx.result.transactions[0]?.tx,
      };

      setAccountInfo(info);
    } catch (error: any) {
      console.error('Failed to fetch account info:', error);
      setError(error.message || 'Failed to fetch account information');
    } finally {
      setLoading(false);
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

  const renderField = (label: string, value: string | number | undefined, copyable = false) => {
    if (!value) return null;
    return (
      <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-primary/30">
        <span className="text-sm text-text/70">{label}</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-text">{value}</span>
          {copyable && (
            <button
              onClick={() => handleCopy(value.toString(), label)}
              className="p-1 hover:bg-primary/20 rounded transition-colors"
            >
              {copiedItem === `${label}-${value}` ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-primary" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Widget
      id="account-info"
      title="Account Information"
      icon={Info}
      defaultPosition={{ x: window.innerWidth - 420, y: 100 }}
      defaultSize={{ width: 400, height: 600 }}
      onClose={onClose}
    >
      <div className="p-4 space-y-4 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : accountInfo && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-primary border-b border-primary/30 pb-2">Basic Information</h3>
              {renderField('Address', accountInfo.Account, true)}
              {renderField('Sequence', accountInfo.Sequence)}
              {renderField('Owner Count', accountInfo.OwnerCount)}
              {renderField('Previous Transaction ID', accountInfo.PreviousTxnID, true)}
              {renderField('Previous Ledger', accountInfo.PreviousTxnLgrSeq)}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-primary border-b border-primary/30 pb-2">Account Settings</h3>
              {renderField('Account Type', accountInfo.AccountTxnID ? 'Regular Key Enabled' : 'Standard')}
              {renderField('Regular Key', accountInfo.RegularKey, true)}
              {renderField('Domain', accountInfo.Domain ? Buffer.from(accountInfo.Domain, 'hex').toString() : undefined)}
              {renderField('Email Hash', accountInfo.EmailHash)}
              {renderField('Message Key', accountInfo.MessageKey)}
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-primary border-b border-primary/30 pb-2">Flags & Requirements</h3>
              <div className="space-y-1">
                {[
                  { flag: 'lsfDefaultRipple', name: 'Default Ripple' },
                  { flag: 'lsfDepositAuth', name: 'Deposit Authorization Required' },
                  { flag: 'lsfDisableMaster', name: 'Master Key Disabled' },
                  { flag: 'lsfDisallowXRP', name: 'Disallow XRP' },
                  { flag: 'lsfGlobalFreeze', name: 'Global Freeze' },
                  { flag: 'lsfNoFreeze', name: 'No Freeze' },
                  { flag: 'lsfPasswordSpent', name: 'Password Spent' },
                  { flag: 'lsfRequireAuth', name: 'Authorization Required' },
                  { flag: 'lsfRequireDestTag', name: 'Destination Tag Required' },
                ].map(({ flag, name }) => (
                  <div key={flag} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${accountInfo.Flags & flag ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-sm text-text/70">{name}</span>
                  </div>
                ))}
              </div>
            </div>

            {accountInfo.firstTransaction && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-primary border-b border-primary/30 pb-2">Account History</h3>
                {renderField('Account Created', formatRippleTime(accountInfo.firstTransaction.date))}
                {renderField('Creation Transaction', accountInfo.firstTransaction.hash, true)}
                {renderField('Creation Ledger', accountInfo.firstTransaction.ledger_index)}
              </div>
            )}
          </div>
        )}
      </div>
    </Widget>
  );
};

export default AccountInfoWidget;