const STORAGE_PREFIX = 'cove_';

class StorageService {
  private static instance: StorageService;
  private cache: Map<string, any> = new Map();

  private constructor() {
    this.initializeCache();
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private initializeCache(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const parsedValue = JSON.parse(value);
              this.cache.set(key, parsedValue);
            } catch (error) {
              console.error(`Failed to parse stored value for ${key}:`, error);
            }
          }
        }
      });
      console.log('Cache initialized successfully');
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }

  get<K extends keyof StorageData>(key: K): StorageData[K] | null {
    try {
      const storageKey = this.getKey(key);
      
      // Check cache first
      if (this.cache.has(storageKey)) {
        return this.cache.get(storageKey);
      }

      const data = localStorage.getItem(storageKey);
      if (!data) return null;

      const parsedData = JSON.parse(data);
      this.cache.set(storageKey, parsedData);
      return parsedData;
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
      return null;
    }
  }

  set<K extends keyof StorageData>(key: K, value: StorageData[K] | null): void {
    try {
      const storageKey = this.getKey(key);

      if (value === null) {
        localStorage.removeItem(storageKey);
        this.cache.delete(storageKey);
        return;
      }

      const storageValue = JSON.stringify(value);
      localStorage.setItem(storageKey, storageValue);
      this.cache.set(storageKey, value);
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  }

  remove(key: keyof StorageData): void {
    try {
      const storageKey = this.getKey(key);
      localStorage.removeItem(storageKey);
      this.cache.delete(storageKey);
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
    }
  }

  clear(): void {
    try {
      const keysToRemove: string[] = [];
      
      // First, collect all keys to remove
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(key);
        }
      });

      // Then remove them one by one
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear the cache
      this.cache.clear();
      
      console.log('Storage cleared successfully');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  private getKey(key: keyof StorageData): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  has(key: keyof StorageData): boolean {
    const storageKey = this.getKey(key);
    return this.cache.has(storageKey) || localStorage.getItem(storageKey) !== null;
  }
}

export const storageService = StorageService.getInstance();