# Zee Engine — Platform Context for Gemini CLI

> This file is automatically read by Gemini CLI when you run `gemini` inside this project directory.
> It defines the rules for the **Zee Engine**, a multi-tenant Astro 5 powerhouse.

## What This Platform Is

A **Multi-Tenant White-Label E-Commerce Engine** built on Astro 5.
**Architecture**: "Ghost Operator" — The code is a lightweight logic layer (Brain) that points to external media (Body) via Windows Junctions and the Vite Secret Bridge.

**Brand #1**: Zelia Vance — costume jewellery (HSN 7117), India only, ₹399–₹5,000.
**Brand Voice**: "Zee" — warm, Gen-Z adjacent, Old Money look at a fraction of the price.

## The 6 Rules of the Zee Engine (Non-Negotiables)

1. **Tailwind v4 only.** No `<style>` blocks in Feature or Page files. No `bg-[var(--token)]` — use `bg-(--token)`.
2. **Zero-Copy Assets.** Never commit images to this repo. Media lives in the Master Repo and is junctioned to `public/images`.
3. **No raw hex colors.** Always use CSS design tokens: `var(--color-primary)` or Tailwind `bg-(--color-primary)`.
4. **Atomic Design is law.** Primitives → UI → Features → Pages. No layer skipping. No behaviors imported in UI/Primitives.
5. **Flatten before Alpine.** Never pass raw Astro collection entries to client JS — always convert to plain objects first.
6. **CMS drives all content.** No hardcoded labels, headings, or category names in component files.

## Mandatory Reading Before Any Code Change

**Read these skill files first. Always. No exceptions.**

```
@Project_Skill/zelia-vance-engine/SKILL.md          ← Core rules, tokens, architecture
@Project_Skill/zelia-vance-engine-apis/SKILL.md     ← Component APIs, page patterns, debugging
```

Also read `AGENTS.md` at the repo root — it is the single source of truth for all business logic and operational decisions.

## Tech Stack (Quick Reference)

| Layer | Technology | Notes |
|---|---|---|
| Framework | Astro 5 (`^5.16.11`) | Island architecture. SSR via Cloudflare. |
| Styling | Tailwind CSS v4 (`^4.1.18`) | `@tailwindcss/vite` plugin, config in `global.css`. |
| Interactivity | Alpine.js 3 (`^3.15.4`) | + `@alpinejs/collapse`. |
| Icons | `phosphor-icons-astro` | `Ph` + PascalCase, via `Icon.astro` primitive only. |
| Carousel | `@splidejs/splide` | Never reinvent, use `carousel.ts` behavior. |
| Search | `fuse.js` v7 | Client-side, data must be plain objects. |
| CMS | Keystatic | Local dev only, config in `keystatic.config.ts`. Junction-aware. |
| Cart | Snipcart v3 | Templates in `public/snipcart-templates.html`. |
| Hosting | Cloudflare Pages | `@astrojs/cloudflare` adapter. |
| Images | R2 + Worker | Via `Image.astro` primitive — `assets.zeliavance.com`. |

## Directory Map

```
src/
├── components/
│   ├── primitives/   Badge, Button, FilterChip, Heading, Icon, Image, Input, Link, Logo, Modal, Section, Text
│   ├── ui/           BlogCard, GlassProductCard, SideDrawer, SectionHeader, NewsletterForm, etc.
│   └── features/     Navbar, Footer, WishlistButton, LookbookCarousel, NewsletterWidget, etc.
├── content/[brandId]/
│   └── settings/     brand.yaml, navigation.yaml, taxonomy.yaml, blog-taxonomy.yaml,
│                     marketing.yaml, shipping.yaml, footer.yaml, tracking.yaml
├── scripts/
│   ├── utils/        badges.ts, currency.ts, validation.ts, slugify.ts, reading-time.ts, etc.
│   └── behaviors/    newsletter.ts, wishlist.ts, side-drawer.ts, options-sync.ts, etc.
└── styles/
    ├── global.css    Design tokens — source of truth for all CSS variables
    └── snipcart.css  Snipcart overrides — 5-section architecture, never break boundaries
```

## Security Model: "Honest Person"
- Hide API keys and Git logic inside the Rust launcher.
- Keep the source code "invisible" to non-technical workers.
- Use `server.fs.allow` to securely bridge to external drives.

## Key Environment Variables

| Variable | Purpose |
|---|---|
| `PUBLIC_BRAND_ID` | `"zelia-vance"` — drives all content paths |
| `PUBLIC_SNIPCART_API_KEY` | Snipcart public key |
| `PUBLIC_IMAGE_GATEWAY_URL` | R2 Worker base URL |
| `SNIPCART_SECRET_API_KEY` | Server only |
| `MAILERLITE_API_KEY` | MailerLite v3 |
| `MAILERLITE_GROUP_ID` | `183469983098995840` |

## Do Not Touch Without Full Context

- `public/snipcart-templates.html` (IDs ov-1 through ov-14)
- `src/styles/snipcart.css` (5-section architecture)
- `src/scripts/behaviors/options-sync.ts` (Snipcart variant sync)
- `src/pages/checkout/razorpay.astro` (payment bridge)
- `src/pages/api/checkout/order-completed.ts` (webhook)
- `src/pages/api/webhooks/logistics-sync.ts` (webhook)

---

**You are now operating within the Zee Engine.** Maintain its lightweight, sovereign, and ghost-like nature at all costs.
