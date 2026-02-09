import { defineCollection, z } from "astro:content";

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS COLLECTION
// ═══════════════════════════════════════════════════════════════════════════
const products = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    sku: z.string().optional(),
    price: z.number(),
    salePrice: z.number().optional(),
    image: z.string(),
    gallery: z.array(z.string()).optional(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    badges: z.array(z.string()).optional(),
    rating: z.number().min(0).max(5).optional(),
    description: z.string(),
    publishDate: z.date().optional(),

    // Flexible Variants (Snipcart) - Object-based slots
    variant_1: z.object({
      name: z.string(),
      values: z.string(), // Comma-separated
      price_modifiers: z.string().optional(),
    }).optional(),
    variant_2: z.object({
      name: z.string(),
      values: z.string(),
      price_modifiers: z.string().optional(),
    }).optional(),
    variant_3: z.object({
      name: z.string(),
      values: z.string(),
      is_checkbox: z.boolean().optional(),
    }).optional(),

    // Urgency & Scarcity
    release_date: z.date().optional(),
    urgency_tag: z.string().optional(),

    // Upsells
    related_products: z.array(z.string()).optional(),

    // Shipping
    weight: z.number().optional(),
    dimensions: z
      .object({
        length: z.number(),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
  }),
});

// ═══════════════════════════════════════════════════════════════════════════
// LOOKBOOKS COLLECTION - Shop the Look
// ═══════════════════════════════════════════════════════════════════════════
const lookbooks = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    hero_image: z.string(),
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
    author: z.string().default("Zaviona Team"),
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
  }),
});

export const collections = {
  products,
  lookbooks,
  blog,
  pages,
  settings,
};
