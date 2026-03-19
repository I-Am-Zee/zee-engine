export const prerender = false;
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersObj[key] = value;
  });
  return new Response(JSON.stringify({ 
    headers: headersObj,
    origin: new URL(request.url).origin
  }));
}
