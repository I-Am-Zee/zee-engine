import type { Alpine } from 'alpinejs';
import { formatCurrency } from '../utils/currency';

export const regionStore = {
  active: 'india', // fallback

  init() {
    this.checkAndDetect();
  },

  checkAndDetect() {
    const savedRegion = localStorage.getItem('zeliavance_region');
    const savedExpiry = localStorage.getItem('zeliavance_region_expiry');
    const now = new Date().getTime();

    if (savedRegion && savedExpiry && now < Number(savedExpiry)) {
      this.active = savedRegion;
      return;
    }

    // Auto-detect using TimeZone (most reliable client-side)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const lang = navigator.language || 'en-US';
    
    // Check if timezone is Indian or language is en-IN
    if (
      timezone.toLowerCase().includes('kolkata') || 
      timezone.toLowerCase().includes('calcutta') || 
      lang.toLowerCase().includes('-in')
    ) {
      this.active = 'india';
    } else {
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
