import { CoinCapService } from './service';
import type { CoinCapData, CoinCapResponse } from './types';

export const coincapService = CoinCapService.getInstance();
export type { CoinCapData, CoinCapResponse };