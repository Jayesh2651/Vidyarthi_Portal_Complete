import process from 'node:process'

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function normalizeBasePath(value) {
  if (!value) {
    return '/'
  }

  const basePath = value.startsWith('/') ? value : `/${value}`
  return basePath.endsWith('/') ? basePath : `${basePath}/`
}

function normalizeOrigin(value) {
  const candidate = (value || '').trim()
  if (!candidate) {
    return ''
  }

  try {
    return new URL(candidate).origin
  } catch {
    return candidate.replace(/\/+$/, '')
  }
}

function getDevProxyTarget(env) {
  return normalizeOrigin(
    env.VITE_DEV_PROXY_TARGET || env.BACKEND_PUBLIC_URL || env.VITE_API_BASE_URL || '',
  )
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devProxyTarget = getDevProxyTarget(env)

  return {
    plugins: [react()],
    base: command === 'serve' ? '/' : normalizeBasePath(env.VITE_BASE_PATH || '/'),
    server: {
      host: '0.0.0.0',
      port: 5173,
      ...(devProxyTarget
        ? {
            proxy: {
              '/api': {
                target: devProxyTarget,
                changeOrigin: true,
              },
              '/media': {
                target: devProxyTarget,
                changeOrigin: true,
              },
            },
          }
        : {}),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    },
  }
})
