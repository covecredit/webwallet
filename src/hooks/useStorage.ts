import { useEffect, useState } from 'react';
import { storageService } from '../services/storage';
import { StorageData } from '../services/storage/types';

export function useStorage<K extends keyof StorageData>(
  key: K,
  initialValue: StorageData[K]
): [StorageData[K], (value: StorageData[K]) => void] {
  const [value, setValue] = useState<StorageData[K]>(() => {
    const stored = storageService.get(key);
    return stored !== null ? stored : initialValue;
  });

  useEffect(() => {
    const stored = storageService.get(key);
    if (stored !== null) {
      setValue(stored);
    }
  }, [key]);

  const setStoredValue = (newValue: StorageData[K]) => {
    setValue(newValue);
    storageService.set(key, newValue);
  };

  return [value, setStoredValue];
}