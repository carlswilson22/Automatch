import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const getBasePath = () => {
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH.endsWith('/') ? process.env.VITE_BASE_PATH : `${process.env.VITE_BASE_PATH}/`;
  }
  if (process.env.GITHUB_REPOSITORY) {
    return `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`;
  }
  return '/';
};

const basePath = getBasePath();

// Plugin para garantir que requisições diretas a /images/* no dev server sejam resolvidas sob o base path quando não na raiz
const serveRootImagesPlugin = () => ({
  name: 'serve-root-images',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (basePath !== '/' && req.url && req.url.startsWith('/images/')) {
        req.url = basePath.replace(/\/$/, '') + req.url;
      }
      next();
    });
  }
});

export default defineConfig({
  base: basePath,
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
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            return 'vendor-libs';
          }
        }
      }
    }
  }
});

