globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createAstro, c as createComponent, m as maybeRenderHead, r as renderComponent, e as renderSlot, a as renderTemplate } from './astro/server_C0Zh7G4i.mjs';
import { b as $$Text, c as $$Heading } from './EngineLayout_u-ClcpIj.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$NewsletterPageCard = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$NewsletterPageCard;
  const { heading, description, emblem = false } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="min-h-[80dvh] flex items-center justify-center bg-background px-4 py-16 md:py-24"> <div class="w-full max-w-md border border-border-subtle bg-surface px-8 py-12 md:px-12 text-center"> ${emblem && renderTemplate`<div class="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-accent-brass"> <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-brass)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"> <path d="M20 6 9 17l-5-5"></path> </svg> </div>`} ${renderComponent($$result, "Text", $$Text, { "variant": "eyebrow", "class": "mb-4 block" }, { "default": ($$result2) => renderTemplate`Zelia Vance` })} <div class="mx-auto mb-8 h-px w-8 bg-accent-brass"></div> ${renderComponent($$result, "Heading", $$Heading, { "as": "h1", "class": "mb-4" }, { "default": ($$result2) => renderTemplate`${heading}` })} ${description && renderTemplate`${renderComponent($$result, "Text", $$Text, { "variant": "caption", "color": "muted", "class": "mb-8 block leading-relaxed" }, { "default": ($$result2) => renderTemplate`${description}` })}`} ${renderSlot($$result, $$slots["default"])} </div> </div>`;
}, "/app/src/components/ui/NewsletterPageCard.astro", void 0);

export { $$NewsletterPageCard as $ };
