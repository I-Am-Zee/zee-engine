globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const GATEWAYS = {
  razorpay: {
    id: "razorpay",
    name: "UPI, Cards, Wallets",
    // Razorpay Optimizer handles routing across all methods
    supportedCountries: ["IN"],
    supportedCurrencies: ["INR"],
    enabled: true
    // iconUrl intentionally omitted — external Razorpay CDN URL was unreliable
    // Snipcart renders the name label cleanly without an icon
  },
  stripe: {
    id: "stripe",
    name: "Credit/Debit Card",
    supportedCountries: ["US", "GB", "CA", "AU", "SG", "AE"],
    // Add more as needed
    supportedCurrencies: ["USD", "GBP", "CAD", "AUD", "SGD", "AED"],
    enabled: false
    // Will enable when ready for international
  }
};
function getGatewaysForCountry(countryCode) {
  return Object.values(GATEWAYS).filter(
    (gateway) => gateway.enabled && gateway.supportedCountries.includes(countryCode)
  );
}

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    console.log("[payment-methods] Received request from Snipcart");
    console.log("[payment-methods] Mode:", body.mode);
    console.log("[payment-methods] Amount:", body.invoice.amount, body.invoice.currency);
    console.log("[payment-methods] Billing Country:", body.invoice.billingAddress?.country);
    console.log("[payment-methods] Public Token:", body.publicToken?.substring(0, 20) + "...");
    const customerCountry = body.invoice.billingAddress?.country || body.invoice.shippingAddress?.country || "IN";
    console.log("[payment-methods] Selected country:", customerCountry);
    const hostHeader = request.headers.get("host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");
    const effectiveHost = forwardedHost || hostHeader;
    let siteUrl;
    if (effectiveHost && !effectiveHost.includes("localhost") && !effectiveHost.includes("127.0.0.1")) {
      const protocol = forwardedProto === "https" ? "https" : "https";
      siteUrl = `${protocol}://${effectiveHost}`;
    } else {
      siteUrl = new URL(request.url).origin;
      if ((siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) && "https://dev.zeliavance.com/") {
        siteUrl = "https://dev.zeliavance.com/".replace(/\/$/, "");
      }
    }
    const availableGateways = getGatewaysForCountry(customerCountry);
    if (availableGateways.length === 0) {
      console.error("[payment-methods] No gateways available for country:", customerCountry);
      return new Response(JSON.stringify({
        error: `Payment is not available for your location (${customerCountry}). Please contact support.`
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const paymentMethods = availableGateways.map((gateway) => ({
      id: gateway.id,
      name: gateway.name,
      checkoutUrl: `${siteUrl}/checkout/${gateway.id}`,
      ...gateway.iconUrl ? { iconUrl: gateway.iconUrl } : {}
    }));
    console.log("[payment-methods] Returning", paymentMethods.length, "payment methods");
    console.log("[payment-methods] Methods:", paymentMethods.map((m) => m.id).join(", "));
    return new Response(JSON.stringify(paymentMethods), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[payment-methods] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const GET = async () => {
  return new Response(JSON.stringify({
    message: "Snipcart Payment Methods Endpoint",
    status: "ready",
    hint: "This endpoint expects POST requests from Snipcart"
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
