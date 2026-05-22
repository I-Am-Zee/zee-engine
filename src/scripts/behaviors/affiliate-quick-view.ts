/**
 * Affiliate Quick View Behavior
 * 
 * Logic for the AffiliateQuickView panel.
 * Handles product data fetching and UI state.
 */

import { formatCurrency } from '../utils/currency';

export const affiliateQuickView = () => ({
  isOpen: false,
  isLoading: false,
  product: null,

  init() {
    window.addEventListener('engine:affiliate-quick-view', (e: any) => {
      this.open(e.detail);
    });
  },

  async open(productData: any) {
    // If the user clicked the exact same product card, just open the drawer.
    // Do NOT overwrite the data, do NOT force Alpine to re-render the image.
    if (this.product && (this.product.id === productData.id)) {
      this.isOpen = true;
      return;
    }

    this.isOpen = true;
    this.isLoading = false;
    
    // Automatically use the first regional link found (fallback to Partner)
    const activeLink = productData.affiliate_links?.[0] || {};
    
    this.product = {
      ...productData,
      affiliate_url: activeLink.url || '',
      platform: activeLink.platform || 'Partner',
    };
  },

  close() {
    this.isOpen = false;
  },

  formatCurrency(value: number, currency?: string, locale?: string) {
    return formatCurrency(value, currency, locale);
  },

  detectPlatform(url: string) {
    if (!url) return 'Partner';
    const lower = url.toLowerCase();
    if (lower.includes('myntra')) return 'Myntra';
    if (lower.includes('nykaa')) return 'Nykaa';
    if (lower.includes('amazon')) return 'Amazon';
    if (lower.includes('ajio')) return 'Ajio';
    return 'Partner';
  }
});
