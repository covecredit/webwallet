import React, { useEffect, useState } from 'react';
import { useNetworkStore } from '../../store/networkStore';
import { xrplService } from '../../services/xrpl';
import { Network, Server } from 'lucide-react';

interface ServerInfo {
  version: string;
  uptime: number;
  peers: number;
  completeLedgers: string;
  load: {
    jobTypes: { [key: string]: number };
  };
}

const NetworkInfo: React.FC = () => {
  const { selectedNetwork } = useNetworkStore();
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServerInfo = async () => {
      try {
        const client = xrplService.getClient();
        if (!client?.isConnected()) return;

        const response = await client.request({
          command: 'server_info'
        });

        const info = response.result.info;
        setServerInfo({
          version: info.build_version,
          uptime: info.uptime,
          peers: info.peers,
          completeLedgers: info.complete_ledgers,
          load: info.load
        });
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch server info:', error);
        setError(error.message || 'Failed to fetch server information');
      }
    };

    const interval = setInterval(fetchServerInfo, 10000);
    fetchServerInfo();

    return () => clearInterval(interval);
  }, [selectedNetwork]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-primary border-b border-primary border-opacity-30 pb-2">
        <Network className="w-5 h-5" />
        <h3 className="font-medium">Network Status</h3>
      </div>

      {error ? (
        <div className="p-3 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-background bg-opacity-50 rounded-lg border border-primary border-opacity-30">
            <span className="text-sm text-text text-opacity-70">Network</span>
            <span className="text-sm font-medium text-primary">{selectedNetwork.name}</span>
          </div>

          {serverInfo && (
            <>
              <div className="flex justify-between items-center p-3 bg-background bg-opacity-50 rounded-lg border border-primary border-opacity-30">
                <span className="text-sm text-text text-opacity-70">Version</span>
                <span className="text-sm font-medium text-primary">{serverInfo.version}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-background bg-opacity-50 rounded-lg border border-primary border-opacity-30">
                <span className="text-sm text-text text-opacity-70">Connected Peers</span>
                <span className="text-sm font-medium text-primary">{serverInfo.peers}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-background bg-opacity-50 rounded-lg border border-primary border-opacity-30">
                <span className="text-sm text-text text-opacity-70">Ledger Range</span>
                <span className="text-sm font-medium text-primary">{serverInfo.completeLedgers}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-background bg-opacity-50 rounded-lg border border-primary border-opacity-30">
                <span className="text-sm text-text text-opacity-70">Uptime</span>
                <span className="text-sm font-medium text-primary">
                  {Math.floor(serverInfo.uptime / 3600)}h {Math.floor((serverInfo.uptime % 3600) / 60)}m
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkInfo;