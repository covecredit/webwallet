export function formatValue(value: number | undefined): string {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return value.toFixed(4);
}

export function formatVolume(volume: number | undefined): string {
  if (typeof volume !== 'number' || isNaN(volume)) return 'N/A';
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(2)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(2)}K`;
  return volume.toFixed(2);
}