# Concerns Log
> Every architectural concern raised during development is recorded here.
> Status: 🔴 Critical | 🟡 Important | 🟢 Minor | ✅ Resolved

---

## C-001: `site` URL Hardcoded to Netlify
**Raised:** 2026-04-05 | **Status:** ✅ Resolved — 2026-04-05

### Problem
`astro.config.mjs` contains `site: 'https://zaviona-dev.netlify.app'` — a dead Netlify URL.
- Snipcart uses this URL for product price validation via its crawler.
- When Brand 2 deploys to a different domain, this URL will be wrong and break checkout.
- All Netlify references must be purged from the codebase.

### Resolution Plan
- Move `site` to `import.meta.env.PUBLIC_SITE_URL`
- Add `PUBLIC_SITE_URL` to all `.env` files and `.env.example`
- Delete every remaining Netlify reference (`astro.config.mjs`, comments, etc.)
- **Owner:** Milestone 2 Jules payload

---

## C-002: Snipcart Loads on Every Brand Unconditionally
**Raised:** 2026-04-05 | **Status:** ✅ Resolved — 2026-04-05

**Resolution:** `BrandEngine.astro` now contains all Snipcart logic. `BaseLayout.astro` is free of any Snipcart reference. `EngineLayout.astro` conditionally injects `BrandEngine` only when `PUBLIC_AFFILIATE=false`.

---

## C-003: `ecommerce.ts` is Not Mode-Aware
**Raised:** 2026-04-05 | **Status:** ✅ Resolved — 2026-04-05

**Resolution:** Isolation is handled at the Engine layer. `ecommerce.ts` is only consumed by Brand-mode product pages. The Affiliate engine will use a separate `mapAffiliateProduct()` helper (P-010).

---

## C-004: No Fail-Fast Guard for `PUBLIC_BRAND_ID`
**Raised:** 2026-04-05 | **Status:** ✅ Resolved — 2026-04-05

**Resolution:** `src/content/config.ts` now throws with a clear human-readable error if `PUBLIC_BRAND_ID` is not set at build time.

---

## C-005: `site.config.ts` Contains Hardcoded Zelia Vance Identity
**Raised:** 2026-04-05 | **Status:** ✅ Resolved — 2026-04-05

**Resolution:** `site.config.ts` has been **deleted**. All consumers (`Logo.astro`, `SocialLinks.astro`, `Footer.astro`, `contact.astro`, `payment-methods.ts`) now use `getEntry('settings', 'site')` from the Content Layer.

---

## C-006: Affiliate Product Schema Does Not Exist
**Raised:** 2026-04-05 | **Status:** 🟢 Minor — UNRESOLVED (Not blocking)

### Problem
The `products` collection schema in `src/content/config.ts` is designed for D2C products (`price`, `sku`, `variant_1`, etc.). Affiliate products have a fundamentally different schema:
- No `price` (price is set by the merchant, not us)
- No `sku` (we don't manage inventory)
- No `variant_*` (variants exist on the merchant's site)
- Yes: `affiliate_link` (the Cuelinks/Admitad tracked URL)
- Yes: `affiliate_platform` (e.g., "Myntra", "Amazon", "Cuelinks")
- Yes: `display_price` (optional — the price as shown by the merchant, for display only)

### Resolution Plan
Two options under consideration:
1. **Separate schemas per mode** — `products-brand` and `products-affiliate` collections, loader chosen based on `PUBLIC_AFFILIATE` flag
2. **Unified schema with optional fields** — all fields optional, validation skipped for irrelevant fields per mode

**Option 1 is preferred** — it's explicit and prevents D2C-only validation errors on affiliate content.
- **Owner:** Milestone 4 (Brand 2 setup)

---

## C-007: `.env.example` Lacks Documentation
**Raised:** 2026-04-05 | **Status:** 🟢 Minor — UNRESOLVED

### Problem
`.env.example` has no comments explaining which variables are required for which mode. Opening the project fresh (or months later) requires reading the codebase to understand what to fill in.

### Resolution Plan
Add inline comments to `.env.example`:
```env
# ── REQUIRED FOR ALL BRANDS ─────────────────────────────────────────
PUBLIC_BRAND_ID=""         # e.g., "zelia-vance" — no default, required
PUBLIC_SITE_URL=""         # e.g., "https://zeliavance.com"
PUBLIC_AFFILIATE=false     # true for affiliate brands, false for D2C

# ── REQUIRED ONLY FOR D2C BRANDS (PUBLIC_AFFILIATE=false) ───────────
PUBLIC_SNIPCART_API_KEY=""
PUBLIC_RAZORPAY_KEY_ID=""
# ... etc.
```
- **Owner:** Antigravity (next `.env.example` update)
