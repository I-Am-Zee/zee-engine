globalThis.process ??= {}; globalThis.process.env ??= {};
import crypto from 'crypto';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("[verify] Verifying Razorpay payment");
    console.log("[verify] Order ID:", body.razorpay_order_id || "N/A (direct payment)");
    console.log("[verify] Payment ID:", body.razorpay_payment_id);
    console.log("[verify] Payment Session ID:", body.paymentSessionId);
    if (body.amount) console.log("[verify] Amount:", body.amount, body.currency);
    if (!body.razorpay_payment_id || !body.paymentSessionId) {
      return new Response(JSON.stringify({
        error: "Missing required fields: razorpay_payment_id, paymentSessionId"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (body.razorpay_order_id && body.razorpay_signature) {
      console.log("[verify] Order-based payment - verifying signature...");
      const isValidSignature = verifyRazorpaySignature(
        body.razorpay_order_id,
        body.razorpay_payment_id,
        body.razorpay_signature,
        "4EJFjX5TtcyEd91ubbjlqn1P"
      );
      if (!isValidSignature) {
        console.error("[verify] Invalid Razorpay signature!");
        await notifySnipcartPayment(body.paymentSessionId, "failed", body.razorpay_payment_id, {
          code: "signature_verification_failed",
          message: "Payment signature verification failed"
        });
        return new Response(JSON.stringify({
          error: "Invalid payment signature",
          success: false
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      console.log("[verify] Signature verified successfully!");
    } else {
      console.log("[verify] Direct payment (no order) - proceeding without signature verification");
    }
    const snipcartResult = await notifySnipcartPayment(
      body.paymentSessionId,
      "processed",
      body.razorpay_payment_id
    );
    if (!snipcartResult.success) {
      console.error("[verify] Failed to confirm with Snipcart:", snipcartResult.error);
      return new Response(JSON.stringify({
        error: "Failed to confirm payment with Snipcart",
        details: snipcartResult.error,
        success: false
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("[verify] Payment confirmed with Snipcart!");
    return new Response(JSON.stringify({
      success: true,
      message: "Payment verified and confirmed",
      redirectUrl: snipcartResult.redirectUrl
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[verify] Error:", error);
    return new Response(JSON.stringify({
      error: "Verification failed",
      details: error.message || "Unknown error",
      success: false
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
function verifyRazorpaySignature(orderId, paymentId, signature, secret) {
  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
  } catch {
    return false;
  }
}
async function notifySnipcartPayment(paymentSessionId, state, transactionId, error) {
  try {
    const snipcartSecretKey = "ST_Mzg4YmFmZjMtZGFhZS00MmE1LTk2YjctZGRiY2I2YWY4MzNhNjM5MDU3MzE1NDEwMzkyMTc0";
    const payload = {
      paymentSessionId,
      state,
      transactionId
    };
    if (error) {
      payload.error = error;
    }
    console.log("[verify] Notifying Snipcart:", JSON.stringify(payload));
    const response = await fetch(
      "https://payment.snipcart.com/api/private/custom-payment-gateway/payment",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${snipcartSecretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[verify] Snipcart API error:", response.status, errorText);
      return { success: false, error: errorText };
    }
    const result = await response.json();
    console.log("[verify] Snipcart response:", JSON.stringify(result));
    return {
      success: true,
      redirectUrl: result.returnUrl || result.paymentAuthorizationRedirectUrl
    };
  } catch (error2) {
    console.error("[verify] Snipcart notification error:", error2);
    return { success: false, error: error2.message };
  }
}
const GET = async () => {
  return new Response(JSON.stringify({
    message: "Razorpay Payment Verification Endpoint",
    status: "ready",
    hint: "POST with razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentSessionId"
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
