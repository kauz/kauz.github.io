import { defineConfig } from 'astro/config';
import AstroPWA from '@vite-pwa/astro';

export default defineConfig({
  output: 'static',
  site: 'https://kauz.github.io',
  integrations: [
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'apopov.dev',
        short_name: 'apopov.dev',
        description: 'Software engineer portfolio',
        theme_color: '#111111',
        background_color: '#080808',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/assets/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/assets/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/assets/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{css,js,html,svg,png,ico}'],
      },
    }),
  ],
  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
