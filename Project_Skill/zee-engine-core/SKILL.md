---
name: zee-engine-core
description: Use this skill when working on the Zee Engine platform. Enforces Atomic Design rules, Tailwind v4 token syntax, Keystatic CMS data patterns, Alpine.js serialization rules, Ghost Operator architecture constraints, and the 6-step execution protocol. Prevents all known error patterns specific to this Astro 5 multi-tenant engine.
---

# Zee Engine — Core Platform Developer

## Role
You are a senior Astro 5 engineer working on the **Zee Engine** — a multi-tenant, white-label e-commerce platform. You write precise, atomic, CMS-driven code. You never hallucinate APIs, never use deprecated patterns, and never leave a task half-done.

**Zelia Vance** is Brand #1. It is a tenant of the engine, not the engine itself. All architectural decisions are made for the multi-tenant platform first.

---

## 0. Read Before Every Task

1. Read `AGENTS.md` at the repo root in its entirety before touching any code.
2. Read the target file(s) before editing them — never assume content.
3. Read all files that the target file imports from.
4. Check `src/styles/global.css` AND `src/styles/{brandId}/theme.css` for every CSS token before using one.
5. **Read `Project_Skill/tailwind-v4-engine/SKILL.md`** before writing any Tailwind class — this engine uses v4 and agents trained on v3 data will silently produce broken code.
6. When in doubt, view the file. Never guess.

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
- **NEVER** import `BaseLayout.astro` directly in a page — always use `EngineLayout.astro`.

---

## ⚠️ GHOST OPERATOR RULES — Zero-Copy Architecture (CRITICAL)

> **These rules protect the sovereign asset architecture. Violating them can corrupt the media pipeline.**

### `public/images/` is a Windows Directory Junction — NOT a real folder

`public/images/` is a **Windows Directory Junction** pointing to an external Master Media Repository on a separate drive. It is **NOT** a folder inside this Git repository.

**NEVER:**
- Write files into `public/images/`
- Delete files from `public/images/`
- Commit anything under `public/images/` (it is in `.gitignore`)
- Create directories inside `public/images/`
- Assume you can create new media by writing to this path

**If local images return 404:**
1. Check `server.fs.allow` in `astro.config.mjs` — the `LOCAL_MEDIA_PATH` env var must point to the external media directory.
2. Check that the Windows Junction exists: `public/images/` should not appear as an empty folder.
3. Check that the `PUBLIC_IMAGE_GATEWAY_URL` env var is empty in dev (to force local fallback).
4. **Do NOT assume the file is missing** — the junction or Vite bridge may simply be misconfigured.
5. Never run `rclone sync` with `--delete` without a `--dry-run` audit first.

**The Vite Bridge rule:**
```javascript
// astro.config.mjs — NEVER remove this block
fs: {
  allow: [
    searchForWorkspaceRoot(process.cwd()),
    ...(env.LOCAL_MEDIA_PATH ? [path.resolve(__dirname, env.LOCAL_MEDIA_PATH)] : [])
  ]
}
```
Removing `server.fs.allow` will cause all local media to 404 immediately. It is NOT safe to remove.

### Ghost Asset Fallback

`BaseLayout.astro` has a 3-tier favicon strategy (R2 Gateway → Local Junction → Base64 fallback SVG). This is intentional and correct. Do not replace the fallback icon logic with a static `<link rel="icon">` pointing to a file that may not exist.

---

## 2. Tech Stack — Exact Versions

| Layer | Technology | Critical Notes |
|---|---|---|
| Framework | Astro 5.x | Island architecture. SSR via Cloudflare adapter. |
| Styling | **Tailwind CSS v4** — see `tailwind-v4-engine` skill | `@tailwindcss/vite` plugin. `@theme` block in `global.css`. No `tailwind.config.js`. No `@tailwind` directives. Token syntax: `bg-(--token)` not `bg-[var(--token)]`. |
| Interactivity | Alpine.js 3.x | `x-data`, `x-show`, `x-cloak`, `@click`, `:class`. |
| Collapse | `@alpinejs/collapse` | Use `x-collapse` directive. Registered in `alpine-entrypoint.ts`. |
| Icons | `phosphor-icons-astro` | Component names are `Ph` + PascalCase. e.g. `PhMagnifyingGlass`. |
| Carousel | `@splidejs/splide` | Never reinvent carousels. Use Splide via `carousel.ts` behavior. |
| Search | `fuse.js` v7 | Client-side fuzzy search. Data must be plain serialized objects. |
| CMS | Keystatic | Local dev only. Config in `keystatic.config.ts`. Junction-aware via `patches/`. |
| Cart | Snipcart v3 | Custom templates in `public/snipcart-templates.html`. D2C mode only. |
| Payments | Razorpay | Bridge at `/checkout/razorpay.astro`. Do not touch without full context. |
| Shipping | Shiprocket | Webhook at `/api/checkout/order-completed.ts`. |
| Images | Cloudflare R2 + Worker | Via `Image.astro` primitive. Gateway: `assets.zeliavance.com`. |
| Email | MailerLite | Group ID `183469983098995840`. API key in env. |
| Hosting | Cloudflare Pages | `@astrojs/cloudflare` adapter. Netlify is fully removed. |

---

## 3. Atomic Design — Layer Rules (STRICT)

### Primitives (`src/components/primitives/`)
**Full Inventory (13):** `AdSlot`, `Badge`, `Button`, `FilterChip`, `Heading`, `Icon`, `Image`, `Input`, `Link`, `Logo`, `Modal`, `Section`, `Text`

**Rules:**
- No API calls. No event listeners. No `scripts/behaviors/` imports.
- Props and styles only. May import from `scripts/utils/` for pure formatting.

### UI Components (`src/components/ui/`)
**Full Inventory (39):** `Accordion`, `AccordionItem`, `AddToCartButton`, `Alert`, `AnnouncementBar`, `BlogCard`, `BlogCategoryFilter`, `Breadcrumbs`, `Carousel`, `CartToast`, `CollectionCard`, `ComingSoon`, `CopyButton`, `DrawerProductCard`, `EditorialHero`, `EmptyState`, `FilterSortBar`, `FormField`, `GlassProductCard`, `Lightbox`, `MenuToggle`, `MetadataStrip`, `NavDropdown`, `NewsletterForm`, `NewsletterPageCard`, `OptionSelector`, `PageHeader`, `Pagination`, `PopupCoupon`, `PopupNewsletter`, `PriceTag`, `QuantitySelector`, `RatingStars`, `SearchInput`, `SectionHeader`, `SideDrawer`, `SkipLinks`, `SocialLinks`, `TrustSection`

**Rules:**
- Combinations of Primitives only. No API calls. No `scripts/behaviors/` imports.
- Receive data via props. Logic-light. Layout and style responsibility only.

### Feature Components (`src/components/features/`)
**Full Inventory (25):** `AffiliateEngine`, `AffiliateProductCTA`, `AffiliateQuickView`, `BrandEngine`, `BuySetButton`, `CategoryCarousel`, `CompleteTheLook`, `Footer`, `FreeShippingNudge`, `GalleryCarousel`, `LookbookCarousel`, `MobileMenu`, `Navbar`, `NewsletterConfirmForm`, `NewsletterWidget`, `ProductCarousel`, `ProductGallery`, `ProductGrid`, `RelatedLookbooksCarousel`, `RelatedProducts`, `SmartBlogGrid`, `SmartProductGrid`, `TableOfContents`, `TrackingScripts`, `WishlistButton`

**Rules:**
- May import behaviors via `<script>` tag.
- Handle state, API calls, complex Alpine interactions.
- Each feature's behavior lives in a dedicated `scripts/behaviors/` file.

### Pages (`src/pages/`)
**Rules:**
- Thin orchestration layer. Fetch data here, pass to features/UI.
- No raw HTML layout — compose from primitives and components.
- **Always import `EngineLayout.astro`** — never `BaseLayout.astro` directly.

### Layout Hierarchy (Non-Negotiable)
```
BaseLayout.astro           ← Shell only. Navbar, Footer, popups, favicon.
  └── EngineLayout.astro   ← Mode selector. Injects BrandEngine OR AffiliateEngine + TrackingScripts.
        └── [Page].astro   ← Content. ALWAYS imports EngineLayout.
```

---

## 4. The `Section` Primitive — Usage Contract

```astro
<!-- CORRECT -->
<Section variant="standard" class="bg-surface">...</Section>
<Section as="footer" variant="standard" class="!pt-12 !pb-0">...</Section>
<Section variant="hero">...</Section>
<Section variant="full">...</Section>
<Section variant="compact">...</Section>

<!-- WRONG -->
<Section class={["bg-surface", someClass]} />   <!-- array — BROKEN -->
<Section variant="full" class="px-4 max-w-7xl mx-auto" />  <!-- defeats full -->
```

Variants: `standard` (py-16 md:py-24), `compact` (py-8 md:py-12), `hero` (pt-24 pb-16), `full` (py-0)
`as` prop: `section` (default), `div`, `footer`, `header`, `main`
Alpine attrs (`x-data`, etc.) pass through via `...rest`.

---

## 5. Design Token Reference

All engine-level tokens defined in `src/styles/global.css` under `@theme {}`.
Brand-specific overrides in `src/styles/{brandId}/theme.css` (aliased as `@brand-theme`).

```
--color-primary           #052b22   CTAs, headings
--color-background        #f9f5f0   Page background
--color-surface           #fefcfa   Cards/containers
--color-surface-muted     #f3ede6   Disabled/subtle
--color-text-main         #052b22   Headings/body
--color-text-muted        #6b5e54   Captions/metadata
--color-text-inverse      #fefcfa   On dark bg
--color-border-subtle     #e8ddd3   Dividers
--color-border-strong     #bfa05f   Input outlines
--color-danger          #e65142   SALE/NEW/urgency
--color-accent          #bfa05f   Premium details
--color-success         #15803d   Success states
```

Tailwind v4 syntax: `bg-(--color-primary)` ✅ — NEVER `bg-[var(--color-primary)]` ❌

---

## 6. Content Collections & Fetching

`PUBLIC_BRAND_ID` env var (e.g. `zelia-vance`) drives all content paths. All content lives under `src/content/{brandId}/`.

```typescript
const entry = await getEntry("settings", "brand");  // always use optional chaining
const name = entry?.data?.name ?? "Default";

const products = await getCollection("products");
```

Key settings files (all under `src/content/{brandId}/settings/`):
- `"brand"` — name, tagline, social links, email, phone
- `"navigation"` — menus, header links
- `"taxonomy"` — product categories/tags (**NEVER use for blog**)
- `"blog-taxonomy"` — blog categories/tags (**NEVER use for products**)
- `"marketing"` — announcement bar, popups (discount + newsletter)
- `"shipping"` — free_shipping_threshold, slabs
- `"footer"` — column headers, newsletter card
- `"tracking"` — GA ID, Meta Pixel ID (read by `TrackingScripts.astro`)

Other content directories:
- `blog/` — `.mdx` files. Supports imported Astro components (`<AdSlot>`, etc.) and React.
- `legal/` — `.mdx` files. **Content policy: MUST remain purely informational. Never import or render `<AdSlot>`, `<AffiliateProductCTA>`, or any commercial component inside a legal file.** Violation is a legal and trust issue.
- `products/` — YAML product files
- `lookbooks/` — YAML lookbook files
- `page_headers/` — `getEntry("page_headers", "[page-id]")`
- `section_headers/` — `getEntry("section_headers", "[id]")`
- `pages_content/` — `getEntry("pages_content", "faq")`, `"home"`, etc.

---

## 7. Two-Mode Binary — D2C vs Affiliate

The engine has exactly **two** modes, gated by `PUBLIC_AFFILIATE` (boolean string):

| `PUBLIC_AFFILIATE` | Mode | Commerce Stack |
|---|---|---|
| `false` | D2C Full | Snipcart + Razorpay + Shiprocket — injected by `BrandEngine.astro` |
| `true` | Affiliate | Affiliate link buttons — injected by `AffiliateEngine.astro` |

- `EngineLayout.astro` does the switch: `isAffiliate ? <AffiliateEngine /> : <BrandEngine />`
- **"Editorial"** is NOT a third mode — it is a D2C or Affiliate site with no products in the catalog.
- `TrackingScripts.astro` is always injected by `EngineLayout` regardless of mode.

---

## 8. Alpine.js — Correct Patterns

```html
<!-- x-cloak MUST pair with x-show — always -->
<span x-show="count > 0" x-cloak></span>

<!-- Flatten CMS data BEFORE passing to Alpine -->
const serialized = products.map(p => ({ slug: p.id, title: p.data.title, price: p.data.price ?? 0 }));

<!-- Two script tags for Fuse.js pages -->
<script is:inline define:vars={{ serialized }}>
  document.addEventListener("alpine:init", () => { Alpine.data("myApp", () => ({ items: serialized })); });
</script>
<script>
  import Fuse from "fuse.js";
  (window as any).Fuse = Fuse;
</script>
```

---

## 9. The Precise Execution Protocol

For **every task**, follow these steps. Do not skip any.

1. **Understand** — Read task. Identify all affected files. Read them. Identify atomic layer and engine mode.
2. **Audit** — Does a suitable component exist? Will this violate Non-Negotiables or Ghost Operator rules? Is content CMS-driven?
3. **Plan** — List exact files + changes. Verify tokens against `global.css` and `theme.css`. Confirm Alpine pattern.
4. **Execute** — Make all changes. Re-read edited portions to verify. Never leave partial edits.
5. **Verify** — Trace CMS → frontmatter → template → HTML. Check no hardcoded strings, no wrong tokens, correct atomic layer.
6. **Report** — State what changed and why. Flag decisions. Flag anything deferred.

---

## 10. Common Error Patterns to Prevent

| Error | Prevention |
|---|---|
| `text-primary` (v3 syntax) | Use `text-(--color-primary)` |
| `class:list={[...]}` on Section | Section takes plain string `class` |
| Raw entries passed to Alpine | Flatten to plain objects first |
| `variant="full"` needing containment | Use `variant="standard"` |
| Behavior imported in UI component | Behaviors only in Feature components |
| Blog filter from product taxonomy | Must use `"blog-taxonomy"` |
| `<img>` instead of Image primitive | Always use `Image.astro` |
| `x-show` without `x-cloak` | Always pair to prevent FOUC |
| `getEntry` without optional chaining | Always use `?.` |
| `.bak` files committed | Never create — use Git for history |
| Importing `BaseLayout` in a page | Always import `EngineLayout` instead |
| Writing/deleting files in `public/images/` | It's a Windows Junction — read-only to this repo |
| Assuming image 404 = missing file | Check `server.fs.allow` and junction first |
| Hardcoding brand name "Zelia Vance" | Read from `getEntry("settings", "brand")?.data?.name` |

---

## 11. Do Not Touch Without Full Context

- `public/snipcart-templates.html` (IDs ov-1 through ov-14)
- `src/styles/snipcart.css` (5-section architecture)
- `src/scripts/behaviors/options-sync.ts` (Snipcart variant sync)
- `src/pages/checkout/razorpay.astro` (payment bridge)
- `src/pages/api/checkout/order-completed.ts`
- `src/pages/api/webhooks/logistics-sync.ts`
- `astro.config.mjs` → `server.fs.allow` block (Ghost Operator bridge)
- Newsletter flow — fully built, never rebuild it

---

## 12. Scripts Reference

### `scripts/utils/` — Pure functions (safe everywhere)

| File | Purpose |
|---|---|
| `badges.ts` | Badge label/color logic |
| `brand.ts` | Brand-level utility helpers |
| `currency.ts` | Price formatting |
| `headings.ts` | Heading level utilities |
| `product-sort.ts` | Sort comparison functions |
| `reading-time.ts` | Build-time word count → "X min read" |
| `recommendations.ts` | Jaccard Similarity + Cross-Category Discovery |
| `shuffle.ts` | Fisher-Yates uniform shuffle |
| `slugify.ts` | URL slug generation |
| `validation.ts` | `isGmailAddress()`, `isValidEmail()` |

### `scripts/behaviors/` — Business logic (Features only)

| File | Purpose |
|---|---|
| `affiliate-quick-view.ts` | Affiliate product quick-view drawer |
| `alpine-entrypoint.ts` | Alpine.js store registration |
| `blog-discovery.ts` | Blog tag/category discovery |
| `blog-filter.ts` | Blog category filter |
| `carousel.ts` | Splide.js initialization |
| `newsletter.ts` | Newsletter confirm flow |
| `options-sync.ts` | Snipcart variant ↔ custom field sync |
| `popup.ts` | Popup modal logic |
| `quantity.ts` | Cart quantity selector |
| `quick-shop.ts` | Quick shop behavior |
| `region.ts` | Geo-detection + region/currency Alpine store |
| `side-drawer.ts` | SideDrawer multi-mode (upsell, quick-shop, master-set) |
| `sorting.ts` | Product sort Alpine store |
| `toc.ts` | Blog Table of Contents — active section tracking |
| `toggle.ts` | Generic toggle behavior |
| `wishlist.ts` | Wishlist Alpine store + localStorage |

---

## Quick Reference: getEntry() Cheat Sheet

```
Product categories  → getEntry("settings", "taxonomy")      → .data.categories
Blog categories     → getEntry("settings", "blog-taxonomy") → .data.categories
Nav links           → getEntry("settings", "navigation")    → .data.main_menus
Footer settings     → getEntry("settings", "footer")        → .data.column_headers
Announcement bar    → getEntry("settings", "marketing")     → .data.announcement_bar
Free shipping       → getEntry("settings", "shipping")      → .data.free_shipping_threshold
Brand name          → getEntry("settings", "brand")         → .data.name
Page H1             → getEntry("page_headers", "[page-id]")
Section H2          → getEntry("section_headers", "[id]")
FAQ                 → getEntry("pages_content", "faq")
Home hero           → getEntry("pages_content", "home")
```
