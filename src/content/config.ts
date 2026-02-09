import { defineCollection, z } from "astro:content";

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
    product_options: z.object({
      sizes: z.array(z.string()).optional(),
      materials: z.array(z.string()).optional(),
    }).optional(),
    weight: z.number().optional(),
    dimensions: z.object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    }).optional(),
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
