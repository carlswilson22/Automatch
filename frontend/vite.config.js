import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin para garantir que requisições diretas a /images/* no dev server sejam resolvidas sob /Automatch/images/*
const serveRootImagesPlugin = () => ({
  name: 'serve-root-images',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && req.url.startsWith('/images/')) {
        req.url = '/Automatch' + req.url;
      }
      next();
    });
  }
});

export default defineConfig({
  base: '/Automatch/',
  plugins: [react(), serveRootImagesPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});

