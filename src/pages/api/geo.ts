export const prerender = false;

import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  // Cloudflare provides geographic metadata via headers
  // The 'cf-ipcountry' header holds the 2-letter ISO country code
  const countryCode = request.headers.get("cf-ipcountry") || "XX";
  
  // Map country to our internal regions
  let region = "global";
  if (countryCode === "IN") {
    region = "india";
  }

  return new Response(JSON.stringify({ region, countryCode }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
