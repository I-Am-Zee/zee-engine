# Brand Setup Guide
> How to launch a new brand on this engine.
> Estimated time: 2–4 hours for a complete, styled, production-ready brand.

---

## Step 1: Fork the `.env`
Create a new `.env` file for the deployment (or set these in Cloudflare Pages environment variables):

```env
# REQUIRED — All three must be set
PUBLIC_BRAND_ID="your-brand-id"          # e.g., "fashion-edit"
PUBLIC_SITE_URL="https://yourbrand.com"  # No trailing slash
PUBLIC_AFFILIATE=false                   # true for affiliate, false for D2C

# D2C ONLY (skip entirely if PUBLIC_AFFILIATE=true)
PUBLIC_SNIPCART_API_KEY="your_key"
PUBLIC_RAZORPAY_KEY_ID="your_key"
SNIPCART_SECRET_API_KEY="your_key"
RAZORPAY_KEY_SECRET="your_key"
SHIPROCKET_EMAIL="your_email"
SHIPROCKET_PASSWORD="your_password"
SHIPROCKET_WEBHOOK_TOKEN="your_token"
MAILERLITE_API_KEY="your_key"
MAILERLITE_GROUP_ID="your_group_id"

# AFFILIATE ONLY (skip entirely if PUBLIC_AFFILIATE=false)
# No additional keys required — affiliate links are in the content files
```

---

## Step 2: Create the Content Folder
```
src/content/{your-brand-id}/
├── products/
├── lookbooks/
├── blog/
├── settings/
│   ├── site.yml
│   └── tracking.json
└── newsletter/
    └── {your-brand-id}.json
```

### `settings/site.yml` Minimum Required Fields
```yaml
name: "Brand Name"
tagline: "Short tagline"
description: "SEO site description"
url: "https://yourbrand.com"
email:
  support: "support@yourbrand.com"
  orders: "orders@yourbrand.com"
social:
  instagram: "https://instagram.com/yourbrand"
free_shipping_threshold: 3000
```

### `settings/tracking.json`
```json
{
  "googleAnalyticsId": "G-XXXXXXXXXX",
  "metaPixelId": "YOUR_PIXEL_ID",
  "snipcartPublicKey": "YOUR_SNIPCART_KEY"
}
```
For affiliate brands, omit `snipcartPublicKey`. Add `cuelinksId` or `admitadId` instead.

---

## Step 3: Add Your Products

### For D2C Brands
Create `.md` files in `src/content/{brand-id}/products/`:
```markdown
---
title: "Product Name"
sku: "ABC-001"
price: 1299
image: "/images/products/product-name.webp"
category: "rings"
description: "Short description for SEO (max 200 chars)"
---
Full rich text product description goes here.
```

### For Affiliate Brands
Create `.md` files with the affiliate schema:
```markdown
---
title: "Product Name"
affiliate_link: "https://cuelinks.go2cloud.org/..."
affiliate_platform: "Myntra"
display_price: 1299
image: "/images/products/product-name.webp"
category: "clothing"
description: "Short description"
---
Description text here.
```

---

## Step 4: Create the Brand Theme
Create `src/styles/{brand-id}/theme.css`:
```css
:root {
  /* Colors */
  --color-primary: #052b22;
  --color-primary-foreground: #f5f0e8;
  --color-accent-brass: #b5945a;

  /* Typography */
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Inter', system-ui, sans-serif;

  /* Shape */
  --radius-sm: 0px;    /* Sharp corners = luxury */
  --radius-md: 0px;
  --radius-lg: 0px;
}
```

If you skip this step, the brand will render with the greyscale fallback defaults from `src/styles/base.css`. This is intentional — the site will still be functional, just unstyled.

---

## Step 5: Deploy to Cloudflare Pages
1. Create a new Cloudflare Pages project pointing to the same GitHub repository.
2. Set the environment variables from Step 1 in the Cloudflare dashboard.
3. Set the build command: `npm run build`
4. Set the output directory: `dist`
5. Deploy.

The engine will automatically serve Brand 2's content because `PUBLIC_BRAND_ID` points to a different folder.

---

## Checklist Before Going Live
- [ ] `PUBLIC_BRAND_ID` set and matches the `src/content/` folder name exactly
- [ ] `PUBLIC_SITE_URL` set to the exact production domain (used by Snipcart crawler)
- [ ] `PUBLIC_AFFILIATE` correctly set to `true` or `false`
- [ ] `settings/site.yml` filled with real brand data (not Zelia Vance's)
- [ ] At least one product in the `products/` folder
- [ ] Brand theme CSS created (or greyscale fallback accepted)
- [ ] Test the full checkout flow if D2C (Snipcart → Razorpay → Success)
- [ ] Test affiliate links if Affiliate mode (external link opens correctly)
