export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async () => {
    // Reverted: Return empty configuration safely to clear out lingering cached sessions
    // Using Snipcart's native Custom Rates and Discount module for conditional Free Shipping.
    return new Response(JSON.stringify({ rates: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
};
