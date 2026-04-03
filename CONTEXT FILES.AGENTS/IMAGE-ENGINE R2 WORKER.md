***!!Any values you see in this concept plan are just for example and for reference. Do not take them as it is.***

---
---
## 1. The Core Workflow

This setup follows a "Source → Storage → Processor → Consumer" pipeline.

1. Source: High-resolution product photos (unoptimized) are uploaded to a specific Cloudflare R2 Bucket (e.g., `brand-1-assets`).
2. Storage: R2 holds the "Master" files. GitHub remains lightweight because no images are stored in the repo.
3. Processor (The Worker): A single Cloudflare Worker acts as an Intelligent Gateway. It listens on a subdomain (e.g., `https://assets.brand1.com`).
4. Consumer (Astro Atoms): Your `Image.astro` primitive requests a URL with parameters (e.g., `?w=800&q=85`). The Worker fetches the master from R2, resizes it on-the-fly via the Cloudflare Edge, and serves it.

---

## 2. Technical implementation (The "Agents" Plan)

## Phase A: Storage Setup

- Action: Create one R2 Bucket per brand (or a unified bucket with top-level brand folders).
- Binding: In the Cloudflare Worker settings, "Bind" the R2 bucket to a variable named `IMAGE_BUCKET`.

## Phase B: The Worker Logic

The Agent should implement a fetch handler that:

- Intercepts incoming requests and extracts the `pathname` as the R2 key.
- Parses URL search parameters for `w` (width) and `q` (quality).
- Invokes the `cf.image` property to trigger Cloudflare's hardware-accelerated transformation engine.
- Optimization: Must include `sharpen: 1.0` for jewellery detail and `format: 'auto'` for modern browser compatibility (AVIF/WebP).
- Security: Agent should consider a simple "Allow-List" or "Secret Header" check so other people can't use your resizing worker for their own images.

## Phase C: The Astro "Image Atom"

Update your Primitive component to generate the dynamic URL using a `srcset` to handle your responsive ratios without bloating transformation counts.

```astro
---
// src/components/atoms/Image.astro
const { src, ratio, alt, sizes = "100vw" } = Astro.props;
const ASSETS_URL = import.meta.env.IMAGE_GATEWAY_URL; 

// Guide for Agent: Use a fixed array of widths (e.g., 400, 800, 1200) 
// to keep unique transformations under the 5k/mo free limit.
const widths = [400, 800, 1200];
const srcset = widths.map(w => `${ASSETS_URL}/${src}?w=${w} ${w}w`).join(", ");
---
<img 
  srcset={srcset} 
  sizes={sizes} 
  src={`${ASSETS_URL}/${src}?w=800`} 
  alt={alt} 
  class={`object-cover ${ratio}`} 
  loading="lazy" 
/>
```

---

## 3. Why this workflow is superior

## 1. Unified Codebase (Multi-Tenancy)

Since you are using environment variables for your brands, you only change the `IMAGE_GATEWAY_URL` in your `.env`. The logic for your Atoms, Molecules, and Organisms stays identical across all brands.

## 2. Zero-Cost Scaling (The "Free Tier" Loophole)

- R2: 10GB of storage is free.
- Workers: 100k requests per day are free.
- Transformations: 5,000 unique resizes per month are free.
- Comparison: This avoids the $20/mo Pro plan or $5/mo Cloudflare Images subscription while maintaining the same performance.

## 3. Performance for Jewellery

Jewellery requires extreme clarity. By using a Worker, you control AI-driven gravity (keeping the ring/necklace centered) and Smart Sharpening at the edge, ensuring a premium look on "Retina" displays.

## 4. Git Hygiene

Your GitHub repository remains a "Code-Only" zone. This speeds up CI/CD pipelines and keeps the developer experience fast.

---

## 4. Summary for "Jules" (The AI)

- Storage: R2 Bucket (One per brand or folder-based).
- Delivery: Cloudflare Worker utilizing `cf.image` transformations and `caches.default`.
- Integration: Astro Environment Variables feeding a `srcset` in the Image Atom.
- Constraint: Standardize widths to 3-4 variants to maximize cache hits and stay under the 5,000 transformation monthly limit.

Shall we start by configuring the Wrangler setup for your first brand's R2 binding?