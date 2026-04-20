# Multi-Currency Implementation Roadmap

**Status:** Planned for Future (Currently launching INR-only for the Indian market)
**Context:** This document outlines the tested and verified "Double-Lock" architecture for enabling multi-currency Snipcart processing and global availability.

## The Architecture (The "Handshake")

To implement multi-currency pricing in Snipcart safely (preventing client-side tampering), we must use a JSON-based "Menu" approach in the markup.

### 1. The Data Source (Markup)
Instead of a simple number string, the `data-item-price` attribute on the `AddToCartButton` must output a valid JSON object holding the converted prices. 
*   **Astro's Job:** At build time (or via server-side mapping), a generic conversion utility evaluates the base INR price against live exchange rates (or hardcoded static rates).
*   **Output:** 
    ```html
    <!-- Note the single quotes guarding the valid JSON inside -->
    <button class="snipcart-add-item" 
            data-item-price='{"inr": 3999, "usd": 48.50, "gbp": 38.00}' 
            ... >
    ```

### 2. The Decision Maker (Session Detection)
Snipcart needs an active instruction to select a currency from the JSON map.
*   **The Detection:** Use Cloudflare Pages Middleware (`request.cf.country`) to detect the user's geo-location at the edge. 
*   **The Logic:** Run a small Alpine.js script (or inline JS) on page load to set the Snipcart session currency *before* a user adds to cart.
    ```javascript
    // Example: If Cloudflare detects US, we run this locally:
    Snipcart.api.session.setCurrency('usd');
    ```

### 3. The Security Guard (Crawler Verification)
When a user adds the item, the Snipcart server crawls the `data-item-url` to verify the price hasn't been altered in the browser console.
*   The product page must render the same `data-item-price` JSON structure for the crawler as it does for the browser. 
*   Snipcart reads the JSON, matches it against the session's active currency (`usd`), reads `48.50`, and authorizes the addition to the cart. 

---

## Configuration Requirements (The Double-Lock)

1. **Snipcart Dashboard (The Banker):** 
   You must explicitly enable and add the supported currencies (e.g., USD, GBP) under **Regional Settings** in your Snipcart dashboard. Snipcart will reject any currency it hasn't been authorized to process.
2. **Website Code (The Storefront):** 
   The logic converting prices and rendering `{"usd": 48.50}` must run safely on the codebase.

## Prerequisites for Implementation
- [ ] Integration of an Exchange Rate API (e.g., Open Exchange Rates, ExchangeRate-API) or static conversion logic.
- [ ] Setup of Cloudflare Middleware for `request.cf.country` extraction.
- [ ] Refactoring of `PriceTag.astro` to dynamically display the active localized price symbol and value on the frontend. 
- [ ] Enabling USD/Other currencies in Snipcart.
- [ ] Refactoring Razorpay integration to handle non-INR captures (if Razorpay is the active gateway for global).
