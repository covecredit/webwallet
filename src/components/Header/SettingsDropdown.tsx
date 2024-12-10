import React, { useState, useRef, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../store/themeStore';
import { themes, themeNames } from '../../constants/theme';
import type { ThemeName } from '../../types/theme';
import { LAYOUT } from '../../constants/layout';

const SettingsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, setTheme } = useThemeStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = (theme: ThemeName) => {
    setTheme(theme);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-primary/20 transition-colors duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Settings className="w-5 h-5 md:w-6 md:h-6 text-primary" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-lg bg-background border border-primary/30 shadow-lg overflow-hidden"
            style={{ zIndex: LAYOUT.Z_INDEX.MODAL }}
          >
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-text/70">Theme</div>
              {(Object.keys(themes) as ThemeName[]).map((theme) => (
                <button
                  key={theme}
                  className={`w-full px-4 py-2 text-left text-text hover:bg-primary/20 flex items-center space-x-2
                    ${currentTheme === theme ? 'bg-primary/10' : ''}`}
                  onClick={() => handleThemeChange(theme)}
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: themes[theme].primary }}
                  />
                  <span>{themeNames[theme]}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsDropdown;