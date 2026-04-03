// src/scripts/behaviors/newsletter.ts

import { isGmailAddress, isValidEmail } from '../utils/validation';

/**
 * Initialises all event listeners for the newsletter confirmation form.
 *
 * Reads `data-locked="true"` on the form to detect pre-filled mode
 * (email came from the delivery link — skip Gmail restriction, the
 * customer's order email may not be a Gmail).
 *
 * Imported into: components/features/NewsletterConfirmForm.astro
 */
export function initNewsletterConfirm(): void {
  const form = document.getElementById('newsletter-confirm-form') as HTMLFormElement | null;
  if (!form) return;

  const isLocked = form.dataset.locked === 'true';

  const emailInput  = document.getElementById('newsletter-email-input')  as HTMLInputElement | null;
  const emailError  = document.getElementById('newsletter-email-error')  as HTMLElement | null;
  const submitBtn   = document.getElementById('newsletter-submit-btn')   as HTMLButtonElement | null;
  const submitLabel = document.getElementById('newsletter-submit-label') as HTMLElement | null;
  const formError   = document.getElementById('newsletter-form-error')   as HTMLElement | null;

  const showEmailError = () => emailError?.classList.remove('hidden');
  const hideEmailError = () => emailError?.classList.add('hidden');
  const showFormError  = () => formError?.classList.remove('hidden');
  const hideFormError  = () => formError?.classList.add('hidden');

  // Open mode only: live + blur Gmail validation
  if (!isLocked && emailInput) {
    emailInput.addEventListener('input', hideEmailError);

    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      if (val && !isGmailAddress(val)) {
        showEmailError();
      } else {
        hideEmailError();
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const data  = new FormData(form);
    const email = (data.get('email') as string)?.trim();

    // Locked mode: email comes from our system — validate basic format only.
    // Open mode: enforce Gmail restriction.
    const isValid = isLocked ? isValidEmail(email) : isGmailAddress(email);

    if (!isValid) {
      showEmailError();
      emailInput?.focus();
      return;
    }

    hideEmailError();
    if (submitBtn)   submitBtn.disabled = true;
    if (submitLabel) submitLabel.textContent = 'Confirming…';

    try {
      const res = await fetch('/api/actions/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        window.location.href = '/newsletter/success';
        return;
      }

      throw new Error(`Server responded ${res.status}`);
    } catch (err) {
      console.error('[Newsletter] Subscription failed:', err);
      if (submitLabel) submitLabel.textContent = 'Yes, stay in the loop';
      if (submitBtn)   submitBtn.disabled = false;
      showFormError();
    }
  });
}
