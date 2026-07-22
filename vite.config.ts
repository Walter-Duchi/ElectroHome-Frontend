import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
const BACKEND_BASE_URL = process.env.VITE_BACKEND_BASE_URL || 'http://localhost:5298';
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: BACKEND_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
      '/Documents': {
        target: BACKEND_BASE_URL,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'axios-vendor': ['axios']
        }
      }
    }
  }
})
