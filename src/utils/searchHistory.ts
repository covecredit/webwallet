import { loadFromStorage, saveToStorage } from './storage';
import { STORAGE_KEYS } from '../constants/storage';

const MAX_HISTORY = 10;

export const addToSearchHistory = (term: string): void => {
  const history = loadFromStorage<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || [];
  const newHistory = [term, ...history.filter(t => t !== term)].slice(0, MAX_HISTORY);
  saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, newHistory);
};

export const clearSearchHistory = (): void => {
  saveToStorage(STORAGE_KEYS.SEARCH_HISTORY, []);
};

export const getSearchHistory = (): string[] => {
  return loadFromStorage<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || [];
};