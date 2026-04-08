globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createAstro, c as createComponent, m as maybeRenderHead, d as addAttribute, s as spreadAttributes, a as renderTemplate } from './astro/server_C0Zh7G4i.mjs';
import { g as getEntry } from './_astro_content_DjB39X_g.mjs';

const $$Astro = createAstro("http://localhost:4321");
const $$Logo = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Logo;
  const { variant = "full", color = "black", class: className, ...rest } = Astro2.props;
  const site = await getEntry("settings", "site");
  const brandName = site?.data?.name || "Brand";
  const brandMark = brandName.charAt(0).toUpperCase();
  const textColor = color === "white" ? "text-white" : "text-(--color-text-main)";
  return renderTemplate`${variant === "full" ? renderTemplate`${maybeRenderHead()}<a href="/"${addAttribute(["inline-flex items-center font-serif text-2xl font-medium tracking-tight whitespace-nowrap", textColor, className], "class:list")}${spreadAttributes(rest)}>${brandName}</a>` : renderTemplate`<a href="/"${addAttribute(["inline-flex items-center justify-center font-serif text-xl font-bold", textColor, className], "class:list")}${spreadAttributes(rest)}>${brandMark}</a>`}`;
}, "/app/src/components/primitives/Logo.astro", void 0);

export { $$Logo as $ };
