import { StorageData, StorageService } from './types';
import { cryptoService } from '../crypto';

class LocalStorageService implements StorageService {
  private static instance: LocalStorageService;
  private readonly PREFIX = 'cove_';
  private readonly SENSITIVE_KEYS = ['seed'];
  private cache: Map<string, any> = new Map();

  private constructor() {
    this.initializeCache();
  }

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  private initializeCache(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
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

  async get<K extends keyof StorageData>(key: K): Promise<StorageData[K] | null> {
    try {
      const storageKey = this.getKey(key);
      
      // Check cache first
      if (this.cache.has(storageKey)) {
        return this.cache.get(storageKey);
      }

      const data = localStorage.getItem(storageKey);
      if (!data) return null;

      let parsedData: StorageData[K];
      
      if (this.SENSITIVE_KEYS.includes(key)) {
        try {
          const decrypted = await cryptoService.decrypt(data);
          parsedData = JSON.parse(decrypted);
        } catch (error) {
          console.error('Failed to decrypt data:', error);
          return null;
        }
      } else {
        try {
          parsedData = JSON.parse(data);
        } catch (error) {
          console.error('Failed to parse data:', error);
          return null;
        }
      }

      // Update cache
      this.cache.set(storageKey, parsedData);
      return parsedData;
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
      return null;
    }
  }

  async set<K extends keyof StorageData>(key: K, value: StorageData[K] | null): Promise<void> {
    try {
      const storageKey = this.getKey(key);

      if (value === null) {
        localStorage.removeItem(storageKey);
        this.cache.delete(storageKey);
        return;
      }

      let storageValue: string;
      
      if (this.SENSITIVE_KEYS.includes(key)) {
        const stringValue = JSON.stringify(value);
        try {
          storageValue = await cryptoService.encrypt(stringValue);
        } catch (error) {
          console.error('Failed to encrypt data:', error);
          throw error;
        }
      } else {
        storageValue = JSON.stringify(value);
      }

      localStorage.setItem(storageKey, storageValue);
      this.cache.set(storageKey, value);
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
      throw error;
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
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      this.cache.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  private getKey(key: keyof StorageData): string {
    return `${this.PREFIX}${key}`;
  }

  has(key: keyof StorageData): boolean {
    const storageKey = this.getKey(key);
    return this.cache.has(storageKey) || localStorage.getItem(storageKey) !== null;
  }

  keys(): Array<keyof StorageData> {
    return Array.from(this.cache.keys())
      .filter(key => key.startsWith(this.PREFIX))
      .map(key => key.replace(this.PREFIX, '') as keyof StorageData);
  }
}

export const storageService = LocalStorageService.getInstance();