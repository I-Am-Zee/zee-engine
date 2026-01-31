import { defineCollection, z } from "astro:content";

const products = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    price: z.number(),
    salePrice: z.number().optional(),
    image: z.string(),
    gallery: z.array(z.string()).optional(),
    // Category is now a free-form string - auto-detected from products
    category: z.string(),
    badges: z.array(z.string()).optional(),
    rating: z.number().min(0).max(5).optional(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    // New: Published date for "Newest Arrivals" sorting
    publishDate: z.date().optional(),
    options: z
      .array(
        z.object({
          name: z.string(),
          values: z.array(z.string()),
        })
      )
      .optional(),
    // Snipcart-specific fields for e-commerce
    sku: z.string().optional(),
    stock: z.number().optional(),
    weight: z.number().optional(), // in grams, for shipping calculations
    dimensions: z.object({
      length: z.number(), // in cm
      width: z.number(),
      height: z.number(),
    }).optional(),
    taxable: z.boolean().default(true),
  }),
});

export const collections = {
  products,
};
