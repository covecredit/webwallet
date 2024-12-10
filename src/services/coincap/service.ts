import { EventEmitter } from '../../utils/EventEmitter';
import type { CoinCapData, CoinCapResponse } from './types';

export class CoinCapService extends EventEmitter {
  private static instance: CoinCapService;
  private lastData: CoinCapData | null = null;
  private updateInterval: NodeJS.Timer | null = null;
  private readonly UPDATE_INTERVAL = 30000; // Increased to 30 seconds
  private readonly API_URL = 'https://api.coincap.io/v2/assets/xrp';
  private isConnected = false;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 5000;
  private abortController: AbortController | null = null;
  private lastFetchTime = 0;
  private readonly MIN_FETCH_INTERVAL = 10000; // Minimum 10 seconds between fetches

  private constructor() {
    super();
  }

  static getInstance(): CoinCapService {
    if (!CoinCapService.instance) {
      CoinCapService.instance = new CoinCapService();
    }
    return CoinCapService.instance;
  }

  connect(): void {
    if (this.isConnected) return;
    this.isConnected = true;
    this.startUpdates();
  }

  disconnect(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isConnected = false;
    this.lastData = null;
    this.retryCount = 0;
  }

  private startUpdates(): void {
    // Initial fetch with delay to prevent startup congestion
    setTimeout(() => this.updateData(), 2000);
    this.updateInterval = setInterval(() => this.updateData(), this.UPDATE_INTERVAL);
  }

  private async updateData(): Promise<void> {
    if (!this.isConnected) return;

    const now = Date.now();
    if (now - this.lastFetchTime < this.MIN_FETCH_INTERVAL) {
      return;
    }

    // Cancel any existing request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    try {
      this.lastFetchTime = now;
      const response = await fetch(this.API_URL, {
        signal: this.abortController.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { data }: CoinCapResponse = await response.json();
      
      if (data) {
        this.lastData = {
          rank: Number(data.rank),
          supply: Number(data.supply),
          maxSupply: Number(data.maxSupply),
          marketCapUsd: Number(data.marketCapUsd),
          volumeUsd24Hr: Number(data.volumeUsd24Hr),
          priceUsd: Number(data.priceUsd),
          changePercent24Hr: Number(data.changePercent24Hr),
          vwap24Hr: Number(data.vwap24Hr)
        };
        this.retryCount = 0;
        this.emit('update', this.lastData);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      console.error('Failed to fetch CoinCap data:', error);
      this.handleError(error);
    } finally {
      this.abortController = null;
    }
  }

  private handleError(error: any): void {
    this.emit('error', error);
    this.retryCount++;
    
    if (this.retryCount >= this.MAX_RETRIES) {
      this.disconnect();
      return;
    }

    // Exponential backoff for retries
    setTimeout(() => {
      if (this.isConnected) {
        this.updateData();
      }
    }, this.RETRY_DELAY * Math.pow(2, this.retryCount - 1));
  }

  async getXRPData(): Promise<CoinCapData | null> {
    if (!this.lastData) {
      await this.updateData();
    }
    return this.lastData;
  }
}