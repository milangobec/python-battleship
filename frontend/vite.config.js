import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    proxy: {
      '/players': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/games': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/lobby' : {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/lobbies': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
}) 