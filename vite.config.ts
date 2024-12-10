import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
      util: 'util',
      stream: 'stream-browserify',
      events: 'events'
    }
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'framer-motion'],
          charts: ['lightweight-charts', 'recharts'],
          xrpl: ['xrpl']
        }
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis'
      }
    }
  }
});