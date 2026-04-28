# ROADMAP: Stabilization & Blog Engine (April 28, 2026)

## Phase 1: High Priority (Immediate Focus)
- [ ] **getEntry Audit**: Final sweep of all `getEntry` calls in components (SideDrawer, QuickShop, Footer, etc.) to ensure absolute compatibility with the new YAML architecture.
- [ ] **Blog Engine Overhaul**:
    - [ ] **Blog Cards**: Refine `src/components/ui/BlogCard.astro` for a more premium editorial feel.
    - [ ] **Layout & TOC**: Implement a sticky Table of Contents (TOC) sidebar and magazine-style layout for `src/pages/blog/[...slug].astro`.
    - [ ] **RSS Feed**: Basic RSS support for the blog collection (Medium Priority).
- [ ] **PopupModal Scoping**: Implement the denylist logic to prevent the global popup from appearing on sensitive pages (Checkout, PDP, Lookbooks).
- [ ] **Free Shipping Nudge (Visual Fix)**: Fix the progress bar logic so it doesn't say "₹3,000 more" when the cart is already above the threshold.

## Phase 2: Medium Priority (Security & Marketing)
- [ ] **Rate Limiting & Security**: Implement basic rate limiting and security headers for Cloudflare Pages/Workers.
- [ ] **SEO & Meta Optimization**: Audit all page titles, meta descriptions, and Open Graph tags across the multi-brand engine.
- [ ] **Marketing Pixels & Consent**:
    - [ ] Integrate Google Marketing Pixel / Tracking.
    - [ ] Implement GDPR (EU) and DPDP (India) compliant consent management.

## Phase 3: Low Priority / On-Hold
- [ ] **Immersive Animations (WIP)**: 
    - *Note*: Currently on hold. Description added to Keystatic for "Enable Immersive Reveal (GSAP)" to toggle this later.
- [ ] **Multi-Currency (Global Sync)**: Ensure multi-currency logic is consistent across D2C and Affiliate modes.
- [ ] **NewsletterWidget Cleanup**: Remove the "Section" variant logic as it's now standard in the footer.

---

### Time Estimates
- **Immediate Priorities (Blog + Audit + Popups + Nudge)**: ~5-7 Development Sessions.
- **Security & Marketing (SEO + Rate Limiting + Consent)**: ~4-6 Development Sessions.
- **Future Features (Multi-Currency + Animations)**: ~8+ Sessions.

*Total Estimate: 15-20 Sessions for full stabilization.*
