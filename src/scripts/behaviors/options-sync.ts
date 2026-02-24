/**
 * Product Options Sync behavior
 * 
 * Dynamically updates Snipcart's data-item-custom-X attributes when radio buttons or selectors change.
 * This ensures that individual 'Add to Cart' buttons always capture the user's current choice.
 */

export function initOptionsSync() {
  const selectors = document.querySelectorAll('.product-variant-selector');
  const cartButtons = document.querySelectorAll('.snipcart-add-item');

  if (selectors.length === 0 || cartButtons.length === 0) return;

  function updateButtonAttributes() {
    const activeSelections: Record<string, string> = {};
    
    // 1. Gather all active selections from the tagged inputs
    selectors.forEach((el) => {
      const input = el as HTMLInputElement;
      const name = input.getAttribute('data-variant-name');
      const value = input.value;
      if (name && value) {
        activeSelections[name] = value;
      }
    });

    // 2. Update all Snipcart buttons on the page
    cartButtons.forEach((btn) => {
      const button = btn as HTMLElement;
      
      // Loop through the first 3 possible custom fields
      for (let i = 1; i <= 3; i++) {
        const nameAttr = `data-item-custom${i}-name`;
        const valueAttr = `data-item-custom${i}-value`;
        
        const fieldName = button.getAttribute(nameAttr);
        if (fieldName) {
          // Normalize for comparison (lowercase + original)
          const searchName = fieldName.trim();
          
          // Try exact match or case-insensitive match
          const matchingValue = activeSelections[searchName] || 
                               Object.entries(activeSelections).find(([k]) => k.toLowerCase() === searchName.toLowerCase())?.[1];

          if (matchingValue) {
            button.setAttribute(valueAttr, matchingValue);
            console.log(`[OptionsSync] Updated ${fieldName} to ${matchingValue} on button`);
          }
        }
      }
    });
  }

  // Initial Sync
  updateButtonAttributes();

  // Listen for changes (Alpine.js updates the hidden input, so we use a MutationObserver or event)
  // Since OptionSelector uses Alpine.js x-model, the simplest is to listen for 'input' or 'change' bubbles
  document.addEventListener('change', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('fieldset')) {
      // Small delay to let Alpine.js sync state to hidden input
      setTimeout(updateButtonAttributes, 10);
    }
  });

  // Listen for custom events if needed
  document.addEventListener('snipcart-attributes-sync', updateButtonAttributes);

  // STRICT VALIDATION INTERCEPTOR
  // Snipcart uses a bubbling listener. By using capture: true, we intercept the click BEFORE Snipcart!
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('.snipcart-add-item');
    
    if (btn) {
      // Loop through the 3 possible custom fields
      for (let i = 1; i <= 3; i++) {
        const required = btn.getAttribute(`data-item-custom${i}-required`);
        const value = btn.getAttribute(`data-item-custom${i}-value`) || '';
        const name = btn.getAttribute(`data-item-custom${i}-name`);
        
        // If it's explicitly required, but the value is empty, block Snipcart and alert user
        if (required === 'true' && value.trim() === '') {
          e.preventDefault();
          e.stopImmediatePropagation(); // This strictly blocks Snipcart's own internal script
          
          // Inline validation UX replacing native alert
          const container = btn.closest('.product-actions-row') || btn.parentElement;
          let errorMsg = container?.parentElement?.querySelector('.inline-variant-error') as HTMLElement;
          if (!errorMsg) {
             errorMsg = document.createElement('p');
             errorMsg.className = 'inline-variant-error mt-4 text-sm font-medium text-red-500 w-full animate-fade-in bg-red-50 p-3 rounded-lg border border-red-100';
             if (container) {
                 container.insertAdjacentElement('afterend', errorMsg);
             } else {
                 btn.insertAdjacentElement('afterend', errorMsg);
             }
          }
          errorMsg.textContent = `Please select a ${name} to proceed.`;
          
          // Clear error after 4 seconds
          setTimeout(() => {
            if (errorMsg?.parentElement) {
              errorMsg.remove();
            }
          }, 4000);
          
          return;
        }
      }
    }
  }, { capture: true });
}

// Auto-init on DOMContentLoaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initOptionsSync);
}
