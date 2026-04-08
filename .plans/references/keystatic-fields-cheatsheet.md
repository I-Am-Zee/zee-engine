# Keystatic Fields Cheatsheet
> Reference for this project. Saved to avoid re-reading docs every session.
> Source: https://keystatic.com/docs

## Available Fields

| Field | Import | Use Case |
|---|---|---|
| `fields.text()` | always | Single or multiline text |
| `fields.slug()` | slugField only | Auto-generates slug from text. Used as the collection identifier. |
| `fields.number()` | always | Integers or decimals. Supports `min` / `max` validation. |
| `fields.date()` | always | Date picker. Returns ISO string. |
| `fields.checkbox()` | always | Boolean toggle |
| `fields.select()` | always | Single-option dropdown. Needs `options: [{label, value}]` + `defaultValue`. |
| `fields.multiselect()` | always | Multi-option checkboxes. Same API as select but returns array. |
| `fields.relationship()` | always | Combobox/fuzzy picker pointing to another collection by slug. |
| `fields.array()` | always | Repeating items. Wrap any field. Add `itemLabel` to show actual value. |
| `fields.object()` | always | Group of fields. Collapsed in UI by default. |
| `fields.url()` | always | URL input with format validation |
| `fields.mdx()` | always | Rich WYSIWYG editor for MDX content |
| `fields.markdoc()` | always | Rich text editor for Markdoc (alternative to MDX) |
| `fields.image()` | always | Stores image file IN THE REPO. NOT suitable for R2 workflows. Use `fields.text()` for R2 URLs. |
| `fields.conditional()` | always | Shows different fields based on a condition (like a switch). |

---

## Key Patterns

### itemLabel — Show real values in arrays
Without `itemLabel`, array items show "Item 1, Item 2". Always add:
```ts
fields.array(
  fields.text({ label: 'Image URL' }),
  {
    label: 'Gallery',
    itemLabel: (props) => props.value || 'New image',
  }
)
```

### fields.relationship — Fuzzy combobox product picker
```ts
related_products: fields.array(
  fields.relationship({ label: 'Product', collection: 'products' }),
  {
    label: 'Related Products',
    itemLabel: (props) => props.value || 'Select a product',
  }
)
```
> Note: stores the slug string only. If a product's slug changes, links break.

### fields.select — Dropdown from dynamic list
```ts
// Build options from shipping.json at top of config:
const shippingSlabOptions = Object.entries(shippingJson.slabs).map(([key, slab]) => ({
  label: `${slab.name} (${slab.dimensions.length}×...)`,
  value: key,
}));

// Use in field:
shipping_slab: fields.select({
  label: 'Shipping Slab',
  options: shippingSlabOptions,
  defaultValue: 'small-jewelry',
})
```

### Newsletter collection — No renaming
The newsletter collection entries (`footer`, `modal`, `section`, `sidebar`) are **predefined** by filename.
Keystatic still requires `slugField` at the type level. Use `fields.slug()` on heading.
The heading value entered in the UI becomes the slug. Keep headings unique to avoid slug conflicts.

---

## ⛔ Limitations (Local Mode)

| Feature | Status |
|---|---|
| R2 file browser / image picker | ❌ Not possible. Use `fields.text()` for URL |
| `fields.cloud-image` | ❌ Requires paid Keystatic Cloud |
| `fields.image` | ⚠️ Saves into `/public/` in repo — wrong for our R2 setup |
| Truly derived/disabled fields | ❌ Cannot show computed values from other fields |

---

## slugField Rules
- Every `collection()` **must** have a `slugField`
- The slugField **must** use `fields.slug()` (not `fields.text()`)
- The slug becomes the file identifier and URL slug
- Singletons do NOT need `slugField`
