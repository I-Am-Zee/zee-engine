// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

import cloudflare from '@astrojs/cloudflare';

// Site URL — set PUBLIC_SITE_URL in .env and Cloudflare Pages dashboard
// Using production URL because Snipcart crawls product pages to verify prices.
// For Draft deploys: Add "*.pages.dev" to Snipcart Dashboard > Domains & URLs
const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  
  // Hybrid mode allows for both static generation and dynamic API/Admin routes
  output: 'hybrid',

  server: {
    host: true, // Bind to all interfaces (essential for tunnels/dev.zeliavance.com)
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
    optimizeDeps: {
      // Prevents Vite from over-bundling Keystatic, which causes hydration issues in Astro 5
      exclude: ['@keystatic/core', '@keystatic/astro']
    },
    build: {
      rollupOptions: {
        // Externalize packages that are dynamically imported in API routes
        external: ['stripe']
      }
    }
  },

  integrations: [
    // React renderer — required by Keystatic admin UI
    react(),
    // Keystatic CMS — enabled in DEV and on the development domain
    ...(process.env.NODE_ENV === 'development' || siteUrl.includes('dev.zeliavance.com') ? [keystatic()] : []),
    alpinejs({
      entrypoint: '/src/scripts/behaviors/alpine-entrypoint.ts'
    }),
    mdx()
  ],

  // Cloudflare adapter for deployment (supports hybrid mode)
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  })
});