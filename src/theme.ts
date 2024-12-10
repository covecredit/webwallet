import { ThemeName } from '../types/theme';
import { themes, DEFAULT_THEME } from '../constants/theme';
import { STORAGE_KEYS } from '../constants/storage';
import { loadFromStorage, saveToStorage } from './storage';
import { hexToRgb } from './color';

export const isValidTheme = (theme: string): theme is ThemeName => {
  return theme in themes;
};

export const loadTheme = (): ThemeName => {
  const savedTheme = loadFromStorage<string>(STORAGE_KEYS.THEME);
  if (savedTheme && isValidTheme(savedTheme)) {
    return savedTheme;
  }
  return DEFAULT_THEME;
};

export const saveTheme = (theme: ThemeName): void => {
  saveToStorage(STORAGE_KEYS.THEME, theme);
};

export const applyTheme = (theme: ThemeName): void => {
  const colors = themes[theme];
  if (!colors) return;

  const root = document.documentElement;
  
  root.style.setProperty('--primary', colors.primary);
  root.style.setProperty('--primary-rgb', hexToRgb(colors.primary));
  root.style.setProperty('--secondary', colors.secondary);
  root.style.setProperty('--secondary-rgb', hexToRgb(colors.secondary));
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--background-rgb', hexToRgb(colors.background));
  root.style.setProperty('--text', colors.text);
  root.style.setProperty('--text-rgb', hexToRgb(colors.text));

  root.style.setProperty('color-scheme', 'dark');
  document.body.style.backgroundColor = colors.background;
  document.body.style.color = colors.text;
};