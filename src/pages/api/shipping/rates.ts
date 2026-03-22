export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const cart = body.content;
        
        // Define shipping threshold and flat rate
        const FREE_SHIPPING_THRESHOLD = 3000;
        const FLAT_SHIPPING_RATE = 150;
        
        // Calculate dynamic shipping cost
        const subtotal = cart?.subtotal || 0;
        const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
        
        const cost = isFreeShipping ? 0 : FLAT_SHIPPING_RATE;
        const description = isFreeShipping 
            ? "Free Insured Delivery (3-5 Business Days)" 
            : "Standard Insured Delivery (3-5 Business Days)";

        return new Response(JSON.stringify({
            rates: [
                {
                    cost: cost,
                    description: description,
                    guaranteedDaysToDelivery: 5
                }
            ]
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        // Fallback safety net so checkout never crashes completely
        return new Response(JSON.stringify({
            rates: [
                {
                    cost: 150,
                    description: "Standard Delivery (Fallback)"
                }
            ]
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }
};
