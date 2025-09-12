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
            src: '/icon-192x192.png',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: '/icon-512x512.png',
            type: 'image/png',
            sizes: '512x512',
          },
          {
            src: '/icon-maskable-192x192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'maskable',
          },
          {
            src: '/icon-maskable-512x512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});