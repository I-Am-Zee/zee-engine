/**
 * Navigation Configuration
 * Single source of truth for site navigation structure
 */

export interface NavItem {
  label: string;
  href: string;
  items?: NavItem[];
}

export const navigation: NavItem[] = [
  {
    label: "Shop",
    href: "/shop",
    items: [
      { label: "All Jewelry", href: "/shop" },
      { label: "Rings", href: "/shop/rings" },
      { label: "Necklaces", href: "/shop/necklaces" },
      { label: "Earrings", href: "/shop/earrings" },
      { label: "Bracelets", href: "/shop/bracelets" },
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
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];
