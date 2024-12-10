import React from 'react';
import { Anchor, Activity, LineChart, Tent, Wrench, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWidgetStore } from '../../store/widgetStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface AppBarProps {
  isMenuOpen: boolean;
}

const AppBar: React.FC<AppBarProps> = ({ isMenuOpen }) => {
  const { widgets, updateWidget } = useWidgetStore();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleAppClick = (id: string) => {
    const widget = widgets.find(w => w.id === id);
    const maxZIndex = Math.max(...widgets.map(w => w.zIndex), 0);
    
    updateWidget({
      id,
      isVisible: !widget?.isVisible,
      isMinimized: false,
      x: widget?.x || (id === 'wallet' ? 20 : 440),
      y: widget?.y || 100,
      width: widget?.width || (id === 'wallet' ? 400 : 1000),
      height: widget?.height || (id === 'wallet' ? 500 : 600),
      zIndex: !widget?.isVisible ? maxZIndex + 1 : widget?.zIndex || 1
    });
  };

  const AppButton = ({ id, icon: Icon, label }: { id: string; icon: typeof Anchor; label: string }) => {
    const isVisible = widgets.find(w => w.id === id)?.isVisible;
    
    return (
      <motion.button
        onClick={() => handleAppClick(id)}
        className={`
          flex items-center space-x-2 p-3 border border-primary/30
          rounded-lg transition-colors duration-200 group w-full
          hover:text-primary
          ${isVisible ? 'text-primary' : 'text-primary/50'}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <Icon className="w-5 h-5" />
        <span className="text-sm whitespace-nowrap">
          {label}
        </span>
      </motion.button>
    );
  };

  return (
    <div className="p-4">
      <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center space-x-3'}`}>
        <motion.div layout>
          <AppButton id="wallet" icon={Anchor} label="CØVE Wallet" />
        </motion.div>
        <motion.div layout>
          <AppButton id="graph" icon={Activity} label="Chain eXplorer" />
        </motion.div>
        <motion.div layout>
          <AppButton id="price" icon={LineChart} label="XRP/USD" />
        </motion.div>
        <motion.div layout>
          <AppButton id="market" icon={Tent} label="Market" />
        </motion.div>
        <motion.div layout>
          <AppButton id="utilities" icon={Wrench} label="Utilities" />
        </motion.div>
        <motion.div layout>
          <AppButton id="chat" icon={MessageCircle} label="Chat" />
        </motion.div>
      </div>
    </div>
  );
};

export default AppBar;
