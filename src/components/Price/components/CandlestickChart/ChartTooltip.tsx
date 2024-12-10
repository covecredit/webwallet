import React, { forwardRef } from 'react';

export const ChartTooltip = forwardRef<HTMLDivElement>((props, ref) => (
  <div
    ref={ref}
    className="absolute hidden z-50 bg-background bg-opacity-95 border border-primary border-opacity-30 rounded-lg p-2 text-sm pointer-events-none"
    style={{
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }}
  />
));

ChartTooltip.displayName = 'ChartTooltip';