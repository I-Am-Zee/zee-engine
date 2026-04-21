# Home Page Carousel Audit — Restoration Plan

**Target:** `src/pages/index.astro`
**Date:** 2026-04-21

## 1. "The Style Archives" (Category Carousel)
- **Current State:** Partially Hardcoded. 
- **Implementation:** The categories displayed are derived from the `taxonomy.json` categories list, but the carousel logic in `index.astro` currently maps over a fixed selection or a slice of that list.
- **Goal:** Move "Featured Categories" into a Keystatic Singleton (`settings/homepage.yml`). 
- **Action:** Add a `fields.array` for `featured_categories` in Keystatic that allows the user to select and order which categories appear on the homepage.

## 2. "The Curator's Choice" (Product Carousel)
- **Current State:** Hardcoded Slugs. 
- **Implementation:** `index.astro` passes a static array of product IDs to the `ProductCarousel` component.
- **Goal:** Move these "Hand-picked" products into the Keystatic `homepage` Singleton.
- **Action:** Add a `fields.array` with `fields.relationship` to the `products` collection.

## 3. Implementation Plan (Post-Affiliate Core)
Once the Affiliate Brand gating is stable, we should implement a `Home Page Hub` in Keystatic:

```typescript
// Proposed Keystatic Singleton
homepage: singleton({
  label: 'Home Page Manager',
  path: `src/content/${brandId}/settings/homepage`,
  schema: {
    hero: fields.object({...}),
    category_strip: fields.object({
      title: fields.text({ label: 'Title', defaultValue: 'The Style Archives' }),
      categories: fields.array(fields.text({ label: 'Category Name' }))
    }),
    curators_choice: fields.object({
      title: fields.text({ label: 'Title', defaultValue: 'The Curator\'s Choice' }),
      products: fields.array(fields.relationship({ collection: 'products' }))
    })
  }
})
```

---
**Status:** Audit Complete. Implementation mapped to Chunk I (Content Hub Restoration).
