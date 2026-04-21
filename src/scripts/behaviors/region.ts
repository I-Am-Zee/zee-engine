import type { Alpine } from 'alpinejs';
import { formatCurrency } from '../utils/currency';

export const regionStore = {
  active: 'india', // fallback

  init() {
    this.checkAndDetect();
  },

  async checkAndDetect() {
    const savedRegion = localStorage.getItem('zeliavance_region');
    const savedExpiry = localStorage.getItem('zeliavance_region_expiry');
    const now = new Date().getTime();

    if (savedRegion && savedExpiry && now < Number(savedExpiry)) {
      this.active = savedRegion;
      return;
    }

    try {
      // Fetch authoritative geo data from Cloudflare edge
      const response = await fetch('/api/geo');
      if (response.ok) {
        const data = await response.json();
        this.active = data.region || 'global';
      } else {
        this.active = 'global';
      }
    } catch (e) {
      console.warn('Geo detection failed:', e);
      this.active = 'global';
    }

    this.save(this.active);
  },

  get locale() {
    return this.active === 'india' ? 'en-IN' : 'en-US';
  },

  get currency() {
    return this.active === 'india' ? 'INR' : 'USD';
  },

  set(region: string) {
    this.active = region;
    this.save(this.active);
  },

  save(region: string) {
    // 24 hour expiry (1000 * 60 * 60 * 24 = 86400000)
    const expiryDate = new Date().getTime() + 86400000;
    localStorage.setItem('zeliavance_region', region);
    localStorage.setItem('zeliavance_region_expiry', expiryDate.toString());
  },

  format(price: number) {
    return formatCurrency(price, this.currency, this.locale);
  },
  
  // Helper to safely extract the correct link for any product array
  getActiveLink(links: any[]) {
    if (!links || !links.length) return null;
    const match = links.find(l => l.region === this.active);
    return match || links[0]; // fallback to first if region doesn't exist
  }
};
