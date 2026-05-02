export const prerender = false;

import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json() as any;
        const cart = body.content;
        
        // Define shipping threshold and flat rates
        const FREE_SHIPPING_THRESHOLD = 3000;
        const STANDARD_RATE = 70;
        const EXPRESS_RATE = 150;
        
        // Calculate dynamic shipping cost
        const subtotal = cart?.subtotal || 0;
        const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
        
        const standardCost = isFreeShipping ? 0 : STANDARD_RATE;

        return new Response(JSON.stringify({
            rates: [
                {
                    cost: standardCost,
                    description: "Standard Delivery",
                    userDefinedId: "standard",
                    guaranteedDaysToDelivery: 5
                },
                {
                    cost: EXPRESS_RATE,
                    description: "Express Delivery",
                    userDefinedId: "express",
                    guaranteedDaysToDelivery: 2
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
                    description: "Standard Delivery (Fallback)",
                    userDefinedId: "fallback"
                }
            ]
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }
};
