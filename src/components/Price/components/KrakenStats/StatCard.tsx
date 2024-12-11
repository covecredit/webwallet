import React from 'react';
import { StatCardProps } from './types';

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue }) => (
  <div className="bg-background/50 rounded-lg p-3 border border-primary/30">
    <div className="text-text/70 mb-1">{label}</div>
    <div className="text-lg font-bold text-primary">
      {value}
    </div>
    {subValue && (
      <div className="text-xs text-text/50">
        {subValue}
      </div>
    )}
  </div>
);