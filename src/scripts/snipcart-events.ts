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
    // You can integrate with your existing CartAlert component here
    console.log('[Coupon] ✅ Applied successfully:', code);
    
    return true;
  } catch (error) {
    console.error('[Coupon] ❌ Failed to apply:', error);
    // Keep in storage for retry
    return false;
  }
}

// Helper: Check if we can apply the coupon now
async function tryApplyPendingCoupon() {
  const pendingCode = sessionStorage.getItem('pending_coupon');
  if (!pendingCode) return;

  console.log('[Coupon] Found pending coupon:', pendingCode);

  // Check if user is logged in
  const state = window.Snipcart.store.getState();
  const customer = state.customer;
  
  if (!customer || !customer.email) {
    console.log('[Coupon] User not logged in yet, waiting...');
    return;
  }

  console.log('[Coupon] User is logged in:', customer.email);

  // Check if cart has items
  const cart = state.cart;
  const itemCount = cart?.items?.count || 0;

  if (itemCount > 0) {
    console.log('[Coupon] Cart has items, applying now...');
    await applyCouponCode(pendingCode);
  } else {
    console.log('[Coupon] Cart is empty, will apply when item is added...');
    // Listener is set up below to handle item.added
  }
}

// Initialize when Snipcart is ready
document.addEventListener('snipcart.ready', () => {
  console.log('[Coupon] Snipcart ready, initializing event handlers...');

  // CRITICAL: Check immediately for already-logged-in users
  tryApplyPendingCoupon();

  // Listen for new sign-ins (users who weren't logged in)
  window.Snipcart.events.on('customer.signedin', async (customer: any) => {
    console.log('[Coupon] Customer signed in:', customer.email);
    tryApplyPendingCoupon();
  });

  // Listen for items being added (empty cart edge case)
  window.Snipcart.events.on('item.added', async (item: any) => {
    console.log('[Coupon] Item added to cart:', item.name);
    
    const pendingCode = sessionStorage.getItem('pending_coupon');
    if (pendingCode) {
      console.log('[Coupon] Applying pending coupon after item add...');
      await applyCouponCode(pendingCode);
    }
  });
});
