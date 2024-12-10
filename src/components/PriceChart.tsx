import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceData {
  timestamp: number;
  price: number;
}

interface PriceChartProps {
  data: PriceData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  return (
    <div className="h-[200px] w-full bg-nautical-navy/50 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp);
              return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
            }}
            stroke="#C0C0C0"
          />
          <YAxis 
            stroke="#C0C0C0"
            domain={[0.4, 5.1]}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#001F3F',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '0.5rem',
              color: '#FFD700'
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#FFD700"
            fillOpacity={1}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;