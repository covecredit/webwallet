import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { LAYOUT, BREAKPOINTS } from '../../constants/layout';
import { useWidgetStore } from '../../store/widgetStore';

export const MobileLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE}px)`);
  const { widgets } = useWidgetStore();
  
  if (!isMobile) return <>{children}</>;

  const visibleWidgets = widgets.filter(w => w.isVisible && !w.isMinimized);
  const totalHeight = visibleWidgets.reduce((acc, w) => acc + w.height + LAYOUT.MOBILE_WIDGET_SPACING, 0);

  return (
    <div 
      className="flex flex-col w-full overflow-x-hidden"
      style={{
        minHeight: `${totalHeight + LAYOUT.HEADER_HEIGHT + LAYOUT.FOOTER_HEIGHT}px`,
        paddingTop: LAYOUT.HEADER_HEIGHT,
        paddingBottom: LAYOUT.FOOTER_HEIGHT
      }}
    >
      {children}
    </div>
  );
};