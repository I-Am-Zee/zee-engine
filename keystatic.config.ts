/**
 * Keystatic CMS Configuration
 * 
 * LOCAL DEV ONLY — never shipped to Cloudflare Pages production.
 * Maps to the exact same content paths driven by PUBLIC_BRAND_ID.
 * 
 * ADR-003: Keystatic is Local-Dev Only
 */
import { config, fields, collection, singleton } from '@keystatic/core';
const brandId = import.meta.env.PUBLIC_BRAND_ID;
if (!brandId) throw new Error('[Keystatic] PUBLIC_BRAND_ID is not set in environment.');

// ── Tags, Badges & Categories (Dynamic via Vite Glob) ─────────────────────────
// Using import.meta.glob for browser-safe dynamic imports in Vite/ESM
const taxonomyFiles: Record<string, any> = import.meta.glob('./src/content/*/settings/taxonomy.json', { eager: true });
const shippingFiles: Record<string, any> = import.meta.glob('./src/content/*/settings/shipping.json', { eager: true });

const taxonomyJson = taxonomyFiles[`./src/content/${brandId}/settings/taxonomy.json`]?.default || { categories: [], tags: [], badges: [] };
const shippingJson = shippingFiles[`./src/content/${brandId}/settings/shipping.json`]?.default || { slabs: {} };

const brandCategories = (taxonomyJson.categories || []).map((c: string) => ({
  label: c.charAt(0).toUpperCase() + c.slice(1),
  value: c
}));

const brandTags = (taxonomyJson.tags || []).map((t: string) => ({ label: t, value: t }));
const brandBadges = (taxonomyJson.badges || []).map((b: string) => ({ label: b, value: b }));

// ── Shipping Slabs (Dynamic via Glob) ───────────────────
const shippingSlabOptions = Object.entries(shippingJson.slabs || {}).map(([key, slab]: [string, any]) => ({
  label: `${slab.name} (${slab.dimensions.length}×${slab.dimensions.breadth}×${slab.dimensions.height}cm, ${slab.weight_kg}kg)`,
  value: key,
}));


export default config({
  storage: { kind: 'local' },

  ui: {
    brand: { name: `${brandId.toUpperCase()}` },
    navigation: {
      'CONTENT': ['products', 'lookbooks', 'blog', 'pages', 'collections_grid'],
      'PAGE CONTENT': ['page_home_hero', 'page_trust_section', 'page_faq', 'page_blog', 'page_newsletter_confirm', 'page_newsletter_success', 'page_checkout_razorpay', 'page_wishlist_empty'],
      'COMPONENT HUB': ['page_headers', 'section_headers', 'newsletter_variants', 'component_coming_soon'],
      'GENERAL UI': ['lookbook_settings'],
      'SETTINGS': ['settings_brand', 'settings_navigation', 'settings_marketing', 'settings_ecommerce', 'settings_shipping', 'settings_tracking'],
    }
  },

  collections: {
    // ── Section Headers (H2 Strategy) ──────────────────────────────
    section_headers: collection({
      label: 'Section Headers',
      slugField: 'id',
      path: `src/content/${brandId}/section_headers/*`,
      format: { data: 'json' },
      schema: {
        id: fields.slug({ 
          name: { 
            label: 'Section Identifier', 
            description: 'INTERNAL ONLY: Changing this will break the connection to the layout.' 
          } 
        }),
        title: fields.text({ label: 'Heading / Title' }),
        subtitle: fields.text({ label: 'Subtitle / Description', multiline: true }),
        button_mode: fields.select({
          label: 'Action Button Mode',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Standard Link', value: 'link' },
            { label: 'Feature Action (Complex)', value: 'feature' }
          ],
          defaultValue: 'none'
        }),
        action_label: fields.text({ 
          label: 'Button Label', 
          description: 'Visible if mode is Link or Feature Action'
        }),
        link_url: fields.text({ 
          label: 'Link URL',
          description: 'Only used if mode is Standard Link'
        }),
      }
    }),

    // ── Newsletter Variants ───────────────────────────────────────
    newsletter_variants: collection({
      label: 'Newsletter Variants',
      slugField: 'id',
      path: `src/content/${brandId}/newsletter/*`,
      format: { data: 'json' },
      schema: {
        id: fields.slug({ 
          name: { 
            label: 'Variant ID', 
            description: 'Internal identifier (footer, modal, section, sidebar). DO NOT CHANGE unless you know what you are doing.' 
          } 
        }),
        heading: fields.text({ label: 'Heading' }),
        description: fields.text({ label: 'Description', multiline: true }),
        success_message: fields.text({ label: 'Success Message' }),
      }
    }),
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

        // ── Variants (Snipcart custom fields) — ONLY in D2C Mode ──
        ...(!isAffiliate ? {
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
        } : {
          // ── Affiliate Specifics ──
          affiliate_url: fields.url({ 
            label: 'Affiliate Link', 
            description: 'The tracked outbound URL (Cuelinks, Admitad, etc.).' 
          }),
          platform: fields.text({ 
            label: 'Partner Store Name', 
            description: 'e.g. Myntra, Nykaa. (Optional, we auto-detect if blank)' 
          }),
        }),

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
          description: 'Refer the Shipping Settings for your brand.',
          options: shippingSlabOptions,
          defaultValue: shippingSlabOptions.length > 0 ? shippingSlabOptions[0]!.value : 'small-packaging',
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
        author: fields.text({ label: 'Author', defaultValue: 'Content Team' }),
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

    // ── Page Headers (H1 Strategy) ────────────────────────────────
    page_headers: collection({
      label: 'Page Headers',
      slugField: 'id',
      path: `src/content/${brandId}/page_headers/*`,
      format: { data: 'json' },
      schema: {
        id: fields.slug({ name: { label: 'Page Identifier', description: 'Internal slug used to map this content to a page.' } }),
        title: fields.text({ label: 'Page Title (H1)' }),
        subtitle: fields.text({ label: 'Page Subtitle / Intro', multiline: true }),
        align: fields.select({
          label: 'Header Alignment',
          options: [
            { label: 'Left (Standard)', value: 'left' },
            { label: 'Center (Editorial)', value: 'center' }
          ],
          defaultValue: 'left'
        })
      }
    }),
  },

  singletons: {
    // ── Brand Identity ─────────────────────────────────────────────
    settings_brand: singleton({
      label: 'Brand Identity',
      path: `src/content/${brandId}/settings/brand`,
      format: { data: 'json' },
      schema: {
        name: fields.text({ label: 'Brand Name', validation: { isRequired: true } }),
        tagline: fields.text({ label: 'Tagline', validation: { isRequired: true } }),
        description: fields.text({ label: 'SEO Description', multiline: true, validation: { isRequired: true } }),
        social: fields.array(
          fields.object({
            platform: fields.select({
              label: 'Platform Icon',
              options: [
                { label: 'Instagram', value: 'PhInstagramLogo' },
                { label: 'Facebook', value: 'PhFacebookLogo' },
                { label: 'Twitter/X', value: 'PhXLogo' },
                { label: 'Pinterest', value: 'PhPinterestLogo' },
                { label: 'TikTok', value: 'PhTiktokLogo' },
                { label: 'YouTube', value: 'PhYoutubeLogo' },
                { label: 'LinkedIn', value: 'PhLinkedinLogo' },
                { label: 'WhatsApp', value: 'PhWhatsappLogo' },
              ],
              defaultValue: 'PhInstagramLogo'
            }),
            url: fields.url({ label: 'Profile URL', validation: { isRequired: true } })
          }),
          {
            label: 'Social Links',
            itemLabel: props => props.fields.platform.value 
              ? props.fields.platform.value.replace('Ph', '').replace('Logo', '').replace('X', 'Twitter/X') 
              : 'New link' 
          }
        ),
      },
    }),

    settings_navigation: singleton({
      label: 'Navigation Menus',
      path: `src/content/${brandId}/settings/navigation`,
      format: { data: 'json' },
      schema: {
        main_menus: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            href: fields.text({ label: 'Link / URL' }),
          }),
          {
            label: 'Main Navigation (after Shop)',
            description: 'Static links like Collections, Lookbooks, etc.',
            itemLabel: (props) => props.fields.label.value || 'New link'
          }
        ),
        support_links: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            href: fields.text({ label: 'Link / URL' }),
          }),
          {
            label: 'Support Links (Footer)',
            description: 'Customer care links like FAQ, Shipping, Returns.',
            itemLabel: (props) => props.fields.label.value || 'New link'
          }
        ),
      }
    }),

    // ── Marketing & Conversion ─────────────────────────────────────
    settings_marketing: singleton({
      label: 'Marketing & Conversion',
      path: `src/content/${brandId}/settings/marketing`,
      format: { data: 'json' },
      schema: {
        announcement_bar: fields.object({
          enabled: fields.checkbox({ label: 'Enable Announcement Bar', defaultValue: false }),
          text: fields.text({ label: 'Announcement Text' }),
          link: fields.text({ label: 'Announcement Link (optional)' }),
        }, { label: 'Announcement Bar 📢' }),

        // --- POPUP HUB ---
        discount_popup: fields.object({
          enabled: fields.checkbox({ label: 'Enable Discount (Coupon) Popup', defaultValue: false }),
          trigger: fields.select({
            label: 'Trigger Mode',
            options: [
              { label: 'Timed Delay', value: 'timed' },
              { label: 'Exit Intent', value: 'exit' },
            ],
            defaultValue: 'timed'
          }),
          delay_seconds: fields.integer({ 
            label: 'Delay (Seconds)', 
            description: 'Only applicable if Trigger Mode is "Timed Delay".',
            defaultValue: 8 
          }),
          title: fields.text({ label: 'Title', defaultValue: 'Unlock 10% Off' }),
          description: fields.text({ label: 'Description', multiline: true }),
          coupon_code: fields.text({ label: 'Coupon Code' }),
          image: fields.text({ label: 'Image URL', description: 'e.g. /images/popups/discount.webp' }),
          cta_text: fields.text({ label: 'Button Text', defaultValue: 'Claim My Discount' }),
          denylist: fields.array(
            fields.text({ label: 'Path', description: 'e.g. /checkout' }),
            { label: 'Exclusion Patterns', description: 'Pages where this popup is hidden.' }
          )
        }, { label: 'Discount Popup (D2C Only) 🏷️' }),

        newsletter_popup: fields.object({
          enabled: fields.checkbox({ label: 'Enable Newsletter Popup', defaultValue: false }),
          trigger: fields.select({
            label: 'Trigger Mode',
            options: [
              { label: 'Timed Delay', value: 'timed' },
              { label: 'Exit Intent', value: 'exit' },
            ],
            defaultValue: 'exit'
          }),
          delay_seconds: fields.integer({ 
            label: 'Delay (Seconds)', 
            description: 'Only applicable if Trigger Mode is "Timed Delay".',
            defaultValue: 15 
          }),
          title: fields.text({ label: 'Title', defaultValue: 'Join the Inner Circle' }),
          description: fields.text({ label: 'Description', multiline: true }),
          image: fields.text({ label: 'Image URL', description: 'e.g. /images/popups/newsletter.webp' }),
          denylist: fields.array(
            fields.text({ label: 'Path', description: 'e.g. /checkout' }),
            { label: 'Exclusion Patterns', description: 'Pages where this popup is hidden.' }
          )
        }, { label: 'Newsletter Popup 📧' }),
      },
    }),
    // ── Page Content ──────────────────────────────────────────────
    page_home_hero: singleton({
      label: 'Home-Hero Section',
      path: `src/content/${brandId}/pages_content/home`,
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Hero Title', validation: { isRequired: true } }),
        subtitle: fields.text({ label: 'Hero Subtitle', multiline: true, validation: { isRequired: true } }),
        cta_label_primary: fields.text({ label: 'Primary Button Label', defaultValue: 'Shop Now' }),
        cta_link_primary: fields.text({ label: 'Primary Button Link', defaultValue: '/shop' }),
        cta_label_secondary: fields.text({ label: 'Secondary Button Label', defaultValue: 'View Lookbooks' }),
        cta_link_secondary: fields.text({ label: 'Secondary Button Link', defaultValue: '/lookbooks' }),
        image: fields.text({ label: 'Hero Image URL', description: 'e.g. /images/hero/filename.webp' }),
      }
    }),

    // ── Shipping Logistics ─────────────────────────────────────────
    settings_shipping: singleton({
      label: 'Shipping Logistics',
      path: `src/content/${brandId}/settings/shipping`,
      format: { data: 'json' },
      schema: {
        free_shipping_threshold: fields.number({ label: 'Free Shipping Threshold (₹)', defaultValue: 3000 }),
        default_slab: fields.text({ label: 'Default Slab Key', defaultValue: 'small-packaging' }),
        slabs: fields.object({
          'small-packaging': fields.object({
            name: fields.text({ label: 'Slab Name', defaultValue: 'Small Packaging' }),
            weight_kg: fields.number({ label: 'Weight (kg)', defaultValue: 0.5 }),
            dimensions: fields.object({
              length: fields.number({ label: 'Length (cm)', defaultValue: 15 }),
              breadth: fields.number({ label: 'Breadth (cm)', defaultValue: 15 }),
              height: fields.number({ label: 'Height (cm)', defaultValue: 10 }),
            })
          }),
          'medium-packaging': fields.object({
            name: fields.text({ label: 'Slab Name', defaultValue: 'Medium Packaging' }),
            weight_kg: fields.number({ label: 'Weight (kg)', defaultValue: 1.0 }),
            dimensions: fields.object({
              length: fields.number({ label: 'Length (cm)', defaultValue: 20 }),
              breadth: fields.number({ label: 'Breadth (cm)', defaultValue: 20 }),
              height: fields.number({ label: 'Height (cm)', defaultValue: 15 }),
            })
          }),
          'large-packaging': fields.object({
            name: fields.text({ label: 'Slab Name', defaultValue: 'Large Packaging' }),
            weight_kg: fields.number({ label: 'Weight (kg)', defaultValue: 2.0 }),
            dimensions: fields.object({
              length: fields.number({ label: 'Length (cm)', defaultValue: 25 }),
              breadth: fields.number({ label: 'Breadth (cm)', defaultValue: 25 }),
              height: fields.number({ label: 'Height (cm)', defaultValue: 20 }),
            })
          }),
        }, { label: 'Shipping Slabs' })
      },
    }),

    // ── Analytics & Monetization ───────────────────────────────────
    settings_tracking: singleton({
      label: 'Analytics & Tracking',
      path: `src/content/${brandId}/settings/tracking`,
      format: { data: 'json' },
      schema: {
        show_ads: fields.checkbox({ label: 'Show Ads on Blog Pages', defaultValue: false }),
        google_analytics_id: fields.text({ label: 'Google Analytics ID (G-XXXXX)', validation: {isRequired: false} }),
        meta_pixel_id: fields.text({ label: 'Meta Pixel ID', validation: {isRequired: false} })
      },
    }),

    // ── Collections Grid ──────────────────────────────────────────
    // ── Trust Section (Editorial Split) ──────────────────────────
    page_trust_section: singleton({
      label: 'Trust Section',
      path: `src/content/${brandId}/pages_content/trust_section`,
      format: { data: 'json' },
      schema: {
        main_heading: fields.text({ label: 'Main Section Heading (Above columns)' }),
        hero_image: fields.text({ label: 'Editorial Hero Image', description: 'R2 path: /images/identity/filename.webp' }),
        markers: fields.array(
          fields.object({
            title: fields.text({ label: 'Title' }),
            description: fields.text({ label: 'Detailed Description', multiline: true }),
            icon: fields.text({ label: 'Icon Name (Phosphor)', description: 'e.g. PhCheck, PhGift' }),
          }),
          {
            label: 'Trust Markers',
            itemLabel: (props) => props.fields.title.value || 'New Marker'
          }
        )
      }
    }),

    // ── General UI Labels (Outcasts/Standalone) ─────────────────
    lookbook_settings: singleton({
      label: 'Lookbook Page Settings',
      path: `src/content/${brandId}/settings/lookbook_settings`,
      format: { data: 'json' },
      schema: {
        narrative_heading: fields.text({ label: 'Lookbook Narrative Title', description: 'e.g. The Narrative' }),
        carousel_eyebrow: fields.text({ label: 'Homepage Carousel Eyebrow', description: 'e.g. Curated Story' }),
        carousel_cta_label: fields.text({ label: 'Homepage Carousel Button Label', description: 'e.g. Explore Look' }),
      }
    }),

    component_coming_soon: singleton({
      label: 'Component: Coming Soon',
      path: `src/content/${brandId}/component_hub/coming_soon`,
      format: { data: 'json' },
      schema: {
        heading: fields.text({ label: 'Heading', description: 'Use {category} for dynamic injection.' }),
        description: fields.text({ label: 'Description', multiline: true, description: 'Use {category} for dynamic injection.' }),
        cta_primary_label: fields.text({ label: 'Primary Button Label' }),
        cta_primary_link: fields.text({ label: 'Primary Button Link' }),
        cta_secondary_label: fields.text({ label: 'Secondary Button Label' }),
        cta_secondary_link: fields.text({ label: 'Secondary Button Link' }),
      }
    }),

    page_faq: singleton({
      label: 'FAQ Page',
      path: `src/content/${brandId}/pages_content/faq`,
      format: { data: 'json' },
      schema: {
        heading: fields.text({ label: 'Main Heading' }),
        subtitle: fields.text({ label: 'Subtitle', multiline: true }),
        categories: fields.array(
          fields.object({
            title: fields.text({ label: 'Category Title' }),
            icon: fields.text({ label: 'Icon Name (Phosphor)', description: 'e.g. PhInfo, PhTruck' }),
            questions: fields.array(
              fields.object({
                question: fields.text({ label: 'Question' }),
                answer: fields.text({ label: 'Answer', multiline: true }),
              }),
              {
                label: 'Questions',
                itemLabel: (props) => props.fields.question.value || 'New Question'
              }
            )
          }),
          {
            label: 'FAQ Categories',
            itemLabel: (props) => props.fields.title.value || 'New Category'
          }
        )
      }
    }),

    page_wishlist_empty: singleton({
      label: 'Wishlist Page (Empty)',
      path: `src/content/${brandId}/pages_content/wishlist_empty`,
      format: { data: 'json' },
      schema: {
        heading: fields.text({ label: 'Heading' }),
        description: fields.text({ label: 'Description', multiline: true }),
        cta_label: fields.text({ label: 'Button Label' }),
        cta_link: fields.text({ label: 'Button Link' }),
      }
    }),

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
            is_coming_soon: fields.checkbox({
              label: 'Coming Soon (No Products)',
              defaultValue: false,
              description: 'Overrides products. Shows the Coming Soon UI on the category/tag page.'
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

    page_blog: singleton({
      label: 'Blog Page',
      path: `src/content/${brandId}/pages_content/blog`,
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Page Title', defaultValue: 'The Journal' }),
        subtitle: fields.text({ 
          label: 'Subtitle', 
          defaultValue: 'Style notes, care guides, and the stories behind our collections.',
          multiline: true 
        }),
        empty_state: fields.text({ 
          label: 'Empty State Message', 
          defaultValue: 'Our stories are being penned. Coming soon.' 
        }),
      },
    }),

    page_newsletter_confirm: singleton({
      label: 'Newsletter: Confirm Page',
      path: `src/content/${brandId}/pages_content/newsletter_confirm`,
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Page Title', defaultValue: 'Stay in the Loop' }),
        description: fields.text({ 
          label: 'SEO Description', 
          defaultValue: 'Join our inner circle for rare arrivals, seasonal pieces, and occasional exclusives.',
          multiline: true 
        }),
        heading_locked: fields.text({ label: 'Heading (Locked)', defaultValue: 'One quiet step to join our inner circle.' }),
        heading_open: fields.text({ label: 'Heading (Open)', defaultValue: 'Stay in the loop.' }),
        description_locked: fields.text({ 
          label: 'Description (Locked)', 
          defaultValue: "We share rare updates — new arrivals, seasonal pieces, and the occasional exclusive reserved for people who've been here since the beginning. Nothing more.",
          multiline: true 
        }),
        description_open: fields.text({ 
          label: 'Description (Open)', 
          defaultValue: "Enter your Gmail below to receive rare updates — new arrivals, seasonal pieces, and the occasional exclusive reserved for people who've been here since the beginning.",
          multiline: true 
        }),
        email_placeholder: fields.text({ label: 'Email Placeholder', defaultValue: 'Enter your Gmail address' }),
        email_error: fields.text({ label: 'Email Error Message', defaultValue: 'Please enter a valid Gmail address.' }),
        submit_label: fields.text({ label: 'Submit Button Label', defaultValue: 'Yes, stay in the loop' }),
        footer_note: fields.text({ 
          label: 'Footer Note', 
          defaultValue: "Your email stays private. No spam, no exceptions.\nYou can leave any time via the unsubscribe link in any email.",
          multiline: true 
        }),
      },
    }),

    page_newsletter_success: singleton({
      label: 'Newsletter: Success Page',
      path: `src/content/${brandId}/pages_content/newsletter_success`,
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Page Title', defaultValue: "You're in the Loop" }),
        description: fields.text({ 
          label: 'SEO Description', 
          defaultValue: 'Welcome to our inner circle.',
          multiline: true 
        }),
        heading: fields.text({ label: 'Success Heading', defaultValue: "You're in the loop." }),
        message_primary: fields.text({ 
          label: 'Primary Message', 
          defaultValue: "From this moment forward, you'll be among the first to hear about new arrivals, seasonal pieces, and things we quietly reserve for people who've been here since the beginning.",
          multiline: true 
        }),
        message_secondary: fields.text({ 
          label: 'Secondary Message', 
          defaultValue: "We write rarely. When we do, it means something.",
          multiline: true 
        }),
        cta_label: fields.text({ label: 'Button Label', defaultValue: 'Continue Exploring' }),
        cta_link: fields.text({ label: 'Button Link', defaultValue: '/collections' }),
        unsubscribe_note: fields.text({ label: 'Unsubscribe Note', defaultValue: 'You can unsubscribe at any time from any email we send.' }),
      },
    }),

    page_checkout_razorpay: singleton({
      label: 'Checkout: Razorpay Bridge',
      path: `src/content/${brandId}/pages_content/checkout_razorpay`,
      format: { data: 'json' },
      schema: {
        title: fields.text({ label: 'Page Title', defaultValue: 'Payment' }),
        subtitle_loading: fields.text({ label: 'Subtitle (Loading)', defaultValue: 'Connecting securely…' }),
        amount_label: fields.text({ label: 'Amount Label', defaultValue: 'Order Total' }),
        button_loading: fields.text({ label: 'Button (Loading)', defaultValue: 'Loading…' }),
        button_ready: fields.text({ label: 'Button (Ready)', defaultValue: 'Pay Now' }),
        status_opening: fields.text({ label: 'Status (Opening)', defaultValue: 'Opening secure payment window…' }),
        status_verifying: fields.text({ label: 'Status (Verifying)', defaultValue: 'Confirming your payment…' }),
        status_confirmed: fields.text({ label: 'Status (Confirmed)', defaultValue: '✓ Payment confirmed! Redirecting…' }),
        error_expired: fields.text({ label: 'Error (Expired)', defaultValue: 'Unable to load your order. The session may have expired.' }),
        error_config: fields.text({ label: 'Error (Config)', defaultValue: 'Configuration error — contact support' }),
        trust_badge_ssl: fields.text({ label: 'Trust: SSL', defaultValue: '256-bit SSL Encryption' }),
        trust_badge_razorpay: fields.text({ label: 'Trust: Razorpay', defaultValue: 'Powered by Razorpay' }),
        trust_badge_pci: fields.text({ label: 'Trust: PCI', defaultValue: 'PCI DSS Compliant' }),
      },
    }),

    settings_ecommerce: singleton({
      label: 'Ecommerce Settings',
      path: `src/content/${brandId}/settings/ecommerce`,
      format: { data: 'json' },
      schema: {
        roadmap_status: fields.text({
          label: 'Roadmap & Future Blueprint',
          description: "### Ecommerce Settings: Future Feature\n\nThis tab is reserved for future global ecommerce configurations (e.g., forced manual currency overrides).\n\nFor the technical blueprint regarding Multi-Currency Snipcart processing and Geo-Detection, refer to:\n\n**`.plans/todo/ROADMAP_MULTI_CURRENCY.md`**",
          defaultValue: 'Planned / Not Active',
          validation: { isRequired: true }
        })
      },
    }),
  },
});
