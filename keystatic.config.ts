/**
 * Keystatic CMS Configuration
 * 
 * LOCAL DEV ONLY — never shipped to Cloudflare Pages production.
 * Maps to the exact same content paths driven by PUBLIC_BRAND_ID.
 * 
 * ADR-003: Keystatic is Local-Dev Only
 */
import { config, fields, collection, singleton } from '@keystatic/core';
import shippingJson from './src/config/shipping.json';

const brandId = import.meta.env.PUBLIC_BRAND_ID || 'zelia-vance';

// ── Tags, Badges & Categories (Predefined via JSON) ─────────────────────────
import taxonomyJson from './src/content/zelia-vance/settings/taxonomy.json';

const brandCategories = taxonomyJson.categories.map(c => ({
  label: c.charAt(0).toUpperCase() + c.slice(1),
  value: c
}));

const brandTags = taxonomyJson.tags.map(t => ({ label: t, value: t }));
const brandBadges = taxonomyJson.badges.map(b => ({ label: b, value: b }));

// ── Shipping Slabs (from shipping.json) ────────────────────────────────────────
const shippingSlabOptions = Object.entries(
  shippingJson.slabs as Record<string, { name: string; weight_kg: number; dimensions: { length: number; breadth: number; height: number } }>
).map(([key, slab]) => ({
  label: `${slab.name} (${slab.dimensions.length}×${slab.dimensions.breadth}×${slab.dimensions.height}cm, ${slab.weight_kg}kg)`,
  value: key,
}));

export default config({
  storage: { kind: 'local' },

  collections: {
    // ── Products ──────────────────────────────────────────────────
    products: collection({
      label: 'Products',
      slugField: 'title',
      path: `src/content/${brandId}/products/*`,
      format: { contentField: 'body' },
      schema: {
        // ── Identity ──
        title: fields.slug({ name: { label: 'Product Title', description: 'The name shown on the product page and browser tab.' } }),
        sku: fields.text({
          label: 'SKU',
          description: 'Format: [SUP]-[TY][MAT][ID] · Example: VOG-NKGLP001 · SUP=Supplier (3 letters), TY=Type (2 letters), MAT=Material (3 letters), ID=Global sequence starting at 001.',
          validation: { isRequired: false },
        }),

        // ── Pricing ──
        price: fields.number({ label: 'Price (₹)', validation: { isRequired: true, min: 1 } }),
        salePrice: fields.number({ label: 'Sale Price (₹)', description: 'Must be lower than regular price. Leave empty if not on sale.', validation: { isRequired: false, min: 1 } }),

        // ── Media ──
        image: fields.text({
          label: 'Featured Image URL',
          description: 'Paste the R2 path: /images/products/filename.webp (or full Worker URL in production).',
          validation: { isRequired: true },
        }),
        gallery: fields.array(
          fields.text({ label: 'Image URL', description: 'R2 path: /images/products/filename.webp' }),
          {
            label: 'Gallery',
            description: 'Max 10 images for performance.',
            itemLabel: (props) => props.value || 'New image URL',
          }
        ),

        // ── Classification ──
        category: fields.select({
          label: 'Category',
          description: 'Single category this product belongs to. Drives the Category pages.',
          options: brandCategories,
          defaultValue: brandCategories[0]?.value ?? 'rings',
        }),
        tags: fields.array(
          fields.select({
            label: 'Tag',
            options: brandTags,
            defaultValue: brandTags[0]?.value ?? 'everyday',
          }),
          {
            label: 'Tags',
            description: 'Used for related products scoring, search, and collections.',
            itemLabel: (props) => props.value || 'New tag',
          }
        ),
        badges: fields.array(
          fields.select({
            label: 'Badge',
            options: brandBadges,
            defaultValue: brandBadges[0]?.value ?? 'new',
          }),
          {
            label: 'Badges',
            description: 'e.g. new, sale, bestseller — used for visual labels on product cards.',
            itemLabel: (props) => props.value || 'New badge',
          }
        ),

        // ── Content ──
        rating: fields.number({ label: 'Rating (0–5)', defaultValue: 4.5, validation: { isRequired: false, min: 0, max: 5 } }),
        description: fields.text({
          label: 'Short Description',
          multiline: true,
          description: 'Max 200 characters. Used on product cards and SEO meta tags.',
          validation: { isRequired: true },
        }),
        publishDate: fields.date({ label: 'Publish Date', description: 'Controls when the product appears on the site.', validation: { isRequired: false } }),

        // ── Variants (Snipcart custom fields) ──
        variant_1: fields.object({
          name: fields.text({ label: 'Option Name', description: 'e.g. Ring Size' }),
          values: fields.text({ label: 'Options (comma-separated)', description: 'e.g. 6, 7, 8, 9, 10' }),
          price_modifiers: fields.text({ label: 'Price Modifiers (optional)', description: 'e.g. 0, 0, +200 — matches option order. Prefix with + or -.' }),
        }, { label: 'Variant 1' }),

        variant_2: fields.object({
          name: fields.text({ label: 'Option Name', description: 'e.g. Metal Finish' }),
          values: fields.text({ label: 'Options (comma-separated)', description: 'e.g. Silver, Gold Plated, Rose Gold' }),
          price_modifiers: fields.text({ label: 'Price Modifiers (optional)', description: 'e.g. 0, +150, +200' }),
        }, { label: 'Variant 2' }),

        variant_3: fields.object({
          name: fields.text({ label: 'Option Name', description: 'e.g. Add-ons' }),
          values: fields.text({ label: 'Options (comma-separated)', description: 'e.g. None, Gift Wrap (+₹99)' }),
          price_modifiers: fields.text({ label: 'Price Modifiers (optional)', description: 'e.g. 0, +99' }),
        }, { label: 'Variant 3 (Add-ons / Gift Options)' }),

        // ── Cross-sells ──
        related_products: fields.array(
          fields.relationship({ label: 'Product', collection: 'products' }),
          {
            label: 'Related Products',
            description: 'Products shown in the Complete the Look / Upsell panel.',
            itemLabel: (props) => props.value || 'Select a product',
          }
        ),

        // ── Logistics ──
        shipping_slab: fields.select({
          label: 'Shipping Slab',
          description: 'Determines the package size and base weight sent to Shiprocket. Dimensions and weight are defined per slab in shipping.json.',
          options: shippingSlabOptions,
          defaultValue: shippingJson.default_slab ?? 'small-jewelry',
        }),

        // ── Full Description (rich text / MDX) ──
        body: fields.mdx({ label: 'Full Description', description: 'Rich text shown on the product detail page. Insert formatting, lists, and specs here.' }),
      },
    }),

    // ── Lookbooks ─────────────────────────────────────────────────
    lookbooks: collection({
      label: 'Lookbooks',
      slugField: 'title',
      path: `src/content/${brandId}/lookbooks/*`,
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        hero_image: fields.text({ label: 'Hero Image URL', description: 'e.g. /images/lookbooks/filename.webp or R2 URL', validation: { isRequired: true } }),
        description: fields.text({ label: 'Description', multiline: true }),
        gallery: fields.array(
          fields.text({ label: 'Image URL', description: 'e.g. /images/lookbooks/filename.webp' }),
          { 
            label: 'Gallery',
            itemLabel: (props) => props.value || 'New Image'
          }
        ),
        products: fields.array(
          fields.relationship({ label: 'Product', collection: 'products' }),
          {
            label: 'Products in this Lookbook',
            description: 'Products featured in this look.',
            itemLabel: (props) => props.value || 'Select a product',
          }
        ),
        body: fields.mdx({ label: 'Content' }),
      },
    }),

    // ── Blog ──────────────────────────────────────────────────────
    blog: collection({
      label: 'Blog Posts',
      slugField: 'title',
      path: `src/content/${brandId}/blog/*`,
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        excerpt: fields.text({ label: 'Excerpt', multiline: true, validation: { isRequired: true } }),
        publishDate: fields.date({ label: 'Publish Date', validation: { isRequired: true } }),
        author: fields.text({ label: 'Author', defaultValue: 'Zelia Vance Team' }),
        image: fields.text({ label: 'Cover Image URL', validation: { isRequired: true } }),
        tags: fields.array(
          fields.text({ label: 'Tag' }),
          { label: 'Tags' }
        ),
        isDraft: fields.checkbox({ label: 'Save as Draft', defaultValue: false }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),

    // ── Legal Pages ───────────────────────────────────────────────
    pages: collection({
      label: 'Legal Pages',
      slugField: 'title',
      path: `src/content/${brandId}/pages/*`,
      format: { contentField: 'body' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        lastUpdated: fields.date({ label: 'Last Updated', validation: { isRequired: false } }),
        body: fields.mdx({ label: 'Content' }),
      },
    }),

    // ── Newsletter ────────────────────────────────────────────────
    newsletter: collection({
      label: 'Newsletter Widgets',
      slugField: 'heading',
      path: `src/content/${brandId}/newsletter/*`,
      format: { data: 'json' },
      // slugField is required by Keystatic types. The filename (footer, modal, section, sidebar)
      // acts as the slug. Do not create new entries or rename existing ones.
      schema: {
        heading: fields.slug({ name: { label: 'Heading', description: 'The headline copy shown in this newsletter widget variant.' } }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
        success_message: fields.text({ label: 'Success Message', defaultValue: 'Thank you for subscribing!', validation: { isRequired: false } }),
      },
    }),
  },

  singletons: {
    // ── Site Settings ─────────────────────────────────────────────
    settings: singleton({
      label: 'Site Settings',
      path: `src/content/${brandId}/settings/site`,
      format: { data: 'yaml' },
      schema: {
        name: fields.text({ label: 'Brand Name', validation: { isRequired: true } }),
        tagline: fields.text({ label: 'Tagline', validation: { isRequired: true } }),
        description: fields.text({ label: 'SEO Description', multiline: true, validation: { isRequired: true } }),
        url: fields.url({ label: 'Site URL', validation: { isRequired: true } }),
        email: fields.object({
          support: fields.text({ label: 'Support Email' }),
          orders: fields.text({ label: 'Orders Email' }),
        }, { label: 'Email Addresses' }),
        phone: fields.object({
          main: fields.text({ label: 'Main Phone' }),
          support: fields.text({ label: 'Support Phone' })
        }, { label: 'Phone Numbers' }),
        address: fields.object({
          street: fields.text({ label: 'Street' }),
          city: fields.text({ label: 'City' }),
          state: fields.text({ label: 'State' }),
          zip: fields.text({ label: 'ZIP' }),
          country: fields.text({ label: 'Country' })
        }, { label: 'Address' }),
        social: fields.object({
          instagram: fields.text({ label: 'Instagram URL' }),
          pinterest: fields.text({ label: 'Pinterest URL' }),
          facebook: fields.text({ label: 'Facebook URL' }),
        }, { label: 'Social Links' }),
        announcement_bar: fields.object({
          enabled: fields.checkbox({ label: 'Enable Announcement Bar', defaultValue: false }),
          text: fields.text({ label: 'Announcement Text' }),
          link: fields.text({ label: 'Announcement Link (optional)' }),
        }, { label: 'Announcement Bar' }),
        popup_modal: fields.object({
          active: fields.checkbox({ label: 'Enable Popup', defaultValue: false }),
          title: fields.text({ label: 'Popup Title' }),
          description: fields.text({ label: 'Popup Description', multiline: true }),
          coupon_code: fields.text({ label: 'Coupon Code' }),
          cta_text: fields.text({ label: 'Button Text', defaultValue: 'Claim My Discount' }),
          // ── Denylist: Brand-specific, Engine logic ──────────────
          denylist: fields.array(
            fields.text({ label: 'Path', description: 'Use /shop for exact, /shop/* for all sub-paths' }),
            {
              label: 'Pages to hide popup on',
              description: 'Popup scripts still run in background. Only the visual popup is suppressed.',
              itemLabel: (props) => props.value || 'New path',
            }
          ),
        }, { label: 'Popup Modal' }),
        free_shipping_threshold: fields.number({ label: 'Free Shipping Threshold (₹)', defaultValue: 3000 }),
        monetization: fields.object({
          show_ads: fields.checkbox({ label: 'Show Ads on Blog Pages', defaultValue: false }),
        }, { label: 'Monetization' }),
      },
    }),

    // ── Collections Grid ──────────────────────────────────────────
    collections_grid: singleton({
      label: 'Featured Collections Grid',
      path: `src/content/${brandId}/collections_grid/data`,
      format: { data: 'yaml' },
      schema: {
        cards: fields.array(
          fields.object({
            title: fields.text({ label: 'Title', validation: { isRequired: true } }),
            slug: fields.text({ label: 'Target Slug', description: 'The exact category name or tag slug (e.g. rings, waterproof)', validation: { isRequired: true } }),
            description: fields.text({ label: 'Description', validation: { isRequired: true } }),
            image: fields.text({ label: 'Image URL', description: 'e.g. /images/collections/filename.webp', validation: { isRequired: true } }),
            type: fields.select({
              label: 'Collection Type',
              options: [
                { label: 'Category Based', value: 'category' },
                { label: 'Tag Based', value: 'tag' },
              ],
              defaultValue: 'category',
            }),
          }),
          {
            label: 'Grid Cards',
            description: 'The explicitly curated cards shown on the /collections page.',
            itemLabel: (props) => props.fields.title.value || 'New Card'
          }
        )
      }
    }),
  },
});
