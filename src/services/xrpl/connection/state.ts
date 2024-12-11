export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export interface ConnectionStatus {
  state: ConnectionState;
  error?: Error;
  lastAttempt?: Date;
  retryCount: number;
}

export class ConnectionStateTracker {
  private status: ConnectionStatus = {
    state: ConnectionState.DISCONNECTED,
    retryCount: 0
  };

  setState(state: ConnectionState, error?: Error): void {
    this.status = {
      ...this.status,
      state,
      error,
      lastAttempt: new Date()
    };
  }

  getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  incrementRetry(): void {
    this.status.retryCount++;
  }

  reset(): void {
    this.status = {
      state: ConnectionState.DISCONNECTED,
      retryCount: 0
    };
  }
}