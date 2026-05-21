# AGENTS.md — AI Agent Context File (Zee Engine Edition)

> **This is the single source of truth for all AI agents, coding assistants, and automated tools working on this codebase.**
> Read this file completely before touching any code. Every decision in here was made deliberately.
> Do NOT deviate from anything in this document without explicit confirmation from the repository owner.

---

## 1. Platform Identity — The Zee Engine

This is **not a jewelry website.** It is a **Multi-Tenant White-Label E-Commerce Engine** — code-named **"Zee Engine"** — an Astro 5-based platform designed to deploy multiple distinct brand websites from a single codebase.

**Architecture: "Ghost Operator"**

The engine is a lightweight logic layer ("The Brain") that wakes up and *knows who it is* based on environment injection and secure filesystem bridging. It has no hardcoded brand data. It points to external media via Windows Junctions ("The Body") and the Vite Secret Bridge (`server.fs.allow`).

- **One Git repo** → Multiple Cloudflare Pages deployments
- **Each deployment** differs only by its `.env` file (`PUBLIC_BRAND_ID`, `PUBLIC_AFFILIATE`, etc.)
- **Brand-specific content**: `src/content/{brandId}/`
- **Brand-specific theme**: `src/styles/{brandId}/theme.css`
- **Shared component library**: same primitives, UI, features, and pages — different tokens and content

**Zelia Vance** (a costume jewelry brand by I Am Zee, Mohali, Punjab, India) is **Brand #1** — the live proof of concept. Every architectural decision is made with the multi-brand future in mind.

---

## 2. Brand Identity — Zelia Vance (Brand #1)

| Field                  | Value                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Legal Entity**       | I Am Zee (Partnership Firm)                                                                                                     |
| **Trade Name**         | Zelia Vance                                                                                                                     |
| **Brand ID**           | `zelia-vance` (exact value used in `.env` as `PUBLIC_BRAND_ID`)                                                                 |
| **Business Address**   | Sector 77, S.A.S. Nagar (Mohali), Punjab, India                                                                                 |
| **Jurisdiction**       | Mohali, Punjab, India                                                                                                           |
| **Product Category**   | Costume Jewellery (HSN 7117)                                                                                                    |
| **Price Range**        | ₹399 – ₹5,000 max                                                                                                               |
| **Target Demographic** | Women, 20–40, working class, India                                                                                              |
| **Market**             | India only. No international shipping.                                                                                          |
| **Brand Positioning**  | "Old Money look at a fraction of the price."                                                                                    |
| **Brand Persona**      | "Zee" — the brand voice. Never the founder. Never founder-led.                                                                  |
| **Brand Voice**        | Warm, direct, Gen-Z adjacent. NOT formal Vogue-style. Think: the stylish older sister who found the secret. Inclusive high-end. |

### Product Tiers

- **Signature Line**: PVD Coated — marketed as "Life-Proof" (tarnish-free, water-resistant, sweat-proof).
- **Essentials Line**: Current stock — marketed as "Trend-Watch."

### Brand Voice Examples

- ✅ _"Zelia Vance exists because the 'Old Money' look shouldn't require an 'Old Money' bank account. Period."_
- ✅ Warm, conversational, speaks to coffee runs, 9-to-5s, self-gifted milestones.
- ❌ NOT: Stiff luxury copy, founder-led storytelling, aggressive sales language.

---

## 3. The Multi-Brand Engine Architecture

### Three Operating Modes (ADR-002)

The engine supports exactly **two** operating modes, gated by a single `PUBLIC_AFFILIATE` boolean:

| Mode | `PUBLIC_AFFILIATE` | Commerce Stack | Description |
| --- | --- | --- | --- |
| **D2C Full** | `false` | Snipcart + Razorpay + Shiprocket | Full e-commerce. Zelia Vance is Brand #1. |
| **Affiliate** | `true` | Cuelinks / Admitad affiliate links | No cart. Product catalog with "Shop Now" buttons pointing to affiliate links. |

> **"Editorial" is NOT a separate mode.** It is simply a D2C or Affiliate site with no products in the catalog. The boolean is type-safe and impossible to misspell, unlike string enums.

### Content Systems — Two Types, Never Mix

> **Filesystem Reality**: ALL text content (blog AND legal) uses the `.mdx` extension. There is no `.md` in this engine. The distinction is enforced by content policy, not file type.

- **MDX (blog)** → Blog posts. Lives in `src/content/{brandId}/blog/`. **May** import `<AdSlot>` and other Astro/React components for monetization.
- **MDX (legal)** → Legal pages (T&C, Privacy, Returns, Shipping). Lives in `src/content/{brandId}/legal/`. **MUST remain purely informational.** Never import `<AdSlot>`, `<AffiliateProductCTA>`, or any commercial component. This is a legal and trust issue.
- **YAML** → Immersive pages (About, Care Guide), site settings, navigation, taxonomy, marketing config. Lives in `src/content/{brandId}/settings/`.

### The Ghost Operator — How Local Dev Works

On a developer's machine, the "Ghost" setup has three components:

1. **Environment Injection (`.env`)**: `PUBLIC_BRAND_ID`, `LOCAL_MEDIA_PATH` are set in `.env`. No private paths are ever committed to Git.
2. **Windows Directory Junction** (`public/images/`): A zero-copy link created via `mklink /J "public/images" "PATH_TO_MEDIA"`. Instantly bridges the Astro dev server to the external Master Media Repo without duplicating gigabytes of data. `public/images/` is in `.gitignore` — it is never committed.
3. **Vite Secret Bridge** (`server.fs.allow`): Grants the Vite dev server a "security pass" to read files from outside the project root. Reads the `LOCAL_MEDIA_PATH` env var dynamically at startup.

```javascript
// astro.config.mjs — Vite Bridge (verified live)
fs: {
  allow: [
    searchForWorkspaceRoot(process.cwd()),
    ...(env.LOCAL_MEDIA_PATH ? [path.resolve(__dirname, env.LOCAL_MEDIA_PATH)] : [])
  ]
}
```

> **RULE: NEVER delete `server.fs.allow` from `astro.config.mjs`.** Removing it will cause all local media to 404 as Vite will block access to the junctioned folder.
> **SYNTAX: The path in `fs.allow` MUST use forward slashes (`/`) and contain NO surrounding quotes.**

---

## 4. Tech Stack

| Layer                     | Technology                        | Status | Notes                                                                              |
| ------------------------- | --------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| **Framework**             | Astro 5 (`^5.16.11`)              | ✅ Live | Island architecture. Static-first, opt-in SSR via `prerender = false`.             |
| **Styling**               | Tailwind CSS v4 (`^4.1.18`)       | ✅ Live | **No vanilla CSS. Ever.** Config via `@tailwindcss/vite` plugin in `global.css`.  |
| **Interactivity**         | Alpine.js 3 (`^3.15.4`)           | ✅ Live | UI state management. + `@alpinejs/collapse`.                                       |
| **Animations**            | GSAP + Lenis                      | ⏳ Plan | Planned for immersive pages (About, Care Guide). Not yet implemented.              |
| **Icons**                 | `phosphor-icons-astro`            | ✅ Live | `Ph` + PascalCase prefix. Always use via `Icon.astro` primitive — never directly. |
| **Carousel**              | Splide.js (`@splidejs/splide`)    | ✅ Live | Never reinvent carousels — use the `carousel.ts` behavior.                         |
| **Search**                | Fuse.js v7                        | ✅ Live | Client-side fuzzy search. Data MUST be plain objects (not raw Astro entries).      |
| **CMS**                   | Keystatic (`@keystatic/core`)     | ✅ Live | Git-based, no DB. Junction-aware via `patches/` (see §9). Local dev only.         |
| **Cart**                  | Snipcart v3                       | ✅ Live | Custom templates in `public/snipcart-templates.html`. D2C mode only.              |
| **Payments**              | Razorpay                          | ✅ Live | Custom bridge at `/checkout/razorpay`. D2C mode only.                             |
| **Shipping**              | Shiprocket                        | ✅ Live | Webhook sync at `/api/checkout/order-completed.ts`. D2C mode only.                |
| **Hosting**               | Cloudflare Pages                  | ✅ Live | `@astrojs/cloudflare` adapter. Netlify is fully removed.                          |
| **Storage**               | Cloudflare R2                     | ✅ Live | Product images. Bucket: `zee-media-production`. See §10 (Image Engine).            |
| **Email (Transactional)** | Snipcart native + Notifications   | ✅ Live | Invoice + delivery feedback email.                                                 |
| **Email (Marketing)**     | MailerLite                        | ✅ Live | Free tier. Group ID: `183469983098995840`.                                         |
| **Feedback Forms**        | Tally.so                          | ✅ Live | Free tier. Linked from delivery email.                                             |
| **React (CMS only)**      | React 19 (`^19.2.4`)              | ✅ Live | Used exclusively to power the Keystatic CMS UI. Not used in storefront components. |

### Current `package.json` Dependencies (Exact Versions)

```json
"dependencies": {
  "@alpinejs/collapse": "^3.15.6",
  "@astrojs/alpinejs": "^0.4.9",
  "@astrojs/mdx": "^4.3.14",
  "@keystatic/astro": "^5.0.6",
  "@keystatic/core": "^0.5.50",
  "@splidejs/splide": "^4.1.4",
  "@tailwindcss/typography": "^0.5.19",
  "@tailwindcss/vite": "^4.1.18",
  "@types/alpinejs": "^3.13.11",
  "alpinejs": "^3.15.4",
  "astro": "^5.16.11",
  "fuse.js": "^7.1.0",
  "phosphor-icons-astro": "^2.1.1-17042025",
  "prettier": "^3.8.0",
  "prettier-plugin-astro": "^0.14.1",
  "prettier-plugin-tailwindcss": "^0.7.2",
  "razorpay": "^2.9.6",
  "tailwindcss": "^4.1.18",
  "yaml": "^2.8.3"
},
"devDependencies": {
  "@astrojs/check": "^0.9.6",
  "@astrojs/cloudflare": "^12.6.13",
  "@astrojs/react": "^5.0.3",
  "@cloudflare/workers-types": "^4.20260403.1",
  "@rollup/plugin-yaml": "^4.1.2",
  "@types/node": "^25.5.2",
  "@types/react": "^19.2.14",
  "@types/react-dom": "^19.2.3",
  "patch-package": "^8.0.1",
  "postinstall-postinstall": "^2.1.0",
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "typescript": "^5.9.3",
  "wrangler": "^4.80.0"
}
```

---

## 5. Atomic Design System — THE RULES

This codebase strictly follows Atomic Design Methodology. Every component lives at exactly one of three levels. **No exceptions. No layer skipping.**

### The Three Layers

**Primitives** (`src/components/primitives/`)

- Atoms. Smallest building blocks.
- **Current files**: `AdSlot.astro`, `Badge.astro`, `Button.astro`, `FilterChip.astro`, `Heading.astro`, `Icon.astro`, `Image.astro`, `Input.astro`, `Link.astro`, `Logo.astro`, `Modal.astro`, `Section.astro`, `Text.astro`
- Rules:
  - No API calls. No event listeners. No imports from `scripts/behaviors/`.
  - Only props and styles.
  - May import from `scripts/utils/` for pure formatting functions.

**UI Components** (`src/components/ui/`)

- Molecules. Combinations of Primitives.
- **Current files** (39 components): `Accordion.astro`, `AccordionItem.astro`, `AddToCartButton.astro`, `Alert.astro`, `AnnouncementBar.astro`, `BlogCard.astro`, `BlogCategoryFilter.astro`, `Breadcrumbs.astro`, `Carousel.astro`, `CartToast.astro`, `CollectionCard.astro`, `ComingSoon.astro`, `CopyButton.astro`, `DrawerProductCard.astro`, `EditorialHero.astro`, `EmptyState.astro`, `FilterSortBar.astro`, `FormField.astro`, `GlassProductCard.astro`, `Lightbox.astro`, `MenuToggle.astro`, `MetadataStrip.astro`, `NavDropdown.astro`, `NewsletterForm.astro`, `NewsletterPageCard.astro`, `OptionSelector.astro`, `PageHeader.astro`, `Pagination.astro`, `PopupCoupon.astro`, `PopupNewsletter.astro`, `PriceTag.astro`, `QuantitySelector.astro`, `RatingStars.astro`, `SearchInput.astro`, `SectionHeader.astro`, `SideDrawer.astro`, `SkipLinks.astro`, `SocialLinks.astro`, `TrustSection.astro`
- Rules:
  - No API calls. No imports from `scripts/behaviors/`.
  - May import from `scripts/utils/` for formatting.
  - Receive data via props. Emit events via callbacks.
  - Logic-light. Layout and style responsibility only.

**Feature Components** (`src/components/features/`)

- Organisms. The controllers.
- **Current files** (25 components): `AffiliateEngine.astro`, `AffiliateProductCTA.astro`, `AffiliateQuickView.astro`, `BrandEngine.astro`, `BuySetButton.astro`, `CategoryCarousel.astro`, `CompleteTheLook.astro`, `Footer.astro`, `FreeShippingNudge.astro`, `GalleryCarousel.astro`, `LookbookCarousel.astro`, `MobileMenu.astro`, `Navbar.astro`, `NewsletterConfirmForm.astro`, `NewsletterWidget.astro`, `ProductCarousel.astro`, `ProductGallery.astro`, `ProductGrid.astro`, `RelatedLookbooksCarousel.astro`, `RelatedProducts.astro`, `SmartBlogGrid.astro`, `SmartProductGrid.astro`, `TableOfContents.astro`, `TrackingScripts.astro`, `WishlistButton.astro`
- Rules:
  - May import behaviors via `<script>` tag.
  - Handle state, API calls, complex event listeners.
  - Pass data down into UI components and Primitives.
  - Each feature's behavior lives in a dedicated `scripts/behaviors/` file.

### The Primitive Usage Contract

> Raw HTML tags for layout and text are **forbidden** in Feature and Page files. Always use the corresponding primitives.

| Raw HTML | Use This Primitive Instead |
| --- | --- |
| `<section>` | `<Section>` |
| `<h1>` – `<h6>` | `<Heading level={1}>` etc. |
| `<p>` | `<Text>` |
| `<a>` | `<Link>` |

**Breadcrumb Rule**: Parent crumbs are always muted/medium (`color="muted" weight="medium"`). The current page crumb is always bold.

### The Script Folders

**`scripts/utils/`** — Pure functions only. No side effects. No DOM access.

| File | Purpose |
| --- | --- |
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

**`scripts/behaviors/`** — Business logic only. May access the DOM. **Import into Features only — never Primitives or UI.**

| File | Purpose |
| --- | --- |
| `affiliate-quick-view.ts` | Affiliate product quick-view drawer logic |
| `alpine-entrypoint.ts` | Alpine.js store registration entry point |
| `blog-discovery.ts` | Blog tag/category discovery logic |
| `blog-filter.ts` | Blog category filter behavior |
| `carousel.ts` | Splide.js initialization |
| `newsletter.ts` | Newsletter confirm flow |
| `options-sync.ts` | Snipcart variant ↔ custom field sync (sensitive) |
| `popup.ts` | Popup modal logic |
| `quantity.ts` | Cart quantity selector |
| `quick-shop.ts` | Quick shop behavior |
| `region.ts` | Geo-detection + region/currency store |
| `side-drawer.ts` | SideDrawer multi-mode (upsell, quick-shop, master-set) |
| `sorting.ts` | Product sort Alpine store |
| `toc.ts` | Blog Table of Contents — active section tracking |
| `toggle.ts` | Generic toggle behavior |
| `wishlist.ts` | Wishlist Alpine store + localStorage |

### Styling Rules

- **Tailwind CSS v4 exclusively.** No `<style>` blocks in Feature components or page files.
- Vanilla CSS is only allowed in `src/styles/global.css`, `src/styles/base.css`, and `src/styles/snipcart.css` for design token definitions and global resets.
- Brand-specific tokens live in `src/styles/{brandId}/theme.css`. Aliased as `@brand-theme` in Vite config.
- Colors are always referenced via CSS custom properties: `var(--color-primary)`, `var(--color-accent-brass)`, etc. **Never raw hex values in components.**
- Tailwind v4 uses `bg-(--color-primary)` syntax. **NOT** `bg-[var(--color-primary)]`. This is intentional and correct.
- **Flatten before Alpine.** Never pass raw Astro `CollectionEntry` objects to client JS — always serialize to plain objects first.

---

## 6. Directory Structure (as of 2026-05-22)

```
d:\Workspace\Zaviona_Ecommerce Astro\
├── patches/
│   └── @keystatic+core+0.5.50.patch   ← Junction-awareness patch (auto-applied on npm install)
├── public/
│   ├── images/                         ← Windows Junction → external Master Media Repo (gitignored)
│   └── snipcart-templates.html         ← Custom Snipcart checkout markup (IDs ov-1 through ov-14)
├── ENGINE GUIDE - DO NOT EDIT/         ← Platform architecture docs (for humans + agents)
├── src/
│   ├── components/
│   │   ├── primitives/    ← Atoms (13 components — see §5)
│   │   ├── ui/            ← Molecules (39 components — see §5)
│   │   └── features/      ← Organisms (25 components — see §5)
│   ├── content/           ← Astro Content Collections — SILOED by brand
│   │   ├── config.ts      ← Collection schema definitions
│   │   ├── zelia-vance/   ← Brand #1 content (active)
│   │   │   ├── authors/
│   │   │   ├── blog/                   ← .mdx blog posts
│   │   │   ├── brand/                  ← Brand page content (YAML)
│   │   │   ├── collections_grid/
│   │   │   ├── component_hub/
│   │   │   ├── legal/                  ← .mdx legal pages (T&C, Returns, Privacy, Shipping) — no commercial components
│   │   │   ├── lookbooks/
│   │   │   ├── newsletter/
│   │   │   ├── page_headers/
│   │   │   ├── pages_content/
│   │   │   ├── products/               ← Product YAML files
│   │   │   ├── section_headers/
│   │   │   ├── settings/               ← brand.yaml, navigation.yaml, taxonomy.yaml,
│   │   │   │                             blog-taxonomy.yaml, marketing.yaml,
│   │   │   │                             shipping.yaml, footer.yaml, tracking.yaml
│   │   │   └── storefront/
│   │   ├── sample-brand/  ← Engine fallback template for D2C brands
│   │   ├── sample-affiliate/ ← Engine fallback template for affiliate brands
│   │   └── affiliate_zee/ ← Example affiliate brand
│   ├── layouts/
│   │   ├── BaseLayout.astro       ← HTML shell (Navbar, Footer, popups, favicon)
│   │   ├── EngineLayout.astro     ← Smart middle layer — injects BrandEngine or AffiliateEngine
│   │   └── CheckoutLayout.astro   ← Minimal layout for checkout flow
│   ├── pages/
│   │   ├── api/
│   │   │   ├── geo.ts             ← Returns user's region (reads Cloudflare CF headers server-side)
│   │   │   ├── actions/           ← (newsletter-subscribe.ts, etc.)
│   │   │   ├── checkout/          ← order-completed.ts (Snipcart → MailerLite + Shiprocket)
│   │   │   ├── shipping/          ← Shipping rate API
│   │   │   └── webhooks/          ← logistics-sync.ts (Shiprocket → Snipcart status)
│   │   ├── blog/
│   │   ├── brand/
│   │   ├── checkout/              ← razorpay.astro
│   │   ├── collections/
│   │   ├── keystatic/             ← Keystatic CMS UI (local dev only)
│   │   ├── legal/
│   │   ├── lookbooks/
│   │   ├── newsletter/            ← confirm.astro, success.astro
│   │   ├── products/
│   │   └── shop/
│   ├── scripts/
│   │   ├── snipcart-init.ts       ← Snipcart validation hooks (Gmail, phone, upsell, COD, taxes)
│   │   ├── snipcart-events.ts     ← Snipcart event handlers (coupon hydration, session state)
│   │   ├── utils/                 ← Pure functions (see §5 table)
│   │   └── behaviors/             ← Business logic (see §5 table)
│   └── styles/
│       ├── global.css             ← Shared design tokens (engine-level)
│       ├── base.css               ← Base resets
│       ├── snipcart.css           ← Snipcart brand overrides (5-section architecture)
│       ├── zelia-vance/
│       │   └── theme.css          ← Brand #1 design tokens (aliased as @brand-theme)
│       ├── sample-brand/
│       │   └── theme.css          ← Engine fallback theme
│       └── sample-affiliate/
│           └── theme.css          ← Affiliate fallback theme
```

### The 3-Tier Layout Hierarchy

```
BaseLayout.astro      ← HTML shell. Navbar, Footer, popups, metadata, favicon logic.
    └── EngineLayout.astro  ← Mode selector. Injects BrandEngine OR AffiliateEngine + TrackingScripts.
            └── [Page].astro  ← Individual page content. ALWAYS imports EngineLayout, NEVER BaseLayout directly.
```

> **RULE: Pages MUST import `EngineLayout.astro`, not `BaseLayout.astro` directly.** `BaseLayout` is a raw shell with no commerce integrations. Bypassing `EngineLayout` means the brand gets no Snipcart, no tracking scripts, and no mode selection.

---

## 7. Key Files — Read Before Editing

| File | What It Does |
| --- | --- |
| `src/styles/global.css` | Shared design tokens (engine-level). CSS custom properties. |
| `src/styles/{brandId}/theme.css` | Brand-specific design tokens. Source of truth for all brand colors. |
| `src/styles/snipcart.css` | Snipcart brand overrides. 5-section architecture. **Never break section boundaries.** |
| `src/layouts/BaseLayout.astro` | HTML shell. Contains favicon fallback logic and email-decode re-injection. |
| `src/layouts/EngineLayout.astro` | Mode router. Injects BrandEngine or AffiliateEngine + TrackingScripts. |
| `src/content/{brandId}/settings/brand.yaml` | Brand name, tagline, description, email, phone, social links. |
| `src/content/{brandId}/settings/marketing.yaml` | Popup modal config (discount/newsletter), announcement bar. |
| `src/content/{brandId}/settings/shipping.yaml` | Free shipping threshold, shipping slabs (dimensions/weight). |
| `src/content/config.ts` | Astro Content Collection schema definitions. |
| `public/snipcart-templates.html` | Custom Snipcart checkout markup. IDs ov-1 through ov-14. **Handle with extreme care.** |
| `src/pages/api/checkout/order-completed.ts` | Snipcart → MailerLite + Shiprocket sync webhook. Fires on every order. |
| `src/pages/api/webhooks/logistics-sync.ts` | Shiprocket → Snipcart status update webhook. Triggers delivery email + Tally feedback link. |
| `src/pages/api/geo.ts` | Returns geo region by reading Cloudflare edge headers (`request.cf.country`). |
| `src/pages/checkout/razorpay.astro` | Custom Razorpay payment bridge. **Do not modify without understanding the full payment flow.** |
| `src/scripts/behaviors/options-sync.ts` | Syncs product variant selections with Snipcart custom fields. **Sensitive.** |
| `src/scripts/snipcart-init.ts` | Snipcart init + validation hooks. Gmail validation, phone, upsell bridge, COD, taxes. |
| `src/components/ui/SideDrawer.astro` | Multi-mode drawer (upsell, quick-shop, master-set). Alpine.js powered. |
| `astro.config.mjs` | Engine boot config. Vite bridge, brand resolution, fail-fast guard, Keystatic, Cloudflare adapter. |
| `keystatic.config.ts` | Keystatic CMS schema definition (60KB+). Junction-aware. |
| `patches/@keystatic+core+0.5.50.patch` | Junction patch for Keystatic. Auto-applied on `npm install`. See §9. |

---

## 8. The Newsletter Engine (Built — Do Not Rebuild)

The newsletter subscription flow is fully implemented. Do NOT rebuild or replace it.

**Architecture:**

```
scripts/utils/validation.ts                  ← isGmailAddress(), isValidEmail() pure fns
scripts/behaviors/newsletter.ts              ← initNewsletterConfirm() business logic
components/primitives/Input.astro            ← has readonly prop
components/ui/NewsletterPageCard.astro       ← card shell UI (eyebrow, heading, slot)
components/ui/NewsletterForm.astro           ← simple inline form (footer use)
components/features/NewsletterConfirmForm.astro  ← full confirm form + behavior
components/features/NewsletterWidget.astro   ← variants: footer, sidebar, modal
pages/newsletter/confirm.astro               ← SSR, reads ?email= from URL, ultra-thin
pages/newsletter/success.astro               ← static thank-you page
pages/api/actions/newsletter-subscribe.ts   ← POST endpoint → MailerLite API
```

**Key behaviors:**

- Checkout opt-in checkbox (`subscribeToNewsletter`) → Direct MailerLite API call in `order-completed.ts`.
- Delivery email "stay in the loop" link → `/newsletter/confirm?email={order.email}` → User clicks confirm → API called.
- Gmail-only validation applies when user types their email. Pre-filled email (from delivery link) uses basic format validation only (order email may not be a Gmail).
- MailerLite Group ID: `183469983098995840`.

**`NewsletterWidget.astro`** has variants: `footer`, `sidebar`, `modal`. The `section` variant is deprecated. Copy comes from YAML content files. Widget is standard in the footer.

---

## 9. Keystatic CMS — Junction Awareness (The Patch)

**Status: ✅ Live** — Keystatic is active and operating via Git-based local mode.

### The Problem

Keystatic's local mode uses `fs.readdir(path, { withFileTypes: true })` internally. On Windows, a Directory Junction is evaluated as a `SymbolicLink`. Keystatic's default logic ignores symlinks, causing the CMS to fail to see any media files located within the junctioned `public/images/` directory.

### The Solution

A patch was applied to `@keystatic/core@0.5.50` using `patch-package`. The patch adds a `nodeFs.statSync(fullPath)` fallback when a `dirent` is identified as a symbolic link, forcing Keystatic to follow the junction.

The patch is stored at `patches/@keystatic+core+0.5.50.patch` and auto-applied via `postinstall: "patch-package"` in `package.json`. Every `npm install` re-applies it automatically.

> **If you update `@keystatic/core` to a new version**, the existing patch may no longer apply. You must re-generate the patch for the new version. Also, delete the Vite cache (`node_modules/.vite`) after any patch update.

### Astro Config Requirement

The `LOCAL_MEDIA_PATH` env var must be set to the external media path for Vite to serve those images during development. See `astro.config.mjs` `server.fs.allow`.

---

## 10. Image Engine — R2 + Cloudflare Worker (LIVE)

A "Source → Processor → Consumer" pipeline is fully active.

### The Pipeline

1. **Source**: High-res unoptimized product photos live in the external Master Media Repo (`zee-media-production`).
   - Standard folder structure: `{brandId}/{category}/{slug}/file.webp`
   - Locally, this repo is bridged into the project via a Windows Directory Junction at `public/images/`.
2. **Storage**: Synced to Cloudflare R2 bucket (`zee-media-production`) via Rclone. Master files accessed securely via `vault-x92k-zee.zeliavance.com`.
3. **Processor (Worker)**: A Cloudflare Worker listens on `assets.zeliavance.com`. Applies `sharpen: 1.0`, `format: 'auto'`, and width-based transformations.
4. **Consumer**: `Image.astro` primitive generates `srcset` using `PUBLIC_IMAGE_GATEWAY_URL`.

### `srcset` Width Snapping (4 Widths — Verified)

The worker and `Image.astro` use **4 sizes**: `200, 400, 800, 1200`.

> The original spec said 3 sizes (400, 800, 1200). **200w was added explicitly** to support high-performance PDP gallery thumbnails without wasting mobile bandwidth. Do not remove 200w.

### Dev vs Production Behavior

| Environment | Image Source |
| --- | --- |
| **Production** | `PUBLIC_IMAGE_GATEWAY_URL/{brandId}/{category}/file.webp` — R2 Worker |
| **Dev (with junction)** | `/images/{category}/file.webp` — served locally via Vite bridge |
| **Dev (no junction, no gateway)** | Base64 fallback favicon; other images may 404 |

### Multi-Tenant Path Mapping

`Image.astro` uses `PUBLIC_BRAND_ID` to map local-style paths (e.g., `/images/products/`) to R2-style paths (e.g., `zelia-vance/products/`), ensuring brand isolation at the asset level.

### Append-Only Media Strategy (Rclone Safety)

Media files follow a two-type model to prevent accidental deletion on `rclone sync`:

- **Slots** — Overwritable singletons: `hero.jpg`, `banner.jpg`. Expected to be replaced.
- **Identity** — Immutable gallery files: `diamond-tennis-necklace-g1.jpg`, `g2.jpg`. Tied to product listings. Deleting these breaks PDPs.

> **NEVER run `rclone sync` with `--delete` without auditing the diff first.** Use `--dry-run` first. The slug-based gallery naming guarantees `rclone sync` can operate with 100% bandwidth efficiency — it only transfers changed files.

---

## 11. Geo-Detection & Region System

**Status: ✅ Live** — Client-side, via `/api/geo` endpoint.

The region system allows affiliate sites to display localized affiliate links and pricing for different markets.

### Architecture

1. **Server-side**: `/api/geo.ts` reads the `request.cf.country` header (injected by Cloudflare edge) and returns the region identifier.
2. **Client-side** (`scripts/behaviors/region.ts`): An Alpine.js store (`regionStore`) fetches `/api/geo` on page load. Result is cached in `localStorage` with a **24-hour TTL** to prevent repeated API calls.
3. **Zero-CLS Pre-hydration**: A synchronous `<script>` in `BaseLayout.astro` (affiliate-only) reads the cached `localStorage` region before Alpine initializes, preventing layout shift.

### Key Behaviors

- Region config (locales, currencies, region IDs) is stored in `src/content/{brandId}/settings/affiliate_settings.yaml`.
- If the detected region is not in the brand's configured list, falls back to the configured `defaultRegionId` (first in the list).
- `regionStore.getActiveLink(links[])` is used on affiliate product CTAs to pick the correct affiliate URL for the user's region.

> **Note**: Multi-currency Snipcart price locking (JSON price maps + Cloudflare Geo "Double-Lock") is **PLANNED, NOT YET IMPLEMENTED**. Reference: `.plans/todo/ROADMAP_MULTI_CURRENCY.md`. Do not document it as live.

---

## 12. Email Infrastructure

### Transactional Emails (Snipcart)

1. **Order Invoice Email** — Sent immediately on purchase via Snipcart's native invoice template. Triggered at `/api/checkout/order-completed.ts`.
2. **Delivery + Feedback Email** — Custom HTML template. Sent when Shiprocket marks order as "Delivered." Includes Tally.so feedback link. Triggered at `/api/webhooks/logistics-sync.ts`.

### Delivery Updates (Shiprocket)

Shiprocket handles all in-transit notifications: pickup → dispatch → out for delivery → delivered. Done via Shiprocket's own email/SMS/WhatsApp at ₹5/order. **Do NOT build custom delivery notification emails** — Shiprocket handles this.

### Marketing Emails (MailerLite)

Promotional newsletters. Free tier. Sent from `withlove@zeliavance.com`. Reply-to: `zee@zeliavance.com`.

### View Transitions — Email Obfuscation Fix

Cloudflare injects `email-decode.min.js` to obfuscate email addresses. Because Astro's View Transitions don't trigger a full page reload, this script runs only once on the initial load and fails on soft navigations.

**Fix** (implemented in `BaseLayout.astro`): Manually re-inject the script on every `astro:page-load` event:

```javascript
document.addEventListener('astro:page-load', () => {
  const cloudflareScript = document.querySelector('script[src*="email-decode.min.js"]');
  if (cloudflareScript) {
    const newScript = document.createElement('script');
    newScript.src = cloudflareScript.src;
    newScript.dataset.astroRerun = "";
    cloudflareScript.replaceWith(newScript);
  }
});
```

> **Never remove this fix.** Emails in the footer and contact page will appear as garbled text on all pages after the first without it.

### Email Aliases (Cloudflare Routing → zeliavance.official@gmail.com)

| Alias                      | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `hello@zeliavance.com`     | General inquiries                          |
| `support@zeliavance.com`   | Customer care, order issues                |
| `zee@zeliavance.com`       | MailerLite reply-to (brand persona "Zee")  |
| `legal@zeliavance.com`     | Privacy/Terms inquiries                    |
| `orders@zeliavance.com`    | Snipcart transactional, reply-to: support@ |
| `withlove@zeliavance.com`  | MailerLite outbound sender                 |
| `logistics@zeliavance.com` | Shiprocket API user (backend only) → routes to `iamzee.company+zelia.logistics@gmail.com` |
| `test1@zeliavance.com`     | Testing purposes                           |
| `test2@zeliavance.com`     | Testing purposes                           |

All aliases (except `logistics@`) route to `zeliavance.official@gmail.com`. Gmail SMTP "send as" via App Password method. Gmail Labels separate each inbox category.

---

## 13. Operational Decisions (Locked — Do Not Change Without Explicit Approval)

### Fulfillment

- Snipcart = Digital receipt / order confirmation (sent immediately on purchase)
- Shiprocket = Physical invoice (printed, in box) + all tracking comms
- Refunds: Prepaid → Razorpay refund (automated). COD → Manual bank transfer.

### Shiprocket Order Sync

- Snipcart webhook (`order.completed`) fires `order-completed.ts` → creates Adhoc order in Shiprocket.
- Order ID format: `{invoiceNumber}-EXPRESS` or `{invoiceNumber}-STD`.
- SKU deduplication: variant values are appended to SKU to prevent Shiprocket's "SKU cannot be repeated" 400 error.
- Variant names are packed into the item `name` field for warehouse clarity.
- Token caching: Shiprocket auth token is cached for 9 days (actual expiry: 10 days) to avoid repeated logins under load.
- `SHIPROCKET_SYNC_ENABLED=true` must be set in production. Set to `false` for test mode (logs payload, skips API call).

### Returns Policy

- 48-hour window from delivery.
- Mandatory uncut unboxing video for ALL damage/defect claims.
- Item must be unworn, original packaging, all tags intact.
- Change of mind = NOT accepted. No exceptions. Costume jewellery is a personal-use/hygiene item.
- Refund initiated ONLY after item physically returned AND passes QC.

### Free Shipping

- Threshold: configured in `src/content/{brandId}/settings/shipping.yaml` (currently ₹3,000 for Zelia Vance).

### Shiprocket Webhook Auth

- Token: `ZeliaVance_Secure_Deploy_2026` (stored in `SHIPROCKET_WEBHOOK_TOKEN` env var).
- Webhook always returns `200 OK` to Shiprocket even on internal errors — prevents Shiprocket from retrying and sending duplicate emails.

### Product Discovery Algorithms

- **Related Products** (`recommendations.ts`): Uses **Jaccard Similarity** on product tags. Tags capture aesthetic intent (e.g., "minimalist", "gold", "vintage") better than a blunt category filter. Groups products by score, shuffles within each group (Fisher-Yates).
- **Cross-Category Discovery**: Filters OUT the current category, returns uniformly shuffled others. Encourages exploration.
- **Catalog Sorting** (`product-sort.ts` + `sorting.ts`): User-facing sort (price asc/desc, newest) via Alpine store.

---

## 14. Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PUBLIC_BRAND_ID` | **Always** | Brand folder name. Engine exits with `process.exit(1)` if invalid. |
| `PUBLIC_SITE_URL` | **Always** | Production URL. Used by Snipcart for price validation. |
| `PUBLIC_AFFILIATE` | **Always** | `true` = Affiliate mode. `false` = D2C mode. |
| `PUBLIC_SNIPCART_API_KEY` | D2C only | Snipcart public key (client-side). |
| `PUBLIC_RAZORPAY_KEY_ID` | D2C only | Razorpay public key (client-side). |
| `PUBLIC_IMAGE_GATEWAY_URL` | Always | R2 Worker base URL (e.g., `https://assets.zeliavance.com`). |
| `RAZORPAY_KEY_ID` | D2C only | Razorpay key ID (server-side). |
| `RAZORPAY_KEY_SECRET` | D2C only | Razorpay secret (server-side). |
| `SNIPCART_SECRET_API_KEY` | D2C only | Snipcart private key (server-side API calls). |
| `SHIPROCKET_EMAIL` | D2C only | Shiprocket API login email (`logistics@zeliavance.com`). |
| `SHIPROCKET_PASSWORD` | D2C only | Shiprocket API login password. Raw string, no escaping. |
| `SHIPROCKET_WEBHOOK_TOKEN` | D2C only | Webhook auth token (`ZeliaVance_Secure_Deploy_2026`). |
| `SHIPROCKET_SYNC_ENABLED` | D2C only | Set to `true` in production. `false` = test/dry-run mode. |
| `SHIPROCKET_PICKUP_LOCATION` | D2C only | Pickup location label in Shiprocket dashboard. Defaults to `"Home"`. |
| `MAILERLITE_API_KEY` | D2C only | MailerLite API v3 key. |
| `MAILERLITE_GROUP_ID` | D2C only | MailerLite Newsletter group ID (`183469983098995840`). |
| `CUELINKS_ID` | Affiliate only | Cuelinks tracking ID. |
| `META_PIXEL_ID` | Optional | Meta Pixel tracking ID (injected by `TrackingScripts.astro`). |
| `GOOGLE_ANALYTICS_ID` | Optional | Google Analytics ID (injected by `TrackingScripts.astro`). |
| `LOCAL_MEDIA_PATH` | Dev only | Absolute path to Master Media Repo. No quotes. Forward slashes. |

---

## 15. Engine Boot Rules & Hard Rules

These rules are non-negotiable architectural invariants.

### Engine Boot Sequence (`astro.config.mjs`)

1. Load `.env` via `loadEnv()`.
2. Resolve `PUBLIC_BRAND_ID` → check `src/content/{brandId}/` exists.
3. If brand directory missing: warn and fall back to `sample-brand` / `sample-affiliate`.
4. **Fail-fast**: If even the fallback directory doesn't exist → `process.exit(1)`. This prevents accidental cross-tenant data leakage.
5. Resolve theme path `src/styles/{brandId}/theme.css` → fall back to sample theme if missing.
6. Register Vite `fs.allow` with workspace root + `LOCAL_MEDIA_PATH` (if set).

### The 6 Non-Negotiable Rules

1. **Tailwind v4 only.** No `<style>` blocks in Feature or Page files. No `bg-[var(--token)]` — use `bg-(--token)`.
2. **Zero-Copy Assets.** Never commit images to this repo. Media lives in the Master Repo and is junctioned to `public/images/`.
3. **No raw hex colors.** Always use CSS design tokens: `var(--color-primary)` or Tailwind `bg-(--color-primary)`.
4. **Atomic Design is law.** Primitives → UI → Features → Pages. No layer skipping. No behaviors imported in UI/Primitives.
5. **Flatten before Alpine.** Never pass raw Astro collection entries to client JS — always convert to plain objects first.
6. **CMS drives all content.** No hardcoded labels, headings, or category names in component files.

### Additional Hard Rules

- **Never delete `server.fs.allow`** from `astro.config.mjs` — breaks local media dev.
- **Never bypass `EngineLayout`** — pages must not import `BaseLayout` directly.
- **Never commit `.env`** — only `.env.example` goes to Git.
- **Never use `@astrojs/netlify`** — project has migrated fully to `@astrojs/cloudflare`.
- **`snipcart-templates.html`** — IDs ov-1 through ov-14 are hardcoded references. Changing an ID breaks Snipcart's template system.
- **`options-sync.ts`** — Syncs variant selections to Snipcart. Extremely sensitive. Do not modify without full context.

### The "Honest Person" Security Model

- The source code is deliberately "scary gibberish" to non-technical workers. The true IP is the wiring (R2, Snipcart, DNS, Sync Scripts).
- API keys and GitHub tokens will be compiled into a Rust launcher binary — never left on disk for workers.
- Workers see only their brand's content via Git Sparse Checkout (managed by the Rust Orchestrator — planned).
- `public/images/` is gitignored — workers can clone the repo and see a functional site (with Base64 favicon fallback) without any media sync.

---

## 16. Ghost Asset Fallback System

`BaseLayout.astro` implements a 3-tier favicon strategy at build time using Node `fs`:

```
1. Production: {PUBLIC_IMAGE_GATEWAY_URL}/{brandId}/assets/brand/favicon.svg  ← R2 Worker
2. Dev (junction exists): /images/assets/brand/favicon.svg                    ← Local junction
3. Fallback (no media): Base64-encoded "Z" SVG icon                           ← Stateless, always works
```

This ensures:
- A brand operator can clone the repo and see a working site immediately, even without setting up media.
- The repo has zero binary/image blobs committed to Git.
- CI/CD preview deploys work without any R2 configuration.

---

## 17. Current State & Active Work

### Active Branch

`feature/content-foundation`

### Completed (Do Not Revisit Without Explicit Instruction)

- ✅ Full Snipcart UI rebrand (Royal Conservatory palette)
- ✅ Custom checkout templates (`snipcart-templates.html`)
- ✅ Razorpay custom payment bridge
- ✅ Shiprocket webhook receiver + status mapping
- ✅ Delivery email + feedback loop (Tally.so)
- ✅ MailerLite dual-trigger integration (checkout + delivery confirm page)
- ✅ Newsletter confirmation flow (`/newsletter/confirm` + `/newsletter/success`)
- ✅ `NewsletterWidget.astro` (variants: footer, sidebar, modal)
- ✅ Legal page shells (returns, T&C, privacy policy, shipping)
- ✅ Design system primitives (Badge, Button, FilterChip, Heading, Icon, Image, Input, Link, Logo, Modal, Section, Text, AdSlot)
- ✅ Wishlist system (Alpine.js store + localStorage)
- ✅ Free Shipping Nudge component
- ✅ SideDrawer (upsell, quick-shop, master-set modes)
- ✅ Lookbook Carousel (Splide.js)
- ✅ Z-index architecture (documented in `src/styles/Readme_Z_INDEX_ARCHITECTURE.md`)
- ✅ Validation utils (`isGmailAddress`, `isValidEmail`)
- ✅ Cloudflare adapter (`@astrojs/cloudflare`) — Netlify fully removed
- ✅ Keystatic CMS — Active with Junction patch
- ✅ R2 + Worker image engine — 4-width srcset (200, 400, 800, 1200)
- ✅ Ghost Operator architecture (Windows Junctions + Vite Bridge)
- ✅ Fail-fast brand guard (`process.exit(1)` on invalid `PUBLIC_BRAND_ID`)
- ✅ Ghost asset fallback (Base64 favicon)
- ✅ Blog system — MDX posts, sticky TOC, `TableOfContents.astro`, `toc.ts` behavior
- ✅ `BlogCard.astro` UI component (read time, categories, author)
- ✅ `SmartBlogGrid.astro` + `SmartProductGrid.astro` feature components
- ✅ Geo-detection + Region store (`region.ts` + `/api/geo.ts`)
- ✅ Affiliate mode (`PUBLIC_AFFILIATE` binary, `AffiliateEngine.astro`, `AffiliateQuickView.astro`)
- ✅ Jaccard Similarity recommendations + Fisher-Yates shuffle (`recommendations.ts`, `shuffle.ts`)
- ✅ `EditorialHero.astro` — unified hero for brand/lookbook pages
- ✅ `TrackingScripts.astro` — GA, Meta Pixel injection via env vars
- ✅ View Transitions + email-decode fix
- ✅ `sorting.ts` behavior — product sort Alpine store
- ✅ `reading-time.ts` — build-time read time calculation

### Pending (Next Sessions)

- ⏳ **Rust Orchestrator** — Launcher binary for Ghost Operator local setup. Git Sparse Checkout, env injection, "Sync" button.
- ⏳ **Cloudflare Ignored Build Filters** — `git diff` filter per brand in Cloudflare Pages settings to skip irrelevant builds.
- ⏳ **Multi-Currency "Double-Lock"** — JSON price maps in `data-item-price`, Cloudflare edge geo validation. See `.plans/todo/ROADMAP_MULTI_CURRENCY.md`.
- ⏳ **Sold Out UI Mapping** — Map Snipcart inventory data to UI (disable "Add to Cart" based on stock).
- ⏳ **Dynamic SEO Metadata Pipeline** — `SEOHead.astro` component. Auto-pipe brand YAML into OpenGraph + meta tags.
- ⏳ **About page** — GSAP + Lenis scroll, YAML-driven screenplay. (On Hold).
- ⏳ **Care Guide page** — Same as About. GSAP + Lenis. YAML-driven. (On Hold).
- ⏳ **Security & Performance** — Rate limiting, RSS feeds, GDPR/DPDP consent.
- ⏳ **PopupModal scoping** — Gate popups per page type (not appropriate on checkout, PDP, shop, lookbook).

---

*Last Updated: 2026-05-22 by Antigravity (Claude Sonnet 4.6 Thinking) — Verified against live codebase.*

