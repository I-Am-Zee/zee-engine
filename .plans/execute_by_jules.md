# Pure Engine Phase 3 — Master Implementation Plan
> **Branch:** `feature/jules-audit-prep`
> **Status:** ✅ Audit Complete — Ready to Implement
> **Last Updated:** 2026-04-12 v2 (Navigation architecture + FAQ placement + title composition finalized)
> **Author:** Antigravity (AI) + Raunak Singh (Owner)
> **This file is the single source of truth. Do not deviate without updating it first.**

---

## SECTION 0 — What This File Is

This document was created after:
1. Cross-referencing the Jules AI audit (`.plans/Audit_Preload_Result.md` on branch `origin/feature/jules-audit-prep-13679314136283468664`)
2. Cross-referencing the human-authored audit (`.plans/AUDIT-REPORT.md`)
3. Manually verifying every finding against the actual codebase
4. A full architectural discussion to decide which violations to fix, which to tolerate, and how

**"Jules' branch"** only added one file: `.plans/Audit_Preload_Result.md`. It made no code changes. All code changes happen on `feature/jules-audit-prep` (our current branch).

---

## SECTION 1 — Audit Corrections (What Jules Got Wrong or Incomplete)

Before acting on any of Jules' findings, these corrections MUST be understood:

### Correction 1: Keystatic Static Imports — Jules Was RIGHT (I Was Initially Wrong)

**My initial report said:** "Jules hallucinated this — no static imports found."
**The truth:** I searched with grep for the string `zelia-vance` as a path in the file. I missed the ES6 `import` statements at the top of `keystatic.config.ts`.

**The actual violations (confirmed):**
```typescript
// keystatic.config.ts — Line 10
const brandId = import.meta.env.PUBLIC_BRAND_ID || 'zelia-vance'; // ← runtime, fine

// keystatic.config.ts — Line 13 (STATIC — always reads zelia-vance)
import taxonomyJson from './src/content/zelia-vance/settings/taxonomy.json';

// keystatic.config.ts — Line 24 (STATIC — always reads zelia-vance)
import shippingJson from './src/content/zelia-vance/settings/shipping.json';
```

`brandId` resolves at runtime. These `import` statements resolve at **parse/build time**. They bypass `PUBLIC_BRAND_ID` entirely. If you run Keystatic with `PUBLIC_BRAND_ID=affiliate_zee`, it still reads Zelia Vance taxonomy and shipping. This is a genuine fatal multi-tenancy failure.

**Also confirmed on same file:**
- Line 36: `brand: { name: 'Zelia Vance CMS' }` — hardcoded CMS dashboard name
- Line 249: `author: fields.text({ defaultValue: 'Zelia Vance Team' })` — hardcoded blog author default

---

### Correction 2: `Image.astro` `200w` — This Is INTENTIONAL (Not a Violation)

**Jules said:** `200w` violates the R2 Worker architecture (only 400/800/1200 allowed).
**The truth:** The owner explicitly added `200w` for thumbnail use cases (e.g., PDP gallery). This is a deliberate architectural decision.

**Current `Image.astro` line 75 (confirmed correct):**
```typescript
gatewaySrcset = `${gateway}${r2Path}?w=200 200w, ${gateway}${r2Path}?w=400 400w, ${gateway}${r2Path}?w=800 800w, ${gateway}${r2Path}?w=1200 1200w`;
```

**The srcset is 4 widths: 200, 400, 800, 1200. This is working as intended. Do NOT change it.**

The only cost awareness: 4 transform variants instead of 3. That consumes Cloudflare's 5k/month free-tier transforms faster. Accepted tradeoff.

---

### Correction 3: `loading="lazy"` + `fetchpriority` — Already Correctly Handled

**Jules said:** Defaults to `loading="lazy"` — bad for LCP.
**The truth:** The prop is exposed and LCP-critical callers already override it correctly.

**Evidence (confirmed by grep):**
```
src/pages/index.astro (hero image)           → loading="eager" fetchpriority="high" ✅
src/pages/lookbooks/[slug].astro (hero)      → loading="eager" fetchpriority="high" ✅
src/components/features/LookbookCarousel.astro → loading="eager" fetchpriority="high" ✅
```

`Image.astro` defaults to `loading="lazy"`, which is the correct baseline for below-fold images. Hero/LCP surfaces correctly opt in to `eager`. **No fix needed here.**

One nuance to stay aware of: The `sizes` prop defaults to `"100vw"`. This is a safe, valid baseline. For partial-width contexts (like thumbnails in the PDP gallery), the **call-site** should pass a more specific `sizes` value like `"(max-width: 768px) 50vw, 25vw"`. This is "call-site responsibility" — `Image.astro` itself doesn't need to change, but usage points for thumbnails should be audited when implementing the gallery. Not blocking for Phase 3.

---

### Correction 4: `AnnouncementBar` — Redundant Fetch (Not Just an Atomic Violation)

**What makes this worse than a simple rule violation:** `BaseLayout.astro` already fetches `marketingSettings` (line 14) and `brandSettings` (line 13) for its own purposes. `AnnouncementBar` then re-fetches `marketingSettings` independently. This means two `getEntry("settings", "marketing")` calls happen per page load — one in `BaseLayout`, one in `AnnouncementBar`. That's redundant. The data is already in the parent.

The fix actually **reduces** total CMS calls, not just fixes an architectural rule.

---

### Correction 5: `SideDrawer` Event ID Is Also a Coupling Point

Beyond the `zeliavance:*` event names, the `SideDrawer` component has:
```html
<!-- SideDrawer.astro line 24 -->
<div id="zeliavance-side-drawer" ...>
```

`side-drawer.ts` behavior binds to this ID. If this ID is a DOM selector anywhere, renaming it requires updating both places atomically.

---

## SECTION 2 — Confirmed Violations Master List

### 2A. Brand String Contamination

| File | Line(s) | Hardcoded String | Fix |
|---|---|---|---|
| `keystatic.config.ts` | 36 | `'Zelia Vance CMS'` | Read from `PUBLIC_BRAND_ID` or make generic `'Content Studio'` |
| `keystatic.config.ts` | 249 | `defaultValue: 'Zelia Vance Team'` | Change to `''` or generic `'Content Team'` |
| `src/layouts/BaseLayout.astro` | 25 | `'Zelia Vance' \| 'Luxury Jewelry'` in title fallback | Brand name must come from CMS only. Fail loudly if missing. |
| `src/pages/index.astro` | 71 | `"Zelia Vance \| Luxury Jewelry & Timeless Elegance"` | Auto-compose from `EngineLayout` |
| `src/pages/wishlist.astro` | 33 | `"My Wishlist \| Zelia Vance"` | Auto-compose from `EngineLayout` |
| `src/pages/shop/[...page].astro` | 33, 39 | `"All Jewelry"` and `"Shop All Jewelry \| Zelia Vance"` | CMS-driven nav label + auto-compose title |
| `src/pages/shop/[category].astro` | 93 | `\| Zelia Vance` suffix | Auto-compose from `EngineLayout` |
| `src/pages/search.astro` | 30 | `"Search Our Collection \| Zelia Vance"` | Auto-compose |
| `src/pages/returns.astro" | 15 | `\| Zelia Vance` | Auto-compose |
| `src/pages/shipping.astro" | 15 | `\| Zelia Vance` | Auto-compose |
| `src/pages/privacy-policy.astro" | 15 | `\| Zelia Vance` | Auto-compose |
| `src/pages/terms-of-service.astro" | 15 | `\| Zelia Vance` | Auto-compose |
| `src/pages/products/[slug].astro" | 74 | `\| Zelia Vance` | Auto-compose |
| `src/pages/lookbooks/index.astro" | 16, 20 | `"Curated jewelry collections..."` + `\| Zelia Vance` | CMS + auto-compose |
| `src/pages/lookbooks/[slug].astro" | 49, 50 | `\| Zelia Vance` + `'Discover our curated jewelry collection'` | CMS fallback + auto-compose |
| `src/pages/collections/index.astro" | 47 | `\| Zelia Vance` | Auto-compose |
| `src/pages/collections/[tag].astro" | 84 | `\| Zelia Vance` | Auto-compose |
| `src/pages/newsletter/confirm.astro" | 11-12 | Both strings contain `Zelia Vance` | CMS-driven |
| `src/pages/newsletter/success.astro" | 9-10 | Both strings contain `Zelia Vance` | CMS-driven |
| `src/pages/blog.astro" | 9, 11 | Title + hardcoded h1 `Zelia Vance Journal` | CMS-driven |
| `src/pages/faq.astro" | 11, 26, 54, 56-57 | Title + FAQ content with "diamonds", "Kimberley Process", "boutiques" | Full Keystatic migration |
| `src/pages/contact.astro" | 14 | `\|\| 'Zelia Vance'` fallback | Remove fallback — use CMS strictly |
| `src/pages/checkout/razorpay.astro" | 30, 154 | Title + `name: "Zelia Vance"` in Razorpay JS object | CMS-driven |
| `src/pages/checkout/stripe.astro" | 41, 164 | `<title>` + div with `Zelia Vance` | CMS-driven |
| `src/pages/checkout/stripe-success.astro" | 23, 103 | Same pattern | CMS-driven |
| `src/pages/design-system.astro" | 32, 38, 814 | Multiple brand strings | Acceptable — dev-only page, low priority |
| `src/components/features/Navbar.astro" | 38 | `"All Jewelry"` nav label | CMS-driven or at minimum variable |
| `src/components/features/Footer.astro" | 43 | `"All Jewelry"` footer link | CMS-driven or at minimum variable |

### 2B. Vertical-Specific ("Jewelry") Strings

| File | Content | Fix |
|---|---|---|
| `src/pages/shop/[...page].astro` | `title: "All Jewelry"` category label | Must come from taxonomy/CMS |
| `src/pages/lookbooks/index.astro` | `"Curated jewelry collections for every occasion..."` (hardcoded subtitle) | Should come from Keystatic `page_headers` singleton |
| `src/pages/index.astro` | `alt="Luxury Jewelry Hero"` | Come from CMS hero content |
| `src/pages/blog.astro` | `"Insights into the world of luxury jewelry..."` | CMS-driven |
| `src/components/ui/ComingSoon.astro` | default description: `"exquisite new pieces"`, `"final polish"` | Change to neutral: `"New items are on the way."` or ensure CMS value is always set |
| `src/pages/faq.astro` | `"diamond jewelry"`, `"boutiques"`, `"Kimberley Process"`, `"lifetime warranty"` | Replace with Keystatic FAQ collection |

### 2C. Atomic Design Violations

These are **confirmed violations of AGENTS.md**. The architectural decision (reached in our conversation) is to **fix all of them** for multi-tenant engine health. See Section 3 for the rationale.

| Component | Layer | Violation | Fix Path |
|---|---|---|---|
| `Logo.astro` | **Primitive** ← most severe | `getEntry("settings", "brand")` for `brandName` | `Navbar.astro` (Feature) fetches + passes `brandName` prop |
| `SocialLinks.astro` | UI | `getEntry("settings", "brand")` for social links | `Footer.astro` already fetches brand settings. Pass `social` array as prop. |
| `AnnouncementBar.astro` | UI | `getEntry("settings", "marketing")` + `getEntry("settings", "shipping")` | `BaseLayout` already fetches marketing. Pass `announcement_bar` data + `threshold` as props. |
| `SideDrawer.astro" | UI | `getEntry("settings", "shipping")` for threshold | `BaseLayout` adds one `getEntry("settings", "shipping")`. Passes `threshold` as prop. |
| `TrustSection.astro" | UI | `getEntry("pages_content", "trust_section")` | Fetch in the **page** that uses `TrustSection` (currently `index.astro`), pass as props. |
| `ComingSoon.astro" | UI | `getEntry("component_hub", "coming_soon")` | Fetch in the **page** that renders it (category/tag pages), pass as props. |

> **Note on `CompleteTheLook.astro`:** This was already correctly moved to `features/` in a previous session. It is NOT a violation. Do not touch it.

### 2D. Alpine Event Namespace Coupling

Every custom event uses the `zeliavance:` prefix. This ties the JavaScript event bus to a specific brand identity. Events must be engine-generic.

**Rename map:**
| Old Name | New Name |
|---|---|
| `zeliavance:item-added` | `engine:item-added` |
| `zeliavance:quick-shop` | `engine:quick-shop` |
| `zeliavance:master-set` | `engine:master-set` |
| `zeliavance:show-toast` | `engine:show-toast` |

**Files that must be updated atomically (all 8 at once — event names must match):**

| File | Lines | Direction |
|---|---|---|
| `src/scripts/snipcart-init.ts` | 251 | dispatches `engine:item-added` |
| `src/scripts/behaviors/side-drawer.ts` | 25, 26, 27, 143 | listens to 3 events, dispatches 1 |
| `src/scripts/behaviors/quick-shop.ts` | 8 | dispatches `engine:quick-shop` |
| `src/components/features/BuySetButton.astro` | 47 | `$dispatch('engine:master-set', ...)` |
| `src/components/ui/GlassProductCard.astro` | 157 | `$dispatch('engine:quick-shop', ...)` |
| `src/components/ui/CartToast.astro` | 67 | listens `engine:show-toast` |
| `src/pages/lookbooks/[slug].astro` | 232 | `$dispatch('engine:master-set', ...)` |
| `src/components/ui/SideDrawer.astro` | 24 | `id="engine-side-drawer"` (rename DOM id) |

> ⚠️ **Cross-check:** Ensure `side-drawer.ts` behavior file selects the drawer by Alpine component name (`x-data="sideDrawer"`), not by DOM id. If it uses a `document.getElementById("zeliavance-side-drawer")` anywhere, that must also be updated.

### 2E. Keystatic Static Imports (Fatal Multi-Tenancy Failure)

| File | Line | Violation | Fix |
|---|---|---|---|
| `keystatic.config.ts` | 13 | `import taxonomyJson from './src/content/zelia-vance/settings/taxonomy.json'` | Use `fs` or dynamic path based on `PUBLIC_BRAND_ID`; or use `require()` with a computed path |
| `keystatic.config.ts` | 24 | `import shippingJson from './src/content/zelia-vance/settings/shipping.json'` | Same as above |
| `keystatic.config.ts` | 36 | `brand: { name: 'Zelia Vance CMS' }` | Read from brand name or use generic `'Content Studio'` |
| `keystatic.config.ts` | 249 | `defaultValue: 'Zelia Vance Team'` | Change to `''` (empty) or `'Content Team'` |

**How to fix the static imports:** ES6 `import` statements cannot be dynamic. The solution is to switch to `require()` with a template literal:
```typescript
// Replace lines 12-28 with:
const brandId = import.meta.env.PUBLIC_BRAND_ID;
if (!brandId) throw new Error('[Keystatic] PUBLIC_BRAND_ID is not set.');

// Use require() for dynamic JSON loading
const taxonomyJson = require(`./src/content/${brandId}/settings/taxonomy.json`);
const shippingJson = require(`./src/content/${brandId}/settings/shipping.json`);
```
Since `keystatic.config.ts` is not a browser module (runs in Node during local dev), CommonJS `require()` with a dynamic path is perfectly valid here.

### 2F. DRY Violation — Snipcart Validation Duplicates Pure Functions

| File | Lines | Issue | Fix |
|---|---|---|---|
| `src/scripts/snipcart-init.ts` | ~87-91, ~194-199 | Inline Gmail + phone validation logic duplicates `validation.ts` pure functions | Import `isGmailAddress`, `isValidEmail` from `../../scripts/utils/validation` |

The pure functions already exist and are correct. This is purely a DRY cleanup.

### 2G. FAQ Page — Fully Hardcoded, Jewelry-Specific Content

`src/pages/faq.astro` has hardcoded FAQ items including:
- References to "diamonds", "Kimberley Process", "conflict-free sourcing"
- References to "boutiques" (Zelia Vance doesn't even have those)
- References to "lifetime warranty" (not in AGENTS.md returns policy)
- References to "complimentary jewelry cleaning kit"

This page is entirely wrong for a multi-tenant engine. It needs a Keystatic FAQ collection.

---

## SECTION 3 — Architectural Decisions (Locked)

### Decision 1: Full Atomic Design Compliance — FIX ALL VIOLATIONS

**Decision: Yes, fix all 6 self-fetching components. No exceptions tolerated.**

**Why the "Smart self-fetching" approach was originally chosen:**
The previous session chose this to avoid prop-drilling chains. For example: if `Logo` didn't self-fetch, `BaseLayout → Navbar → Logo` would all need to thread `brandName` as a prop.

**Why we are overriding that decision and fixing it:**

1. **Astro Content Layer deduplication.** `getEntry()` in Astro does not create N+1 problems. It is resolved at build time (SSG) or cached per-request (SSR). Redundant calls (like `AnnouncementBar` re-fetching what `BaseLayout` already fetched) are wasteful and confusing, not dangerous. But they are still unclean.

2. **Multi-tenant engine integrity.** A self-fetching `ComingSoon` or `SideDrawer` silently assumes the current brand has the specific CMS keys it's looking for. If `affiliate_zee` doesn't have `settings/shipping`, `SideDrawer` either crashes or uses wrong data. Prop-drilling makes this a **loud failure at the layout level**, where it's easy to debug.

3. **Reusability is broken.** A `Logo` that self-fetches cannot be placed in an email template, a Keystatic preview, a Storybook, or any context outside the full Astro runtime. A prop-driven `Logo` can.

4. **AGENTS.md is the contract.** The rules exist specifically to prevent this kind of "convenient exception" from cascading. We enforce the contract now rather than when there are 10 brands relying on it.

5. **The prop-drilling concern is manageable.** The fix is minimal:
   - `Logo` → `Navbar` (already a Feature) fetches brand name + passes down. 2-line change.
   - `SocialLinks` → `Footer` (already fetches brand) passes social array. 2-line change.
   - `AnnouncementBar` → `BaseLayout` already has the data. Just thread it as props.
   - `SideDrawer` → `BaseLayout` adds one `getEntry`. Passes `threshold` as prop.
   - `TrustSection`, `ComingSoon` → Fetch on the page that uses them. Pass as props.

**Prop-drilling chain for each:**
```
BaseLayout (fetches brand, marketing, shipping)
  ├── AnnouncementBar (receives announcement_bar data + threshold as props)
  ├── Navbar (fetches nothing extra; receives brandName as prop → passes to Logo)
  │     └── Logo (receives brandName as prop)
  ├── Footer (fetches brand; passes social[] to SocialLinks as prop)
  │     └── SocialLinks (receives social[] as prop)
  └── SideDrawer (receives threshold as prop → passes to FreeShippingNudge)

index.astro (fetches trust_section content → passes to TrustSection as props)
[category].astro (fetches coming_soon content → passes to ComingSoon as props)
```

### Decision 2: Event Namespaces — Rename All `zeliavance:*` to `engine:*`

**Decision: Yes, rename all 4 event types globally.**

The event bus is the nervous system of the interactive layer. Brand-specific names mean:
- Brand B cannot run the same Snipcart init script without renaming
- Documentation is confusing for any contributor not familiar with Brand A
- `engine:*` correctly describes what these events do — they're engine-level signals

**Must be done atomically** — all 8 files in a single commit, or the event dispatch/listen chain breaks.

### Decision 3: Page Title System — Composition Lives in `BaseLayout`, Not `EngineLayout`

**Decision: The `pageTitle` prop is added to `BaseLayout.astro` (not `EngineLayout`). `EngineLayout` stays a thin engine-mode switcher.**

Reasoning:
- `BaseLayout` is where the `<title>` tag **actually renders** (its line 41)
- `BaseLayout` already fetches `brandSettings` — brand name is already in scope there
- `EngineLayout` is the engine-mode selector (Brand/Affiliate). Its responsibility is script injection, not metadata. Keep it that way.
- Adding title logic to `EngineLayout` would make it aware of brand content — a concern it should not own

**How it works:**
```typescript
// In BaseLayout.astro frontmatter — replaces the current line 25 fallback:
const brandName = brandSettings?.data?.name; // NO fallback. If missing, the build should surface this.
const fullTitle = pageTitle
  ? `${pageTitle} | ${brandName}`
  : brandName; // homepage case: just brand name
```

```astro
<!-- Props interface in BaseLayout -->
interface Props {
  pageTitle?: string;   // new — the raw page-specific title
  title?: string;       // legacy — kept temporarily for backward compat
  description?: string;
}
```

Then every page just does:
```astro
<EngineLayout pageTitle="Shop All Jewellery">
  <!-- EngineLayout passes pageTitle down to BaseLayout as-is -->
```

The brand name suffix becomes automatic. Change brand name in Keystatic → all pages update.

**`EngineLayout.astro" change:** Minimal — just needs to forward the `pageTitle` prop through to `BaseLayout`. EngineLayout itself does NOT fetch brand name or compose the title.

**`BaseLayout.astro" line 25 change:** Remove the hardcoded `'Zelia Vance' | 'Luxury Jewelry'` fallback entirely. If brand name is missing from CMS, the title renders as `undefined | undefined` — which is a loud, visible failure that forces the developer to fix the CMS entry. That is intentional.

### Decision 4: FAQ — Full Keystatic Migration

**Decision: Delete all hardcoded FAQ content. Create Keystatic FAQ collection. Drive page from CMS.**

The current FAQ content is jewelry-specific nonsense (diamond conflict-free sourcing, boutique cleaning). It is not even accurate to Zelia Vance's actual business policy. It must go.

### Decision 5: Keystatic Static Imports — Dynamic `require()`

**Decision: Replace `import` statements with `require()` for taxonomy and shipping JSON.**

Since `keystatic.config.ts` is a Node.js module (never bundled for the browser), `require()` with a dynamic template literal path is the correct and idiomatic solution. This makes the CMS truly brand-aware.

### Decision 6: `design-system.astro" — Low Priority, Acceptable as-is

This is a developer-only page. Hardcoded brand strings here are tolerated. Not blocking any multi-tenant deployment. Fix it last or not at all.

---

## SECTION 4 — Implementation Chunks

These are ordered by dependency and risk. **Each chunk is a single logical unit — one commit.**

---

### CHUNK 1: Event Namespace Rename (atomic, logic-safe)
**Risk:** 🟡 Medium — Must update all 8 files simultaneously. Dev server test required after.
**Depends on:** Nothing.
**Files:** 8 files (listed in Section 2D)

**Steps:**
1. In `src/scripts/snipcart-init.ts` — rename `zeliavance:item-added` → `engine:item-added`
2. In `src/scripts/behaviors/quick-shop.ts` — rename `zeliavance:quick-shop` → `engine:quick-shop`
3. In `src/scripts/behaviors/side-drawer.ts" — rename all 4 strings
4. In `src/components/features/BuySetButton.astro" — rename dispatch
5. In `src/components/ui/GlassProductCard.astro" — rename dispatch
6. In `src/components/ui/CartToast.astro" — rename listener
7. In `src/pages/lookbooks/[slug].astro" — rename dispatch
8. In `src/components/ui/SideDrawer.astro" — rename `id="engine-side-drawer"`

**Verify:** Open the site. Add a product to cart → check upsell drawer opens. Click Quick Shop on a card → check quick-shop drawer opens. Trigger lookbook master set → check master-set drawer opens.

---

### CHUNK 2: Keystatic Config — Fix Static Imports + Hardcoded Strings
**Risk:** 🟡 Medium — Keystatic local dev only. No production impact. But must test Keystatic dashboard load after.
**Depends on:** Nothing.
**Files:** `keystatic.config.ts` (lines 10-29, 36, 249)

**Steps:**
1. Remove `import taxonomyJson` (line 13)
2. Remove `import shippingJson` (line 24)
3. Add fail-fast guard for `PUBLIC_BRAND_ID` (throw if missing)
4. Replace with `const taxonomyJson = require(...)` using dynamic path
5. Replace with `const shippingJson = require(...)` using dynamic path
6. Line 36: Change `name: 'Zelia Vance CMS'` → `name: \`${brandId} CMS\`` or `'Content Studio'`
7. Line 249: Change `defaultValue: 'Zelia Vance Team'` → `''`

**Verify:** Run `npm run dev`. Open `localhost:4321/keystatic`. Confirm dashboard loads, products/lookbooks show correctly, taxonomy dropdowns are populated from `zelia-vance/settings/taxonomy.json`.

---

### CHUNK 3: `EngineLayout` Title System
**Risk:** 🟢 Low — purely additive prop change. Old `title` prop stays for backward compat during transition.
**Depends on:** Nothing strictly, but do before Chunk 4 so pages can use new system.
**Files:** `src/layouts/EngineLayout.astro` (or wherever the layout is defined)

**Steps:**
1. In `EngineLayout.astro" frontmatter: fetch brand name from `getEntry("settings", "brand")`
2. Add `pageTitle` as an optional prop alongside existing `title`
3. Logic: if `pageTitle` is provided → `fullTitle = "${pageTitle} | ${brandName}"`. If `title` provided (legacy) → use as-is. If neither → use `brandName` alone.
4. Update `BaseLayout.astro" line 25 to remove the `'Zelia Vance' | 'Luxury Jewelry'` hardcoded fallbacks — use CMS data only

**Verify:** Homepage still has a `<title>` tag. A page using `pageTitle="Shop All Jewelry"` renders `Shop All Jewelry | Zelia Vance` in the tab.

---

### CHUNK 4: Page Title Sweep — All Pages Use New System
**Risk:** 🟢 Low — string changes only, no logic.
**Depends on:** Chunk 3 complete.
**Files:** All `src/pages/**/*.astro" files with hardcoded `| Zelia Vance`

**Steps (per page):**
- Replace `title="something | Zelia Vance"` → `pageTitle="something"`
- For pages already using CMS data: `title={\`${entry.data.title} | Zelia Vance\`}` → `pageTitle={entry.data.title}`
- Special cases:
  - `src/pages/newsletter/confirm.astro" — title and description both need CMS source (add to brand singleton or newsletter settings in Keystatic)
  - `src/pages/newsletter/success.astro" — same
  - `src/pages/checkout/razorpay.astro" — `name: "Zelia Vance"` in the Razorpay JS object (line 154) — replace with `brandName" fetched in frontmatter
  - `src/pages/checkout/stripe.astro" / `stripe-success.astro" — same pattern

**Verify:** Tab titles across 10+ pages all show `[Page Name] | Zelia Vance` (brand name from CMS). Change brand name in Keystatic → rebuild → ALL PAGES update automatically.

---

### CHUNK 5: Atomic Design Fix — `BaseLayout` as the Data Hub
**Risk:** 🟡 Medium — touches the root layout. If this breaks, all pages break. Test thoroughly.
**Depends on:** Nothing strictly, but do with Chunks 5a-5b as one commit.
**Files:** `src/layouts/BaseLayout.astro", `src/components/ui/AnnouncementBar.astro", `src/components/ui/SideDrawer.astro"

**Steps:**
1. **`BaseLayout.astro":** Add `getEntry("settings", "shipping")` fetch. Extract `threshold` value.
2. **`BaseLayout.astro":** Pass `announcement_bar` data + `threshold` as props to `<AnnouncementBar>`. Pass `threshold" as prop to `<SideDrawer>`.
3. **`AnnouncementBar.astro":** Remove both `getEntry` calls. Accept `announcementBar" + `threshold" as props. Update interface Props.
4. **`SideDrawer.astro":** Remove `getEntry("settings", "shipping")`. Accept `threshold" as prop. Pass it to `<FreeShippingNudge>`.

**Verify:** Dev server restarts clean. Announcement bar shows (if enabled in CMS). Side drawer Free Shipping Nudge shows correct threshold.

---

### CHUNK 6: Atomic Design Fix — `Navbar` as `Logo` Props Provider
**Risk:** 🟢 Low — isolated to Navbar + Logo chain.
**Depends on:** Nothing.
**Files:** `src/components/features/Navbar.astro", `src/components/primitives/Logo.astro"

**Steps:**
1. **`Navbar.astro":** Already likely fetches brand data for other purposes. If not, add `getEntry("settings", "brand")`. Extract `brandName`.
2. **`Navbar.astro":** Pass `brandName" and `brandMark" (or just `brandName") as prop to `<Logo>`.
3. **`Logo.astro":** Remove `import { getEntry }` and the `getEntry` call. Update interface to require `brandName: string` prop. Derive `brandMark" locally from `brandName.charAt(0)`.

**Verify:** Logo still renders in navbar. Brand name displays correctly on all pages. No console errors.

---

### CHUNK 7: Atomic Design Fix — `Footer` as `SocialLinks` Props Provider
**Risk:** 🟢 Low — isolated to Footer + SocialLinks chain.
**Depends on:** Nothing.
**Files:** `src/components/features/Footer.astro", `src/components/ui/SocialLinks.astro"

**Steps:**
1. **`Footer.astro":** Already fetches brand data (verified in audit). Extract `social` array from brand settings.
2. **`Footer.astro":** Pass `social={social}` as prop to `<SocialLinks>`.
3. **`SocialLinks.astro":** Remove `import { getEntry }` and both `getEntry` call. Update interface to accept `social: SocialLink[]` prop.

**Verify:** Social icons in footer still render + link to correct URLs.

---

### CHUNK 8: Atomic Design Fix — `TrustSection` and `ComingSoon`
**Risk:** 🟢 Low — these are leaf components. The fetch just moves up to the page level.
**Depends on:** Nothing.
**Files:**
- `src/components/ui/TrustSection.astro"
- `src/components/ui/ComingSoon.astro"
- `src/pages/index.astro" (uses TrustSection)
- `src/pages/shop/[category].astro" (uses ComingSoon — verify this)
- Any other pages that render these components

**Steps for `TrustSection":**
1. In `src/pages/index.astro": add `getEntry("pages_content", "trust_section")` fetch. Pass `main_heading`, `hero_image`, `markers" as props to `<TrustSection>`.
2. In `TrustSection.astro": Remove `getEntry` call. The existing Props interface already defines `main_heading`, `hero_image`, `markers" — just stop ignoring the passed props and use them directly. Remove the getEntry destructuring (lines 21-26), use Astro.props directly.

**Steps for `ComingSoon":**
1. Find all pages that render `<ComingSoon>`. Add `getEntry("component_hub", "coming_soon")` at the page level. Pass resolved data as props.
2. In `ComingSoon.astro": Remove `getEntry" call. Accept all data via props. Update defaults to neutral language: `heading = "Coming Soon"`, `description = "New items will be available shortly."`.

**Verify:** TrustSection on homepage still renders with CMS content. ComingSoon on category pages still renders — heading substitutes `{category}` correctly.

---

### CHUNK 9: Snipcart Validation DRY Fix
**Risk:** 🟢 Low — pure function swap.
**Depends on:** Nothing.
**Files:** `src/scripts/snipcart-init.ts`

**Steps:**
1. Import `isGmailAddress` and `isValidEmail` from `../../scripts/utils/validation`
2. Replace the inline validation logic (~lines 87-91, 194-199) with calls to those functions
3. Delete the duplicated validation code

**Verify:** Go through Snipcart checkout. Attempt to enter a non-Gmail email. Should be blocked. Enter a valid Gmail. Should proceed.

---

### CHUNK 10: FAQ — Keystatic Migration
**Risk:** 🟡 Medium — new content schema + new page rendering logic.
**Depends on:** Nothing strictly, but Keystatic must be working (Chunk 2 should be done first).
**Files:** `src/pages/faq.astro", `keystatic.config.ts`, `src/content/config.ts`

**Steps:**
1. **`src/content/config.ts":** Add `faq` collection or `faq_page` singleton schema. Schema: `{ question: string, answer: string }[]`
2. **`keystatic.config.ts":** Add `faq_page" singleton pointing to `src/content/${brandId}/pages_content/faq`
3. Create initial FAQ content file at `src/content/zelia-vance/pages_content/faq.json" with accurate, Zelia Vance-specific FAQ items that match AGENTS.md policy
4. **`src/pages/faq.astro":** Replace all hardcoded `<AccordionItem>` elements with a `getEntry` call + `.map()` loop
5. Remove the title hardcoding — use `pageTitle="FAQ"` with new title system

**Verify:** FAQ page loads. All items from the JSON file appear. No hardcoded jewelry/diamond references remain.

---

### CHUNK 11: Remaining Brand Strings — Lookbooks, Blog
**Risk:** 🟢 Low — string/content changes.
**Depends on:** Chunk 3 (title system) done. Chunk 11A (Navigation singleton) done for nav labels.
**Files:** `lookbooks/index.astro", `blog.astro"

**Steps:**
1. `src/pages/lookbooks/index.astro" lines 16-17: hardcoded subtitle — move to `page_headers" Keystatic singleton for the Lookbooks index page.
2. `src/pages/blog.astro" lines 11, 13: hardcoded `Zelia Vance Journal` H1 and journal description — move to `page_headers" singleton for blog page.

> **Note:** The `"All Jewelry"` nav label fix is handled in **CHUNK 11A** (Navigation singleton), not here.

---

### CHUNK 12: Newsletter Pages — Brand Strings
**Risk:** 🟢 Low — content only.
**Depends on:** Title system (Chunk 3) and brand CMS being set up.
**Files:** `src/pages/newsletter/confirm.astro", `src/pages/newsletter/success.astro"

**Steps:**
1. Both pages have brand-specific titles and descriptions. These should come from the `newsletter_variants" CMS entries or from brand settings.
2. Replace hardcoded strings with CMS-fetched values.

---

### CHUNK 13: Checkout Pages — Brand Strings
**Risk:** 🔴 Higher — checkout is money-critical. Changes here must be carefully tested.
**Depends on:** Brand CMS being accessible during checkout (SSR context).
**Files:** `src/pages/checkout/razorpay.astro", `src/pages/checkout/stripe.astro", `src/pages/checkout/stripe-success.astro"

**Steps:**
1. `razorpay.astro" line 154: `name: "Zelia Vance"` in the Razorpay config JS object — this is the business name shown in the Razorpay payment modal. Must come from brand settings.
2. All three checkout page titles and any brand name references — use `pageTitle" system.

**Verify:** Complete a test checkout. Razorpay modal shows brand name correctly.

---

## SECTION 5 — What We Are NOT Fixing (Intentional Non-Actions)

| Item | Reason |
|---|---|
| `Image.astro" `200w" srcset | Owner decision. 4 widths (200/400/800/1200) are intentional for thumbnails. Do not change. |
| `Image.astro" `loading="lazy"` default | Correct baseline. LCP surfaces already override it. No fix needed. |
| `.prose-zelia" in `global.css" | Jules flagged it. Deferred. Requires Tailwind Typography plugin restructure. Milestone 5 (Design Token System). |
| Logistics webhook HTML templates | Jules flagged it. Deferred. Requires new Keystatic "Transactional Emails" schema. Milestone 5+. |
| `design-system.astro" brand strings | Dev-only page. Not deployed. Low priority. |
| `src/content/affiliate_zee/" missing folders | Incomplete affiliate brand folder. Milestone 4 (Brand 2). Not Phase 3. |
| `CartToast.astro" Snipcart integration style | Jules flagged it as "bordering on Feature-level." Tolerated — Snipcart's event API requires close component-level integration. This is a valid exception. |
| Alpine/DOM direct binding in `newsletter.ts" | Jules suggested Alpine.js refactor. Deferred — the newsletter engine is fully working per AGENTS.md. Not touching. |

---

## SECTION 6 — Execution Order Summary

```
CHUNK 1  → Event namespace rename (zeliavance:* → engine:*)
CHUNK 2  → Keystatic static imports fix + hardcoded strings
CHUNK 3  → EngineLayout title auto-compose system
CHUNK 4  → Page title sweep (all pages use new system)
CHUNK 5  → BaseLayout as data hub (AnnouncementBar + SideDrawer de-fetch)
CHUNK 6  → Navbar → Logo prop chain
CHUNK 7  → Footer → SocialLinks prop chain
CHUNK 8  → TrustSection + ComingSoon de-fetch (page-level fetch)
CHUNK 9  → Snipcart validation DRY fix
CHUNK 10 → FAQ Keystatic migration
CHUNK 11 → Navbar/Footer/Lookbooks/Blog remaining strings
CHUNK 12 → Newsletter pages brand strings
CHUNK 13 → Checkout pages brand strings (most careful)
```

**Chunks 1-2** can be done in any order (neither depends on the other).
**Chunk 3 must precede Chunk 4.**
**Chunks 5-8** are independent of each other and can be done in any order.
**Chunk 9** is standalone, any time.
**Chunk 10** requires Chunk 2 (Keystatic must work correctly first).
**Chunks 11-13** are string cleanup — do last.

---

## SECTION 7 — Testing Protocol for Each Chunk

After each chunk:
1. `npm run dev` — dev server must start cleanly with no TypeScript or Astro errors
2. Open the homepage — must render fully
3. Open the specific feature changed — verify it still works
4. Check browser console — no JavaScript errors
5. If touching Keystatic (Chunk 2, 10) — open `localhost:4321/keystatic` and verify dashboard

After ALL chunks complete:
1. `npm run build` — production build must complete with 0 errors
2. Review the built HTML for any remaining `Zelia Vance` strings in page `<title>` tags (should only appear via CMS data, not hardcoded)
3. Search built output for `zeliavance:` — must return 0 results

---

## SECTION 8 — Open Questions Status

| Question | Status | Resolution |
|---|---|---|
| FAQ content | ✅ Resolved | Seed with accurate dummy content. Owner will replace via Keystatic later. See Section 9. |
| Nav labels in CMS? | ✅ Resolved | Full Navigation singleton in Keystatic GENERAL UI. See Section 9 + Chunk 11A. |
| `EngineLayout.astro" location | ✅ Resolved | Confirmed at `src/layouts/EngineLayout.astro". |
| `ecommerce.ts" — touch or not? | ✅ Resolved | Do NOT touch. Pure Snipcart backend config working correctly. Not a CMS concern. |
| Title composition location | ✅ Resolved | Logic lives in `BaseLayout.astro". `EngineLayout` just forwards the prop. See Decision 3. |

**All open questions resolved. No blockers. Ready to execute.**

---

## SECTION 9 — Additional Architectural Decisions (Post-Conversation)

### Decision 7: FAQ — Goes in Keystatic PAGE CONTENT Section

**Location:** `PAGE CONTENT` group in Keystatic (same as Home-Hero, Trust Section, Wishlist Empty)

**Singleton name:** `page_faq`
**Path:** `src/content/${brandId}/pages_content/faq`
**Format:** JSON

**Schema:**
```typescript
page_faq singleton:
  heading: fields.text()           // Optional intro heading for the FAQ page
  description: fields.text()       // Optional subtitle/intro text
  items: fields.array(
    fields.object({
      question: fields.text(),
      answer: fields.text({ multiline: true }),
    })
  )
```

**Keystatic GENERAL UI navigation after this change:**
```
PAGE CONTENT
├── Home-Hero
├── Trust Section
├── Wishlist Page (Empty)
└── FAQ Page          ← new
```

**FAQ seed content (dummy — owner will replace):** Use accurate but generic FAQ items based on AGENTS.md policy:
- Returns window (48 hours, unboxing video required)
- Free shipping threshold (₹3,000)
- Payment methods (Razorpay)
- Care guidance (generic — avoid water, chemicals, store in pouch)
- Order tracking (via Shiprocket)

---

### Decision 8: Navigation Architecture — Full Keystatic Singleton (Replaces `navigation.ts`)

**Context from `navigation.ts` (current state — already marked DEPRECATED in the file itself):**
```typescript
export const staticNavigation: NavItem[] = [
  { label: "Collections", href: "/collections" },
  { label: "Lookbooks",   href: "/lookbooks" },
  { label: "Journal",     href: "/blog" },
];
export const supportLinks: NavItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns",  href: "/returns" },
  { label: "FAQ",      href: "/faq" },
  { label: "Contact",  href: "/contact" },
];
```

**The problem:** If Brand 2 (Affiliate) doesn't have Lookbooks, a Returns page, or a FAQ — these links are hardcoded in code. You'd have to touch code per deployment. That breaks the engine promise.

**Decision: Create a `settings/navigation" singleton in Keystatic under GENERAL UI.**

**Keystatic GENERAL UI navigation after this change:**
```
GENERAL UI
├── Lookbook Page Settings
└── Navigation Settings    ← new
```

**Singleton path:** `src/content/${brandId}/settings/navigation`
**Format:** JSON

**Schema design:**
```typescript
navigation singleton:
  header:
    shop_trigger_label: fields.text()       // "Shop" — the top-level dropdown trigger
    shop_all_label: fields.text()           // "All Jewellery" — catch-all first item
    nav_links: fields.array(
      fields.object({
        label: fields.text(),
        href: fields.text(),
      })
    )                                       // e.g. Collections, Lookbooks, Journal

  footer:
    shop_column_heading: fields.text()      // "Shop"
    explore_column_heading: fields.text()   // "Explore"
    support_column_heading: fields.text()   // "Support"
    explore_links: fields.array(...)        // Same items as header nav_links — or separate
    support_links: fields.array(...)        // About, Shipping, Returns, FAQ, Contact
```

**Shop category dropdown items in Navbar/Footer remain driven by `taxonomy.json" (unchanged).** The navigation singleton only manages labels and structural links that are NOT product-category-driven.

**Outcome:**
- `src/config/navigation.ts" gets **deleted entirely** after migration
- `Navbar.astro" reads nav structure from `getEntry("settings", "navigation")` + `getEntry("settings", "taxonomy")`
- `Footer.astro" reads footer columns from `getEntry("settings", "navigation")`
- A brand with no Lookbooks simply removes that item from their navigation JSON in Keystatic — **zero code changes**
- The `NavItem` type interface (`{ label, href, items? }`) stays in a shared types file or moves inline

**This is scoped as CHUNK 11A** — it happens after Chunks 1-10 as it's additive new schema work.

---

### CHUNK 11A: Navigation Singleton — Keystatic Migration (INSERT AFTER CHUNK 10)
**Risk:** 🟡 Medium — touches Navbar and Footer (the two most visible components).
**Depends on:** Chunk 2 (Keystatic must work). Chunks 6 and 7 (Logo/SocialLinks atomic fixes should be done first to reduce Navbar/Footer churn).
**Files:**
- `keystatic.config.ts` — add `navigation_settings" singleton
- `src/content/config.ts" — add `navigation" to settings schema
- `src/content/zelia-vance/settings/navigation.json" — create seed file with current labels
- `src/components/features/Navbar.astro" — read from CMS instead of `navigation.ts"
- `src/components/features/Footer.astro" — read from CMS instead of `navigation.ts"
- `src/config/navigation.ts" — **DELETE** after both Navbar and Footer are migrated

**Steps:**
1. Add `navigation_settings" singleton to `keystatic.config.ts` with schema above
2. Add `navigation" to the settings collection in `src/content/config.ts"
3. Create `src/content/zelia-vance/settings/navigation.json" seeded with current values:
   ```json
   {
     "header": {
       "shop_trigger_label": "Shop",
       "shop_all_label": "All Jewellery",
       "nav_links": [
         { "label": "Collections", "href": "/collections" },
         { "label": "Lookbooks", "href": "/lookbooks" },
         { "label": "Journal", "href": "/blog" }
       ]
     },
     "footer": {
       "shop_column_heading": "Shop",
       "explore_column_heading": "Explore",
       "support_column_heading": "Support",
       "explore_links": [
         { "label": "Collections", "href": "/collections" },
         { "label": "Lookbooks", "href": "/lookbooks" },
         { "label": "Journal", "href": "/blog" }
       ],
       "support_links": [
         { "label": "About Us", "href": "/about" },
         { "label": "Shipping", "href": "/shipping" },
         { "label": "Returns", "href": "/returns" },
         { "label": "FAQ", "href": "/faq" },
         { "label": "Contact", "href": "/contact" }
       ]
     }
   }
   ```
4. Update `Navbar.astro": Replace `import { staticNavigation } from '../../config/navigation'` with `getEntry("settings", "navigation")`. Build `dynamicNavigation" from CMS data.
5. Update `Footer.astro": Same replacement for `staticNavigation" and `supportLinks". Use CMS data for all three footer columns.
6. Delete `src/config/navigation.ts"

**Verify:** All Navbar links work (collections, lookbooks, journal). Shop dropdown shows CMS categories. Footer columns render correctly. No TypeScript import errors.

---

### Decision 9: `ecommerce.ts" — Do NOT Touch

**Decision: `src/config/ecommerce.ts" stays exactly as-is. Not a CMS concern.**

`ecommerce.ts" is pure backend configuration — `mapProduct()`, Snipcart data attribute generation, price formatting. It is:
- Working perfectly
- Not editorial content
- Not something a CMS user should see or modify
- Tightly coupled to Snipcart's SDK contract

CMS-ifying this would add complexity with zero benefit. It stays as TypeScript code.

---

### Decision 10: Execution Cadence — Slow, Chunked, Verified

**Decision: We execute one chunk at a time, verifying the dev server and feature after each one before proceeding.**

Rationale: This engine was built over months. The cost of a regression is high. The benefit of moving fast is low. We do this right.
- Each chunk = one logical commit
- Dev server verification after every chunk
- No chunk starts until the previous one is confirmed working
- If a chunk causes unexpected breakage, we stop, diagnose, fix before continuing

---

## SECTION 10 — Updated Execution Order (Final)

```
CHUNK 1   → Event namespace rename (zeliavance:* → engine:*) — 8 files
CHUNK 2   → Keystatic static imports fix + hardcoded strings
CHUNK 3   → BaseLayout title system (pageTitle prop, auto-append brand name)
CHUNK 4   → Page title sweep (all pages use new system)
CHUNK 5   → BaseLayout as data hub (AnnouncementBar + SideDrawer de-fetch)
CHUNK 6   → Navbar → Logo prop chain
CHUNK 7   → Footer → SocialLinks prop chain
CHUNK 8   → TrustSection + ComingSoon de-fetch (page-level fetch)
CHUNK 9   → Snipcart validation DRY fix
CHUNK 10  → FAQ Keystatic migration (PAGE CONTENT singleton)
CHUNK 11A → Navigation singleton (Keystatic GENERAL UI) + delete navigation.ts
CHUNK 11  → Remaining brand strings (Lookbooks, Blog)
CHUNK 12  → Newsletter pages brand strings
CHUNK 13  → Checkout pages brand strings (most_careful — money path)
```

**Dependencies:**
- Chunk 3 must precede Chunk 4
- Chunks 1, 2, 5-9 are independent — any order
- Chunk 10 should follow Chunk 2 (Keystatic must work)
- Chunk 11A should follow Chunks 2, 6, 7
- Chunks 11, 12, 13 are final cleanup — do last
