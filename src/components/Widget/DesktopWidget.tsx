import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';
import { useWidgetStore } from '../../store/widgetStore';
import { LAYOUT } from '../../constants/layout';

interface DesktopWidgetProps {
  id: string;
  title: React.ReactNode;
  icon: any;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  onClose?: () => void;
}

export const DesktopWidget: React.FC<DesktopWidgetProps> = ({
  id,
  title,
  icon: Icon,
  children,
  defaultPosition,
  defaultSize,
  onClose
}) => {
  const { widgets, updateWidget, bringToFront } = useWidgetStore();
  const widget = widgets.find(w => w.id === id);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, offsetX: 0, offsetY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });

  useEffect(() => {
    if (!widget?.isVisible) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragRef.current.startX;
        const deltaY = e.clientY - dragRef.current.startY;
        updateWidget({
          id,
          x: dragRef.current.offsetX + deltaX,
          y: dragRef.current.offsetY + deltaY
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeRef.current.startX;
        const deltaY = e.clientY - resizeRef.current.startY;
        updateWidget({
          id,
          width: Math.max(LAYOUT.MIN_WIDGET_WIDTH, resizeRef.current.startWidth + deltaX),
          height: Math.max(LAYOUT.MIN_WIDGET_HEIGHT, resizeRef.current.startHeight + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, id, updateWidget]);

  if (!widget?.isVisible) return null;

  const handleDragStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offsetX: widget.x,
      offsetY: widget.y
    };
    bringToFront(id);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.stopPropagation();
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: widget.width,
      startHeight: widget.height
    };
    bringToFront(id);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    if (!isMaximized) {
      updateWidget({
        id,
        x: 0,
        y: LAYOUT.HEADER_HEIGHT,
        width: window.innerWidth,
        height: window.innerHeight - LAYOUT.HEADER_HEIGHT - LAYOUT.FOOTER_HEIGHT
      });
    } else {
      updateWidget({
        id,
        x: defaultPosition?.x || 0,
        y: defaultPosition?.y || LAYOUT.HEADER_HEIGHT,
        width: defaultSize?.width || LAYOUT.MIN_WIDGET_WIDTH,
        height: defaultSize?.height || LAYOUT.MIN_WIDGET_HEIGHT
      });
    }
  };

  return (
    <div
      className="fixed widget"
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: widget.zIndex
      }}
    >
      <div
        className="flex items-center justify-between p-3 bg-primary/10 border-b border-primary/30 cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-primary" />
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => updateWidget({ id, isMinimized: true })}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
          >
            <Minus className="w-4 h-4 text-text" />
          </button>
          <button
            onClick={handleMaximize}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
          >
            <Square className="w-4 h-4 text-text" />
          </button>
          <button
            onClick={() => {
              updateWidget({ id, isVisible: false });
              onClose?.();
            }}
            className="p-1 hover:bg-primary/20 rounded transition-colors"
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
        />
      )}
    </div>
  );
};