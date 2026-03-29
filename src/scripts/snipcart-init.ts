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
    libphonenumber: any;
  }
}

function initSnipcartLogic() {
  if (!(window as any).Snipcart) return;

  // --- 0. SMART NEWSLETTER WATCHDOG (State-Aware & Shadow-Piercing) ---
  const autoCheckNewsletter = () => {
    // 1. Recursive Shadow-DOM piercing finder
    const findCheckbox = (root: Document | ShadowRoot | Element): HTMLInputElement | null => {
      const el = root.querySelector('input[name="subscribeToNewsletter"]') as HTMLInputElement;
      if (el) return el;
      const children = Array.from(root.querySelectorAll('*'));
      for (const child of children) {
        if (child.shadowRoot) {
          const found = findCheckbox(child.shadowRoot);
          if (found) return found;
        }
      }
      return null;
    };

    const checkbox = findCheckbox(document);
    if (!checkbox || checkbox.getAttribute('data-autochecked')) return;

    // 2. State-Awareness: Check if Snipcart already has a session-stored value (User manual choice)
    const state = window.Snipcart.store.getState();
    const billing = state?.cart?.billingAddress || {};
    const metadata = billing.metadata || {};
    
    // If the value is already present in metadata, the user has already made a choice this session.
    // If it's undefined, this is a fresh lead.
    const currentVal = metadata.subscribeToNewsletter;

    if (currentVal === undefined) {
      console.log('[Zelia Vance] Fresh session detected: Auto-checking newsletter.');
      checkbox.checked = true;
      checkbox.setAttribute('data-autochecked', 'true');
      // Sync it with Snipcart's Vue engine
      checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      checkbox.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      console.log('[Zelia Vance] Existing session found: Respecting manual choice.');
      checkbox.setAttribute('data-autochecked', 'true'); // Don't touch it again
    }
  };

  // The 'Patrol': Watch for Snipcart re-renders
  const checkoutContainer = document.querySelector('#snipcart');
  if (checkoutContainer) {
    const observer = new MutationObserver((mutations) => {
      // Small delay to let Snipcart/Vue settle after a DOM change
      setTimeout(autoCheckNewsletter, 100);
    });
    observer.observe(checkoutContainer, { childList: true, subtree: true });
  }

  // Fallback for direct page entries
  window.Snipcart.events.on('page.change', (page: string) => {
    if (page === 'billing') setTimeout(autoCheckNewsletter, 500);
  });

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

  // --- 3. DUAL-LAYER VALIDATION API HOOK (BLOCKING) ---
  window.Snipcart.events.on('page.validating', (ev: any, data: any) => {
    // Target both billing and shipping steps
    const isAddressStep = ev.type === 'shipping-address' || ev.type === 'billing-address' || ev.name === 'shipping-address' || ev.name === 'billing-address';
    if (!isAddressStep) return;

    const billing = data || {};
    
    // DIRECT FIELD CHECK (Zero-Bypass): Look at the screen if data is missing
    const emailInput = document.querySelector('snipcart-input[name="email"] input, input[name="email"]') as HTMLInputElement;
    const phoneInput = document.querySelector('snipcart-input[name="phone"] input, input[name="phone"]') as HTMLInputElement;
    const countryInput = document.querySelector('select[name="country"], .snipcart-typeahead__input') as HTMLSelectElement;

    const email = (emailInput ? emailInput.value : (billing.email || '')).trim().toLowerCase();
    const phone = (phoneInput ? phoneInput.value : (billing.phone || '')).trim();
    const rawCountry = countryInput ? countryInput.value : (billing.country || 'IN');
    
    // NATIVE COUNTRY MAPPING: Handle full names like 'India' or 'United States'
    let countryCode = rawCountry;
    if (rawCountry === 'India') countryCode = 'IN';
    if (rawCountry === 'United States') countryCode = 'US';
    if (rawCountry === 'Canada') countryCode = 'CA';

    const isIndia = countryCode === 'IN';

    // 3a. GMAIL ENFORCEMENT
    if (email && !email.endsWith('@gmail.com')) {
      const msg = 'Please use a Gmail address (@gmail.com).';
      if (typeof ev.addError === 'function') ev.addError('email', msg);
      else if (ev.reject) ev.reject(msg);
    }

    // 3b. SMART PHONE VALIDATION (Concierge)
    if (phone) {
      const lib = (window as any).libphonenumber;
      if (lib) {
        try {
          const parsed = lib.parsePhoneNumberWithError(phone, countryCode);
          if (!parsed.isValid()) {
            const msg = 'Invalid mobile number for ' + rawCountry + '.';
            if (typeof ev.addError === 'function') ev.addError('phone', msg);
            else if (ev.reject) ev.reject(msg);
          }
        } catch (e: any) {
          const msg = e.message?.includes('TOO_LONG') ? 'This number is too long.' : 'Invalid mobile number.';
          if (typeof ev.addError === 'function') ev.addError('phone', msg);
          else if (ev.reject) ev.reject(msg);
        }
      } else if (isIndia) {
        // Strict 10-digit Fallback for India if library isn't available
        const digits = phone.replace(/\D/g, '');
        if (digits.length !== 10) {
          const msg = 'India deliveries require a 10-digit mobile number.';
          if (typeof ev.addError === 'function') ev.addError('phone', msg);
          else if (ev.reject) ev.reject(msg);
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
        // DATA HARDENING: Strip everything except digits and '+'
        let cleanedValue = target.value.replace(/[^\d+]/g, '');
        
        // SMART PREFIX: Prepend '+' if a digit is typed and '+' is missing
        if (cleanedValue.length > 0 && !cleanedValue.startsWith('+')) {
          cleanedValue = '+' + cleanedValue;
        }

        // SMART DELETE: If only '+' is left, clear the field
        if (cleanedValue === '+') {
          cleanedValue = '';
        }

        if (target.value !== cleanedValue) {
          target.value = cleanedValue;
        }

        const countryElement = document.querySelector('select[name="country"], .snipcart-typeahead__input') as HTMLSelectElement;
        const countryCode = countryElement ? countryElement.value : 'IN';
        const val = target.value.trim();

        if (!val) {
          target.setCustomValidity(''); 
          return;
        }

        try {
          // Use the library we added to BaseLayout
          if (typeof (window as any).libphonenumber !== 'undefined') {
            const phoneNumber = (window as any).libphonenumber.parsePhoneNumberWithError(val, countryCode);
            if (phoneNumber.isValid()) {
              target.setCustomValidity('');
            } else {
              target.setCustomValidity('Please enter a valid mobile number for early delivery updates.');
            }
          } else {
            // Strict Fallback for India if library is still loading
            const digits = val.replace(/\D/g, '');
            if (countryCode === 'IN' || countryCode === 'India') {
              if (digits.length !== 10) {
                target.setCustomValidity('Please enter a valid 10-digit mobile number.');
              } else {
                target.setCustomValidity('');
              }
            } else {
              target.setCustomValidity('');
            }
          }
        } catch (error: any) {
          // Handle specific error types for a "Concierge" feel
          const reason = error.message || '';
          if (reason.includes('TOO_SHORT')) {
            target.setCustomValidity('This number is too short. Please check again.');
          } else if (reason.includes('TOO_LONG')) {
            target.setCustomValidity('This number is too long. Please check again.');
          } else if (reason.includes('INVALID_COUNTRY_CODE')) {
            target.setCustomValidity('Please select the correct country above.');
          } else {
            target.setCustomValidity('Please enter a valid mobile number.');
          }
        }
      }

      if ((name === 'email' || target.type === 'email')) {
        const emailVal = target.value.trim().toLowerCase();
        if (emailVal.length > 0 && !emailVal.endsWith('@gmail.com')) {
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
}

// Start logic immediately if Snipcart is already loaded, otherwise wait for event
if ((window as any).Snipcart) {
  initSnipcartLogic();
} else {
  document.addEventListener('snipcart.ready', initSnipcartLogic);
}
