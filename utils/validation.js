/**
 * Input validation and sanitization utilities.
 * Requirements: 5.1, 5.2
 */

const MAX_AMOUNT = 10_000_000;

/**
 * Validates an expense or balance amount.
 * Accepts strings (from TextInput) or numbers.
 * Returns true iff the value is a finite number > 0 and <= MAX_AMOUNT.
 *
 * @param {string|number} value
 * @returns {boolean}
 */
export function validateAmount(value) {
  if (value === null || value === undefined || value === '') return false;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(n) && n > 0 && n <= MAX_AMOUNT;
}

/**
 * Trims leading and trailing whitespace from a title or goal name.
 * @param {string} value
 * @returns {string}
 */
export function sanitizeTitle(value) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

/**
 * Returns true if the value, after trimming, is a non-empty string.
 * @param {string} value
 * @returns {boolean}
 */
export function isNonEmptyTitle(value) {
  return sanitizeTitle(value).length > 0;
}
