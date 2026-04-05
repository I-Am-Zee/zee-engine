# Master Game Plan
> **Last Updated:** 2026-04-05
> **Owner:** I Am Zee (Raunak Singh)
> **Status:** 🟡 Active — In Development

---

## The Vision

This is **not a website.** It is a **Private Multi-Brand E-Commerce Engine** — a single Astro codebase that powers multiple distinct brand websites, each deployed independently via Cloudflare Pages.

The goal: launching a new revenue-generating brand should take **hours, not weeks.**
- New brand = new Cloudflare Pages deployment + new `.env` file + new content folder.
- Zero new components. Zero new layouts. Zero new logic.

---

## The Two Operating Modes

Every brand that runs on this engine is exactly one of two types:

### Mode 1: BRAND (`PUBLIC_AFFILIATE=false`)
A **D2C (Direct-to-Consumer)** brand. We source the products, we ship them, we own the customer relationship.

**Technical Stack Active:**
- Snipcart (cart + checkout)
- Razorpay (payment gateway)
- Shiprocket (shipping + tracking)
- `ecommerce.ts` SSOT (price mapping, Snipcart data attributes)
- "Add to Cart" buttons on all product pages
- Full customer data pipeline (order → MailerLite → Shiprocket webhook)

**Example:** Zelia Vance — Costume Jewellery, ₹399–₹5,000, India only.

---

### Mode 2: AFFILIATE (`PUBLIC_AFFILIATE=true`)
An **Affiliate Marketing** brand. We curate products from third-party platforms (Cuelinks, Admitad, Myntra, Amazon, etc.) and earn a commission per click/sale. No inventory. No shipping.

**Technical Stack Active:**
- Cuelinks / Admitad tracking pixels (from brand's `settings/tracking.json`)
- "Buy from [Store]" external link buttons on product pages
- Blog system with MDX for AdSense slot components
- Wishlist (local storage — universal, always on)
- Newsletter / MailerLite (universal, always on)
- **Nothing from Snipcart, Razorpay, or Shiprocket**

**Planned Example:** A Fashion & Accessories affiliate hub (men/women/lifestyle).

---

## The Immediate Milestone Goals

### ✅ Milestone 0: Foundation (COMPLETE)
- Astro 5 Content Layer API migration
- Brand-specific content folders (`src/content/{brand-id}/`)
- `PUBLIC_BRAND_ID` drives all content paths
- MDX enabled for blog posts

### 🟡 Milestone 1: Engine Room Prep (COMPLETE)
- PagesCMS removed
- `@astrojs/mdx` installed
- Blog migrated to `.mdx`
- `PUBLIC_AFFILIATE` env var introduced (replacing old `PUBLIC_STORE_MODE`)

### ⏳ Milestone 2: Layout Engine Architecture
- `BaseLayout.astro` stripped to universal-only shell
- `EngineLayout.astro` created as the mode-aware middle layer
- `BrandEngine.astro` handles all D2C scripts and Snipcart injection
- `AffiliateEngine.astro` handles affiliate scripts and link behavior
- All Netlify references deleted from codebase
- `site.config.ts` retired — data moves to brand `site.yml`

### ⏳ Milestone 3: Keystatic Integration (Local-Dev Only)
- `@keystatic/astro` installed
- Dashboard available at `localhost:4321/keystatic` during dev only
- Dashboard points to active `PUBLIC_BRAND_ID` content folder
- Not deployed to Cloudflare production (404 in prod by design)

### ⏳ Milestone 4: Brand 2 — Affiliate Site
- Affiliate product schema defined (with `affiliate_link`, `affiliate_platform`, no `price`, no `sku`)
- First affiliate brand content folder created
- `PUBLIC_AFFILIATE=true` tested end-to-end
- "Buy from Store" button live

### ⏳ Milestone 5: Design Token System
- `src/styles/base.css` — universal structural CSS
- `src/styles/{brand-id}/theme.css` — brand-specific CSS variables
- Greyscale fallback defaults built into base (renders neutral when theme is missing)
- `BaseLayout` dynamically injects brand theme file

---

## The `.env` Contract (The Engine's Master Keys)

Every brand deployment requires exactly **three** environment variables. If any are missing, the build **fails immediately** with a clear error message — no silent defaults.

```env
# REQUIRED: Which brand is this deployment for?
PUBLIC_BRAND_ID="zelia-vance"

# REQUIRED: The live production URL of this brand
PUBLIC_SITE_URL="https://zeliavance.com"

# REQUIRED: Is this an affiliate site or a D2C brand?
PUBLIC_AFFILIATE=false
```

All other env vars (Snipcart key, Razorpay key, etc.) are **mode-conditional.**
- If `PUBLIC_AFFILIATE=false` → Snipcart, Razorpay, Shiprocket keys are required.
- If `PUBLIC_AFFILIATE=true` → those keys are ignored/not needed.

---

## The Brand-Content Folder Contract

Every brand must have this folder structure under `src/content/{brand-id}/`:

```
src/content/{brand-id}/
├── products/       ← .md files (D2C schema OR Affiliate schema, not both)
├── lookbooks/      ← .md files
├── blog/           ← .mdx files (supports AdSense <AdSlot /> components)
├── settings/
│   ├── site.yml    ← Brand identity (name, tagline, emails, socials)
│   └── tracking.json ← Script IDs (Snipcart key, Meta Pixel, Cuelinks ID, etc.)
└── newsletter/
    └── {brand-id}.json ← Newsletter copy
```

The `src/content/pages/` folder (legal pages) is **SHARED across all brands** by design.

---

## Non-Negotiable Rules

1. **No hardcoded brand data** in any component, layout, or page. Everything flows from env vars or content files.
2. **No defaults for `PUBLIC_BRAND_ID`**. If it's missing, the build crashes with a clear error.
3. **Keystatic is local-dev only**. It does not deploy to production.
4. **Affiliate mode never loads Snipcart**. No exceptions.
5. **Brand mode never runs Cuelinks/Admitad scripts**. No exceptions.
6. **Legal pages (`src/content/pages/`) are shared**. Never move them to brand folders.
7. **Jules handles batch file operations.** Architecture decisions are never delegated to Jules.
