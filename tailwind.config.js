/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        background: 'var(--background)',
        text: 'var(--text)',
      },
      backgroundColor: {
        'primary-opacity': 'rgba(var(--primary-rgb), 0.1)',
        'background-opacity': 'rgba(var(--background-rgb), 0.95)',
      },
      borderColor: {
        'primary-opacity': 'rgba(var(--primary-rgb), 0.3)',
      },
      textColor: {
        'primary-opacity': 'rgba(var(--primary-rgb), 0.7)',
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
      }
    },
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|border|text)-(primary|secondary|background|text)/,
      variants: ['hover', 'focus', 'active'],
    },
    {
      pattern: /bg-opacity-\d+/,
    },
    {
      pattern: /border-opacity-\d+/,
    },
    {
      pattern: /text-opacity-\d+/,
    },
    {
      pattern: /opacity-\d+/,
    }
  ]
}