import React, { useState } from 'react';
import { OrderType, TokenPair } from '../types';

interface PlaceOrderProps {
  pair: TokenPair | null;
  onSubmit: (params: {
    type: OrderType;
    side: 'buy' | 'sell';
    amount: number;
    price?: number;
  }) => void;
}

const PlaceOrder: React.FC<PlaceOrderProps> = ({ pair, onSubmit }) => {
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');

  if (!pair) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text/70">Select a token pair to place an order</div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = {
      type: orderType,
      side,
      amount: Number(amount),
      price: orderType === 'limit' ? Number(price) : undefined
    };
    onSubmit(params);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex space-x-2">
        {(['limit', 'market', 'send'] as OrderType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setOrderType(type)}
            className={`flex-1 px-4 py-2 rounded-lg capitalize transition-colors ${
              orderType === type
                ? 'bg-primary text-background'
                : 'bg-primary/20 hover:bg-primary/30'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setSide('buy')}
          className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
            side === 'buy'
              ? 'bg-green-500 text-background'
              : 'bg-green-500/20 hover:bg-green-500/30'
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide('sell')}
          className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
            side === 'sell'
              ? 'bg-red-500 text-background'
              : 'bg-red-500/20 hover:bg-red-500/30'
          }`}
        >
          Sell
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm text-text/70">Amount ({pair.baseToken})</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg"
          placeholder="0.00"
          step="any"
          required
        />
      </div>

      {orderType === 'limit' && (
        <div className="space-y-2">
          <label className="block text-sm text-text/70">Price ({pair.quoteToken})</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 bg-background/50 border border-primary/30 rounded-lg"
            placeholder="0.00"
            step="any"
            required
          />
        </div>
      )}

      <button
        type="submit"
        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
          side === 'buy'
            ? 'bg-green-500 hover:bg-green-600 text-background'
            : 'bg-red-500 hover:bg-red-600 text-background'
        }`}
      >
        {side === 'buy' ? 'Buy' : 'Sell'} {pair.baseToken}
      </button>
    </form>
  );
};

export default PlaceOrder;