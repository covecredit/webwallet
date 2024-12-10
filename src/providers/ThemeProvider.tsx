import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { useTheme } from '../hooks/useTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme
  useTheme();
  
  return <>{children}</>;
};