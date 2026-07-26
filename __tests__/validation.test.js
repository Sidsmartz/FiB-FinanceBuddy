const fc = require('fast-check');
const { validateAmount, sanitizeTitle, isNonEmptyTitle } = require('../utils/validation');

// ─── Property 9 ───────────────────────────────────────────────────────────────
// Feature: fib-redesign, Property 9: Amount validation accepts only valid finite positive numbers within bounds
// Validates: Requirements 5.1
describe('validateAmount', () => {
  test('Property 9: accepts any finite positive number within bounds', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0.01, max: 10_000_000, noNaN: true }),
        (amount) => {
          expect(validateAmount(amount)).toBe(true);
          // String representation should also be accepted
          expect(validateAmount(String(amount))).toBe(true);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Property 9: rejects zero', () => {
    expect(validateAmount(0)).toBe(false);
    expect(validateAmount('0')).toBe(false);
    expect(validateAmount('0.00')).toBe(false);
  });

  test('Property 9: rejects negative numbers', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -10_000_000, max: -0.001, noNaN: true }),
        (amount) => {
          expect(validateAmount(amount)).toBe(false);
          expect(validateAmount(String(amount))).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Property 9: rejects numbers exceeding 10,000,000', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 10_000_001, max: Number.MAX_SAFE_INTEGER, noNaN: true }),
        (amount) => {
          expect(validateAmount(amount)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 9: rejects non-numeric strings', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => isNaN(parseFloat(s))),
        (s) => {
          expect(validateAmount(s)).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Property 9: rejects blank / null / undefined', () => {
    expect(validateAmount('')).toBe(false);
    expect(validateAmount(null)).toBe(false);
    expect(validateAmount(undefined)).toBe(false);
  });

  test('Property 9: rejects NaN and Infinity', () => {
    expect(validateAmount(NaN)).toBe(false);
    expect(validateAmount(Infinity)).toBe(false);
    expect(validateAmount(-Infinity)).toBe(false);
    expect(validateAmount('NaN')).toBe(false);
    expect(validateAmount('Infinity')).toBe(false);
  });
});

// ─── Property 4 ───────────────────────────────────────────────────────────────
// Feature: fib-redesign, Property 4: Whitespace-only titles are trimmed to empty and rejected
// Validates: Requirements 5.2
describe('sanitizeTitle / isNonEmptyTitle', () => {
  test('Property 4: whitespace-only strings produce empty string after trim', () => {
    fc.assert(
      fc.property(
        // Generate strings made only of whitespace characters
        fc.array(fc.constantFrom(' ', '\t', '\n', '\r', '\f', '\v'), { minLength: 1, maxLength: 50 })
          .map(chars => chars.join('')),
        (ws) => {
          expect(sanitizeTitle(ws)).toBe('');
          expect(isNonEmptyTitle(ws)).toBe(false);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Property 4: non-whitespace strings survive trimming with content intact', () => {
    fc.assert(
      fc.property(
        // Generate strings that have at least one non-whitespace char
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (s) => {
          expect(sanitizeTitle(s)).toBe(s.trim());
          expect(isNonEmptyTitle(s)).toBe(true);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Property 4: leading/trailing whitespace is stripped', () => {
    expect(sanitizeTitle('  hello  ')).toBe('hello');
    expect(sanitizeTitle('\tFood\n')).toBe('Food');
    expect(sanitizeTitle('   ')).toBe('');
  });

  test('Property 4: non-string input returns empty string', () => {
    expect(sanitizeTitle(null)).toBe('');
    expect(sanitizeTitle(undefined)).toBe('');
    expect(sanitizeTitle(42)).toBe('');
  });
});
