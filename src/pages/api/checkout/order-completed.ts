// This route must be server-rendered to accept POST bodies
export const prerender = false;

import type { APIRoute } from "astro";
import { getEntry } from "astro:content";
import shippingConfig from "../../../config/shipping.json";

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
    const isSyncEnabled = import.meta.env.SHIPROCKET_SYNC_ENABLED === "true";
    
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
    
    const billingName = (order.billingAddressName || "Customer").split(" ");
    const shippingName = (order.shippingAddressName || "Customer").split(" ");
    
    const pickupLocation = import.meta.env.SHIPROCKET_PICKUP_LOCATION || "Home";

    // 2. Map Items & Slabs
    let totalWeightSumKg = 0;
    let selectedSlabId = shippingConfig.default_slab;
    let maxSlabWeight = 0;

    const orderItems = await Promise.all(order.items.map(async (item: any) => {
      // Fetch product metadata for slab info
      // Use the technical slug from metadata if available (added in ecommerce.ts refactor)
      // Otherwise fallback to item.id (which might be the SKU or Slug)
      const lookupId = item.metadata?.slug || item.id;
      const productEntry = await getEntry("products", lookupId);
      
      const weightFromData = productEntry?.data?.weight || item.weight || 0;
      const productSlabId = productEntry?.data?.shipping_slab;

      totalWeightSumKg += (weightFromData * item.quantity) / 1000;

      // Track the "largest" slab based on minimum weight or specific hierarchy
      if (productSlabId && shippingConfig.slabs[productSlabId as keyof typeof shippingConfig.slabs]) {
        const slab = shippingConfig.slabs[productSlabId as keyof typeof shippingConfig.slabs];
        if (slab.weight_kg > maxSlabWeight) {
          maxSlabWeight = slab.weight_kg;
          selectedSlabId = productSlabId;
        }
      }
      
      // Prevent Shiprocket 400 "SKU cannot be repeated" error by appending variant data to the SKU.
      // E.g., diamond-tennis-necklace -> diamond-tennis-necklace-16inches
      const variantSuffix = (item.customFields || [])
        .map((cf: any) => String(cf.displayValue || cf.value || "").replace(/[^a-zA-Z0-9]/g, ""))
        .filter(Boolean)
        .join("-");
      
      const safeSku = variantSuffix ? `${item.id}-${variantSuffix}`.substring(0, 50) : item.id;
      
      // Pack the variant descriptions cleanly into the Name string so the warehouse packer sees it
      const variantNames = (item.customFields || [])
        .map((cf: any) => `${cf.name}: ${cf.displayValue || cf.value}`)
        .join(", ");
      const safeName = variantNames ? `${item.name} (${variantNames})` : item.name;

      return {
        name: safeName.substring(0, 50),
        sku: safeSku,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 3, // Shiprocket expects the tax PERCENTAGE, not the absolute amount. 3% for HSN 7117.
        hsn: item.metadata?.hsn || "7117"
      };
    }));

    // Final Slab Resolution
    const finalSlab = shippingConfig.slabs[selectedSlabId as keyof typeof shippingConfig.slabs];
    const finalWeightKg = Math.max(totalWeightSumKg, finalSlab.weight_kg, 0.5);

    // 3. Payment & Shipping Mode
    const isExpress = order.shippingMethod?.toLowerCase().includes("express");
    const formattedOrderId = isExpress ? `${orderId}-EXPRESS` : `${orderId}-STD`;
    
    // Detect COD (Snipcart "Deferred" or "Manual" payment)
    const normalizedMethod = (order.paymentMethod || "").toLowerCase();
    const normalizedStatus = (order.paymentStatus || "").toLowerCase();
    
    // Snipcart's "Pay Later" (Deferred) shows up with paymentStatus: 'deferred'
    // Manual payments (e.g. Bank Transfer) also count as COD for logistics
    const isCOD = normalizedMethod.includes('deferred') || 
                  normalizedMethod.includes('manual') || 
                  normalizedMethod.includes('pay later') ||
                  normalizedStatus.includes('deferred') ||
                  normalizedStatus.includes('pending'); 
                  
    const paymentMethodLabel = isCOD ? "COD" : "Prepaid";

    // 4. Build Shiprocket Adhoc Order Payload
    const shiprocketPayload = {
      order_id: formattedOrderId,
      order_date: date,
      pickup_location: pickupLocation,
      channel_id: "",
      comment: `Snipcart Order: ${order.shippingMethod || 'Standard'} | Payment: ${paymentMethodLabel}`,
      billing_customer_name: billingName[0],
      billing_last_name: billingName.slice(1).join(" ") || ".",
      billing_address: order.billingAddressAddress1 || order.shippingAddressAddress1,
      billing_address_2: order.billingAddressAddress2 || order.shippingAddressAddress2 || "",
      billing_city: order.billingAddressCity || order.shippingAddressCity,
      billing_pincode: order.billingAddressPostalCode || order.shippingAddressPostalCode,
      billing_state: order.billingAddressProvince || order.shippingAddressProvince,
      billing_country: order.billingAddressCountry || order.shippingAddressCountry,
      billing_email: order.email,
      billing_phone: order.billingAddressPhone || order.shippingAddressPhone || "",
      shipping_is_billing: true, 
      shipping_customer_name: shippingName[0],
      shipping_last_name: shippingName.slice(1).join(" ") || ".",
      shipping_address: order.shippingAddressAddress1,
      shipping_address_2: order.shippingAddressAddress2 || "",
      shipping_city: order.shippingAddressCity,
      shipping_pincode: order.shippingAddressPostalCode,
      shipping_country: order.shippingAddressCountry,
      shipping_state: order.shippingAddressProvince,
      shipping_email: order.email,
      shipping_phone: order.shippingAddressPhone || "",
      order_items: orderItems,
      payment_method: paymentMethodLabel,
      shipping_charges: order.shippingFees || 0,
      total_discount: order.discountsTotal || 0,
      sub_total: order.subtotal,
      length: finalSlab.dimensions.length,
      breadth: finalSlab.dimensions.breadth,
      height: finalSlab.dimensions.height,
      weight: finalWeightKg
    };

    if (!isSyncEnabled) {
      console.log(`[Shiprocket Order Sync] SKIPPING external sync for Order ${formattedOrderId} (SHIPROCKET_SYNC_ENABLED is false).`);
      console.log("[Shiprocket Order Sync] Order Data:", JSON.stringify(shiprocketPayload, null, 2));
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Order received. Shiprocket sync skipped (Test Mode).",
        test_mode: true,
        mock_order_id: formattedOrderId
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

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
    console.log("[Shiprocket API Raw Response]:", JSON.stringify(srData, null, 2));

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
