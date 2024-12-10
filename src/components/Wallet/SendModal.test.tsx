import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import SendModal from './SendModal';
import { xrplService } from '../../services/xrpl';
import { XRPLService } from './xrpl';
import { NetworkConfig } from '../types/network';

jest.mock('../../services/xrpl');
jest.mock('xrpl', () => ({
  Client: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    isConnected: jest.fn().mockReturnValue(false),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    disconnect: jest.fn(),
  })),
}));

describe('SendModal', () => {
  it('should close the modal on successful transaction', async () => {
    const onClose = jest.fn();
    xrplService.sendXRP.mockResolvedValue('mocked_hash');

    const { getByText, getByLabelText } = render(<SendModal onClose={onClose} />);

    fireEvent.change(getByLabelText(/address/i), { target: { value: 'rAddress' } });
    fireEvent.change(getByLabelText(/amount/i), { target: { value: '10' } });
    fireEvent.click(getByText(/send/i));

    await waitFor(() => fireEvent.click(getByText(/confirm/i)));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should show an error message on failed transaction', async () => {
    const onClose = jest.fn();
    xrplService.sendXRP.mockRejectedValue(new Error('Transaction failed'));

    const { getByText, getByLabelText, findByText } = render(<SendModal onClose={onClose} />);

    fireEvent.change(getByLabelText(/address/i), { target: { value: 'rAddress' } });
    fireEvent.change(getByLabelText(/amount/i), { target: { value: '10' } });
    fireEvent.click(getByText(/send/i));

    await waitFor(() => fireEvent.click(getByText(/confirm/i)));

    const errorMessage = await findByText(/failed to send xrp/i);
    expect(errorMessage).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('XRPLService', () => {
  let xrplService: XRPLService;
  const network: NetworkConfig = { id: 'testnet', name: 'Test Network', url: 'wss://testnet.xrpl-labs.com' };

  beforeEach(() => {
    xrplService = XRPLService.getInstance();
  });

  it('should retry connection on initial timeout', async () => {
    const connectSpy = jest.spyOn(xrplService, 'establishConnectionWithRetry');
    await xrplService.connect(network);
    expect(connectSpy).toHaveBeenCalled();
  });
});

const handleConfirmSend = async () => {
  try {
    setIsSending(true);
    setError(null);

    const amountNumber = Number(amount);
    const destinationTagNumber = destinationTag ? Number(destinationTag) : undefined;

    const hash = await xrplService.sendXRP(address, amountNumber, destinationTagNumber, fee);

    console.log('Transaction successful:', hash);
    setShowConfirmation(false); // Close the confirmation dialog
    onClose(); // Close the SendModal
  } catch (error: any) {
    console.error('Send failed:', error);
    setError(error.message || 'Failed to send XRP');
    setShowConfirmation(false);
  } finally {
    setIsSending(false);
  }
};

async connect(network: NetworkConfig): Promise<void> {
  if (this.connectionPromise) {
    return this.connectionPromise;
  }

  if (this.client?.isConnected() && this.network?.id === network.id) {
    return;
  }

  this.connectionPromise = this.establishConnectionWithRetry(network);

  try {
    await this.connectionPromise;
  } finally {
    this.connectionPromise = null;
  }
}

private async establishConnectionWithRetry(network: NetworkConfig, retries = 3, delay = 1000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await this.establishConnection(network);
      return;
    } catch (error) {
      console.error(`Connection attempt ${attempt} failed:`, error);
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw new Error('Failed to connect to network after multiple attempts.');
      }
    }
  }
}

private async establishConnection(network: NetworkConfig): Promise<void> {
  await this.disconnect();

  try {
    this.connectionAttempts++;
    console.log('Attempting to connect to', network.name);

    this.client = new Client(network.url, {
      timeout: 20000,
      connectionTimeout: 15000,
      retry: {
        maxAttempts: 3,
        minDelay: 1000,
        maxDelay: 5000,
      },
    });

    await new Promise<void>((resolve, reject) => {
      if (!this.client) {
        reject(new Error('Client not initialized'));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 20000);

      this.client.on('connected', () => {
        clearTimeout(timeoutId);
        this.connectionAttempts = 0;
        this.isReconnecting = false;
        console.log('Connected to', network.name);
        resolve();
      });

      this.client.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });

      this.client.connect().catch(reject);
    });

    this.network = network;
  } catch (error) {
    console.error('Connection error:', error);
    if (this.connectionAttempts < this.MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY));
      return this.establishConnection(network);
    }
    this.connectionAttempts = 0;
    throw new Error(
      'Failed to connect to network. Please try again or select a different network.'
    );
  }
}
