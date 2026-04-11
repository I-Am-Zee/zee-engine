/**
 * Navigation Configuration (Legacy / Static Parts)
 * 
 * DEPRECATED: Use the dynamic navigation builder in Navbar.astro 
 * to ensure brand-aware multi-tenant safety.
 */

export interface NavItem {
  label: string;
  href: string;
  items?: NavItem[];
}

export const staticNavigation: NavItem[] = [
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
