// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';

import netlify from '@astrojs/netlify';

// Site URL for Snipcart product URL validation
// Using production URL because Snipcart crawls product pages to verify prices.
// For Draft deploys: Add "*.netlify.app" to Snipcart Dashboard > Domains & URLs
const siteUrl = 'https://zaviona-dev.netlify.app';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  
  // Static mode: Pre-renders everything by default. 
  // We opt-out of pre-rendering for dynamic routes using export const prerender = false.
  output: 'static',

  server: {
    host: '127.0.0.1',
    port: 4321
  },
  
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: true
    },
    build: {
      rollupOptions: {
        // Externalize packages that are dynamically imported in API routes
        external: ['stripe']
      }
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