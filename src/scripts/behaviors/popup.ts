/**
 * Popup Modal Behavior (Intent-Based Pattern)
 * 
 * This popup stores the coupon intent in sessionStorage.
 * The actual application happens in snipcart-events.ts.
 */

export const popupBehavior = (couponCode: string) => ({
  open: false,
  
  // Frequency control
  EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 hours

  init() {
    // Check frequency lockout
    if (this.hasSeenPopup()) return;

    // 1. Mobile Timer (8s)
    setTimeout(() => {
      // GEMINI PRO 3 FIX: Re-check frequency (prevents ghost popup)
      if (!this.hasSeenPopup() && !this.open) {
        this.open = true;
      }
    }, 8000);

    // 2. Desktop Exit Intent
    const exitHandler = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        if (!this.hasSeenPopup() && !this.open) {
          this.open = true;
          document.removeEventListener('mouseleave', exitHandler);
        }
      }
    };
    document.addEventListener('mouseleave', exitHandler);
  },

  hasSeenPopup() {
    const stored = localStorage.getItem('zaviona_popup_seen');
    if (!stored) return false;
    
    const now = new Date().getTime();
    if (now > parseInt(stored)) {
      localStorage.removeItem('zaviona_popup_seen');
      return false;
    }
    return true;
  },

  closePopup() {
    this.open = false;
    const expiry = new Date().getTime() + this.EXPIRY_TIME;
    localStorage.setItem('zaviona_popup_seen', expiry.toString());
  },

  /**
   * SIMPLIFIED LOGIC: Intent-Based Pattern
   * 
   * We no longer check login status or cart state here.
   * We simply store the intent and redirect to sign-in.
   * The global handler (snipcart-events.ts) does the actual work.
   */
  applyCoupon() {
    console.log('[Popup] Storing coupon intent:', couponCode);
    
    // Store the intent
    sessionStorage.setItem('pending_coupon', couponCode);
    
    // Close popup immediately (clean handoff)
    this.closePopup();
    
    // Redirect to sign-in after 200ms (smooth transition)
    setTimeout(() => {
      window.location.hash = '/cart/signin';
    }, 200);
  }
});
