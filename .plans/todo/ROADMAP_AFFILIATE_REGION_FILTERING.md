# Affiliate Multi-Region Architecture & Integration Plan

## The Motivation: "Soft Prioritization" Over Geo-Blocking
For a global affiliate brand, users should never be legally or technically blocked from viewing the catalog. Instead, the UX should be: **"Show me what is available in my region first, but don't hide anything."** 
If an Indian user visits, Myntra links and INR prices show up. If a US user visits, Amazon links and USD prices show up. If a Canadian product has no Indian equivalent, it still shows on the site, just below the local items in priority.

## Architectural Foundation (Data Model)
Instead of a single `affiliate_url` and `platform`, each product must be capable of holding a regional array.

**Product Schema (Keystatic):**
```json
affiliate_links: [
  { "region": "india", "url": "https://myntra.com/...", "platform": "Myntra", "price": 2999, "currency": "INR" },
  { "region": "global", "url": "https://amazon.com/...", "platform": "Amazon", "price": 34, "currency": "USD" }
]
```

**Global Settings (`settings_affiliate.json`):**
A singleton that sets defaults: default currency for India (`INR`), default currency globally (`USD`), auto-detect toggle, expiry time.

## Execution Phasing (The Roadmap)

### Phase 1: Foundational Data Structure (Active)
1. **Keystatic Update**: Introduce the `affiliate_links` array into the 'Products' schema. Replace the outdated standalone fields.
2. **Astro Schema Update**: Zod typing in `src/content/config.ts` updated to expect the array format.
3. **Singleton Setup**: Introduce `settings_affiliate` and explicitly rename the old ecommerce settings to `settings_store_checkout` (D2C only).

### Phase 2: Core Render Layer (Chunks E & F)
*(Implement immediately after Data Structure)*
1. **Chunk E (PDP Page)**: Modify the `[slug].astro` Add-To-Cart logic. If `PUBLIC_AFFILIATE=true`, read `product.data.affiliate_links`. Grab the `global` or `india` slot (hardcoded fallback to index 0 for now) and render an "External Link" button instead of Snipcart.
2. **Chunk F (Product Cards)**: Update `GlassProductCard` to format the price string based on the first available `affiliate_links` entry.

### Phase 3: The Alpine Region Engine (Future Session)
1. **`region.ts`**: Hook into `Alpine.$persist` (like `wishlist.ts`). Save user preference.
2. **Auto-Detection Strategy**: `navigator.language` heuristic. No cost, 0 latency. 
    - `en-IN` / `hi` => Set default to `india`
    - Everything else => Set default to `global`
3. **Expiry**: Time-stamp the `$persist` storage. Reset every 24 hours to ensure travelers or VPN users get refreshed accurately.

### Phase 4: UI Surfacing
1. **Navigation Switcher**: A subtle UI toggle (Navbar or footer): `🇮🇳 India | 🌍 Global`.
2. **Card Sorting (Optional/Advanced)**: A layout behavior that boosts products matching the active region to the top of category lists.

---
**Status:** PHASE 1 IS CURRENTLY EXECUTING. No UI logic runs until data shape is stable.
