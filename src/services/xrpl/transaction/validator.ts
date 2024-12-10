import { Client } from 'xrpl';
import { ValidationResult } from './types';

export class TransactionValidator {
  constructor(private client: Client) {}

  async validateSourceAccount(address: string, amount: string): Promise<ValidationResult> {
    try {
      const response = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });

      const balance = Number(response.result.account_data.Balance) / 1000000; // Convert from drops
      const amountNum = parseFloat(amount);
      
      if (isNaN(amountNum)) {
        return {
          isValid: false,
          error: 'Invalid amount format'
        };
      }

      const requiredAmount = amountNum + 0.000012; // Add minimum fee

      if (balance < requiredAmount) {
        return {
          isValid: false,
          error: `Insufficient balance. Required: ${requiredAmount.toFixed(6)} XRP, Available: ${balance.toFixed(6)} XRP`
        };
      }

      return { isValid: true };
    } catch (error: any) {
      if (error.data?.error === 'actNotFound') {
        return {
          isValid: false,
          error: 'Source account not found or not activated'
        };
      }
      throw error;
    }
  }

  async validateDestinationAccount(address: string): Promise<ValidationResult> {
    try {
      await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });
      return { isValid: true };
    } catch (error: any) {
      if (error.data?.error === 'actNotFound') {
        return {
          isValid: false,
          error: 'Destination account not found or not activated'
        };
      }
      throw error;
    }
  }

  validateAmount(amount: string): ValidationResult {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      return {
        isValid: false,
        error: 'Please enter a valid amount'
      };
    }
    if (amountNum <= 0) {
      return {
        isValid: false,
        error: 'Amount must be greater than 0'
      };
    }
    // Check decimal places (6 decimals max for XRP)
    const decimalPlaces = amount.includes('.') ? amount.split('.')[1].length : 0;
    if (decimalPlaces > 6) {
      return {
        isValid: false,
        error: 'Amount cannot have more than 6 decimal places'
      };
    }
    return { isValid: true };
  }

  validateDestinationTag(tag?: string): ValidationResult {
    if (!tag) return { isValid: true };
    
    const tagNum = parseInt(tag, 10);
    if (isNaN(tagNum) || !Number.isInteger(tagNum) || tagNum < 0) {
      return {
        isValid: false,
        error: 'Invalid destination tag. Must be a positive integer.'
      };
    }
    return { isValid: true };
  }

  validateFee(fee: string): ValidationResult {
    const feeNum = parseFloat(fee);
    if (isNaN(feeNum)) {
      return {
        isValid: false,
        error: 'Invalid fee format'
      };
    }
    if (feeNum < 0.000012) {
      return {
        isValid: false,
        error: 'Fee must be at least 0.000012 XRP'
      };
    }
    // Check decimal places (6 decimals max for XRP)
    const decimalPlaces = fee.includes('.') ? fee.split('.')[1].length : 0;
    if (decimalPlaces > 6) {
      return {
        isValid: false,
        error: 'Fee cannot have more than 6 decimal places'
      };
    }
    return { isValid: true };
  }
}