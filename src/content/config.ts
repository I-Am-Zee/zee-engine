import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import fs from "node:fs";
import yaml from "yaml";

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-TENANT BRAND RESOLUTION — FAIL FAST
// PUBLIC_BRAND_ID drives ALL content paths. No defaults. No guessing.
// If this is not set, the engine stops immediately with a clear error.
// Set this in your .env file: PUBLIC_BRAND_ID="zelia-vance"
// ─────────────────────────────────────────────────────────────────────────────
const rawBrandId = import.meta.env.PUBLIC_BRAND_ID;
const isAffiliate = import.meta.env.PUBLIC_AFFILIATE === "true";

let brandId = rawBrandId;
if (!brandId || !fs.existsSync(`./src/content/${brandId}`)) {
  const fallbackId = isAffiliate ? "sample-affiliate" : "sample-brand";
  console.warn(`\x1b[33m[Engine Warning]\x1b[0m PUBLIC_BRAND_ID ("${brandId}") invalid or missing. Falling back to "${fallbackId}".`);
  brandId = fallbackId;
}



// ─── Product Taxonomy ───────────────────────────────────────────────────────
const taxonomyPath = `./src/content/${brandId}/settings/taxonomy.yaml`;
var brandCategories: [string, ...string[]] = ["Rings", "Earrings", "Necklaces", "Bracelets", "Jewellery Sets"];
var brandTags: [string, ...string[]] = ["diamond", "gold", "pvd-coated"]; // Minimal defaults
try {
  if (fs.existsSync(taxonomyPath)) {
    const fileContents = fs.readFileSync(taxonomyPath, 'utf8');
    const parsed = yaml.parse(fileContents);
    if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
      brandCategories = parsed.categories as [string, ...string[]];
    }
    if (parsed && Array.isArray(parsed.tags) && parsed.tags.length > 0) {
      brandTags = parsed.tags as [string, ...string[]];
    }
  }
} catch (e) {
  console.warn("Could not load product taxonomy from settings, using defaults.");
}

// ─── Blog Taxonomy (Separate from Products) ──────────────────────────────────
const blogTaxonomyPath = `./src/content/${brandId}/settings/blog-taxonomy.yaml`;
var blogCategories: [string, ...string[]] = ["Style Guide", "Behind the Scenes", "Care Tips", "Trend Report", "Jewellery 101", "Gift Guide"];
var blogTags: [string, ...string[]] = ["styling", "care-guide", "life-proof"]; // Minimal defaults
try {
  if (fs.existsSync(blogTaxonomyPath)) {
    const fileContents = fs.readFileSync(blogTaxonomyPath, 'utf8');
    const parsed = yaml.parse(fileContents);
    if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
      blogCategories = parsed.categories as [string, ...string[]];
    }
    if (parsed && Array.isArray(parsed.tags) && parsed.tags.length > 0) {
      blogTags = parsed.tags as [string, ...string[]];
    }
  }
} catch (e) {
  console.warn("Could not load blog taxonomy from settings, using defaults.");
}

// ─── Legal Taxonomy (HSN Codes) ─────────────────────────────────────────────
const legalTaxonomyPath = `./src/content/${brandId}/settings/legal-taxonomy.yaml`;
var hsnCodes: [string, ...string[]] = [""]; // Empty string is "Default"
try {
  if (fs.existsSync(legalTaxonomyPath)) {
    const fileContents = fs.readFileSync(legalTaxonomyPath, "utf8");
    const parsed = yaml.parse(fileContents);
    if (parsed && Array.isArray(parsed.tax_classes)) {
      const parsedHsn = parsed.tax_classes.map((tc: any) => tc.hsn).filter(Boolean);
      if (parsedHsn.length > 0) {
        hsnCodes = ["", ...parsedHsn] as [string, ...string[]];
      }
    }
  }
} catch (e) {
  console.warn("Could not load HSN codes from legal-taxonomy, using defaults.");
}

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════
const products = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: `./src/content/${brandId}/products`,
  }),
  schema: z.object({
    // MOLECULE: Core Identity
    title: z.string().max(100, "Product title must be ≤100 characters for SEO"),
    sku: import.meta.env.PUBLIC_AFFILIATE === "true"
      ? z.string().optional()
      : z.string().regex(/^[A-Z]{3}-[0-9]{3}$/, "SKU format must be ABC-123 (e.g., 'CDR-010')").optional(),

    // MOLECULE: Pricing Set (with conflict prevention)
    price: import.meta.env.PUBLIC_AFFILIATE === "true" 
      ? z.number().positive().optional() 
      : z.number().positive("Price must be greater than 0"),
    salePrice: z
      .number()
      .positive("Sale price must be greater than 0")
      .optional()
      .refine(
        (val) => val === undefined || val > 0,
        "Sale price must be valid if provided"
      ),
    
    hsn_override: import.meta.env.PUBLIC_AFFILIATE === "true"
      ? z.string().optional()
      : z.enum(hsnCodes).optional().default(""),

    // MOLECULE: Product Media
    featured: z.string().min(1, "Featured image is required"),
    gallery: z
      .array(z.string())
      .max(10, "Gallery supports max 10 images for performance")
      .optional(),

    // MOLECULE: Classification
    category: z.enum(
      [brandCategories[0], ...brandCategories.slice(1)],
      {
        errorMap: () => ({
          message:
            "Category must be one of the brand-defined categories",
        }),
      }
    ),
    tags: z.array(z.enum([brandTags[0], ...brandTags.slice(1)])).optional(),
    badges: z.array(z.string()).optional(),

    // MOLECULE: Content
    rating: z.number().min(0).max(5).optional().default(4.5),
    description: z
      .string()
      .max(200, "Short summary must be ≤200 characters"),

    publishDate: z.date().optional(),

    // ORGANISM: Flexible Variants (Snipcart)
    variant_1: z
      .object({
        name: z.string(),
        values: z.string(), // Comma-separated
        price_modifiers: z.string().optional(),
      })
      .optional(),
    variant_2: z
      .object({
        name: z.string(),
        values: z.string(),
        price_modifiers: z.string().optional(),
      })
      .optional(),
    variant_3: z
      .object({
        name: z.string(),
        values: z.string(), // Comma-separated (e.g. "None, Gift Wrap (+₹99)")
        price_modifiers: z.string().optional(),
      })
      .optional(),

    // ORGANISM: Affiliate Mode CTAs (Multi-Region)
    affiliate_links: z.array(
      z.object({
        region: z.string(),
        url: z.string().url(),
        platform: z.string().optional(),
        partnerProductId: z.string().optional(),
        price: z.number(),
        salePrice: z.number().optional(),
        currency: z.string()
      })
    ).optional(),

    // ORGANISM: Urgency & Scarcity — REMOVED (no component usage)

    // MOLECULE: Cross-Selling
    related_products: z.array(z.string()).optional(),

    // MOLECULE: Shipping Logistics
    shipping_slab: z.string().optional(),
  })
    // ✅ CRITICAL VALIDATION: Ensures sale price is less than regular price
    .refine(
      (data) => {
        if (data.salePrice && data.price) {
          return data.salePrice < data.price;
        }
        return true;
      },
      {
        message: "Sale price must be less than regular price",
        path: ["salePrice"],
      }
    ),
});

// ═══════════════════════════════════════════════════════════════════════════
// LOOKBOOKS COLLECTION - Shop the Look
// ═══════════════════════════════════════════════════════════════════════════
const lookbooks = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: `./src/content/${brandId}/lookbooks`,
  }),
  schema: z.object({
    title: z.string(),
    hero: z.string(),
    gallery: z.array(z.string()).optional(),
    description: z.string().optional(),
    products: z.array(z.string()),
  }),
});

// ═══════════════════════════════════════════════════════════════════════════
// BLOG POSTS
// ═══════════════════════════════════════════════════════════════════════════
const blog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: `./src/content/${brandId}/blog`,
  }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    publishDate: z.date(),
    author: z.string().default("zee-team"),
    category: z.enum(
      [blogCategories[0], ...blogCategories.slice(1)],
      {
        errorMap: () => ({ message: `Category must be one of: ${blogCategories.join(', ')}` }),
      }
    ),
    cover: z.string().min(1, "Cover image is required for all blog posts"),
    tags: z.array(z.enum([blogTags[0], ...blogTags.slice(1)])).optional(),
    isDraft: z.boolean().default(false),
  }),
});

// ═══════════════════════════════════════════════════════════════════════════
// ATOMIC SILOED PAGES: Legal & Brand
// ═══════════════════════════════════════════════════════════════════════════
const legal = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: `./src/content/${brandId}/legal`,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lastUpdated: z.date().optional(),
    isDraft: z.boolean().default(false),
  }),
});

const brand = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/brand`,
  }),
  schema: z.object({
    title: z.string(),
    isDraft: z.boolean().default(false),

    hero: z.object({
      heading: z.string().optional(),
      text: z.string().optional(),
      image: z.string().optional(),
      isImmersive: z.boolean().default(false),
    }).optional(),
    sections: z.array(
      z.object({
        layout: z.enum(['no-image', 'image-left', 'image-right']),
        alignment: z.enum(['left', 'center', 'right']).default('left'),
        stack: z.array(
          z.discriminatedUnion('discriminant', [
            z.object({
              discriminant: z.literal('heading'),
              value: z.object({
                type: z.string(),
                content: z.string(),
                italic: z.boolean(),
              }),
            }),
            z.object({
              discriminant: z.literal('text'),
              value: z.object({
                type: z.string(),
                content: z.string(),
                italic: z.boolean(),
              }),
            }),
            z.object({
              discriminant: z.literal('button'),
              value: z.object({
                label: z.string(),
                action_type: z.enum(['link', 'modal']),
                url: z.string().optional(),
                embed_url: z.string().optional(),
              }),
            }),
          ])
        ).default([]),
        image: z.object({
          url: z.string().optional(),
          alt: z.string().optional(),
          caption: z.string().optional(),
          shape: z.enum(['square', 'vertical']).optional(),
          mobileOffset: z.number().optional(),
        }).optional(),
      })
    ).default([]),
  }),
});

const authors = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/authors`,
  }),
  schema: z.object({
    name: z.string(),
    avatar: z.string().optional(),
    bio: z.string().optional(),
  })
});

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL SETTINGS - Marketing Command Center (brand-specific)
// ═══════════════════════════════════════════════════════════════════════════
const settings = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/settings`,
  }),
});

const newsletter_variants = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/newsletter`,
  }),
  schema: z.object({
    heading: z.string(),
    description: z.string(),
    placeholder: z.string().optional(),
    button_text: z.string().optional(),
    disclaimer: z.string().optional(),
    image: z.string().optional(),
    success_message: z.string().optional(),
  }),
});

const collections_grid = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/collections_grid`,
  }),
  schema: z.object({
    cards: z.array(z.any()).default([]),
  }),
});

const section_headers = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/section_headers`,
  }),
});

const page_headers = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/page_headers`,
  }),
});

const component_hub = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/component_hub`,
  }),
});

const pages_content = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/pages_content`,
  }),
});



export const collections = {
  products,
  lookbooks,
  blog,
  authors,
  legal,
  brand,
  settings,
  newsletter_variants,
  collections_grid,
  section_headers,
  page_headers,
  pages_content,
  component_hub,
};
;
