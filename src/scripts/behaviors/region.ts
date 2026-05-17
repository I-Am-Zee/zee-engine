import { formatCurrency } from '../utils/currency';

export const regionStore = {
  active: 'india', // temporary, gets overwritten in init
  config: [] as any[],

  init() {
    this.loadConfig();
    this.active = document.documentElement.dataset.activeRegion || (this.config[0]?.id || 'india');
    this.checkAndDetect();
  },

  loadConfig() {
    try {
      const db = document.body.dataset.regions;
      if (db) this.config = JSON.parse(db);
    } catch {
      this.config = [];
    }
  },

  async checkAndDetect() {
    const brandId = document.body.dataset.brandId;
    if (!brandId) {
      console.warn('[RegionBehavior] brandId missing from body dataset.');
      return;
    }
    const savedRegion = localStorage.getItem(`${brandId}_region`);
    const savedExpiry = localStorage.getItem(`${brandId}_region_expiry`);
    const now = new Date().getTime();

    if (savedRegion && savedExpiry && now < Number(savedExpiry)) {
      this.active = savedRegion;
      return;
    }

    try {
      const response = await fetch('/api/geo');
      if (response.ok) {
        const data = await response.json() as any;
        const detectedId = data.region?.toLowerCase();
        
        // Match the user to our list -> If no match -> Catch-all to Global
        const exists = this.config.some((c: any) => c.id === detectedId);
        const fallbackId = document.body.dataset.regionFallback || 'global';
        const finalRegionId = exists ? detectedId : fallbackId;

        if (this.active !== finalRegionId) {
          this.active = finalRegionId;
          document.documentElement.dataset.activeRegion = this.active;
        }
      }
    } catch (e) {
      console.warn('Geo detection failed:', e);
    }

    this.save(this.active);
  },

  get configObj() {
    return this.config.find((c: any) => c.id === this.active) || this.config[0] || {};
  },

  get locale() {
    return this.configObj.locale || 'en-US';
  },

  get currency() {
    return this.configObj.currency || 'USD';
  },

  set(region: string) {
    this.active = region;
    document.documentElement.dataset.activeRegion = this.active;
    this.save(region);
  },

  save(region: string) {
    const brandId = document.body.dataset.brandId;
    if (!brandId) return;
    
    // 24 hour expiry (1000 * 60 * 60 * 24 = 86400000)
    const expiryDate = new Date().getTime() + 86400000;
    localStorage.setItem(`${brandId}_region`, region);
    localStorage.setItem(`${brandId}_region_expiry`, expiryDate.toString());
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
