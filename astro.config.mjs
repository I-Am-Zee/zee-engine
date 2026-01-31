// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  output: 'server', // Enable SSR for API routes
  site: 'http://localhost:4321', // Will be updated for production
  
  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [
    alpinejs({
      entrypoint: '/src/scripts/behaviors/alpine-entrypoint.ts'
    })
  ],

  adapter: netlify()
});