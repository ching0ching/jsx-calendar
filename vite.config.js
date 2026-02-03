import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  preview: {
    allowedHosts: ['swayingly-skeletonlike-vincenzo.ngrok-free.dev'],
  },
});