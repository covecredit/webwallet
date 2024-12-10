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
    // Set widget to full width on mobile
    if (isMobile && widget) {
      updateWidget({
        ...widget,
        x: 0,
        y: widget.y,
        width: window.innerWidth,
        height: Math.min(window.innerHeight * 0.8, widget.height || defaultSize?.height || LAYOUT.MIN_WIDGET_HEIGHT)
      });
    }
  }, [isMobile]);

  const handleClick = () => {
    bringToFront(id);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (isMaximized || isMobile) return;
    
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

    const updatedWidget = validateWidgetPosition({
      ...widget,
      x: dragRef.current.offsetX + deltaX,
      y: dragRef.current.offsetY + deltaY
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
    if (!widget || isMobile) return;

    const newState = !isMaximized;
    setIsMaximized(newState);
    
    updateWidget({
      id,
      x: newState ? 0 : widget.x,
      y: newState ? LAYOUT.HEADER_HEIGHT : widget.y,
      width: newState ? window.innerWidth : (defaultSize?.width || LAYOUT.MIN_WIDGET_WIDTH),
      height: newState ? window.innerHeight - LAYOUT.HEADER_HEIGHT - LAYOUT.FOOTER_HEIGHT : (defaultSize?.height || LAYOUT.MIN_WIDGET_HEIGHT),
      isMaximized: newState
    });

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
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing]);

  if (!widget) return null;

  return (
    <div
      style={{
        position: isMobile ? 'relative' : 'absolute',
        left: isMobile ? 0 : widget.x,
        top: isMobile ? 0 : widget.y,
        width: isMobile ? '100%' : (widget.width || defaultSize?.width || LAYOUT.MIN_WIDGET_WIDTH),
        height: widget.height || defaultSize?.height || LAYOUT.MIN_WIDGET_HEIGHT,
        zIndex: widget.zIndex || 1,
        maxHeight: `calc(100vh - ${LAYOUT.HEADER_HEIGHT + LAYOUT.FOOTER_HEIGHT + 40}px)`,
        marginBottom: isMobile ? LAYOUT.FOOTER_HEIGHT + 20 : 0
      }}
      className="widget"
      onClick={handleClick}
    >
      <div
        className="flex items-center justify-between p-3 bg-primary-opacity border-b border-primary-opacity cursor-move"
        onMouseDown={handleDragStart}
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
          {!isMobile && (
            <button
              onClick={handleMaximize}
              className="p-1 hover:bg-primary-opacity rounded transition-colors"
            >
              <Square className="w-4 h-4 text-text" />
            </button>
          )}
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
      {!isMobile && !isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeStart}
        />
      )}
    </div>
  );
};

export default Widget;