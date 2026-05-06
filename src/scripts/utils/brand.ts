import { getEntry } from "astro:content";

/**
 * Brand Metadata Utility
 * 
 * Fetches the active brand's identity settings.
 * Uses PUBLIC_BRAND_ID as the silo key.
 */

export async function getBrandSettings() {
  const brandEntry = await getEntry("settings" as any, "brand");
  
  if (!brandEntry) {
    return {
      name: "Luxury Engine",
      tagline: "Premium White-Label E-Commerce",
      description: "A high-performance Astro multi-tenant platform."
    };
  }

  return brandEntry.data;
}
