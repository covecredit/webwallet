import React from 'react';
import { OrderBook as OrderBookType, Order } from '../types';

interface OrderBookProps {
  orderBook: OrderBookType;
  onOrderSelect?: (order: Order) => void;
}

const OrderBook: React.FC<OrderBookProps> = ({ orderBook, onOrderSelect }) => {
  const maxTotal = Math.max(
    ...orderBook.asks.map(o => o.total),
    ...orderBook.bids.map(o => o.total)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Order Book</h3>
        <div className="grid grid-cols-3 text-sm text-text/70 pb-2 border-b border-primary/30">
          <span>Price</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Total</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Asks */}
        <div className="space-y-1">
          {orderBook.asks.slice().reverse().map((ask, i) => (
            <OrderRow
              key={`ask-${i}`}
              order={ask}
              maxTotal={maxTotal}
              onClick={() => onOrderSelect?.(ask)}
            />
          ))}
        </div>

        {/* Current Price */}
        <div className="text-center py-2 border-y border-primary/30">
          <span className="text-lg font-medium text-primary">
            {orderBook.bids[0]?.price.toFixed(6)}
          </span>
        </div>

        {/* Bids */}
        <div className="space-y-1">
          {orderBook.bids.map((bid, i) => (
            <OrderRow
              key={`bid-${i}`}
              order={bid}
              maxTotal={maxTotal}
              onClick={() => onOrderSelect?.(bid)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const OrderRow: React.FC<{
  order: Order;
  maxTotal: number;
  onClick: () => void;
}> = ({ order, maxTotal, onClick }) => (
  <div
    onClick={onClick}
    className="relative grid grid-cols-3 text-sm py-1 cursor-pointer hover:bg-primary/10"
  >
    <span className={order.type === 'bid' ? 'text-green-400' : 'text-red-400'}>
      {order.price.toFixed(6)}
    </span>
    <span className="text-right">{order.amount.toFixed(2)}</span>
    <span className="text-right">{order.total.toFixed(2)}</span>
    <div
      className={`absolute left-0 top-0 bottom-0 ${
        order.type === 'bid' ? 'bg-green-400/10' : 'bg-red-400/10'
      }`}
      style={{
        width: `${(order.total / maxTotal) * 100}%`,
        zIndex: -1
      }}
    />
  </div>
);

export default OrderBook;
