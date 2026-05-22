# Skill Part 2: Component APIs, Page Patterns, Extensibility & Debugging

> **Prerequisite:** Part 1 (`zee-engine.md`) must be read first.
> This part covers: exact prop APIs for all primitives, canonical page data-flow patterns, how to extend the engine with new content/components, and a full debugging protocol.

---

## P2-1. Primitive Component API Reference

> These are the ground-truth prop signatures extracted from source. Use exactly these — never guess props.

---

### `Heading.astro`
```astro
<Heading
  as="h1"           -- REQUIRED. Semantic tag: "h1"|"h2"|"h3"|"h4"|"h5"|"h6"
  size="h2"         -- Optional. Visual size override (decouples semantic from visual).
  color="main"      -- Optional. "main"|"muted"|"inverse"|"accent". Default: "main"
  class="..."       -- Optional. Extra Tailwind classes.
>
  Heading text here
</Heading>
```

**Critical:** `as` is REQUIRED. Omitting it is a type error. The `size` prop decouples visual from semantic — use it when an `h3` needs to look like an `h1`.

**Size → visual output:**
- `h1` → `clamp(2rem, 5vw, 3.5rem)`, medium weight
- `h2` → `clamp(1.75rem, 4vw, 2.5rem)`, medium weight
- `h3` → `clamp(1.5rem, 3.5vw, 2rem)`, semibold
- `h4` → `clamp(1.25rem, 3vw, 1.5rem)`, semibold
- `h5` → `clamp(1.125rem, 2.5vw, 1.25rem)`, bold
- `h6` → `clamp(1rem, 2vw, 1.125rem)`, bold

All Headings use `font-serif` (Fraunces).

---

### `Text.astro`
```astro
<Text
  as="p"            -- Optional. Overrides the smart default tag.
  variant="paragraph" -- Optional. See full list below. Default: "paragraph"
  weight="medium"   -- Optional. "light"|"normal"|"medium"|"semibold"|"bold"|"black"
  color="muted"     -- Optional. "main"|"muted"|"inverse"|"accent"|"coral"|"emerald"
  italic={false}    -- Optional. Applies italic style.
  class="..."       -- Optional. Extra Tailwind classes.
>
  Text content
</Text>
```

**Variant → default tag mapping:**
| Variant | Default Tag | Use Case |
|---|---|---|
| `paragraph` / `body` | `<p>` | Standard body copy |
| `lead` | `<p>` | Introductory/hero sub-text |
| `caption` | `<span>` | Secondary descriptions |
| `muted` | `<p>` | De-emphasised content |
| `eyebrow` | `<span>` | Section labels above headings (brass color) |
| `metadata` | `<span>` | Timestamps, counts, uppercase info |
| `price` | `<span>` | Active price display |
| `price_sale` | `<span>` | Strikethrough comparison price |
| `label` | `<span>` | UI button/nav labels |
| `callout` | `<p>` | Highlighted sidebar block |
| `quote` | `<blockquote>` | Pull quotes (serif) |
| `code` | `<code>` | Inline code snippets |
| `tag` | `<span>` | Small rounded category pills |

**Note:** If `weight` prop is passed, it strips the variant's built-in font-weight. Same for `color` — it strips the variant's built-in color. This is intentional.

---

### `Button.astro`
```astro
<Button
  as="button"       -- Optional. "button"|"a". Default: "button"
  type="primary"    -- Optional. "primary"|"secondary"|"neutral"|"ghost". Default: "primary"
  variant="default" -- Optional. "default"|"icon-left"|"icon-right"|"icon-only". Default: "default"
  size="md"         -- Optional. "sm"|"md"|"lg". Default: "md"
  disabled={false}  -- Optional. Applies disabled state.
  href="/path"      -- Required if as="a".
  class="..."       -- Optional. Extra classes.
>
  <Icon name="PhArrowRight" />  -- slot content (icons, text, or both)
  Label text
</Button>
```

**Type → color scheme:**
- `primary` → dark green bg, light text, hover → black
- `secondary` → brass bg, dark text
- `neutral` → light surface bg, border, hover → muted surface
- `ghost` → transparent, hover → ghost-hover surface

**Common usage patterns:**
```astro
<!-- Icon-only nav button -->
<Button type="ghost" variant="icon-only" size="sm" aria-label="Search">
  <Icon name="PhMagnifyingGlass" />
</Button>

<!-- CTA link button -->
<Button as="a" href="/shop" type="primary" variant="icon-right" size="lg">
  Shop Now <Icon name="PhArrowRight" />
</Button>

<!-- Ghost link button — no hover surface flash -->
<Button as="a" href="/lookbooks" type="ghost">
  View Lookbooks
</Button>
```

---

### `Link.astro`
```astro
<Link
  href="/path"        -- REQUIRED.
  variant="plain"     -- Optional. "plain"|"underline". Default: "plain"
  isExternal={false}  -- Optional. Auto-detected if href starts with http.
  class="..."         -- Optional.
>
  Link text
</Link>
```

**Note:** External links automatically get `target="_blank" rel="noopener noreferrer"`. You do NOT need to add these manually. Passing `target="_blank"` directly is redundant and should be avoided.

---

### `Image.astro`
```astro
<Image
  src="/images/products/ring.webp"  -- REQUIRED. Path string or local import.
  alt="Alt text"                    -- REQUIRED.
  ratio="square"    -- Optional. "square"|"portrait"|"landscape"|"auto". Default: "square"
  sizes="(max-width:768px) 100vw, 50vw"  -- Optional. Defaults to "100vw"
  loading="lazy"    -- Optional. "lazy"|"eager". Default: "lazy"
  fetchpriority="high" -- Optional. Use "high" for LCP images.
  class="..."       -- Optional.
/>
```

**Ratio → aspect ratio:**
- `square` → `aspect-square`
- `portrait` → `aspect-[4/5]`
- `landscape` → `aspect-video` (16/9)
- `auto` → no aspect ratio constraint (use with `class="w-full h-full object-cover"`)

**R2 Path transformation (automatic):**
- Input: `/images/products/ring.webp`
- Output in prod: `https://assets.zeliavance.com/zelia-vance/products/ring.webp?w=800`
- Srcset: `?w=200`, `?w=400`, `?w=800`, `?w=1200` — generated automatically.
- In dev with no `PUBLIC_IMAGE_GATEWAY_URL`: falls back to local `/public/images/` files.

**NEVER** use a raw `<img>` tag in any component. Always use this primitive.

---

### `Icon.astro`
```astro
<Icon
  name="PhMagnifyingGlass"  -- REQUIRED. Ph + PascalCase Phosphor icon name.
  class="h-5 w-5"           -- Optional. Size/color via Tailwind.
  weight="regular"          -- Optional. Phosphor weight: "thin"|"light"|"regular"|"bold"|"fill"|"duotone"
/>
```

**Standard icon sizes by context:**
- Nav icons: `h-5 w-5` (default)
- Small UI icons: `h-4 w-4`
- Feature/decorative: `h-6 w-6` or `h-8 w-8`
- Hero/empty state: `size="5rem"` or larger

---

### `Input.astro`
```astro
<Input
  id="email-input"   -- REQUIRED for accessibility.
  type="email"       -- Optional. Standard HTML input types. Default: "text"
  placeholder="..."  -- Optional.
  icon="PhEnvelope"  -- Optional. Left-side icon name.
  readonly={false}   -- Optional. Renders as non-editable (used in confirm forms).
  class="..."        -- Optional.
  -- All other standard HTML input attributes pass through via ...rest
  x-model="query"    -- Alpine binding passes through
  @input="handler"   -- Alpine event passes through
/>
```

---

### `FilterChip.astro`
```astro
<FilterChip
  label="All Stories"    -- REQUIRED. Display text.
  isActive="isAllSelected()"  -- Optional. Alpine.js expression (string) that returns boolean.
  onClick="clearFilters()"    -- Optional. Alpine.js click handler expression (string).
  variant="pill"         -- Optional. "pill"|"outline"|"sidebar". Default: "pill"
  class="..."            -- Optional.
/>
```

**Variant use cases:**
- `pill` → Horizontal scroll chip bars (search page, mobile blog filter)
- `outline` → Alternative style chip
- `sidebar` → Desktop sidebar filter with checkbox indicator

**Note:** `isActive` and `onClick` are Alpine.js expression **strings** — not functions, not booleans. They are written into the template as Alpine attributes at render time.

---

### `Section.astro`
*(Full reference in Part 1, §4. Quick reminder here.)*
```astro
<Section
  as="section"       -- Optional. "section"|"div"|"footer"|"header"|"main"
  variant="standard" -- Optional. "standard"|"compact"|"hero"|"full"
  id="section-id"    -- Optional.
  class="..."        -- Optional. String only — NOT an array.
  -- Alpine attrs pass through: x-data, x-show, etc.
/>
```

---

## P2-2. Canonical Page Data-Flow Pattern

Every page in this engine follows the same data-flow contract. Understanding this prevents the most common mistakes.

```
CMS (YAML/MD files)
      ↓
  getEntry() / getCollection()   ← Astro frontmatter
      ↓
  Flatten to plain objects       ← Required before passing to client JS
      ↓
  Feature/UI components          ← Props only — no direct CMS access
      ↓
  Primitives                     ← Pure display — no data fetching
      ↓
  Alpine.js (client)             ← Receives serialized plain objects via define:vars
```

### The Three Modes of Data Passing

**Mode 1: Direct SSR rendering (most common)**
```astro
---
const settings = await getEntry("settings", "brand");
const brandName = settings?.data?.name;
---
<Heading as="h1">{brandName}</Heading>
<!-- No serialization needed — Astro renders this at build time -->
```

**Mode 2: Passing to child components via props**
```astro
---
const products = await getCollection("products");
---
<ProductCarousel products={products} />
<!-- products is passed as-is; the component receives Astro entries -->
<!-- ONLY safe if the component renders them server-side, not client-side -->
```

**Mode 3: Passing to Alpine.js (client-side interactivity)**
```astro
---
const products = await getCollection("products");

// REQUIRED: Flatten to plain object before serializing
const serialized = products.map(p => ({
  slug: p.id,
  title: p.data.title,
  price: p.data.price ?? 0,    // Always provide fallback — null breaks Fuse
  category: p.data.category,
  image: p.data.image,
  tags: p.data.tags ?? [],     // Arrays must have fallback to []
}));
---

<script is:inline define:vars={{ serialized }}>
  // serialized is now a plain JSON-safe array
  document.addEventListener("alpine:init", () => {
    Alpine.data("myApp", () => ({
      items: serialized,
      // ...
    }));
  });
</script>
```

---

## P2-3. The Search Page Pattern (Fuse.js + Alpine)

The search page is the canonical reference for how to wire Fuse.js with Alpine.js in this engine. Replicate this pattern exactly when building any client-side filtering feature.

### Key decisions to copy exactly:

1. **Two `<script>` tags** — one `is:inline define:vars` (data bridge), one regular (module import):
```astro
<!-- Inline: passes server data to client. Must be is:inline. -->
<script is:inline define:vars={{ allSearchable, filterLabels }}>
  document.addEventListener("alpine:init", () => {
    window.Alpine.data("searchApp", () => ({
      // ... Alpine state using allSearchable
    }));
  });
</script>

<!-- Module: imports Fuse.js and exposes to global scope -->
<script>
  import Fuse from "fuse.js";
  (window as any).Fuse = Fuse;
</script>
```

2. **Lazy Fuse initialization** — create the Fuse instance only when first search occurs:
```javascript
_fuse: null,
_getFuse() {
  if (!this._fuse) {
    this._fuse = new Fuse(allSearchable, {
      keys: ["title", "description", "tags", "category"],
      threshold: 0.35,
      includeScore: true,
    });
  }
  return this._fuse;
},
```

3. **Slug-based result rendering** — never render items in the Alpine loop directly. Render all cards in Astro SSR, then show/hide via `x-show` using slug matching:
```astro
{allProducts.map(product => (
  <div x-show={`matchingProductSlugs.includes('${product.id}')`} x-cloak>
    <GlassProductCard product={product} />
  </div>
))}
```

4. **Debounced input** — always debounce search input by 300ms:
```astro
<Input @input.debounce.300ms="performSearch()" x-model="query" />
```

---

## P2-4. Blog Page Pattern

The blog listing page uses `blog-discovery.ts` behavior. The pattern:

```astro
---
import { getCollection, getEntry } from "astro:content";
const posts = await getCollection("blog", ({ data }) => !data.isDraft);
const taxonomy = await getEntry("settings", "blog-taxonomy");
const blogCategories = taxonomy?.data?.categories ?? [];
---

<!-- Alpine state provided by blog-discovery behavior -->
<Section x-data="blogDiscovery">
  <BlogCategoryFilter labels={...} />
  <!-- BlogCard grid rendered SSR, shown/hidden via Alpine -->
</Section>

<script>
  import { initBlogDiscovery } from "../scripts/behaviors/blog-discovery";
  initBlogDiscovery();
</script>
```

---

## P2-5. How to Add a New CMS Content Type (Extensibility)

Follow this exact checklist when adding any new content type to the engine. Never skip a step.

### Step A: Create the YAML/MD content file
```
src/content/{brandId}/{collection-name}/example.yaml
```

### Step B: Register the collection in `src/content/config.ts`
```typescript
const my_new_collection = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/my_new_collection`,
  }),
  schema: z.object({
    heading: z.string(),
    // ... your schema
  }),
});

export const collections = {
  // ... existing
  my_new_collection,  // ADD HERE
};
```

### Step C: Register in Keystatic `keystatic.config.ts`
Add to either `collections` (repeating entries) or `singletons` (one-off settings):
```typescript
// For a singleton (one YAML file):
my_new_singleton: singleton({
  label: 'My New Section',
  path: `src/content/${brandId}/my_new_collection/data`,
  format: { data: 'yaml' },
  schema: {
    heading: fields.text({ label: 'Heading', validation: { isRequired: true } }),
  },
}),
```

Add to navigation in the `ui.navigation` block:
```typescript
'PAGE CONTENT': [
  // ... existing items
  'my_new_singleton',  // ADD HERE in correct group
],
```

### Step D: Fetch in the page/component that needs it
```typescript
const myData = await getEntry("my_new_collection", "data");
const heading = myData?.data?.heading ?? "Default Heading";
```

### Step E: Pass to component via props — never expose raw entry to client JS

---

## P2-6. How to Add a New Component (Extensibility)

### Decision tree: Which atomic layer?

```
Does it make API calls or manage complex state?
  YES → Feature Component (src/components/features/)
  NO  → Does it combine multiple primitives?
        YES → UI Component (src/components/ui/)
        NO  → Primitive (src/components/primitives/)
```

### Primitive template
```astro
---
/**
 * MyPrimitive - Layout Primitive
 * One-line description of what this atom does.
 */
interface Props {
  myProp: string;
  class?: string;
  [key: string]: any; // Only if Alpine passthrough is needed
}

const { myProp, class: className, ...rest } = Astro.props;

const baseStyles = "/* Tailwind classes only */";
const combinedClasses = `${baseStyles} ${className || ""}`.trim();
---

<div class={combinedClasses} {...rest}>
  <slot />
</div>
```

### UI Component template
```astro
---
/**
 * MyUIComponent - UI Molecule
 * Combines [PrimitiveA] + [PrimitiveB] to achieve [purpose].
 */
import Heading from "../primitives/Heading.astro";
import Text from "../primitives/Text.astro";

interface Props {
  heading: string;
  description?: string;
  class?: string;
}

const { heading, description, class: className } = Astro.props;
---

<div class:list={["...", className]}>
  <Heading as="h3">{heading}</Heading>
  {description && <Text variant="body" color="muted">{description}</Text>}
</div>
```

### Feature Component template
```astro
---
/**
 * MyFeature - Feature Organism
 * Manages [what state/behavior]. Driven by [behavior-file.ts].
 */
import Section from "../primitives/Section.astro";
import MyUIComponent from "../ui/MyUIComponent.astro";
import { getEntry } from "astro:content";

const content = await getEntry("pages_content", "my-feature");
const data = content?.data;
---

<Section variant="standard" x-data="myFeatureApp">
  <MyUIComponent heading={data?.heading ?? "Default"} />
</Section>

<script>
  import { initMyFeature } from "../../scripts/behaviors/my-feature";
  initMyFeature();
</script>
```

### Behavior file template (`scripts/behaviors/my-feature.ts`)
```typescript
/**
 * myFeature behavior
 * Registers the Alpine.js data component for [feature name].
 */
export function initMyFeature() {
  document.addEventListener("alpine:init", () => {
    window.Alpine.data("myFeatureApp", () => ({
      // state
      isOpen: false,

      // methods
      toggle() {
        this.isOpen = !this.isOpen;
      },
    }));
  });
}
```

---

## P2-7. How to Add a New Brand (Multi-Tenant Extensibility)

The engine is multi-tenant. Adding a new brand requires no code changes — only content and environment changes.

### Checklist for new brand `my-brand`:

1. **Create content directory:** `src/content/my-brand/`
2. **Mirror the directory structure** of `src/content/zelia-vance/` exactly.
3. **Copy and customise** all YAML settings files under `my-brand/settings/`:
   - `brand.yaml` — name, tagline, description, social
   - `navigation.yaml` — menu links
   - `taxonomy.yaml` — product categories, tags, badges
   - `blog-taxonomy.yaml` — blog categories, tags
   - `marketing.yaml` — announcement bar, popups
   - `shipping.yaml` — threshold, slabs
   - `footer.yaml` — newsletter card, column headers
4. **Set `.env`:**
   ```
   PUBLIC_BRAND_ID="my-brand"
   ```
5. **Create brand-specific `global.css`** override if brand has different color tokens.
6. **Keystatic automatically adapts** — it reads `PUBLIC_BRAND_ID` via `import.meta.glob`.

**No code changes required.** The engine resolves all paths via `PUBLIC_BRAND_ID` automatically.

---

## P2-8. Debugging Protocol

When something is broken, follow this exact sequence before touching code.

### Level 1: Visual Bug (Wrong styles)

1. Inspect the element. Find the actual applied classes.
2. Check if it's a token issue: is a raw hex being used instead of a CSS variable?
3. Check Tailwind v4 syntax: is `bg-[var(--token)]` used instead of `bg-(--token)`?
4. Check if a `Section` variant is wrong: `full` removes containment, causing full-bleed.
5. Check if `!important` overrides are fighting: look for `!pt-*` or `!pb-*` conflicts.

### Level 2: Alpine.js Bug (Interactive element not working)

1. Check browser console for Alpine errors.
2. Verify `x-cloak` is present on all `x-show` elements.
3. Verify `[x-cloak] { display: none !important }` is in `global.css` (it is — but check).
4. Verify the Alpine component name in `x-data` matches the registered `Alpine.data("name")`.
5. Verify `alpine:init` event is used — not `DOMContentLoaded`.
6. Check if the behavior `init` function is actually being called in a `<script>` tag.
7. If data is from `define:vars`, verify it's a plain JSON-safe object (no Dates, no class instances, no circular refs).

### Level 3: Data/CMS Bug (Missing or undefined content)

1. Check the collection key: `getEntry("settings", "brand")` — is the second arg the exact filename without extension?
2. Check the content file exists at the expected path: `src/content/{brandId}/settings/brand.yaml`.
3. Check that the collection is registered in `src/content/config.ts`.
4. Use optional chaining everywhere: `entry?.data?.field ?? "fallback"`.
5. Restart the dev server — Astro caches content collection results and may serve stale data after file edits.
6. Check the Zod schema: if the YAML has a field that doesn't match the schema, Astro silently drops the entry.

### Level 4: Build Failure

1. Read the full error. The exact line number and file is always in the output.
2. Check for duplicate `export const prerender` in the same file.
3. Check for missing imports — Astro does not auto-import anything.
4. Check for serialization errors in `define:vars` — pass only JSON-safe values.
5. Check for a Zod validation failure in `config.ts` — a content file has a field that violates schema.
6. Run `npx astro check` to get TypeScript errors without starting the full dev server.

### Level 5: Image Not Loading

1. In dev: Check `PUBLIC_IMAGE_GATEWAY_URL` is either empty (use local files) or set to the Worker URL.
2. In dev with gateway: Images served from R2 — check R2 bucket has the file at `{brandId}/products/filename.webp`.
3. Check `PUBLIC_BRAND_ID` matches the R2 folder prefix.
4. Check the Worker at `assets.zeliavance.com` allows the dev referer in `ALLOWED_DOMAINS`.
5. If `onerror` fallback fires, the R2 image is missing — upload the file to the bucket.

---

## P2-9. Version & Upgrade Notes (Maintain This Section When Dependencies Change)

When a dependency is upgraded, add a dated entry here so future agents know what changed.

### Current Pinned Versions (as of 2026-04-30)
```json
"astro": "^5.16.11"
"tailwindcss": "^4.1.18"
"@tailwindcss/vite": "^4.1.18"
"alpinejs": "^3.15.4"
"@alpinejs/collapse": "^3.15.6"
"@astrojs/cloudflare": "^12.6.13"
"@keystatic/astro": "^5.0.6"
"@keystatic/core": "^0.5.50"
"@splidejs/splide": "^4.1.4"
"fuse.js": "^7.1.0"
"phosphor-icons-astro": "^2.1.1-17042025"
"razorpay": "^2.9.6"
"yaml": "^2.8.3"
```

### Tailwind v4 Breaking Changes vs v3 (Already Applied)
- `@theme {}` block replaces `theme: { extend: {} }` in `tailwind.config.js`
- No `tailwind.config.js` file — config lives in `global.css`
- CSS variable syntax: `bg-(--token)` not `bg-[var(--token)]`
- `@tailwindcss/vite` plugin used, not PostCSS
- `@plugin "@tailwindcss/typography"` in CSS, not JS config

### Astro v5 vs v4 Differences (Already Applied)
- Content Layer API: `loader: glob({...})` replaces directory-based collections
- `getStaticPaths` still works the same way
- Server islands and client islands — same `client:*` directives

---

## P2-10. Keyword Glossary (For Consistent Terminology)

When reading task descriptions, these keywords map to specific architectural concepts:

| Keyword | Means |
|---|---|
| "Pure Engine" | The current atomic/CMS-driven architecture (post-refactor) |
| "Primitive" | `src/components/primitives/` — atoms |
| "UI Component" | `src/components/ui/` — molecules |
| "Feature Component" | `src/components/features/` — organisms |
| "Behavior" | A `scripts/behaviors/*.ts` file that contains Alpine.js logic |
| "Hardcoded" | A string/value in a component file that should be in CMS |
| "De-hardcoded" | Moved from component file to CMS YAML |
| "Section primitive" | `Section.astro` — the layout container wrapper |
| "Content Layer" | Astro's `defineCollection` + `loader: glob()` system |
| "Taxonomy" | `taxonomy.yaml` (products) or `blog-taxonomy.yaml` (blog) |
| "Brand ID" | `PUBLIC_BRAND_ID` env var value (e.g., `"zelia-vance"`) |
| "Flatten" | Convert Astro collection entries to plain JSON-safe objects |
| "Singleton" | A Keystatic singleton — one YAML file for one piece of content |
| "Gated" | Feature/content hidden behind `isAffiliate` check |
| "Containment" | The `max-w-7xl px-4 lg:px-8` inner div of `Section` |
| "Full-bleed" | Edge-to-edge width, no containment (`variant="full"`) |
| "FOUC" | Flash of Unstyled Content — prevented by `x-cloak` |
| "D2C" | Direct-to-Consumer mode (Snipcart enabled) |
| "Affiliate mode" | `PUBLIC_AFFILIATE=true` — no cart, outbound links only |

---

## P2-11. Scalability Maintenance Protocol

When this project grows, update the skill files in this order:

### When a new primitive is created:
→ Add its full prop API to **Part 2, §P2-1**

### When a new content collection is added:
→ Add its collection key to **Part 1, §6 (Content Collections table)**
→ Add its `getEntry()` path to **Part 1, §22 (Quick Reference)**

### When a new settings YAML is introduced:
→ Add to **Part 1, §6 (Critical Settings Files table)**

### When a new behavior is created:
→ Add to **Part 1, §13 (behaviors table)**

### When a dependency is upgraded:
→ Add a dated entry to **Part 2, §P2-9 (Version Notes)**
→ Update the version table
→ Add any breaking changes or syntax differences

### When a new page pattern emerges:
→ Document it in **Part 2, §P2-2 or §P2-3** using the same canonical format

### When a new recurring error is discovered:
→ Add to **Part 1, §18 (Error Patterns table)** with its prevention rule
