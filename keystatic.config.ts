/**
 * Keystatic CMS Configuration
 * 
 * LOCAL DEV ONLY — never shipped to Cloudflare Pages production.
 * Maps to the exact same content paths driven by PUBLIC_BRAND_ID.
 * 
 * ADR-003: Keystatic is Local-Dev Only
 */
import { config, fields, collection, singleton } from '@keystatic/core';
const brandId = (typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_BRAND_ID) || (typeof process !== 'undefined' && process.env?.PUBLIC_BRAND_ID);
const isAffiliate = ((typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_AFFILIATE) || (typeof process !== 'undefined' && process.env?.PUBLIC_AFFILIATE)) === 'true';

if (!brandId) throw new Error('[Keystatic] PUBLIC_BRAND_ID is not set in environment.');

// ── Tags, Badges & Categories (Dynamic via Vite Glob) ─────────────────────────
// Using import.meta.glob for browser-safe dynamic imports in Vite/ESM
const taxonomyFiles: Record<string, any> = import.meta.glob('./src/content/*/settings/taxonomy.yaml', { eager: true });
const shippingFiles: Record<string, any> = import.meta.glob('./src/content/*/settings/shipping.yaml', { eager: true });

const taxonomyJson = taxonomyFiles[`./src/content/${brandId}/settings/taxonomy.yaml`]?.default || { categories: [], tags: [], badges: [] };
const shippingJson = shippingFiles[`./src/content/${brandId}/settings/shipping.yaml`]?.default || { slabs: {} };

const brandCategories = (taxonomyJson.categories || []).map((c: string) => ({
  label: c.charAt(0).toUpperCase() + c.slice(1),
  value: c
}));

const brandTags = (taxonomyJson.tags || []).map((t: string) => ({ label: t, value: t }));
const brandBadges = (taxonomyJson.badges || []).map((b: string) => ({ label: b, value: b }));

// ── Blog Taxonomy (Separate from product taxonomy) ─────────────────────────
const blogTaxonomyFiles: Record<string, any> = import.meta.glob('./src/content/*/settings/blog-taxonomy.yaml', { eager: true });
const blogTaxonomyJson = blogTaxonomyFiles[`./src/content/${brandId}/settings/blog-taxonomy.yaml`]?.default || { categories: [], tags: [] };

const blogCategories = (blogTaxonomyJson.categories || []).map((c: string) => ({
  label: c,
  value: c,
}));
const blogTags = (blogTaxonomyJson.tags || []).map((t: string) => ({ label: t, value: t }));

// ── Legal Taxonomy (Dynamic via Glob) ───────────────────
const legalTaxFiles: Record<string, any> = import.meta.glob('./src/content/*/settings/legal-taxonomy.yaml', { eager: true });
const legalTaxJson = legalTaxFiles[`./src/content/${brandId}/settings/legal-taxonomy.yaml`]?.default || { tax_classes: [] };

const hsnOptions = [
  { label: `Default — ${legalTaxJson.tax_classes[0]?.label || 'Standard'} (${(legalTaxJson.tax_classes[0]?.rate || 0) * 100}% GST)`, value: '' },
  ...legalTaxJson.tax_classes.map((tc: any) => ({
    label: `${tc.hsn} — ${tc.label} (${tc.rate * 100}%)`,
    value: tc.hsn
  }))
];


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
      'CONTENT': ['products', 'lookbooks', 'blog', 'legal', 'brand', 'collections_grid'],
      'STOREFRONT SETTINGS': ['storefront_weights', 'storefront_methods'],
      'PAGE CONTENT': [
        'page_home_hero', 
        'page_home_carousel',
        'page_trust_section', 
        'page_faq', 
        'page_newsletter_confirm', 
        'page_newsletter_success'
      ],
      'COMPONENT HUB': ['page_headers', 'section_headers', 'newsletter_variants', 'component_coming_soon'],
      'UI MICROCOPY': ['ui_blog', 'ui_search', 'ui_wishlist'],
      'GENERAL UI': ['lookbook_settings'],
      'SETTINGS': isAffiliate 
        ? ['settings_brand', 'settings_navigation', 'settings_marketing', 'settings_store_checkout', 'settings_affiliate', 'settings_shipping', 'settings_tracking']
        : ['settings_brand', 'settings_legal', 'settings_navigation', 'settings_marketing', 'settings_store_checkout', 'settings_shipping', 'settings_tracking'],
      'PEOPLE': ['authors'],
    }
  },

  collections: {
    // ── Section Headers (H2 Strategy) ──────────────────────────────
    section_headers: collection({
      label: 'Section Headers',
      slugField: 'id',
      path: `src/content/${brandId}/section_headers/*`,
      format: { data: 'yaml' },
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
            { label: 'Feature Action (Add-to-Cart)', value: 'feature' }
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
      format: { data: 'yaml' },
      schema: {
        id: fields.slug({ 
          name: { 
            label: 'Variant ID', 
            description: 'Internal identifier (footer, modal, section, sidebar). DO NOT CHANGE unless you know what you are doing.' 
          } 
        }),
        heading: fields.text({ label: 'Heading' }),
        description: fields.text({ label: 'Description', multiline: true }),
        placeholder: fields.text({ label: 'Email Placeholder', defaultValue: 'Enter your Gmail address' }),
        button_text: fields.text({ label: 'Button Label', defaultValue: 'Subscribe' }),
        disclaimer: fields.text({ label: 'Disclaimer Text', defaultValue: 'We only accept Gmail addresses for high-intent delivery.' }),
        success_message: fields.text({ label: 'Success Message' }),
        image: fields.text({ label: 'Editorial Image URL', description: 'Paste the R2 path: /images/newsletter/filename.webp' }),
      }
    }),
    // ── Products ──────────────────────────────────────────────────
    // storefront singletons moved to singletons object below

    products: collection({
      label: 'Products',
      slugField: 'title',
      path: `src/content/${brandId}/products/*`,
      format: { contentField: 'body' },
      schema: {
        // ── Identity ──
        title: fields.slug({ name: { label: 'Product Title', description: 'The name shown on the product page and browser tab.' } }),
        // ── Identity (Moved to D2C block below to hide for affiliates) ──

        // ── Pricing (Moved to D2C block below to hide for affiliates) ──

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

        // ── Mode-Specific Fields (D2C vs Affiliate) ──
        // import.meta.env is used here because Astro's keystatic integration natively
        // supports Vite replacement in this config file for both node & browser contexts.
        ...(!isAffiliate ? {
          // ── D2C: Identity & Pricing ──
          sku: fields.text({
            label: 'SKU',
            description: 'Format: [SUP]-[TY][MAT][ID] · Example: VOG-NKGLP001 · SUP=Supplier (3 letters), TY=Type (2 letters), MAT=Material (3 letters), ID=Global sequence starting at 001.',
            validation: { isRequired: false },
          }),
          price: fields.number({ label: 'Price (₹)', validation: { isRequired: true, min: 1 } }),
          salePrice: fields.number({ label: 'Sale Price (₹)', description: 'Must be lower than regular price. Leave empty if not on sale.', validation: { isRequired: false, min: 1 } }),
          hsn_override: fields.select({
            label: 'Tax Class (HSN)',
            description: 'Leave as Default for standard products. Only change if this product has a different GST rate.',
            options: hsnOptions,
            defaultValue: ''
          }),

          // ── D2C: Snipcart Variants ──
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
          // ── Affiliate: Outbound Links (Multi-Region) ──
          affiliate_links: fields.array(
            fields.object({
              region: fields.select({
                label: 'Region / Country',
                options: [
                  { label: 'India', value: 'india' },
                  { label: 'Global / USA', value: 'global' },
                ],
                defaultValue: 'india'
              }),
              url: fields.url({ label: 'Affiliate URL', validation: { isRequired: true } }),
              platform: fields.text({ label: 'Partner Platform', description: 'e.g. Myntra, Amazon' }),
              partnerProductId: fields.text({ label: 'Partner Product ID / SKU', description: 'The unique ID from the partner platform (e.g. Amazon ASIN).', validation: { isRequired: false } }),
              price: fields.number({ label: 'Price (Numeric)', validation: { isRequired: true } }),
              salePrice: fields.number({ label: 'Sale Price (Numeric)', description: 'Leave empty if not on sale', validation: { isRequired: false } }),
              currency: fields.text({ label: 'Currency', defaultValue: 'INR' }),
            }),
            {
              label: 'Affiliate Links by Region',
              description: 'Add the partner links and prices for the regions where this product is available.',
              itemLabel: (props) => `${props.fields.platform.value || 'Link'} (${props.fields.region.value})`
            }
          ),
        }),

        // ── Cross-sells ──
        related_products: fields.array(
          fields.relationship({ label: 'Product', collection: 'products' }),
          {
            label: 'Upsell Collection (Complete the Look)',
            description: 'Products shown in the PDP "Collection" / Upsell panel.',
            itemLabel: (props) => props.value || 'New product selection',
          }
        ),

        // ── Logistics (D2C Only) ──
        ...(!isAffiliate ? {
          shipping_slab: fields.select({
            label: 'Shipping Slab',
            description: 'Refer the Shipping Settings for your brand.',
            options: shippingSlabOptions,
            defaultValue: shippingSlabOptions.length > 0 ? shippingSlabOptions[0]!.value : 'small-packaging',
          }),
        } : {}),

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
        category: fields.select({
          label: 'Category',
          description: 'Single category this post belongs to. Drives the Category pages and filters.',
          options: blogCategories,
          defaultValue: blogCategories[0]?.value ?? 'Style Guide',
        }),
        tags: fields.array(
          fields.select({ label: 'Tag', options: blogTags, defaultValue: blogTags[0]?.value ?? '' }),
          { label: 'Tags', itemLabel: (props) => props.value || 'Select a tag' }
        ),
        isDraft: fields.checkbox({ label: 'Save as Draft', defaultValue: false }),
        content: fields.mdx({ label: 'Content' }),
      },
    }),

    // ── Legal Pages ───────────────────────────────────────────────
    legal: collection({
      label: 'Legal Pages',
      slugField: 'title',
      path: `src/content/${brandId}/legal/*`,
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        lastUpdated: fields.date({ label: 'Last Updated' }),
        isDraft: fields.checkbox({ label: 'Draft Mode', defaultValue: false }),
        content: fields.mdx({
          label: 'Content',
          options: {
            image: {
              directory: `src/assets/images/legal`,
              publicPath: `../../assets/images/legal`,
            },
          },
        }),
      },
    }),
    brand: collection({
      label: 'Brand Stories',
      slugField: 'slug',
      path: `src/content/${brandId}/brand/*`,
      format: { data: 'yaml' },
      schema: {
        title: fields.text({ label: 'Internal Title (Used as Page Eyebrow)' }),
        slug: fields.text({ label: 'Slug' }),
        isDraft: fields.checkbox({ label: 'Draft Mode', defaultValue: false }),
        
        // --- THE HERO (SINGLETON PER PAGE) ---
        hero: fields.object({
          heading: fields.text({ label: 'Hero Heading' }),
          text: fields.text({ label: 'Hero Description/Italic Lead', multiline: true }),
          image: fields.text({ label: 'Hero Image Path (R2/Local)' }),
          isImmersive: fields.checkbox({ label: 'Enable Immersive Reveal (GSAP)', defaultValue: false }),
        }, { label: 'Hero Section (Top of Page)' }),

        // --- THE BODY SECTIONS ---
        sections: fields.array(
          fields.object({
            layout: fields.select({
              label: 'Layout Style',
              options: [
                { label: 'No Image (Centered Content Column)', value: 'no-image' },
                { label: 'Magazine Flow: Image Left (Wraps Text)', value: 'image-left' },
                { label: 'Magazine Flow: Image Right (Wraps Text)', value: 'image-right' },
              ],
              defaultValue: 'image-right',
            }),
            alignment: fields.select({
              label: 'Text Alignment',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
              ],
              defaultValue: 'left',
            }),
            
            // --- THE STACK (Modular Vertical Column) ---
            stack: fields.blocks({
              heading: {
                label: 'Heading',
                schema: fields.object({
                  type: fields.select({
                    label: 'Size',
                    options: [
                      { label: 'H2 (Large)', value: 'h2' },
                      { label: 'H3 (Medium)', value: 'h3' },
                      { label: 'H4 (Small)', value: 'h4' },
                    ],
                    defaultValue: 'h2',
                  }),
                  content: fields.text({ label: 'Heading Text' }),
                  italic: fields.checkbox({ label: 'Italic Styling', defaultValue: false }),
                }),
              },
              text: {
                label: 'Text',
                schema: fields.object({
                  type: fields.select({
                    label: 'Variant',
                    options: [
                      { label: 'Paragraph (Body)', value: 'paragraph' },
                      { label: 'Lead (Introductory)', value: 'lead' },
                      { label: 'Muted (Secondary)', value: 'muted' },
                      { label: 'Eyebrow (Label)', value: 'eyebrow' },
                      { label: 'Callout (Sidebar Style)', value: 'callout' },
                      { label: 'Quote (Blockquote)', value: 'quote' },
                    ],
                    defaultValue: 'paragraph',
                  }),
                  content: fields.text({ label: 'Text Content', multiline: true }),
                  italic: fields.checkbox({ label: 'Italic Styling', defaultValue: false }),
                }),
              },
            }, { label: 'Content Stack' }),

            image: fields.object({
              url: fields.text({ label: 'Image URL/Path' }),
              alt: fields.text({ label: 'Alt Text' }),
              caption: fields.text({ label: 'Visible Caption' }),
              mobileOffset: fields.integer({ 
                label: 'Image After (Block #)', 
                defaultValue: 0 
              }),
            }, { label: 'Section Image' }),
          }),
          {
            label: 'Body Sections',
            itemLabel: (props) => props.fields.layout.value.toUpperCase() + ' Section',
          }
        ),
      },
    }),


    // ── Page Headers (H1 Strategy) ────────────────────────────────
    page_headers: collection({
      label: 'Page Headers',
      slugField: 'id',
      path: `src/content/${brandId}/page_headers/*`,
      format: { data: 'yaml' },
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
      format: { data: 'yaml' },
      schema: {
        name: fields.text({ label: 'Brand Name', validation: { isRequired: true } }),
        tagline: fields.text({ label: 'Tagline', validation: { isRequired: true } }),
        description: fields.text({ label: 'SEO Description', multiline: true, validation: { isRequired: true } }),
        primary_color: fields.text({ label: 'Primary Brand Color (Hex)', description: 'e.g. #052b22. Used for Razorpay theme and external UI.', defaultValue: '#052b22' }),
        contact_email: fields.text({ label: 'Contact Email', description: 'Main public contact address (e.g. hello@brand.com)', validation: { isRequired: true } }),
        site_url: fields.text({ label: 'Site URL', description: 'The public URL of the website (e.g. https://brand.com)', validation: { isRequired: true } }),
        feedback_url: fields.text({ label: 'Feedback Form URL', description: 'Tally.so or similar URL for post-delivery feedback.', validation: { isRequired: true } }),
        social: fields.array(
          fields.object({
            platform: fields.select({
              label: 'Platform Name',
              options: [
                { label: 'Instagram', value: 'Instagram' },
                { label: 'Facebook', value: 'Facebook' },
                { label: 'Twitter/X', value: 'Twitter/X' },
                { label: 'Pinterest', value: 'Pinterest' },
                { label: 'TikTok', value: 'TikTok' },
                { label: 'YouTube', value: 'YouTube' },
                { label: 'LinkedIn', value: 'LinkedIn' },
                { label: 'WhatsApp', value: 'WhatsApp' },
              ],
              defaultValue: 'Instagram'
            }),
            url: fields.url({ label: 'Profile URL', validation: { isRequired: true } })
          }),
          {
            label: 'Social Links',
            itemLabel: props => props.fields.platform.value || 'New link'
          }
        ),
      },
    }),

    settings_legal: singleton({
      label: 'Legal Settings',
      path: `src/content/${brandId}/settings/legal`,
      format: { data: 'yaml' },
      schema: {
        legal_entity: fields.text({ label: 'Legal Entity Name', description: 'e.g. I Am Zee. Used for Copyright text at the bottom of the page.', defaultValue: 'I Am Zee' }),
        gstin: fields.text({ label: 'GSTIN Number', description: 'Your business GST registration number.', defaultValue: '03AALFI7890P1ZK' }),
        tax_origin_state: fields.text({ label: 'Tax Origin State (for CGST/SGST)', description: 'e.g. Punjab. Used to trigger intra-state tax split.', defaultValue: 'Punjab' }),
        tax_origin_state_code: fields.text({ label: 'Tax Origin State Code (ISO Abbreviation)', description: 'e.g. PB for Punjab. Must be the 2-letter ISO state code, not the full name. Used for province matching in the tax engine.', defaultValue: 'PB' }),
      },
    }),

    settings_navigation: singleton({
      label: 'Navigation Menus',
      path: `src/content/${brandId}/settings/navigation`,
      format: { data: 'yaml' },
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
        legal_links: fields.array(
          fields.object({
            label: fields.text({ label: 'Label' }),
            href: fields.text({ label: 'Link / URL' }),
          }),
          {
            label: 'Legal Links (Bottom Bar)',
            description: 'Links for the bottom footer bar (e.g., Privacy Policy, Terms of Service).',
            itemLabel: (props) => props.fields.label.value || 'New link'
          }
        ),
        labels: fields.object({
          shop: fields.text({ label: 'Shop', defaultValue: 'Shop' }),
          allJewelry: fields.text({ label: 'All Jewelry', defaultValue: 'All Jewelry' }),
          search: fields.text({ label: 'Search', defaultValue: 'Search' }),
          wishlist: fields.text({ label: 'Wishlist', defaultValue: 'Wishlist' }),
          cart: fields.text({ label: 'Cart', defaultValue: 'Cart' }),
          account: fields.text({ label: 'Account', defaultValue: 'Account' }),
          menu: fields.text({ label: 'Menu', defaultValue: 'Menu' }),
          close: fields.text({ label: 'Close', defaultValue: 'Close' }),
        }),
      }
    }),

    ui_blog: singleton({
      label: 'Blog UI',
      path: `src/content/${brandId}/settings/ui_blog`,
      format: { data: 'yaml' },
      schema: {
        empty_states: fields.object({
          no_posts: fields.text({ label: 'No Posts Message' }),
          no_results: fields.text({ label: 'No Filter Results Message' }),
        }, { label: 'Empty States 📭' }),
      },
    }),

    ui_search: singleton({
      label: 'Search UI',
      path: `src/content/${brandId}/settings/ui_search`,
      format: { data: 'yaml' },
      schema: {
        title: fields.text({ label: 'Page Title' }),
        description: fields.text({ label: 'Description', multiline: true }),
        placeholder: fields.text({ label: 'Search Placeholder' }),
        filters: fields.object({
          all: fields.text({ label: 'All Filter' }),
          product: fields.text({ label: 'Product Filter' }),
          blog: fields.text({ label: 'Blog Filter' }),
        }, { label: 'Filter Labels' }),
        empty_states: fields.object({
          initial: fields.object({
            heading: fields.text({ label: 'Heading' }),
            subtext: fields.text({ label: 'Subtext' }),
          }),
          no_results: fields.object({
            heading: fields.text({ label: 'Heading' }),
            description: fields.text({ label: 'Description', multiline: true }),
            cta_label: fields.text({ label: 'Button Label' }),
            cta_link: fields.text({ label: 'Button Link' }),
          }),
        }, { label: 'Empty States 📭' }),
      },
    }),

    ui_wishlist: singleton({
      label: 'Wishlist UI',
      path: `src/content/${brandId}/settings/ui_wishlist`,
      format: { data: 'yaml' },
      schema: {
        empty_states: fields.object({
          heading: fields.text({ label: 'Heading' }),
          description: fields.text({ label: 'Description', multiline: true }),
          cta_label: fields.text({ label: 'Button Label' }),
          cta_link: fields.text({ label: 'Button Link' }),
        }, { label: 'Empty States 📭' }),
      },
    }),

    // ── Marketing & Conversion ─────────────────────────────────────
    settings_marketing: singleton({
      label: 'Marketing & Conversion',
      path: `src/content/${brandId}/settings/marketing`,
      format: { data: 'yaml' },
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

        // --- TRANSACTIONAL EMAIL COPY ---
        delivery_email_template: fields.text({ 
          label: 'Delivery Notification Template (HTML)', 
          multiline: true,
          description: 'Use {{brandName}}, {{feedbackUrl}}, and {{newsletterUrl}} as placeholders.'
        }),
      },
    }),
    // ── Page Content ──────────────────────────────────────────────
    page_home_hero: singleton({
      label: 'Home-Hero Section',
      path: `src/content/${brandId}/pages_content/home`,
      format: { data: 'yaml' },
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

    // ── Shipping Logistics (D2C Only) ──────────────────────────────
    settings_shipping: singleton({
      label: 'Shipping Logistics',
      path: `src/content/${brandId}/settings/shipping`,
      format: { data: 'yaml' },
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
      format: { data: 'yaml' },
      schema: {
        show_ads: fields.checkbox({ label: 'Show Ads on Blog Pages', defaultValue: false }),
        google_analytics_id: fields.text({ label: 'Google Analytics ID (G-XXXXX)', validation: {isRequired: false} }),
        meta_pixel_id: fields.text({ label: 'Meta Pixel ID', validation: {isRequired: false} }),
        google_adsense_id: fields.text({ label: 'Google AdSense Publisher ID (ca-pub-XXX)', validation: {isRequired: false} }),
        cuelinks_id: fields.text({ label: 'Cuelinks ID', description: 'For Affiliate mode automation.', validation: {isRequired: false} }),
      },
    }),

    // ── Collections Grid ──────────────────────────────────────────
    // ── Trust Section (Editorial Split) ──────────────────────────
    page_trust_section: singleton({
      label: 'Trust Section',
      path: `src/content/${brandId}/pages_content/trust_section`,
      format: { data: 'yaml' },
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
      format: { data: 'yaml' },
      schema: {
        narrative_heading: fields.text({ label: 'Lookbook Narrative Title', description: 'e.g. The Narrative' }),
        carousel_eyebrow: fields.text({ label: 'Homepage Carousel Eyebrow', description: 'e.g. Curated Story' }),
        carousel_cta_label: fields.text({ label: 'Homepage Carousel Button Label', description: 'e.g. Explore Look' }),
        bundle_pricing_label: fields.text({ label: 'Bundle Pricing Label', defaultValue: '✨ Exclusive Bundle Pricing Applied' }),
      }
    }),
    // storefront_settings singleton removed in favor of storefront collection

    component_coming_soon: singleton({
      label: 'Component: Coming Soon',
      path: `src/content/${brandId}/component_hub/coming_soon`,
      format: { data: 'yaml' },
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
      format: { data: 'yaml' },
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

    page_home_carousel: singleton({
      label: 'Home-Product Carousel',
      path: `src/content/${brandId}/pages_content/home_carousel`,
      format: { data: 'yaml' },
      schema: {
        featured_products: fields.array(
          fields.relationship({ label: 'Product', collection: 'products' }),
          {
            label: 'Featured Products (Curator\'s Choice)',
            description: 'Select the specific products to show in the homepage carousel. Leave empty to fallback to newest arrivals. Number of products selected is exactly what will be shown.',
            itemLabel: (props) => props.value || 'Select a product',
          }
        ),
      }
    }),

    page_newsletter_confirm: singleton({
      label: 'Newsletter: Confirm Page',
      path: `src/content/${brandId}/pages_content/newsletter_confirm`,
      format: { data: 'yaml' },
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
      format: { data: 'yaml' },
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

    settings_store_checkout: singleton({
      label: 'Store & Checkout Settings',
      path: `src/content/${brandId}/settings/store_checkout`,
      format: { data: 'yaml' },
      schema: {
        roadmap_status: fields.text({
          label: 'Roadmap & Future Blueprint',
          description: "### Global Store Configuration (D2C Only)\n\nThis tab is reserved for future checkout routing (Razorpay India vs Stripe Global) and forced manual currency overrides.\n\nFor the technical blueprint regarding Multi-Currency Snipcart processing and Geo-Detection, refer to:\n\n**`.plans/todo/ROADMAP_MULTI_CURRENCY.md`**",
          defaultValue: 'Planned / Not Active',
          validation: { isRequired: true }
        })
      },
    }),
    settings_affiliate: singleton({
      label: 'Affiliate & Currency Settings',
      path: `src/content/${brandId}/settings/affiliate_settings`,
      format: { data: 'yaml' },
      schema: {
        geo_detection_enabled: fields.checkbox({
          label: 'Enable Soft Region Auto-Detection',
          description: 'Automatically detects user locale (e.g., matching to India or Global). Users can manually override this preference.',
          defaultValue: true
        }),
        preference_expiry_hours: fields.integer({
          label: 'Region Preference Expiry (Hours)',
          description: 'How long the user\'s local storage holds their region choice before auto-detecting again.',
          defaultValue: 24
        }),
        regions: fields.array(
          fields.object({
            id: fields.text({ label: 'Region ID (e.g. india, usa, uk)', validation: { isRequired: true } }),
            name: fields.text({ label: 'Display Name', validation: { isRequired: true } }),
            currency: fields.text({ label: 'Currency Code (e.g. INR, USD)', validation: { isRequired: true } }),
            locale: fields.text({ label: 'Formatting Locale (e.g. en-IN, en-US)', validation: { isRequired: true } })
          }),
          {
            label: 'Configured Regions',
            itemLabel: props => `${props.fields.name.value} (${props.fields.id.value})`
          }
        ),
        fallback_region_id: fields.text({ label: 'Fallback Region ID (if detection fails)', defaultValue: 'global' }),
      }
    }),
    storefront_weights: singleton({
      label: 'Tag Weights',
      path: `src/content/${brandId}/settings/tag-weights`,
      format: { data: 'yaml' },
      schema: {
        w5: fields.array(fields.select({ label: 'Tag/Badge', options: [...brandTags, ...brandBadges].length > 0 ? [...brandTags, ...brandBadges] : [{ label: 'Select Tag', value: '' }], defaultValue: ([...brandTags, ...brandBadges][0]?.value ?? '') }), { label: 'Weight 5 (Super Priority)', itemLabel: props => props.value }),
        w4: fields.array(fields.select({ label: 'Tag/Badge', options: [...brandTags, ...brandBadges].length > 0 ? [...brandTags, ...brandBadges] : [{ label: 'Select Tag', value: '' }], defaultValue: ([...brandTags, ...brandBadges][0]?.value ?? '') }), { label: 'Weight 4 (High Priority)', itemLabel: props => props.value }),
        w3: fields.array(fields.select({ label: 'Tag/Badge', options: [...brandTags, ...brandBadges].length > 0 ? [...brandTags, ...brandBadges] : [{ label: 'Select Tag', value: '' }], defaultValue: ([...brandTags, ...brandBadges][0]?.value ?? '') }), { label: 'Weight 3 (Medium Priority)', itemLabel: props => props.value }),
        w2: fields.array(fields.select({ label: 'Tag/Badge', options: [...brandTags, ...brandBadges].length > 0 ? [...brandTags, ...brandBadges] : [{ label: 'Select Tag', value: '' }], defaultValue: ([...brandTags, ...brandBadges][0]?.value ?? '') }), { label: 'Weight 2 (Low Priority)', itemLabel: props => props.value }),
        w1: fields.array(fields.select({ label: 'Tag/Badge', options: [...brandTags, ...brandBadges].length > 0 ? [...brandTags, ...brandBadges] : [{ label: 'Select Tag', value: '' }], defaultValue: ([...brandTags, ...brandBadges][0]?.value ?? '') }), { label: 'Weight 1 (Subtle Priority)', itemLabel: props => props.value }),
      }
    }),

    storefront_methods: singleton({
      label: 'Sorting Methods',
      path: `src/content/${brandId}/settings/sorting-methods`,
      format: { data: 'yaml' },
      schema: {
        products: fields.object({
          enabled_sorts: fields.multiselect({
            label: 'Visible Sorting Methods',
            options: [
              { label: 'Featured (Weighted)', value: 'featured' },
              { label: 'Newest Arrivals', value: 'latest' },
              { label: 'Oldest First', value: 'oldest' },
              { label: 'Price: Low to High', value: 'price-asc' },
              { label: 'Price: High to Low', value: 'price-desc' },
              { label: 'Name: A to Z', value: 'name-asc' },
              { label: 'Name: Z to A', value: 'name-desc' },
              { label: 'Rating: High to Low', value: 'rating-desc' },
            ],
            defaultValue: ['featured', 'latest', 'price-asc', 'price-desc']
          }),
          default_sort: fields.select({
            label: 'Default Sort Order',
            options: [
              { label: 'Featured (Weighted)', value: 'featured' },
              { label: 'Newest Arrivals', value: 'latest' },
              { label: 'Name: A to Z', value: 'name-asc' },
            ],
            defaultValue: 'featured'
          })
        }, { label: 'Product Pages (Shop/Categories)' }),

        blog: fields.object({
          enabled_sorts: fields.multiselect({
            label: 'Visible Sorting Methods',
            options: [
              { label: 'Newest First', value: 'latest' },
              { label: 'Oldest First', value: 'oldest' },
              { label: 'Name: A to Z', value: 'name-asc' },
              { label: 'Name: Z to A', value: 'name-desc' },
            ],
            defaultValue: ['latest', 'oldest']
          }),
          default_sort: fields.select({
            label: 'Default Sort Order',
            options: [
              { label: 'Newest First', value: 'latest' },
              { label: 'Oldest First', value: 'oldest' },
            ],
            defaultValue: 'latest'
          })
        }, { label: 'Blog Page' })
      }
    }),

    authors: singleton({
      label: 'Author Registry',
      path: `src/content/${brandId}/authors`,
      format: { data: 'yaml' },
      schema: {
        authors: fields.array(
          fields.object({
            name: fields.text({ label: 'Name' }),
            avatar: fields.text({ label: 'Avatar Path', description: 'e.g. /images/authors/zee.jpg' }),
            bio: fields.text({ label: 'Short Bio', multiline: true }),
          }),
          {
            label: 'Authors',
            itemLabel: (props) => props.fields.name.value || 'New Author'
          }
        )
      }
    }),
  },
});
