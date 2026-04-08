globalThis.process ??= {}; globalThis.process.env ??= {};
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const cart = body.content;
    const FREE_SHIPPING_THRESHOLD = 3e3;
    const STANDARD_RATE = 70;
    const EXPRESS_RATE = 150;
    const subtotal = cart?.subtotal || 0;
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const standardCost = isFreeShipping ? 0 : STANDARD_RATE;
    return new Response(JSON.stringify({
      rates: [
        {
          cost: standardCost,
          description: "Standard Delivery",
          userDefinedId: "standard",
          guaranteedDaysToDelivery: 5
        },
        {
          cost: EXPRESS_RATE,
          description: "Express Delivery",
          userDefinedId: "express",
          guaranteedDaysToDelivery: 2
        }
      ]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({
      rates: [
        {
          cost: 150,
          description: "Standard Delivery (Fallback)",
          userDefinedId: "fallback"
        }
      ]
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    POST,
    prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
