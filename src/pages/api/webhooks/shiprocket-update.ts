// This route must be server-rendered to accept POST bodies from Shiprocket
export const prerender = false;

import type { APIRoute } from "astro";

/**
 * Shiprocket Webhook Receiver
 * Synchronizes delivery status updates back to Snipcart.
 * 
 * Expected Shiprocket Status IDs:
 * 6: SHIPPED
 * 7: DELIVERED
 * 8: CANCELLED
 * 9: RTO INITIATED
 * 17: OUT FOR DELIVERY
 * 18: IN TRANSIT
 * 19: DISPATCHED
 */

// Mapping of Shiprocket Status ID -> Snipcart Status String
const STATUS_MAP: Record<number | string, string> = {
  6: "Shipped",      // SHIPPED
  7: "Delivered",    // DELIVERED
  8: "Canceled",     // CANCELLED
  9: "Canceled",     // RTO INITIATED -> Treat as canceled/returned
  17: "Shipped",     // OUT FOR DELIVERY
  18: "Shipped",     // IN TRANSIT
  19: "Dispatched",  // DISPATCHED
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("x-api-key");
    const webhookToken = import.meta.env.SHIPROCKET_WEBHOOK_TOKEN;

    // 1. Security Check
    if (!webhookToken || authHeader !== webhookToken) {
      console.warn("[Shiprocket Webhook] Unauthorized attempt detected.");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const body = await request.json();
    console.log("[Shiprocket Webhook] Received update:", JSON.stringify(body, null, 2));

    const { order_id, current_status_id, current_status } = body;

    if (!order_id || current_status_id === undefined) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // 2. Parse Invoice Number
    // Strip suffixes like -STD or -EXPRESS from INV-1024-STD
    const invoiceNumber = order_id.split("-").slice(0, -1).join("-") || order_id;
    const snipcartStatus = STATUS_MAP[current_status_id];

    if (!snipcartStatus) {
      console.log(`[Shiprocket Webhook] Ignoring status ${current_status} (${current_status_id}) - no mapping defined.`);
      return new Response(JSON.stringify({ message: "Status ignored" }), { status: 200 });
    }

    console.log(`[Shiprocket Webhook] Mapping ${order_id} (Invoice: ${invoiceNumber}) -> Snipcart Status: ${snipcartStatus}`);

    // 3. Find Snipcart Order by Invoice Number
    const snipcartSecret = import.meta.env.SNIPCART_SECRET_API_KEY;
    if (!snipcartSecret) {
      throw new Error("SNIPCART_SECRET_API_KEY is not configured.");
    }

    const authBase64 = Buffer.from(`${snipcartSecret}:`).toString("base64");
    
    const searchResponse = await fetch(`https://app.snipcart.com/api/orders?invoiceNumber=${invoiceNumber}`, {
      headers: {
        "Authorization": `Basic ${authBase64}`,
        "Accept": "application/json"
      }
    });

    if (!searchResponse.ok) {
      const errText = await searchResponse.text();
      console.error(`[Shiprocket Webhook] Snipcart search failed: ${searchResponse.status} ${errText}`);
      return new Response(JSON.stringify({ error: "Failed to find order in Snipcart", details: errText }), { status: 500 });
    }

    const searchData = await searchResponse.json();
    const order = searchData.items?.[0]; // Get the most recent matching order

    if (!order || !order.token) {
      console.warn(`[Shiprocket Webhook] Order ${invoiceNumber} not found in Snipcart.`);
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404 });
    }

    // 4. Update Snipcart Order Status
    console.log(`[Shiprocket Webhook] Updating Snipcart Token ${order.token} to ${snipcartStatus}...`);

    const updateResponse = await fetch(`https://app.snipcart.com/api/orders/${order.token}`, {
      method: "PUT",
      headers: {
        "Authorization": `Basic ${authBase64}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        status: snipcartStatus
      })
    });

    if (!updateResponse.ok) {
      const errText = await updateResponse.text();
      console.error(`[Shiprocket Webhook] Snipcart update failed: ${updateResponse.status} ${errText}`);
      return new Response(JSON.stringify({ error: "Failed to update order status", details: errText }), { status: 500 });
    }

    console.log(`[Shiprocket Webhook] Successfully updated ${invoiceNumber} to ${snipcartStatus}.`);

    return new Response(JSON.stringify({
      success: true,
      order: invoiceNumber,
      new_status: snipcartStatus
    }), { status: 200 });

  } catch (err: any) {
    console.error("[Shiprocket Webhook Error]:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
  }
};
