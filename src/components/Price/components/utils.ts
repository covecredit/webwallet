export function formatMarketValue(value: number | undefined, decimals = 2): string {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  if (value >= 1e9) return `$${(value / 1e9).toFixed(decimals)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(decimals)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(decimals)}K`;
  return `$${value.toFixed(decimals)}`;
}

export function formatPercentage(value: number | undefined): string {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}
