export const popupBehavior = (id: string, denylist: string[] = [], couponCode: string = '') => ({
  open: false,
  STORAGE_KEY: `zeliavance_popup_${id}_seen`,
  EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 hours

  init() {
    // 1. Check if current path is on the denylist
    if (this.isOnDeniedPath()) return;

    // 2. Check frequency lockout
    if (this.hasSeenPopup()) return;

    // 3. Mobile Timer (8s)
    setTimeout(() => {
      if (!this.hasSeenPopup() && !this.open && !this.isOnDeniedPath()) {
        this.open = true;
      }
    }, 8000);

    // 4. Desktop Exit Intent
    const exitHandler = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        if (!this.hasSeenPopup() && !this.open && !this.isOnDeniedPath()) {
          this.open = true;
          document.removeEventListener('mouseleave', exitHandler);
        }
      }
    };
    document.addEventListener('mouseleave', exitHandler);
  },

  isOnDeniedPath() {
    const currentPath = window.location.pathname;
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
    if (!couponCode) return;
    console.log('[Popup] Storing coupon intent:', couponCode);
    sessionStorage.setItem('pending_coupon', couponCode);
    this.closePopup();
    setTimeout(() => {
      window.location.hash = '/cart/signin';
    }, 200);
  }
});
