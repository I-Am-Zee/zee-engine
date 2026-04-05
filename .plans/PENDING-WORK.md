# Pending Work
> The honest, up-to-date backlog. Ordered by priority.
> Updated after every major session.
> **Last Updated:** 2026-04-05 (Post Milestone 2 Surgery)

---

## 🔴 Critical (Do First)

### P-005: Keystatic Local-Dev Integration
**Milestone:** 3
**Depends on:** P-001 ✅, P-004 ✅
**Description:** Install `@keystatic/astro`. Mount dashboard at `/keystatic` during dev mode only. Configure Keystatic to target `src/content/${PUBLIC_BRAND_ID}/` collections. Map all schema fields to visual editors.

---

## 🟡 Important (Next Up)

### P-009: `TrackingScripts` Component
**Milestone:** 3
**Depends on:** P-001 ✅
**Description:** Create `src/components/features/TrackingScripts.astro`. Reads from `src/content/{brand-id}/settings/tracking.json`. Renders only the script tags for IDs that exist in the file. Handles Meta Pixel, Google Analytics, Cuelinks (Affiliate mode only). Currently `AffiliateEngine.astro` is an empty placeholder — this component fills it. Also: add `tracking.json` to the content schema.

### P-010: Affiliate Product Schema & Collection
**Milestone:** 4 (Brand 2 setup)
**Description:** Define a separate `products-affiliate` collection in `config.ts` with fields: `title`, `description`, `image`, `gallery`, `affiliate_link`, `affiliate_platform`, `display_price`, `category`, `tags`, `badges`. No `price`, `sku`, or `variant_*` fields.

### P-011: "Buy from Store" Affiliate CTA Button
**Milestone:** 4
**Description:** Create `AffiliateProductCTA.astro` primitive. Renders an external link button with the `affiliate_link`. Includes platform name ("Shop on Myntra"). Used in Affiliate mode product pages instead of Snipcart "Add to Cart."

---

## 🟢 Minor (Milestone 3+)

### P-008: Design Token System per Brand
**Milestone:** 5
**Description:** Create `src/styles/base.css` (universal structural CSS) and `src/styles/{brand-id}/theme.css` (brand-specific CSS variables — colors, fonts, border radius). Add greyscale fallback defaults to base CSS so unstyled brands render neutrally.

### P-012: MDX `<AdSlot />` Component
**Milestone:** 4
**Description:** Create `src/components/primitives/AdSlot.astro`. Accepts an `id` prop. Renders a Google AdSense `<ins>` tag. Used inside `.mdx` blog posts for Affiliate brands only (never rendered in Brand mode via EngineLayout conditional)

### P-013: Newsletter Widget
**Milestone:** 5
**Description:** Build `NewsletterWidget.astro` feature component with variants: `section`, `footer`, `sidebar`, `modal`. Brand-agnostic — copy sourced from `src/content/{brand-id}/newsletter/{brand-id}.json`. (Deferred from earlier sessions — not priority until engine is stable.)

### P-014: About Page (GSAP + Lenis)
**Milestone:** 5
**Description:** Immersive scrolling About page for Zelia Vance. JSON-driven screenplay. GSAP scroll triggers + Lenis smooth scroll.

### P-015: Care Guide Page
**Milestone:** 5
**Description:** Same as About page. GSAP + Lenis. JSON-driven. Specific to Zelia Vance.

### P-016: Blog System (Full)
**Milestone:** 5
**Description:** Build fully functional blog index page, blog detail pages with sticky TOC sidebar. MDX rendering with `<AdSlot />` support.

---

## ✅ Completed

### Milestone 0 & Foundation
- ✅ Astro 5 Content Layer API migration (`entry.slug` → `entry.id`, `entry.render()` → `render(entry)`)
- ✅ Brand-specific content folders (`src/content/zelia-vance/`)
- ✅ `PUBLIC_BRAND_ID` drives all content paths

### Milestone 1: Engine Room Prep
- ✅ PagesCMS (`.pages.yml`) removed
- ✅ `@astrojs/mdx` installed and configured
- ✅ Blog migrated to `.mdx`
- ✅ `PUBLIC_STORE_MODE` renamed to `PUBLIC_AFFILIATE` (boolean) — P-006 ✅
- ✅ `.env.example` fully documented with mode-conditional comments — P-007 ✅
- ✅ `@astrojs/cloudflare` adapter (Netlify adapter removed)
- ✅ All Netlify references purged from codebase (`astro.config.mjs`, URL logic, comments) — P-002 ✅
- ✅ `PUBLIC_SITE_URL` standardized across all URL resolution

### Milestone 2: Layout Engine Architecture
- ✅ `EngineLayout.astro` created as mode-aware middle layer — P-001 ✅
- ✅ `BrandEngine.astro` created — all Snipcart/D2C logic isolated here
- ✅ `AffiliateEngine.astro` created — placeholder for Affiliate tracking scripts
- ✅ `BaseLayout.astro` stripped to universal-only shell (no Snipcart, no hardcoded branding)
- ✅ All pages migrated from `BaseLayout` → `EngineLayout`
- ✅ Fail-fast guard for `PUBLIC_BRAND_ID` in `config.ts` — P-003 ✅
- ✅ `site.config.ts` **deleted** — P-004 ✅
- ✅ `Logo.astro` — brand name from Content Layer
- ✅ `SocialLinks.astro` — social links from Content Layer
- ✅ `Footer.astro` — brand data and copyright from Content Layer
- ✅ `contact.astro` — email and optional phone from Content Layer
- ✅ `phone` and `address` fields added to `site` content schema

### Evergreen
- ✅ R2 + Cloudflare Worker image engine
- ✅ Snipcart UI rebrand (Royal Conservatory palette)
- ✅ Razorpay custom payment bridge
- ✅ Shiprocket webhook + delivery email
- ✅ MailerLite dual-trigger newsletter
- ✅ Wishlist (Alpine.js + localStorage)
- ✅ SideDrawer (upsell, quick-shop, master-set)
- ✅ Lookbook Carousel (Splide.js)
- ✅ Free Shipping Nudge
- ✅ Z-index architecture
- ✅ All Atomic Design primitives: Button, Input, Heading, Text, Icon, Image, Badge, Link, Logo


---

## 🔴 Critical (Do First)

### P-001: Implement the `EngineLayout` Wrapping Pattern
**Milestone:** 2
**Depends on:** Nothing
**Description:** Create `EngineLayout.astro`, `BrandEngine.astro`, and `AffiliateEngine.astro`. Move Snipcart injection into `BrandEngine`. Strip `BaseLayout` down to universal-only content. Update all pages to use `EngineLayout` instead of `BaseLayout`.

### P-002: Delete All Netlify References + Add `PUBLIC_SITE_URL`
**Milestone:** 2
**Depends on:** Nothing
**Description:** Remove `site: 'https://zaviona-dev.netlify.app'` from `astro.config.mjs`. Replace with `site: import.meta.env.PUBLIC_SITE_URL`. Add `PUBLIC_SITE_URL` to `.env`, `.env.example`. Delete all remaining Netlify comments or references.

### P-003: Add Fail-Fast Guard to `config.ts`
**Milestone:** 2
**Depends on:** Nothing (one-line fix, do in the next commit)
**Description:** Replace `const brandId = import.meta.env.PUBLIC_BRAND_ID || "zelia-vance"` with a guard that throws if the variable is not set.

---

## 🟡 Important (Milestone 2)

### P-004: Retire `site.config.ts`
**Milestone:** 2
**Depends on:** P-001 (EngineLayout), Content Layer being stable
**Description:** Audit all imports of `src/lib/site.config.ts`. Replace with `getEntry('settings', 'site')`. Delete the file after all consumers are updated.

### P-005: Keystatic Local-Dev Integration
**Milestone:** 3
**Depends on:** P-001, P-004
**Description:** Install `@keystatic/astro`. Mount dashboard at `/keystatic` during dev mode only. Configure Keystatic to target `src/content/${PUBLIC_BRAND_ID}/` collections. Map all schema fields to visual editors.

### P-006: Rename `PUBLIC_STORE_MODE` → `PUBLIC_AFFILIATE`
**Milestone:** 2
**Depends on:** Nothing
**Description:** We added `PUBLIC_STORE_MODE="brand"` but decided `PUBLIC_AFFILIATE=false` (boolean) is cleaner. Find and replace across `.env`, `.env.example`. The variable is not yet used in code so this is a pure `.env` rename.

### P-007: Document `.env.example` with Mode-Conditional Comments
**Milestone:** 2
**Depends on:** P-006
**Description:** Add inline comments to `.env.example` explaining which vars are D2C-only vs universal.

---

## 🟢 Minor (Milestone 3+)

### P-008: Design Token System per Brand
**Milestone:** 3+
**Description:** Create `src/styles/base.css` (universal structural CSS) and `src/styles/{brand-id}/theme.css` (brand-specific CSS variables — colors, fonts, border radius). Add greyscale fallback defaults to base CSS so unstyled brands render neutrally.

### P-009: `TrackingScripts` Component
**Milestone:** 3+
**Description:** Create `src/components/features/TrackingScripts.astro`. Reads from `src/content/{brand-id}/settings/tracking.json`. Renders only the script tags for IDs that exist in the file. Handles: Meta Pixel, Google Analytics, Snipcart key (Brand mode), Cuelinks (Affiliate mode).

### P-010: Affiliate Product Schema & Collection
**Milestone:** 4 (Brand 2 setup)
**Description:** Define a separate `products-affiliate` collection in `config.ts` with fields: `title`, `description`, `image`, `gallery`, `affiliate_link`, `affiliate_platform`, `display_price`, `category`, `tags`, `badges`. No `price`, `sku`, or `variant_*` fields.

### P-011: "Buy from Store" Affiliate CTA Button
**Milestone:** 4
**Description:** Create `AffiliateProductCTA.astro` primitive. Renders an external link button with the `affiliate_link`. Includes platform name ("Shop on Myntra"). Used in Affiliate mode product pages instead of Snipcart "Add to Cart."

### P-012: MDX `<AdSlot />` Component
**Milestone:** 4
**Description:** Create `src/components/primitives/AdSlot.astro`. Accepts an `id` prop. Renders a Google AdSense `<ins>` tag. Used inside `.mdx` blog posts for Affiliate brands only (never rendered in Brand mode via EngineLayout conditional).

### P-013: Newsletter Widget
**Milestone:** 5
**Description:** Build `NewsletterWidget.astro` feature component with variants: `section`, `footer`, `sidebar`, `modal`. Brand-agnostic — copy sourced from `src/content/{brand-id}/newsletter/{brand-id}.json`. (Deferred from earlier sessions — not priority until engine is stable.)

### P-014: About Page (GSAP + Lenis)
**Milestone:** 5
**Description:** Immersive scrolling About page for Zelia Vance. JSON-driven screenplay. GSAP scroll triggers + Lenis smooth scroll.

### P-015: Care Guide Page
**Milestone:** 5
**Description:** Same as About page. GSAP + Lenis. JSON-driven. Specific to Zelia Vance.

### P-016: Blog System (Full)
**Milestone:** 5
**Description:** Build fully functional blog index page, blog detail pages with sticky TOC sidebar. MDX rendering with `<AdSlot />` support.

---

## ✅ Completed

- ✅ Astro 5 Content Layer API migration (`entry.slug` → `entry.id`, `entry.render()` → `render(entry)`)
- ✅ Brand-specific content folders (`src/content/zelia-vance/`)
- ✅ `PUBLIC_BRAND_ID` drives all content paths
- ✅ PagesCMS (`.pages.yml`) removed
- ✅ `@astrojs/mdx` installed and configured
- ✅ Blog migrated to `.mdx`
- ✅ `PUBLIC_STORE_MODE="brand"` added to `.env` (pending rename to `PUBLIC_AFFILIATE`)
- ✅ R2 + Cloudflare Worker image engine
- ✅ Snipcart UI rebrand
- ✅ Razorpay custom payment bridge
- ✅ Shiprocket webhook + delivery email
- ✅ MailerLite dual-trigger newsletter
- ✅ Wishlist (Alpine.js + localStorage)
- ✅ SideDrawer (upsell, quick-shop, master-set)
- ✅ Lookbook Carousel (Splide.js)
- ✅ Free Shipping Nudge
- ✅ Z-index architecture
- ✅ All Atomic Design primitives: Button, Input, Heading, Text, Icon, Image, Badge, Link, Logo
- ✅ `@astrojs/cloudflare` adapter (Netlify adapter removed)
