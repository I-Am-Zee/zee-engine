import { defineCollection, z } from "astro:content";

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════
// Validation Strategy: Mirrors .pages.yml constraints + advanced runtime checks
// Critical: salePrice < price enforced via refine() to prevent Snipcart conflicts
// ═══════════════════════════════════════════════════════════════════════════
const products = defineCollection({
  type: "content",
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
      ["rings", "necklaces", "earrings", "bracelets", "gifts", "sets"],
      {
        errorMap: () => ({
          message:
            "Category must be one of: rings, necklaces, earrings, bracelets, gifts, sets",
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
        values: z.string(),
        is_checkbox: z.boolean().optional(),
      })
      .optional(),

    // ORGANISM: Urgency & Scarcity
    release_date: z.date().optional(),
    urgency_tag: z.string().optional(),

    // MOLECULE: Cross-Selling
    related_products: z.array(z.string()).optional(),

    // MOLECULE: Shipping Logistics
    weight: z.number().positive().optional(),
    shipping_slab: z.string().optional(),
    dimensions: z
      .object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive(),
      })
      .optional(),
  })
    // ✅ CRITICAL VALIDATION: Ensures sale price is less than regular price
    .refine(
      (data) => {
        if (data.salePrice && data.price) {
          return data.salePrice < data.price;
        }
        return true; // If no salePrice, validation passes
      },
      {
        message: "Sale price must be less than regular price",
        path: ["salePrice"], // Error shows on salePrice field
      }
    ),
});

// ═══════════════════════════════════════════════════════════════════════════
// LOOKBOOKS COLLECTION - Shop the Look
// ═══════════════════════════════════════════════════════════════════════════
const lookbooks = defineCollection({
  type: "content",
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
  type: "content",
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
// STATIC PAGES
// ═══════════════════════════════════════════════════════════════════════════
const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lastUpdated: z.date().optional(),
  }),
});

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL SETTINGS - Marketing Command Center
// ═══════════════════════════════════════════════════════════════════════════
const settings = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    description: z.string(),
    url: z.string(),
    email: z.object({
      support: z.string(),
      orders: z.string(),
    }),
    social: z.object({
      instagram: z.string().optional(),
      pinterest: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
    }),
    // Announcement Bar
    announcement_bar: z
      .object({
        enabled: z.boolean().default(false),
        text: z.string().optional(),
        link: z.string().optional(),
        bg_color: z.string().default("bg-black"),
        text_color: z.string().default("text-white"),
      })
      .optional(),
    // Popup Modal
    popup_modal: z
      .object({
        active: z.boolean().default(false),
        title: z.string().optional(),
        description: z.string().optional(),
        coupon_code: z.string().optional(),
        image: z.string().optional(),
        cta_text: z.string().default("Claim Discount"),
      })
      .optional(),
    // Free Shipping Threshold
    free_shipping_threshold: z.number().positive().default(3000),
  }),
});

export const collections = {
  products,
  lookbooks,
  blog,
  pages,
  settings,
};
