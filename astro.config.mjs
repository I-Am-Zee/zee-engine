// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mdx from '@astrojs/mdx';
import keystatic from '@keystatic/astro';

import cloudflare from '@astrojs/cloudflare';

// Site URL — set PUBLIC_SITE_URL in .env and Cloudflare Pages dashboard
// Using production URL because Snipcart crawls product pages to verify prices.
// For Draft deploys: Add "*.pages.dev" to Snipcart Dashboard > Domains & URLs
const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  
  // Static by default (hybrid automatically supported in Astro 5 for API routes)
  output: 'static',

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
    keystatic(),
    alpinejs({
      entrypoint: '/src/scripts/behaviors/alpine-entrypoint.ts'
    }),
    mdx()
  ],

  // Cloudflare adapter for deployment (supports hybrid mode)
  adapter: cloudflare()
});