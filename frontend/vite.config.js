import { defineConfig } from 'vite'

// Development proxy to forward /api requests to the Django backend
export default defineConfig({
  base: './',
  build: {
    outDir: '../backend/static',
    assetsDir: 'assets',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
