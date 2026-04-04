// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';

import cloudflare from '@astrojs/cloudflare';

// Site URL for Snipcart product URL validation
// Using production URL because Snipcart crawls product pages to verify prices.
// For Draft deploys: Add "*.netlify.app" to Snipcart Dashboard > Domains & URLs
const siteUrl = 'https://zaviona-dev.netlify.app';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  
  // Server mode: Required for API webhooks and dynamic Server-Side rendering.
  output: 'server',

  server: {
    host: '127.0.0.1',
    port: 4321
  },
  
  image: {
    remotePatterns: [{ protocol: 'https' }],
  },
  
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['dev.zeliavance.com']
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

  // Cloudflare adapter for deployment (supports hybrid mode)
  adapter: cloudflare()
});