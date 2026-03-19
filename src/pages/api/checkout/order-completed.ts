// This route must be server-rendered to accept POST bodies
export const prerender = false;

import type { APIRoute } from "astro";

// Global cache for Shiprocket Auth Token to avoid logging in on every request under high load
let cachedToken: string | null = null;
let tokenExpiryTime: number | null = null;

async function getShiprocketToken(): Promise<string> {
  const email = import.meta.env.SHIPROCKET_EMAIL;
  const password = import.meta.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials not configured");
  }

  // Use cached token if valid (assuming 9 days expiry for safety, actual is 10 days)
  if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Shiprocket] Auth failed: ${response.status} ${errorBody}`);
    throw new Error("Failed to authenticate with Shiprocket");
  }

  const data = await response.json();
  cachedToken = data.token;
  tokenExpiryTime = Date.now() + 9 * 24 * 60 * 60 * 1000;
  
  return data.token;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    let body;
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("[Shiprocket Order Sync] Webhook payload is not valid JSON.", e);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }
    
    // Snipcart event validation
    if (body.eventName !== "order.completed") {
      console.warn(`[Shiprocket Order Sync] Ignoring non order-completed event: ${body.eventName}`);
      return new Response(JSON.stringify({ message: "Ignored event type. Only order.completed is processed." }), { status: 200 });
    }

    const { content: order } = body;
    
    if (!order || !order.token) {
      console.error("[Shiprocket Order Sync] Missing order content in webhook payload.");
      return new Response(JSON.stringify({ error: "Invalid order payload" }), { status: 400 });
    }

    // 1. Snipcart Payload Extraction
    const orderId = order.invoiceNumber || order.token.substring(0, 10);
    const date = new Date(order.creationDate).toISOString().replace('T', ' ').substring(0, 16);
    
    const billingName = order.billingAddressName.split(" ");
    const shippingName = order.shippingAddressName.split(" ");
    
    const pickupLocation = import.meta.env.SHIPROCKET_PICKUP_LOCATION || "Primary";

    // 2. Map Items
    let totalWeightKg = 0;
    const orderItems = order.items.map((item: any) => {
      // Snipcart item weight is typically in grams if not defined. 
      // Treat default as 500g if missing.
      const wGrams = item.weight || 500;
      totalWeightKg += (wGrams * item.quantity) / 1000;
      
      return {
        name: item.name,
        sku: item.id,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: item.taxesTotal || 0,
        hsn: ""
      };
    });

    if (totalWeightKg < 0.5) totalWeightKg = 0.5;

    // 3. Courier Mode Logic (Standard vs Express)
    // Shiprocket API doesn't strictly have a "mode" field in Adhoc order creation.
    // However, you can tag the order or add a sub-order ID suffix, 
    // OR we append the shipping choice to the order ID so it's instantly obvious in the dashboard.
    const isExpress = order.shippingMethod?.toLowerCase().includes("express");
    const formattedOrderId = isExpress ? `${orderId}-EXPRESS` : `${orderId}-STD`;

    // 4. Build Shiprocket Adhoc Order Payload
    const shiprocketPayload = {
      order_id: formattedOrderId,
      order_date: date,
      pickup_location: pickupLocation,
      channel_id: "",
      comment: `Snipcart Order: ${order.shippingMethod || 'Standard'}`,
      billing_customer_name: billingName[0],
      billing_last_name: billingName.slice(1).join(" "),
      billing_address: order.billingAddressAddress1 || order.shippingAddressAddress1,
      billing_address_2: order.billingAddressAddress2 || order.shippingAddressAddress2 || "",
      billing_city: order.billingAddressCity || order.shippingAddressCity,
      billing_pincode: order.billingAddressPostalCode || order.shippingAddressPostalCode,
      billing_state: order.billingAddressProvince || order.shippingAddressProvince,
      billing_country: order.billingAddressCountry || order.shippingAddressCountry,
      billing_email: order.email,
      billing_phone: order.billingAddressPhone || order.shippingAddressPhone || "0000000000",
      shipping_is_billing: true, // We simplify and just use shipping as the primary fulfillment address
      shipping_customer_name: shippingName[0],
      shipping_last_name: shippingName.slice(1).join(" "),
      shipping_address: order.shippingAddressAddress1,
      shipping_address_2: order.shippingAddressAddress2 || "",
      shipping_city: order.shippingAddressCity,
      shipping_pincode: order.shippingAddressPostalCode,
      shipping_country: order.shippingAddressCountry,
      shipping_state: order.shippingAddressProvince,
      shipping_email: order.email,
      shipping_phone: order.shippingAddressPhone || "0000000000",
      order_items: orderItems,
      payment_method: "Prepaid", // Razorpay/Stripe covers this
      shipping_charges: order.shippingFees || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.discountsTotal || 0,
      sub_total: order.subtotal,
      length: 10,
      breadth: 15,
      height: 20,
      weight: totalWeightKg
    };

    console.log(`[Shiprocket Order Sync] Syncing Order ${formattedOrderId} to Shiprocket...`);

    // 5. Authenticate and Send Application POST
    const token = await getShiprocketToken();
    const srResponse = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(shiprocketPayload)
    });

    const srData = await srResponse.json();

    if (!srResponse.ok) {
      console.error(`[Shiprocket Order Sync] Failed to create order ${formattedOrderId}`, srData);
      return new Response(JSON.stringify({ error: "Failed to create Shiprocket Order", details: srData }), { status: 500 });
    }

    console.log(`[Shiprocket Order Sync] Successfully created Shiprocket Order ID: ${srData.order_id} (Shipment ID: ${srData.shipment_id})`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Order synchronized to Shiprocket successfully.",
      shiprocket_order_id: srData.order_id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("[Shiprocket Order Sync Error]:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
  }
};
