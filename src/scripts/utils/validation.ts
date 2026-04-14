// src/scripts/utils/validation.ts

/**
 * Validates that a string is a Gmail address.
 * Pure function — no side effects, safe to import anywhere.
 *
 * @param email - The email string to test.
 * @returns true if the string is a valid @gmail.com address.
 */
export function isGmailAddress(email: string): boolean {
  return /^[^\s@]+@gmail\.com$/i.test(email.trim());
}

/**
 * Validates that a string is a plausible email address (basic format check).
 * Pure function — used when stricter Gmail-only policy doesn't apply.
 *
 * @param email - The email string to test.
 * @returns true if the string passes a basic email format check.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
/**
 * Validates that a string is a 10-digit Indian phone number (after stripping non-digits).
 * Used as a zero-dependency fallback for India-only validation.
 *
 * @param phone - The phone string to test.
 * @returns true if the string is exactly 10 digits.
 */
export function isValidIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10;
}
