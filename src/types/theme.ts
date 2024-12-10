export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export type ThemeName = keyof typeof import('../constants/theme').themes;

export interface ThemeState {
  currentTheme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}