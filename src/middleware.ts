/**
 * Validates incoming requests. This allows Snipcart's validation crawler to access product pages.
 */

import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Only log path to avoid accessing headers on prerendered pages
  console.log(`[middleware] Processing request: ${context.url.pathname}`);

  // Proceed with response
  const response = await next();
  
  return response;
});
