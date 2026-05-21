/**
 * Ecommerce Configuration SSOT (Single Source of Truth)
 * 
 * This file centralizes all logic for mapping our internal product schema
 * to Snipcart's requirements (HTML and JS API).
 */

export interface VariantSlot {
  name: string;
  values: string; // Comma-separated
  price_modifiers?: string;
  is_checkbox?: boolean;
}

import type { CollectionEntry } from "astro:content";

/**
 * Single Source of Truth for Product Data.
 * This interface represents the internal standardized format.
 */
export interface ZeliaProduct {
  id: string;        // The technical slug (used for URLs)
  sku?: string;      // The business ID (used for Invoices)
  title: string;
  price: number;
  salePrice?: number;
  image: string;
  weight?: number;
  shipping_slab?: string;
  variant_1?: any;
  variant_2?: any;
  variant_3?: any;
  hsn_override?: string;
  // Affiliate Fields (Multi-Region)
  affiliate_links?: Array<{
    region: string;
    url: string;
    platform?: string;
    partnerProductId?: string;
    price: number;
    salePrice?: number;
    currency: string;
  }>;
  // Flattened active affiliate data (for UI convenience)
  affiliate_url?: string;
  affiliate_platform?: string;
}

/**
 * Mappers to turn various inputs into a ZeliaProduct.
 * This is the ONLY place where field names are mapped.
 */
export const mapProduct = (input: any): ZeliaProduct => {
  let obj: ZeliaProduct;

  // If it's a raw Astro Content Layer Entry (Astro 5: uses .id, not .slug)
  if (input.data && input.id) {
    obj = {
      id: input.id,
      sku: input.data.sku,
      title: input.data.title,
      price: input.data.price,
      salePrice: input.data.salePrice,
      image: input.data.image,
      weight: input.data.weight,
      shipping_slab: input.data.shipping_slab,
      variant_1: input.data.variant_1,
      variant_2: input.data.variant_2,
      variant_3: input.data.variant_3,
      hsn_override: input.data.hsn_override,
      affiliate_links: input.data.affiliate_links || [],
    };
  } else {
    // Otherwise, assume it's already a mapped or partial object (fallback)
    obj = {
      id: input.id || "",
      sku: input.sku || input.id,
      title: input.title || "",
      price: Number(input.price) || 0,
      salePrice: input.salePrice ? Number(input.salePrice) : undefined,
      image: input.image || "",
      weight: input.weight,
      shipping_slab: input.shipping_slab,
      variant_1: input.variant_1,
      variant_2: input.variant_2,
      variant_3: input.variant_3,
      hsn_override: input.hsn_override,
      affiliate_links: input.affiliate_links || [],
    };
  }

  // Affiliate Mode: Primary Source of Truth Override
  // This ensures the first link in the array (e.g. India) is used for the base displayPrice
  // regardless of what is typed in the top-level frontmatter.
  if (import.meta.env.PUBLIC_AFFILIATE === "true" && obj.affiliate_links && obj.affiliate_links.length > 0) {
    const primary = obj.affiliate_links[0];
    obj.price = primary.price;
    obj.salePrice = primary.salePrice;
    obj.affiliate_url = primary.url;
    obj.affiliate_platform = primary.platform;
  }

  // Final Safety Fallback: Ensure price is never NaN/Undefined
  if (typeof obj.price !== 'number') obj.price = 0;

  return obj;
};

/**
 * Standardizes variant options for Snipcart's dropdown/checkbox format.
 */
const formatVariantOptions = (slot: any) => {
  if (!slot?.values) return "";
  const values = slot.values.split(",").map((v: string) => v.trim());
  const modifiers = slot.price_modifiers ? slot.price_modifiers.split(",").map((v: string) => v.trim()) : [];

  return values
    .map((val: string, i: number) => {
      const mod = modifiers[i] ? `[${modifiers[i]}]` : "";
      return `${val}${mod}`;
    })
    .join("|");
};

/**
 * Helper function to resolve absolute Snipcart thumbnail URL for production.
 * Handles fallback for local dev when PUBLIC_IMAGE_GATEWAY_URL is missing.
 */
export const getSnipcartThumbUrl = (rawImage: string) => {
  if (!rawImage) return "";
  if (rawImage.startsWith("http")) return rawImage;
  
  const gateway = import.meta.env.PUBLIC_IMAGE_GATEWAY_URL || "";
  const brandId = import.meta.env.PUBLIC_BRAND_ID || "zelia-vance";

  if (!gateway) return rawImage; // Fallback for pure local dev
  
  // Transform /images/products/ring.webp -> gateway/brandId/products/ring.webp?w=200
  return `${gateway}/${brandId}${rawImage.replace('/images/', '/')}?w=200`;
};

/**
 * Generates an object of data-item-* attributes for Astro HTML buttons.
 */
export const getSnipcartHTMLAttrs = (input: CollectionEntry<"products"> | any, hsnCode: string = "0000") => {
  const product = mapProduct(input);
  
  const attrs: Record<string, any> = {
    // Professional ID Logic: Matches the JS version (SKU or Slug)
    "data-item-id": product.sku || product.id,
    "data-item-name": product.title,
    "data-item-price": product.salePrice !== undefined ? product.salePrice : product.price,
    "data-item-url": `/products/${product.id}`,
    "data-item-image": getSnipcartThumbUrl(product.image),
    "data-item-has-taxes-included": "true", // Crucial for Indian GST - User expects Rs. 500 to NOT increase at checkout
  };

  // Snipcart REQUIRES weight to be a whole integer (no decimals)
  // Source: https://docs.snipcart.com/v3/setup/products#product-dimensions
  // "These attributes need to be integers and cannot have decimals."
  if (product.weight) attrs["data-item-weight"] = Math.round(product.weight);
  if (product.sku) attrs["data-item-sku"] = product.sku;
  
  // Also pass slug in metadata for the order sync API
  attrs["data-item-metadata-slug"] = product.id;
  // Add HSN code for Indian GST webhook processing
  attrs["data-item-metadata-hsn"] = product.hsn_override || hsnCode;

  // Process Variants
  [product.variant_1, product.variant_2, product.variant_3].forEach((slot, index) => {
    if (slot?.name && slot?.values) {
      const i = index + 1;
      attrs[`data-item-custom${i}-name`] = slot.name;
      attrs[`data-item-custom${i}-options`] = formatVariantOptions(slot);
      attrs[`data-item-custom${i}-type`] = slot.is_checkbox ? "checkbox" : "dropdown";
      attrs[`data-item-custom${i}-required`] = slot.is_checkbox ? "false" : "true";
    }
  });

  return attrs;
};

/**
 * Generates a clean JSON object for Snipcart's JavaScript API (cart.items.add).
 */
export const getSnipcartJSItem = (input: CollectionEntry<"products"> | any, selections?: Record<string, string>, hsnCode: string = "0000") => {
  const product = mapProduct(input);
  const customFields: any[] = [];

  [product.variant_1, product.variant_2, product.variant_3].forEach((slot) => {
    if (slot?.name && slot?.values) {
      customFields.push({
        name: slot.name,
        options: formatVariantOptions(slot),
        type: slot.is_checkbox ? "checkbox" : "dropdown",
        required: slot.is_checkbox ? false : true,
        // If selections are provided (e.g. from SideDrawer), pre-set the value
        ...(selections?.[slot.name] && { value: selections[slot.name] })
      });
    }
  });

  return {
    // Professional ID Logic: Matches the HTML version (SKU or Slug)
    id: product.sku || product.id,
    name: product.title,
    // Use salePrice if it's explicitly set (even if lower), otherwise fall back to price
    price: product.salePrice !== undefined ? Number(product.salePrice) : Number(product.price),
    url: `/products/${product.id}`,
    image: getSnipcartThumbUrl(product.image),
    // Snipcart v3 JS API uses nested dimensions.weight (confirmed by network inspection of Snipcart's own requests).
    // Flat 'weight' at root level is silently ignored, causing the security crawl mismatch.
    // Math.round required: Snipcart rejects decimal weights (must be integer).
    ...(product.weight && { dimensions: { weight: Math.round(product.weight) } }),
    metadata: {
      shipping_slab: product.shipping_slab || "",
      slug: product.id,
      hsn: product.hsn_override || hsnCode,
      ...(product.sku && { sku: product.sku })
    },
    hasTaxesIncluded: true,
    customFields,
    quantity: 1
  };
};
