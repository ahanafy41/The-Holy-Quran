/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50 MB
        runtimeCaching: [
          {
            // Cache for audio files from various sources
            urlPattern: ({ url }) => {
              return url.hostname === 'everyayah.com' || url.hostname === 'raw.githubusercontent.com';
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-app-offline-cache', // Using the same cache name as downloadManager
              expiration: {
                maxEntries: 5000, // Store up to 5000 audio files
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200], // Cache opaque and successful responses
              },
            },
          },
          {
            // Cache for API responses (Quran data, Hadith, etc.)
            urlPattern: ({ url }) => {
              return url.hostname === 'api.alquran.cloud' ||
                     url.hostname === 'www.mp3quran.net' ||
                     url.href.endsWith('.json'); // Generic rule for hadith files
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'quran-app-api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'القرآن الكريم',
        short_name: 'القرآن الكريم',
        description: 'Your companion for studying and pondering the Quran.',
        start_url: '/',
        display: 'standalone',
        display_override: ['standalone'],
        background_color: '#f1f5f9',
        theme_color: '#16a34a',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'icon-192x192.png',
            type: 'image/png',
            sizes: '192x192'
          },
          {
            src: 'icon-512x512.png',
            type: 'image/png',
            sizes: '512x512'
          },
          {
            src: 'icon-maskable-192x192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'maskable'
          },
          {
            src: 'icon-maskable-512x512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable'
          }
        ]
      }
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    testTimeout: 600000,
  },
});