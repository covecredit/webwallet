import React, { useState, useEffect } from 'react';
import { Copy, AlertTriangle, CheckCircle } from 'lucide-react';
import { xrplService } from '../../../services/xrpl';
import { dropsToXrp } from 'xrpl';
import { AccountInfoProps } from './types';
import { formatAccountInfo } from './utils';

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

  const handleCopyAddress = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="bg-background/50 rounded-lg border border-primary/30 p-4 space-y-4">
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : accountInfo && (
        <div className="space-y-4">
          {formatAccountInfo(accountInfo, handleCopyAddress, copiedAddress)}
        </div>
      )}
    </div>
  );
};

export default AccountInfo;