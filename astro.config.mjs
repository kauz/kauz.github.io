import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://kauz.github.io',
  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
