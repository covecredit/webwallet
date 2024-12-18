import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage';
import { LAYOUT, BREAKPOINTS } from '../constants/layout';

export interface Widget {
  id: string;
  isVisible: boolean;
  isMinimized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface WidgetState {
  widgets: Widget[];
  updateWidget: (widget: Partial<Widget> & { id: string }) => void;
  bringToFront: (id: string) => void;
  organizeWidgets: () => void;
}

const isMobile = () => window.innerWidth <= BREAKPOINTS.MOBILE;

const getInitialWidgets = (): Widget[] => {
  const savedWidgets = loadFromStorage<Widget[]>(STORAGE_KEYS.WIDGETS);
  if (!savedWidgets?.length) {
    return [
      {
        id: 'wallet',
        isVisible: false,
        isMinimized: false,
        x: LAYOUT.WIDGET_MARGIN,
        y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN,
        width: 400,
        height: 500,
        zIndex: 1
      },
      {
        id: 'price',
        isVisible: false,
        isMinimized: false,
        x: 440,
        y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN,
        width: 1000,
        height: 600,
        zIndex: 1
      }
    ];
  }
  return savedWidgets;
};

const validatePosition = (widget: Widget): Widget => {
  if (isMobile()) {
    return {
      ...widget,
      x: LAYOUT.MOBILE_PADDING,
      width: window.innerWidth - (LAYOUT.MOBILE_PADDING * 2),
      height: Math.min(widget.height, window.innerHeight - LAYOUT.HEADER_HEIGHT - LAYOUT.FOOTER_HEIGHT)
    };
  }

  const maxX = window.innerWidth - widget.width;
  const maxY = window.innerHeight - widget.height - LAYOUT.FOOTER_HEIGHT;
  const minY = LAYOUT.HEADER_HEIGHT;

  return {
    ...widget,
    x: Math.max(0, Math.min(widget.x, maxX)),
    y: Math.max(minY, Math.min(widget.y, maxY)),
    width: Math.max(LAYOUT.MIN_WIDGET_WIDTH, Math.min(widget.width, window.innerWidth)),
    height: Math.max(LAYOUT.MIN_WIDGET_HEIGHT, Math.min(widget.height, window.innerHeight - LAYOUT.HEADER_HEIGHT - LAYOUT.FOOTER_HEIGHT))
  };
};

export const useWidgetStore = create<WidgetState>((set, get) => ({
  widgets: getInitialWidgets(),
  
  updateWidget: (widget) => set((state) => {
    const existingWidgetIndex = state.widgets.findIndex((w) => w.id === widget.id);
    let updatedWidgets: Widget[];
    
    if (existingWidgetIndex >= 0) {
      updatedWidgets = [...state.widgets];
      const updatedWidget = {
        ...updatedWidgets[existingWidgetIndex],
        ...widget
      };
      updatedWidgets[existingWidgetIndex] = validatePosition(updatedWidget);
    } else {
      const maxZIndex = Math.max(0, ...state.widgets.map((w) => w.zIndex));
      const newWidget = validatePosition({
        x: LAYOUT.WIDGET_MARGIN,
        y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN,
        width: isMobile() ? window.innerWidth - (LAYOUT.MOBILE_PADDING * 2) : 400,
        height: 500,
        zIndex: maxZIndex + 1,
        isVisible: true,
        isMinimized: false,
        ...widget
      } as Widget);
      
      updatedWidgets = [...state.widgets, newWidget];
    }
    
    saveToStorage(STORAGE_KEYS.WIDGETS, updatedWidgets);
    return { widgets: updatedWidgets };
  }),
  
  bringToFront: (id) => set((state) => {
    if (isMobile()) return state;
    
    const maxZIndex = Math.max(...state.widgets.map((w) => w.zIndex));
    const updatedWidgets = state.widgets.map((w) => ({
      ...w,
      zIndex: w.id === id ? maxZIndex + 1 : w.zIndex
    }));
    
    saveToStorage(STORAGE_KEYS.WIDGETS, updatedWidgets);
    return { widgets: updatedWidgets };
  }),
  
  organizeWidgets: () => set((state) => {
    let yOffset = LAYOUT.HEADER_HEIGHT;
    
    const updatedWidgets = state.widgets
      .filter(w => w.isVisible)
      .map((widget) => {
        const updatedWidget = validatePosition({
          ...widget,
          x: isMobile() ? LAYOUT.MOBILE_PADDING : widget.x,
          y: isMobile() ? yOffset : widget.y,
          width: isMobile() ? window.innerWidth - (LAYOUT.MOBILE_PADDING * 2) : widget.width,
          isMinimized: false
        });
        
        yOffset += updatedWidget.height + LAYOUT.MOBILE_WIDGET_SPACING;
        return updatedWidget;
      });
    
    saveToStorage(STORAGE_KEYS.WIDGETS, updatedWidgets);
    return { widgets: updatedWidgets };
  })
}));

// Handle window resize
if (typeof window !== 'undefined') {
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      useWidgetStore.getState().organizeWidgets();
    }, 100);
  });
}