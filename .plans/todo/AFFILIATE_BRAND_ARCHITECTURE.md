# Affiliate Brand Architecture — Implementation Blueprint

**Status:** Planned (Phase 4 — Brand 2 Preparation)
**Context:** This document captures all architectural decisions, psychological research findings, and implementation patterns discussed and agreed upon for supporting `PUBLIC_AFFILIATE=true` brand deployments from the same codebase.
**Do not implement** until Zelia Vance (Brand 1) is fully launched and stable.

---

## 1. What an Affiliate Brand Is

An Affiliate brand is a pure content-and-discovery site. It shows products from external platforms (Myntra, Nykaa, Amazon, etc.) but does NOT sell anything directly.

**Revenue model:** Visitor clicks a product link → gets redirected to the external platform via Cuelinks/Admitad → visitor buys → brand earns commission.

**Two Operating Modes (Strict Engine Requirement):**

| Mode | ENV | Commerce |
|---|---|---|
| `D2C Full` | `PUBLIC_AFFILIATE=false` | Snipcart + Razorpay + Shiprocket |
| `Affiliate` | `PUBLIC_AFFILIATE=true` | No cart. CTA = outbound affiliate link |

*(Note: There is no "Editorial" or any third mode. The codebase only discriminates between D2C and Affiliate.)*

---

## 2. The Single Environment Variable That Gates Everything

```env
# In .env for D2C brand (Zelia Vance):
PUBLIC_AFFILIATE=false

# In .env for an Affiliate brand:
PUBLIC_AFFILIATE=true
```

The `PUBLIC_` prefix is intentional and important. Because of how Astro handles env vars:
- Variables **without** `PUBLIC_` are server-only (`.astro` frontmatter, API routes)
- Variables **with** `PUBLIC_` are exposed to both server AND client (Alpine.js, browser scripts can also read via `import.meta.env.PUBLIC_AFFILIATE`)

For the SideDrawer vs AffiliateQuickView decision, the check happens server-side in `BaseLayout.astro`. The `PUBLIC_` prefix is still correct because future Alpine.js behaviors (like disabling cart-related event listeners) will also need to check this flag on the client.

---

## 3. Component Architecture — The Core Split

### 3A. SideDrawer.astro (D2C Only — `PUBLIC_AFFILIATE=false`)

**File:** `src/components/ui/SideDrawer.astro`
**Used by:** `BaseLayout.astro` when `PUBLIC_AFFILIATE=false`

This component handles all three D2C interaction modes:
1. **Upsell mode** — Triggered after "Add to Cart". Shows recommended add-ons.
2. **Quick-shop mode** — Triggered from product cards. Allows variant selection + Add to Cart without navigating to PDP.
3. **Master-set mode** — Triggered from Lookbook. Allows adding the full curated look to cart at once.

All three modes are tightly coupled to Snipcart's data attributes, variant sync (`options-sync.ts`), and the `engine:*` event bus. **Never modify this component for affiliate purposes.** Keep it pure.

### 3B. AffiliateQuickView.astro (Affiliate Only — `PUBLIC_AFFILIATE=true`)

**File (to be created):** `src/components/ui/AffiliateQuickView.astro`
**Used by:** `BaseLayout.astro` when `PUBLIC_AFFILIATE=true`

This is a new, simpler panel. It handles ONE mode:
- **Quick view** — Triggered from product cards. Shows product images, description, price (for reference), and a single CTA: the affiliate outbound link.

**Key differences from SideDrawer:**
- No Snipcart classes (`snipcart-add-item`) anywhere
- No variant selectors (no cart to add to)
- No FreeShippingNudge (no cart, no shipping threshold)
- No "Add to Bag" / "Processing..." spinner
- No upsell or master-set modes exist
- Footer CTA is `<a href="[cuelink-url]" target="_blank" rel="noopener noreferrer">Shop on Myntra →</a>`
- Tracks clicks via Cuelinks/Admitad redirect URL wrapped around the product URL

**DOM ID:** `engine-quick-view` (not affiliate-specific — the name describes the function, not the consumer. A D2C brand could use this panel someday too.)

### 3C. BaseLayout.astro — The Conditional Gatekeeper

The import and render logic lives here:

```astro
---
const isAffiliate = import.meta.env.PUBLIC_AFFILIATE === 'true';
---

{isAffiliate ? (
  <AffiliateQuickView />
) : (
  <SideDrawer threshold={threshold} />
)}
```

When `isAffiliate` is `true`, Astro's build system does NOT include `SideDrawer.astro`'s code in the output bundle. It's tree-shaken out entirely. Same in reverse. One build = one brand. No dead code.

---

## 4. Integration Gating — What Gets Loaded Per Mode

| Feature / Script | D2C (`false`) | Affiliate (`true`) |
|---|---|---|
| Snipcart JS | ✅ Loaded globally | ❌ Not loaded |
| Razorpay bridge (`/checkout/razorpay`) | ✅ Active | ❌ Not built / gated |
| Shiprocket webhook handler | ✅ Active | ❌ Not needed |
| MailerLite order sync | ✅ Active | ❌ No orders |
| `SideDrawer.astro` | ✅ Rendered | ❌ Not imported |
| `AffiliateQuickView.astro` | ❌ Not imported | ✅ Rendered |
| `WishlistButton.astro` | ✅ Active | ⚠️ Optional (wishlist can be useful for affiliates too) |
| `AnnouncementBar.astro` | ✅ Active | ✅ Active (can announce sales, new collections) |
| `FreeShippingNudge.astro` | ✅ Shown in drawer | ❌ Hidden (no shipping for affiliates) |
| Cuelinks / Admitad script | ❌ Not loaded | ✅ Loaded globally |
| `engine:item-added` event | ✅ Active | ❌ Never fires |
| `engine:quick-shop` event | ✅ Triggers SideDrawer | ⚠️ Renamed to `engine:quick-view`, triggers AffiliateQuickView |

---

## 5. Affiliate Outbound Links — The Rules

Every product CTA on an affiliate brand must:

1. **Use Cuelinks/Admitad wrapped URL** — not the direct Myntra/Nykaa URL. The unwrapped link earns no commission.
2. **Open in a new tab** — `target="_blank"` (standard and correct for outbound commerce links)
3. **Always include** `rel="noopener noreferrer"`:
   - `noopener` — Security. Prevents the new tab from accessing your page's `window` object.
   - `noreferrer` — Privacy and clean analytics. Cuelinks/Admitad tracking works via their own redirect chain, NOT via browser referrer headers. Using `noreferrer` does NOT break affiliate tracking. Your commission is safe.

```html
<!-- Correct affiliate link pattern -->
<a 
  href="https://go.cuelinks.com/api/url?your-tracking-params-here"
  target="_blank"
  rel="noopener noreferrer"
>
  Shop on Myntra →
</a>
```

---

## 6. What an Affiliate Brand DOES Need (Don't Strip These)

The tendency when building an affiliate brand is to strip everything. Resist this. Keep:

| Feature | Why |
|---|---|
| **Lookbooks** | "Shop This Look" → affiliate links per product. Proven high-conversion pattern. |
| **Blog/Journal** | Organic SEO traffic drives affiliate clicks. Content = commission fuel. |
| **Navigation Singleton** | Fully CMS-driven. Affiliate brand simply removes "Cart" link from their nav JSON. Zero code changes. |
| **Product Detail Pages (PDP)** | SEO + context. The PDP is WHERE the affiliate CTA lives. |
| **Collections/Category Pages** | Product discovery and browsing. Keep. |
| **Search** | Fuse.js client-side search works fine for affiliates. Keep. |
| **Wishlist** | Optional but useful — "save for later, buy on Myntra when you're ready." |
| **Newsletter** | MailerLite integration still valid for affiliate marketing emails. |
| **AnnouncementBar** | Announce sales, new arrivals, platform-specific promos. Valid. |

---

## 7. Product Data for Affiliate Brands

The product MDX schema needs one new field for affiliate brands:

```yaml
---
title: "Gold Ring"
price: 1299              # Reference price only — not charged. Myntra may differ.
category: "Rings"
tags: ["minimalist", "gold", "everyday"]
availability: ["IN"]     # Geo-availability for future geo-filtering
affiliate_url: "https://go.cuelinks.com/..."    # NEW — the tracked outbound CTA link
images: [...]
---
```

Key decisions:
- `price` stays in the schema but is used as a **reference display price** only. The actual transactional price is on Myntra/Nykaa. The displayed price sets expectation ("around ₹1,299 on Myntra").
- `affiliate_url` is the Cuelinks/Admitad wrapped URL. **Never store the unwrapped direct URL** in production data.
- `availability` — for future geo-filtering via `request.cf.country` (see `ROADMAP_MULTI_CURRENCY.md` for the Cloudflare edge approach).

---

## 8. Related Products Logic — Finalized Architecture

This section also applies to D2C brands. It came out of the affiliate discussion but the algorithm decisions apply universally.

### 8A. PDP Page — Tag-Based Jaccard Similarity

**Intent:** "I like this style. Show me more like it."

The human psychology here: When someone views a product, they're expressing aesthetic intent through tags, not product type. A person looking at "Minimalist Gold Ring" wants more "Minimalist" and "Gold" things — not necessarily more rings.

**Algorithm:**

```
For each candidate product (excluding current):
  sharedTags = count of tags that appear in BOTH products
  totalUniqueTags = count of all unique tags across both products
  score = sharedTags / totalUniqueTags   ← Jaccard Similarity

Sort candidates by score descending.
If fewer than 4 results with score > 0:
  backfill with Fisher-Yates shuffled remaining products until 4 total.
Return top 4.
```

**Why no category filter:** Category is a blunt instrument. Tags capture aesthetic intent. A "Statement Necklace" (different category) with 3 shared tags is more relevant than a "Statement Ring" (same category) with 0 shared tags.

### 8B. Category Page — Cross-Category Discovery

**Intent:** "I'm browsing Rings but maybe something else will catch my eye."

**Algorithm:**

```
Filter: products NOT in current category.
Shuffle using Fisher-Yates (not Math.random() sort — it's biased).
Slice: take first 4.
```

**Why Fisher-Yates matters:** The current `.sort(() => 0.5 - Math.random())` in the codebase is biased. Due to how sorting algorithms internally compare elements, some products end up in certain positions far more often than others. This means the same few products dominate the "Pair With Your Selection" section repeatedly. Fisher-Yates produces a truly uniform random distribution — every possible ordering is equally likely.

```typescript
// Fisher-Yates — the correct shuffle
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]; // don't mutate original
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

This utility should live in `src/scripts/utils/shuffle.ts` (pure function, no DOM access — correct layer per AGENTS.md).

---

## 9. Implementation Chunks (When Ready)

```
CHUNK A  → Create AffiliateQuickView.astro (new component)
CHUNK B  → Gate BaseLayout.astro: conditional SideDrawer vs AffiliateQuickView import
CHUNK C  → Gate Snipcart script load (only when PUBLIC_AFFILIATE=false)
CHUNK D  → Add affiliate_url field to product schema in Keystatic + content/config.ts
CHUNK E  → Update PDP CTA: conditionally render Snipcart AddToCart OR affiliate link
CHUNK F  → Update GlassProductCard: conditionally render quick-shop trigger OR quick-view trigger
CHUNK G  → Migrate Related Products to Tag Jaccard Similarity (PDP) + Fisher-Yates (Category)
CHUNK H  → Add shuffle.ts utility to scripts/utils/
CHUNK I  → Keystatic CONTENT nav group restore (products, lookbooks, blog, pages, collections_grid)
```

Dependencies:
- Chunks A → B → C are sequential (build in order)
- Chunks D → E are sequential (schema first, then UI)
- Chunks G → H: H must come before G (utility needed by G)
- Chunk I is standalone and low-risk — can be done anytime

---

## 10. What We Are NOT Doing

| Item | Reason |
|---|---|
| Creating separate route files per brand | Navigation singleton handles this. Remove links from CMS JSON, not from code. |
| Namespacing component IDs with `affiliate-` prefix | IDs describe function, not consumer. `engine-quick-view` is correct. |
| Storing unwrapped Myntra/Nykaa URLs in product data | Bypasses affiliate tracking. Always use Cuelinks/Admitad wrapped URLs. |
| Separate `SideDrawer.astro` for affiliate | A fully new `AffiliateQuickView.astro` is cleaner. Never modify the D2C drawer. |
| Implementing geo-filtering now | See `ROADMAP_MULTI_CURRENCY.md`. `request.cf.country` is the right approach when ready. |

## 11. UI Architecture & Keystatic Enhancements

### 11A. The Modal Primitive
Currently, `PopupModal.astro` handles both discount logic and newsletter logic implicitly. We will extract the core modal functionality into a foundational primitive (e.g., `BaseModal.astro`). This allows us to instantiate separate components:
- `PopupCoupon.astro` (for discounts — strictly D2C)
- `PopupNewsletter.astro` (for signups — universally used)

**Keystatic Grouping:** To prevent deeply nested clutter, the `Marketing & Conversion` Keystatic singleton will act as a well-organized hub containing distinct blocks for:
- Announcement Bar (Message, Link, Enable/Disable)
- Discount Popup (Offer text, Coupon Code, Enable/Disable)
- Newsletter Popup (Heading, Subtext, Enable/Disable)

### 11B. Keystatic Dynamism (Conditional Schemas)
The engine will leverage Node.js runtime logic within `keystatic.config.ts` to dynamically show/hide fields based on the `PUBLIC_AFFILIATE` flag:
```javascript
const isAffiliate = import.meta.env.PUBLIC_AFFILIATE === 'true';

// Inside the product schema:
...(isAffiliate ? {
  affiliate_url: fields.url({ label: 'Affiliate Outbound Link (Any Network)' })
} : {
  stock_count: fields.number({ label: 'Inventory' }),
  price_modifiers: fields.text({ label: 'Price Modifiers' })
})
```
This ensures a pristine, uncluttered dashboard for the content manager without needing "(affiliate only)" labels.

### 11C. Global Availability & Generic URLs
- **`affiliate_url`:** This field is generic. It serves Cuelinks, Admitad, Amazon Associates, or any custom referral link equally.
- **`availability`:** Implemented as a Keystatic `fields.multiselect` (e.g., `["IN", "US", "UK", "GLOBAL"]`). This allows an affiliate brand to instantly scale globally on Day 1 by simply tagging which markets the external vendor supports.

### 11D. Buttons & "Add Set to Cart"
- Standard buttons on the PDP will change their tag semantic (`<Button as="a" href="...">`) to act as outbound links for affiliates.
- **"Add Set to Cart":** This strictly implies a shopping cart. In affiliate mode, this button is **omitted entirely**. Lookbooks will instead list the individual items underneath, each sporting their own generic affiliate link button.

## 12. Minor Notes / Future Tasks
- **Image.astro sizes optimization:** A known future performance task. `sizes="100vw"` defaults force full-width image downloads for thumbnails in product galleries. This should eventually be updated at the component call-site to pass `sizes="(max-width: 768px) 50vw, 25vw"` to squeeze maximum performance out of the gallery.
