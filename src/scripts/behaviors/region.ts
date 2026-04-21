import type { Alpine } from 'alpinejs';

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

    // Auto-detect using simple heuristics
    const lang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en-US';
    
    if (lang.toLowerCase().includes('in') || lang.toLowerCase().includes('hi')) {
      this.active = 'india';
    } else {
      this.active = 'global';
    }

    this.save(this.active);
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
  
  // Helper to safely extract the correct link for any product array
  getActiveLink(links: any[]) {
    if (!links || !links.length) return null;
    const match = links.find(l => l.region === this.active);
    return match || links[0]; // fallback to first if region doesn't exist
  }
};
