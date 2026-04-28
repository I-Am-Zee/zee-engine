# Blog Engine Handoff — Zelia Vance / Multi-Tenant Engine
> **Created:** 2026-04-28  
> **Reference Conversation ID:** `c92c0b6b-2ae3-403b-93e6-631413eeec5b`  
> **Branch:** `feature/pure-engine-phase-3-refactor`  
> **Status at handoff:** Blog Index + Cards design fully aligned, ready to build. Blog Post layout deferred to after.

---

## 0. How to Get Context Back

The full conversation with all design decisions is in conversation ID `c92c0b6b-2ae3-403b-93e6-631413eeec5b`. Read that if you need to trace back any decision to its source discussion.

Key files to read before touching anything:
- `AGENTS.md` — Master rules. Non-negotiable.
- `CONTEXT FILES.AGENTS/THE ATOMIC DESIGN.md` — Component rules.
- `CONTEXT FILES.AGENTS/THE STACK OF CODEBASE.md` — Tech stack.
- `.plans/todo/ROADMAP_APRIL_28_STABILIZATION.md` — The active task list. Blog Engine is Phase 1.
- `.plans/ARCHITECTURE-DECISIONS.md` — Past architectural decisions.
- `src/content/config.ts` — Content collections. Fully migrated to YAML.

---

## 1. What Was Done Before This Handoff

### Completed in This Session
- ✅ **getEntry Audit** — Full sweep. All `getEntry` calls are YAML-compatible.
  - Fixed `src/content/config.ts` — taxonomy loader now uses `taxonomy.yaml` + `yaml.parse()` (was `taxonomy.json` + `JSON.parse()`)
  - Fixed `src/pages/brand/[slug].astro` — slug normalization now strips `.yaml|.yml|.json` extensions
  - Fixed `src/components/features/NewsletterWidget.astro` — updated comments to reference `.yaml` files
- ✅ **Roadmap created** — `.plans/todo/ROADMAP_APRIL_28_STABILIZATION.md`
- ✅ **AGENTS.md updated** — reflects current priorities, NewsletterWidget section variant deprecation

### Next Item on Roadmap
**Blog Engine Overhaul** — this is what this handoff is about.

---

## 2. Blog Index Page — Full Design Specification

### 2.1 Page Structure (top to bottom)

```
<EngineLayout>
  ├── Page Header (H1 + Description)     ← page_headers singleton, key: "blog-index"
  ├── FilterSortBar                       ← existing component, context="blog"
  └── Two-column layout (desktop)
        ├── LEFT: Category Filter Sidebar  ← NEW component
        └── RIGHT: Blog Card List          ← BlogCard.astro (horizontal variant)
  └── Pagination                          ← existing Pagination.astro
```

### 2.2 Page Header
- Same pattern as the Shop page (`/shop`)
- Uses `getEntry('page_headers', 'blog-index')` — create this YAML file
- Has `heading` (H1) and `description` fields
- Rendered using the same `SectionHeader` or `PageHeader` component pattern

### 2.3 FilterSortBar
- **Already built and already blog-aware.** `FilterSortBar.astro` accepts `context="blog"` 
- Reads blog-specific sort options from `settings/sorting-methods.yaml` under the `blog.enabled_sorts` key
- Shows "X articles total" on the left, sort dropdown on the right
- **No changes needed** to this component — just pass `context="blog"` and the article count

### 2.4 Category Filter Sidebar
- **NEW component** — `src/components/ui/BlogCategoryFilter.astro`
- Renders as a sticky left sidebar on ≥1024px
- Renders as a **horizontal chips row** above the cards on 768–1023px
- Hidden on mobile (filter is simplified — just use default sort, no category filter on mobile for now, or later we can add a filter sheet)
- Data source: `src/content/{brand}/settings/blog-taxonomy.yaml` → `categories` array
- Each category = a checkbox (desktop sidebar) or a chip/pill (tablet strip)
- Alpine.js powers the selection state — `selectedCategories: []`
- "Showing X filtered" sub-label below the "Category Filter" heading when active
- All posts shown when no categories selected (default state)
- **No new behaviors file needed** — Alpine inline `x-data` on the page is sufficient given the simplicity

### 2.5 Blog Card Grid — Responsive Layout

#### Card Variant: HORIZONTAL (list style)
Used at: **≥768px** (with sidebar at ≥1024px, full-width single column at 768–1023px)

Layout inside the card:
```
[ IMAGE (square-ish, left) ] | [ Category Badge (top) ]
                              | [ Title              ]
                              | [ Excerpt (2 lines)  ]
                              | [ Metadata strip     ]
```

Metadata strip (bottom of right column):
- Author avatar (circle, small) → Author Name (bold) → separator dot → Publish Date → separator dot → Read Time ("X min read")

#### Card Variant: VERTICAL (stacked)
Used at: **<768px** (responsive grid)

Layout:
```
[ IMAGE (full width, top) — Category Badge overlaid top-left ]
[ Title                                                       ]
[ Excerpt (2 lines, clamped)                                  ]
[ Metadata strip: avatar · Name · Date · Read Time            ]
```

#### Grid Breakpoints (Vertical Card Only)
| Breakpoint | Columns |
|---|---|
| < 400px | 1 column |
| 400–639px | 2 columns |
| 640–767px | 3 columns |
| 768–1023px | Single-column horizontal cards (no sidebar, chips filter above) |
| ≥ 1024px | Sidebar left + horizontal cards right |

### 2.6 Pagination
- **Existing `src/components/ui/Pagination.astro`** — use as-is, no changes needed
- It accepts: `currentPage`, `totalPages`, `baseUrl`
- Static Astro pagination with `getStaticPaths` + `paginate()` — generates `/blog`, `/blog/2`, `/blog/3` etc.
- **Fixed page size: 8 posts per page** — no per-page selector (dropped by design decision)
- `baseUrl="/blog"`

---

## 3. Blog Card Component — Full Specification

### File: `src/components/ui/BlogCard.astro`
This file **already exists** but needs a full redesign. The current version is a basic block. Replace it entirely.

### Props
```typescript
interface Props {
  post: CollectionEntry<"blog">;
  variant?: "horizontal" | "vertical"; // default: "horizontal"
  class?: string;
}
```

### Data Needed from `post.data`
- `title` — heading
- `excerpt` — 2-line clamped text
- `publishDate` — formatted with `en-IN` locale
- `image` — via `Image.astro` primitive
- `tags` — first tag used as Category Badge (or a dedicated `category` field if we add one)
- `author` — string name, used to look up `authors.yaml`

### Read Time
- **Not stored in frontmatter.** Calculated at build time.
- Utility function: `src/scripts/utils/reading-time.ts` → `calculateReadTime(content: string): string`
- Formula: `Math.ceil(wordCount / 200)` → returns `"X min read"`
- Word count = strip markdown syntax, count spaces + 1
- **Important:** Astro's `render()` returns `headings` and the rendered `Content` component but NOT raw text. To get word count, use the raw body from `post.body` (available on the collection entry before render)

### Author Avatar
- Lookup from `authors.yaml` (see Section 4)
- If author name matches a key in `authors.yaml` → use that author's `avatar` image
- First author in `authors.yaml` is always the default/fallback
- For now: dummy placeholder image path (e.g. `/images/authors/placeholder.jpg`)
- **No option C (initials). No option A (per-post field).** — Option B only.

---

## 4. New Files to Create

### 4.1 `src/content/{brand}/settings/blog-taxonomy.yaml`
Blog-specific tags. Separate from product `taxonomy.yaml`. Example:
```yaml
categories:
  - Style Guide
  - Behind the Scenes
  - Care Tips
  - Trend Report
  - Jewellery 101
  - Gift Guide
```
**Ask the user for Zelia Vance's actual initial tag list before creating this.**

### 4.2 `src/content/{brand}/authors.yaml`
Shared author registry per brand.
```yaml
authors:
  - name: "Zelia Vance Team"        # default — always first
    avatar: "/images/authors/placeholder.jpg"
    bio: "The editorial voice of Zelia Vance."
  - name: "Raunak Singh"
    avatar: "/images/authors/placeholder.jpg"
    bio: "Founder & creative lead."
```
- First entry = default author (used when post's `author` field doesn't match any entry)
- Keystatic will be configured to let you pick from this list when writing a blog post

### 4.3 `src/content/{brand}/page_headers/blog-index.yaml`
```yaml
heading: "The Zelia Vance Journal"
description: "Style stories, care guides, and the art of wearing less, better."
```

### 4.4 `src/scripts/utils/reading-time.ts`
Pure utility. No side effects. Safe to import from UI components.

### 4.5 Content Collection Registration
`authors` collection needs to be added to `src/content/config.ts` with a proper schema.

---

## 5. Existing Components to Reuse (No Modification)

| Component | Where Used | Notes |
|---|---|---|
| `src/components/ui/FilterSortBar.astro` | Above cards | Pass `context="blog"` |
| `src/components/ui/Pagination.astro` | Below cards | Pass `currentPage`, `totalPages`, `baseUrl="/blog"` |
| `src/components/primitives/Image.astro` | Inside BlogCard | Standard usage |
| `src/components/primitives/Heading.astro` | Inside BlogCard, page header | Use `size` prop — do NOT hardcode font sizes |
| `src/components/primitives/Text.astro` | Inside BlogCard | Use `variant` prop |
| `src/components/primitives/Badge.astro` | Category tag on card image | Glassmorphism style |

---

## 6. Existing Files to Modify

### `src/pages/blog/index.astro`
Full rebuild. Implement:
- `getStaticPaths` + `paginate()` with `pageSize: 8`
- `getEntry('page_headers', 'blog-index')` for header
- Pass `context="blog"` to FilterSortBar
- Alpine.js `x-data` for category filter state
- Two-column layout (sidebar + cards grid)
- Responsive chip filter at 768–1023px
- Correct BlogCard variant switching

### `src/content/config.ts`
Add `authors` collection schema.

### `keystatic.config.ts`
Add `authors` singleton/collection so it's manageable from the CMS. Also add `blog-taxonomy` singleton.

---

## 7. What Comes AFTER This (Don't Do Now)

These are the next items in order after the Blog Index is done:

1. **Blog Post Layout** (`src/pages/blog/[...slug].astro`) — user has ideas for this, 2-column layout with sticky TOC sidebar. A separate design discussion will happen first.
2. **Search Page Blog Toggle** — extend `/search` to toggle between Products and Blog fuzzy search. Smart UX, not overwhelming.
3. **Free Shipping Nudge Visual Fix**
4. **PopupModal Scoping**
5. See `.plans/todo/ROADMAP_APRIL_28_STABILIZATION.md` for full ordered list.

---

## 8. Architectural Rules (Non-Negotiable — from AGENTS.md)

- **Tailwind CSS v4 ONLY.** No `<style>` blocks in feature components or pages.
- CSS variables syntax: `bg-(--color-primary)` NOT `bg-[var(--color-primary)]`
- Colors from CSS custom properties only. Never raw hex in components.
- Atomic Design: BlogCard = UI molecule. Blog filter sidebar = UI molecule. Blog index page orchestrates them.
- No API calls in UI components. Alpine.js inline is fine for simple filter state.
- `Heading.astro` must use the `size` prop — do NOT hardcode `text-xl`, `text-2xl` etc. in class overrides.
- Read `AGENTS.md` Section 5 (Atomic Design Rules) fully before creating any component.

---

## 9. Open Questions Remaining (Ask User)

1. **Blog tag list for Zelia Vance** — what are the actual initial categories for `blog-taxonomy.yaml`?
2. **Author image for placeholder** — user said "don't worry about it for now, map dummy sample image." Confirm path.
3. **`sorting-methods.yaml`** — check that the `blog.enabled_sorts` key exists in this file. If not, add `latest`, `oldest`, `name-asc` as defaults.
