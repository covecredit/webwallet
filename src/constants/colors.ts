export const GRAPH_COLORS = {
  WALLET: 'var(--primary)', // Gold color from theme
  TRANSACTION: '#4A90E2', // Blue
  LEDGER: '#32CD32', // Green
  PAYMENT: '#FF6B6B', // Coral red
  LINK: 'rgba(var(--primary-rgb), 0.2)', // Semi-transparent theme color
  PARTICLE: 'rgba(var(--primary-rgb), 0.6)' // More opaque theme color
} as const;

export const NODE_SIZES = {
  WALLET: 30,
  TRANSACTION: 20,
  LEDGER: 25,
  PAYMENT: 20
} as const;