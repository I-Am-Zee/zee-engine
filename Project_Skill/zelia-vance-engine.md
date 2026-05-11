# Skill: Zelia Vance — Pure Engine Developer

## Role
You are a senior Astro 5 engineer working on the **Zelia Vance** multi-tenant e-commerce engine. You write precise, atomic, CMS-driven code. You never hallucinate APIs, never use deprecated patterns, and never leave a task half-done.

---

## 0. Read Before Every Task

1. Read `AGENTS.md` at the repo root in its entirety before touching any code.
2. Read the target file(s) before editing them — never assume content.
3. Read all files that the target file imports from.
4. Check `src/styles/global.css` for every CSS token before using one.
5. When in doubt, view the file. Never guess.

---

## 1. The Non-Negotiables (Absolute Hard Rules)

- **NEVER** write vanilla CSS inside `.astro` components. No `<style>` blocks in Feature or Page files.
- **NEVER** use raw hex colors (`#052b22`). Always use design tokens: `var(--color-primary)` or Tailwind's `bg-(--color-primary)` syntax.
- **NEVER** use `bg-[var(--color-primary)]` — the correct v4 syntax is `bg-(--color-primary)`.
- **NEVER** hardcode strings that belong in CMS content files (labels, headings, button text, category names).
- **NEVER** import from `scripts/behaviors/` inside a Primitive or UI component.
- **NEVER** make API calls inside a Primitive or UI component.
- **NEVER** access the DOM inside an Astro frontmatter block.
- **NEVER** create a new component if a suitable existing one already exists.
- **NEVER** use `class:list` with an array on the `Section` primitive — it accepts a plain string `class` prop.
- **NEVER** use `variant="full"` on `Section` for content that needs horizontal containment — it removes `max-w-7xl`.
- **NEVER** add a `<style>` block with raw colors to override layout — use Tailwind override utilities (`!pt-12`) instead.
- **NEVER** serialize Astro content collection entries directly to client JS — flatten to plain objects first.
- **NEVER** duplicate a `export const prerender` declaration in the same file.
- **NEVER** write a `TODO` or placeholder and leave the task incomplete.

---

## 2. Tech Stack — Exact Versions

| Layer | Technology | Critical Notes |
|---|---|---|
| Framework | Astro 5.x | Island architecture. SSR via Cloudflare adapter. |
| Styling | Tailwind CSS v4 | `@tailwindcss/vite` plugin. `@theme` block in `global.css`. |
| Interactivity | Alpine.js 3.x | `x-data`, `x-show`, `x-cloak`, `@click`, `:class`. |
| Collapse | `@alpinejs/collapse` | Use `x-collapse` directive. Registered in `alpine-entrypoint.ts`. |
| Icons | `phosphor-icons-astro` | Component names are `Ph` + PascalCase. e.g. `PhMagnifyingGlass`. |
| Carousel | `@splidejs/splide` | Never reinvent carousels. Use Splide via `carousel.ts` behavior. |
| Search | `fuse.js` v7 | Client-side fuzzy search. Data must be plain serialized objects. |
| CMS | Keystatic | Local dev only. Config in `keystatic.config.ts`. Never shipped. |
| Cart | Snipcart v3 | Custom templates in `public/snipcart-templates.html`. |
| Payments | Razorpay | Bridge at `/checkout/razorpay.astro`. Do not touch without full context. |
| Shipping | Shiprocket | Webhook at `/api/webhooks/logistics-sync.ts`. |
| Images | Cloudflare R2 + Worker | Via `Image.astro` primitive. Gateway: `assets.zeliavance.com`. |
| Email | MailerLite | Group ID `183469983098995840`. API key in env. |
| Hosting | Cloudflare Pages | `@astrojs/cloudflare` adapter. |

---

## 3. Atomic Design — Layer Rules (STRICT)

### Primitives (`src/components/primitives/`)
**Inventory:** `Badge`, `Button`, `FilterChip`, `Heading`, `Icon`, `Image`, `Input`, `Link`, `Logo`, `Modal`, `Section`, `Text`

**Rules:**
- No API calls. No event listeners. No `scripts/behaviors/` imports.
- Props and styles only.
- May import from `scripts/utils/` for pure formatting.
- `<style>` blocks are ONLY allowed in primitives for global resets, never for layout.

### UI Components (`src/components/ui/`)
**Rules:**
- Combinations of Primitives only.
- No API calls. No `scripts/behaviors/` imports.
- Receive data via props. Emit events via Alpine callbacks.
- Logic-light. Layout and style responsibility only.

### Feature Components (`src/components/features/`)
**Rules:**
- May import behaviors via `<script>` tag.
- Handle state, API calls, complex Alpine interactions.
- Each feature's behavior lives in a dedicated `scripts/behaviors/` file.
- Pass data DOWN to UI components and Primitives.

### Pages (`src/pages/`)
**Rules:**
- Thin orchestration layer. Fetch data here, pass to features/UI.
- No raw HTML layout — compose from primitives and components.
- Server logic only in frontmatter.

---

## 4. The `Section` Primitive — Usage Contract

```astro
<!-- CORRECT: Standard page section with containment -->
<Section variant="standard" class="bg-surface">
  <!-- content is auto-wrapped in max-w-7xl px-4 lg:px-8 -->
</Section>

<!-- CORRECT: Footer override — standard containment + padding override -->
<Section as="footer" variant="standard" class="bg-surface !pt-12 !pb-0">
</Section>

<!-- CORRECT: Hero — special top/bottom padding -->
<Section variant="hero">
</Section>

<!-- CORRECT: Full-bleed — no horizontal containment, no padding -->
<Section variant="full">
</Section>

<!-- CORRECT: Compact spacing -->
<Section variant="compact">
</Section>

<!-- WRONG: Never do this -->
<Section class={["bg-surface", someClass]} /> <!-- class:list array — BROKEN -->
<Section variant="full" class="px-4 max-w-7xl mx-auto" /> <!-- defeats full variant -->
```

**Padding Tokens:**
- `standard`: `py-16 md:py-24`
- `compact`: `py-8 md:py-12`
- `hero`: `pt-24 pb-16 md:pt-32 md:pb-24`
- `full`: `py-0`

**`as` prop values:** `section` (default), `div`, `footer`, `header`, `main`

**Alpine transparency:** `Section` spreads `...rest` onto the outer tag. Pass `x-data` and other Alpine attributes directly on `<Section>`.

---

## 5. Design Token Reference

All tokens are defined in `src/styles/global.css` under `@theme {}`.

### Color Tokens (Always use these — never raw hex)
```
--color-primary           #052b22  Midnight Jungle — CTAs, headings
--color-primary-foreground #fefcfa  Text on dark bg
--color-secondary         #e8ddd3  Warm Sand — alt actions
--color-secondary-foreground #052b22
--color-ghost-hover       #f3ede6  Ghost button hover

--color-background        #f9f5f0  Page background (Luminous Silk)
--color-surface           #fefcfa  Cards/containers (Lighter Silk)
--color-surface-muted     #f3ede6  Disabled/subtle areas

--color-text-main         #052b22  Headings/body
--color-text-muted        #6b5e54  Captions/metadata
--color-text-inverse      #fefcfa  On dark bg

--color-border-subtle     #e8ddd3  Dividers
--color-border-strong     #bfa05f  Input outlines/card frames
--color-ring              #bfa05f  Focus rings
--color-ring-glow         rgba(191,160,95,0.4)

--color-accent-coral      #e65142  SALE/NEW/urgency
--color-accent-brass      #bfa05f  Premium details/hovers
--color-accent-emerald    #15803d  Success states
```

### Tailwind v4 Usage Syntax
```
bg-(--color-primary)          ✅ CORRECT
text-(--color-text-muted)     ✅ CORRECT
border-(--color-border-subtle) ✅ CORRECT
bg-[var(--color-primary)]     ❌ WRONG — old v3 syntax
```

### Typography
- Serif: `font-serif` → Fraunces (headings, editorial)
- Sans: `font-sans-serif` → Plus Jakarta Sans (body, UI)

### Z-Index Tokens
```
--z-sticky: 50    (sticky elements)
--z-dropdown: 60  (dropdowns)
--z-nav: 100      (navbar)
--z-overlay: 110  (overlays)
--z-modal: 120    (modals)
--z-drawer: 200   (side drawers)
--z-snipcart: 300 (Snipcart UI)
--z-lightbox: 400 (lightbox)
```

---

## 6. Content Collections — Authoritative Map

Brand ID: driven by `PUBLIC_BRAND_ID` env var (e.g. `zelia-vance`).
All content lives under `src/content/{brandId}/`.

| Collection Key | Path | Format | Purpose |
|---|---|---|---|
| `products` | `{brandId}/products/` | `.md`/`.mdx` | Product data |
| `lookbooks` | `{brandId}/lookbooks/` | `.md`/`.mdx` | Lookbook entries |
| `blog` | `{brandId}/blog/` | `.md`/`.mdx` | Blog posts |
| `legal` | `{brandId}/legal/` | `.md`/`.mdx` | Legal pages |
| `brand` | `{brandId}/brand/` | `.yaml` | Brand story pages |
| `authors` | `{brandId}/authors.yaml` | `.yaml` | Author bios |
| `settings` | `{brandId}/settings/` | `.yaml` | All runtime settings |
| `newsletter_variants` | `{brandId}/newsletter/` | `.yaml` | Newsletter copy variants |
| `collections_grid` | `{brandId}/collections_grid/` | `.yaml` | Featured collections |
| `section_headers` | `{brandId}/section_headers/` | `.yaml` | Section H2 content |
| `page_headers` | `{brandId}/page_headers/` | `.yaml` | Page H1 content |
| `pages_content` | `{brandId}/pages_content/` | `.yaml` | Page-specific CMS content |
| `component_hub` | `{brandId}/component_hub/` | `.yaml` | Standalone component content |

### Critical Settings Files (in `settings/`)
| File | Key in `getEntry("settings", ...)` | Contains |
|---|---|---|
| `brand.yaml` | `"brand"` | Name, tagline, description, social links |
| `legal.yaml` | `"legal"` | Legal entity name, GSTIN, tax origin state/code |
| `legal-taxonomy.yaml` | `"legal-taxonomy"` | HSN codes and GST rates |
| `navigation.yaml` | `"navigation"` | main_menus, support_links, legal_links |
| `taxonomy.yaml` | `"taxonomy"` | Product categories, tags, badges |
| `blog-taxonomy.yaml` | `"blog-taxonomy"` | Blog categories and tags (SEPARATE from product taxonomy) |
| `marketing.yaml` | `"marketing"` | announcement_bar, discount_popup, newsletter_popup |
| `shipping.yaml` | `"shipping"` | free_shipping_threshold, slabs |
| `footer.yaml` | `"footer"` | Newsletter card copy, column headers, labels |
| `tracking.yaml` | `"tracking"` | Google Analytics ID, Meta Pixel |

### Fetching Pattern
```typescript
// Single entry (settings, singletons)
const entry = await getEntry("settings", "brand");
const name = entry?.data?.name;

// Collection entries
const products = await getCollection("products");

// Always use optional chaining — entries can be undefined
const threshold = shippingSettings?.data?.free_shipping_threshold || 3000;
```

---

## 7. Taxonomy — The Critical Separation

**Product taxonomy** (`taxonomy.yaml`) and **blog taxonomy** (`blog-taxonomy.yaml`) are intentionally SEPARATE.

- `BlogCategoryFilter.astro` reads from `getEntry("settings", "blog-taxonomy")` → `categories`.
- `Navbar.astro` and `Footer.astro` read from `getEntry("settings", "taxonomy")` → `categories`.
- **Never cross-wire these.** Blog categories are editorial (Style Guide, Trend Report, etc). Product categories are commercial (Rings, Necklaces, etc).

---

## 8. Alpine.js — Correct Patterns

```html
<!-- Store access -->
<span x-show="$store.wishlist.count > 0" x-text="$store.wishlist.count" x-cloak></span>

<!-- x-cloak MUST be present on all conditionally-shown elements to prevent FOUC -->
<!-- Add [x-cloak] { display: none !important; } in global.css — already there -->

<!-- x-collapse requires the @alpinejs/collapse plugin — use for accordion toggles -->
<div x-show="open" x-collapse>...</div>

<!-- x-teleport — use for mobile drawers to escape stacking contexts -->
<template x-teleport="body">...</template>

<!-- Correct x-data passing for serialized CMS data via define:vars -->
<Section x-data={`searchApp(${JSON.stringify(plainDataObject)})`}>
```

**Serialization Rule:** Before passing CMS data to Alpine via `define:vars` or `x-data`, flatten it:
```typescript
// WRONG — raw Astro entry
const products = await getCollection("products");
// products[0].data is not serializable — Astro attaches non-plain metadata

// CORRECT — flatten to plain objects
const serializedProducts = products.map(p => ({
  slug: p.id,
  title: p.data.title,
  price: p.data.price,
  category: p.data.category,
  image: p.data.image,
}));
```

---

## 9. Icon Usage — Phosphor Icons

```astro
import Icon from "../primitives/Icon.astro";

<!-- Usage -->
<Icon name="PhMagnifyingGlass" />
<Icon name="PhCaretDown" class="h-4 w-4" />
<Icon name="PhShoppingCart" />
<Icon name="PhHeart" />
<Icon name="PhX" />
<Icon name="PhList" />
<Icon name="PhUser" />
<Icon name="PhCheck" />
<Icon name="PhTruck" />
```

- Name format: `Ph` + PascalCase icon name from Phosphor library.
- Never use emoji as icon replacements in UI components.
- Never import Phosphor icons directly — always via the `Icon` primitive.

---

## 10. Image Usage — R2 Engine

```astro
import Image from "../primitives/Image.astro";

<!-- Standard product image -->
<Image src={product.image} alt={product.title} ratio="square" />

<!-- Auto-ratio (actual image dimensions) -->
<Image src={path} alt="alt text" ratio="auto" class="w-full h-full object-cover" />

<!-- Sizes available: ratio="square" | "portrait" | "landscape" | "auto" -->
```

**Path conventions:**
- Dev: Local path from `/public/images/...` (fallback active automatically)
- Production: R2 path via Image Worker at `assets.zeliavance.com`
- Always use the `Image` primitive — never raw `<img>` tags in components.

---

## 11. Snipcart — DO NOT TOUCH Rules

- `public/snipcart-templates.html` — IDs `ov-1` through `ov-14`. Handle with extreme care. Never restructure.
- `src/styles/snipcart.css` — 5-section architecture. Never break section boundaries.
- `src/scripts/behaviors/options-sync.ts` — Syncs variant selections. Extremely sensitive.
- `src/scripts/snipcart-init.ts` — Snipcart initialization. Read before any cart modification.

Snipcart product attributes on buy buttons:
```html
class="snipcart-add-item"
data-item-id={product.sku}
data-item-name={product.title}
data-item-price={product.price}
data-item-url={`/products/${product.slug}`}
data-item-image={product.image}
```

---

## 12. Newsletter Engine — DO NOT REBUILD

The entire newsletter flow is implemented. Never replace or rebuild it.

```
validation.ts → isGmailAddress(), isValidEmail()
newsletter.ts → initNewsletterConfirm()
Input.astro → has readonly prop
NewsletterForm.astro → simple inline form (footer/section)
NewsletterConfirmForm.astro → full confirm form + behavior (feature)
/newsletter/confirm.astro → SSR, reads ?email= from URL
/newsletter/success.astro → static thank-you
/api/actions/newsletter-subscribe.ts → POST endpoint → MailerLite
```

**MailerLite Group ID:** `183469983098995840`
**Gmail-only validation:** applies when user types. Pre-filled email (from delivery link) uses basic `isValidEmail()` only.

---

## 13. Scripts — Which to Use Where

### `scripts/utils/` — Pure Functions (import anywhere)
| File | Exports |
|---|---|
| `badges.ts` | `getBadges()`, badge resolution logic |
| `brand.ts` | Brand-level constants |
| `currency.ts` | `formatPrice()` — always use for ₹ formatting |
| `product-sort.ts` | `sortProducts()` |
| `reading-time.ts` | `getReadingTime()` |
| `recommendations.ts` | `getRecommendations()` |
| `shuffle.ts` | `shuffleArray()` |
| `slugify.ts` | `slugify()` — always use for URL slugs |
| `validation.ts` | `isValidEmail()`, `isGmailAddress()` |

### `scripts/behaviors/` — Business Logic (Feature components only)
| File | Purpose |
|---|---|
| `alpine-entrypoint.ts` | Alpine.js + all plugins registration |
| `blog-discovery.ts` | Blog page Alpine app |
| `blog-filter.ts` | Blog category filter logic |
| `carousel.ts` | Splide carousel init |
| `newsletter.ts` | Newsletter confirm form logic |
| `options-sync.ts` | Snipcart variant sync (SENSITIVE) |
| `popup.ts` | Popup modal trigger logic |
| `quantity.ts` | Cart quantity controls |
| `quick-shop.ts` | Quick-shop drawer logic |
| `side-drawer.ts` | SideDrawer Alpine app |
| `sorting.ts` | Shop page sort logic |
| `toggle.ts` | Generic toggle behavior |
| `wishlist.ts` | Wishlist Alpine store |

---

## 14. Keystatic — CMS Schema Rules

- Keystatic config: `keystatic.config.ts` — Local dev only, never shipped.
- Brand ID resolved from `PUBLIC_BRAND_ID` env var at build time.
- Product categories sourced from `taxonomy.yaml` via `import.meta.glob`.
- Blog categories sourced from `blog-taxonomy.yaml` via `import.meta.glob`.
- When adding a new singleton/collection to Keystatic, also register it in `src/content/config.ts`.
- The navigation in `keystatic.config.ts` uses grouped UI sections — add new items to correct group.

---

## 15. Environment Variables Reference

| Variable | Side | Purpose |
|---|---|---|
| `PUBLIC_BRAND_ID` | Client+Server | Brand identifier (e.g. `zelia-vance`). Drives all content paths. |
| `PUBLIC_SNIPCART_API_KEY` | Client | Snipcart public key |
| `PUBLIC_IMAGE_GATEWAY_URL` | Client+Server | R2 Worker base URL |
| `PUBLIC_AFFILIATE` | Client+Server | `"true"` = affiliate mode, no cart |
| `SNIPCART_SECRET_API_KEY` | Server only | Snipcart private key |
| `RAZORPAY_KEY_ID` | Server only | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Server only | Razorpay secret |
| `SHIPROCKET_EMAIL` | Server only | Shiprocket API login |
| `SHIPROCKET_PASSWORD` | Server only | Shiprocket API password |
| `SHIPROCKET_WEBHOOK_TOKEN` | Server only | `ZeliaVance_Secure_Deploy_2026` |
| `MAILERLITE_API_KEY` | Server only | MailerLite v3 key |
| `MAILERLITE_GROUP_ID` | Server only | `183469983098995840` |

**Access pattern:**
```typescript
// Astro components / API routes
const key = import.meta.env.PUBLIC_BRAND_ID;         // client-safe
const secret = import.meta.env.SNIPCART_SECRET_API_KEY; // server only

// content/config.ts (Node context)
const brandId = import.meta.env.PUBLIC_BRAND_ID;
```

---

## 16. Multi-Tenant — Affiliate Mode Gating

When `PUBLIC_AFFILIATE === "true"`:
- No Snipcart. No cart button. No buy buttons.
- Products show affiliate outbound links instead of add-to-cart.
- No Razorpay bridge.
- Footer/Navbar hide cart icon.
- Keystatic hides D2C-specific fields.

Always gate D2C features:
```typescript
const isAffiliate = import.meta.env.PUBLIC_AFFILIATE === "true";
// Then in template:
{!isAffiliate && <AddToCartButton ... />}
```

---

## 17. The Precise Execution Protocol

For **every task**, follow these steps in order. Do not skip any step.

### Step 1: Understand
- Read the task description completely.
- Identify all files that will be affected.
- Read every affected file before writing a single line.
- Identify the atomic layer(s) involved (Primitive / UI / Feature / Page).

### Step 2: Audit
- Does a suitable existing component already exist? If yes, use it.
- Will any change violate the Non-Negotiables in Section 1?
- Is there CMS content that should drive this, or is it correctly hardcoded?
- Are there cross-file dependencies (imports, Alpine stores, behaviors)?

### Step 3: Plan
- Write out the exact list of files to change and what change to make.
- Identify what data needs to be fetched and from which collection.
- Verify every token/class name against `global.css` before using it.
- Confirm the Alpine pattern if any Alpine.js is involved.

### Step 4: Execute
- Make all changes.
- After each file edit, re-read the edited portion to verify correctness.
- Never leave a partial edit. Complete every file change fully.

### Step 5: Verify
- After all edits: trace the data flow from CMS → frontmatter → template → rendered HTML.
- Check that no hardcoded strings remain that belong in CMS.
- Check that no wrong token names, wrong Alpine directives, wrong import paths exist.
- Confirm the component sits at the correct atomic layer.

### Step 6: Report
- State exactly what was changed and why.
- Flag any decisions that had multiple valid approaches and explain which was chosen.
- Flag anything that was intentionally left for a future session.

---

## 18. Common Error Patterns to Actively Prevent

| Error Pattern | Prevention |
|---|---|
| Using `text-primary` (v3 Tailwind) | Use `text-(--color-primary)` (v4 syntax) |
| `class:list={[...]}` on Section | Section takes plain string `class` prop |
| Passing raw `getCollection()` entries to Alpine | Flatten to plain objects first |
| `variant="full"` on a Section that needs containment | Use `variant="standard"` |
| Importing a behavior into a UI component | Behaviors only in Feature components |
| Hardcoding category names as strings | Read from `getEntry("settings", "taxonomy")` |
| Blog filter reading from product taxonomy | Must read from `"blog-taxonomy"` |
| `export const prerender` declared twice | Check entire file before adding |
| `<img>` tag instead of `Image` primitive | Always use `Image.astro` |
| `slugify` called without importing it | Import from `scripts/utils/slugify.ts` |
| Alpine `x-show` without `x-cloak` | Always pair them to prevent FOUC |
| `getEntry` result used without optional chaining | Always use `?.` — entries can be null |
| `console.log` left in production code | Remove all debug logs before finishing |
| `.bak` files committed | Never create `.bak` files; use Git for history |

---

## 19. Astro-Specific Rules

- `export const prerender = false` — only needed for SSR routes. Pages are static by default.
- `define:vars={{ key: value }}` in `<script>` — use for passing server data to client scripts. Values must be JSON-serializable.
- `is:inline` — only for scripts that must not be bundled (Snipcart init, third-party embeds).
- `client:load` — for interactive islands. Use sparingly.
- `<slot />` — the output port of layout components. Never forget it.
- MDX content: always use `<Content />` component, not raw string rendering.

---

## 20. File Naming & Organization Conventions

| Type | Convention | Example |
|---|---|---|
| Astro components | PascalCase | `GlassProductCard.astro` |
| TypeScript scripts | camelCase | `side-drawer.ts` |
| Content files | kebab-case | `blog-taxonomy.yaml` |
| Page routes | kebab-case | `care-guide.astro` |
| API routes | kebab-case | `order-completed.ts` |

---

## 21. Git Workflow

- Commit in logical, atomic chunks — one feature/fix per commit.
- Commit message format: `type(scope): description`
  - `feat(footer): add CMS-driven column headers`
  - `fix(search): correct Alpine serialization for blog data`
  - `refactor(blog-filter): use blog-taxonomy instead of product taxonomy`
- Never commit `.bak` files, `console.log` statements, or TODO-only stubs.
- Branch: `feature/content-foundation` is the active branch.

---

## 22. Operational Rules (Business Logic — Never Change Without Approval)

- Free shipping threshold: ₹3,000 (in `shipping.yaml`).
- Returns window: 48 hours from delivery. Uncut unboxing video mandatory.
- No international shipping. India only.
- Snipcart webhook always returns `200 OK` even on internal errors (prevents Shiprocket duplicate retries).
- Price range: ₹399 – ₹5,000.
- Brand voice is "Zee" — never founder-led. Warm, Gen-Z adjacent, inclusive.

---

## Quick Reference: Which Collection for What

```
Product category list     → getEntry("settings", "taxonomy")       → .data.categories
Blog category list        → getEntry("settings", "blog-taxonomy")  → .data.categories
Product tags              → getEntry("settings", "taxonomy")       → .data.tags
Blog tags                 → getEntry("settings", "blog-taxonomy")  → .data.tags
Nav links                 → getEntry("settings", "navigation")     → .data.main_menus
Footer settings           → getEntry("settings", "footer")         → .data.column_headers
Search settings           → getEntry("settings", "search")
Empty states (all)        → getEntry("settings", "empty_states")
UI Labels (all)           → getEntry("settings", "ui_labels")
Announcement bar          → getEntry("settings", "marketing")      → .data.announcement_bar
Discount popup            → getEntry("settings", "marketing")      → .data.discount_popup
Newsletter popup          → getEntry("settings", "marketing")      → .data.newsletter_popup
Free shipping threshold   → getEntry("settings", "shipping")       → .data.free_shipping_threshold
Brand name / social       → getEntry("settings", "brand")          → .data.name / .data.social
Page H1 content           → getEntry("page_headers", "[page-id]")
Section H2 content        → getEntry("section_headers", "[section-id]")
Newsletter copy           → getEntry("newsletter_variants", "[variant-id]")
FAQ content               → getEntry("pages_content", "faq")
Home hero                 → getEntry("pages_content", "home")
Trust section             → getEntry("pages_content", "trust_section")
```
