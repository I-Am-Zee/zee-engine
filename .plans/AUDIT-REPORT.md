# Full Site Audit — Zelia Vance Engine

## 1. LAYOUT AUDIT
✅ `src/components/features/BrandEngine.astro` correctly imports `snipcart-events.ts` and `snipcart-init.ts`.
✅ `src/components/features/BrandEngine.astro` correctly loads `snipcart.css` via `<link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.7.5/default/snipcart.css" />` as well as the custom palette override.
✅ The script loading order is correct. The Snipcart config script comes before the CDN JS script in `src/components/features/BrandEngine.astro`.

## 2. PAGES AUDIT
⚠️ **PAGES USING THE WRONG LAYOUT:** The following pages are directly using `<BaseLayout>` instead of the required `<EngineLayout>` wrapper:
- `src/pages/shipping.astro` (Line 3)
- `src/pages/privacy-policy.astro` (Line 3)
- `src/pages/returns.astro` (Line 3)
- `src/pages/lookbooks/[slug].astro` (Line 6)
- `src/pages/lookbooks/index.astro` (Line 10)
- `src/pages/terms-of-service.astro` (Line 3)

## 3. COMPONENT AUDIT
✅ `src/components/ui/PopupModal.astro`: The `denylist` prop is correctly typed (`denylist?: string[]`) and properly handled (`const denylist = data.denylist || [];`) before being passed to the `x-data` attribute.
✅ `src/scripts/behaviors/popup.ts`: The Alpine.js behavior correctly receives and utilizes `denylist` to verify path suppression.
✅ `src/components/features/BrandEngine.astro` correctly passes the `snipcart-init.ts` and `snipcart-events.ts` scripts.

## 4. CONTENT SCHEMA AUDIT
⚠️ `src/content/config.ts`: The 'settings' collection schema is **missing** the `monetization` field (`monetization: z.object({ show_ads: z.boolean() }).optional()`). It does not match the `monetization` setting present in Keystatic and the affiliate setting file.
✅ Other required fields (`name`, `tagline`, `description`, `url`, `email`, `phone`, `address`, `social`, `announcement_bar`, `popup_modal` with `denylist` array, `free_shipping_threshold`) are properly configured and match what is in `src/content/zelia-vance/settings/site.yml`.

## 5. KEYSTATIC CONFIG AUDIT
✅ `keystatic.config.ts`: All collection paths dynamically use `import.meta.env.PUBLIC_BRAND_ID`.
✅ `products`, `blog`, `lookbooks`, and the `settings` singleton are all correctly mapped to their respective paths.
✅ No TypeScript type errors or mismatched field types found in the Keystatic config for these collections.

## 6. ENV AUDIT
✅ `.env.example`: All required variables are fully documented.
✅ `PUBLIC_BRAND_ID`, `PUBLIC_SITE_URL`, `PUBLIC_AFFILIATE`, `PUBLIC_SNIPCART_API_KEY`, and `IMAGE_GATEWAY_URL` are all present.

## 7. AFFILIATE PLACEHOLDER AUDIT
✅ `src/content/affiliate_zee/` directory exists with the required subfolders: `blog/` and `settings/`.
✅ `src/content/affiliate_zee/settings/site.yml` exists and contains valid YAML structure.

## 8. DEEP SCHEMA & KEYSTATIC MAPPING AUDIT
⚠️ **MISSING FIELDS IN KEYSTATIC:** The `src/content/config.ts` schemas contain several fields that are missing in the corresponding `keystatic.config.ts` configuration. This means content editors cannot manage these fields via the CMS.
- **Products:** Missing `gallery`, `tags`, `badges`, `rating`, `publishDate`, variants (`variant_1`, `variant_2`, `variant_3`), urgency fields (`release_date`, `urgency_tag`), cross-selling (`related_products`), and logistics (`weight`, `shipping_slab`, `dimensions`).
- **Lookbooks:** Missing `gallery` and `products` array mapping.
- **Blog:** Missing `tags`.
- **Settings:** Missing phone numbers, physical address mapping, and `free_shipping_threshold` configuration mismatches (missing in CMS).
- **Newsletter:** The entire `newsletter` collection is present in `config.ts` but missing from `keystatic.config.ts`.

## 9. WHITE-LABEL ARCHITECTURE AUDIT (HARDCODED VALUES)
⚠️ **HARDCODED CATEGORIES:** Both `src/content/config.ts` (Lines 56-64) and `keystatic.config.ts` (Lines 29-40) have hardcoded product categories specific to jewelry (`rings`, `necklaces`, `earrings`, `bracelets`, `gifts`, `sets`).
- **Violation:** This breaks the multi-tenant white-label design for brands outside this vertical (e.g., clothing). These options must be refactored to map dynamically from a brand-specific settings array.

## 10. AFFILIATE FOLDER STRUCTURE COMPLETENESS
⚠️ **MISSING CONTENT FOLDERS:** The `src/content/affiliate_zee/` directory is missing critical content folders required for a fully functional affiliate engine.
- Missing `products/` folder (for affiliate product links).
- Missing `lookbooks/` folder.

## 11. PRIMITIVE COMPONENTS AUDIT
✅ **ATOMIC DESIGN STRUCTURE:** The primitives (`Badge`, `Button`, `Heading`, `Icon`, `Image`, `Input`, `Link`, `Logo`, `Text`) are correctly placed in `src/components/primitives/` and do not import higher-order components, successfully adhering to Atomic Design principles.
✅ **USAGE & IMPORTS:** Searched across all `src/components/ui/`, `src/components/features/`, and `src/pages/` directories. Primitives are consistently imported using standard relative paths (`../primitives/...` or `../../components/primitives/...`) and their props correctly map to standard variants.
⚠️ **IMAGE GATEWAY PATH DEPENDENCY:** In `src/components/primitives/Image.astro`, the `IMAGE_GATEWAY_URL` transformation explicitly relies on the `/images/` path prefix to remap assets to Cloudflare R2 (e.g., `/images/` -> `/${brandId}/`). If a CMS upload maps to a different local path structure, the Cloudflare edge image worker fallback will fail for that asset.

## 12. UI COMPONENTS (MOLECULES) AUDIT
✅ **STRUCTURE & PRESENTATION:** The majority of components in `src/components/ui/` (e.g., `GlassProductCard`, `OptionSelector`, `PriceTag`, `NavDropdown`) correctly follow Atomic Design. They accept data strictly via props, manage local visual state using `x-data`, and communicate outward using `$dispatch` (e.g., `zeliavance:quick-shop` in `GlassProductCard`).
⚠️ **ATOMIC DESIGN VIOLATIONS (ORGANISMS MASQUERADING AS MOLECULES):**
- `src/components/ui/CompleteTheLook.astro`: This component explicitly calls `getCollection("products")` in its frontmatter, processes business logic (filtering by slugs), sets a global window variable via an inline script, and imports larger Feature organisms (`ProductGrid`, `ProductCarousel`, `BuySetButton`). According to the `THE ATOMIC DESIGN.md` guidelines, UI components should "never 'know' what the app is doing" and should "receive data via props". This component is actually a Feature (Organism) and must be moved to `src/components/features/`.
- `src/components/ui/CartToast.astro`: This component sets up direct global event listeners to the Snipcart API (`window.Snipcart.events.on('item.added')`) inside its Alpine setup. While efficient, it slightly borders on Feature-level integration rather than a pure presentation molecule.

## 13. STRATEGIC MASTER PLAN ALIGNMENT
✅ **Multi-Tenancy Guardrails:** The `PUBLIC_AFFILIATE` switch correctly gates logic between D2C (Snipcart) and Affiliate (External link) modes as specified in the Master Game Plan.
⚠️ **Milestone Violations:** The codebase violates Milestone 1 & 4 from `.plans/MASTER-GAME-PLAN.md` by including hardcoded product categories (`src/content/config.ts`) instead of reading them dynamically from brand settings. Furthermore, the `affiliate_zee` content structure is incomplete (missing `products/` and `lookbooks/`).

## 14. IMAGE WRAPPER & CORE WEB VITALS AUDIT
⚠️ **CRITICAL PERFORMANCE FLAW (`src/components/primitives/Image.astro`):**
- **Missing `sizes` Attribute:** The component dynamically generates a Cloudflare R2 `srcset` (`200w, 400w, 800w, 1200w`), but completely omits the `sizes` attribute. According to MDN and Google Web Vitals standards, omitting `sizes` forces the browser to assume `100vw`. This means mobile devices will unnecessarily download the `1200w` image if the connection allows it, destroying mobile data bandwidth and Largest Contentful Paint (LCP).
- **Transformation Limits:** The `srcset` includes `200w`. However, `CONTEXT FILES.AGENTS/IMAGE-ENGINE R2 WORKER.md` explicitly dictates using only `400`, `800`, and `1200` widths to prevent exhausting Cloudflare's free-tier 5k/month transformation limit. The `200w` request violates this architectural constraint.
- **LCP Eager Loading:** The component defaults to `loading="lazy"`. If this component is used for hero images or product images above the fold, lazy loading will artificially delay the LCP metric.
- **Proposed Solution:** Introduce a required (or smartly defaulted) `sizes` prop. Remove `200w` from the srcset generation. Add logic to ensure LCP hero components explicitly pass `loading="eager"`.

## 15. MODULARITY & VALIDATION ARCHITECTURE
✅ **Pure Functions:** Form validation (`isGmailAddress`, `isValidEmail`) is correctly isolated into pure functions inside `src/scripts/utils/validation.ts`, successfully adhering to the DRY principle.
⚠️ **DOM Binding Boilerplate:** The logic in `src/scripts/behaviors/newsletter.ts` relies on repetitive vanilla JavaScript DOM querying (`document.getElementById`, manual `addEventListener` attachments) for each specific widget type.
- **Industry Standard Opinion:** Since the project already uses Alpine.js (`x-data`) for reactive UI state, managing form validation and submissions through Alpine.js is vastly more efficient. Instead of writing monolithic vanilla JS functions to map DOM elements to pure validation functions, the pure functions should be imported directly into Alpine components. This allows the template to reactively show/hide errors based on data state without manual DOM querying, greatly reducing script size and improving maintainability.

## 16. VANILLA CSS & JS AUDIT
✅ **CSS Hygiene:** The use of vanilla `<style>` tags is minimal and highly specific. Most usages involve `[x-cloak]` visibility enforcement or explicit overrides for external libraries (e.g., `splide.js` pagination dots), which perfectly aligns with the Tailwind-first approach without creating bloated stylesheets.
⚠️ **JS Refactor Opportunity:** Scripts like `src/scripts/behaviors/options-sync.ts` and `src/scripts/behaviors/newsletter.ts` heavily use `document.querySelector` and manual `addEventListener` attachments.
- **Proposed Solution:** Because Alpine.js is fundamentally embedded in this project's architecture, this manual DOM-binding logic is redundant and fragile. Form states and option synchronization should be lifted into Alpine `x-data` models, eliminating the need to search the DOM manually.

## 17. FEATURES (ORGANISMS) AUDIT
✅ **Atomic Design Compliance:** Components inside `src/components/features/` (like `BuySetButton`, `SideDrawer`, `ProductGallery`) correctly act as the "brains" of the UI. They import pure Primitives/Molecules, handle state management using Alpine.js stores or event dispatchers (e.g., `$dispatch('zeliavance:master-set')`), and feed data downward. This strictly adheres to the project's Atomic Design guidelines.

## 18. SCRIPTS ARCHITECTURE AUDIT
✅ **Clear Domain Separation:** The boundary between `src/scripts/utils/` (pure functions without side-effects, like `formatCurrency` or `isGmailAddress`) and `src/scripts/behaviors/` (complex state, Alpine.js logic, DOM interactions) is pristine.
✅ **Centralized Alpine Registration:** `src/scripts/behaviors/alpine-entrypoint.ts` serves as an excellent central registry for all stores and components, making the client-side logic highly predictable and modular.

## 19. DOCUMENTATION AUDIT
✅ **Enterprise-Grade Annotations:** The codebase utilizes comprehensive JSDoc block comments (`/** ... */`) across nearly all Components and Utility scripts. Developers can immediately discern whether a component is a primitive, molecule, or organism, what props it expects, and any side-effects it causes, greatly reducing onboarding friction.
