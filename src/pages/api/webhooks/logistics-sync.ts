// This route must be server-rendered to accept POST bodies 
export const prerender = false;

import type { APIRoute } from "astro";
import { getEntry } from "astro:content";

/**
 * Logistics Webhook Receiver (formerly shiprocket-update)
 * Synchronizes delivery status updates back to Snipcart.
 * (Renamed to avoid Shiprocket's URL keyword blocklist)
 * 
 * Per Documentation (https://apidocs.shiprocket.in/#webhooks):
 * - Method: POST
 * - Response: MUST be 200 OK for ALL validation pings.
 * - Security: Passed via x-api-key header.
 */

// Mapping of Shiprocket Status ID -> Snipcart Status String
// Per User Request: Strictly tracking only Delivered, Cancelled, and RTO (Disputed)
const STATUS_MAP: Record<number | string, string> = {
  7: "Delivered",    // DELIVERED
  8: "Cancelled",    // CANCELLED
  9: "Disputed",     // RTO INITIATED -> Treat as Disputed
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // 1. Initial Handshake & Safety Check
    // We return 200 OK for everything to satisfy Shiprocket's validator, 
    // and then process the real logic if the ID exists.
    
    let body: any = {};
    const clonedRequest = request.clone();
    try {
      const text = await clonedRequest.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      console.log("[Logistics Webhook] Received malformed/empty test ping.");
      return new Response(JSON.stringify({ message: "Ping Received" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // A. Shiprocket Test/Save Validation Ping
    if (!body.order_id || body.test || body.current_status === "TEST") {
      console.log("[Logistics Webhook] Shiprocket Validation Successful.");
      return new Response(JSON.stringify({ message: "Validation Successful" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // B. Security Check for REAL payloads
    const authHeader = request.headers.get("x-api-key") || request.headers.get("X-Api-Key");
    const webhookToken = import.meta.env.SHIPROCKET_WEBHOOK_TOKEN;

    if (!webhookToken || authHeader !== webhookToken) {
      console.warn("[Logistics Webhook] Unauthorized real payload attempt. Check TOKEN.");
      // We still return 200 to keep Shiprocket happy, but we exit without doing anything.
      return new Response(JSON.stringify({ error: "Unauthorized (Silent Exit)" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    console.log("[Logistics Webhook] Processing Update:", JSON.stringify(body, null, 2));

    const { order_id, current_status_id, current_status } = body;
    const snipcartStatus = STATUS_MAP[current_status_id];

    // C. Status Filter
    if (!snipcartStatus) {
      console.log(`[Logistics Webhook] Ignoring status: ${current_status} (${current_status_id})`);
      return new Response(JSON.stringify({ message: "Status Ignored" }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
      });
    }

    // D. Snipcart Update
    const invoiceNumber = order_id.split("-").slice(0, -1).join("-") || order_id;
    const snipcartSecret = import.meta.env.SNIPCART_SECRET_API_KEY;
    if (!snipcartSecret) throw new Error("SNIPCART_SECRET_API_KEY is missing.");

    const authBase64 = Buffer.from(`${snipcartSecret}:`).toString("base64");
    
    // Find the order
    const searchResponse = await fetch(`https://app.snipcart.com/api/orders?invoiceNumber=${invoiceNumber}`, {
      headers: { "Authorization": `Basic ${authBase64}`, "Accept": "application/json" }
    });

    if (!searchResponse.ok) {
      console.error(`[Logistics Webhook] Order search failed: ${searchResponse.status}`);
      return new Response(null, { status: 200 }); // Still 200 for Shiprocket
    }

    const searchData = await searchResponse.json() as any;
    const order = searchData.items?.[0];

    if (!order || !order.token) {
      console.warn(`[Logistics Webhook] Order ${invoiceNumber} not found.`);
      return new Response(null, { status: 200 });
    }

    // Perform Update
    console.log(`[Logistics Webhook] Syncing ${invoiceNumber} -> ${snipcartStatus}...`);
    const updateResponse = await fetch(`https://app.snipcart.com/api/orders/${order.token}`, {
      method: "PUT",
      headers: {
        "Authorization": `Basic ${authBase64}`,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ status: snipcartStatus })
    });

    if (updateResponse.ok) {
      console.log(`[Logistics Webhook] Status updated: ${invoiceNumber} -> ${snipcartStatus}.`);

      // E. Trigger Delivery Email + MailerLite Signup (ONLY for Delivered)
      if (snipcartStatus === "Delivered") {
        console.log(`[Logistics Webhook] Triggering delivery notification for ${invoiceNumber}...`);

        const brandSettings = await getEntry("settings", "brand");
        const marketingSettings = await getEntry("settings", "marketing");
        
        const brandData = brandSettings?.data;
        const marketingData = marketingSettings?.data;

        if (!brandData) throw new Error("[Logistics Webhook] 'settings/brand' not found.");
        
        const brandName = brandData.name;
        const feedbackUrl = brandData.feedback_url || "";
        const siteUrl = brandData.site_url || "";
        const newsletterUrl = `${siteUrl}/newsletter/confirm?email=${encodeURIComponent(order.email)}`;

        // Get template from CMS or use a generic fallback if missing
        let deliveryMessage = marketingData?.delivery_email_template || 
          "<p>Your order has been delivered. Thank you for shopping with {{brandName}}.</p>";

        // Injections
        deliveryMessage = deliveryMessage
          .replace(/{{brandName}}/g, brandName)
          .replace(/{{feedbackUrl}}/g, feedbackUrl)
          .replace(/{{newsletterUrl}}/g, newsletterUrl);
        
        const notifyResponse = await fetch(`https://app.snipcart.com/api/orders/${order.token}/notifications`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authBase64}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            type: "Comment",
            deliveryMethod: "Email",
            message: deliveryMessage,
          })
        });
        
        if (notifyResponse.ok) {
          console.log(`[Logistics Webhook] Notification triggered successfully for ${invoiceNumber}.`);
        } else {
          const errorText = await notifyResponse.text();
          console.error(`[Logistics Webhook] Notification failed: ${notifyResponse.status} - ${errorText}`);
        }

        // F. MailerLite signup is now consent-driven.
        // The 'stay in the loop' link above passes order.email to /newsletter/confirm.
        // The customer clicks 'Confirm' on that page → /api/actions/newsletter-subscribe fires.
        // This keeps signup 100% opt-in and DPDP-compliant.
      }
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    console.error("[Logistics Webhook Error]:", err);
    return new Response(JSON.stringify({ error: "Internal processing error" }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  }
};

// GET fallback for validation
export const GET: APIRoute = async () => {
    return new Response(JSON.stringify({ message: "Logistics Webhook is active." }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
};
