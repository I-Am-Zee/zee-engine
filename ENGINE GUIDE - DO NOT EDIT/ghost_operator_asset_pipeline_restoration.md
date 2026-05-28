# 👻 Ghost Operator: Asset Pipeline Restoration & Standardization
### Last Updated: May 25, 2026 | Status: ARCHITECTURAL MASTER PLAN

This document captures the complete history, technical diagnosis, and surgical resolution of the **Ghost Operator Asset Pipeline** failure. It serves as the definitive source of truth for the Zee Engine's media synchronization logic.

---

## 1. The Context: The "Double Blindness" Failure

On May 25, 2026, the Zee Engine suffered a critical failure where the Keystatic CMS was "blind" to all existing media assets. Despite the physical files being present in the Media Master Repo and correctly junctioned, the UI showed empty slots and "Choose file" buttons.

This was caused by **"Double Blindness"** introduced by legacy "Rogue Agent" modifications.

### Failure A: Scanner Blindness (The Patch Error)
The Keystatic core was patched with logic that forced it to respect `.gitignore`.
*   **The Logic:** If a directory was listed in the root `.gitignore` (like `public/images/`), the scanner would skip it.
*   **The Consequence:** Since the Zee Engine intentionally ignores images to keep the Git repo lightweight, Keystatic refused to enter the junctioned folder.
*   **The Proof:** Captured in the legacy version of `patches/@keystatic+core+0.5.50.patch` under the `collectEntriesInDir` function.

### Failure B: Path Loop Blindness (The "Double Slug" Bug)
Even after the scanner was fixed, the CMS couldn't find the files because of a configuration mismatch.
*   **The Logic:** In Keystatic `collections`, the engine **automatically** appends the entry's slug to the `directory` path.
*   **The Error:** Filename hooks were written as `filename: ({ slug }) => ${slug}/featured`.
*   **The Result:** Keystatic looked for `products/[slug]/[slug]/featured.jpg`. Since the repo is flat (`products/[slug]/featured.jpg`), resolution failed.

---

## 2. The Restoration (The Vision Fix)

### Part 1: Curing the Scanner
We surgically edited the `@keystatic/core` patch to remove the artificial blindness while preserving 100% vital **Windows Junction Support**.

1.  **Removed:** `gitignoreFilterForDescendents` and all logic mapping to `.gitignore`.
2.  **Preserved:** `nodeFs.statSync(fullPath)` and `entry.isSymbolicLink()` checks.
3.  **Result:** Keystatic now has "Total Vision"—it scans the disk for what is actually there, regardless of Git security rules.

### Part 2: Precision Path Alignment
We aligned the `keystatic.config.ts` to the reality of the Media Master Repo.

*   **Collections Rule:** Removed `${slug}/` from hooks. Keystatic handles the slug-folder automatically.
*   **Singletons Rule:** Manually mapped paths like `collections/[slug]/[slug].jpg` because Singletons do not have automatic slug-nesting.

---

## 3. The "Smart Alt" Editorial Pipeline

A major discovery during this session was that inline MDX images were bypassing the R2 Image Engine and requesting files from `localhost:4321`. This created a "broken" experience in production.

### The Problem: Default HTML Rendering
Standard Markdown `![]()` renders as raw `<img>` tags. These tags bypass our `<Image.astro />` primitive and its `resolveImage()` logic, leading to bandwidth waste and 404s in production.

### The Solution: `MdxImage.astro`
We implemented the **"Smart Alt"** interceptor.

1.  **Component:** `src/components/ui/MdxImage.astro`.
2.  **Logic:** It intercepts all standard Markdown images and passes them through our optimized pipeline.
3.  **The Pipe Trick:** We introduced a dual-purpose Alt field:
    - `![Alt Text](/image.jpg)` ➜ Standard image, no caption.
    - `![SEO Alt | Visible Caption](/image.jpg)` ➜ Splices the string at the `|` symbol. The first part goes to `alt=""`, the second part becomes a styled, visible `<figcaption>`.

### Mapping in Renderers
Every `Content` component across the engine (Blog, Legal, Lookbooks, Products) was updated to map the `img` tag to this new logic:
```astro
<Content components={{ img: MdxImage }} />
```

---

## 4. Final Filename Hook Matrix (The Master Key)

If the pipeline ever breaks again, ensure `keystatic.config.ts` matches this EXACT naming matrix.

| Collection / Field | Folder Target | Keystatic Filename Hook | Resulting Path |
| :--- | :--- | :--- | :--- |
| **Products** (Featured) | `products/[slug]/` | `() => 'featured'` | `.../featured.jpg` |
| **Products** (Gallery) | `products/[slug]/` | `({ slug, count }) => \`${slug}-g${count}\`` | `.../[slug]-g1.jpg` |
| **Lookbooks** (Hero) | `lookbooks/[slug]/` | `() => 'hero'` | `.../hero.jpg` |
| **Lookbooks** (Gallery) | `lookbooks/[slug]/` | `({ slug, count }) => \`${slug}-g${count - 1}\`` | `.../[slug]-g0.jpg` |
| **Blog** (Cover) | `blogs/[slug]/` | `() => 'cover'` | `.../cover.jpg` |
| **Authors** (Avatar) | `authors/[slug]/` | `() => 'avatar'` | `.../avatar.jpg` |
| **Brand Stories** (Hero) | `brand/[slug]/` | `() => 'hero'` | `.../hero.jpg` |
| **Brand Stories** (Section) | `brand/[slug]/` | `({ slug, count }) => \`${slug}-s${count}\`` | `.../[slug]-s1.jpg` |
| **MDX Inline** (All) | `[cat]/[slug]/` | `({ slug }) => \`inline-${slug}-${Date.now()}\`` | `.../inline-slug-123.jpg` |

---

## 5. Maintenance Checklist for Future Agents

1.  **Never delete the Patch:** The `patches/@keystatic+core+0.5.50.patch` file is the only reason junctions work on Windows.
2.  **Respect the Slug Rule:** Do not add `${slug}/` to filename hooks inside Collections. It will create a "Double Slug" path loop.
3.  **Use the Pipe:** Encourage editorial teams to use the `|` trick for captions. It is the only way to get styled captions in standard Markdown.
4.  **Vite Cache:** If the patch is modified, run `npx patch-package` AND delete `node_modules/.vite` to force a refresh.

---

## 6. Deep Technical Nuances (The "Why")

### The Zero-Index Alignment (`g0`)
The Media Master Repo uses a **Zero-Index** convention for Lookbook galleries (e.g., `bridal-elegance-g0.jpg`). However, Keystatic's `count` parameter in the `filename` hook starts at **1**.
*   **The Solution:** We implement `count - 1` in the hook. 
*   **Warning:** If this is changed back to standard `count`, the CMS will create "orphan" files in R2 and fail to resolve the original `g0` image.

### Singleton vs. Collection Behavioral Split
This is the most common point of failure for new agents:
*   **Collections:** Keystatic acts as an automated orchestrator. It **automatically** appends the entry slug to your directory. Adding `${slug}/` to the hook creates a broken "Double Slug" path.
*   **Singletons:** Keystatic acts as a simple file-writer. It does **not** know about slugs. You must provide the full, manual path in the directory or filename hook.

### Design Tokens & `not-prose`
The `MdxImage.astro` component uses the `not-prose` class. 
*   **Why:** Tailwind Typography (`prose`) applies restrictive margins and styles to images. By using `not-prose`, we break out of those defaults to apply our own `rounded-[2rem]` and hover animations.
*   **Tokens:** The component is hard-wired to `var(--color-primary)` and `var(--color-surface)` to ensure it adapts instantly if the brand's color palette changes.

---

## 7. Operational Safeguards & Edge Cases

### Slash Discipline (Vite vs. Keystatic)
The Zee Engine is sensitive to path separators:
*   **Keystatic Config:** Always use forward slashes (`/`) and **no leading slash** for the `directory` property (e.g., `public/images/products`). A leading slash can cause Keystatic to look at the root of the hard drive instead of the project.
*   **Vite `fs.allow`:** In `astro.config.mjs`, the absolute path to the Media Master Repo must use **forward slashes** even on Windows (e.g., `D:/Workspace/...`).

### Inline Cache-Busting (`Date.now()`)
You will notice the MDX inline hook uses `inline-${slug}-${Date.now()}`. 
*   **The Reason:** Unlike featured images (which are "Slots" meant to be overwritten), inline images are "Editorial Assets." We use a timestamp to ensure that if a stylist replaces an image, the browser cache is busted instantly, and the new version appears without a hard refresh.

### The Vite "FS Pass-Through"
For images to appear in the storefront (not just the CMS), the Master Media Repo path must be explicitly whitelisted in `astro.config.mjs`.
*   **The Connection:** If images show in Keystatic but are 404 on the website, check the `vite.server.fs.allow` array. The "Ghost Operator" cannot bridge the gap without this "Security Pass."

### Extension Sovereignty
Keystatic preserves the original file extension. 
*   **Best Practice:** Content creators should stick to `.jpg` or `.webp`. If a `.png` is uploaded, it will work, but it may bypass some R2 Worker optimizations that are tuned for photographic content.

---

## 8. The "Ghost Operator" Bridge Mechanics

### URL Transformation (`Image.astro`)
The system uses a "Dual-Path" resolution strategy inside the `src/components/primitives/Image.astro` component:
1.  **Input:** A local-style path saved by Keystatic (e.g., `/images/products/ring/featured.jpg`).
2.  **Logic:** The `resolveImage()` utility checks for the `PUBLIC_IMAGE_GATEWAY_URL`.
3.  **Result:** In production, the path is prepended with `https://assets.zeliavance.com/zelia-vance/`, turning it into a high-performance R2 Worker request with automatic `srcset` generation.

### Alpine.js & The `$engine` Bridge
For interactive elements (like the Cart or Dynamic Filters), the Zee Engine uses Alpine.js.
*   **The Problem:** Standard JS doesn't know about our Astro-side resolution logic.
*   **The Solution:** We inject `$engine.image()` and `$engine.srcset()` into `x-bind:src`. This ensures that even when an image changes via user interaction (e.g., selecting a different ring finish), it still hits the R2 gateway and never falls back to `localhost`.

### Junction Health Check (Step 0)
If images are missing across both the CMS and the Storefront, the Windows Junction itself may be healthy but "unlinked."
*   **Verification:** Run `dir public` in the terminal.
*   **Healthy:** Look for `<JUNCTION> images [...]`.
*   **Broken:** If `images` appears as a `<DIR>` or is missing, the bridge is down. Re-run the `mklink` command from the `README.txt`.

### Append-Only Media Rule
To ensure R2 costs remain low and synchronization is reliable:
*   **Slots (Overwrites):** We overwrite `featured.jpg` and `cover.jpg` to keep the repo clean of "dead" primary assets.
*   **Identity (Append):** Inline images and gallery images are uniquely named (timestamps/indexing). We **never** delete these via the CMS. This allows for safe "Point-in-Time" rollbacks of your MDX content.

---

## 9. Casing & Linux Compatibility (The Cloud Pitfall)

The Zee Engine often operates on Windows (Local Dev) but always ships to Linux/Cloudflare (Production). 
*   **The Trap:** Windows is case-insensitive (`featured.JPG` is the same as `featured.jpg`). Cloudflare R2 and Linux are **Case-Sensitive**.
*   **The Consequence:** If an image is named `Cover.jpg` on your disk but the MDX file points to `cover.jpg`, it will work perfectly on your computer but appear as a **404 Broken Image** on the live website.
*   **The Fix:** Always ensure filenames are **Lower-Case** in your Media Master Repo. The naming hooks in `keystatic.config.ts` are programmed to output lower-case strings by default to enforce this safety.

---

## 10. Scaling & Disaster Recovery

### Scaling for New Brands
The Zee Engine is built for multi-tenancy. To add a new brand (e.g., "Sample Brand"):
1.  **Repo Setup:** Create a new folder `zee-media-production/R2_Bucket_Media/sample-brand/`.
2.  **Environment:** Change `PUBLIC_BRAND_ID` to `sample-brand`.
3.  **The Brain:** The `keystatic.config.ts` uses the `brandId` constant to drive all paths. It will automatically start looking for content in `src/content/sample-brand/` and images in the new junction.
4.  **The Junction:** Remember to delete the old `public/images` and run `mklink` for the new brand.

### Disaster Recovery: "My Images Disappeared!"
If the CMS suddenly goes "blind" again after a major update or PC migration:
1.  **Check the Patch:** Ensure `patches/@keystatic+core+0.5.50.patch` exists. If deleted, restore it from Git and run `npx patch-package`.
2.  **Check the Junction:** Run `dir public`. If `images` is missing, the "Body" is disconnected. Re-link it using the `mklink` command.
3.  **Clear Vite Cache:** If the patch is applied but behavior is old, run:
    `rm -rf node_modules/.vite`
    Then restart the dev server. This forces Vite to re-bundle Keystatic with the new "Vision" logic.

---

## 11. Debugging & Maintenance Pro-Tips

### The "DevTools Audit" (Is it working?)
To verify the pipeline is healthy, open the Network tab in Chrome DevTools:
1.  **Filter by:** `Img`
2.  **Look for:** `assets.zeliavance.com`
3.  **The Test:** If you see `localhost:4321` for any image that isn't a UI icon, the "Ghost Operator" bridge is being bypassed (likely a missing `Content` component mapping).

### Vite Cache Blindness
If you update the patch or move folders and the CMS still acts "blind," Vite is likely serving a cached version of the Keystatic bundle. 
*   **The Fix:** Delete `node_modules/.vite` and restart the server. **Do not skip this step**—it is the #1 cause of "ghost bugs" during asset pipeline development.

### Hard-Drive Independence
The Zee Engine uses **Absolute Paths** in the `astro.config.mjs` but **Relative Paths** in the `keystatic.config.ts`.
*   **Keystatic:** Stays portable. It doesn't care if your repo is on `C:` or `D:`.
*   **Vite:** Cares deeply. If you move your Media Master Repo, you **must** update the `server.fs.allow` string in `astro.config.mjs` to match the new absolute path.

---

## 12. Build Performance & The "Ghost" Build Strategy

### Fast Builds via `.assetsignore`
The Zee Engine points to a massive media library, but your Cloudflare build times remain near zero.
*   **The Secret:** The `public/.assetsignore` file. 
*   **The Rule:** By adding `images/` to this file, we tell Astro: *"Ignore this folder during the build process."* 
*   **The Result:** Astro doesn't waste time scanning or copying your gigabytes of images. It only builds the HTML/CSS/JS, while the R2 Image Gateway handles the media "Body" at runtime.

### Bypassing `Astro.assets`
Standard Astro components often try to "Import" images to optimize them.
*   **The Problem:** You cannot "Import" files that live inside a Windows Junction on a different drive.
*   **The Solution:** The `Image.astro` primitive uses **Dynamic URL Transformation** instead of local processing. This is why our engine is "Ghost-like"—the code never touches the physical image bytes until the customer's browser requests them.

---

## 13. Operational Protocol & Asset Sovereignty

### The "Sovereign Source" Rule
Always remember: **The Media Master Repo is the Master.**
*   **The Workflow:** CMS (Brain) creates a request ➜ Local Drive (Junction) writes the file ➜ Rclone (Messenger) pushes to Cloudflare R2 (Storage).
*   **Prohibition:** Never manually move, rename, or delete files inside the `public/images` folder using Windows Explorer. Always use the Keystatic UI. Manual changes bypass the Brain and create "Desync" between your content metadata and your physical assets.

### Rclone "Force Sync" Protocol
The `Force_Sync_Up_Cloud_Clean.bat` script is the "Nuclear Option."
*   **The Danger:** It deletes anything in the R2 cloud that doesn't exist on your local drive.
*   **The Protocol:** Only run this after a major content cleanup where you have verified that your local `D:\Workspace\zee-media-production` folder is exactly what you want the world to see.

### Cross-Brand Contamination
In a multi-tenant environment, assets must never cross brand boundaries.
*   **The Guardrail:** The `PUBLIC_IMAGE_GATEWAY_URL` uses the `brandId` variable in its path (e.g., `/zelia-vance/`). 
*   **The Result:** Even if two brands have an image named `featured.jpg`, the Image Engine keeps them isolated in the R2 bucket. Never hard-code a brand name into a component; always use the `$engine` or `resolveImage()` utilities.

---

## 14. Asset Resilience & Quality Standards

### Graceful Degradation (Fallbacks)
The `Image.astro` primitive is built with defensive code:
*   **The Guard:** `onerror="this.src='https://placehold.co/800x800?text=Placeholder';"`
*   **The Benefit:** If the R2 Worker is down or a file is accidentally renamed in the repo, your site **will not break**. It will show a clean, branded placeholder instead of a "broken image" icon.

### LCP Performance Hierarchy
We treat images differently based on their visual importance:
1.  **Featured/Hero Images:** Are marked as `loading="eager"` and `fetchpriority="high"`. This tells the browser: *"Download these first, they are the main event."*
2.  **Inline/Gallery Images:** Are marked as `loading="lazy"`. This prevents them from slowing down the initial page load.
*   **Maintenance:** Never change the loading property of a Product Featured image to "lazy," or you will damage your Google Core Web Vitals score.

### The "Gateway Divergence" (A Feature, Not a Bug)
You will notice that images in the **Keystatic UI** look different in the Network panel than on the **Live Site**.
*   **Keystatic UI:** Uses local paths (`/images/products/...`). This is because the CMS needs to write and read from your local disk directly.
*   **Live Site:** Uses gateway paths (`assets.zeliavance.com/...`). This is where the R2 magic happens.
*   **The Rule:** If you see `localhost` on the live site, it's an error. If you see it in the CMS, it's working exactly as intended.

### Stylist Resolution Limits
While the R2 Worker can resize anything, stylists should avoid uploading raw 10MB+ images.
*   **Recommendation:** Keep original uploads under **2000px width**.
*   **Reason:** Extremely high-resolution files cost the customer's phone more battery power to "decode" even if our server makes them look small.

---

## 15. The Digital Handshake (Astro + Alpine + R2)

### The "Split-Brain" Sync Contract
The Zee Engine uses a "Split-Brain" architecture where logic is shared between the Server (Astro) and the Client (Alpine.js).
*   **The Contract:** Both brains MUST resolve images using the exact same logic to prevent layout shift and unnecessary R2 costs.
*   **Server-Side:** Uses `src/scripts/utils/images.ts` (`resolveImage`).
*   **Client-Side:** Uses the Alpine `$engine` magic property.
*   **The Bridge:** The `Image.astro` primitive automatically injects the `$engine` resolver into `x-bind:src` whenever a dynamic Alpine source is detected.

### The Query-String Protocol
Our R2 Image Engine is "Parameter-Driven."
*   **Protocol:** `?w=[width]&q=[quality]`
*   **Efficiency:** The `resolveSrcset` utility automatically generates 3 distinct sizes (400, 800, 1200) for every image.
*   **Standard:** Never use a raw image URL without a width parameter in a feature or component. Always use the `Image.astro` primitive or the `$engine` bridge to ensure we aren't sending 5MB raw files to a mobile phone.

### The "Ghost" URL Structure
For debugging, always verify that your production URLs follow this sovereign pattern:
`https://assets.zeliavance.com/[brandId]/[category]/[slug]/[filename].[ext]`
If the `[brandId]` is missing or incorrect, the gateway will return a 403 Forbidden error.

---

## 16. Sovereign Portability & PC-Onboarding

### Drive-Agnostic Architecture
The Zee Engine is "Geography-Blind." 
*   **The Logic:** Whether your media lives on `D:/Media` or `Z:/CloudStorage`, the engine only cares about the **Windows Junction** at `public/images`.
*   **Onboarding:** To move to a new computer, you only need to run the `mklink` command. The code (Brain) never needs its configuration edited to accommodate a new hard drive.

### The "Silent Patch" Guarantee
The restored `@keystatic/core` patch is now **Production-Silent**.
*   **The Fix:** All legacy `console.log("Scanning...")` lines have been purged. 
*   **The Benefit:** Your terminal stays clean during development, and you won't suffer from "Log Bloat" which can slow down local server performance.

### Environment-Driven Paths
The absolute path to your media is never hard-coded in the project.
*   **Anchor:** The `LOCAL_MEDIA_PATH` environment variable is the ultimate source of truth. 
*   **Rule:** If you find yourself typing a path like `D:\Workspace\...` into a component, **Stop.** You are breaking the Ghost Operator portability rule. Always use relative paths that resolve through the junction.

---

## 17. Version Pinning & Patch Integrity

### The "Version Trap"
Patch files created by `patch-package` are mathematically tied to the exact version of the package.
*   **The Dependency:** Our "Vision Fix" is built specifically for `@keystatic/core@0.5.50`.
*   **The Risk:** If you run `npm update` and Keystatic moves to `0.6.0`, the patch **will fail to apply**.
*   **The Result:** The CMS will instantly revert to being "Blind" to your images.
*   **The Fix:** Always keep `@keystatic/core` pinned to `0.5.50` in your `package.json`. If you must upgrade, you must manually re-create the patch using the "Edit-then-Generate" method described in Section 11.

### Metadata Integrity (`publicPath`)
Keystatic saves the string from `publicPath` into your MDX files. 
*   **Consistency:** The `publicPath` must always start and end with a forward slash (e.g., `/images/products/`).
*   **Synchronization:** If you change the `directory` property, you **must** change the `publicPath` to match. If they get out of sync, your CMS might show the image correctly (reading from `directory`), but your website will 404 (reading the wrong path from the MDX).

---

## 18. The Vite "Secret Bridge" Security

### Sandboxing via `server.fs.allow`
The "Ghost Operator" is designed to be highly secure.
*   **The Problem:** Browsers generally block a website from reading files outside of its own folder (security risk).
*   **The Bridge:** We use Vite's `server.fs.allow` configuration in `astro.config.mjs`. 
*   **The Security:** This configuration acts as a "Sandbox." It tells the engine: *"You have permission to see your own code and the Media Master Repo, but you are BLIND to everything else on the computer."* This prevents a rogue script from ever reading your personal files while still allowing the Zero-Copy junction to work.

## 19. Point-in-Time Rollback Safety

### The "Never-Delete" Benefit
Because we use the **Append-Only** strategy for inline images (naming them with timestamps), your content has a "Time Machine" feature.
*   **Git Rollback:** If you accidentally break a blog post and roll back your MDX file to a version from 2 months ago, **the images will still work**.
*   **Why:** Since we never delete old inline images from the Media Master Repo, every historical version of your MDX content points to assets that still physically exist.
*   **Rule:** This is why we **NEVER** rename or delete inline images in the master repo. We only ever add new ones.

---

**Summary:** The Zee Engine's asset pipeline is now a standardized, "Total Vision" system that perfectly bridges the gap between the lightweight code "Brain" and the massive media "Body."
