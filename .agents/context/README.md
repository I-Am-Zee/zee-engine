# Architecture Documentation Library

Welcome to the `.agents/context/` directory. This folder is the **"Source of Truth"** for all system specifications and architectural designs in this Multi-Tenant White-Label E-Commerce Engine.

This directory is intended for both human developers and AI agents. It ensures everyone shares the same foundational context when modifying or extending the system.

## Index of Context Files

1. **[ARCHITECTURE OF A MULTI-BRAND ENGINE.md](./ARCHITECTURE%20OF%20A%20MULTI-BRAND%20ENGINE.md)**
   - Explains the multi-tenant architecture, the `PUBLIC_BRAND_ID` rule (the "Master Key"), and the different deployment modes (D2C, Affiliate, Editorial).

2. **[CLOUDFLARE EMAIL OBFUSCATION.md](./CLOUDFLARE%20EMAIL%20OBFUSCATION.md)**
   - Details the use of Cloudflare's email obfuscation features to protect email addresses displayed on the platform.

3. **[EMAILS AND HACK.md](./EMAILS%20AND%20HACK.md)**
   - Outlines the transactional and marketing email infrastructure, including the specific routing and integrations like Snipcart, Shiprocket, and MailerLite.

4. **[IMAGE-ENGINE R2 WORKER.md](./IMAGE-ENGINE%20R2%20WORKER.md)**
   - Documents the dynamic image processing pipeline utilizing Cloudflare R2 and Workers. Includes details on dynamic multi-tenant prefixing, Dev-Mode fallback, and standard resizing arrays.

5. **[THE ATOMIC DESIGN.md](./THE%20ATOMIC%20DESIGN.md)**
   - Provides guidelines on the strict use of Atomic Design (Primitives, UI Components, Feature Components) across the codebase, ensuring consistent structure.

6. **[THE STACK OF CODEBASE.md](./THE%20STACK%20OF%20CODEBASE.md)**
   - A comprehensive overview of the technical stack used, including Astro, Tailwind CSS, Alpine.js, GSAP, and others, dictating what technologies are permitted and how they interact.
