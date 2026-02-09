import { defineCollection, z } from "astro:content";

const products = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    price: z.number(),
    salePrice: z.number().optional(),
    image: z.string(),
    gallery: z.array(z.string()).optional(),
    category: z.string(),
    badges: z.array(z.string()).optional(),
    rating: z.number().min(0).max(5).optional(),
    description: z.string(),
    tags: z.array(z.string()).optional(),
    publishDate: z.date().optional(),
    product_options: z
      .array(
        z.object({
          name: z.string(),
          values: z.array(z.string()),
        })
      )
      .optional(),
    sku: z.string().optional(),
    stock: z.number().optional(),
    weight: z.number().optional(),
    dimensions: z.object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    }).optional(),
    taxable: z.boolean().default(true),
  }),
});

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

const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    lastUpdated: z.date().optional(),
  }),
});

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
  }),
});

export const collections = {
  products,
  blog,
  pages,
  settings,
};
