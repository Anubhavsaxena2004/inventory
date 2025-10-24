import { defineConfig } from 'vite'

// Development proxy to forward /api requests to the Django backend
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'static',  // ✅ puts JS/CSS into /static/ instead of /assets/
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
