/**
 * Inventory & Variant Utilities
 * 
 * Provides single source of truth for variant serialization logic
 * used across both server-side (webhooks/reconciliation) and client-side (Alpine.js).
 */

export interface VariantOption {
  name: string;
  value: string;
}

/**
 * Standardizes variant options to generate a stable, sorted, lowercase, and trimmed key.
 * This ensures that comparisons between Snipcart data and DOM data are reliable.
 * 
 * Example: [{name: "Size", value: " 6 "}] -> "size:6"
 */
export function generateVariantKey(options: VariantOption[]): string {
  return options
    .map(o => ({
      name: (o.name || "").trim().toLowerCase(),
      value: (o.value || "").trim().toLowerCase()
    }))
    .filter(o => o.name && o.value)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(o => `${o.name}:${o.value}`)
    .join('|');
}
