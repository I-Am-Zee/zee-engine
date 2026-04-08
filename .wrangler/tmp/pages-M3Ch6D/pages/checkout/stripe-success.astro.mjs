globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createAstro, c as createComponent, a as renderTemplate, g as defineScriptVars, f as renderHead } from '../../chunks/astro/server_C0Zh7G4i.mjs';
/* empty css                                             */
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("http://localhost:4321");
const prerender = false;
const $$StripeSuccess = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$StripeSuccess;
  const publicToken = Astro2.url.searchParams.get("publicToken");
  const paymentIntentId = Astro2.url.searchParams.get("payment_intent");
  Astro2.url.searchParams.get("payment_intent_client_secret");
  const siteUrl = "https://dev.zeliavance.com/";
  return renderTemplate(_a || (_a = __template(['<html lang="en" data-astro-cid-sk7iz45v> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Payment Successful - Zelia Vance</title>', '</head> <body data-astro-cid-sk7iz45v> <div class="container" data-astro-cid-sk7iz45v> <div class="card" data-astro-cid-sk7iz45v> <div class="logo" data-astro-cid-sk7iz45v>Zelia Vance</div> <svg class="success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-sk7iz45v> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-sk7iz45v></path> </svg> <h1 data-astro-cid-sk7iz45v>Payment Successful!</h1> <p class="status" id="status" data-astro-cid-sk7iz45v> <span class="spinner" data-astro-cid-sk7iz45v></span> Confirming your order...\n</p> </div> </div> <script>(function(){', "\n    async function verifyAndConfirm() {\n      try {\n        // Notify Snipcart of successful payment\n        const response = await fetch(\n          `https://payment.snipcart.com/api/public/custom-payment-gateway/payment?publicToken=${publicToken}`,\n          {\n            method: 'POST',\n            headers: { 'Content-Type': 'application/json' },\n            body: JSON.stringify({\n              state: 'processed',\n              transactionId: paymentIntentId,\n            })\n          }\n        );\n        \n        if (!response.ok) {\n          throw new Error('Failed to confirm payment with Snipcart');\n        }\n        \n        const result = await response.json();\n        console.log('[stripe-success] Payment confirmed');\n        \n        // Redirect to confirmation page\n        if (result.returnUrl) {\n          window.location.href = result.returnUrl;\n        } else {\n          document.getElementById('status').innerHTML = '✓ Order confirmed! Redirecting...';\n          setTimeout(() => window.location.href = '/', 2000);\n        }\n        \n      } catch (error) {\n        console.error('[stripe-success] Error:', error);\n        document.getElementById('status').textContent = 'Error confirming order. Please contact support with reference: ' + paymentIntentId;\n      }\n    }\n    \n    verifyAndConfirm();\n  })();</script> </body> </html>"], ['<html lang="en" data-astro-cid-sk7iz45v> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Payment Successful - Zelia Vance</title>', '</head> <body data-astro-cid-sk7iz45v> <div class="container" data-astro-cid-sk7iz45v> <div class="card" data-astro-cid-sk7iz45v> <div class="logo" data-astro-cid-sk7iz45v>Zelia Vance</div> <svg class="success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-sk7iz45v> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" data-astro-cid-sk7iz45v></path> </svg> <h1 data-astro-cid-sk7iz45v>Payment Successful!</h1> <p class="status" id="status" data-astro-cid-sk7iz45v> <span class="spinner" data-astro-cid-sk7iz45v></span> Confirming your order...\n</p> </div> </div> <script>(function(){', "\n    async function verifyAndConfirm() {\n      try {\n        // Notify Snipcart of successful payment\n        const response = await fetch(\n          \\`https://payment.snipcart.com/api/public/custom-payment-gateway/payment?publicToken=\\${publicToken}\\`,\n          {\n            method: 'POST',\n            headers: { 'Content-Type': 'application/json' },\n            body: JSON.stringify({\n              state: 'processed',\n              transactionId: paymentIntentId,\n            })\n          }\n        );\n        \n        if (!response.ok) {\n          throw new Error('Failed to confirm payment with Snipcart');\n        }\n        \n        const result = await response.json();\n        console.log('[stripe-success] Payment confirmed');\n        \n        // Redirect to confirmation page\n        if (result.returnUrl) {\n          window.location.href = result.returnUrl;\n        } else {\n          document.getElementById('status').innerHTML = '✓ Order confirmed! Redirecting...';\n          setTimeout(() => window.location.href = '/', 2000);\n        }\n        \n      } catch (error) {\n        console.error('[stripe-success] Error:', error);\n        document.getElementById('status').textContent = 'Error confirming order. Please contact support with reference: ' + paymentIntentId;\n      }\n    }\n    \n    verifyAndConfirm();\n  })();</script> </body> </html>"])), renderHead(), defineScriptVars({ publicToken, paymentIntentId, siteUrl }));
}, "/app/src/pages/checkout/stripe-success.astro", void 0);
const $$file = "/app/src/pages/checkout/stripe-success.astro";
const $$url = "/checkout/stripe-success";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$StripeSuccess,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
