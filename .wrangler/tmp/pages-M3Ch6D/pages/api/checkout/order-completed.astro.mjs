globalThis.process ??= {}; globalThis.process.env ??= {};
import { g as getEntry } from '../../../chunks/_astro_content_DjB39X_g.mjs';
export { renderers } from '../../../renderers.mjs';

const default_slab = "small-jewelry";
const slabs = {"small-jewelry":{"name":"Small Jewelry Box","weight_kg":0.5,"dimensions":{"length":15,"breadth":15,"height":10}},"medium-box":{"name":"Medium Outer Box","weight_kg":1,"dimensions":{"length":20,"breadth":20,"height":15}},"large-box":{"name":"Large Outer Box","weight_kg":2,"dimensions":{"length":30,"breadth":30,"height":20}}};
const shippingConfig = {
  default_slab,
  slabs,
};

const prerender = false;
let cachedToken = null;
let tokenExpiryTime = null;
async function getShiprocketToken() {
  const email = "logistics@zeliavance.com";
  const password = "BZRHnKCj0S!Z0V^GxGK4^w9uP";
  if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedToken;
  }
  const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Shiprocket] Auth failed: ${response.status} ${errorBody}`);
    throw new Error("Failed to authenticate with Shiprocket");
  }
  const data = await response.json();
  cachedToken = data.token;
  tokenExpiryTime = Date.now() + 9 * 24 * 60 * 60 * 1e3;
  return data.token;
}
const POST = async ({ request }) => {
  try {
    const isSyncEnabled = true;
    let body;
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("[Shiprocket Order Sync] Webhook payload is not valid JSON.", e);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }
    if (body.eventName !== "order.completed") {
      console.warn(`[Shiprocket Order Sync] Ignoring non order-completed event: ${body.eventName}`);
      return new Response(JSON.stringify({ message: "Ignored event type. Only order.completed is processed." }), { status: 200 });
    }
    const { content: order } = body;
    if (!order || !order.token) {
      console.error("[Shiprocket Order Sync] Missing order content in webhook payload.");
      return new Response(JSON.stringify({ error: "Invalid order payload" }), { status: 400 });
    }
    const mlKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZjlkOTAzYjc2ZGU4Y2I4YzE4YjdhN2FmNzkxNjQ3NDA4ZDFiOTY0YmZlZDUxNmYwNzk2MDkwZmFkOGE2NTIxMDIxMTdkMTRmNzhlN2UwNzgiLCJpYXQiOjE3NzQ5NzEwOTkuNDI3NzYxLCJuYmYiOjE3NzQ5NzEwOTkuNDI3NzY1LCJleHAiOjQ5MzA2NDQ2OTkuNDE5MzIxLCJzdWIiOiIyMjUyMDUyIiwic2NvcGVzIjpbXX0.knf2P9b2E6bUZd5WW74bAV8kRKy6ttvrk5EuiANWJT3Wj4kWuB4u8GYbs1wFOwgSqHymqVfGGvtLof2Spgin90dZKGvG5OhSCy_RWqC1KvHnyiHsrb0DV14Uy7mdhPvMOlai9zYYFXYdVAqLwLJfFjkSBSFjC2SRMW7X6wKtS-kxxYc4vPYX-tgl5ShxkYHYnBk7d-rmzbfjeE24fsBmh4zFBa0lnBVGIJVh05R2x4Y3_7q1LEQvWSUoJkVYDsSuuSxR8RNGzC3iQqrpNkB0MaugSSN2TC20uPLYelMeME0bgBVotW7tBb8aqbyG3Drs4naNPfF46NFFpoL-uT-vvBUSYM4n_DbAePmnGofsL7L_Tce5yMd15QZCBrfIDlw1AZZKg6_loQ7gUi4Et-Cy0uNn1T3KBpPKRWQ9f3v06WrwWgoVgzHsI6FlC52EqZlqK2kXskVivhLLfVinNpE5uO71tBcbTR3NobUUO-0ekt5H3VluH8OmM3P_w_ZHfmGisGGH72b3XMvFYUr3SNMO3V8WNILSNgHiqwQAUzgS4BIptsJoEayYZ4kRUo2GO2HEEGHwpYNG0aGGL4suqxBB4ctYSLpZ_JY667KjWLeIx7kI1-aReQ5zqpLRa9-5n2gyLjCJJLa0kTtxa0-mLsN6UoxLY7PVK05Wwo5nIS7r6AQ";
    const mlGroup = "183469983098995840";
    const didSubscribe = order.subscribeToNewsletter === true || order.metadata?.subscribeToNewsletter === true || String(order.metadata?.subscribeToNewsletter).toLowerCase() === "true";
    if (mlKey && mlGroup && order.email && didSubscribe) {
      console.log(`[MailerLite] Checkout opt-in detected for ${order.email}. Adding to group ${mlGroup}...`);
      try {
        const nameParts = (order.billingAddressName || "").split(" ");
        const mlRes = await fetch("https://connect.mailerlite.com/api/subscribers", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${mlKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            email: order.email,
            fields: {
              name: nameParts[0] || "",
              last_name: nameParts.slice(1).join(" ") || ""
            },
            groups: [mlGroup],
            status: "active"
          })
        });
        if (mlRes.ok) {
          console.log(`[MailerLite] ✓ ${order.email} added to Newsletter group.`);
        } else {
          const mlErr = await mlRes.text();
          if (mlRes.status === 409) {
            console.log(`[MailerLite] ${order.email} already subscribed. No action needed.`);
          } else {
            console.warn(`[MailerLite] Non-fatal error ${mlRes.status}: ${mlErr}`);
          }
        }
      } catch (mlErr) {
        console.warn("[MailerLite] Call failed (non-fatal):", mlErr.message);
      }
    } else if (mlKey && mlGroup && order.email && !didSubscribe) {
      console.log(`[MailerLite] ${order.email} opted out at checkout. Skipping.`);
    }
    const orderId = order.invoiceNumber || order.token.substring(0, 10);
    const date = new Date(order.creationDate).toISOString().replace("T", " ").substring(0, 16);
    const billingName = (order.billingAddressName || "Customer").split(" ");
    const shippingName = (order.shippingAddressName || "Customer").split(" ");
    const pickupLocation = "Home";
    let totalWeightSumKg = 0;
    let selectedSlabId = shippingConfig.default_slab;
    let maxSlabWeight = 0;
    const orderItems = await Promise.all(order.items.map(async (item) => {
      const lookupId = item.metadata?.slug || item.id;
      const productEntry = await getEntry("products", lookupId);
      const weightFromData = productEntry?.data?.weight || item.weight || 0;
      const productSlabId = productEntry?.data?.shipping_slab;
      totalWeightSumKg += weightFromData * item.quantity / 1e3;
      if (productSlabId && shippingConfig.slabs[productSlabId]) {
        const slab = shippingConfig.slabs[productSlabId];
        if (slab.weight_kg > maxSlabWeight) {
          maxSlabWeight = slab.weight_kg;
          selectedSlabId = productSlabId;
        }
      }
      const variantSuffix = (item.customFields || []).map((cf) => String(cf.displayValue || cf.value || "").replace(/[^a-zA-Z0-9]/g, "")).filter(Boolean).join("-");
      const safeSku = variantSuffix ? `${item.id}-${variantSuffix}`.substring(0, 50) : item.id;
      const variantNames = (item.customFields || []).map((cf) => `${cf.name}: ${cf.displayValue || cf.value}`).join(", ");
      const safeName = variantNames ? `${item.name} (${variantNames})` : item.name;
      return {
        name: safeName.substring(0, 50),
        sku: safeSku,
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 3,
        // Shiprocket expects the tax PERCENTAGE, not the absolute amount. 3% for HSN 7117.
        hsn: item.metadata?.hsn || "7117"
      };
    }));
    const finalSlab = shippingConfig.slabs[selectedSlabId];
    const finalWeightKg = Math.max(totalWeightSumKg, finalSlab.weight_kg, 0.5);
    const isExpress = order.shippingMethod?.toLowerCase().includes("express");
    const formattedOrderId = isExpress ? `${orderId}-EXPRESS` : `${orderId}-STD`;
    const normalizedMethod = (order.paymentMethod || "").toLowerCase();
    const normalizedStatus = (order.paymentStatus || "").toLowerCase();
    const isCOD = normalizedMethod.includes("deferred") || normalizedMethod.includes("manual") || normalizedMethod.includes("pay later") || normalizedStatus.includes("deferred") || normalizedStatus.includes("pending");
    const paymentMethodLabel = isCOD ? "COD" : "Prepaid";
    const shiprocketPayload = {
      order_id: formattedOrderId,
      order_date: date,
      pickup_location: pickupLocation,
      channel_id: "",
      comment: `Snipcart Order: ${order.shippingMethod || "Standard"} | Payment: ${paymentMethodLabel}`,
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
    if (!isSyncEnabled) ;
    console.log(`[Shiprocket Order Sync] Syncing Order ${formattedOrderId} to Shiprocket...`);
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
  } catch (err) {
    console.error("[Shiprocket Order Sync Error]:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
