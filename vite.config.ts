/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'azkar-data/audio',
          dest: ''
        }
      ]
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50 MB
        // لو عندك أي إعدادات تانية للـ Workbox، ممكن تضيفها هنا.
      },
      // لو عندك أي إعدادات تانية للـ PWA (زي الـ manifest أو devOptions)، ممكن تضيفها هنا.
      // لو كان عندك VitePWA plugin متضاف قبل كده، يرجى دمج الـ 'workbox' property دي مع الإعدادات الموجودة.
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    testTimeout: 600000,
  },
});