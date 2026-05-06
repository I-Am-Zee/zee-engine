// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import alpinejs from '@astrojs/alpinejs';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import yaml from '@rollup/plugin-yaml';

import cloudflare from '@astrojs/cloudflare';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Site URL — set PUBLIC_SITE_URL in .env and Cloudflare Pages dashboard
// Using production URL because Snipcart crawls product pages to verify prices.
// For Draft deploys: Add "*.pages.dev" to Snipcart Dashboard > Domains & URLs
const siteUrl = process.env.PUBLIC_SITE_URL || 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  // Astro 5 'static' mode - dynamic routes opt-out via 'export const prerender = false'
  output: 'static',

  server: {
    host: true, // Bind to all interfaces for tunnel support
    port: 4321
  },
  
  image: {
    remotePatterns: [{ protocol: 'https' }],
  },
  
  vite: {
    plugins: [tailwindcss(), yaml()],
    resolve: {
      alias: {
        '@brand-theme': path.resolve(__dirname, `./src/styles/${process.env.PUBLIC_BRAND_ID || 'zelia-vance'}/theme.css`)
      }
    },
    server: {
      allowedHosts: ['dev.zeliavance.com']
    },
    optimizeDeps: {
      // Pre-bundle common Keystatic UI dependencies to prevent 404s and CJS/ESM syntax errors
      include: [
        'react', 
        'react-dom', 
        '@keystatic/core',
        '@keystatic/core/ui', 
        '@keystatic/core/renderer',
        'lodash/debounce'
      ]
    },
    build: {
      rollupOptions: {
        external: ['stripe']
      }
    }
  },

  integrations: [
    react(),
    keystatic(),
    alpinejs({
      entrypoint: '/src/scripts/behaviors/alpine-entrypoint.ts'
    }),
    mdx()
  ],

  adapter: cloudflare({
    platformProxy: { enabled: true }
  })
});