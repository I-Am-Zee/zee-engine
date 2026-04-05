/**
 * Site URL Utility
 *
 * Returns the correct site URL for the current environment.
 * Priority:
 * 1. PUBLIC_SITE_URL — Set in .env for all deployments (required in production)
 * 2. requestUrl.origin — Used during local development (Astro dev server)
 * 3. localhost:4321 — Hard fallback for edge cases
 *
 * NOTE: PUBLIC_SITE_URL is required for Snipcart product price validation.
 * Set it in your .env file and in Cloudflare Pages environment variables.
 */
export function getSiteUrl(requestUrl?: URL): string {
  // Primary: explicit env var (set in Cloudflare Pages for all deployments)
  const publicSiteUrl = import.meta.env.PUBLIC_SITE_URL;
  if (publicSiteUrl) {
    return publicSiteUrl;
  }

  // Dev fallback: use the actual request origin (handles tunnels like dev.zeliavance.com)
  if (requestUrl) {
    return requestUrl.origin;
  }

  // Last resort: local dev default
  return 'http://localhost:4321';
}
