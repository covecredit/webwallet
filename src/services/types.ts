import { NetworkConfig } from '../../types/network';
import { ThemeName } from '../../types/theme';

export interface StorageData {
  theme: ThemeName;
  seed: string | null;
  network: NetworkConfig | null;
  widgets: {
    id: string;
    isVisible: boolean;
    isMinimized: boolean;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
  }[];
}

export interface StorageService {
  get<K extends keyof StorageData>(key: K): StorageData[K];
  set<K extends keyof StorageData>(key: K, value: StorageData[K]): void;
  remove(key: keyof StorageData): void;
  clear(): void;
}