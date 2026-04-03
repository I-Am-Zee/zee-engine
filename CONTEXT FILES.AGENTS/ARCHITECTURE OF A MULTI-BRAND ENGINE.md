### Architecture (Multi-Brand Engine Vision)

This codebase is a **Multi-Tenant White-Label E-Commerce Engine.**

**The Vision:**

- One Git repo → Multiple Cloudflare Pages deployments
- Each deployment differs by a `BRAND` environment variable
- Brand-specific content in `src/content/BrandName/` folders
- Brand-specific tokens in `src/styles/BrandName/global.css`
- Same component library, different tokens/content/config = different website

**Three Brand Modes:**

1. **D2C Full** (Zelia Vance): Snipcart + Shiprocket + Razorpay
2. **Affiliate**: No cart. Product catalog with "Shop Now" → Cuelinks/Admitad links
3. **Editorial**: No store. Lookbooks, blogs, content only

### Content Systems (Two Types — Do Not Mix)

- **Markdown** → Legal pages (T&C, Privacy, Returns, Shipping). Pure text, linear.
- **JSON** → Immersive pages that may contain images as well (About, Care Guide). GSAP/Lenis template + JSON screenplay.

