import { STORAGE_PREFIX } from '../constants/storage';

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    if (data === null || data === undefined) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(data));
    }
  } catch (error) {
    console.warn(`Failed to save to storage: ${key}`, error);
  }
};

export const loadFromStorage = <T>(key: string): T | null => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    const data = localStorage.getItem(storageKey);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.warn(`Failed to load from storage: ${key}`, error);
    return null;
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    const storageKey = `${STORAGE_PREFIX}${key}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn(`Failed to remove from storage: ${key}`, error);
  }
};

export const clearStorage = (): void => {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear storage', error);
  }
};