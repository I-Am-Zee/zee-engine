## 1. The Core Workflow

This setup follows a "Source → Storage → Processor → Consumer" pipeline and is currently **LIVE**.

1. **Source**: High-resolution product photos (unoptimized) are uploaded to a specific Cloudflare R2 Bucket. Standard Folder Structure: `/<brand-id>/<category>/file.webp`.
2. **Storage**: R2 holds the "Master" files. GitHub remains lightweight because no images are stored in the repo.
3. **Processor (The Worker)**: A single Cloudflare Worker acts as an Intelligent Gateway.
4. **Consumer (Astro Atoms)**: Your `Image.astro` primitive generates a `srcset` and requests a URL with parameters. The Worker fetches the master from R2, resizes it on-the-fly via the Cloudflare Edge, and serves it.

---

## 2. Technical implementation

### Storage Setup

- The storage uses one unified bucket with top-level brand folders. R2 holds master files accessed securely.

### The Worker Logic

The implemented fetch handler:

- Intercepts incoming requests and extracts the `pathname` as the R2 key.
- Parses URL search parameters for `w` (width) and `q` (quality).
- Invokes the `cf.image` property to trigger Cloudflare's hardware-accelerated transformation engine.
- **Optimization**: Includes `sharpen: 1.0` for jewellery detail and `format: 'auto'` for modern browser compatibility (AVIF/WebP).
- **Security**: Includes a security block that ensures `ALLOWED_DOMAINS` referers only.

### Multi-Tenant Mapping Rules & Dev-Mode Fallback

- **Dynamic Prefixing**: The system uses `PUBLIC_BRAND_ID` from `.env` to map local-style paths (e.g., `/images/products/`) to R2-style paths (e.g., `<PUBLIC_BRAND_ID>/products/`).
- **Dev Fallback**: In `DEV` mode, the engine automatically falls back to local disk files (`/public/images/`) to bypass Cloudflare Referrer restrictions on localhost.
- **Production**: In build/production, the engine strictly uses the R2 Gateway for optimized delivery.

### The Astro "Image Atom"

The Primitive component generates the dynamic URL using a `srcset` to handle responsive ratios without bloating transformation counts. It uses a fixed SnapBucket width array of **200, 400, 800, 1200**.

```astro
---
// src/components/primitives/Image.astro
const { src, ratio, alt, sizes = "100vw" } = Astro.props;
const ASSETS_URL = import.meta.env.IMAGE_GATEWAY_URL;

const widths = [200, 400, 800, 1200];
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

## 4. Summary

- **Storage**: R2 Bucket (unified bucket with folder-based multi-tenancy).
- **Delivery**: Cloudflare Worker utilizing `cf.image` transformations and `caches.default`.
- **Integration**: Astro Environment Variables feeding a `srcset` in the Image Atom. Includes automatic Dev-Mode fallback to local disk.
- **Constraint**: Standardized width array of [200, 400, 800, 1200] maximizes cache hits and minimizes unique transformations.