import { EventEmitter } from '../utils/EventEmitter';
import { balanceService } from './balance';
import { connectionManager } from './connection';

class BalanceManager extends EventEmitter {
  private static instance: BalanceManager;
  private currentAddress: string | null = null;
  private updateInterval: NodeJS.Timer | null = null;
  private unsubscribeFunction: (() => void) | null = null;
  private readonly UPDATE_INTERVAL = 10000; // 10 seconds
  private isUpdating = false;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;

  private constructor() {
    super();
    this.setupConnectionListeners();
  }

  static getInstance(): BalanceManager {
    if (!BalanceManager.instance) {
      BalanceManager.instance = new BalanceManager();
    }
    return BalanceManager.instance;
  }

  private setupConnectionListeners(): void {
    connectionManager.on('connected', async () => {
      if (this.currentAddress) {
        this.retryCount = 0;
        await this.startBalanceUpdates(this.currentAddress);
      }
    });

    connectionManager.on('disconnected', () => {
      this.stopBalanceUpdates();
    });
  }

  async startBalanceUpdates(address: string): Promise<void> {
    if (!address) {
      console.log('No address provided for balance updates');
      return;
    }

    // Stop any existing updates
    this.stopBalanceUpdates();

    this.currentAddress = address;
    this.retryCount = 0;

    try {
      if (!connectionManager.isConnected()) {
        console.log('Not connected to network, waiting for connection...');
        return;
      }

      console.log('Starting balance updates for:', address);

      // Initial balance check
      await this.checkBalance();

      // Set up subscription
      this.unsubscribeFunction = await balanceService.subscribeToBalanceUpdates(
        address,
        (newBalance, isActivated) => {
          console.log('Balance update received:', { newBalance, isActivated });
          this.retryCount = 0;
          this.emit('balance', newBalance, isActivated);
        }
      );

      // Set up polling as fallback
      this.updateInterval = setInterval(() => {
        if (!this.isUpdating) {
          this.checkBalance().catch(error => {
            console.error('Balance check failed:', error);
          });
        }
      }, this.UPDATE_INTERVAL);

      console.log('Balance updates started successfully');

    } catch (error) {
      console.error('Failed to start balance updates:', error);
      this.handleError();
    }
  }

  private async checkBalance(): Promise<void> {
    if (!this.currentAddress || !connectionManager.isConnected()) {
      return;
    }

    this.isUpdating = true;
    try {
      const { balance, isActivated } = await balanceService.getBalance(this.currentAddress);
      console.log('Balance checked:', { balance, isActivated });
      this.retryCount = 0;
      this.emit('balance', balance, isActivated);
    } catch (error) {
      console.error('Balance check failed:', error);
      this.handleError();
    } finally {
      this.isUpdating = false;
    }
  }

  private handleError(): void {
    this.retryCount++;
    if (this.retryCount >= this.MAX_RETRIES) {
      console.log('Max retry attempts reached, stopping balance updates');
      this.stopBalanceUpdates();
      this.emit('maxRetriesReached');
    }
  }

  stopBalanceUpdates(): void {
    console.log('Stopping balance updates');

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    if (this.unsubscribeFunction) {
      try {
        this.unsubscribeFunction();
      } catch (error) {
        console.error('Error unsubscribing from balance updates:', error);
      }
      this.unsubscribeFunction = null;
    }

    this.currentAddress = null;
    this.isUpdating = false;
    this.retryCount = 0;
  }
}

export const balanceManager = BalanceManager.getInstance();