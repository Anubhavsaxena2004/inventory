import { defineConfig } from 'vite'

// Development proxy to forward /api requests to the Django backend
export default defineConfig({
  base: '/static/',
  build: {
    outDir: '../backend/static',
    assetsDir: 'assets',
    // Disable CSS code splitting so all CSS is emitted into a single file.
    // This ensures the global `unified.css` import order controls final cascade
    // and avoids component-level CSS unexpectedly overriding global tokens.
    cssCodeSplit: false,
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
