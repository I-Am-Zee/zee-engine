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
}

/**
 * Mappers to turn various inputs into a ZeliaProduct.
 * This is the ONLY place where field names are mapped.
 */
export const mapProduct = (input: any): ZeliaProduct => {
  // If it's a raw Astro Content Layer Entry (Astro 5: uses .id, not .slug)
  if (input.data && input.id) {
    return {
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
    };
  }
  // Otherwise, assume it's already a mapped or partial object (fallback)
  return {
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
  };
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
 * Generates an object of data-item-* attributes for Astro HTML buttons.
 */
export const getSnipcartHTMLAttrs = (input: CollectionEntry<"products"> | any) => {
  const product = mapProduct(input);
  
  const attrs: Record<string, any> = {
    // Professional ID Logic: Matches the JS version (SKU or Slug)
    "data-item-id": product.sku || product.id,
    "data-item-name": product.title,
    "data-item-price": product.salePrice !== undefined ? product.salePrice : product.price,
    "data-item-url": `/products/${product.id}`,
    "data-item-image": product.image,
    "data-item-has-taxes-included": "true", // Crucial for Indian GST - User expects Rs. 500 to NOT increase at checkout
  };

  // Snipcart REQUIRES weight to be a whole integer (no decimals)
  // Source: https://docs.snipcart.com/v3/setup/products#product-dimensions
  // "These attributes need to be integers and cannot have decimals."
  if (product.weight) attrs["data-item-weight"] = Math.round(product.weight);
  if (product.sku) attrs["data-item-sku"] = product.sku;
  
  // Also pass slug in metadata for the order sync API
  attrs["data-item-metadata-slug"] = product.id;
  // Add HSN code 7117 (Costume Jewellery) for Indian GST webhook processing
  attrs["data-item-metadata-hsn"] = "7117";

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
export const getSnipcartJSItem = (input: CollectionEntry<"products"> | any, selections?: Record<string, string>) => {
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
    image: product.image,
    // Snipcart v3 JS API uses nested dimensions.weight (confirmed by network inspection of Snipcart's own requests).
    // Flat 'weight' at root level is silently ignored, causing the security crawl mismatch.
    // Math.round required: Snipcart rejects decimal weights (must be integer).
    ...(product.weight && { dimensions: { weight: Math.round(product.weight) } }),
    metadata: {
      shipping_slab: product.shipping_slab || "",
      slug: product.id,
      hsn: "7117", // Indian GST classification for Costume Jewellery
      ...(product.sku && { sku: product.sku })
    },
    hasTaxesIncluded: true,
    customFields,
    quantity: 1
  };
};
