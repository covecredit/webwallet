import React from 'react';
import { motion } from 'framer-motion';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../../constants/layout';
import type { ExchangeName } from '../../../services/exchanges';

interface ExchangeSelectorProps {
  selectedExchange: ExchangeName | 'All';
  onExchangeChange: (exchange: ExchangeName | 'All') => void;
}

const ExchangeSelector: React.FC<ExchangeSelectorProps> = ({
  selectedExchange,
  onExchangeChange
}) => {
  const exchanges: (ExchangeName | 'All')[] = ['All', 'Bitfinex', 'Bitstamp', 'Kraken'];
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE}px)`);

  return (
    <div className="flex flex-wrap gap-2">
      {exchanges.map((exchange) => (
        <motion.button
          key={exchange}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onExchangeChange(exchange)}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            selectedExchange === exchange
              ? 'bg-primary text-background'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          } ${isMobile ? 'text-sm' : ''}`}
        >
          {exchange}
        </motion.button>
      ))}
    </div>
  );
};

export default ExchangeSelector;
