import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage';

interface SettingsState {
  isDeveloperMode: boolean;
  toggleDeveloperMode: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isDeveloperMode: loadFromStorage(STORAGE_KEYS.DEVELOPER_MODE) || false,
  toggleDeveloperMode: () => set((state) => {
    const newValue = !state.isDeveloperMode;
    saveToStorage(STORAGE_KEYS.DEVELOPER_MODE, newValue);
    return { isDeveloperMode: newValue };
  }),
}));