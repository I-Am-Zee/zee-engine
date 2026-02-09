/**
 * Astro Middleware
 * 
 * Adds headers needed for ngrok to skip the browser warning page.
 * This allows Snipcart's validation crawler to access product pages.
 */

import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const ua = context.request.headers.get('user-agent') || 'No UA';
  console.log(`[middleware] Processing request: ${context.url.pathname} (UA: ${ua})`);
  const response = await next();
  
  // Add ngrok header to skip browser warning for bots/crawlers
  // This allows Snipcart to validate product URLs
  response.headers.set('ngrok-skip-browser-warning', 'true');
  console.log(`[middleware] Set ngrok-skip-browser-warning for: ${context.url.pathname}`);
  
  return response;
});
