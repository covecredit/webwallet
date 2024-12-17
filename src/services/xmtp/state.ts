import { EventEmitter } from '../../utils/EventEmitter';

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export class ConnectionStateManager extends EventEmitter {
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private error: Error | null = null;

  setState(state: ConnectionState, error?: Error): void {
    this.state = state;
    this.error = error || null;
    this.emit('stateChange', { state, error });
  }

  getState(): ConnectionState {
    return this.state;
  }

  getError(): Error | null {
    return this.error;
  }

  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  reset(): void {
    this.state = ConnectionState.DISCONNECTED;
    this.error = null;
  }
}

export const connectionStateManager = new ConnectionStateManager();