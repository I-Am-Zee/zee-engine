/**
 * Site URL Utility
 * 
 * Returns the correct site URL for the current environment:
 * - Deploy Preview: Uses DEPLOY_PRIME_URL (free, unique per PR)
 * - Production: Uses DEPLOY_PRIME_URL (equals main site URL)
 * - Local Development: Falls back to localhost
 * 
 * This enables free, unlimited Netlify Deploy Previews while
 * ensuring Snipcart/Razorpay validation works correctly.
 */

/**
 * Get the site URL for the current deployment context.
 * 
 * Priority:
 * 1. DEPLOY_PRIME_URL - Netlify's dynamic URL (works for both preview and prod)
 * 2. URL.origin - Current request origin if available
 * 3. PUBLIC_SITE_URL - Fallback for backwards compatibility
 * 4. localhost - Local development fallback
 */
export function getSiteUrl(requestUrl?: URL): string {
  // Netlify provides DEPLOY_PRIME_URL for both preview and production
  // This is the recommended way to get dynamic URLs
  const deployPrimeUrl = import.meta.env.DEPLOY_PRIME_URL;
  
  if (deployPrimeUrl) {
    return deployPrimeUrl;
  }
  
  // Fallback to request origin if available (for local dev)
  if (requestUrl) {
    return requestUrl.origin;
  }
  
  // Legacy fallback to PUBLIC_SITE_URL
  const publicSiteUrl = import.meta.env.PUBLIC_SITE_URL;
  if (publicSiteUrl) {
    return publicSiteUrl;
  }
  
  // Local development fallback
  return 'http://localhost:4321';
}
