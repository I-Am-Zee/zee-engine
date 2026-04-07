# Full Site Audit — Zelia Vance Engine

## 1. LAYOUT AUDIT
✅ `src/components/features/BrandEngine.astro` correctly imports `snipcart-events.ts` and `snipcart-init.ts`.
✅ `src/components/features/BrandEngine.astro` correctly loads `snipcart.css` via `<link rel="stylesheet" href="https://cdn.snipcart.com/themes/v3.7.5/default/snipcart.css" />` as well as the custom palette override.
✅ The script loading order is correct. The Snipcart config script comes before the CDN JS script in `src/components/features/BrandEngine.astro`.

## 2. PAGES AUDIT
⚠️ **PAGES USING THE WRONG LAYOUT:** The following pages are directly using `<BaseLayout>` instead of the required `<EngineLayout>` wrapper:
- `src/pages/shipping.astro` (Line 3)
- `src/pages/privacy-policy.astro` (Line 3)
- `src/pages/returns.astro` (Line 3)
- `src/pages/lookbooks/[slug].astro` (Line 6)
- `src/pages/lookbooks/index.astro` (Line 10)
- `src/pages/terms-of-service.astro` (Line 3)

## 3. COMPONENT AUDIT
✅ `src/components/ui/PopupModal.astro`: The `denylist` prop is correctly typed (`denylist?: string[]`) and properly handled (`const denylist = data.denylist || [];`) before being passed to the `x-data` attribute.
✅ `src/scripts/behaviors/popup.ts`: The Alpine.js behavior correctly receives and utilizes `denylist` to verify path suppression.
✅ `src/components/features/BrandEngine.astro` correctly passes the `snipcart-init.ts` and `snipcart-events.ts` scripts.

## 4. CONTENT SCHEMA AUDIT
⚠️ `src/content/config.ts`: The 'settings' collection schema is **missing** the `monetization` field (`monetization: z.object({ show_ads: z.boolean() }).optional()`). It does not match the `monetization` setting present in Keystatic and the affiliate setting file.
✅ Other required fields (`name`, `tagline`, `description`, `url`, `email`, `phone`, `address`, `social`, `announcement_bar`, `popup_modal` with `denylist` array, `free_shipping_threshold`) are properly configured and match what is in `src/content/zelia-vance/settings/site.yml`.

## 5. KEYSTATIC CONFIG AUDIT
✅ `keystatic.config.ts`: All collection paths dynamically use `import.meta.env.PUBLIC_BRAND_ID`.
✅ `products`, `blog`, `lookbooks`, and the `settings` singleton are all correctly mapped to their respective paths.
✅ No TypeScript type errors or mismatched field types found in the Keystatic config for these collections.

## 6. ENV AUDIT
✅ `.env.example`: All required variables are fully documented.
✅ `PUBLIC_BRAND_ID`, `PUBLIC_SITE_URL`, `PUBLIC_AFFILIATE`, `PUBLIC_SNIPCART_API_KEY`, and `IMAGE_GATEWAY_URL` are all present.

## 7. AFFILIATE PLACEHOLDER AUDIT
✅ `src/content/affiliate_zee/` directory exists with the required subfolders: `blog/` and `settings/`.
✅ `src/content/affiliate_zee/settings/site.yml` exists and contains valid YAML structure.

## 8. DEEP SCHEMA & KEYSTATIC MAPPING AUDIT
⚠️ **MISSING FIELDS IN KEYSTATIC:** The `src/content/config.ts` schemas contain several fields that are missing in the corresponding `keystatic.config.ts` configuration. This means content editors cannot manage these fields via the CMS.
- **Products:** Missing `gallery`, `tags`, `badges`, `rating`, `publishDate`, variants (`variant_1`, `variant_2`, `variant_3`), urgency fields (`release_date`, `urgency_tag`), cross-selling (`related_products`), and logistics (`weight`, `shipping_slab`, `dimensions`).
- **Lookbooks:** Missing `gallery` and `products` array mapping.
- **Blog:** Missing `tags`.
- **Settings:** Missing phone numbers, physical address mapping, and `free_shipping_threshold` configuration mismatches (missing in CMS).
- **Newsletter:** The entire `newsletter` collection is present in `config.ts` but missing from `keystatic.config.ts`.

## 9. WHITE-LABEL ARCHITECTURE AUDIT (HARDCODED VALUES)
⚠️ **HARDCODED CATEGORIES:** Both `src/content/config.ts` (Lines 56-64) and `keystatic.config.ts` (Lines 29-40) have hardcoded product categories specific to jewelry (`rings`, `necklaces`, `earrings`, `bracelets`, `gifts`, `sets`).
- **Violation:** This breaks the multi-tenant white-label design for brands outside this vertical (e.g., clothing). These options must be refactored to map dynamically from a brand-specific settings array.

## 10. AFFILIATE FOLDER STRUCTURE COMPLETENESS
⚠️ **MISSING CONTENT FOLDERS:** The `src/content/affiliate_zee/` directory is missing critical content folders required for a fully functional affiliate engine.
- Missing `products/` folder (for affiliate product links).
- Missing `lookbooks/` folder.

## 11. PRIMITIVE COMPONENTS AUDIT
✅ **ATOMIC DESIGN STRUCTURE:** The primitives (`Badge`, `Button`, `Heading`, `Icon`, `Image`, `Input`, `Link`, `Logo`, `Text`) are correctly placed in `src/components/primitives/` and do not import higher-order components, successfully adhering to Atomic Design principles.
✅ **USAGE & IMPORTS:** Searched across all `src/components/ui/`, `src/components/features/`, and `src/pages/` directories. Primitives are consistently imported using standard relative paths (`../primitives/...` or `../../components/primitives/...`) and their props correctly map to standard variants.
⚠️ **IMAGE GATEWAY PATH DEPENDENCY:** In `src/components/primitives/Image.astro`, the `IMAGE_GATEWAY_URL` transformation explicitly relies on the `/images/` path prefix to remap assets to Cloudflare R2 (e.g., `/images/` -> `/${brandId}/`). If a CMS upload maps to a different local path structure, the Cloudflare edge image worker fallback will fail for that asset.
