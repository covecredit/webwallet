import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS } from '../../constants/layout';
import { DesktopWidget } from './DesktopWidget';
import { MobileWidget } from './MobileWidget';

interface WidgetProps {
  id: string;
  title: React.ReactNode;
  icon: any;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  onClose?: () => void;
}

const Widget: React.FC<WidgetProps> = (props) => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE}px)`);
  return isMobile ? <MobileWidget {...props} /> : <DesktopWidget {...props} />;
};

export default Widget;