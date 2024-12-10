import React from 'react';
import { createRoot } from 'react-dom/client';
import './polyfills';
import App from './App';
import './index.css';
import { ThemeProvider } from './providers/ThemeProvider';
import { themes } from './constants/theme';
import { loadFromStorage, saveToStorage } from './utils/storage';
import { STORAGE_KEYS } from './constants/storage';
import { hexToRgb } from './utils/color';
import type { ThemeName } from './types/theme';

// Initialize theme on first visit
const initializeTheme = () => {
  const savedTheme = loadFromStorage<ThemeName>(STORAGE_KEYS.THEME);
  if (!savedTheme) {
    const themeNames = Object.keys(themes) as ThemeName[];
    const randomTheme = themeNames[Math.floor(Math.random() * themeNames.length)];
    saveToStorage(STORAGE_KEYS.THEME, randomTheme);
    return randomTheme;
  }
  return savedTheme;
};

// Initialize and apply theme immediately
const theme = initializeTheme();
const colors = themes[theme];

// Apply theme colors immediately to prevent white flash
if (colors) {
  const root = document.documentElement;
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-rgb', hexToRgb(colors.primary));
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-rgb', hexToRgb(colors.secondary));
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--background-rgb', hexToRgb(colors.background));
  root.style.setProperty('--text', colors.text);
  root.style.setProperty('--text-rgb', hexToRgb(colors.text));

  document.body.style.backgroundColor = colors.background;
  document.body.style.color = colors.text;
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find root element');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);