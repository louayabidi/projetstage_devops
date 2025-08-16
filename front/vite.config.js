import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
       'context': path.resolve(__dirname, './src/dashboard/context'),
      'components': path.resolve(__dirname, './src/dashboard/components'),
      'examples': path.resolve(__dirname, './src/dashboard/examples'),
      'layouts': path.resolve(__dirname, './src/dashboard/layouts'),
      'assets': path.resolve(__dirname, './src/dashboard/assets'),
      'variables': path.resolve(__dirname, './src/dashboard/variables'),
      
    }
  }
});