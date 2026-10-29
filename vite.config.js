import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run/')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/gsap/')) {
            return 'vendor-gsap';
          }
          if (id.includes('node_modules/lenis/')) {
            return 'vendor-lenis';
          }
        }
      }
    }
  },
  preview: {
    // SPA fallback for vite preview
    port: 4173,
  }
})


