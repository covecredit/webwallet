import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage';
import { LAYOUT } from '../constants/layout';

export interface Widget {
  id: string;
  isVisible: boolean;
  isMinimized?: boolean;
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
  validateWidgetPosition: (widget: Widget) => Widget;
}

const validatePosition = (widget: Widget): Widget => {
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

const getInitialWidgets = (): Widget[] => {
  const savedWidgets = loadFromStorage<Widget[]>(STORAGE_KEYS.WIDGETS) || [];
  if (savedWidgets.length === 0) {
    // Initialize default widgets
    return [
      {
        id: 'wallet',
        isVisible: true,
        x: LAYOUT.WIDGET_MARGIN,
        y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN,
        width: 400,
        height: 500,
        zIndex: 1
      },
      {
        id: 'price',
        isVisible: true,
        x: 440,
        y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN,
        width: 1000,
        height: 600,
        zIndex: 1
      }
    ];
  }
  return savedWidgets.map(widget => validatePosition(widget));
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
        x: widget.id === 'wallet' ? LAYOUT.WIDGET_MARGIN : 440,
        y: LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN,
        width: widget.id === 'wallet' ? 400 : 1000,
        height: widget.id === 'wallet' ? 500 : 600,
        zIndex: maxZIndex + 1,
        isVisible: true,
        ...widget
      } as Widget);
      
      updatedWidgets = [...state.widgets, newWidget];
    }
    
    saveToStorage(STORAGE_KEYS.WIDGETS, updatedWidgets);
    return { widgets: updatedWidgets };
  }),
  
  bringToFront: (id) => set((state) => {
    const maxZIndex = Math.max(...state.widgets.map((w) => w.zIndex));
    const updatedWidgets = state.widgets.map((w) => ({
      ...w,
      zIndex: w.id === id ? maxZIndex + 1 : w.zIndex
    }));
    saveToStorage(STORAGE_KEYS.WIDGETS, updatedWidgets);
    return { widgets: updatedWidgets };
  }),
  
  organizeWidgets: () => set((state) => {
    const updatedWidgets = state.widgets.map((widget) => {
      const defaultX = widget.id === 'wallet' ? LAYOUT.WIDGET_MARGIN : 440;
      const defaultY = LAYOUT.HEADER_HEIGHT + LAYOUT.WIDGET_MARGIN;
      
      return validatePosition({
        ...widget,
        x: defaultX,
        y: defaultY,
        isMinimized: false,
        width: widget.id === 'wallet' ? 400 : 1000,
        height: widget.id === 'wallet' ? 500 : 600
      });
    });
    
    saveToStorage(STORAGE_KEYS.WIDGETS, updatedWidgets);
    return { widgets: updatedWidgets };
  }),

  validateWidgetPosition: validatePosition
}));

// Handle window resize
if (typeof window !== 'undefined') {
  let resizeTimeout: NodeJS.Timeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const { widgets, validateWidgetPosition } = useWidgetStore.getState();
      const updatedWidgets = widgets.map(validateWidgetPosition);
      saveToStorage(STORAGE_KEYS.WIDGETS, updatedWidgets);
      useWidgetStore.setState({ widgets: updatedWidgets });
    }, 100);
  });
}