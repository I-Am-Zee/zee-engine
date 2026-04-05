# Architecture Decision Records (ADR)
> These are the "Why We Did It This Way" documents.
> Every major architectural decision is recorded here with context and rationale.
> Before changing any of these decisions, read the entry first.

---

## ADR-001: Astro 5 Content Layer API (Not Legacy Collections)
**Date:** 2026-04-04 | **Status:** ✅ Implemented

### Decision
Migrated from Astro's deprecated `defineCollection` legacy API to the new **Content Layer API** using `glob` loaders.

### Why
- The legacy API used `.slug` (filesystem-derived) which breaks in nested brand folders.
- The new `.id` property is stable and independent of filesystem structure.
- `glob` loaders accept a `base` path dynamically, enabling the `PUBLIC_BRAND_ID` master switch.

### Impact
- All pages now use `entry.id` instead of `entry.slug`.
- `render(entry)` instead of `await entry.render()`.
- Content paths are resolved at build time from `import.meta.env.PUBLIC_BRAND_ID`.

---

## ADR-002: Two-Mode Engine (BRAND vs AFFILIATE)
**Date:** 2026-04-05 | **Status:** ✅ Decided, ⏳ Implementing

### Decision
The engine supports exactly **two** operating modes, controlled by `PUBLIC_AFFILIATE` boolean in `.env`.

### Why
- "Three modes" (D2C, Affiliate, Editorial) creates unnecessary complexity. Editorial content is just a D2C or Affiliate brand with no products — it doesn't need its own mode.
- A boolean (`true`/`false`) is impossible to misspell. A string enum (`"brand"`, `"affiliate"`, `"editorial"`) creates typo risk.
- The distinction is binary: either you're selling your own products (D2C) or you're linking to others (Affiliate).

### What "Mode" Controls
| Feature | BRAND (false) | AFFILIATE (true) |
|---------|--------------|------------------|
| Snipcart | ✅ Loaded | ❌ Never loaded |
| Razorpay | ✅ Active | ❌ Not present |
| Shiprocket | ✅ Webhooks active | ❌ Not relevant |
| Product CTA | "Add to Cart" | "Buy from [Store]" |
| ecommerce.ts | ✅ Used | ❌ Never imported |
| Cuelinks/Admitad | ❌ Not loaded | ✅ Loaded |
| AdSense (Blog) | ❌ Not present | ✅ Available |

---

## ADR-003: Keystatic is Local-Dev Only
**Date:** 2026-04-05 | **Status:** ✅ Decided, ⏳ Implementing

### Decision
Keystatic Admin UI (`/keystatic`) will only be mounted when `import.meta.env.DEV === true`. On Cloudflare production, the route returns a 404.

### Why
- Security: No attack surface if the admin panel doesn't exist in production.
- Performance: Production bundle stays lean without React-heavy admin UI code.
- Simplicity: Avoids GitHub App OAuth setup, secret management in Cloudflare.
- Workflow: Content changes are made locally → previewed instantly → pushed to `main` → Cloudflare rebuilds.

### Trade-off Accepted
No remote CMS access from a phone or another computer. For a solo operator, this is acceptable. If this ever changes, the GitHub Mode migration is well-documented by Keystatic.

---

## ADR-004: Fail-Fast on Missing `PUBLIC_BRAND_ID`
**Date:** 2026-04-05 | **Status:** ✅ Decided, ⏳ Implementing

### Decision
If `PUBLIC_BRAND_ID` is not set, the build process **throws an immediate, human-readable error** and stops. There is no fallback, no default value.

### Why
- A missing env var causing the build to silently default to Zelia Vance would mean Brand 2's site potentially serving Brand 1's content — a catastrophic silent failure.
- "Fail Fast" is a core software engineering principle: crash loudly and early, never continue with corrupt state.
- As the sole operator, a broken build is immediately obvious. A silently wrong deployment might not be caught for hours.

### Implementation Note
A startup check in `src/content/config.ts` (or a shared lib) will throw:
```
Error: PUBLIC_BRAND_ID is not set. The engine cannot start without knowing which brand to serve. Set this in your .env file.
```

---

## ADR-005: Layout Wrapping Pattern (BaseLayout → EngineLayout → Page)
**Date:** 2026-04-05 | **Status:** ✅ Decided, ⏳ Implementing

### Decision
Three-tier layout hierarchy:
1. **`BaseLayout.astro`** — Universal shell (SEO, fonts, CSS, Alpine.js, Wishlist store, Newsletter, TrackingScripts slot)
2. **`EngineLayout.astro`** — Mode-aware wrapper (conditionally renders BrandEngine or AffiliateEngine)
3. **Pages** — Import only `EngineLayout`. Never import `BaseLayout` directly.

Inner components:
- **`BrandEngine.astro`** — Snipcart script, Razorpay awareness, "Add to Cart" behaviors
- **`AffiliateEngine.astro`** — Cuelinks/Admitad pixels, "Buy from Store" link logic

### Why
- Pages should not know or care which mode they're in.
- One env var change flips the entire site's behavior without touching a single page file.
- `CheckoutLayout.astro` remains separate — it's used only by the Razorpay bridge page, which only exists in Brand mode anyway.

### What "Universal" Means (Always in BaseLayout, Never Conditional)
- Alpine.js (core interactivity — Wishlist, Drawer, Popup)
- MailerLite Newsletter capture (both modes need email capture)
- Shared CSS (tokens + utilities)
- SEO meta tags, Open Graph, JSON-LD
- `<TrackingScripts />` component (reads `tracking.json`, renders only what exists)

---

## ADR-006: `site.config.ts` Retirement
**Date:** 2026-04-05 | **Status:** ✅ Decided, ⏳ Implementing

### Decision
`src/lib/site.config.ts` (which contains hardcoded Zelia Vance brand identity) will be **deleted**. All brand identity data moves to `src/content/{brand-id}/settings/site.yml`.

### Why
- Maintaining two sources of truth for the same data (brand name, emails, socials) is a maintainability hazard.
- The brand `site.yml` already contains this information after the Content Layer migration.
- When Brand 2 deploys, `site.config.ts` would serve Zelia Vance's name and email on the wrong site.

### Migration Path
All components that currently `import { siteConfig } from '@/lib/site.config'` will instead use `getEntry('settings', 'site')` from the Content Layer.

---

## ADR-007: MDX for Blogs, Markdown for Everything Else
**Date:** 2026-04-05 | **Status:** ✅ Implemented

### Decision
- Blog posts: `.mdx` (supports JSX components like `<AdSlot />`)
- Products, Lookbooks, Legal pages: `.md` (pure content, no component embedding needed)

### Why
- AdSense slots require placing a React/Astro component mid-content, which `.md` cannot do.
- Using MDX everywhere would add unnecessary complexity to simple content types.
- The blog is the only place where "content + interactive components" needs to coexist.

---

## ADR-008: Task Division — Antigravity (Architect) vs Jules (Contractor)
**Date:** 2026-04-05 | **Status:** ✅ Operational

### Decision
| Task Type | Owner |
|-----------|-------|
| Architectural decisions | Antigravity |
| Writing `.plans/` documentation | Antigravity |
| Code review of Jules' PRs | Antigravity |
| Batch file system operations (rename, move, delete) | Jules |
| Package installations | Jules |
| Schema updates that are purely additive | Jules |
| Writing `jules_payload.json` | Antigravity |

### Why
Jules has no conversation history. He cannot reason about architectural trade-offs or make judgment calls. He is exceptional at executing precise, well-specified instructions. Giving Jules ambiguous architectural tasks produces generic, misaligned output.
