# ROADMAP: Stabilization & Blog Engine (April 28, 2026)

## Phase 1: High Priority (Immediate Focus)
- [x] **getEntry Audit**: Final sweep of all `getEntry` calls in components (SideDrawer, QuickShop, Footer, etc.) to ensure absolute compatibility with the new YAML architecture.
- [ ] **Blog Engine Overhaul**:
    - [ ] **Blog Cards**: Refine `src/components/ui/BlogCard.astro` for a more premium editorial feel.
    - [ ] **Layout & TOC**: Implement a sticky Table of Contents (TOC) sidebar and magazine-style layout for `src/pages/blog/[...slug].astro`.
- [ ] **Affiliate Quick Shop (Redesign)**: Perform a premium design overhaul of the Quick Shop component used in Affiliate mode (currently functional but basic).
- [ ] **Cloudflare Pages Setup**: Finalize the transition from Netlify. Configure environment variables, build settings, and deployment hooks in the Cloudflare dashboard.
- [ ] **Affiliate Link Verification**: Integrate and verify links for platforms like Cuelinks and Admitad to ensure correct tracking and redirection.
- [ ] **"Sold Out" UI Mapping**: Map Snipcart's inventory data to our UI components. The "Add to Cart" button should dynamically switch to a disabled "Sold Out" state based on stock levels.
- [ ] **Free Shipping Nudge (Visual Fix)**: Fix the progress bar logic so it doesn't say "₹3,000 more" when the cart is already above the threshold.
- [ ] **PopupModal Scoping**: Implement the denylist logic to prevent the global popup from appearing on sensitive pages (Checkout, PDP, Lookbooks).

## Phase 2: Medium Priority (Growth & Management)
- [ ] **SEO & Metadata Infrastructure**: 
    - [ ] Implement dynamic `sitemap.xml` and `robots.txt` generation.
    - [ ] Audit all page titles, meta descriptions, and Open Graph tags across the multi-brand engine.
- [ ] **Full Funnel Analytics**: Use Alpine.js to track "Add to Cart", "Begin Checkout", and "View Item" events (Enhanced Measurement) to identify conversion leaks.
- [ ] **R2 Image Governance (CMS)**: Investigate Keystatic custom fields or external workflows to allow direct R2 uploads/picks, removing the need for manual URL entry.
- [ ] **Heading Component Audit**: Sweep usages of `src/components/primitives/Heading.astro` to ensure the new `size` prop is used instead of unnecessary hardcoded CSS overrides.
- [ ] **Rate Limiting & Security**: Implement basic rate limiting and security headers for Cloudflare Pages/Workers.
- [ ] **Marketing Pixels & Consent**:
    - [ ] Integrate Google Marketing Pixel / Tracking.
    - [ ] Implement GDPR (EU) and DPDP (India) compliant consent management.
- [ ] **RSS Feed**: Basic RSS support for the blog collection.

## Phase 3: Low Priority / On-Hold
- [ ] **Payment Robustness Audit**: Simulate bank failures, session timeouts, and window-closing events in the Razorpay bridge to ensure no "ghost orders."
- [ ] **Accessibility (a11y) Audit**: Ensure the `SideDrawer`, `PopupModal`, and filters are fully navigable for screen readers and keyboard users.
- [ ] **Immersive Animations (WIP)**: Currently on hold. Controlled via "Enable Immersive Reveal (GSAP)" toggle in Keystatic.
- [ ] **Multi-Currency (Global Sync)**: Ensure multi-currency logic is consistent across D2C and Affiliate modes (Geo-detection).
- [ ] **NewsletterWidget Cleanup**: Remove the "Section" variant logic as it's now standard in the footer.
- [ ] **Second Brand Stress Test**: Deploy a secondary "Affiliate Mode" brand to verify the engine's white-label flexibility.
- [ ] **Section Sorting**: Not required for now. Possible future exploration.

---

### Time Estimates
- **Immediate Priorities (Phase 1)**: ~8-10 Development Sessions.
- **Growth & Management (Phase 2)**: ~6-8 Development Sessions.
- **Audit & Future Features (Phase 3)**: ~10+ Sessions.

*Total Estimate: 25-30 Sessions for full stabilization and launch-ready state.*
