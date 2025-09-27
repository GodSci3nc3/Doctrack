import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Use absolute paths for Vercel deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  },
  publicDir: 'public', // Asegurar que public/ se copie al build
  define: {
    'process.env': {
      VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3001'
    }
  },
  // Proxy API requests in development to avoid CORS and allow cookies same-site
  server: {
    port: 5173, // Forcing the client to use port 5173
    proxy: {
      '/auth': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: path => path
      },
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: path => path
      }
    }
  }
})
