globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const prerender = false;
let StripeClass = null;
let stripeLoadError = null;
try {
  const stripeModule = await import('stripe');
  StripeClass = stripeModule.default;
} catch (error) {
  stripeLoadError = "Stripe package not installed. Run: npm install stripe";
  console.warn("[stripe-create-intent]", stripeLoadError);
}
const POST = async ({ request }) => {
  try {
    const stripeSecretKey = undefined                                 ;
    if (!stripeSecretKey) {
      console.error("[stripe-create-intent] STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({
        error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!StripeClass || stripeLoadError) {
      console.error("[stripe-create-intent]", stripeLoadError);
      return new Response(JSON.stringify({
        error: stripeLoadError
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    console.log("[stripe-create-intent] Creating payment intent");
    console.log("[stripe-create-intent] Amount:", body.amount, body.currency);
    console.log("[stripe-create-intent] Session:", body.paymentSessionId);
    const stripe = new StripeClass(stripeSecretKey, {
      apiVersion: "2024-12-18.acacia"
      // Use latest API version
    });
    const amountInCents = Math.round(body.amount * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: body.currency.toLowerCase(),
      receipt_email: body.email,
      metadata: {
        snipcartSessionId: body.paymentSessionId
      }
    });
    console.log("[stripe-create-intent] Payment intent created:", paymentIntent.id);
    return new Response(JSON.stringify({
      clientSecret: paymentIntent.client_secret
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[stripe-create-intent] Error:", error);
    return new Response(JSON.stringify({
      error: error.message || "Failed to create payment intent"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async () => {
  return new Response(JSON.stringify({
    message: "Stripe Create Payment Intent Endpoint",
    status: "not configured",
    hint: "Add STRIPE_SECRET_KEY to environment variables"
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
