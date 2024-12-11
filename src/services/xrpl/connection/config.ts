export const CONNECTION_CONFIG = {
  TIMEOUT: 20000,
  CONNECTION_TIMEOUT: 15000,
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY: 5000,
  MAX_RETRY_DELAY: 30000,
  RETRY: {
    maxAttempts: 3,
    minDelay: 1000,
    maxDelay: 5000
  }
} as const;

export const WEBSOCKET_PROTOCOLS = [
  'wss://',
  'ws://',
  'wss+unix://',
  'ws+unix://'
] as const;