import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BREAKPOINTS, LAYOUT } from '../../constants/layout';
import MenuButton from '../AppBar/MenuButton';
import AppBar from '../AppBar/AppBar';
import AccountHeader from '../Header/AccountHeader';
import Logo from '../Logo/Logo';
import MatrixBackground from '../Header/MatrixBackground';
import NotificationBar from '../NotificationBar';
import { MobileLayout } from './MobileLayout';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.MOBILE}px)`);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header 
        className="fixed top-0 left-0 right-0 z-[60] bg-background-85 backdrop-blur-md"
        style={{ height: LAYOUT.HEADER_HEIGHT }}
      >
        <MatrixBackground />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <MenuButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
              <Logo className={isMobile ? 'scale-90 origin-left' : ''} />
            </div>
            <AccountHeader />
          </div>
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

      {isMobile ? (
        <MobileLayout>
          {children}
        </MobileLayout>
      ) : (
        <main 
          className="relative z-10 flex-1"
          style={{
            paddingTop: LAYOUT.HEADER_HEIGHT + (isMenuOpen ? LAYOUT.MENU_HEIGHT : 0),
            paddingBottom: LAYOUT.FOOTER_HEIGHT,
            minHeight: `calc(100vh - ${LAYOUT.HEADER_HEIGHT + LAYOUT.FOOTER_HEIGHT}px)`
          }}
        >
          {children}
        </main>
      )}
      
      <footer 
        className="fixed bottom-0 left-0 right-0 z-[60]"
        style={{ height: LAYOUT.FOOTER_HEIGHT }}
      >
        <NotificationBar />
      </footer>
    </div>
  );
};

export default MainLayout;