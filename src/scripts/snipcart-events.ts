/**
 * Global Snipcart Event Handler
 * 
 * Implements the "Intent-Based Coupon" pattern:
 * - Popup stores coupon code in sessionStorage
 * - This handler applies it after login/cart has items
 * 
 * Handles edge cases:
 * - Already logged in users (check on ready)
 * - Empty cart (wait for first item)
 * - Toast notifications (no popup fatigue)
 */

export {};

declare global {
  interface Window {
    Snipcart: any;
  }
}

// Helper: Apply the coupon code
async function applyCouponCode(code: string): Promise<boolean> {
  try {
    console.log('[Coupon] Applying:', code);
    await window.Snipcart.api.cart.applyDiscount(code);
    
    // Clear from storage (success)
    sessionStorage.removeItem('pending_coupon');
    
    // TODO: Show toast notification "Discount Applied!"
    console.log('[Coupon] ✅ Applied successfully:', code);
    
    return true;
  } catch (error) {
    console.error('[Coupon] ❌ Failed to apply:', error);
    // Remove from storage to prevent infinite loops on invalid/expired coupons
    sessionStorage.removeItem('pending_coupon');
    return false;
  }
}

let isApplyingCoupon = false;

// Helper: Check if we can apply the coupon now
async function tryApplyPendingCoupon() {
  if (isApplyingCoupon) return;
  
  const pendingCode = sessionStorage.getItem('pending_coupon');
  if (!pendingCode) return;

  // Check if user is logged in
  const state = window.Snipcart.store.getState();
  const customer = state.customer;
  
  if (!customer || customer.status !== 'SignedIn') {
    // Only log once to avoid spamming the console on every state change
    if (!window.sessionStorage.getItem('snipcart_hydration_logged')) {
      console.log('[Coupon] User not logged in (or session still hydrating)...');
      window.sessionStorage.setItem('snipcart_hydration_logged', 'true');
    }
    return;
  }

  // Check if cart has items
  const cart = state.cart;
  const itemCount = cart?.items?.count || 0;

  if (itemCount > 0) {
    console.log('[Coupon] Conditions met (Logged in + Items in cart). Applying now...');
    isApplyingCoupon = true;
    await applyCouponCode(pendingCode);
    isApplyingCoupon = false;
  }
}

// Initialize when Snipcart is ready
function initSnipcartHandlers() {
  console.log('[Coupon] Snipcart ready/detected, initializing event handlers...');
  
  // Clear the hydration log flag on fresh load
  window.sessionStorage.removeItem('snipcart_hydration_logged');

  // Check immediately in case session is already hydrated
  tryApplyPendingCoupon();

  // Subscribe to state changes to catch session restorations and cart updates dynamically
  // This handles the "page refresh" hydration correctly and watches for new items
  window.Snipcart.store.subscribe(() => {
    const pendingCode = sessionStorage.getItem('pending_coupon');
    if (pendingCode) {
      tryApplyPendingCoupon();
    }
  });
}

// Handle both 'ready' event and late script loading
if (typeof window.Snipcart !== 'undefined' && window.Snipcart.events) {
  initSnipcartHandlers();
} else {
  document.addEventListener('snipcart.ready', () => {
    initSnipcartHandlers();
  });
}
