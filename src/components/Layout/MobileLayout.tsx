import React from 'react';
import { LAYOUT } from '../../constants/layout';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  return (
    <main 
      className="relative z-10 flex-1 px-4"
      style={{
        paddingTop: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN,
        paddingBottom: LAYOUT.FOOTER_HEIGHT + LAYOUT.WIDGET_MARGIN,
        minHeight: `calc(100vh - ${LAYOUT.HEADER_HEIGHT + LAYOUT.FOOTER_HEIGHT}px)`
      }}
    >
      <div className="space-y-3">
        {children}
      </div>
    </main>
  );
};