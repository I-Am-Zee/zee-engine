---
name: tailwind-v4-engine
description: >
  Enforces Tailwind CSS v4 patterns for the Zelia Vance multi-tenant engine (Astro 5 +
  @tailwindcss/vite). AI agents are trained on v3 data and consistently produce broken patterns —
  wrong config files, deprecated directives, removed utilities, wrong CSS-variable syntax. This skill
  fixes every known hallucination. Read it before touching any Tailwind class or style token.
metadata:
  source: https://github.com/ofershap/tailwind-best-practices
  adapted_for: Zelia Vance Engine (Astro 5, @tailwindcss/vite, global.css @theme)
  tags: tailwind, css, v4, astro, best-practices
---

# Tailwind CSS v4 — Engine Rules

> **Prerequisite:** Read `zelia-vance-engine` skill first.
> This skill is an authoritative extension of that skill's §5 (Token Syntax) and §9 (Error Patterns).

---

## STOP. Read This First.

This project uses **Tailwind CSS v4** with **`@tailwindcss/vite`** (NOT PostCSS).  
All design tokens live in `src/styles/global.css` inside an `@theme {}` block.  
There is **no `tailwind.config.js`**. There are **no `@tailwind` directives**.

If you are about to write any of the following, you are generating v3 code. **Do not.**

| What you're about to write | Why it's wrong |
|---|---|
| `tailwind.config.js` | Replaced by `@theme {}` in CSS |
| `@tailwind base;` / `@tailwind components;` | Replaced by `@import "tailwindcss"` |
| `bg-opacity-50` / `text-opacity-25` | Removed — use slash modifier `bg-red-500/50` |
| `bg-gradient-to-r` | Renamed to `bg-linear-to-r` |
| `!flex` / `!bg-red-500` | Wrong — important modifier is `flex!` / `bg-red-500!` |
| `bg-[var(--color-primary)]` | Wrong — use `bg-(--color-primary)` |
| `shadow-sm` for the smallest shadow | Wrong — it's now `shadow-xs` |
| `@layer utilities { .my-class { } }` | Wrong — use `@utility my-class { }` |
| `postcss-import` or `autoprefixer` in config | Built-in to v4 — never add them |

---

## Rule 1: CSS Import (NOT @tailwind Directives)

**Wrong (v3 — agents hallucinate this):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Correct (v4):**
```css
@import "tailwindcss";
```

**Engine specifics:** In this project, `global.css` starts with `@import "tailwindcss";` followed by
the `@theme {}` block. Never add `@tailwind` directives. Never add a second import.

---

## Rule 2: CSS-First Config with @theme (NOT tailwind.config.js)

**Wrong (v3 — agents hallucinate this):**
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: { brand: "#052b22" },
    },
  },
};
```

**Correct (v4):**
```css
@import "tailwindcss";

@theme {
  --color-brand: #052b22;
  --spacing-18: 4.5rem;
}
```

**Engine specifics:** All tokens for this project are in `src/styles/global.css` under `@theme {}`.
Read that file before adding any token. Never define tokens anywhere else. Never use raw hex in components.

---

## Rule 3: Astro Uses @tailwindcss/vite (NOT PostCSS Plugin)

**Wrong (agents guess this for Astro):**
```js
// postcss.config.mjs
export default {
  plugins: {
    "postcss-import": {},
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

**Correct for this Astro project (`astro.config.mjs`):**
```js
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

`postcss-import` and `autoprefixer` are built-in to v4 — never add them.
This project uses the Vite plugin, not the PostCSS plugin.

---

## Rule 4: CSS Variable Utility Syntax (CRITICAL for this project)

**Wrong (v3 arbitrary value):**
```html
<div class="bg-[var(--color-primary)]"></div>
```

**Wrong (v4 partial — missing parens):**
```html
<div class="bg-[--color-primary]"></div>
```

**Correct (v4 CSS variable shorthand):**
```html
<div class="bg-(--color-primary)"></div>
```

This is the single most common error. Every design token in this project **must** use the `(--token)` syntax.

Full token reference (from `src/styles/global.css`):

| Token | Usage |
|---|---|
| `--color-primary` | `bg-(--color-primary)` `text-(--color-primary)` |
| `--color-background` | `bg-(--color-background)` |
| `--color-surface` | `bg-(--color-surface)` |
| `--color-surface-muted` | `bg-(--color-surface-muted)` |
| `--color-text-main` | `text-(--color-text-main)` |
| `--color-text-muted` | `text-(--color-text-muted)` |
| `--color-text-inverse` | `text-(--color-text-inverse)` |
| `--color-border-subtle` | `border-(--color-border-subtle)` |
| `--color-border-strong` | `border-(--color-border-strong)` |
| `--color-accent-coral` | `bg-(--color-accent-coral)` `text-(--color-accent-coral)` |
| `--color-accent-brass` | `bg-(--color-accent-brass)` `text-(--color-accent-brass)` |
| `--color-accent-emerald` | `bg-(--color-accent-emerald)` `text-(--color-accent-emerald)` |

**NEVER use raw hex values in component files. Always use tokens.**

---

## Rule 5: Opacity — Slash Modifier (NOT opacity utilities)

**Wrong (v3 — removed in v4):**
```html
<div class="bg-red-500 bg-opacity-50"></div>
<div class="text-blue-600 text-opacity-75"></div>
```

**Correct (v4 slash modifier):**
```html
<div class="bg-red-500/50"></div>
<div class="text-blue-600/75"></div>
```

Works with tokens too: `bg-(--color-primary)/80`

---

## Rule 6: Important Modifier Syntax Changed

**Wrong (v3 prefix `!`):**
```html
<div class="!flex !pt-12"></div>
```

**Correct (v4 postfix `!`):**
```html
<div class="flex! pt-12!"></div>
```

> **Engine note:** `<style>` blocks in Feature/Page components are forbidden. Use `!` postfix
> Tailwind utilities to override inherited styles instead of writing CSS.

---

## Rule 7: Gradient Syntax Changed

**Wrong (v3):**
```html
<div class="bg-gradient-to-r from-blue-500 to-purple-500"></div>
```

**Correct (v4):**
```html
<div class="bg-linear-to-r from-blue-500 to-purple-500"></div>
```

v4 also added: `bg-conic-*`, `bg-radial-*`, `bg-linear-45` (degree-based).

---

## Rule 8: Renamed Scale Utilities

In v4, the smallest named variants were renamed. Agents consistently get this wrong:

| v3 name | v4 name | What it means |
|---|---|---|
| `shadow-sm` | `shadow-xs` | Smallest shadow |
| `shadow` | `shadow-sm` | Small shadow (old default) |
| `blur-sm` | `blur-xs` | Smallest blur |
| `rounded-sm` | `rounded-xs` | Smallest radius |

If you want the smallest shadow, write `shadow-xs`. If you write `shadow-sm` you get the **old default size**.

---

## Rule 9: Custom Utilities Use @utility (NOT @layer utilities)

**Wrong (v3):**
```css
@layer utilities {
  .content-auto {
    content-visibility: auto;
  }
}
```

**Correct (v4):**
```css
@utility content-auto {
  content-visibility: auto;
}
```

**Engine specifics:** Custom utilities in this project live in `src/styles/global.css`.
Never add a `@layer utilities` block anywhere.

---

## Rule 10: Container Queries Are Built-In

**Old approach (needed a plugin in v3):**
```html
<!-- Required @tailwindcss/container-queries plugin -->
<div class="@container">...</div>
```

**v4 approach (built-in, no plugin needed):**
```html
<div class="@container">
  <div class="flex flex-col @md:flex-row">
    <!-- Responds to container width, not viewport -->
  </div>
</div>
```

Use `@container` on the parent and `@sm:`, `@md:`, `@lg:` variants on children for component-level
responsive design instead of always using viewport breakpoints.

---

## Rule 11: not-* Variant for Negation

**v4 added a `not-*` variant:**
```html
<!-- Style elements that do NOT match a condition -->
<div class="not-hover:opacity-75 hover:opacity-100"></div>
<div class="not-focus:ring-0 focus:ring-2"></div>
```

---

## Rule 12: @starting-style via starting: Variant

**v4 supports CSS @starting-style for entry animations without JS:**
```html
<div class="starting:opacity-0 opacity-100 transition-opacity duration-300"></div>
```

Use this instead of JavaScript-driven show/hide animations where possible.

---

## Engine-Specific Anti-Patterns (Project Hard Rules)

These are errors specific to this codebase that **must never occur**:

| Anti-Pattern | Correct Pattern |
|---|---|
| `bg-[var(--color-primary)]` | `bg-(--color-primary)` |
| `text-primary` (v3 named class) | `text-(--color-text-main)` |
| Raw hex `#052b22` in a component | `bg-(--color-primary)` |
| `<style>` block in Feature/Page file | Use Tailwind utilities only |
| `tailwind.config.js` | All config is in `src/styles/global.css @theme {}` |
| `@tailwind` directives | `@import "tailwindcss"` only |
| `bg-opacity-*` / `text-opacity-*` | Slash modifier: `bg-red-500/50` |
| `bg-gradient-to-*` | `bg-linear-to-*` |
| `shadow-sm` (wanting smallest shadow) | `shadow-xs` |
| `@layer utilities { }` | `@utility { }` |
| Arbitrary hex `bg-[#052b22]` | Define in `@theme`, use named token |

---

## Quick Verification Checklist

Before committing any Tailwind changes, mentally verify:

- [ ] No `tailwind.config.js` created or modified
- [ ] No `@tailwind` directives added
- [ ] All CSS tokens use `(--token)` syntax, not `[var(--token)]`
- [ ] No raw hex colors in `.astro` component files
- [ ] No `bg-opacity-*` or `text-opacity-*` (use `/50` slash modifier)
- [ ] No `bg-gradient-to-*` (use `bg-linear-to-*`)
- [ ] No `!flex` prefix-important (use `flex!` postfix)
- [ ] No `shadow-sm` when you want the smallest shadow (use `shadow-xs`)
- [ ] No `@layer utilities` blocks (use `@utility`)
- [ ] No `<style>` blocks in Feature or Page files
