/**
 * Keystatic CMS Configuration
 * 
 * LOCAL DEV ONLY — never shipped to Cloudflare Pages production.
 * Maps to the exact same content paths driven by PUBLIC_BRAND_ID.
 * 
 * ADR-003: Keystatic is Local-Dev Only
 */
import { config, fields, collection, singleton } from '@keystatic/core';

const brandId = import.meta.env.PUBLIC_BRAND_ID || 'zelia-vance';

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
        title: fields.slug({ name: { label: 'Title' } }),
        sku: fields.text({ label: 'SKU (e.g. CDR-010)', validation: { isRequired: false } }),
        price: fields.number({ label: 'Price (₹)', validation: { isRequired: true, min: 0 } }),
        salePrice: fields.number({ label: 'Sale Price (₹)', validation: { isRequired: false, min: 0 } }),
        image: fields.text({ label: 'Featured Image URL', validation: { isRequired: true } }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Rings', value: 'rings' },
            { label: 'Necklaces', value: 'necklaces' },
            { label: 'Earrings', value: 'earrings' },
            { label: 'Bracelets', value: 'bracelets' },
            { label: 'Gifts', value: 'gifts' },
            { label: 'Sets', value: 'sets' },
          ],
          defaultValue: 'rings',
        }),
        description: fields.text({ label: 'Short Description', multiline: true, validation: { isRequired: true } }),
        body: fields.mdx({ label: 'Full Description (optional)' }),
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
        hero_image: fields.text({ label: 'Hero Image URL', validation: { isRequired: true } }),
        description: fields.text({ label: 'Description', multiline: true }),
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
        isDraft: fields.checkbox({ label: 'Save as Draft', defaultValue: false }),
        content: fields.mdx({ label: 'Content' }),
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
  },
});
