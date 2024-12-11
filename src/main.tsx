import React from 'react';
import { createRoot } from 'react-dom/client';
import './polyfills';
import App from './App';
import './index.css';
import { ThemeProvider } from './providers/ThemeProvider';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find root element');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);