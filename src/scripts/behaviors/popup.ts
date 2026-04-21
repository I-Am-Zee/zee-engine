export interface PopupConfig {
  id: string;
  trigger: 'timed' | 'exit';
  delay_seconds?: number;
  denylist?: string[];
  couponCode?: string;
}

export const popupBehavior = (config: PopupConfig) => ({
  open: false,
  STORAGE_KEY: `zeliavance_popup_${config.id}_seen`,
  EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 hours

  init() {
    // 1. Check if current path is on the denylist
    if (this.isOnDeniedPath()) return;

    // 2. Check frequency lockout
    if (this.hasSeenPopup()) return;

    // 3. Trigger Selection
    if (config.trigger === 'timed') {
      const delay = (config.delay_seconds || 8) * 1000;
      setTimeout(() => {
        if (!this.hasSeenPopup() && !this.open && !this.isOnDeniedPath()) {
          this.open = true;
        }
      }, delay);
    } 
    
    if (config.trigger === 'exit') {
      // 4a. Desktop: Mouse-out top
      const exitHandler = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          if (!this.hasSeenPopup() && !this.open && !this.isOnDeniedPath()) {
            this.open = true;
            document.removeEventListener('mouseleave', exitHandler);
          }
        }
      };
      document.addEventListener('mouseleave', exitHandler);

      // 4b. Mobile/Universal: Visibility Change (User leaves tab)
      const visibilityHandler = () => {
        if (document.visibilityState === 'hidden') {
          if (!this.hasSeenPopup() && !this.open && !this.isOnDeniedPath()) {
            this.open = true;
            document.removeEventListener('visibilitychange', visibilityHandler);
          }
        }
      };
      document.addEventListener('visibilitychange', visibilityHandler);

      // 4c. Mobile/Touch Behavioral: The "Flick Up" (Reaching for URL Bar)
      let lastScrollY = window.scrollY;
      let lastTime = Date.now();
      
      const scrollHandler = () => {
        const currentScrollY = window.scrollY;
        const currentTime = Date.now();
        const timeDiff = currentTime - lastTime;
        
        if (timeDiff > 0) {
          const velocity = (currentScrollY - lastScrollY) / timeDiff;
          
          // Trigger if: User is NOT at the top AND flicked UP fast (high negative velocity)
          // Threshold of -1.5 pixels/ms is a standard "aggressive" scroll up
          if (currentScrollY > 300 && velocity < -1.5) {
            if (!this.hasSeenPopup() && !this.open && !this.isOnDeniedPath()) {
              this.open = true;
              window.removeEventListener('scroll', scrollHandler);
            }
          }
        }
        
        lastScrollY = currentScrollY;
        lastTime = currentTime;
      };
      
      // Throttle? Or just let it run. Browsers handle scroll well now.
      window.addEventListener('scroll', scrollHandler, { passive: true });
    }
  },

  isOnDeniedPath() {
    const currentPath = window.location.pathname;
    const denylist = config.denylist || [];
    return denylist.some(path => {
      if (currentPath === path) return true;
      if (path.endsWith('/*')) {
        const base = path.slice(0, -2);
        return currentPath.startsWith(base);
      }
      return false;
    });
  },

  hasSeenPopup() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return false;
    const now = new Date().getTime();
    if (now > parseInt(stored)) {
      localStorage.removeItem(this.STORAGE_KEY);
      return false;
    }
    return true;
  },

  closePopup() {
    this.open = false;
    const expiry = new Date().getTime() + this.EXPIRY_TIME;
    localStorage.setItem(this.STORAGE_KEY, expiry.toString());
  },

  applyCoupon() {
    if (!config.couponCode) return;
    console.log('[Popup] Storing coupon intent:', config.couponCode);
    sessionStorage.setItem('pending_coupon', config.couponCode);
    this.closePopup();
    setTimeout(() => {
      window.location.hash = '/cart/signin';
    }, 200);
  }
});
