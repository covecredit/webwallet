import { Client } from 'xrpl';
import { EventEmitter } from '../../../utils/EventEmitter';
import { ConnectionState } from '../state';

export class ConnectionEventHandler extends EventEmitter {
  handleConnected(client: Client, setState: (state: ConnectionState) => void) {
    setState(ConnectionState.CONNECTED);
    this.emit('connected');
    console.log('Successfully connected to XRPL network');
  }

  handleDisconnected(setState: (state: ConnectionState) => void) {
    setState(ConnectionState.DISCONNECTED);
    this.emit('disconnected');
    console.log('Disconnected from XRPL network');
  }

  handleError(error: Error, setState: (state: ConnectionState) => void) {
    setState(ConnectionState.ERROR);
    this.emit('error', this.formatError(error));
    console.error('XRPL connection error:', error);
  }

  private formatError(error: any): Error {
    if (error?.message?.includes('timeout')) {
      return new Error('Connection timed out. Please check your network connection.');
    }
    if (error?.message?.includes('WebSocket')) {
      return new Error('WebSocket connection failed. The network may be unavailable.');
    }
    return new Error(error?.message || 'Failed to connect to XRPL network');
  }
}