/**
 * Badge Registry - Centralized Badge Configuration
 * 
 * Defines all available product badges with:
 * - Hierarchical display order (lower = higher priority)
 * - Intent mapping for visual consistency
 * - Type-safe badge identifiers
 * 
 * @module scripts/utils/badges
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type BadgeIntent = "coral" | "brass" | "surface" | "outline";

export interface BadgeConfig {
  id: string;
  label: string;
  intent: BadgeIntent;
  order: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// BADGE REGISTRY - 4-TIER HIERARCHY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tier 1: URGENCY (Coral) - Conversion Drivers
 * High-energy badges that trigger FOMO or price consciousness
 */
const URGENCY_BADGES: BadgeConfig[] = [
  { id: "sale", label: "Sale", intent: "coral", order: 10 },
  { id: "last-chance", label: "Last Chance", intent: "coral", order: 20 },
  { id: "flash-deal", label: "Flash Deal", intent: "coral", order: 30 },
];

/**
 * Tier 2: PRESTIGE (Brass) - Status & Freshness
 * Premium positioning badges for luxury, novelty, social proof
 */
const PRESTIGE_BADGES: BadgeConfig[] = [
  { id: "new", label: "New", intent: "brass", order: 40 },
  { id: "new-drop", label: "New Drop", intent: "brass", order: 41 },
  { id: "bestseller", label: "Bestseller", intent: "brass", order: 50 },
  { id: "limited-edition", label: "Limited Edition", intent: "brass", order: 60 },
  { id: "restocked", label: "Restocked", intent: "brass", order: 70 },
  { id: "staff-pick", label: "Staff Pick", intent: "brass", order: 80 },
  { id: "exclusive", label: "Exclusive", intent: "brass", order: 90 },
  { id: "luxury", label: "Luxury", intent: "brass", order: 95 }, // Added from product files
];

/**
 * Tier 3: ATTRIBUTES (Surface) - Product Information
 * Educates users about specific product properties (USPs, features)
 */
const ATTRIBUTE_BADGES: BadgeConfig[] = [
  { id: "essential", label: "Essential", intent: "surface", order: 100 }, // Added from product files
  { id: "classic", label: "Classic", intent: "surface", order: 105 }, // Added from product files
  { id: "waterproof", label: "Waterproof", intent: "surface", order: 110 },
  { id: "pvd-gold", label: "PVD Gold", intent: "surface", order: 115 },
  { id: "gift-set", label: "Gift Set", intent: "surface", order: 120 },
  { id: "gift-idea", label: "Gift Idea", intent: "surface", order: 121 }, // Added from product files
  { id: "pre-order", label: "Pre-Order", intent: "surface", order: 130 },
  { id: "engravable", label: "Engravable", intent: "surface", order: 140 },
];

/**
 * Tier 4: STATE (Outline) - Availability Status
 * Low-hierarchy badges for logistics/availability
 */
const STATE_BADGES: BadgeConfig[] = [
  { id: "coming-soon", label: "Coming Soon", intent: "outline", order: 200 },
  { id: "sold-out", label: "Sold Out", intent: "outline", order: 210 },
];

/**
 * Complete badge registry (combined tiers)
 */
export const BADGE_REGISTRY: readonly BadgeConfig[] = [
  ...URGENCY_BADGES,
  ...PRESTIGE_BADGES,
  ...ATTRIBUTE_BADGES,
  ...STATE_BADGES,
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lookup map for fast badge config retrieval
 */
const BADGE_MAP = new Map<string, BadgeConfig>(
  BADGE_REGISTRY.map((badge) => [badge.id.toLowerCase(), badge])
);

/**
 * Sort badges by hierarchical order (Urgency → Prestige → Attributes → State)
 * 
 * @param badges - Array of badge IDs or labels from CMS
 * @returns Sorted array maintaining display hierarchy
 * 
 * @example
 * sortBadgesByHierarchy(['waterproof', 'sale', 'new'])
 * // => ['sale', 'new', 'waterproof'] (Urgency first, then Prestige, then Attributes)
 */
export function sortBadgesByHierarchy(badges: string[]): string[] {
  return badges
    .map((badge) => {
      const normalized = badge.toLowerCase().trim();
      const config = BADGE_MAP.get(normalized);
      return { original: badge, order: config?.order ?? 999 };
    })
    .sort((a, b) => a.order - b.order)
    .map((item) => item.original);
}

/**
 * Get badge intent for visual styling
 * 
 * @param badgeId - Badge ID or label
 * @returns Intent for Badge component (coral, brass, surface, outline)
 * 
 * @example
 * getBadgeIntent('sale') // => 'coral'
 * getBadgeIntent('Bestseller') // => 'brass'
 * getBadgeIntent('waterproof') // => 'surface'
 */
export function getBadgeIntent(badgeId: string): BadgeIntent {
  const normalized = badgeId.toLowerCase().trim();
  const config = BADGE_MAP.get(normalized);
  return config?.intent ?? "surface"; // Default to surface for unknown badges
}

/**
 * Get display label for a badge
 * 
 * @param badgeId - Badge ID
 * @returns Proper display label ("Sale", "New Drop", etc.)
 */
export function getBadgeLabel(badgeId: string): string {
  const normalized = badgeId.toLowerCase().trim();
  const config = BADGE_MAP.get(normalized);
  return config?.label ?? badgeId; // Fallback to original if not found
}

/**
 * Check if a badge ID is valid
 */
export function isValidBadge(badgeId: string): boolean {
  return BADGE_MAP.has(badgeId.toLowerCase().trim());
}

/**
 * Get all badge IDs (for PagesCMS configuration)
 */
export function getAllBadgeIds(): string[] {
  return BADGE_REGISTRY.map((b) => b.id);
}
