import React from 'react';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../Logo/Logo';
import { LAYOUT } from '../../constants/layout';

interface MobileHeaderProps {
  onMenuClick: () => void;
  children: React.ReactNode;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, children }) => {
  return (
    <header 
      className="fixed top-0 left-0 right-0 z-[60] bg-background-85 backdrop-blur-md"
      style={{ height: LAYOUT.HEADER_HEIGHT }}
    >
      <div className="flex flex-col h-full">
        {/* Top bar with logo and menu */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-primary/10">
          <Logo />
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <Menu className="w-6 h-6 text-primary" />
          </button>
        </div>

        {/* Actions row */}
        <motion.div 
          className="flex items-center justify-center px-4 py-2 space-x-2 overflow-x-auto"
          style={{ height: LAYOUT.MOBILE_HEADER_ACTIONS_HEIGHT }}
        >
          {children}
        </motion.div>
      </div>
    </header>
  );
};