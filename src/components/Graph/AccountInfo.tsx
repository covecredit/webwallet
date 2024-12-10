import React, { useState, useEffect } from 'react';
import { Copy, AlertTriangle, CheckCircle } from 'lucide-react';
import { xrplService } from '../../services/xrpl';
import { dropsToXrp } from 'xrpl';

interface AccountInfoProps {
  selectedNode: any;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ selectedNode }) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccountInfo = async () => {
      if (!selectedNode?.id) return;
      if (selectedNode.type !== 'wallet') return;

      try {
        setLoading(true);
        setError(null);
        const client = xrplService.getClient();
        if (!client) throw new Error('Not connected to network');

        const [accountInfo, accountLines] = await Promise.all([
          client.request({
            command: 'account_info',
            account: selectedNode.id,
            ledger_index: 'validated'
          }),
          client.request({
            command: 'account_lines',
            account: selectedNode.id,
            ledger_index: 'validated'
          })
        ]);

        setAccountInfo({
          ...accountInfo.result.account_data,
          lines: accountLines.result.lines
        });
      } catch (error: any) {
        console.error('Failed to fetch account info:', error);
        setError(error.message || 'Failed to fetch account information');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountInfo();
  }, [selectedNode?.id]);

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  if (!selectedNode) {
    return (
      <div className="bg-background/50 rounded-lg border border-primary/30 p-4">
        <div className="text-text/50 text-center">
          Select a node to view information
        </div>
      </div>
    );
  }

  if (selectedNode.type === 'transaction') {
    const txData = selectedNode.data;
    if (!txData) return null;

    return (
      <div className="bg-background/50 rounded-lg border border-primary/30 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-primary">Transaction Details</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-text/70">Type</span>
            <span className="text-text">{txData.TransactionType}</span>
          </div>

          {txData.Amount && (
            <div className="flex justify-between items-center">
              <span className="text-text/70">Amount</span>
              <span className="text-primary">
                {dropsToXrp(txData.Amount)} XRP
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-text/70">From</span>
            <div className="flex items-center space-x-2">
              <span className="text-text font-mono">{txData.Account}</span>
              <button
                onClick={() => handleCopyAddress(txData.Account)}
                className="p-1 hover:bg-primary/20 rounded transition-colors"
                title="Copy Address"
              >
                <Copy className="w-4 h-4 text-primary" />
              </button>
              {copiedAddress === txData.Account && (
                <span className="text-green-400 text-sm">Copied!</span>
              )}
            </div>
          </div>

          {txData.Destination && (
            <div className="flex justify-between items-center">
              <span className="text-text/70">To</span>
              <div className="flex items-center space-x-2">
                <span className="text-text font-mono">{txData.Destination}</span>
                <button
                  onClick={() => handleCopyAddress(txData.Destination)}
                  className="p-1 hover:bg-primary/20 rounded transition-colors"
                  title="Copy Address"
                >
                  <Copy className="w-4 h-4 text-primary" />
                </button>
                {copiedAddress === txData.Destination && (
                  <span className="text-green-400 text-sm">Copied!</span>
                )}
              </div>
            </div>
          )}

          {txData.DestinationTag !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-text/70">Destination Tag</span>
              <span className="text-text">{txData.DestinationTag}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-text/70">Fee</span>
            <span className="text-text">{dropsToXrp(txData.Fee)} XRP</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-text/70">Sequence</span>
            <span className="text-text">{txData.Sequence}</span>
          </div>

          {txData.Memos?.length > 0 && (
            <div className="border-t border-primary/10 pt-3">
              <h4 className="text-sm font-medium text-primary mb-2">Memos</h4>
              <div className="space-y-2">
                {txData.Memos.map((memo: any, index: number) => (
                  <div key={index} className="bg-background/30 p-2 rounded">
                    {memo.Memo.MemoData && (
                      <div className="text-sm break-all">
                        {Buffer.from(memo.Memo.MemoData, 'hex').toString('utf8')}
                      </div>
                    )}
                    {memo.Memo.MemoType && (
                      <div className="text-xs text-text/50 mt-1">
                        Type: {Buffer.from(memo.Memo.MemoType, 'hex').toString('utf8')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-background/50 rounded-lg border border-primary/30 p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background/50 rounded-lg border border-primary/30 p-4">
        <div className="text-red-500 text-sm text-center">{error}</div>
      </div>
    );
  }

  const isActivated = accountInfo && Number(accountInfo.Balance) >= 10000000; // 10 XRP
  const hasRegularKey = accountInfo && accountInfo.RegularKey;
  const hasMasterKeyDisabled = accountInfo && (accountInfo.Flags & 0x00100000) !== 0;
  const requiresDestTag = accountInfo && (accountInfo.Flags & 0x00020000) !== 0;
  const requiresAuth = accountInfo && (accountInfo.Flags & 0x00040000) !== 0;
  const disallowXRP = accountInfo && (accountInfo.Flags & 0x00080000) !== 0;
  const trustLines = accountInfo?.lines?.length || 0;

  return (
    <div className="bg-background/50 rounded-lg border border-primary/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-primary">Account Details</h3>
        <div className="flex items-center space-x-2">
          {isActivated ? (
            <div className="flex items-center space-x-1 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Activated</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-red-400">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">Not Activated</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-text/70">Address</span>
          <div className="flex items-center space-x-2">
            <span className="text-text font-mono">{selectedNode.id}</span>
            <button
              onClick={() => handleCopyAddress(selectedNode.id)}
              className="p-1 hover:bg-primary/20 rounded transition-colors"
              title="Copy Address"
            >
              <Copy className="w-4 h-4 text-primary" />
            </button>
            {copiedAddress === selectedNode.id && (
              <span className="text-green-400 text-sm">Copied!</span>
            )}
          </div>
        </div>

        {accountInfo && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-text/70">Balance</span>
              <span className="text-primary">
                {(Number(accountInfo.Balance) / 1000000).toFixed(6)} XRP
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-text/70">Sequence Number</span>
              <span className="text-text">{accountInfo.Sequence}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-text/70">Owner Count</span>
              <span className="text-text">{accountInfo.OwnerCount}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-text/70">Trust Lines</span>
              <span className="text-text">{trustLines}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-text/70">Previous Transaction</span>
              <span className="text-text font-mono text-sm">
                {accountInfo.PreviousTxnID?.slice(0, 8)}...{accountInfo.PreviousTxnID?.slice(-8)}
              </span>
            </div>

            <div className="border-t border-primary/10 pt-3">
              <h4 className="text-sm font-medium text-primary mb-2">Security Settings</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-text/70">Master Key</span>
                  <span className={hasMasterKeyDisabled ? 'text-red-400' : 'text-green-400'}>
                    {hasMasterKeyDisabled ? 'Disabled' : 'Enabled'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text/70">Regular Key</span>
                  <span className={hasRegularKey ? 'text-green-400' : 'text-text/50'}>
                    {hasRegularKey ? 'Set' : 'Not Set'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text/70">Require Destination Tag</span>
                  <span className={requiresDestTag ? 'text-green-400' : 'text-text/50'}>
                    {requiresDestTag ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text/70">Require Authorization</span>
                  <span className={requiresAuth ? 'text-primary' : 'text-text/50'}>
                    {requiresAuth ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text/70">Disallow XRP</span>
                  <span className={disallowXRP ? 'text-red-400' : 'text-green-400'}>
                    {disallowXRP ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountInfo;