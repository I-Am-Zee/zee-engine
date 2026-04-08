globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("[initiate] Creating Razorpay order");
    console.log("[initiate] Amount:", body.amount, body.currency);
    console.log("[initiate] Payment Session ID:", body.paymentSessionId);
    if (!body.amount || !body.currency || !body.paymentSessionId) {
      return new Response(JSON.stringify({
        error: "Missing required fields: amount, currency, paymentSessionId"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const keyId = "rzp_test_SBluedEOx8ViuP"?.trim();
    const keySecret = "4EJFjX5TtcyEd91ubbjlqn1P"?.trim();
    console.log("[initiate] Key ID:", keyId ? `${keyId.substring(0, 12)}...` : "MISSING");
    console.log("[initiate] Key Secret:", keySecret ? `${keySecret.substring(0, 8)}...` : "MISSING");
    if (!keyId || !keySecret) {
      throw new Error("Razorpay API keys are not configured");
    }
    const amountInPaise = Math.round(body.amount * 100);
    const orderData = {
      amount: amountInPaise,
      currency: body.currency.toUpperCase(),
      receipt: body.receipt || `snipcart_${body.paymentSessionId}`,
      notes: {
        snipcart_payment_session_id: body.paymentSessionId,
        customer_email: body.customerEmail || "",
        customer_name: body.customerName || ""
      }
    };
    console.log("[initiate] Creating order via REST API:", orderData);
    const authString = `${keyId}:${keySecret}`;
    const authHeader = `Basic ${Buffer.from(authString).toString("base64")}`;
    console.log("[initiate] Auth header created (first 20 chars):", authHeader.substring(0, 20) + "...");
    try {
      const response = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authHeader
        },
        body: JSON.stringify(orderData)
      });
      console.log("[initiate] Razorpay API response status:", response.status);
      const responseText = await response.text();
      console.log("[initiate] Razorpay API response:", responseText);
      if (!response.ok) {
        throw new Error(`Razorpay API returned ${response.status}: ${responseText}`);
      }
      const order = JSON.parse(responseText);
      console.log("[initiate] Razorpay order created:", order.id);
      return new Response(JSON.stringify({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (rzpError) {
      console.error("[initiate] Razorpay API Error:", {
        message: rzpError.message,
        stack: rzpError.stack
      });
      throw rzpError;
    }
  } catch (error) {
    console.error("[initiate] Error:", error);
    return new Response(JSON.stringify({
      error: "Failed to create Razorpay order",
      details: error.message || "Unknown error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async () => {
  const hasKeyId = true;
  const hasKeySecret = true;
  return new Response(JSON.stringify({
    message: "Razorpay Order Initiation Endpoint",
    status: "ready",
    config: {
      hasKeyId,
      hasKeySecret,
      keyIdPrefix: "rzp_test_SBluedEOx8ViuP".substring(0, 8) + "..."
    }
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
