import taxonomyJson from "../content/zelia-vance/settings/taxonomy.json";
import { slugify } from "../scripts/utils/slugify";

/**
 * Navigation Configuration
 * Single source of truth for site navigation structure
 */

export interface NavItem {
  label: string;
  href: string;
  items?: NavItem[];
}

const shopCategoryItems: NavItem[] = taxonomyJson.categories.map((cat: string) => ({
  label: cat.charAt(0).toUpperCase() + cat.slice(1),
  href: `/shop/${slugify(cat)}`,
}));

export const navigation: NavItem[] = [
  {
    label: "Shop",
    href: "/shop",
    items: [
      { label: "All Jewelry", href: "/shop" },
      ...shopCategoryItems
    ],
  },
  {
    label: "Collections",
    href: "/collections",
  },
  {
    label: "Lookbooks",
    href: "/lookbooks",
  },
  {
    label: "Journal",
    href: "/blog",
  },
];

// Support links for footer
export const supportLinks: NavItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];
