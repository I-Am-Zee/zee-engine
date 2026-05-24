import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    
    // In local dev without Cloudflare bindings, or if KV is missing, return empty
    if (!env || !env.ZEE_INVENTORY) {
      return new Response(JSON.stringify([]), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=900",
        },
      });
    }

    const brandId = import.meta.env.PUBLIC_BRAND_ID || "zelia-vance";
    const key = `${brandId}:sold_out_registry`;

    const data = await env.ZEE_INVENTORY.get(key, "json");

    return new Response(JSON.stringify(data || []), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=900",
      },
    });
  } catch (error) {
    console.error("[Inventory] Error fetching sold out registry:", error);
    
    // Always default to optimistic "in stock" on error to not block sales
    return new Response(JSON.stringify([]), {
      status: 200, // Returning 200 so UI defaults to normal Add to Cart
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=900",
      },
    });
  }
};
