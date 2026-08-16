/**
 * Property-based tests for category management logic.
 * Tests Properties 1 and 2 from the fib-v2 design document.
 */
const fc = require('fast-check');
const { mergeCategories, applyAddCustomCategory } = require('../utils/dataLogic');
const { DEFAULT_CATEGORIES } = require('../constants/categories');

const MAX_CATEGORIES = 20;

// ─── Arbitraries ─────────────────────────────────────────────────────────────

// A valid category object
const categoryArb = fc.record({
  id:    fc.string({ minLength: 1, maxLength: 20 }).filter(s => !DEFAULT_CATEGORIES.some(d => d.id === s)),
  label: fc.string({ minLength: 1, maxLength: 30 }),
  icon:  fc.constantFrom('pricetag-outline', 'star-outline', 'heart-outline'),
});

// A non-empty, non-whitespace label string
const labelArb = fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0);

// ─── Property 1: Category count cap ──────────────────────────────────────────
// Feature: fib-v2, Property 1: Category count cap
// Validates: Requirements 2.5
describe('Category count cap', () => {
  test('Property 1: adding a category when total >= 20 is rejected and list is unchanged', () => {
    fc.assert(
      fc.property(
        // Generate custom categories to fill up to or past the limit
        fc.integer({ min: 0, max: MAX_CATEGORIES - DEFAULT_CATEGORIES.length }).chain(extraCount => {
          return fc.tuple(
            fc.array(categoryArb, { minLength: extraCount, maxLength: extraCount }),
            labelArb,
          );
        }),
        ([customCats, newLabel]) => {
          // Build a merged list that is already AT the limit
          const filledDefaults = DEFAULT_CATEGORIES.slice(0, MAX_CATEGORIES);
          const fullList = [...filledDefaults, ...customCats].slice(0, MAX_CATEGORIES);

          const result = applyAddCustomCategory(fullList, DEFAULT_CATEGORIES, newLabel, MAX_CATEGORIES);

          // When at capacity, must reject
          if (fullList.length >= MAX_CATEGORIES) {
            expect(result.success).toBe(false);
            expect(result.categories).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 1: adding when total < 20 succeeds and list grows by exactly 1', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: MAX_CATEGORIES - DEFAULT_CATEGORIES.length - 1 }).chain(extraCount => {
          return fc.tuple(
            fc.array(categoryArb, { minLength: extraCount, maxLength: extraCount }),
            labelArb,
          );
        }),
        ([customCats, newLabel]) => {
          const merged = mergeCategories(DEFAULT_CATEGORIES, customCats);
          // Ensure we're below the limit
          if (merged.length >= MAX_CATEGORIES) return;

          const result = applyAddCustomCategory(merged, DEFAULT_CATEGORIES, newLabel, MAX_CATEGORIES);

          expect(result.success).toBe(true);
          expect(result.categories).toHaveLength(merged.length + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 2: Custom category merge idempotence ───────────────────────────
// Feature: fib-v2, Property 2: Custom category merge idempotence
// Validates: Requirements 2.2, 2.4
describe('Custom category merge idempotence', () => {
  test('Property 2: merging once or twice produces the same result', () => {
    fc.assert(
      fc.property(
        fc.array(categoryArb, { minLength: 0, maxLength: 6 }),
        (customCats) => {
          const once  = mergeCategories(DEFAULT_CATEGORIES, customCats);
          // Extracting the custom slice from the once-merged result and merging again simulates calling merge twice
          const customSlice = once.filter(c => !DEFAULT_CATEGORIES.some(d => d.id === c.id));
          const twice = mergeCategories(DEFAULT_CATEGORIES, customSlice);

          expect(twice).toEqual(once);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: all DEFAULT_CATEGORIES are always present after merge', () => {
    fc.assert(
      fc.property(
        fc.array(categoryArb, { minLength: 0, maxLength: 6 }),
        (customCats) => {
          const merged = mergeCategories(DEFAULT_CATEGORIES, customCats);
          for (const def of DEFAULT_CATEGORIES) {
            expect(merged.some(c => c.id === def.id)).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 2: no duplicate ids appear after merge', () => {
    fc.assert(
      fc.property(
        // Use uniqueArray to ensure the custom input itself has no duplicate ids
        fc.uniqueArray(categoryArb, { selector: c => c.id, minLength: 0, maxLength: 6 }),
        (customCats) => {
          const merged = mergeCategories(DEFAULT_CATEGORIES, customCats);
          const ids = merged.map(c => c.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
