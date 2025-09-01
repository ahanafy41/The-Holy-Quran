import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/', // Use absolute path for routing and assets
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          // Caches essential assets for offline use
          includeAssets: ['icon-192x192.png', 'icon-512x512.png', 'icon-maskable-512x512.png'],
          manifest: {
            name: 'القرآن الكريم',
            short_name: 'القرآن الكريم',
            description: 'Your companion for studying and pondering the Quran.',
            theme_color: '#16a34a',
            background_color: '#f1f5f9',
            display: 'standalone',
            start_url: '/',
            icons: [
              {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              },
              {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png'
              },
              {
                src: '/icon-maskable-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});