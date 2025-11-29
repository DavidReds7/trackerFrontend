import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendFolder = path.resolve(__dirname, '../TRacker-QR-VersionJM');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    __BACKEND_FOLDER__: JSON.stringify(backendFolder)
  }
});
