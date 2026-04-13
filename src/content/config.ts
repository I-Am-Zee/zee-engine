import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";
import fs from "node:fs";
import yaml from "yaml";

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-TENANT BRAND RESOLUTION — FAIL FAST
// PUBLIC_BRAND_ID drives ALL content paths. No defaults. No guessing.
// If this is not set, the engine stops immediately with a clear error.
// Set this in your .env file: PUBLIC_BRAND_ID="zelia-vance"
// ─────────────────────────────────────────────────────────────────────────────
const brandId = import.meta.env.PUBLIC_BRAND_ID;
if (!brandId) {
  throw new Error(
    "\n\n[Engine Error] PUBLIC_BRAND_ID is not set.\n" +
    "The engine cannot start without knowing which brand to serve.\n" +
    "Add PUBLIC_BRAND_ID=\"your-brand-id\" to your .env file.\n" +
    "See .plans/BRAND-SETUP-GUIDE.md for instructions.\n"
  );
}



// Dynamically load categories from taxonomy
const taxonomyPath = `./src/content/${brandId}/settings/taxonomy.json`;
var brandCategories: [string, ...string[]] = ["rings", "necklaces", "earrings", "bracelets", "gifts", "sets"];
try {
  if (fs.existsSync(taxonomyPath)) {
    const fileContents = fs.readFileSync(taxonomyPath, 'utf8');
    const parsed = JSON.parse(fileContents);
    if (parsed && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
      brandCategories = parsed.categories as [string, ...string[]];
    }
  }
} catch (e) {
  console.warn("Could not load categories from taxonomy, using defaults.");
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
    sku: z
      .string()
      .regex(/^[A-Z]{3}-[0-9]{3}$/, "SKU format must be ABC-123 (e.g., 'CDR-010')")
      .optional(),

    // MOLECULE: Pricing Set (with conflict prevention)
    price: z.number().positive("Price must be greater than 0"),
    salePrice: z
      .number()
      .positive("Sale price must be greater than 0")
      .optional()
      .refine(
        (val) => val === undefined || val > 0,
        "Sale price must be valid if provided"
      ),

    // MOLECULE: Product Media
    image: z.string().min(1, "Featured image is required"),
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
    tags: z.array(z.string()).optional(),
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
    hero_image: z.string(),
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
    author: z.string().default("Zelia Vance Team"),
    image: z.string(),
    tags: z.array(z.string()).optional(),
    isDraft: z.boolean().default(false),
  }),
});

// ═══════════════════════════════════════════════════════════════════════════
// STATIC PAGES — Legal (Shared across all brands, NOT brand-specific)
// ═══════════════════════════════════════════════════════════════════════════
const pages = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: `./src/content/${brandId}/pages`,
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lastUpdated: z.date().optional(),
  }),
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

const newsletter_content = defineCollection({
  loader: glob({
    pattern: "**/*.{yml,yaml,json}",
    base: `./src/content/${brandId}/newsletter`,
  }),
  schema: z.object({
    heading: z.string(),
    description: z.string(),
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
    pattern: "**/*.json",
    base: `./src/content/${brandId}/section_headers`,
  }),
});

const page_headers = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: `./src/content/${brandId}/page_headers`,
  }),
});

const component_hub = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: `./src/content/${brandId}/component_hub`,
  }),
});

const faq_page = defineCollection({
  loader: file(`src/content/${brandId}/pages_content/faq.json`),
});

const pages_content = defineCollection({
  loader: glob({
    pattern: "**/*.json",
    base: `./src/content/${brandId}/pages_content`,
  }),
});

export const collections = {
  products,
  lookbooks,
  blog,
  pages,
  settings,
  newsletter: newsletter_content,
  newsletter_content,
  collections_grid,
  section_headers,
  page_headers,
  pages_content,
  component_hub,
};
