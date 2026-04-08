globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createAstro, c as createComponent, f as renderHead, a as renderTemplate } from '../../chunks/astro/server_C0Zh7G4i.mjs';
/* empty css                                     */
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("http://localhost:4321");
const prerender = false;
const $$Stripe = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Stripe;
  const publicToken = Astro2.url.searchParams.get("publicToken");
  if (!publicToken) {
    return Astro2.redirect("/");
  }
  Astro2.url.origin || "https://dev.zeliavance.com/";
  const stripeConfigured = false;
  return renderTemplate`<html lang="en" data-astro-cid-qaortoan> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Complete Payment - Zelia Vance</title>${stripeConfigured}${renderHead()}</head> <body data-astro-cid-qaortoan> <div class="container" data-astro-cid-qaortoan> <div class="card" data-astro-cid-qaortoan> <div class="logo" data-astro-cid-qaortoan>Zelia Vance</div> <div id="error-message" class="error" style="display: none;" data-astro-cid-qaortoan></div> <div id="status-message" class="status" data-astro-cid-qaortoan>Loading payment details...</div> ${renderTemplate`<div class="error" data-astro-cid-qaortoan>
Stripe is not configured yet. Please add STRIPE_SECRET_KEY and PUBLIC_STRIPE_PUBLISHABLE_KEY to environment variables.
</div>` } </div> </div> ${stripeConfigured} </body> </html>`;
}, "/app/src/pages/checkout/stripe.astro", void 0);
const $$file = "/app/src/pages/checkout/stripe.astro";
const $$url = "/checkout/stripe";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Stripe,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
