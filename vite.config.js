import { defineConfig } from 'vite';

export default defineConfig({
  base: '/Personal-Website/',
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    open: true,
  },
});
