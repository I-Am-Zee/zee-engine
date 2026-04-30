/**
 * Validates incoming requests. This allows Snipcart's validation crawler to access product pages.
 */

import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Use optional chaining and fallback for header access to avoid warnings on prerendered pages
  const ua = context.request?.headers?.get('user-agent') || 'No UA';
  console.log(`[middleware] Processing request: ${context.url.pathname} (UA: ${ua})`);

  // Proceed with response
  const response = await next();
  
  return response;
});
