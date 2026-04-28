import process from 'node:process'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function normalizeBasePath(value) {
  if (!value) {
    return '/'
  }

  const basePath = value.startsWith('/') ? value : `/${value}`
  return basePath.endsWith('/') ? basePath : `${basePath}/`
}

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : normalizeBasePath(process.env.VITE_BASE_PATH || '/'),
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  },
}))
