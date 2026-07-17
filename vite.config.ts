import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const { version } = JSON.parse(readFileSync('./package.json', 'utf-8')) as { version: string }
const appVersion = process.env.APP_VERSION?.trim() || version
const basePath = '/'

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: true,
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (id.includes('/@electric-sql/pglite/')) return 'vendor-pglite'
          if (id.includes('/@mui/') || id.includes('/@emotion/')) return 'vendor-mui'
          if (id.includes('/react-router-dom/')) return 'vendor-router'
          if (id.includes('/react-hook-form/')) return 'vendor-forms'
          if (id.includes('/jszip/')) return 'vendor-zip'
          if (id.includes('/workbox-window/')) return 'vendor-pwa'
          if (id.includes('/react-dom/') || id.includes('/react/')) return 'vendor-react'

          return 'vendor-misc'
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/docs\//],
      },
      manifest: {
        name: 'Specs Builder',
        short_name: 'Specs',
        description: 'Offline web app to manage project specs with roles and use cases',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: basePath,
        scope: basePath,
        icons: [
          {
            src: `${basePath}vite.svg`,
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
})
