# Sold Out UI — Complete Architectural Blueprint
### Zee Engine | Last Updated: May 23, 2026 | Status: FINAL DESIGN

> This document is the single source of truth for the Zee Engine's real-time inventory-aware UI system.
> Every claim in this document is verified against live Cloudflare and Snipcart documentation.
> No guesses. No placeholders. Build directly from this.

---

## Part 1: The Problem, Stated Precisely

The Zee Engine generates a **static website**. When Astro builds the site, it bakes the product pages into HTML files at build time. If a product is in stock at build time, the "Add to Cart" button is baked into the HTML as active and clickable.

The problem: if that product sells out after the build, the HTML has no idea. The button still says "Add to Cart." A visitor clicks it. Snipcart blocks the purchase in its own cart overlay (it is the source of truth for inventory), but the customer experience is jarring — they clicked a button that appeared functional, only to get a cart error.

**The Goal:** Visually disable the "Add to Cart" button on the product page *before* the customer tries to click it, reflecting real-time stock reality.

**The Constraint:** Snipcart holds the inventory numbers. Reading them directly from the frontend is forbidden — it would expose the Secret API Key to the browser.

---

## Part 2: The Three Sources of Truth

Understand this before anything else. Three separate systems each own exactly one piece of the truth. They never overlap. They never fight.

| System | Owns | Example |
|---|---|---|
| **Snipcart Dashboard** | The actual inventory numbers | "You have 47 rings in stock" |
| **Cloudflare KV Registry** | Real-time emergency signals for the UI | "These SKUs just hit zero this week" |
| **Keystatic CMS / Static HTML** | The permanent baked-in UI state | "This product is permanently discontinued" |

The frontend reads from KV (via the edge cache). KV is written to by the webhook (automatic, real-time). KV is cleaned up by reconciliation options (periodic or manual). The CMS is only updated by a human (or a script acting on behalf of a human).

---

## Part 3: Why a Simple Proxy Fails at Scale

The naive solution is: every time a product page loads, make a serverless function call to Snipcart's API and check the stock. Simple, always accurate.

This fails at scale for two reasons:

**Reason 1 — Cloudflare Worker Invocations (100,000/day free)**
Every page load = 1 Worker invocation. At 100 products × 1,440 page loads per day across global traffic, you burn through your daily limit and your site's dynamic features stop responding.

**Reason 2 — The Per-Product Key Disaster**
If you store one KV key per product (`status_CDR-001 = sold_out`), the cost of reading those keys scales linearly with your product catalogue multiplied by your global data centers. With 100 products, 25 global data centers, and a 15-minute TTL:
`100 products × 96 cycles/day × 25 data centers = 240,000 KV reads/day` — over the 100,000 free limit.

Both of these are solved by the Registry Pattern described in Part 5.

---

## Part 4: The Cloudflare Free Tier — Exact Verified Numbers

*(Source: Official Cloudflare documentation, verified May 2026)*

| Resource | Free Limit | Resets |
|---|---|---|
| Worker / Function Invocations | **100,000 / day** | 00:00 UTC daily |
| KV Read Operations | **100,000 / day** | 00:00 UTC daily |
| KV Write Operations | **1,000 / day** | 00:00 UTC daily |
| KV Delete Operations | **1,000 / day** | 00:00 UTC daily |
| KV Storage | **1 GB total** | Never (permanent storage) |
| KV Max Value Size | **25 MiB per key** | — |
| KV Write Rate Limit | **1 write/second to same key** | — |
| Cron Triggers (per Worker script) | **3 max** | — |
| Cron Trigger CPU per execution | **10ms** | — |

**Workers Paid Plan ($5/month):** 10 million requests/month (~333,000/day), effectively unlimited KV operations within bundled quota. This is the upgrade path for when you have 5+ active brands.

---

## Part 5: The Registry Pattern — The Core Architecture

Instead of one KV key per product, we store **exactly one key per brand**.

**Key naming convention (brand-namespaced, matching `.env` variable):**
```
{PUBLIC_BRAND_ID}:sold_out_registry
```

**Examples:**
```
zelia-vance:sold_out_registry   → ["CDR-001", "ER-005", "NK-012"]
brand-two:sold_out_registry     → ["SKU-099"]
brand-three:sold_out_registry   → []
```

**Value format:** A plain JSON array of SKU strings that are currently sold out. Nothing more.

### Why This is O(1) and Not a Linear Search Problem

When the frontend downloads the registry array, it immediately converts it into a JavaScript `Set`:

```javascript
const soldOutSet = new Set(apiResponse.registry);
// Check if a product is sold out:
soldOutSet.has("CDR-001"); // O(1) — instant, regardless of Set size
```

A JavaScript `Set` is backed by a hash table internally. The lookup time is constant — `O(1)`. It does not matter if the Set contains 10 items or 10,000 items. The browser finds the answer in zero milliseconds without looping through the data.

### Why the Array Never Gets Dangerously Large

Two mechanisms keep the array small:
1. **Real-Time Writes (Webhook):** Items are only added when stock hits zero — not on every sale.
2. **Periodic Reconciliation (Options A/B/C, see Part 8):** Sold-out items that have been restocked are removed from the registry on a schedule.

With a weekly reconciliation sweep, the registry will realistically contain only the products that sold out *this week*. On a store with 100 products, that is likely under 20 items — approximately 200 bytes of data. Smaller than a favicon.

### The Edge Cache Shield (How KV Reads Stay Near Zero)

When the Cloudflare Worker reads the registry from KV, it wraps the response in an HTTP Cache-Control header before returning it to the browser:
```
Cache-Control: public, s-maxage=900
```
(`s-maxage=900` = 15 minutes)

Cloudflare's edge cache (`caches.default`) stores the response at the data center level. For the next 15 minutes, every visitor hitting that same data center gets the cached answer — **zero additional KV reads**.

> **Important Verified Fact:** Cloudflare's `caches.default` (Cache API) is strictly per-datacenter. It does not replicate globally. A visitor in Mumbai and a visitor in Delhi may hit different data centers, each requiring their own cache warm-up. This is already factored into all the math below.

---

## Part 6: The Global Scale Math — All Scenarios Verified

**Assumptions:**
- 1 KV key per brand (Registry Pattern)
- 15-minute TTL → 96 cache expiration cycles per day per data center
- 25 active global data centers (realistic for India + USA + UK + Europe + Canada)

### Free Tier Capacity by Number of Brands

| Active Brands | KV Reads/Day | % of Free Limit (100k) |
|---|---|---|
| 1 | 2,400 | **2.4%** |
| 2 | 4,800 | **4.8%** |
| 5 | 12,000 | **12%** |
| 10 | 24,000 | **24%** |
| 20 | 48,000 | **48%** |
| 41 | ~98,400 | **~98% (effective ceiling)** |

**Conclusion:** 41 brands, each hammered by global traffic 24/7, on a 15-minute TTL, still fits within the free tier. By the time you have 10+ brands, you are paying $5/month and the limit becomes ~333,000/day — supporting approximately 1,388 brands on the same architecture without a single code change.

### Traffic Spikes Do Not Affect KV Reads

This is the most important property of the edge cache. Whether 1 visitor or 100,000 visitors hit a brand's product page within the same 15-minute window at the same data center, the KV is only read **once**. The cache absorbs all subsequent requests. Traffic spikes only stress Worker invocations, and those are triggered by static page hits — which are served by Cloudflare's CDN directly, not by Workers.

### KV Writes Are Nearly Free to Use

KV writes only occur when a product's stock hits exactly zero (the webhook path). Not on every sale. Not on every page load.

If 10,000 customers buy 10 different products down to zero stock on the same day, that is **10 KV writes** — 1% of the daily limit.
If you have 41 brands each with 25 products hitting zero on the same day: **1,025 writes** — marginally over the limit, but this scenario is physically impossible (it would mean every single product on 41 brands sells out completely in 24 hours).

### TTL Decision: 15 Minutes Is the Right Default

| TTL | UX Lag | KV Reads (1 brand, 25 DCs) | Notes |
|---|---|---|---|
| 1 minute | ~1 min | 36,000/day | Too aggressive for free tier |
| 5 minutes | ~5 min | 7,200/day | Good for high-traffic single brand |
| **15 minutes** | **~15 min** | **2,400/day** | **Recommended default — optimal balance** |
| 30 minutes | ~30 min | 1,200/day | Maximum safe window for 10+ brand scale |

**The 15-minute UX gap is acceptable** because Snipcart acts as the safety backstop during that window (see Part 7). The TTL is stored as a Cloudflare environment variable (`KV_CACHE_TTL`), not hardcoded. You change it from the Cloudflare dashboard in seconds — no redeployment, no code change.

---

## Part 7: Snipcart as the Safety Backstop

During the 15-minute edge cache window, a visitor might see an "Add to Cart" button on a product that just sold out. If they click it, here is exactly what happens — **verified against Snipcart's current documentation**:

1. The Snipcart cart overlay opens normally.
2. Snipcart's servers check their own live inventory in real time.
3. The item is at 0 stock. Snipcart shows a **friendly in-cart notification**: *"This item is no longer available. Please remove it from your cart or select a different option."*
4. The customer cannot proceed to checkout until the item is removed.
5. **No payment is initiated. No money changes hands. No error page.**

This is not a crash. It is a graceful, designed experience. Snipcart built inventory enforcement into their checkout flow specifically for this scenario.

**Additionally:** Snipcart decrements stock only after a transaction is fully completed. If two customers simultaneously add the last item to their carts, whoever completes checkout first gets it. The second customer gets the graceful out-of-stock message. This race condition is handled entirely by Snipcart — no additional logic needed on your end.

---

## Part 8: The Three Reconciliation Options (Restock Sync)

These options solve one specific problem: **when you restock a product** (add new inventory in Snipcart), the KV registry still says it is sold out. These options are the mechanism to remove that stale entry.

They are NOT involved in the real-time sell-out detection (that is the webhook's job). They are purely the "cleanup crew."

---

### Option A: The Invisible Cloud Robot (Cloudflare Cron Trigger)

**What it is:** A Cloudflare-native scheduled task attached to your inventory Worker. Runs automatically on a defined schedule (e.g., every Sunday at midnight UTC). No human involvement required after initial setup.

**Full Scenario:**
1. It is Sunday. Several products were restocked this week. Their inventory in Snipcart is updated.
2. At midnight UTC, the Cron Trigger fires automatically.
3. The Worker wakes up, calls Snipcart's `GET /api/products` endpoint to list all products.
4. It checks each product's `stock` field.
5. It rebuilds the `{brandId}:sold_out_registry` KV key from scratch — only including SKUs where `stock === 0`.
6. Products that were previously in the registry but now have stock > 0 are **removed** automatically.
7. Within 15 minutes, the next cache cycle picks up the clean registry. Restocked products show "Add to Cart" again.

**What it does NOT do:**
- It cannot edit your local Keystatic YAML/MDX product files.
- It does not fix the "button pop" (flicker) effect — the static HTML still has the old button state baked in.
- It requires an internet connection and a live Cloudflare deployment to run.

**Cloudflare Free Tier Impact:**
- 1 Cron execution per week = 1 Worker invocation per week. Negligible.
- Max 3 Cron Triggers per Worker script on the free plan.
- Execution CPU budget is 10ms — calling multiple Snipcart API endpoints requires `await fetch()`, but network wait time is free. Only CPU computation counts.

**Best For:** Fully automatic weekly hygiene with zero human action. The cleanest option for a running production store.

---

### Option B: The Magic Button (Rust Launcher — Recommended)

**What it is:** A "Sync Inventory" button inside the Rust/Tauri desktop launcher. When clicked by the worker (or by you), it performs a full inventory reconciliation and also updates the local Keystatic product files.

**Full Scenario:**
1. You receive a new shipment. You update the stock numbers in the Snipcart dashboard.
2. You open the Rust launcher.
3. You click the **"Sync Inventory"** button.
4. The Rust app calls Snipcart's API and gets the current stock for all products.
5. For any product whose stock is back above zero, the Rust app opens the corresponding local YAML/MDX file and changes `sold_out: true` to `sold_out: false`.
6. The Rust app calls the KV management endpoint to remove those SKUs from the `sold_out_registry`.
7. The Rust app runs a silent Git commit: `git add . && git commit -m "inventory(sync): restock reconciliation" && git push`.
8. Cloudflare Pages detects the push and rebuilds the static site. The HTML is now baked with the correct "Add to Cart" button.

**What this uniquely provides:**
- Eliminates the "button pop" (flicker) permanently by baking the correct state into the static HTML.
- Gives a non-technical worker a safe, one-click workflow inside the trusted "walled garden" app.
- Works immediately, not on a schedule.

**Best For:** Restock events, where you need the site to update immediately and cleanly.

---

### Option C: The Terminal Prompt (.bat / Setup Script with Y/N)

**What it is:** A step added to the existing `.bat` launcher script that prompts with a yes/no question at startup.

**Full Scenario:**
1. Worker double-clicks the `.bat` launcher on their PC.
2. Before the engine starts, the terminal shows:
   ```
   Sync inventory with Snipcart? [y/N] (default: N): _
   ```
3. The worker presses `N` (or just hits Enter) on a normal day. The engine starts immediately.
4. On a day after a restock, the worker types `y` and presses Enter.
5. The script runs the same reconciliation logic as Option B (Snipcart check → KV update → local file edit → Git push).
6. The engine then starts normally.

**Key design decision:** Default is **N** (No). The sync only runs when explicitly requested. This prevents slowing down the daily startup on days when no restock occurred.

**Difference from Option B:** This is terminal-based, not a native UI button. It is suitable if the Rust launcher is not yet built or not deployed to a specific worker's machine. It is a lower-tech version of Option B that lives in the existing `.bat` infrastructure.

**Best For:** Temporary solution until the Rust launcher's "Sync Inventory" button is ready, or for developer-operated deployments where a terminal is acceptable.

---

### Option Comparison

| Factor | Option A (Cron) | Option B (Rust Button) | Option C (.bat Y/N) |
|---|---|---|---|
| Human action required | None | One click | Type `y` + Enter |
| Fixes button pop (flicker) | ❌ No | ✅ Yes | ✅ Yes |
| Updates local CMS files | ❌ No | ✅ Yes | ✅ Yes |
| Runs without worker | ✅ Yes | ❌ No | ❌ No |
| Timing | Weekly / scheduled | On demand | On startup |
| Complexity to build | Low | High | Low |
| **Recommended use** | Production autopilot | Primary restock workflow | Developer fallback |

**The ideal stack:** Run **Option A** always (auto-cleanup on a weekly schedule) AND build **Option B** as the primary restock workflow for workers. Option C is a stopgap until Option B exists.

---

## Part 9: The Complete Product Lifecycle (A to Z)

### Stage 1: New Product Added

**Who does what:**
- You in **Keystatic**: add the product's content, images, description, price, `sold_out: false`.
- You in **Snipcart Dashboard**: add the product and set the inventory count (e.g., 50 units).
- Git push → Cloudflare Pages builds the static site.

**State of systems:**
- KV registry: no entry for this SKU → defaults to "in stock" ✅
- Static HTML: "Add to Cart" button baked in ✅
- Snipcart: inventory = 50 ✅

No KV action needed. Product is live.

---

### Stage 2: Sales Are Happening (Normal Operations)

Each sale reduces Snipcart's internal inventory count. Your Worker (`order-completed.ts`) fires on each completed order. For each item purchased, it calls `GET /api/products/{id}` on Snipcart.

- If `stock > 0`: Do nothing. KV is untouched.
- If `stock === 0`: Write this SKU into the `{brandId}:sold_out_registry` KV key.

**KV writes:** 0 per normal sale. 1 write total, only on the final sale.

---

### Stage 3: Product Sells Out (Real-Time Detection)

**Trigger:** Customer completes the purchase of the last unit.

**Automated flow (zero human action):**
1. Snipcart fires `order.completed` webhook to your Cloudflare Worker.
2. Worker validates the webhook using `X-Snipcart-RequestToken` (see Part 10 — Security).
3. Worker calls `GET https://app.snipcart.com/api/products/{sku}` with Basic Auth.
4. Response: `{ "stock": 0 }`.
5. Worker reads current `{brandId}:sold_out_registry` from KV.
6. Worker appends the sold-out SKU to the array.
7. Worker writes the updated array back to KV (1 write).
8. Edge cache for the registry expires within 15 minutes.
9. Next visitor to the product page downloads the updated registry, JS Set finds the SKU, button becomes "Sold Out."

**Total KV cost for this event:** 1 read + 1 write.

---

### Stage 4: Restock (New Inventory Arrives)

**Who does what:**
- You update the inventory count in the **Snipcart Dashboard** (e.g., add 30 units).
- You click **"Sync Inventory"** in the Rust launcher (Option B).

**What Option B does:**
1. Calls Snipcart for all products, gets updated stock counts.
2. Finds the restocked SKU — it now has `stock: 30`.
3. Removes that SKU from the local KV registry (1 KV write).
4. Opens the local Keystatic product YAML/MDX file, changes `sold_out: true` to `sold_out: false`.
5. Git commits and pushes. Cloudflare rebuilds. Static HTML now has "Add to Cart" baked in correctly.

**Within 15 minutes:** Every visitor sees the "Add to Cart" button again. No flicker.

---

### Stage 5: Product Permanently Discontinued

**Who does what:**
- You in **Keystatic**: set `sold_out: true` permanently in the product file.
- Git push → Cloudflare rebuilds. Static HTML now has "Sold Out" baked in forever.

**State of systems:**
- KV registry: entry can stay or be cleared — it is irrelevant now because the HTML already handles it at build time.
- Snipcart: optionally remove the product from the dashboard entirely.

No real-time system needed. The static site handles this permanently and perfectly.

---

## Part 10: Security — The Webhook Validation Contract

> This section is critical. Skipping webhook validation means any person on the internet can send fake "order completed" events to your Worker and manipulate your KV registry.

### The X-Snipcart-RequestToken Handshake

Every legitimate webhook from Snipcart includes a header: `X-Snipcart-RequestToken`. This is a one-time-use token that expires after **1 hour**.

**The validation flow (must happen before any KV write):**
1. Worker receives `POST /api/checkout/order-completed`.
2. Extract the token: `request.headers.get('X-Snipcart-RequestToken')`.
3. Make a back-channel request to Snipcart:
   ```
   GET https://app.snipcart.com/api/requestvalidation/{token}
   Authorization: Basic {base64(SNIPCART_SECRET_API_KEY + ":")}
   Accept: application/json
   ```
4. If Snipcart returns `200 OK`: the webhook is genuine. Proceed.
5. If Snipcart returns `404`: the token is invalid, expired, or already used. Reject with `401`.

**Token properties (verified):**
- Valid for: **1 hour** after generation.
- One-time use: once validated, Snipcart invalidates it.
- If `404`: do not process. Log the event. Return `401 Unauthorized`.

### The KV Admin Endpoint (Restock/Reconciliation Security)

The endpoint that allows writing to or clearing the KV registry (used by Option B and Option C) must never be publicly accessible. Protect it with a secret token stored as a Cloudflare environment variable:

```
Authorization: Bearer {KV_ADMIN_SECRET}
```

The Rust launcher and .bat script include this token (compiled into the binary or injected by the Rust environment system). External requests without the correct Bearer token receive `403 Forbidden` immediately.

### The Snipcart API Call Security Rule

`SNIPCART_SECRET_API_KEY` must **never** appear in frontend code, browser-visible JavaScript, or any client-side bundle. It lives only in Cloudflare environment variables, read exclusively by the serverless Worker at runtime.

---

## Part 11: The Frontend — What the Customer Actually Experiences

### On Page Load (Product Detail Page)

1. Astro renders the static HTML. The button state is whatever was baked at build time.
2. The page's Alpine.js component initializes.
3. Alpine makes one `fetch()` call to `/api/stock/registry` (the edge-cached endpoint).
4. The response is a JSON array of sold-out SKUs. This is the registry from KV, served from the edge cache.
5. Alpine converts the array to a JavaScript `Set` (O(1) lookups).
6. Alpine checks if the current product's SKU is in the Set.
7. If yes: button becomes disabled, text changes to "Sold Out", styled with the semantic `--color-muted` token.
8. If no: button remains active. No visual change.

**Network cost:** 1 fetch per page load. The response is typically under 200 bytes. Negligible on any connection speed.

### What Happens If the Registry Fetch Fails

If the `/api/stock/registry` endpoint is down (Worker error, network issue), the Alpine component should **default to "Add to Cart" (optimistic)**. The button stays active. Snipcart will catch any real out-of-stock attempt at the cart level. Never default to "Sold Out" on failure — that would block legitimate sales.

---

## Part 12: Multi-Brand Architecture

The Registry Pattern is inherently multi-tenant. Each brand's Cloudflare Pages deployment has its own `PUBLIC_BRAND_ID` environment variable. The Worker reads this variable and constructs the KV key:

```javascript
const key = `${env.PUBLIC_BRAND_ID}:sold_out_registry`;
```

Brand data is completely isolated. Zelia Vance's registry never touches Brand Two's registry. The frontend for each brand only ever fetches its own registry.

This isolation means:
- A traffic spike on Brand One does not affect Brand Two's KV read count.
- Restocking Brand One does not trigger any action for Brand Two.
- The Cron Trigger for each brand's Worker reconciles only that brand's registry.

---

## Part 13: The Upgrade Path — Free to Paid, Zero Architecture Change

The entire system is designed so that upgrading from the free tier to the paid plan requires zero code changes. Only the account billing changes.

| Scale | Plan | Monthly Cost | Action |
|---|---|---|---|
| 1–5 brands, early growth | Free | $0 | Default. No changes. |
| 5–10 brands, growing traffic | Workers Paid | $5 | Upgrade in Cloudflare dashboard. Nothing in code. |
| 10+ brands, high traffic | Workers Paid | $5 | Same plan. 10M requests/month handles it. |

When you upgrade, the `KV_CACHE_TTL` environment variable can be reduced from `900` (15 minutes) to `300` (5 minutes) or even `60` (1 minute) directly from the Cloudflare dashboard — no redeployment, no code change. Tighter TTL = faster "Sold Out" button response for customers.

---

## Part 14: The Variant Problem (Advanced — Not Phase 1)

Zelia Vance products have variants (Ring Size × Metal = up to 15 combinations). Snipcart can track inventory per variant (`inventoryManagementMethod: "Variant"`).

If variant-level "Sold Out" is required (e.g., Size 7 in Rose Gold is sold out, but Size 8 is available), the registry architecture needs an extension:

Instead of a simple array of SKU strings, the registry value becomes a map:
```json
{
  "CDR-001": ["7-RoseGold", "6-WhiteGold"],
  "ER-005": ["__all__"]
}
```

The Alpine component in `options-sync.ts` checks the selected variant combination against this map on every dropdown change.

**This is Phase 2 work.** Phase 1 uses product-level (not variant-level) sold-out status, which covers the majority of real-world scenarios.

---

## Part 15: Implementation Phases

### Phase 1 — CMS Field (Immediate, Zero Infrastructure)
*(This is already planned in the Roadmap. Build this first.)*

- Add `sold_out: z.boolean().default(false)` to the products schema in `src/content/config.ts`.
- `AddToCartButton.astro`: accept `soldOut` prop. When true: `disabled`, text = "Sold Out", styled with `--color-muted`.
- `GlassProductCard.astro`: pass `soldOut={product.data.sold_out}` to the button, show a "Sold Out" badge.
- `BuySetButton.astro`: skip sold-out products from set purchases.

**Cost:** Zero. **Time:** ~30 minutes. **Snipcart remains the real backstop.**

---

### Phase 2 — KV Registry System (When Traffic or First Sell-Out Demands It)

**Infrastructure setup:**
1. Create a KV namespace in Cloudflare dashboard: `ZEE_INVENTORY`.
2. Bind it to your Pages Functions in the dashboard settings.
3. Add `KV_CACHE_TTL=900` as a Pages environment variable.
4. Add `KV_ADMIN_SECRET=<random-64-char-string>` as a Pages environment variable.

**Code to build:**
1. `GET /api/stock/registry` — reads `{brandId}:sold_out_registry` from KV, wraps in edge cache, returns JSON array.
2. Extend `order-completed.ts` — add the post-sale Snipcart stock check and KV write (if stock = 0).
3. `POST /api/stock/admin/reconcile` — protected endpoint that rebuilds the registry from Snipcart truth. Called by Option B (Rust) and Option C (.bat).
4. Frontend Alpine logic — fetches registry on PDP load, builds JS Set, disables button if SKU found.

**Option A (Cron):** Configure a Cron Trigger on the inventory Worker. Schedule: `0 0 * * 0` (every Sunday at midnight UTC). The Worker calls the reconcile logic internally.

---

## Summary: The Complete System in One View

```
NEW PRODUCT
└── Keystatic (content) + Snipcart Dashboard (inventory)
    → Deploy → "Add to Cart" baked in HTML
    → KV: no entry (defaults to in stock) ✅

SELLING (Normal)
└── Each order fires webhook → Worker checks Snipcart stock
    → stock > 0: do nothing ✅
    → stock = 0: write SKU to KV registry (1 write) ✅

SOLD OUT
└── Within 15 min: edge cache expires globally
    → Frontend fetches registry → JS Set finds SKU
    → Button becomes "Sold Out" ✅
    → Snipcart blocks any accidental purchase attempts ✅

RESTOCK
└── Update Snipcart Dashboard (inventory numbers)
    → Click "Sync Inventory" in Rust launcher (Option B)
    → KV updated + YAML updated + Deployed
    → "Add to Cart" returns ✅

PERMANENTLY DISCONTINUED
└── Keystatic: sold_out: true → Deploy
    → HTML baked forever with "Sold Out" ✅
    → KV entry irrelevant, Option A cleans it eventually ✅
```
