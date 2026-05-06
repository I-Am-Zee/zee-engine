export interface Env {
  IMAGES_BUCKET: R2Bucket;
  ALLOWED_DOMAINS: string;
  IMAGES_ORIGIN_URL: string;
}

/**
 * Image Engine Worker
 * 
 * Responsibilities:
 * 1. Security: Referer-based hotlinking protection.
 * 2. Optimization: Cloudflare Image Resizing (stepping dimensions for cache hits).
 * 3. Performance: Edge caching via Cache API.
 * 4. Multi-tenancy: Dynamic origin resolution via IMAGES_ORIGIN_URL.
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // 1. Method Validation
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }

    // 2. Routing / Health Check
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }
    
    // Root path with no image key is a Bad Request (matches test expectations)
    if (url.pathname === "/") {
      return new Response("Bad Request: No image path provided", { status: 400 });
    }

    // 3. Transformation Parameters & Stepping
    // We snap parameters EARLY to normalize the cache key
    let widthStr = url.searchParams.get("w");
    let qualityStr = url.searchParams.get("q");

    // Width Stepping: 200, 400, 800, 1200
    let width = parseInt(widthStr || "800", 10);
    if (isNaN(width) || width > 1200) width = 800;
    else if (width <= 200) width = 200;
    else if (width <= 400) width = 400;
    else if (width <= 800) width = 800;
    else width = 1200;

    // Quality Stepping: Snap to multiples of 10 (e.g., 72 -> 70, 88 -> 90)
    let rawQuality = parseInt(qualityStr || "80", 10);
    if (isNaN(rawQuality) || rawQuality < 1 || rawQuality > 100) rawQuality = 80;
    let quality = Math.round(rawQuality / 10) * 10;
    if (quality === 0) quality = 10;

    // 4. Cache Lookup (Normalized)
    const cache = caches.default;
    
    // Construct a normalized URL for the cache key
    const normalizedUrl = new URL(url.toString());
    normalizedUrl.searchParams.set("w", width.toString());
    normalizedUrl.searchParams.set("q", quality.toString());
    
    // We vary by 'Accept' header because 'format: auto' serves different bytes for different browsers
    const cacheKey = new Request(normalizedUrl.toString(), {
      headers: { "accept": request.headers.get("accept") || "" }
    });
    
    let response = await cache.match(cacheKey);
    if (response) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("x-cache", "HIT");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // 5. Security Check (Referer)
    const referer = request.headers.get("Referer");
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const allowedDomains: string[] = JSON.parse(env.ALLOWED_DOMAINS || "[]");

        const isAllowed = allowedDomains.some(domain => 
          refererUrl.hostname === domain || 
          refererUrl.hostname.endsWith("." + domain) ||
          refererUrl.hostname === "localhost" ||
          refererUrl.hostname === "127.0.0.1"
        );

        if (!isAllowed) {
          return new Response("Forbidden: Domain not authorized", { status: 403 });
        }
      } catch (e) {
        return new Response("Invalid Referer header", { status: 400 });
      }
    }

    // 6. Source Fetch with Resizing
    const originBase = env.IMAGES_ORIGIN_URL.replace(/\/$/, "");
    const originUrl = `${originBase}${url.pathname}`;
    
    const imageOptions = {
      width,
      quality,
      format: "auto",
      fit: "scale-down",
      metadata: "none",
      sharpen: 1.0,
    };

    try {
      // Fetch from origin via Cloudflare Resizing service
      response = await fetch(originUrl, {
        cf: { image: imageOptions },
        headers: { "Accept": request.headers.get("Accept") || "" }
      });

      // 7. Post-Fetch Processing & Caching
      if (response.ok || response.status === 304) {
        const cacheResponse = new Response(response.body, response);
        
        // Cache for 1 year (Standard for immutable assets)
        cacheResponse.headers.set("Cache-Control", "public, max-age=31536000, immutable");
        cacheResponse.headers.set("Vary", "Accept");
        cacheResponse.headers.set("x-cache", "MISS");
        
        // Async cache storage
        ctx.waitUntil(cache.put(cacheKey, cacheResponse.clone()));
        
        return cacheResponse;
      }

      // Handle common errors
      if (response.status === 404) {
        return new Response("Image not found at origin", { status: 404 });
      }

      return response;
    } catch (err) {
      console.error(`[Error] Fetch failed: ${err}`);
      return new Response("Internal Server Error during image processing", { status: 500 });
    }
  },
};
