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
