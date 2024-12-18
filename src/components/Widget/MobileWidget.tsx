import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { LAYOUT } from '../../constants/layout';
import { useWidgetStore } from '../../store/widgetStore';

interface MobileWidgetProps {
  id: string;
  title: React.ReactNode;
  icon: any;
  children: React.ReactNode;
  onClose?: () => void;
}

export const MobileWidget: React.FC<MobileWidgetProps> = ({
  id,
  title,
  icon: Icon,
  children,
  onClose
}) => {
  const { widgets, updateWidget } = useWidgetStore();
  const widget = widgets.find(w => w.id === id);

  if (!widget) return null;

  const handleToggleMinimize = () => {
    updateWidget({
      ...widget,
      id,
      isMinimized: !widget.isMinimized
    });
  };

  const handleClose = () => {
    updateWidget({
      ...widget,
      id,
      isVisible: false
    });
    onClose?.();
  };

  return (
    <motion.div
      layout
      className="w-full bg-background border border-primary/30 rounded-lg overflow-hidden mb-3 mx-auto"
      style={{ maxWidth: window.innerWidth - (LAYOUT.MOBILE_PADDING * 2) }}
      animate={{
        height: widget.isMinimized ? LAYOUT.MOBILE_HEADER_ACTIONS_HEIGHT : widget.height
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div 
        className="flex items-center justify-between p-3 bg-primary/10 cursor-pointer"
        onClick={handleToggleMinimize}
      >
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-primary" />
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex items-center space-x-2">
          {widget.isMinimized ? (
            <ChevronDown className="w-5 h-5 text-primary" />
          ) : (
            <ChevronUp className="w-5 h-5 text-primary" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
          >
            <X className="w-4 h-4 text-primary" />
          </button>
        </div>
      </div>
      
      {!widget.isMinimized && (
        <div 
          className="overflow-auto"
          style={{ 
            height: widget.height - LAYOUT.MOBILE_HEADER_ACTIONS_HEIGHT,
            maxHeight: window.innerHeight - LAYOUT.HEADER_HEIGHT - LAYOUT.FOOTER_HEIGHT - LAYOUT.MOBILE_HEADER_ACTIONS_HEIGHT
          }}
        >
          {children}
        </div>
      )}
    </motion.div>
  );
};
