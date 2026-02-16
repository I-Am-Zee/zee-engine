/**
 * Site Configuration
 * 
 * Centralized configuration for site-wide settings.
 * Update these values to rebrand or reconfigure the site.
 * 
 * Usage in Astro components:
 *   import { siteConfig } from '../lib/site.config';
 *   <h1>{siteConfig.name}</h1>
 *   <a href={`mailto:${siteConfig.email.support}`}>Contact</a>
 */

export const siteConfig = {
  // Brand Identity
  name: "Zaviona",
  tagline: "Luxury Jewelry & Timeless Elegance",
  description: "Zaviona is a luxury jewelry brand dedicated to ethically sourced diamonds and timeless craftsmanship.",
  
  // Production URL (required for Snipcart product validation)
  // DO NOT CHANGE unless you change your Netlify site name
  url: import.meta.env.PUBLIC_SITE_URL || "https://zaviona-dev.netlify.app",
  
  // Email Addresses
  // Add more as needed: orders, legal, press, etc.
  email: {
    support: "concierge@zaviona.com",
    orders: "orders@zaviona.com",
    legal: "legal@zaviona.com",
    // info: "info@zaviona.com",
    // press: "press@zaviona.com",
  },
  
  // Phone Numbers
  // Add more as needed: sales, support, international, etc.
  phone: {
    main: "+1 (800) ZAVIONA",
    support: "+1 (800) ZAVIONA",
    // sales: "+1 (800) 123-4567",
    // international: "+91 12345 67890",
  },
  
  // Social Media Links
  // Add more as needed
  social: {
    instagram: "https://instagram.com/zaviona",
    pinterest: "https://pinterest.com/zaviona",
    // facebook: "https://facebook.com/zaviona",
    // twitter: "https://twitter.com/zaviona",
    // youtube: "https://youtube.com/@zaviona",
    // linkedin: "https://linkedin.com/company/zaviona",
  },
  
  // Address (for contact page, footer, etc.)
  address: {
    street: "123 Luxury Lane",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "USA",
  },
  
  // Business Hours
  hours: {
    weekdays: "10:00 AM - 7:00 PM EST",
    weekends: "11:00 AM - 5:00 PM EST",
  },
  
  // Legal
  copyright: `© ${new Date().getFullYear()} Zaviona. All rights reserved.`,
  
  // Assets
  // Place your logo/favicon files in /public folder
  // Recommended sizes:
  //   favicon.ico: 32x32 or 48x48 (ICO format or PNG)
  //   logo.svg: Vector, any size (will scale)
  //   logo-dark.svg: For dark backgrounds
  //   og-image.png: 1200x630 (for social sharing)
  assets: {
    favicon: "/favicon.svg",
    logo: "/images/logo.svg",
    // logoDark: "/images/logo-dark.svg",
    // ogImage: "/images/og-image.png",
  },
} as const;

// Type exports for TypeScript support
export type SiteConfig = typeof siteConfig;
export type EmailConfig = typeof siteConfig.email;
export type PhoneConfig = typeof siteConfig.phone;
export type SocialConfig = typeof siteConfig.social;
