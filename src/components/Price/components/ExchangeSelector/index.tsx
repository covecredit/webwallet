import React from 'react';
import { motion } from 'framer-motion';
import { ExchangeSelectorProps } from './types';

const ExchangeSelector: React.FC<ExchangeSelectorProps> = ({
  selectedExchange,
  onExchangeChange
}) => {
  const exchanges = ['All', 'Bitfinex', 'Bitstamp', 'Kraken'];

  return (
    <div className="flex space-x-2">
      {exchanges.map((exchange) => (
        <motion.button
          key={exchange}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onExchangeChange(exchange as any)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedExchange === exchange
              ? 'bg-primary text-background'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          }`}
        >
          {exchange}
        </motion.button>
      ))}
    </div>
  );
};

export default ExchangeSelector;