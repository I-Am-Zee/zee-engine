// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://zaviona-dev.netlify.app', // Production domain for Netlify deployment
  
  // Server mode: Enables SSR for API routes
  output: 'server',

  server: {
    host: '127.0.0.1',
    port: 4321
  },
  
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true
    }
  },

  integrations: [
    alpinejs({
      entrypoint: '/src/scripts/behaviors/alpine-entrypoint.ts'
    })
  ],

  // Netlify adapter for deployment (supports hybrid mode)
  adapter: netlify()
});