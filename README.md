# 🚀 Zelia Vance: Multi-Tenant E-Commerce Engine

This repository is the "Brain" of a sophisticated, multi-tenant e-commerce platform built on **Astro 5**. It is designed to host multiple distinct brands from a single codebase using a **Sovereign Asset Architecture**.

---

## 🏛️ Architecture: The "Brain vs. Body" Split

This engine enforces a strict separation between code and media to ensure the Git repository stays lightweight (~25MB) while managing GBs of high-resolution media.

### 1. The Brain (This Repo)
- **Framework**: Astro 5 (Island Architecture).
- **Styling**: Tailwind CSS v4 (Atomic Design).
- **CMS**: Keystatic (Local YAML/MDX editor).
- **Responsibility**: Logic, UI components, and brand configuration.

### 2. The Body (External Media)
- **Source**: `D:\Workspace\zee-media-production` (Master Repository).
- **Cloud**: Cloudflare R2 (Object Storage).
- **Sync**: Rclone delta-syncing.
- **Local Linking**: Windows Directory Junction.

---

## 🛠️ Local Development Setup

To set up this platform on a fresh machine:

1.  **Clone the Repo**: `git clone <repo-url>`
2.  **Install Dependencies**: `npm install`
3.  **Link Media (The Junction)**:
    - You must have the media repository cloned locally.
    - Run the following command in an Admin Terminal from the project root:
      `mklink /J "public/images" "D:\Workspace\zee-media-production\R2_Bucket_Media\zelia-vance"`
4.  **Environment Variables**:
    - Copy `.env.example` to `.env`.
    - `PUBLIC_BRAND_ID`: Set to the brand you are working on (e.g., `zelia-vance`).
    - `PUBLIC_IMAGE_GATEWAY_URL`: Leave blank for local junction use.

---

## 🖼️ The Image Pipeline (Image Engine)

### Local Mode
When `PUBLIC_IMAGE_GATEWAY_URL` is empty, the `Image.astro` primitive resolves paths to `/images/...`. The browser finds these files via the Directory Junction.

### Production Mode (Cloudflare)
In production, `PUBLIC_IMAGE_GATEWAY_URL` points to your **Image Engine Worker**.
1.  **Request**: Website asks for `/images/products/ring.jpg?w=400`.
2.  **Worker**: The Cloudflare Worker catches the request, transforms the path to the R2 bucket key, and fetches the original image.
3.  **Resize**: Cloudflare's Image Resizing service snaps the image to the requested width.
4.  **Edge Cache**: The result is cached at the edge for 1 year, ensuring blisteringly fast subsequent loads.

---

## 📦 Content Management (Keystatic)

Access the CMS at `/keystatic`.

- **Windows Junction Patch**: We have applied a `patch-package` to `@keystatic/core` to ensure it can follow Windows Junctions. 
- **Image Fields**: Always use `fields.image` in the schema. This allows Keystatic to show thumbnails and navigate the junctioned folder structure.

---

## 🚀 Deployment

- **Hosting**: Cloudflare Pages.
- **Image Worker**: Deploy via `cd image-engine && npx wrangler deploy`.
- **Multi-Tenant Deployment**: Create a separate Cloudflare Pages project for each brand, pointing to the same GitHub repo but with a different `PUBLIC_BRAND_ID` environment variable.

---

## 🛡️ Sovereign Asset Rules
1.  **Never** commit an image to this repository.
2.  **Never** use raw hex colors in code; use CSS Design Tokens.
3.  **Always** use the `Image.astro` primitive for rendering assets.
