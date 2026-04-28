# Post-Sorting Engine Tasks

## YAML "Clean Sweep" Migration
- [x] Migrate `src/content/{brand}/pages_content/*.json` to `.yaml`.
- [x] Migrate `src/content/{brand}/settings/*.json` (including taxonomy/shipping) to `.yaml`.
- [x] Update `keystatic.config.ts` format settings for all migrated collections/singletons.
- [x] Update `import.meta.glob` paths in Keystatic config for taxonomy/shipping using Vite YAML plugin.
- [x] Audit `index.astro`, `Footer.astro`, and other components to ensure `getEntry` calls are working correctly with new extensions.

## CMS Polish
- [x] Add "Storefront Settings" singleton to Keystatic for global sorting/feature toggles.
