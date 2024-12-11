import React, { useState, useRef, useEffect } from 'react';
import { LucideIcon, Minus, Square, X } from 'lucide-react';
import { useWidgetStore } from '../../store/widgetStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { LAYOUT } from '../../constants/layout';

interface WidgetProps {
  id: string;
  title: React.ReactNode;
  icon: LucideIcon;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  onClose?: () => void;
}

const Widget: React.FC<WidgetProps> = ({
  id,
  title,
  icon: Icon,
  children,
  defaultPosition,
  defaultSize,
  onClose
}) => {
  const { widgets, updateWidget, bringToFront, validateWidgetPosition } = useWidgetStore();
  const widget = widgets.find(w => w.id === id);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    if (isMobile && widget) {
      const mobileWidth = window.innerWidth - (LAYOUT.MOBILE_PADDING * 2);
      const mobileHeight = Math.min(window.innerHeight * 0.8, widget.height || defaultSize?.height || LAYOUT.MIN_WIDGET_HEIGHT);
      
      updateWidget({
        ...widget,
        x: LAYOUT.MOBILE_PADDING,
        width: mobileWidth,
        height: mobileHeight,
        isMaximized: false
      });
    }
  }, [isMobile]);

  const handleClick = () => {
    bringToFront(id);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: widget?.x || 0,
      offsetY: widget?.y || 0
    };
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging || !widget) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    let newX = dragRef.current.offsetX + deltaX;
    let newY = dragRef.current.offsetY + deltaY;

    if (isMobile) {
      // On mobile, constrain to vertical movement only
      newX = LAYOUT.MOBILE_PADDING;
      newY = Math.max(LAYOUT.HEADER_HEIGHT, Math.min(newY, window.innerHeight - (widget.height || 0) - LAYOUT.FOOTER_HEIGHT));
    }

    const updatedWidget = validateWidgetPosition({
      ...widget,
      x: newX,
      y: newY
    });

    updateWidget(updatedWidget);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMaximized || isMobile) return;
    
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: widget?.width || defaultSize?.width || LAYOUT.MIN_WIDGET_WIDTH,
      startHeight: widget?.height || defaultSize?.height || LAYOUT.MIN_WIDGET_HEIGHT
    };
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !widget) return;

    const deltaX = e.clientX - resizeRef.current.startX;
    const deltaY = e.clientY - resizeRef.current.startY;

    const updatedWidget = validateWidgetPosition({
      ...widget,
      width: Math.max(LAYOUT.MIN_WIDGET_WIDTH, resizeRef.current.startWidth + deltaX),
      height: Math.max(LAYOUT.MIN_WIDGET_HEIGHT, resizeRef.current.startHeight + deltaY)
    });

    updateWidget(updatedWidget);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  const handleMaximize = () => {
    if (!widget) return;

    const newState = !isMaximized;
    setIsMaximized(newState);
    
    if (isMobile) {
      updateWidget({
        id,
        x: LAYOUT.MOBILE_PADDING,
        y: LAYOUT.HEADER_HEIGHT,
        width: window.innerWidth - (LAYOUT.MOBILE_PADDING * 2),
        height: window.innerHeight - LAYOUT.HEADER_HEIGHT - LAYOUT.FOOTER_HEIGHT,
        isMaximized: newState
      });
    } else {
      updateWidget({
        id,
        x: newState ? 0 : widget.x,
        y: newState ? LAYOUT.HEADER_HEIGHT : widget.y,
        width: newState ? window.innerWidth : (defaultSize?.width || LAYOUT.MIN_WIDGET_WIDTH),
        height: newState ? window.innerHeight - LAYOUT.HEADER_HEIGHT - LAYOUT.FOOTER_HEIGHT : (defaultSize?.height || LAYOUT.MIN_WIDGET_HEIGHT),
        isMaximized: newState
      });
    }

    bringToFront(id);
  };

  const handleMinimize = () => {
    updateWidget({
      id,
      isMinimized: true,
      isVisible: false
    });
  };

  const handleClose = () => {
    updateWidget({ id, isVisible: false });
    onClose?.();
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag as any);
      window.addEventListener('touchend', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDrag as any);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      window.addEventListener('touchmove', handleResize as any);
      window.addEventListener('touchend', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
        window.removeEventListener('touchmove', handleResize as any);
        window.removeEventListener('touchend', handleResizeEnd);
      };
    }
  }, [isResizing]);

  if (!widget) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: widget.x,
        top: widget.y,
        width: widget.width || defaultSize?.width || LAYOUT.MIN_WIDGET_WIDTH,
        height: widget.height || defaultSize?.height || LAYOUT.MIN_WIDGET_HEIGHT,
        zIndex: widget.zIndex || 1,
        maxHeight: `calc(100vh - ${LAYOUT.HEADER_HEIGHT + LAYOUT.FOOTER_HEIGHT + 40}px)`,
      }}
      className="widget"
      onClick={handleClick}
    >
      <div
        className="flex items-center justify-between p-3 bg-primary-opacity border-b border-primary-opacity cursor-move"
        onMouseDown={handleDragStart}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleDragStart({ clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent);
        }}
      >
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-primary" />
          <span className="text-text font-medium">{title}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-primary-opacity rounded transition-colors"
          >
            <Minus className="w-4 h-4 text-text" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-1 hover:bg-primary-opacity rounded transition-colors"
          >
            <Square className="w-4 h-4 text-text" />
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-primary-opacity rounded transition-colors"
          >
            <X className="w-4 h-4 text-text" />
          </button>
        </div>
      </div>
      <div className="overflow-auto" style={{ height: 'calc(100% - 48px)' }}>
        {children}
      </div>
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            handleResizeStart({ clientX: touch.clientX, clientY: touch.clientY } as React.MouseEvent);
          }}
        />
      )}
    </div>
  );
};

export default Widget;