import { NetworkConfig } from '../../types/network';

export interface InitializationState {
  isLoading: boolean;
  error: string | null;
  status: string;
  retries: number;
}

export interface InitializationOptions {
  maxRetries?: number;
  retryDelay?: number;
  network: NetworkConfig;
}