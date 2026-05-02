---
name: zelia-vance-engine-apis
description: Use this skill alongside zelia-vance-engine when working on this codebase. Provides exact component prop APIs for all primitives, canonical page data-flow patterns, how to extend the engine with new content types or components, and a full debugging protocol for visual bugs, Alpine.js issues, CMS data problems, and build failures.
---

# Zelia Vance — Component APIs, Patterns & Debugging

> **Prerequisite:** Read `zelia-vance-engine` skill first.

---

## 1. Primitive Component APIs (Ground-Truth Prop Signatures)

### `Heading.astro`
```astro
<Heading
  as="h1"       -- REQUIRED. "h1"|"h2"|"h3"|"h4"|"h5"|"h6"
  size="h2"     -- Optional. Visual size override (decouples semantic from visual).
  color="main"  -- Optional. "main"|"muted"|"inverse"|"accent". Default: "main"
  class="..."   -- Optional.
>
```
All Headings: `font-serif` (Fraunces). `as` is REQUIRED — omitting it is a type error.

### `Text.astro`
```astro
<Text
  as="p"               -- Optional. Overrides smart default tag.
  variant="paragraph"  -- Optional. See table below. Default: "paragraph"
  weight="medium"      -- Optional. "light"|"normal"|"medium"|"semibold"|"bold"|"black"
  color="muted"        -- Optional. "main"|"muted"|"inverse"|"accent"|"coral"|"emerald"
  italic={false}       -- Optional.
  class="..."          -- Optional.
>
```
Key variants: `paragraph`/`body` (p), `lead` (p), `caption` (span), `eyebrow` (span, brass), `metadata` (span, uppercase), `price` (span, bold), `price_sale` (span, strikethrough), `label` (span), `callout` (p, border-left), `quote` (blockquote, serif), `code` (code, mono), `tag` (span, pill)

### `Button.astro`
```astro
<Button
  as="button"      -- Optional. "button"|"a". Default: "button"
  type="primary"   -- Optional. "primary"|"secondary"|"neutral"|"ghost". Default: "primary"
  variant="default" -- Optional. "default"|"icon-left"|"icon-right"|"icon-only"
  size="md"        -- Optional. "sm"|"md"|"lg". Default: "md"
  disabled={false} -- Optional.
  href="/path"     -- Required if as="a".
  class="..."      -- Optional.
>
```
Common patterns:
```astro
<Button type="ghost" variant="icon-only" size="sm" aria-label="Search"><Icon name="PhMagnifyingGlass" /></Button>
<Button as="a" href="/shop" type="primary" variant="icon-right">Shop Now <Icon name="PhArrowRight" /></Button>
```

### `Link.astro`
```astro
<Link
  href="/path"       -- REQUIRED.
  variant="plain"    -- Optional. "plain"|"underline". Default: "plain"
  isExternal={false} -- Optional. Auto-detected from href.
  class="..."        -- Optional.
>
```
External links auto-get `target="_blank" rel="noopener noreferrer"`. Never add manually.

### `Image.astro`
```astro
<Image
  src="/images/products/ring.webp"  -- REQUIRED.
  alt="Alt text"                    -- REQUIRED.
  ratio="square"    -- Optional. "square"|"portrait"|"landscape"|"auto". Default: "square"
  sizes="(max-width:768px) 100vw, 50vw"  -- Optional. Default: "100vw"
  loading="lazy"    -- Optional. Use "eager" + fetchpriority="high" for LCP images.
  class="..."       -- Optional.
/>
```
R2 transform is automatic: `/images/products/ring.webp` → `assets.zeliavance.com/zelia-vance/products/ring.webp?w=800`
Srcset generated at 200w, 400w, 800w, 1200w. Dev falls back to local files if no gateway URL.
**NEVER use raw `<img>` tags in components. Always use this primitive.**

### `Icon.astro`
```astro
<Icon name="PhMagnifyingGlass" class="h-5 w-5" weight="regular" />
```
Format: `Ph` + PascalCase. Never import Phosphor directly — always via `Icon.astro`.
Sizes: nav=`h-5 w-5`, small UI=`h-4 w-4`, feature=`h-6 w-6`, empty state=`size="5rem"`.

### `Input.astro`
```astro
<Input
  id="email-input"   -- REQUIRED for accessibility.
  type="email"       -- Optional. Standard HTML input types.
  placeholder="..."  -- Optional.
  icon="PhEnvelope"  -- Optional. Left-side icon.
  readonly={false}   -- Optional.
  x-model="query"    -- Alpine binding passes through via ...rest
  @input="handler"   -- Alpine event passes through
/>
```

### `FilterChip.astro`
```astro
<FilterChip
  label="All Stories"         -- REQUIRED.
  isActive="isAllSelected()"  -- Optional. Alpine expression STRING (not function, not boolean).
  onClick="clearFilters()"    -- Optional. Alpine click handler STRING.
  variant="pill"              -- Optional. "pill"|"outline"|"sidebar". Default: "pill"
/>
```

---

## 2. Canonical Page Data-Flow Pattern

```
CMS (YAML/MD) → getEntry()/getCollection() → Flatten to plain objects → Props → Components → Alpine (client)
```

**Mode 1: SSR rendering (most common)**
```astro
---
const settings = await getEntry("settings", "brand");
---
<Heading as="h1">{settings?.data?.name}</Heading>
```

**Mode 2: Props to components**
```astro
---
const products = await getCollection("products");
---
<ProductCarousel products={products} />
<!-- Safe if component renders server-side only -->
```

**Mode 3: Alpine (MUST flatten first)**
```astro
---
const products = await getCollection("products");
const serialized = products.map(p => ({
  slug: p.id,
  title: p.data.title,
  price: p.data.price ?? 0,    // Always provide fallback
  category: p.data.category,
  tags: p.data.tags ?? [],     // Arrays must fallback to []
}));
---
<script is:inline define:vars={{ serialized }}>
  document.addEventListener("alpine:init", () => {
    Alpine.data("myApp", () => ({ items: serialized }));
  });
</script>
```

---

## 3. How to Add a New CMS Content Type

Follow this exact checklist. Never skip a step.

**A.** Create the YAML/MD content file: `src/content/{brandId}/{collection-name}/data.yaml`

**B.** Register in `src/content/config.ts`:
```typescript
const my_collection = defineCollection({
  loader: glob({ pattern: "**/*.{yml,yaml}", base: `./src/content/${brandId}/my_collection` }),
  schema: z.object({ heading: z.string() }),
});
export const collections = { ...existing, my_collection };
```

**C.** Register in `keystatic.config.ts` as singleton or collection, add to `ui.navigation` group.

**D.** Fetch with `await getEntry("my_collection", "data")` using optional chaining.

---

## 4. How to Add a New Component

**Decision tree:**
```
Makes API calls / manages complex state?  YES → Feature (src/components/features/)
                                          NO  → Combines multiple primitives?
                                                YES → UI (src/components/ui/)
                                                NO  → Primitive (src/components/primitives/)
```

**Behavior file template** (`scripts/behaviors/my-feature.ts`):
```typescript
export function initMyFeature() {
  document.addEventListener("alpine:init", () => {
    window.Alpine.data("myFeatureApp", () => ({
      isOpen: false,
      toggle() { this.isOpen = !this.isOpen; },
    }));
  });
}
```

---

## 5. Debugging Protocol

### Visual Bug (Wrong styles)
1. Inspect element. Find actual applied classes.
2. Is it wrong token? `bg-[var(--token)]` instead of `bg-(--token)`?
3. Is Section variant wrong? `full` removes containment.
4. Are `!important` overrides conflicting?

### Alpine.js Bug (Not working)
1. Check browser console for Alpine errors.
2. `x-cloak` present? `[x-cloak] { display: none !important }` in global.css?
3. `x-data` name matches `Alpine.data("name")`?
4. Is `alpine:init` used — not `DOMContentLoaded`?
5. Is the behavior `init` function called in a `<script>` tag?
6. If `define:vars` used — is data a plain JSON-safe object?

### CMS Data Bug (Missing/undefined content)
1. Is the `getEntry` key exactly matching the filename (no extension)?
2. Does the file exist at `src/content/{brandId}/settings/filename.yaml`?
3. Is the collection registered in `src/content/config.ts`?
4. **Restart the dev server** — Astro caches content and can serve stale data.
5. Check the Zod schema — mismatched field causes Astro to silently drop the entry.

### Build Failure
1. Read the full error — exact file and line are always shown.
2. Duplicate `export const prerender`?
3. Missing imports?
4. Non-JSON-safe value in `define:vars`?
5. Zod schema validation failure in `config.ts`?
6. Run `npx astro check` for TypeScript errors without full dev server.

### Image Not Loading
1. Dev without gateway: `PUBLIC_IMAGE_GATEWAY_URL` should be empty to use local files.
2. Dev with gateway: Check R2 bucket has file at `{brandId}/products/filename.webp`.
3. Check `PUBLIC_BRAND_ID` matches R2 folder prefix.
4. If `onerror` fires: the R2 file is missing — upload it.

---

## 6. Version & Upgrade Notes

### Pinned Versions (2026-04-30)
```
astro: ^5.16.11
tailwindcss: ^4.1.18
@tailwindcss/vite: ^4.1.18
alpinejs: ^3.15.4
@alpinejs/collapse: ^3.15.6
@astrojs/cloudflare: ^12.6.13
@keystatic/astro: ^5.0.6
@splidejs/splide: ^4.1.4
fuse.js: ^7.1.0
phosphor-icons-astro: ^2.1.1-17042025
razorpay: ^2.9.6
```

### Tailwind v4 Breaking Changes (Already Applied)

> **Full v4 rules in dedicated skill:** `Project_Skill/tailwind-v4-engine/SKILL.md` — read it before any Tailwind work.

- `@theme {}` block in `global.css` replaces `tailwind.config.js`
- CSS variable syntax: `bg-(--token)` not `bg-[var(--token)]` — **this is the #1 agent mistake**
- `@tailwindcss/vite` plugin, not PostCSS
- `@plugin "@tailwindcss/typography"` in CSS, not JS
- Opacity: `bg-red-500/50` not `bg-opacity-50` (removed in v4)
- Gradients: `bg-linear-to-r` not `bg-gradient-to-r` (renamed)
- Important: `flex!` postfix not `!flex` prefix
- Smallest shadow: `shadow-xs` not `shadow-sm`

---

## 7. Scalability: When to Update Which Section

| What happened | Update this section |
|---|---|
| New primitive created | §1 (add prop API) |
| New content collection added | GEMINI.md directory map + `zelia-vance-engine` §6 |
| New settings YAML | `zelia-vance-engine` §6 settings table |
| New behavior file | `zelia-vance-engine` §13 behaviors table |
| Dependency upgraded | §6 Version table + breaking changes |
| New page pattern | §2 (add to data-flow patterns) |
| New error pattern discovered | `zelia-vance-engine` §9 error table |
