import React, { useState } from 'react';
import { LineChart as ChartIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = Array.from({ length: 24 }, (_, i) => ({
  time: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  price: 0.60 + Math.random() * 0.1
}));

const PriceSection: React.FC = () => {
  const [timeframe] = useState('24H');

  return (
    <div className="bg-background/50 backdrop-blur-md p-6 rounded-lg border border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <ChartIcon className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-primary">XRP/USD</h2>
        </div>
        <div className="text-2xl font-bold text-primary">$0.60</div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time"
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              stroke="#FFD700"
            />
            <YAxis 
              stroke="#FFD700"
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1B26',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '8px'
              }}
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value: number) => [`$${value.toFixed(3)}`, 'Price']}
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
    </div>
  );
};

export default PriceSection;