globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, F as Fragment, d as addAttribute } from '../../chunks/astro/server_C0Zh7G4i.mjs';
import { e as $$Input, d as $$Button, b as $$Text, $ as $$EngineLayout } from '../../chunks/EngineLayout_u-ClcpIj.mjs';
import { $ as $$NewsletterPageCard } from '../../chunks/NewsletterPageCard_BSLBQYZV.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro$1 = createAstro("http://localhost:4321");
const $$NewsletterConfirmForm = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$NewsletterConfirmForm;
  const { email = "" } = Astro2.props;
  const hasEmail = email.length > 0;
  return renderTemplate`${renderComponent($$result, "NewsletterPageCard", $$NewsletterPageCard, { "heading": hasEmail ? "One quiet step to join our inner circle." : "Stay in the loop.", "description": hasEmail ? "We share rare updates \u2014 new arrivals, seasonal pieces, and the occasional exclusive reserved for people who've been here since the beginning. Nothing more." : "Enter your Gmail below to receive rare updates \u2014 new arrivals, seasonal pieces, and the occasional exclusive reserved for people who've been here since the beginning." }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<form id="newsletter-confirm-form" x-data="newsletterConfirm({ locked: true, email: '{email}' })" @submit.prevent="submitForm" class="flex flex-col gap-3" novalidate> ${hasEmail ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate`<input type="hidden" name="email"${addAttribute(email, "value")}> ${renderComponent($$result3, "Input", $$Input, { "id": "newsletter-email-display", ":value": "email", "type": "email", "name": "_display", "value": email, "class": "text-center cursor-default!", "readonly": true })} ` })}` : renderTemplate`<div class="flex flex-col gap-1 text-left"> ${renderComponent($$result2, "Input", $$Input, { "id": "newsletter-email-input", "type": "email", "name": "email", "placeholder": "Enter your Gmail address", "x-model": "email", "@input": "hideEmailError", "@blur": "validateEmail" })} <p id="newsletter-email-error" class="px-1 font-sans text-xs text-accent-coral" x-show="emailError" x-cloak>
Please enter a valid Gmail address.
</p> </div>`} ${renderComponent($$result2, "Button", $$Button, { "id": "newsletter-submit-btn", "type": "primary", "size": "lg", "class": "w-full uppercase tracking-widest text-xs!", ":disabled": "isSubmitting" }, { "default": ($$result3) => renderTemplate` <span x-text="submitLabel">Yes, stay in the loop</span> ` })} <p id="newsletter-form-error" class="text-center font-sans text-xs text-accent-coral" x-show="formError" x-cloak>
Something went wrong. Please try again in a moment.
</p> </form> ${renderComponent($$result2, "Text", $$Text, { "variant": "metadata", "class": "mt-8 block leading-relaxed opacity-70" }, { "default": ($$result3) => renderTemplate`
Your email stays private. No spam, no exceptions.<br>
You can leave any time via the unsubscribe link in any email.
` })} ` })}`;
}, "/app/src/components/features/NewsletterConfirmForm.astro", void 0);

const $$Astro = createAstro("http://localhost:4321");
const prerender = false;
const $$Confirm = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Confirm;
  const email = Astro2.url.searchParams.get("email") || "";
  return renderTemplate`${renderComponent($$result, "EngineLayout", $$EngineLayout, { "title": "Stay in the Loop | Zelia Vance", "description": "Join the Zelia Vance inner circle for rare arrivals, seasonal pieces, and the occasional exclusive." }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "NewsletterConfirmForm", $$NewsletterConfirmForm, { "email": email })} ` })}`;
}, "/app/src/pages/newsletter/confirm.astro", void 0);

const $$file = "/app/src/pages/newsletter/confirm.astro";
const $$url = "/newsletter/confirm";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Confirm,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
