# Architectural Vision: The Zee Engine "Ghost Operator" Client

## The Core Concept
The Zee Engine Client is a **White-Labeled, Native Management Portal** designed for non-technical workers. It acts as an encapsulation layer—a "Ghost Operator"—that hides the complexity of the underlying Multi-Tenant Engine while providing a "Walled Garden" for content management.

Instead of fighting the OS with complex "shredding" or "RAM-only" execution, the engine uses **Environment Injection**, **Directory Junctions**, and the **Vite Secret Bridge** to achieve high speed and security.

---

## 🏗️ High-Level System Map

```text
[ PRIVATE GITHUB REPO ]  ◄── Auth via Compiled Master Tokens ──►  [ RUST/TAURI LAUNCHER ]
 (The "Brain" Code)                                                       │ 
                                                              Injects .env & Creates Junction
                                                                          │
                                                                          ▼
[ PREVIEW WEBSITE ]     ◄─── Relays Local Port 4321 ─────────►   [ THE ZEE ENGINE ]
(preview.brand.com)      (Via Cloudflare Tunnel)               (Astro 5 + Vite Bridge)
                                                                          │
                                                                 Feeds Keystatic UI
                                                                          │
                                                                          ▼
[ MASTER MEDIA REPO ]    ◄── Secure server.fs.allow Bridge ──► [ LOCAL DEVELOPMENT ]
 (The "Body" Assets)       (Zero-Copy Architecture)             (Windows Junctions)
```

---

## ⚙️ Component Breakdown & Workflow

### 0. 📦 Asset Management & The Append-Only Rule
To ensure 100% reliability during R2/Rclone synchronization and prevent accidental data loss, the engine follows an **Append-Only Media Strategy**.

*   **Slots (Singletons):** Images like `home-hero.jpg`, `trust-section.jpg`, `cover.jpg`, or `avatar.jpg` are "slots". Replacing them in the CMS intentionally overwrites the file. These are used for primary branding and visibility.
*   **Identity (Galleries):** Gallery images are assigned unique, immutable IDs following the `[slug]-gn.jpg` pattern (e.g., `celestial-diamond-ring-g1.jpg`). 
*   **Decoupled Order:** Reordering images in the CMS (Keystatic) only updates the MDX/YAML metadata. The physical files on disk never change names and are never deleted by the CMS.
*   **Asset Sovereignty:** All assets must live in `public/images/[category]/[slug]/`. External URLs are strictly forbidden in production content; all assets must be localized.
*   **Sync Safety:** Because filenames are immutable (except for slot overwrites), `rclone sync` can operate with 100% confidence. Deleted local assets do NOT trigger cloud deletions unless a manual "Purge" is executed.

### 1. The Ghost Operator (Rust/Tauri Backend)
* **Zero-Copy Initialization**: On launch, the Rust app identifies the local path to your Master Media Repo and creates a **Windows Directory Junction** at `public/images`. This turns a 10-minute file-copy process into a 0.1-second instant link.
* **Environment Injection**: The Rust app compiles brand-specific keys and GitHub tokens into machine code. It injects `PUBLIC_BRAND_ID` and `LOCAL_MEDIA_PATH` into the engine's environment on boot. No `.env` files are ever left behind for workers to copy.
* **The App Cache Fallback**: If the system cache is wiped, the app instantly pulls a fresh copy from GitHub on the next boot, functioning as a foolproof "factory reset".

### 2. The Vite "Secret Bridge"
* **Security via `server.fs.allow`**: To prevent browsers from blocking access to junctioned media on other drives, the Zee Engine uses Vite's `server.fs.allow` configuration. This grants the engine specific permission to read from the Master Media Repo while keeping the rest of the file system locked down.

### 3. The Hardened Frontend Layer (The User Sandbox)
* **Native DevTools Block**: Tauri's native webview configurations are locked down (`devtools: false`). Context menus, F12, and inspector shortcuts are programmatically disabled via JavaScript keyboard listeners.
* **Isolated Webview**: The frontend only renders the Keystatic visual content editor. It cannot access or read the underlying Astro components, styles, or routing code.

### 4. Asset Management Engine: The Embedded Rclone Pipeline
* **First-Party vs Third-Party Bucket Strategy:** 
  * *Internal Operations:* Your first-party brands all live within folders in a single master bucket (e.g., `zee-media-production/zelia-vance`). Your internal tools sync specific folders to prevent cross-contamination.
  * *Client/Franchise Operations:* External clients are assigned a completely dedicated, isolated bucket (e.g., `client-brand-bucket`), ensuring zero risk to your master assets.
* **The Embedded Rclone Engine**: The app leverages the industry-standard `rclone` utility under the hood. When a user clicks "Sync Media", the Tauri backend executes a native `rclone sync` subprocess targeting their specific bucket or folder path.
* **Auto-Update Mechanism**: On launch, the Tauri app can verify if the bundled `rclone` or `cloudflared` executables are up-to-date and silently upgrade them if necessary.

### 5. Preview & Deployment (The Tunnel Bridge)
* **Ephemeral Previews**: A bundled `cloudflared` sidecar provides a secure staging URL (e.g., `https://preview.brand.com`) for the worker to see their changes live.
* **The "One-Click" Publish Sync**: When the user clicks "PUBLISH", the frontend sends an IPC signal to Rust. Rust silently runs a local Git commit and push. Cloudflare Pages detects the update and deploys the production site.

### 6. System Requirements & Fresh PC Onboarding
* **Global Node.js Verification**: To keep the desktop client lightweight, Rust checks the system's global PATH for a valid Node.js installation.
* **Native Installer Bridges**: If Node.js is missing, Tauri prompts the user with a clean modal. Clicking "Install Now" opens the official Node.js installer page via the default system browser.

---

## 🛡️ The "Honest Person" Security Model
We protect our intellectual property by **specialization**, not just encryption.
* **The Scary Gibberish Rule**: To a non-technical worker, a file like `DynamicProductGrid.astro` is just a wall of confusing text. Without the "Wiring" (R2, Snipcart, DNS), the code is dead weight.
* **The Value is the Wiring**: The real IP is how Keystatic, Snipcart, R2, and Astro are wired together. You are the Architect; the worker only sees the Faucet.
* **Walled Garden**: The Rust app is there to make their job easier, and as a side effect, it keeps your source code out of their direct line of sight.

---

**Summary:** The Zee Engine is an "Environment-Aware Ghost." It exists only when the Mastermind (or the Launcher) tells it to wake up.
