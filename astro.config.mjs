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
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import { loadEnv, searchForWorkspaceRoot } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on the current mode
const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');

const rawBrandId = env.PUBLIC_BRAND_ID;
const isAffiliate = env.PUBLIC_AFFILIATE === 'true';

let brandId = rawBrandId;
const brandContentPath = path.resolve(__dirname, `./src/content/${brandId}`);

if (!brandId || !path.resolve(brandContentPath)) {
  const fallbackId = isAffiliate ? 'sample-affiliate' : 'sample-brand';
  if (rawBrandId) {
    console.warn('\x1b[33m%s\x1b[0m', ` [Engine Warning] Brand directory for "${rawBrandId}" not found at ${brandContentPath}.`);
  } else {
    console.warn('\x1b[33m%s\x1b[0m', ' [Engine Warning] PUBLIC_BRAND_ID is not set in .env.');
  }
  console.warn('\x1b[33m%s\x1b[0m', ` Falling back to "${fallbackId}" content and theme.`);
  brandId = fallbackId;
}

// Final check for the resolved brand directory
if (!fs.existsSync(path.resolve(__dirname, `./src/content/${brandId}`))) {
  console.error('\x1b[31m%s\x1b[0m', ` [Engine Fatal] Resolved brandId "${brandId}" directory not found. Please ensure sample directories exist.`);
  process.exit(1);
}

// Resolve theme path with a safety check
let themePath = path.resolve(__dirname, `./src/styles/${brandId}/theme.css`);
if (!fs.existsSync(themePath)) {
  const fallbackTheme = isAffiliate ? 'sample-affiliate' : 'sample-brand';
  console.warn('\x1b[33m%s\x1b[0m', ` [Engine Warning] Theme not found for "${brandId}". Falling back to "${fallbackTheme}" theme.`);
  themePath = path.resolve(__dirname, `./src/styles/${fallbackTheme}/theme.css`);
}

// Site URL — set PUBLIC_SITE_URL in .env and Cloudflare Pages dashboard
// Using production URL because Snipcart crawls product pages to verify prices.
// For Draft deploys: Add "*.pages.dev" to Snipcart Dashboard > Domains & URLs
const siteUrl = env.PUBLIC_SITE_URL || 'http://localhost:4321';

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
        '@brand-theme': themePath,
        'yjs': path.resolve(__dirname, './node_modules/yjs/dist/yjs.mjs')
      },
      dedupe: [
        'yjs', 
        'react', 
        'react-dom', 
        'prosemirror-state', 
        'prosemirror-tables', 
        'prosemirror-view', 
        'prosemirror-model', 
        'prosemirror-transform'
      ]
    },
    server: {
      allowedHosts: ['dev.zeliavance.com'],
      fs: {
        allow: [
          searchForWorkspaceRoot(process.cwd()),
          ...(env.LOCAL_MEDIA_PATH ? [path.resolve(__dirname, env.LOCAL_MEDIA_PATH)] : [])
        ]
      }
    },
    optimizeDeps: {
      // Pre-bundle common Keystatic UI dependencies to prevent 404s and CJS/ESM syntax errors
      include: [
        'react', 
        'react-dom', 
        'yjs',
        'y-prosemirror',
        'prosemirror-state',
        'prosemirror-tables',
        'prosemirror-view',
        'prosemirror-model',
        'prosemirror-transform',
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

  adapter: cloudflare()
});