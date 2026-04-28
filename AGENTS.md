# AGENTS.md — AI Agent Context File

> **This is the single source of truth for all AI agents, coding assistants, and automated tools working on this codebase.**
> Read this file completely before touching any code. Every decision in here was made deliberately.
> Do NOT deviate from anything in this document without explicit confirmation from the repository owner.

---

## 1. What This Codebase Is

This is **not just a jewelry website.** It is a **Multi-Tenant White-Label E-Commerce Engine** — an Astro-based platform designed to be deployed as multiple distinct brand websites from a single codebase.

**Zelia Vance** (a costume jewelry brand by I Am Zee, Mohali, Punjab, India) is **Brand #1** — the live proof of concept. Every architectural decision is made with the multi-brand future in mind.

Think of it like: one codebase, one component library, deployed N times for N brands, each differing by environment variables and content files.

---

## 2. Brand Identity — Zelia Vance (Brand #1)

| Field                  | Value                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Legal Entity**       | I Am Zee (Partnership Firm)                                                                                                     |
| **Trade Name**         | Zelia Vance                                                                                                                     |
| **Business Address**   | Sector 77, S.A.S. Nagar (Mohali), Punjab, India                                                                                 |
| **Jurisdiction**       | Mohali, Punjab, India                                                                                                           |
| **Product Category**   | Costume Jewellery (HSN 7117)                                                                                                    |
| **Price Range**        | ₹399 – ₹5,000 max                                                                                                               |
| **Target Demographic** | Women, 20–40, working class, India                                                                                              |
| **Market**             | India only. No international shipping.                                                                                          |
| **Brand Positioning**  | "Old Money look at a fraction of the price."                                                                                    |
| **Brand Persona**      | "Zee" — the brand voice. Never the founder. Never founder-led.                                                                  |
| **Brand Voice**        | Warm, direct, Gen-Z adjacent. NOT formal Vogue-style. Think: the stylish older sister who found the secret. Inclusive high-end. |

### Product Tiers

- **Signature Line**: PVD Coated — marketed as "Life-Proof" (tarnish-free, water-resistant, sweat-proof).
- **Essentials Line**: Current stock — marketed as "Trend-Watch."

### Brand Voice Examples

- ✅ _"Zelia Vance exists because the 'Old Money' look shouldn't require an 'Old Money' bank account. Period."_
- ✅ Warm, conversational, speaks to coffee runs, 9-to-5s, self-gifted milestones.
- ❌ NOT: Stiff luxury copy, founder-led storytelling, aggressive sales language.

---

## 3. The Multi-Brand Engine Architecture

**The Vision:**

- One Git repo → Multiple Cloudflare Pages deployments
- Each deployment differs by a `BRAND` environment variable
- Brand-specific content: `src/content/{BrandName}/`
- Brand-specific design tokens: `src/styles/{BrandName}/global.css`
- Shared component library — same primitives/UI/features, different tokens and content

**Three Operating Modes:**

1. **D2C Full** (Zelia Vance): Snipcart + Shiprocket + Razorpay — full e-commerce.
2. **Affiliate**: No cart. Product catalog with "Shop Now" → Cuelinks/Admitad affiliate links.
3. **Editorial**: No store. Lookbooks, blogs, content only.

**Content Systems — Two Types, Never Mix:**

- **Markdown** → Legal pages (T&C, Privacy, Returns, Shipping). Plain text, linear. Lives in `src/content/pages/`.
- **YAML** → Immersive pages (About, Care Guide, brand story) and Site Settings. May contain images. Paired with GSAP/Lenis templates. Lives in `src/content/{BrandName}/`.

---

## 4. Tech Stack

| Layer                     | Technology                                   | Notes                                                                 |
| ------------------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| **Framework**             | Astro 5 (Island Architecture)                | JAMstack. Static-first, islands for interactivity.                    |
| **Styling**               | Tailwind CSS v4                              | **No vanilla CSS. Ever.**                                             |
| **Interactivity**         | Alpine.js                                    | UI state management.                                                  |
| **Animations**            | GSAP + Lenis                                 | Planned for immersive pages (About, Care Guide). Not yet implemented. |
| **Cart**                  | Snipcart v3                                  | Custom templates in `public/snipcart-templates.html`.                 |
| **Payments**              | Razorpay                                     | Custom bridge at `/checkout/razorpay`.                                |
| **Shipping**              | Shiprocket                                   | Webhook sync at `/api/webhooks/logistics-sync.ts`.                    |
| **CMS**                   | Keystatic                                    | **Planned. Not yet integrated.** Git-based, no DB.                    |
| **Hosting**               | Cloudflare Pages                             | CDN. Netlify adapter is being replaced — see pending work.            |
| **Storage**               | Cloudflare R2                                | Product images. See Image Engine section.                             |
| **Email (Transactional)** | Snipcart native + Snipcart Notifications API | Invoice + delivery feedback email.                                    |
| **Email (Marketing)**     | MailerLite                                   | Free tier. Group ID: `183469983098995840`.                            |
| **Feedback Forms**        | Tally.so                                     | Free tier. Linked from delivery email.                                |
| **Search**                | Fuse.js                                      | Client-side fuzzy search.                                             |
| **Carousel**              | Splide.js                                    | Community library. Don't reinvent carousels — use Splide.             |

### Current Dependencies (Exact Versions)

```json
"@alpinejs/collapse": "^3.15.6",
"@astrojs/alpinejs": "^0.4.9",
"@astrojs/netlify": "^6.6.4",   ← PENDING REPLACEMENT with @astrojs/cloudflare
"@splidejs/splide": "^4.1.4",
"@tailwindcss/typography": "^0.5.19",
"@tailwindcss/vite": "^4.1.18",
"@types/alpinejs": "^3.13.11",
"alpinejs": "^3.15.4",
"astro": "^5.16.11",
"fuse.js": "^7.1.0",
"phosphor-icons-astro": "^2.1.1-17042025",
"prettier": "^3.8.0",
"prettier-plugin-astro": "^0.14.1",
"prettier-plugin-tailwindcss": "^0.7.2",
"razorpay": "^2.9.6",
"tailwindcss": "^4.1.18"
```

---

## 5. Atomic Design System — THE RULES

This codebase strictly follows Atomic Design Methodology. Every component lives at exactly one of three levels.

### The Three Layers

**Primitives** (`src/components/primitives/`)

- Atoms. Smallest building blocks.
- Examples: `Button.astro`, `Input.astro`, `Heading.astro`, `Text.astro`, `Icon.astro`, `Image.astro`, `Badge.astro`, `Link.astro`, `Logo.astro`
- Rules:
  - No API calls. No event listeners. No imports from `scripts/behaviors/`.
  - Only props and styles.
  - May import from `scripts/utils/` for pure formatting functions.

**UI Components** (`src/components/ui/`)

- Molecules. Combinations of Primitives.
- Examples: `SectionHeader.astro`, `NewsletterForm.astro`, `GlassProductCard.astro`, `SideDrawer.astro`, `PopupModal.astro`, `FormField.astro`, `Accordion.astro`
- Rules:
  - No API calls. No imports from `scripts/behaviors/`.
  - May import from `scripts/utils/` for formatting.
  - Receive data via props. Emit events via callbacks.
  - Logic-light. Layout and style responsibility only.

**Feature Components** (`src/components/features/`)

- Organisms. The controllers.
- Examples: `Navbar.astro`, `Footer.astro`, `WishlistButton.astro`, `NewsletterConfirmForm.astro`, `FreeShippingNudge.astro`, `LookbookCarousel.astro`
- Rules:
  - May import behaviors via `<script>` tag.
  - Handle state, API calls, complex event listeners.
  - Pass data down into UI components and Primitives.
  - Each feature's behavior lives in a dedicated `scripts/behaviors/` file.

### The Script Folders

**`scripts/utils/`** — Pure functions only.

- Math, string parsing, formatting, validation logic.
- No side effects. No DOM access.
- Safe to import from Primitives, UI, and Features.
- Current files: `badges.ts`, `currency.ts`, `validation.ts`

**`scripts/behaviors/`** — Business logic only.

- API calls, state machines, complex event listeners.
- May access the DOM.
- Import into Features only. Never into Primitives or UI.
- Current files: `wishlist.ts`, `newsletter.ts`, `carousel.ts`, `options-sync.ts`, `popup.ts`, `quantity.ts`, `quick-shop.ts`, `side-drawer.ts`, `toggle.ts`

### Styling Rules

- **Tailwind CSS v4 exclusively.** No `<style>` blocks in Feature components or pages.
- Vanilla CSS is only allowed in `src/styles/global.css` and `src/styles/snipcart.css` for design token definitions and global resets.
- Colors are always referenced via CSS custom properties: `var(--color-primary)`, `var(--color-accent-brass)`, etc. Never raw hex values in components.
- Tailwind v4 uses `bg-(--color-primary)` syntax (not `bg-[var(--color-primary)]`). This is intentional.

---

## 6. Directory Structure (as of 03-04-2026)

```
src/
├── components/
│   ├── primitives/      ← Atoms: Button, Input, Heading, Text, Icon, Image, Badge, Link, Logo
│   ├── ui/              ← Molecules: SectionHeader, NewsletterForm, SideDrawer, GlassProductCard, etc.
│   └── features/        ← Organisms: Navbar, Footer, WishlistButton, NewsletterConfirmForm, etc.
├── content/             ← All CMS-managed content (Astro Content Collections)
│   ├── settings/        ← site.yml (global config: free shipping threshold, popup modal, etc.)
│   ├── pages/           ← Markdown legal pages (returns.md, terms-of-service.md, etc.)
│   ├── products/        ← Product data files
│   ├── collections/     ← Collection data files
│   └── lookbooks/       ← Lookbook data files
├── layouts/
│   ├── BaseLayout.astro         ← Main layout (Navbar, Footer, Snipcart, AnnouncementBar, PopupModal)
│   └── CheckoutLayout.astro     ← Minimal layout for checkout flow
├── lib/
│   └── site.config.ts   ← Brand-level constants (name, tagline, description, email, phone, socials)
├── pages/
│   ├── api/             ← Server-only API routes (webhooks, checkout, actions)
│   ├── newsletter/      ← confirm.astro, success.astro
│   ├── checkout/        ← razorpay.astro
│   ├── collections/     ← Collection pages
│   ├── lookbooks/       ← Lookbook pages
│   ├── products/        ← PDP pages
│   └── shop/            ← Shop/listing pages
├── scripts/
│   ├── utils/           ← Pure functions (validation.ts, currency.ts, badges.ts)
│   └── behaviors/       ← Business logic (newsletter.ts, wishlist.ts, side-drawer.ts, etc.)
├── styles/
│   ├── global.css       ← Design tokens, utilities, prose-zelia styles
│   └── snipcart.css     ← Snipcart brand overrides (5-section architecture)
└── config/
    ├── ecommerce.ts     ← SSOT for all product data configuration
    └── shipping.json    ← Shipping slab configuration
```

---

## 7. Key Files — Read Before Editing

| File                                        | What It Does                                                                                                             |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src/styles/global.css`                     | Full design system. All CSS custom properties (color tokens, spacing, typography). Source of truth for all brand colors. |
| `src/styles/snipcart.css`                   | Snipcart brand overrides. 5-section architecture. Never break section boundaries.                                        |
| `src/lib/site.config.ts`                    | Brand constants: name, tagline, email addresses, phone, social links.                                                    |
| `src/content/settings/site.yml`             | Runtime config: announcement bar, popup modal, free shipping threshold.                                                  |
| `public/snipcart-templates.html`            | Custom Snipcart checkout markup. IDs ov-1 through ov-14. Handle with extreme care.                                       |
| `src/pages/api/checkout/order-completed.ts` | Snipcart → MailerLite + Shiprocket sync webhook. Fires on every order.                                                   |
| `src/pages/api/webhooks/logistics-sync.ts`  | Shiprocket → Snipcart status update webhook. Triggers delivery email + Tally feedback link.                              |
| `src/pages/checkout/razorpay.astro`         | Custom Razorpay payment bridge. Do not modify without understanding the full payment flow.                               |
| `src/scripts/behaviors/options-sync.ts`     | Syncs product variant selections with Snipcart custom fields. Sensitive.                                                 |
| `src/components/ui/SideDrawer.astro`        | Multi-mode drawer (upsell, quick-shop, master-set). Alpine.js powered. Leave alone unless specifically tasked.           |

---

## 8. The Newsletter Engine (Built — Do Not Rebuild)

The newsletter subscription flow is fully implemented. Do NOT rebuild or replace it.

**Architecture:**

```
scripts/utils/validation.ts          ← isGmailAddress(), isValidEmail() pure fns
scripts/behaviors/newsletter.ts      ← initNewsletterConfirm() business logic
components/primitives/Input.astro    ← has readonly prop
components/ui/NewsletterPageCard.astro  ← card shell UI (eyebrow, heading, slot)
components/ui/NewsletterForm.astro      ← simple inline form (footer/section use)
components/features/NewsletterConfirmForm.astro  ← full confirm form + behavior
pages/newsletter/confirm.astro       ← SSR, reads ?email= from URL, ultra-thin
pages/newsletter/success.astro       ← static thank-you page
pages/api/actions/newsletter-subscribe.ts  ← POST endpoint → MailerLite API
```

**Key behaviors:**

- Checkout opt-in checkbox (`subscribeToNewsletter`) → Direct MailerLite API call in `order-completed.ts`.
- Delivery email "stay in the loop" link → `/newsletter/confirm?email={order.email}` → User clicks confirm → API called.
- Gmail-only validation applies when user types their email. Pre-filled email (from delivery link) uses basic format validation only (order email may not be a Gmail).
- MailerLite Group ID: `183469983098995840`.

**A `NewsletterWidget.astro` feature component with variant system is planned** (variants: `section`, `footer`, `sidebar`, `modal`) but not yet built. When building it, it must be brand-agnostic — copy comes from a YAML content file, not hardcoded.

---

## 9. Email Infrastructure

### Transactional Emails (Snipcart)

1. **Order Invoice Email** — Sent immediately on purchase via Snipcart's native invoice template. Triggered at `/api/checkout/order-completed.ts`.
2. **Delivery + Feedback Email** — Custom HTML template. Sent when Shiprocket marks order as "Delivered." Includes Tally.so feedback link. Triggered at `/api/webhooks/logistics-sync.ts`.

### Delivery Updates (Shiprocket)

Shiprocket handles all in-transit notifications: pickup → dispatch → out for delivery → delivered. Done via Shiprocket's own email/SMS/WhatsApp at ₹5/order.

### Marketing Emails (MailerLite)

Promotional newsletters. Free tier. Sent from `withlove@zeliavance.com`. Reply-to: `zee@zeliavance.com`.

### Email Aliases (Cloudflare Routing → zeliavance.official@gmail.com)

| Alias                      | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `hello@zeliavance.com`     | General inquiries                          |
| `support@zeliavance.com`   | Customer care, order issues                |
| `zee@zeliavance.com`       | MailerLite reply-to (brand persona "Zee")  |
| `legal@zeliavance.com`     | Privacy/Terms inquiries                    |
| `orders@zeliavance.com`    | Snipcart transactional, reply-to: support@ |
| `withlove@zeliavance.com`  | MailerLite outbound sender                 |
| `logistics@zeliavance.com` | Shiprocket API user (backend only)         |
| `test1@zeliavance.com`     | Testing purposes                           |
| `test2@zeliavance.com`     | Testing purposes                           |

All aliases route to `zeliavance.official@gmail.com`. Gmail SMTP "send as" via App Password method. Labels separate each inbox category. Except for the `logistics@zeliavance.com` which routes to `iamzee.company+zelia.logistics@gmail.com`.

---

## 10. Image Engine — R2 + Cloudflare Worker (LIVE)

A "Source → Processor → Consumer" pipeline is fully active:

1. **Source**: High-res unoptimized product photos uploaded to Cloudflare R2 bucket (`zee-media-production`).
   - Standard Folder Structure: `/\<brand-id\>/\<category\>/file.webp`
2. **Storage**: R2 holds master files accessed securely via `vault-x92k-zee.zeliavance.com`.
3. **Processor (Worker)**: A Cloudflare Worker listens on `assets.zeliavance.com`.
4. **Consumer**: `Image.astro` primitive generates `srcset` using `IMAGE_GATEWAY_URL`.

**Multi-Tenant Mapping Rules:**
- **Dynamic Prefixing**: The system uses `PUBLIC_BRAND_ID` from `.env` to map local-style paths (e.g., `/images/products/`) to R2-style paths (e.g., `zelia-vance/products/`).
- **Dev Fallback**: In `DEV` mode, the engine automatically falls back to local disk files (`/public/images/`) to bypass Cloudflare Referrer restrictions on localhost.
- **Production**: In build/production, the engine strictly uses the R2 Gateway for optimized delivery.


**Worker implementation rules (Already Implemented):**
- Includes `sharpen: 1.0` and `format: 'auto'`.
- Fixed snapping width array (200, 400, 800, 1200).
- Security block ensures `ALLOWED_DOMAINS` referers only.

---

## 11. Current State & Pending Work

### Active Branch

`feature/content-foundation`

### Completed (Do Not Revisit Without Explicit Instruction)

- ✅ Full Snipcart UI rebrand (Royal Conservatory palette)
- ✅ Custom checkout templates (snipcart-templates.html)
- ✅ Razorpay custom payment bridge
- ✅ Shiprocket webhook receiver + status mapping
- ✅ Delivery email + feedback loop (Tally.so)
- ✅ MailerLite dual-trigger integration (checkout + delivery confirm page)
- ✅ Newsletter confirmation flow (`/newsletter/confirm` + `/newsletter/success`)
- ✅ Legal page shells (returns, T&C, privacy policy, shipping)
- ✅ Design system primitives (Button, Input, Heading, Text, Icon, Image, Badge, Link, Logo)
- ✅ Wishlist system (Alpine.js store + localStorage)
- ✅ Free Shipping Nudge component
- ✅ SideDrawer (upsell, quick-shop, master-set modes)
- ✅ Lookbook Carousel (Splide.js)
- ✅ Z-index architecture
- ✅ Validation utils (`isGmailAddress`, `isValidEmail`)

### Pending (Next Sessions)

- ✅ **Cloudflare adapter** — Replaced `@astrojs/netlify`.
- ⏳ **Keystatic CMS integration** — Separate session. Git-based CMS for Cloudflare Pages.
- ⏳ **NewsletterWidget.astro** — Feature component with variants (`section`, `footer`, `sidebar`, `modal`). Copy from brand JSON. Not yet built.
- ⏳ **PopupModal scoping** — Currently fires on all pages via BaseLayout. Should be gated per page (not appropriate on checkout, PDP, shop, lookbook).
- ✅ **R2 + Worker image engine** — Implemented and handling all `400|800|1200` transformations via 5k Free Tier proxy loophole.
- ⏳ **About page** — GSAP + Lenis scroll, YAML-driven screenplay. Immersive layout.
- ⏳ **Care Guide page** — Same as About. GSAP + Lenis. YAML-driven.
- ⏳ **Blog system** — Including sticky TOC sidebar.
- ⏳ **Gemini CLI setup** — Terminal integration for PR review and Jules briefing.

---

## 12. Operational Decisions (Locked — Do Not Change Without Explicit Approval)

### Fulfillment

- Snipcart = Digital receipt / order confirmation (sent immediately on purchase)
- Shiprocket = Physical invoice (printed, in box) + all tracking comms
- Refunds: Prepaid → Razorpay refund (automated). COD → Manual bank transfer.

### Returns Policy

- 48-hour window from delivery
- Mandatory uncut unboxing video for ALL damage/defect claims
- Item must be unworn, original packaging, all tags intact
- Change of mind = NOT accepted. No exceptions. Costume jewellery is a personal-use/hygiene item.
- Refund initiated ONLY after item physically returned AND passes QC

### Free Shipping

- Threshold: ₹3,000 (configured in `src/content/settings/site.yml`)

### Shiprocket Webhook Auth

- Token: `ZeliaVance_Secure_Deploy_2026` (stored in `SHIPROCKET_WEBHOOK_TOKEN` env var)
- Webhook always returns `200 OK` to Shiprocket even on internal errors — prevents Shiprocket from retrying and sending duplicate emails.

---

## 13. Environment Variables

| Variable                   | Purpose                                               |
| -------------------------- | ----------------------------------------------------- |
| `PUBLIC_BRAND_ID`        | The unique identifier for the brand (e.g., `zelia-vance`). Used for R2 path mapping. |
| `PUBLIC_SNIPCART_API_KEY`  | Snipcart public key (client-side)                     |
| `SNIPCART_SECRET_API_KEY`  | Snipcart private key (server-side API calls)          |

| `RAZORPAY_KEY_ID`          | Razorpay public key                                   |
| `RAZORPAY_KEY_SECRET`      | Razorpay secret                                       |
| `SHIPROCKET_EMAIL`         | Shiprocket API login email                            |
| `SHIPROCKET_PASSWORD`      | Shiprocket API login password (Raw string, no escaping) |
| `SHIPROCKET_WEBHOOK_TOKEN` | Webhook auth token (`ZeliaVance_Secure_Deploy_2026`)  |
| `MAILERLITE_API_KEY`       | MailerLite API v3 key                                 |
| `MAILERLITE_GROUP_ID`      | MailerLite Newsletter group ID (`183469983098995840`) |
| `IMAGE_GATEWAY_URL`        | Cloudflare Worker URL for image serving (pending)     |

---

## 14. Git & Commit Protocol

### Branch Naming

- Active branch: `feature/content-foundation`
- New features: `feature/feature-name`
- Bug fixes: `fix/description`

### Commit Message Convention (Conventional Commits)

```
feat(scope): short description
fix(scope): short description
refactor(scope): short description
docs(scope): short description
chore(scope): short description
```

Examples from this repo:

- `feat(newsletter): branded consent-first subscription pages using atomic primitives`
- `fix(newsletter): update email input placeholder to natural language`
- `refactor(newsletter): rewrite pages using atomic primitives and Tailwind CSS only`
- `docs(feedback): update real Tally feedback URL in delivery notification`

### PR Rules (For Jules)

- Every PR must include a description of what changed and why.
- Never merge into `main` without owner review.
- Small, focused PRs — one feature or fix per PR.
- Run `npm run dev` (or `npm run build`) and verify the dev server compiles without errors before creating a PR.

---

## 15. AI Workflow Protocol

### Role Division

| Agent                   | Role                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| **Antigravity (daily)** | Architecture decisions, first-time patterns, complex feature design, code reviews.        |
| **Jules (nightly)**     | Well-defined bug fixes, consistency passes, integration of established patterns, testing. |
| **Gemini CLI**          | Writing Jules-ready GitHub issues, evaluating Jules PRs, quick codebase queries.          |

### What Jules SHOULD Work On

- Fixing specific, well-defined bugs referenced in GitHub Issues
- Adding a new page that follows an existing established pattern (e.g., a new legal page)
- Integrating a built component into a layout (e.g., adding `NewsletterWidget variant="footer"` to `Footer.astro` once the component exists)
- Consistency passes (e.g., ensuring all pages follow the same meta/SEO pattern)
- Writing tests for established behavior

### What Jules Should NOT Decide Alone

- Architecture (new patterns, new layers, new abstractions)
- Content strategy or brand copy
- Changes to `snipcart-templates.html` without full understanding of the template system
- Changes to `options-sync.ts` or `side-drawer.ts` (complex, interrelated)
- Replacing any established library with an alternative

---

## 16. Known False Positives — DO NOT FIX

| File                                     | Lines | Issue                                                 | Reality                                                                                                                                                                              |
| ---------------------------------------- | ----- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/components/ui/OptionSelector.astro` | 40–41 | IDE warns about `bg-primary`/`bg-background` conflict | **FALSE POSITIVE.** Alpine.js conditionally applies these classes at runtime. Tailwind v4 can't statically analyze Alpine.js expressions. Works correctly in browser. Do not change. |

---

## 17. 🚫 DO NOT EVER — The Hard Rules

These are non-negotiable. Violating any of these will break the codebase, the brand, or the multi-brand architecture.

### Code Rules

1. **Never use vanilla CSS** in component files or pages. No `<style>` blocks except in `global.css` and `snipcart.css`.
2. **Never use vanilla JavaScript.** TypeScript only (`.ts` files).
3. **Never hardcode color values** (hex, rgb, hsl) in components. Use CSS custom properties via Tailwind's `bg-(--color-*)` syntax.
4. **Never import behavior scripts** into Primitive or UI components. Behaviors go in Features only.
5. **Never put business logic** (API calls, event listeners) directly in `.astro` frontmatter. It belongs in behavior scripts.
6. **Never use `<style>` blocks** in Feature components or page files. Tailwind classes only.
7. **Never rename or restructure** the atomic folder hierarchy (`primitives/`, `ui/`, `features/`) without explicit instruction.
8. **Never replace Alpine.js** `x-data`, `x-show`, `x-if`, `x-for`, `x-bind`, or `@click` patterns with something else.
9. **Never "fix"** the known false positives listed in Section 16.
10. **Never store images in the Git repository.** Images live in Cloudflare R2.

### Business Rules

11. **Never accept change-of-mind returns** in any copy or policy text. The policy is locked.
12. **Never describe the founder** publicly in any brand copy or component. Brand persona is "Zee."
13. **Never add international shipping** language. India only.
14. **Never modify the `SHIPROCKET_WEBHOOK_TOKEN`** without updating the corresponding Shiprocket dashboard setting simultaneously.

### Architecture Rules

15. **Never mix Markdown and YAML content systems.** Legal pages = Markdown. Immersive pages and Settings = YAML.
16. **Never hardcode brand-specific values** (brand name, colors, copy) in shared components. All brand-specific data comes from environment variables or content files.
17. **Never merge to `main`** without owner review and approval.

---

## 18. Useful References

- [Astro Docs](https://docs.astro.build/en/getting-started/)
- [Snipcart Docs](https://docs.snipcart.com/v3/)
- [Keystatic Docs](https://keystatic.com/docs/) ← Planned CMS
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Tailwind CSS v4](https://tailwindcss.com/docs/)
- [Alpine.js](https://alpinejs.dev/start-here)
- [Fuse.js](https://www.fusejs.io/)
- [Splide.js](https://splidejs.com/documents/)
- [MailerLite API v3](https://developers.mailerlite.com/docs/)

---

_Last updated: April 2026. Maintained by the repository owner. Update this file whenever a strategic decision is made, a new system is implemented, or a new rule is established._
