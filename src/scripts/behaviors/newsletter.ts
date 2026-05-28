import { isGmailAddress, isValidEmail } from '../utils/validation';

export function newsletterConfirm(config: { locked: boolean, email: string }) {
  return {
    locked: config.locked,
    email: config.email,
    emailError: false,
    formError: false,
    isSubmitting: false,
    submitLabel: 'Yes, stay in the loop',

    hideEmailError() {
      this.emailError = false;
    },

    validateEmail() {
      if (!this.locked) {
        if (this.email.trim() && !isGmailAddress(this.email)) {
          this.emailError = true;
        } else {
          this.emailError = false;
        }
      }
    },

    async submitForm() {
      this.formError = false;
      const email = this.email.trim();
      const isValid = this.locked ? isValidEmail(email) : isGmailAddress(email);

      if (!isValid) {
        this.emailError = true;
        return;
      }

      this.emailError = false;
      this.isSubmitting = true;
      const originalLabel = this.submitLabel;
      this.submitLabel = 'Confirming...';

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
        this.submitLabel = originalLabel;
        this.isSubmitting = false;
        this.formError = true;
      }
    }
  };
}

export function newsletterWidget(config?: { defaultLabel?: string }) {
  return {
    email: '',
    emailError: false,
    formError: false,
    isSubmitting: false,
    submitLabel: config?.defaultLabel || 'Subscribe',

    hideEmailError() {
      this.emailError = false;
    },

    validateEmail() {
      if (this.email.trim() && !isGmailAddress(this.email)) {
        this.emailError = true;
      } else {
        this.emailError = false;
      }
    },

    async submitForm() {
      const email = this.email.trim();
      this.formError = false;

      if (!isGmailAddress(email)) {
        this.emailError = true;
        return;
      }

      this.emailError = false;
      this.isSubmitting = true;
      const originalLabel = this.submitLabel;
      this.submitLabel = 'Subscribing...';

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
        this.submitLabel = originalLabel;
        this.isSubmitting = false;
        this.formError = true;
      }
    }
  };
}
