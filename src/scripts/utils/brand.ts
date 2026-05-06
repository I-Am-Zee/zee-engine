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
    throw new Error("[Brand Utility] 'settings/brand' not found. Multi-tenant engine requires brand configuration.");
  }

  return brandEntry.data;
}
