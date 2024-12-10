export const STORAGE_PREFIX = 'cove_';

export const STORAGE_KEYS = {
  THEME: 'theme',
  WIDGETS: 'widgets',
  NETWORK: 'network',
  SEED: 'seed',
  SEARCH_HISTORY: 'search_history'
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;