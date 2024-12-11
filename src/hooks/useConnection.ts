```typescript
import { useState, useEffect } from 'react';
import { connectionManager, ConnectionState } from '../services/connection';
import { NetworkConfig } from '../types/network';

interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  network: NetworkConfig | null;
  state: ConnectionState;
}

export function useConnection() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: connectionManager.isConnected(),
    isConnecting: connectionManager.isConnecting(),
    error: connectionManager.getError(),
    network: connectionManager.getNetwork(),
    state: connectionManager.getState()
  });

  useEffect(() => {
    const handleStateChange = ({ currentState, error, network }: any) => {
      setStatus({
        isConnected: connectionManager.isConnected(),
        isConnecting: connectionManager.isConnecting(),
        error,
        network,
        state: currentState
      });
    };

    connectionManager.on('stateChange', handleStateChange);
    return () => {
      connectionManager.off('stateChange', handleStateChange);
    };
  }, []);

  return status;
}
```