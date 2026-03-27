/**
 * Snipcart Initialization & Validation Hooks
 * 
 * Handles:
 * 1. Global localization overrides (Email hints)
 * 2. Guest/Member state sync (CSS classes)
 * 3. Dual-layer validation (Phone & Gmail)
 * 4. Upsell Bridge (DOM events on add)
 * 5. Amazon-style inclusive taxes hider
 * 6. COD / Pay Later login restrictions
 */

export {};

declare global {
  interface Window {
    Snipcart: any;
    SnipcartSettings: any;
  }
}

document.addEventListener('snipcart.ready', () => {
  // --- 1. LOCALIZATION OVERRIDES FOR EMAIL HINTS ---
  window.Snipcart.api.session.setLanguage('en', {
    address_form: {
      email: "Email (Please use a Gmail address)"
    },
    signin_form: {
      email: "Email (Please use a Gmail address to access discounts)"
    },
    register_form: {
      email: "Email (Please use a Gmail address)"
    }
  });

  // --- 2. NO LOGIN = NO DISCOUNT STATE SYNC ---
  const toggleGuestState = () => {
    const state = window.Snipcart.store.getState();
    if (state && state.customer && state.customer.status === 'SignedOut') {
      document.body.classList.add('zav-guest-user');
    } else {
      document.body.classList.remove('zav-guest-user');
    }
  };
  window.Snipcart.store.subscribe(toggleGuestState);
  toggleGuestState();

  // --- 3. DUAL-LAYER VALIDATION API HOOK ---
  window.Snipcart.events.on('page.validating', (ev: any, data: any) => {
    if (ev.type === 'shipping-address' || ev.type === 'billing-address' || ev.name === 'shipping-address' || ev.name === 'billing-address') {
      // PHONE VALIDATION
      const phoneInput = document.querySelector('snipcart-input[name="phone"] input, input[name="phone"], input[name="shipping[phone]"], input[name="billing[phone]"], [name="phone"]') as HTMLInputElement;
      let digits = '';
      if (phoneInput) {
        digits = String(phoneInput.value).replace(/\D/g, '');
      } else if (data && data.phone) {
        digits = String(data.phone).replace(/\D/g, '');
      }

      if (digits.length !== 10) {
        const msg = digits.length === 0 ? 'Phone number is required.' : 'Please enter a valid 10-digit mobile number.';
        if (typeof ev.addError === 'function') {
          ev.addError('phone', msg);
        } else if (ev.errors && Array.isArray(ev.errors)) {
          ev.errors.push({ id: 'phone', message: msg });
        }
      }

      // GMAIL VALIDATION
      const emailInput = document.querySelector('snipcart-input[name="email"] input, input[name="email"], input[type="email"]') as HTMLInputElement;
      let email = '';
      if (emailInput) {
        email = String(emailInput.value).trim().toLowerCase();
      } else if (data && data.email) {
        email = String(data.email).trim().toLowerCase();
      }

      if (email && !email.endsWith('@gmail.com')) {
        const msg = 'Only Gmail addresses (@gmail.com) are accepted to prevent spam.';
        if (typeof ev.addError === 'function') {
          ev.addError('email', msg);
        } else if (ev.errors && Array.isArray(ev.errors)) {
          ev.errors.push({ id: 'email', message: msg });
        }
      }
    }
  });

  // HTML5 Physical DOM Validation + Digit Stripper
  document.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target && target.tagName === 'INPUT') {
      const name = target.name || '';
      if (name === 'phone' || name.includes('phone')) {
        const digits = target.value.replace(/\D/g, '').slice(0, 10);
        if (target.value !== digits) {
          target.value = digits;
          target.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (digits.length < 10) {
          target.setCustomValidity('Please enter a valid 10-digit mobile number.');
        } else {
          target.setCustomValidity(''); 
        }
      }

      if ((name === 'email' || target.type === 'email') && target.value.length > 0) {
        const emailVal = target.value.trim().toLowerCase();
        if (!emailVal.endsWith('@gmail.com')) {
          target.setCustomValidity('Please use a Gmail address (@gmail.com).');
        } else {
          target.setCustomValidity(''); 
        }
      }
    }
  }, true);

  // Upsell Bridge
  window.Snipcart.events.on('item.added', (item: any) => {
    console.log('[Upsell Bridge] Item added:', item.name);
    const event = new CustomEvent('zeliavance:item-added', {
      detail: {
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.unitPrice,
        options: item.customFields || []
      }
    });
    document.dispatchEvent(event);
  });

  // --- 4. AMAZON-STYLE INCLUSIVE TAXES HIDER ---
  function hideTaxes() {
    const taxTitles = document.querySelectorAll('.snipcart-summary-fees__title, .snipcart-cart-summary-fees__title, .snipcart-summary-fees__item, .snipcart-cart-summary-fees__item');
    taxTitles.forEach(el => {
      if (el.textContent && /taxes/i.test(el.textContent)) {
        const row = (el.classList.contains('snipcart-summary-fees__item') || el.classList.contains('snipcart-cart-summary-fees__item'))
          ? (el as HTMLElement)
          : (el.closest('.snipcart-cart-summary-fees__item, .snipcart-summary-fees__item') as HTMLElement);
        
        if (row && row.style.display !== 'none') {
          row.style.setProperty('display', 'none', 'important');
        }
      }
    });
  }
  const taxObserver = new MutationObserver(hideTaxes);
  taxObserver.observe(document.body, { childList: true, subtree: true });

  // --- 5. COD / PAY LATER LOGIN RESTRICTION ---
  function updatePayLaterVisibility() {
    const state = window.Snipcart.store.getState();
    const isSignedIn = state.customer && state.customer.status === 'SignedIn';
    const payLaterElements = document.querySelectorAll('.snipcart-payment-methods-list-item, .snipcart-payment-methods-list-item__button');
    
    payLaterElements.forEach(el => {
      const hasPayLaterText = /pay later/i.test(el.textContent || '') || /pay later/i.test(el.getAttribute('aria-label') || '');
      if (hasPayLaterText) {
        const target = (el.classList.contains('snipcart-payment-methods-list-item') ? el : el.closest('.snipcart-payment-methods-list-item')) as HTMLElement;
        if (target) {
          if (!isSignedIn) {
            target.style.setProperty('display', 'none', 'important');
          } else {
            target.style.setProperty('display', '', '');
          }
        }
      }
    });
  }
  window.Snipcart.store.subscribe(updatePayLaterVisibility);
  const payLaterObserver = new MutationObserver(updatePayLaterVisibility);
  payLaterObserver.observe(document.body, { childList: true, subtree: true });
});
