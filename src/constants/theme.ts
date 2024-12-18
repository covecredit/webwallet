export const themes = {
  gold: {
    primary: '#FFD700',
    secondary: '#4A90E2',
    background: '#1A1B26',
    text: '#E6E8E6'
  },
  red: {
    primary: '#FF4444',
    secondary: '#FF8888',
    background: '#1A1616',
    text: '#E6E8E6'
  },
  green: {
    primary: '#00CC66',
    secondary: '#66FF99',
    background: '#162016',
    text: '#E6E8E6'
  },
  lightBlue: {
    primary: '#00BFFF',
    secondary: '#87CEEB',
    background: '#1A1A26',
    text: '#E6E8E6'
  },
  darkBlue: {
    primary: '#4169E1',
    secondary: '#6495ED',
    background: '#161A26',
    text: '#E6E8E6'
  },
  purple: {
    primary: '#9B59B6',
    secondary: '#C39BD3',
    background: '#1A1626',
    text: '#E6E8E6'
  },
  orange: {
    primary: '#FF8C00',
    secondary: '#FFA500',
    background: '#261A16',
    text: '#E6E8E6'
  },
  teal: {
    primary: '#20B2AA',
    secondary: '#48D1CC',
    background: '#162626',
    text: '#E6E8E6'
  },
  pink: {
    primary: '#FF69B4',
    secondary: '#FFB6C1',
    background: '#261626',
    text: '#E6E8E6'
  },
  sunset: {
    primary: '#FF6B6B',
    secondary: '#FFB347',
    background: '#2D1B2E',
    text: '#FFE4E1'
  },
  neon: {
    primary: '#00FF41', // Matrix green
    secondary: '#39FF14', // Bright lime green
    background: '#0D0208', // Very dark background
    text: '#33FF33' // Matrix text green
  },
  cyber: {
    primary: '#00FFFF', // Neon cyan/blue
    secondary: '#0099FF', // Bright blue
    background: '#000B1E', // Dark blue-black
    text: '#E6E8E6'
  }
} as const;

export const DEFAULT_THEME = 'gold';

export const themeNames = {
  gold: 'Gold',
  red: 'Ruby',
  green: 'Emerald',
  lightBlue: 'Sapphire',
  darkBlue: 'Ocean',
  purple: 'Amethyst',
  orange: 'Amber',
  teal: 'Turquoise',
  pink: 'Rose Quartz',
  sunset: 'Sunset',
  neon: 'Matrix',
  cyber: 'Cyberpunk'
} as const;