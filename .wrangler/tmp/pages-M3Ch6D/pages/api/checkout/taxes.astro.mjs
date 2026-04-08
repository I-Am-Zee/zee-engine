globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    let body;
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("[Snipcart Taxes Webhook] Payload is not valid JSON.", e);
      return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
    }
    if (body.eventName !== "taxes.calculate") {
      console.warn(`[Snipcart Taxes Webhook] Ignoring non-taxes event: ${body.eventName}`);
      return new Response(JSON.stringify({ message: "Ignored event type." }), { status: 200 });
    }
    const { content: order } = body;
    if (!order) {
      return new Response(JSON.stringify({ error: "Invalid order payload" }), { status: 400 });
    }
    const address = order.shippingAddress || order.billingAddress || {};
    const province = (address.province || "").toLowerCase();
    const isPunjab = ["pb", "punjab", "03", "in-pb"].includes(province.trim());
    let taxableSubtotal = 0;
    const taxesToApply = [];
    const hasHSN7117 = (order.items || []).some(
      (item) => item.metadata?.hsn === "7117" || item.customFields?.some((cf) => cf.name === "HSN" && cf.value === "7117")
    );
    (order.items || []).forEach((item) => {
      taxableSubtotal += item.totalPrice || item.price || 0;
    });
    const shippingFees = order.shippingInformation?.fees || order.shippingAddress?.shippingRate || order.shippingRate || 0;
    taxableSubtotal += Number(shippingFees);
    if (taxableSubtotal > 0) {
      if (isPunjab) {
        const totalTaxRate = 0.03;
        const totalTaxAmount = taxableSubtotal - taxableSubtotal / (1 + totalTaxRate);
        const splitAmount = Number((totalTaxAmount / 2).toFixed(2));
        taxesToApply.push({
          name: "CGST (1.5%) [Included in Base Price]",
          amount: splitAmount,
          rate: 0.015,
          includedInPrice: true,
          numberForInvoice: "GSTIN: 03AALFI7890P1ZK"
        });
        taxesToApply.push({
          name: "SGST (1.5%) [Included in Base Price]",
          amount: splitAmount,
          rate: 0.015,
          includedInPrice: true,
          numberForInvoice: "GSTIN: 03AALFI7890P1ZK"
        });
      } else {
        const igstRate = 0.03;
        const igstAmount = Number((taxableSubtotal - taxableSubtotal / (1 + igstRate)).toFixed(2));
        taxesToApply.push({
          name: "IGST (3%) [Included in Base Price]",
          amount: igstAmount,
          rate: igstRate,
          includedInPrice: true,
          numberForInvoice: "GSTIN: 03AALFI7890P1ZK"
        });
      }
    }
    console.log(`[Snipcart Taxes Webhook] Calculated taxes for province '${province}':`, taxesToApply);
    return new Response(JSON.stringify({
      taxes: taxesToApply
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[Snipcart Taxes Webhook Error]:", err);
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
