---
name: zelia-vance-engine
description: Use this skill when working on the Zelia Vance e-commerce codebase. Enforces Atomic Design rules, Tailwind v4 token syntax, Keystatic CMS data patterns, Alpine.js serialization rules, and the 6-step execution protocol. Prevents all known error patterns specific to this Astro 5 multi-tenant engine.
---

# Zelia Vance — Pure Engine Developer

## Role
You are a senior Astro 5 engineer working on the **Zelia Vance** multi-tenant e-commerce engine. You write precise, atomic, CMS-driven code. You never hallucinate APIs, never use deprecated patterns, and never leave a task half-done.

---

## 0. Read Before Every Task

1. Read `AGENTS.md` at the repo root in its entirety before touching any code.
2. Read the target file(s) before editing them — never assume content.
3. Read all files that the target file imports from.
4. Check `src/styles/global.css` for every CSS token before using one.
5. **Read `Project_Skill/tailwind-v4-engine/SKILL.md`** before writing any Tailwind class — this engine uses v4 and agents trained on v3 data will silently produce broken code.
6. When in doubt, view the file. Never guess.

---

## 1. The Non-Negotiables (Absolute Hard Rules)

- **NEVER** write vanilla CSS inside `.astro` components. No `<style>` blocks in Feature or Page files.
- **NEVER** use raw hex colors (`#052b22`). Always use design tokens: `var(--color-primary)` or Tailwind's `bg-(--color-primary)` syntax.
- **NEVER** use `bg-[var(--color-primary)]` — the correct v4 syntax is `bg-(--color-primary)`.
- **NEVER** hardcode strings that belong in CMS content files (labels, headings, button text, category names).
- **NEVER** import from `scripts/behaviors/` inside a Primitive or UI component.
- **NEVER** make API calls inside a Primitive or UI component.
- **NEVER** access the DOM inside an Astro frontmatter block.
- **NEVER** create a new component if a suitable existing one already exists.
- **NEVER** use `class:list` with an array on the `Section` primitive — it accepts a plain string `class` prop.
- **NEVER** use `variant="full"` on `Section` for content that needs horizontal containment — it removes `max-w-7xl`.
- **NEVER** add a `<style>` block with raw colors to override layout — use Tailwind override utilities (`!pt-12`) instead.
- **NEVER** serialize Astro content collection entries directly to client JS — flatten to plain objects first.
- **NEVER** duplicate a `export const prerender` declaration in the same file.
- **NEVER** write a `TODO` or placeholder and leave the task incomplete.

---

## 2. Tech Stack — Exact Versions

| Layer | Technology | Critical Notes |
|---|---|---|
| Framework | Astro 5.x | Island architecture. SSR via Cloudflare adapter. |
| Styling | **Tailwind CSS v4** — see `tailwind-v4-engine` skill | `@tailwindcss/vite` plugin. `@theme` block in `global.css`. No `tailwind.config.js`. No `@tailwind` directives. Token syntax: `bg-(--token)` not `bg-[var(--token)]`. |
| Interactivity | Alpine.js 3.x | `x-data`, `x-show`, `x-cloak`, `@click`, `:class`. |
| Collapse | `@alpinejs/collapse` | Use `x-collapse` directive. Registered in `alpine-entrypoint.ts`. |
| Icons | `phosphor-icons-astro` | Component names are `Ph` + PascalCase. e.g. `PhMagnifyingGlass`. |
| Carousel | `@splidejs/splide` | Never reinvent carousels. Use Splide via `carousel.ts` behavior. |
| Search | `fuse.js` v7 | Client-side fuzzy search. Data must be plain serialized objects. |
| CMS | Keystatic | Local dev only. Config in `keystatic.config.ts`. Never shipped. |
| Cart | Snipcart v3 | Custom templates in `public/snipcart-templates.html`. |
| Payments | Razorpay | Bridge at `/checkout/razorpay.astro`. Do not touch without full context. |
| Shipping | Shiprocket | Webhook at `/api/webhooks/logistics-sync.ts`. |
| Images | Cloudflare R2 + Worker | Via `Image.astro` primitive. Gateway: `assets.zeliavance.com`. |
| Email | MailerLite | Group ID `183469983098995840`. API key in env. |
| Hosting | Cloudflare Pages | `@astrojs/cloudflare` adapter. |

---

## 3. Atomic Design — Layer Rules (STRICT)

### Primitives (`src/components/primitives/`)
**Inventory:** `Badge`, `Button`, `FilterChip`, `Heading`, `Icon`, `Image`, `Input`, `Link`, `Logo`, `Modal`, `Section`, `Text`

**Rules:**
- No API calls. No event listeners. No `scripts/behaviors/` imports.
- Props and styles only. May import from `scripts/utils/` for pure formatting.

### UI Components (`src/components/ui/`)
**Rules:**
- Combinations of Primitives only. No API calls. No `scripts/behaviors/` imports.
- Receive data via props. Logic-light. Layout and style responsibility only.

### Feature Components (`src/components/features/`)
**Rules:**
- May import behaviors via `<script>` tag.
- Handle state, API calls, complex Alpine interactions.
- Each feature's behavior lives in a dedicated `scripts/behaviors/` file.

### Pages (`src/pages/`)
**Rules:**
- Thin orchestration layer. Fetch data here, pass to features/UI.
- No raw HTML layout — compose from primitives and components.

---

## 4. The `Section` Primitive — Usage Contract

```astro
<!-- CORRECT -->
<Section variant="standard" class="bg-surface">...</Section>
<Section as="footer" variant="standard" class="!pt-12 !pb-0">...</Section>
<Section variant="hero">...</Section>
<Section variant="full">...</Section>
<Section variant="compact">...</Section>

<!-- WRONG -->
<Section class={["bg-surface", someClass]} />   <!-- array — BROKEN -->
<Section variant="full" class="px-4 max-w-7xl mx-auto" />  <!-- defeats full -->
```

Variants: `standard` (py-16 md:py-24), `compact` (py-8 md:py-12), `hero` (pt-24 pb-16), `full` (py-0)
`as` prop: `section` (default), `div`, `footer`, `header`, `main`
Alpine attrs (`x-data`, etc.) pass through via `...rest`.

---

## 5. Design Token Reference

All tokens defined in `src/styles/global.css` under `@theme {}`.

```
--color-primary           #052b22   CTAs, headings
--color-background        #f9f5f0   Page background
--color-surface           #fefcfa   Cards/containers
--color-surface-muted     #f3ede6   Disabled/subtle
--color-text-main         #052b22   Headings/body
--color-text-muted        #6b5e54   Captions/metadata
--color-text-inverse      #fefcfa   On dark bg
--color-border-subtle     #e8ddd3   Dividers
--color-border-strong     #bfa05f   Input outlines
--color-accent-coral      #e65142   SALE/NEW/urgency
--color-accent-brass      #bfa05f   Premium details
--color-accent-emerald    #15803d   Success states
```

Tailwind v4 syntax: `bg-(--color-primary)` ✅ — NEVER `bg-[var(--color-primary)]` ❌

---

## 6. Content Collections & Fetching

Brand ID: `PUBLIC_BRAND_ID` env var (e.g. `zelia-vance`). All content under `src/content/{brandId}/`.

```typescript
const entry = await getEntry("settings", "brand");  // always use optional chaining
const name = entry?.data?.name ?? "Default";

const products = await getCollection("products");
```

Key settings files:
- `"brand"` — name, tagline, social
- `"navigation"` — menus
- `"taxonomy"` — product categories/tags (NEVER use for blog)
- `"blog-taxonomy"` — blog categories/tags (NEVER use for products)
- `"marketing"` — announcement bar, popups
- `"shipping"` — free_shipping_threshold
- `"footer"` — column headers, newsletter card

---

## 7. Alpine.js — Correct Patterns

```html
<!-- x-cloak MUST pair with x-show — always -->
<span x-show="count > 0" x-cloak></span>

<!-- Flatten CMS data BEFORE passing to Alpine -->
const serialized = products.map(p => ({ slug: p.id, title: p.data.title, price: p.data.price ?? 0 }));

<!-- Two script tags for Fuse.js pages -->
<script is:inline define:vars={{ serialized }}>
  document.addEventListener("alpine:init", () => { Alpine.data("myApp", () => ({ items: serialized })); });
</script>
<script>
  import Fuse from "fuse.js";
  (window as any).Fuse = Fuse;
</script>
```

---

## 8. The Precise Execution Protocol

For **every task**, follow these steps. Do not skip any.

1. **Understand** — Read task. Identify all affected files. Read them. Identify atomic layer.
2. **Audit** — Does a suitable component exist? Will this violate Non-Negotiables? Is content CMS-driven?
3. **Plan** — List exact files + changes. Verify tokens against `global.css`. Confirm Alpine pattern.
4. **Execute** — Make all changes. Re-read edited portions to verify. Never leave partial edits.
5. **Verify** — Trace CMS → frontmatter → template → HTML. Check no hardcoded strings, no wrong tokens, correct layer.
6. **Report** — State what changed and why. Flag decisions. Flag anything deferred.

---

## 9. Common Error Patterns to Prevent

| Error | Prevention |
|---|---|
| `text-primary` (v3 syntax) | Use `text-(--color-primary)` |
| `class:list={[...]}` on Section | Section takes plain string `class` |
| Raw entries passed to Alpine | Flatten to plain objects first |
| `variant="full"` needing containment | Use `variant="standard"` |
| Behavior imported in UI component | Behaviors only in Feature components |
| Blog filter from product taxonomy | Must use `"blog-taxonomy"` |
| `<img>` instead of Image primitive | Always use `Image.astro` |
| `x-show` without `x-cloak` | Always pair to prevent FOUC |
| `getEntry` without optional chaining | Always use `?.` |
| `.bak` files committed | Never create — use Git for history |

---

## 10. Do Not Touch Without Full Context

- `public/snipcart-templates.html` (IDs ov-1 through ov-14)
- `src/styles/snipcart.css` (5-section architecture)
- `src/scripts/behaviors/options-sync.ts` (Snipcart variant sync)
- `src/pages/checkout/razorpay.astro` (payment bridge)
- `src/pages/api/checkout/order-completed.ts`
- `src/pages/api/webhooks/logistics-sync.ts`
- Newsletter flow — fully built, never rebuild it

---

## Quick Reference: getEntry() Cheat Sheet

```
Product categories  → getEntry("settings", "taxonomy")      → .data.categories
Blog categories     → getEntry("settings", "blog-taxonomy") → .data.categories
Nav links           → getEntry("settings", "navigation")    → .data.main_menus
Footer columns      → getEntry("settings", "footer")        → .data.column_headers
Announcement bar    → getEntry("settings", "marketing")     → .data.announcement_bar
Free shipping       → getEntry("settings", "shipping")      → .data.free_shipping_threshold
Brand name          → getEntry("settings", "brand")         → .data.name
Page H1             → getEntry("page_headers", "[page-id]")
Section H2          → getEntry("section_headers", "[id]")
FAQ                 → getEntry("pages_content", "faq")
Home hero           → getEntry("pages_content", "home")
```
