import type { APIRoute } from "astro";
import { generateVariantKey } from "../../../scripts/utils/inventory";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const adminSecret = env?.KV_ADMIN_SECRET || import.meta.env.KV_ADMIN_SECRET;
    const snipcartSecret = env?.SNIPCART_SECRET_API_KEY || import.meta.env.SNIPCART_SECRET_API_KEY;

    // ── 1. Security Check ──
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    if (!snipcartSecret) {
      throw new Error("SNIPCART_SECRET_API_KEY is not configured");
    }

    // ── 2. Fetch Live Inventory from Snipcart ──
    // We fetch the first 100 products. For very large catalogs, this would need pagination.
    const snipcartRes = await fetch("https://app.snipcart.com/api/products?limit=100", {
      headers: {
        "Authorization": `Basic ${btoa(snipcartSecret + ":")}`,
        "Accept": "application/json"
      }
    });

    if (!snipcartRes.ok) {
      const errorText = await snipcartRes.text();
      console.error("[Reconcile] Snipcart API Error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to fetch products from Snipcart" }), { status: 502 });
    }

    const data = await snipcartRes.json() as any;
    const allProducts = data.items || [];

    // ── 3. Map Sold Out Items & Variants ──
    const registry: Record<string, string[]> = {};

    allProducts.forEach((product: any) => {
      const soldOuts: string[] = [];
      const productId = product.userDefinedId;

      if (Array.isArray(product.variants) && product.variants.length > 0) {
        product.variants.forEach((v: any) => {
          if (v.stock === 0) {
            const variantKey = generateVariantKey(v.options);
            soldOuts.push(variantKey);
          }
        });

        const allVariantsSoldOut = product.variants.every((v: any) => v.stock === 0);
        if (allVariantsSoldOut || product.stock === 0) {
          if (!soldOuts.includes("__all__")) soldOuts.push("__all__");
        }
      } else if (product.stock === 0) {
        soldOuts.push("__all__");
      }

      if (soldOuts.length > 0) {
        registry[productId] = soldOuts;
      }
    });

    // ── 4. Rebuild KV Registry ──
    const brandId = import.meta.env.PUBLIC_BRAND_ID || "zelia-vance";
    const key = `${brandId}:sold_out_registry`;

    if (env?.ZEE_INVENTORY) {
      await env.ZEE_INVENTORY.put(key, JSON.stringify(registry));
      console.log(`[Reconcile] Registry rebuilt for ${brandId}. ${Object.keys(registry).length} products affected.`);
      
      return new Response(JSON.stringify({
        success: true,
        count: Object.keys(registry).length,
        registry,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      // Local dev / Test mode fallback
      console.log(`[Reconcile] [TEST MODE] Registry:`, registry);
      return new Response(JSON.stringify({
        success: true,
        message: "Test mode: KV update skipped",
        count: Object.keys(registry).length,
        registry
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error: any) {
    console.error("[Reconcile] Critical Error:", error.message);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), { status: 500 });
  }
};
