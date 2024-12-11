import { useState, useCallback } from 'react';
import { xrplService } from '../services/xrpl';
import { NetworkConfig } from '../types/network';
import { useNetworkStore } from '../store/networkStore';

export function useXRPLConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { selectedNetwork } = useNetworkStore();

  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      await xrplService.connect(selectedNetwork);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [selectedNetwork]);

  const disconnect = useCallback(async () => {
    try {
      await xrplService.disconnect();
      setError(null);
    } catch (err: any) {
      setError(err);
      throw err;
    }
  }, []);

  return {
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: xrplService.isConnected()
  };
}