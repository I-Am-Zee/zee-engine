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
