# Concerns Log
> Every architectural concern raised during development is recorded here.
> Status: 🔴 Critical | 🟡 Important | 🟢 Minor | ✅ Resolved

---

## C-001: `site` URL Hardcoded to Netlify
**Raised:** 2026-04-05 | **Status:** 🔴 Critical — UNRESOLVED

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
**Raised:** 2026-04-05 | **Status:** 🔴 Critical — UNRESOLVED

### Problem
`BaseLayout.astro` unconditionally injects the Snipcart `<script>` tag and loads the Snipcart CSS. When Brand 2 (Affiliate mode) deploys, it will:
- Load a cart system it doesn't need
- Make requests against a Snipcart API key that may not be configured
- Slow down the affiliate site with unnecessary JavaScript

### Resolution Plan
- Implement `EngineLayout.astro` with the `BrandEngine` / `AffiliateEngine` split (see ADR-005)
- Move Snipcart script injection into `BrandEngine.astro`
- `BaseLayout` becomes truly universal — no mode-specific scripts
- **Owner:** Milestone 2 Jules payload (after Antigravity finalizes the `EngineLayout` architecture)

---

## C-003: `ecommerce.ts` is Not Mode-Aware
**Raised:** 2026-04-05 | **Status:** 🟡 Important — UNRESOLVED

### Problem
`src/config/ecommerce.ts` contains the `mapProduct()` function which builds Snipcart `data-item-*` attributes. The Affiliate brand does not use Snipcart, making this file irrelevant (but potentially imported by accident).

### Resolution Plan
- Once `EngineLayout` pattern is implemented, `ecommerce.ts` is only imported inside `BrandEngine.astro`
- The Affiliate engine will have its own `mapAffiliateProduct()` function (or similar) for building external link data
- No changes to `ecommerce.ts` itself — isolation is handled at the Engine layer
- **Owner:** Milestone 2

---

## C-004: No Fail-Fast Guard for `PUBLIC_BRAND_ID`
**Raised:** 2026-04-05 | **Status:** 🟡 Important — UNRESOLVED

### Problem
`src/content/config.ts` currently does:
```ts
const brandId = import.meta.env.PUBLIC_BRAND_ID || "zelia-vance";
```
This silent default means a misconfigured Brand 2 deployment would serve Zelia Vance's content — silently and invisibly.

### Resolution Plan
Replace the above with a guard:
```ts
const brandId = import.meta.env.PUBLIC_BRAND_ID;
if (!brandId) {
  throw new Error(
    "[Engine Error] PUBLIC_BRAND_ID is not set. The engine cannot start without knowing which brand to serve. Add it to your .env file."
  );
}
```
- **Owner:** Antigravity (one-line edit, but must happen before Brand 2 exists)
- **Timing:** Can be done in the next local commit, before Milestone 2

---

## C-005: `site.config.ts` Contains Hardcoded Zelia Vance Identity
**Raised:** 2026-04-05 | **Status:** 🟡 Important — UNRESOLVED

### Problem
`src/lib/site.config.ts` hardcodes brand name, tagline, email aliases, phone, and social links for Zelia Vance. When Brand 2 deploys, any component importing this file will display Zelia Vance's contact details.

### Resolution Plan
1. Audit every component that imports `site.config.ts`
2. Replace with `getEntry('settings', 'site')` from the Content Layer
3. Delete `src/lib/site.config.ts`
- **Owner:** Milestone 2 Jules payload (purely mechanical find-and-replace after Antigravity audits imports)

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
