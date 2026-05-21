# Architectural Vision: The Custom Desktop CMS Client (Internal Operations Edition)

## The Core Concept
The Desktop CMS Client is a **White-Labeled, Native Management Portal** designed for non-technical hired workers and franchise operators. It acts as an encapsulation layer that hides the complexity of the underlying Multi-Tenant E-Commerce Engine, while protecting the proprietary Astro source code and core business assets.

Instead of navigating Cloudflare dashboards, running local Node servers, or managing GitHub repositories, a worker simply clicks an icon on their desktop and is presented with a branded, dummy-proof interface.

---

## 🏗️ High-Level System Map

```text
[ PRIVATE GITHUB REPO ]  ◄── Auth via Compiled Master Tokens ──►  [ TAURI APP (Rust Backend) ]
 (Readable Astro Code)                                                    │ 
                                                            Unpacks directly into Temp Vault
                                                                          │
                                                                          ▼
[ PREVIEW WEBSITE ]     ◄─── Relays Live Local Port 4321 ────►   [ OS TEMP STORAGE VAULT ]
(://preview.domain)      (Via Cloudflare Tunnel Sidecar)     (Temporary .env Injected)
                                                                          │
                                                                 Feeds Keystatic UI
                                                                          │
                                                                          ▼
[ CLOUDFLARE R2 BUCKET ] ◄── Rclone Syncs Media Direct ────────► [ TAURI APP FRONTEND ]
 (Scoped Tenant Bucket)    (Wrapped CLI Command)               (DevTools Permanently Disabled)
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

### 1. App Initialization & Security (The Entry Point)
* **Pre-Baked Environment Keys:** Unique executables are built per client. Client-specific variables (`PUBLIC_BRAND_ID`, payment keys) and GitHub Tokens are compiled directly into the Rust machine code. There are no `.env` files on disk for users to read.
* **Volatile RAM Bootstrapping:** On launch, Rust fetches the readable Astro repository as a compressed archive directly from your private GitHub branch. It decrypts this strictly into volatile memory before moving to the execution phase.
* **The App Cache Fallback:** If the system cache is wiped, the app instantly pulls a fresh copy from GitHub on the next boot, functioning as a foolproof "factory reset".

### 2. The Hardened Frontend Layer (The User Sandbox)
* **Native DevTools Block:** Tauri's native webview configurations are locked down (`devtools: false`). Context menus, F12, and inspector shortcuts are programmatically disabled via JavaScript keyboard listeners.
* **Isolated Webview:** The frontend only renders the Keystatic visual content editor. It cannot access or read the underlying Astro components, styles, or routing code.

### 3. Asset Management Engine: The Embedded Rclone Pipeline
* **First-Party vs Third-Party Bucket Strategy:** 
  * *Internal Operations:* Your first-party brands all live within folders in a single master bucket (e.g., `zee-media-production/zelia-vance`). Your internal tools sync specific folders to prevent cross-contamination.
  * *Client/Franchise Operations:* External clients are assigned a completely dedicated, isolated bucket (e.g., `client-brand-bucket`), ensuring zero risk to your master assets.
* **The Embedded Rclone Engine:** The app leverages the industry-standard `rclone` utility under the hood. When a user clicks "Sync Media", the Tauri backend executes a native `rclone sync` subprocess targeting their specific bucket or folder path.
* **Auto-Update Mechanism:** On launch, the Tauri app can verify if the bundled `rclone` executable is up-to-date and silently upgrade it if necessary.
* **Decoupled Local/Cloud Assets:** The user’s personal media assets remain open on their hard drive, while the proprietary Astro code layout remains isolated.

### 4. Preview & Production Deployment (The Tunnel Bridge)
* **Ephemeral Subdomain Previews:** To avoid exposing local servers, Tauri quietly fires up a bundled `cloudflared` sidecar binary in the background. It maps the local runtime to a secure staging subdomain (e.g., `https://preview.brand.com`).
* **Real-Time Sandbox:** Clicking "PREVIEW WEBSITE" opens this tunnel link. Users can make changes in Keystatic, save them to the Temp Vault, and refresh the browser link to see live updates compiled instantly by Astro.
* **The "One-Click" Publish Sync:** When the user clicks "PUBLISH", the frontend sends an IPC signal to Rust. Rust silently runs a local Git commit and pushes the clean YAML changes from the Temp Vault back to GitHub. Cloudflare Pages detects the push and deploys the static JAMstack website.

### 5. Local Runtime Execution & Code Protection
* **Global Node.js Verification:** To keep the desktop client lightweight, Rust checks the system's global PATH for a valid Node.js installation.
* **Native Installer Bridges:** If Node.js is missing, Tauri prompts the user with a clean modal. Clicking "Install Now" opens the official Node.js installer page via the default system browser.
* **The OS Temporary Storage Vault:** On startup, the compressed Astro source code bundle is decrypted purely in RAM. Rust writes the temporary execution files into an obscured, deep subdirectory within the OS Temporary Directory (`std::env::temp_dir()`). Rust invokes the global Node.js binary, targeting it directly at this hidden folder to spin up the server.
* **Life-Cycle Destruction Hooks:** The exact millisecond the Tauri app window closes, a destruction hook completely shreds the temporary folder, leaving behind zero physical traces of your intellectual property on the client's machine.

---

## 🛡️ Why This Architecture Wins
* **Practical Security (Blast Radius Control):** By shifting to a separate bucket for third-party clients, even if an API key is compromised, the "blast radius" is limited to a single brand. Master data is never at risk.
* **Absolute Source Code Protection:** The unzipped project code lives strictly in a shredded temporary vault. Malicious users cannot steal your Astro template.
* **Rapid Development:** By utilizing proven, industry-standard CLI tools (`rclone` and `cloudflared`) instead of building networking protocols from scratch, the desktop app can be developed in a fraction of the time.
