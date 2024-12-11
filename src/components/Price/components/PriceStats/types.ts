import { PriceData } from '../../../../types';
import { ExchangeName } from '../../../../services/exchanges';

export interface PriceStatsProps {
  exchangeData: Record<string, PriceData[]>;
  selectedExchange: ExchangeName | 'All';
}

export interface StatCardProps {
  label: string;
  value: string | React.ReactNode;
}