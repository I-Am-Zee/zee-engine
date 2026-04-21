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
    window.addEventListener('engine:quick-view', (e: any) => {
      this.open(e.detail.productSlug);
    });
  },

  async open(slug: string) {
    this.isOpen = true;
    this.isLoading = true;
    this.product = null;

    try {
      // Fetch product data from our API or directly if available in context
      // For now, we simulate a fetch from the products api
      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) throw new Error('Product not found');
      
      const data = await response.json();
      this.product = {
        ...data,
        // Heuristic: identify platform from URL if not explicitly provided
        platform: this.detectPlatform(data.affiliate_url)
      };
    } catch (err) {
      console.error('[QuickView] Failed to load product:', err);
      this.close();
    } finally {
      this.isLoading = false;
    }
  },

  close() {
    this.isOpen = false;
  },

  formatCurrency(value: number) {
    return formatCurrency(value);
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
