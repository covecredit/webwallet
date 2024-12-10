import { create } from 'zustand';
import { ThemeState, ThemeName } from '../types/theme';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { themes, DEFAULT_THEME } from '../constants/theme';
import { STORAGE_KEYS } from '../constants/storage';

const getInitialTheme = (): ThemeName => {
  const savedTheme = loadFromStorage<ThemeName>(STORAGE_KEYS.THEME);
  return savedTheme && savedTheme in themes ? savedTheme : DEFAULT_THEME;
};

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: getInitialTheme(),
  setTheme: (theme) => {
    if (theme in themes) {
      saveToStorage(STORAGE_KEYS.THEME, theme);
      set({ currentTheme: theme });
    }
  }
}));