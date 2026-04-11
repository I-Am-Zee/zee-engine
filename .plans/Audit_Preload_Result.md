# Audit_Preload_Result

## 1. Executive Summary (Overall Pure Engine Status)

The transition to a "Pure Engine" architecture is largely successful at a macro level: Astro configurations, R2 integrations, and primary UI structures are cleanly abstracted and dynamic. Content loaders have successfully transitioned to use `import.meta.env.PUBLIC_BRAND_ID`.

However, the codebase requires a significant "scrubbing" of legacy artifacts left behind from the initial "Zelia Vance" proof of concept. The audit revealed a widespread presence of hardcoded brand strings, highly opinionated stylistic logic tied to the "Old Money" aesthetic (e.g., specific CSS typography styling in `global.css`), and critical atomic violations (fetching data within UI primitives and molecules instead of Features/Organisms). In summary, while the technical wiring for multi-tenancy exists, the "soul" of the engine is still heavily entangled with Zelia Vance.

## 2. Hardcoded/Brand-Specific Trace Log (Table: File | Line | Finding | Reason)

| File | Line | Finding | Reason |
| :--- | :--- | :--- | :--- |
| `src/pages/shop/[category].astro` | 93 | `<EngineLayout title={`${categoryLabel} \| Zelia Vance`}>` | Hardcoded brand name in SEO title tag. Must be driven by a generic SEO component or JSON settings via `import.meta.env.PUBLIC_BRAND_ID`. |
| `src/pages/shop/[...page].astro` | 33, 39 | `title: "All Jewelry"`, `<EngineLayout title="Shop All Jewelry \| Zelia Vance">` | Hardcoded category ("Jewelry") and brand name. Fails for a non-jewelry tenant. |
| `src/pages/wishlist.astro` | 33 | `<EngineLayout title="My Wishlist \| Zelia Vance">` | Hardcoded brand name in title tag. |
| `src/pages/collections/[tag].astro` | 84 | `<EngineLayout title={`${formattedTagName} Collection \| Zelia Vance`}>` | Hardcoded brand name. |
| `src/pages/collections/index.astro` | 47 | `<EngineLayout title="Explore Collections \| Zelia Vance">` | Hardcoded brand name. |
| `src/pages/privacy-policy.astro` | 15, 32 | Hardcoded "Zelia Vance" in title and `.prose-zelia` class usage. | Fails brand neutrality. Legal pages should use a standard `.prose` or brand-injected utility class. |
| `src/pages/returns.astro` | 15, 32 | Hardcoded "Zelia Vance" in title and `.prose-zelia` class usage. | Fails brand neutrality. |
| `src/pages/lookbooks/[slug].astro` | 49-50, 173, 232 | Hardcoded "Zelia Vance", "jewelry collection" description, `.prose-zelia`, and custom `$dispatch('zeliavance:master-set'...)` | Contains hardcoded brand names, domain-specific text ("jewelry"), opinionated classes, and brand-prefixed event names in the lookbook feature. |
| `src/pages/lookbooks/index.astro` | 16, 20 | Hardcoded "Curated jewelry collections...", "Zelia Vance". | SEO and copy strings are domain-locked. |
| `src/pages/faq.astro` | 11, 22-57 | Hardcoded "Zelia Vance", "Diamonds & Sourcing", explicit details on ethical sourcing, lab-grown diamonds, etc. | The entire FAQ page content is completely hardcoded to a jewelry brand context. Must be moved to a CMS-driven list. |
| `src/pages/newsletter/success.astro` | 9, 10 | Hardcoded "Zelia Vance" in title and description. | Needs dynamic settings integration. |
| `src/pages/newsletter/confirm.astro` | 11, 12 | Hardcoded "Zelia Vance" in title and description. | Needs dynamic settings integration. |
| `src/pages/design-system.astro` | Multiple | Explicit references to "Zelia Vance", "PVD Gold", "jewelry cleaning kit", etc. | While mostly a dev tool, its hardcoding implies a lack of abstraction in how primitive examples are constructed. Dev tools should ideally pull from the current tenant config. |
| `src/pages/404.astro` | 12 | Hardcoded "Zelia Vance" in title. | Needs dynamic site name injection. |
| `src/pages/index.astro` | 71, 78 | Hardcoded SEO title ("Luxury Jewelry & Timeless Elegance") and image alt text. | The homepage is locked to a specific domain context. |
| `src/pages/blog.astro` | 9, 11, 13 | Hardcoded "Zelia Vance Journal", "luxury jewelry". | Missing abstraction for journal/blog index meta information. |
| `src/pages/terms-of-service.astro` | 15, 32 | Hardcoded "Zelia Vance" and `.prose-zelia`. | Fails brand neutrality. |
| `src/pages/api/checkout/order-completed.ts` | 159 | Comment: `E.g., diamond-tennis-necklace -> diamond-tennis-necklace-16inches` | Minor: Conceptual assumption tied to jewelry. |
| `src/pages/api/checkout/taxes.ts` | 41, 56 | Comment mentions "Costume Jewellery" and HSN 7117. | Strong conceptual lock to Indian jewelry taxation rules. While comments don't break code, they imply lack of abstraction for diverse products. |
| `src/pages/api/webhooks/logistics-sync.ts` | 124, 128 | Hardcoded welcome email content mentioning "Zelia Vance", domain link `zeliavance.com/newsletter/confirm`. | Fatal flaw for multi-tenancy. Emails sent by the engine will be permanently branded as Zelia Vance regardless of the tenant. Must be driven by Keystatic template. |
| `keystatic.config.ts` | 10, 13, 24, 36, 177, 249 | Hardcoded defaults: 'zelia-vance', import statements pointing directly to `src/content/zelia-vance/`, default brand name "Zelia Vance CMS", example text "Silver, Gold Plated", author "Zelia Vance Team". | Fatal flaw for white-labeling the CMS interface itself. Static imports to a specific brand folder in a global config file means Keystatic is not dynamic per tenant. |
| `src/content/config.ts` | 10, 169 | Comment reference, default author "Zelia Vance Team". | Author default needs to be abstracted. |
| `src/styles/global.css` | 15, 119-299 | `.prose-zelia` class definition specifically engineered for "Zelia Vance Royal Conservatory Palette" | Highly opinionated typography styling hardcoded at the global CSS level, bypassing Tailwind's configuration layer and cementing a specific visual identity for all brands using the engine. |
| `src/styles/snipcart.css` | 2, 14 | Comments indicating styling is tailored for "Zelia Vance". | Ensure these styles aren't overriding generic cart features with brand-specific visual choices. |
| `src/components/ui/SideDrawer.astro` | 28 | `id="zeliavance-side-drawer"` | Event id strongly tied to "zeliavance". |

## 3. Fallback Logic Audit (Table: Feature | Current Fallback | Proposed Neutral Fallback)

| Feature / UI Component | Current Fallback | Proposed Neutral Fallback | Reason |
| :--- | :--- | :--- | :--- |
| `src/components/features/LookbookCarousel.astro` | N/A (Doesn't use fallback defaults explicitly in the destructured assignment for getEntry, but it should) | Should implement `|| { title: 'Discover', description: 'Explore our latest collection.' }` | Prevents rendering failures if JSON is missing. |
| `src/components/features/NewsletterWidget.astro` | Relies on `entry?.data` values but lacks robust object destructuring fallbacks in the template if `entry` is null. | Ensure fallback strings are generic: 'Stay Updated', 'Subscribe to our newsletter.' | Protects against missing content entries. |
| `src/components/ui/ComingSoon.astro` | `heading = "Our {category} is on the way"`, `description = "We’re putting the final polish on some exquisite new pieces. They’re worth the wait—stay tuned for the drop."` | `heading = "Coming Soon"`, `description = "New items will be available shortly. Stay tuned for updates."` | The current description ("exquisite new pieces", "final polish") has a very specific tone (likely jewelry/luxury) that might not fit a minimalist or tech brand. |
| `src/components/ui/TrustSection.astro` | `main_heading = "Quality Assured"`, `hero_image = "/images/identity/trust-hero.webp"`, `markers = []` | Keep `main_heading`, but use a dynamic/neutral `hero_image` fallback, or require it. | A hardcoded image path tied to an `identity/` folder is likely to 404 or show the wrong image if a new brand is spun up without replacing that specific R2 path. |

## 4. Keystatic Path Integrity Verification

**Fatal Issue Found.**
The `keystatic.config.ts` is fundamentally broken for multi-tenancy due to static imports:

```typescript
// keystatic.config.ts
import taxonomyJson from './src/content/zelia-vance/settings/taxonomy.json';
import shippingJson from './src/content/zelia-vance/settings/shipping.json';
```

These imports statically bind the global CMS configuration to the `zelia-vance` directory. If `PUBLIC_BRAND_ID` is set to `affiliate_zee`, Keystatic will crash or silently read the wrong taxonomy schema. The CMS schema must be generated dynamically based on the current `PUBLIC_BRAND_ID` or use a different mechanism (e.g., dynamic imports or a pre-build step) to construct the config.

Furthermore, several field defaults within Keystatic's schema are hardcoded:
- `author: fields.text({ label: 'Author', defaultValue: 'Zelia Vance Team' })`

## 5. Brutal Opinions & UX Research

- **The Typography Tyranny:** The `.prose-zelia` class in `global.css` is an anti-pattern in an Atomic / Tailwind environment. It tightly couples HTML elements within Markdown rendered areas to a highly specific "Old Money" aesthetic (complex selector chains, specific hover states for links, precise list marker colors). This makes it extremely difficult to onboard a brand with a "Tech Brutalist" or "Playful Pop" aesthetic. The engine needs a generalized `.prose` class, with specific styling delegated to Tailwind's `theme()` function and design tokens, driven by a `tailwind.config.mjs` that reads from brand JSON settings.
- **Critical Atomic Architecture Violations:** Multiple components across the Primitive and UI layer are improperly fetching their own data:
    - **`Logo.astro` (Primitive):** Violates rules. A Primitive should never fetch data. It must accept props like `siteName` from its parent.
    - **`SocialLinks.astro` (UI):** Fetches its own settings. This should be passed down from `Footer.astro`.
    - **`AnnouncementBar.astro` (UI):** Fetches marketing and shipping settings directly.
    - **`SideDrawer.astro` (UI):** Fetches shipping settings directly.
    - **`ComingSoon.astro` and `TrustSection.astro` (UI):** Both fetch their own entry content.
    *According to `AGENTS.md` and the architecture rules, UI and Primitive components must be "dumb bricks." Data fetching and business logic MUST happen in the Features (Organisms) layer (`src/components/features/`), which then pass the resolved props down to the UI layer. This is a critical structural failure.*
- **The Webhook Trap:** The logistics webhook (`src/pages/api/webhooks/logistics-sync.ts`) is hardcoded with Zelia Vance HTML emails. This is incredibly dangerous; an order placed on Brand B will trigger a shipping confirmation email welcoming the user to Brand A (Zelia Vance) with links to Brand A's domain. Email templates must be completely abstracted into the CMS and fetched per-tenant.
- **SEO & Layout Entanglement:** The `EngineLayout` component is repeatedly invoked across pages (Shop, Wishlist, Lookbooks, FAQ, Privacy Policy, Returns) with hardcoded strings like `<EngineLayout title="... | Zelia Vance">`. The layout itself should likely take a `pageTitle` prop and append the `brandName` automatically based on the site settings fetched from the CMS or global store, rather than forcing every page to manually append it.
- **Alpine Events Coupling:** `SideDrawer.astro` and Lookbook events use the `zeliavance:master-set` or `id="zeliavance-side-drawer"` namespacing. This tight coupling means JavaScript events are domain-specific. Events should be namespace generic (e.g., `engine:master-set` or `store:master-set`).

## 6. Recommended Action Plan for Phase 3

1. **Purge Static Imports in Keystatic:** Re-architect `keystatic.config.ts` to build schemas dynamically based on `import.meta.env.PUBLIC_BRAND_ID`, removing the direct `import ... from './src/content/zelia-vance/...'` statements.
2. **Abstract Global Meta Information:** Create a `SiteSettings` singleton in the CMS that manages the Brand Name, Default SEO Description, and domain URL. Inject this into `EngineLayout` so pages only need to pass their specific title.
3. **Migrate Transactional Emails to CMS:** Move the HTML strings in `logistics-sync.ts` into a "Transactional Emails" schema within Keystatic, allowing different brands to define their own tone of voice for shipping updates.
4. **Fix Atomic Violations (URGENT):** Refactor all primitives and UI components that are incorrectly using `getEntry`. Move data fetching to `src/components/features/` or parent pages, and pass data to the lower layers as props.
    - Affected Components: `Logo.astro`, `SocialLinks.astro`, `AnnouncementBar.astro`, `SideDrawer.astro`, `ComingSoon.astro`, `TrustSection.astro`.
5. **Decouple CSS Typography:** Remove `.prose-zelia` from `global.css`. Replace it with a configurable Tailwind Typography plugin integration, or use standard utility classes driven by brand-specific design tokens.
6. **Abstract the FAQ:** Delete the hardcoded FAQ items in `src/pages/faq.astro`. Create an FAQ collection/singleton in Keystatic and loop through it dynamically.
7. **Cleanse all `*.astro` pages:** Systematically replace all remaining strings ("Jewelry", "Zelia Vance") with variables fetched from the tenant's configuration JSON.
8. **Refactor Event Names:** Change all Alpine event dispatches and IDs from `zeliavance:*` to generic namespaces like `engine:*` or `cart:*`.
