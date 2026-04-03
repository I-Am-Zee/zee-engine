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
/**
 * Helper to handle the subscription API call.
 */
async function subscribe(email: string, submitBtn: HTMLButtonElement | null, submitLabel: HTMLElement | null, originalLabel: string, showError: () => void): Promise<boolean> {
  if (submitBtn) submitBtn.disabled = true;
  if (submitLabel) submitLabel.textContent = 'Confirming...';

  try {
    const res = await fetch('/api/actions/newsletter-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      window.location.href = '/newsletter/success';
      return true;
    }
    throw new Error(`Server responded ${res.status}`);
  } catch (err) {
    console.error('[Newsletter] Subscription failed:', err);
    if (submitLabel) submitLabel.textContent = originalLabel;
    if (submitBtn) submitBtn.disabled = false;
    showError();
    return false;
  }
}

/**
 * Specialized behavior for the confirmation page (handles pre-filled/locked emails).
 */
export function initNewsletterConfirm(): void {
  const form = document.getElementById('newsletter-confirm-form') as HTMLFormElement | null;
  if (!form) return;

  const isLocked = form.dataset.locked === 'true';
  const emailInput = document.getElementById('newsletter-email-input') as HTMLInputElement | null;
  const emailError = document.getElementById('newsletter-email-error') as HTMLElement | null;
  const submitBtn = document.getElementById('newsletter-submit-btn') as HTMLButtonElement | null;
  const submitLabel = document.getElementById('newsletter-submit-label') as HTMLElement | null;
  const formError = document.getElementById('newsletter-form-error') as HTMLElement | null;
  const originalLabel = submitLabel?.textContent || 'Yes, stay in the loop';

  const showEmailError = () => emailError?.classList.remove('hidden');
  const hideEmailError = () => emailError?.classList.add('hidden');
  const showFormError = () => formError?.classList.remove('hidden');
  const hideFormError = () => formError?.classList.add('hidden');

  if (!isLocked && emailInput) {
    emailInput.addEventListener('input', hideEmailError);
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      if (val && !isGmailAddress(val)) showEmailError();
      else hideEmailError();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();
    const data = new FormData(form);
    const email = (data.get('email') as string)?.trim();
    const isValid = isLocked ? isValidEmail(email) : isGmailAddress(email);

    if (!isValid) {
      showEmailError();
      emailInput?.focus();
      return;
    }

    hideEmailError();
    await subscribe(email, submitBtn, submitLabel, originalLabel, showFormError);
  });
}

/**
 * Generic behavior for the NewsletterWidget (Footer, Sidebar, Section).
 * Always enforces Gmail validation.
 */
export function initNewsletterWidget(formId: string): void {
  const form = document.getElementById(formId) as HTMLFormElement | null;
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement | null;
  const emailError = form.querySelector('[data-email-error]') as HTMLElement | null;
  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
  const submitLabel = submitBtn?.querySelector('span') || submitBtn; // Fallback to button itself
  const originalLabel = submitLabel?.textContent || 'Subscribe';

  const showEmailError = () => emailError?.classList.remove('hidden');
  const hideEmailError = () => emailError?.classList.add('hidden');

  if (emailInput) {
    emailInput.addEventListener('input', hideEmailError);
    emailInput.addEventListener('blur', () => {
      const val = emailInput.value.trim();
      if (val && !isGmailAddress(val)) showEmailError();
      else hideEmailError();
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const email = (data.get('email') as string)?.trim();

    if (!isGmailAddress(email)) {
      showEmailError();
      emailInput?.focus();
      return;
    }

    hideEmailError();
    await subscribe(email, submitBtn, submitLabel as HTMLElement, originalLabel, () => {
      alert('Subscription failed. Please try again later.');
    });
  });
}

