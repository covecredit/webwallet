import React, { useState } from 'react';
import NotificationBar from '../NotificationBar';
import { Notification } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import MenuButton from '../AppBar/MenuButton';
import AppBar from '../AppBar/AppBar';
import AccountHeader from '../Header/AccountHeader';
import Logo from '../Logo/Logo';
import MatrixBackground from '../Header/MatrixBackground';
import { LAYOUT } from '../../constants/layout';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header 
        className="fixed top-0 left-0 right-0 z-[60] bg-background-85 backdrop-blur-md overflow-hidden"
        style={{ height: LAYOUT.HEADER_HEIGHT }}
      >
        <MatrixBackground />
        <div className="relative z-10 flex items-center justify-between p-4 h-full">
          <div className="flex items-center space-x-4">
            <MenuButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
            <Logo />
          </div>
          <AccountHeader />
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[80px] left-0 right-0 z-[55] bg-background-85 backdrop-blur-md border-b border-primary/30"
          >
            <AppBar isMenuOpen={isMenuOpen} />
          </motion.div>
        )}
      </AnimatePresence>

      <main 
        className={`
          relative z-10 flex-1
          ${isMobile ? 'flex flex-col space-y-4 px-4 pb-16' : ''}
        `}
        style={{
          paddingTop: LAYOUT.HEADER_HEIGHT,
          paddingBottom: isMobile ? 0 : LAYOUT.FOOTER_HEIGHT,
          minHeight: isMobile ? '100%' : `calc(100vh - ${LAYOUT.HEADER_HEIGHT + LAYOUT.FOOTER_HEIGHT}px)`
        }}
      >
        {children}
      </main>
      
      <footer 
        className="fixed bottom-0 left-0 right-0 z-[60]"
        style={{ height: LAYOUT.FOOTER_HEIGHT }}
      >
        <NotificationBar notifications={[]} />
      </footer>
    </div>
  );
};

export default MainLayout;