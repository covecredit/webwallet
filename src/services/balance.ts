import { Client, dropsToXrp } from 'xrpl';
import { xrplService } from './xrpl';
import { EventEmitter } from '../utils/EventEmitter';

class BalanceService extends EventEmitter {
  private static instance: BalanceService;
  private subscriptions: Map<string, {
    unsubscribe: () => void;
    retryCount: number;
  }> = new Map();
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;
  private readonly BALANCE_CHECK_INTERVAL = 10000; // 10 seconds

  private constructor() {
    super();
  }

  static getInstance(): BalanceService {
    if (!BalanceService.instance) {
      BalanceService.instance = new BalanceService();
    }
    return BalanceService.instance;
  }

  async getBalance(address: string): Promise<{ balance: number; isActivated: boolean }> {
    const client = xrplService.getClient();
    if (!client?.isConnected()) {
      console.log('Not connected to network, returning 0 balance');
      return { balance: 0, isActivated: false };
    }

    try {
      const response = await client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });

      const balance = Number(dropsToXrp(response.result.account_data.Balance));
      return {
        balance,
        isActivated: balance >= 10
      };
    } catch (error: any) {
      if (error.data?.error === 'actNotFound') {
        console.log('Account not found (not activated):', address);
        return {
          balance: 0,
          isActivated: false
        };
      }
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async subscribeToBalanceUpdates(
    address: string,
    onUpdate: (balance: number, isActivated: boolean) => void
  ): Promise<() => void> {
    // Clean up existing subscription if any
    await this.unsubscribe(address);

    const client = xrplService.getClient();
    if (!client?.isConnected()) {
      console.log('Not connected to network, will retry when connected');
      return () => {};
    }

    try {
      // Get initial balance
      const { balance, isActivated } = await this.getBalance(address);
      onUpdate(balance, isActivated);

      // Set up periodic balance checks as fallback
      const intervalId = setInterval(async () => {
        try {
          const { balance, isActivated } = await this.getBalance(address);
          onUpdate(balance, isActivated);
        } catch (error) {
          console.error('Error during periodic balance check:', error);
        }
      }, this.BALANCE_CHECK_INTERVAL);

      // Subscribe to account
      await client.request({
        command: 'subscribe',
        accounts: [address]
      });

      // Set up transaction handler
      const handleTransaction = async (event: any) => {
        if (event.transaction.Account === address || event.transaction.Destination === address) {
          try {
            const { balance, isActivated } = await this.getBalance(address);
            onUpdate(balance, isActivated);
          } catch (error) {
            console.error('Error updating balance after transaction:', error);
          }
        }
      };

      // Add transaction listener
      client.on('transaction', handleTransaction);

      // Create unsubscribe function
      const unsubscribe = async () => {
        clearInterval(intervalId);
        client.off('transaction', handleTransaction);
        if (client.isConnected()) {
          try {
            await client.request({
              command: 'unsubscribe',
              accounts: [address]
            });
          } catch (error) {
            if (error?.name !== 'NotConnectedError' && error?.name !== 'DisconnectedError') {
              console.error('Error unsubscribing:', error);
            }
          }
        }
        this.subscriptions.delete(address);
      };

      // Store subscription
      this.subscriptions.set(address, {
        unsubscribe,
        retryCount: 0
      });

      return unsubscribe;
    } catch (error) {
      console.error('Failed to set up balance updates:', error);
      return () => {};
    }
  }

  private async unsubscribe(address: string): Promise<void> {
    const subscription = this.subscriptions.get(address);
    if (subscription) {
      try {
        await subscription.unsubscribe();
      } catch (error) {
        if (error?.name !== 'NotConnectedError' && error?.name !== 'DisconnectedError') {
          console.error('Error during unsubscribe:', error);
        }
      }
      this.subscriptions.delete(address);
    }
  }

  async unsubscribeAll(): Promise<void> {
    const addresses = Array.from(this.subscriptions.keys());
    await Promise.all(addresses.map(address => this.unsubscribe(address)));
  }
}

export const balanceService = BalanceService.getInstance();