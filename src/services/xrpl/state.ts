import { NetworkConfig } from '../../types/network';
import { EventEmitter } from '../../utils/EventEmitter';

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

export class ConnectionStateManager extends EventEmitter {
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private network: NetworkConfig | null = null;
  private error: Error | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;

  setState(state: ConnectionState, error?: Error): void {
    const previousState = this.state;
    this.state = state;
    this.error = error || null;

    if (state === ConnectionState.ERROR) {
      this.reconnectAttempts++;
    } else if (state === ConnectionState.CONNECTED) {
      this.reconnectAttempts = 0;
    }

    this.emit('stateChange', {
      previousState,
      currentState: state,
      error: this.error,
      network: this.network,
      canReconnect: this.canReconnect()
    });
  }

  setNetwork(network: NetworkConfig | null): void {
    this.network = network;
  }

  getState(): ConnectionState {
    return this.state;
  }

  getError(): Error | null {
    return this.error;
  }

  getNetwork(): NetworkConfig | null {
    return this.network;
  }

  canReconnect(): boolean {
    return this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS;
  }

  resetReconnectAttempts(): void {
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  isConnecting(): boolean {
    return this.state === ConnectionState.CONNECTING || 
           this.state === ConnectionState.RECONNECTING;
  }

  hasError(): boolean {
    return this.state === ConnectionState.ERROR;
  }
}

export const connectionStateManager = new ConnectionStateManager();