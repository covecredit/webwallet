import { ExchangeName } from '../../../../services/exchanges';

export interface ExchangeSelectorProps {
  selectedExchange: ExchangeName | 'All';
  onExchangeChange: (exchange: ExchangeName | 'All') => void;
}