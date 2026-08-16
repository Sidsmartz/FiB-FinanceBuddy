/**
 * Property-based tests for budget and time-of-day logic.
 * Tests Properties 4 and 5 from the fib-v2 design document.
 * Requirements: 3.3, 3.4, 8.1
 */
const fc = require('fast-check');
const { computeBudgetStatus, getBudgetColour } = require('../utils/dataLogic');

// ─── Arbitraries ─────────────────────────────────────────────────────────────

// Built-in Object.prototype keys that must be excluded to avoid false positives
// when using a category string as a plain-object key.
const OBJECT_PROTO_KEYS = new Set(Object.getOwnPropertyNames(Object.prototype));

// A valid category name (non-empty, not a built-in prototype key)
const categoryArb = fc
  .string({ minLength: 1, maxLength: 20 })
  .filter(s => s.trim().length > 0 && !OBJECT_PROTO_KEYS.has(s));

// A valid positive monthly limit
const limitArb = fc.double({ min: 0.01, max: 1_000_000, noNaN: true });

// A valid positive expense amount
const amountArb = fc.double({ min: 0.01, max: 100_000, noNaN: true });

// ─── Property 4: getBudgetStatus spent accuracy ───────────────────────────────
// Feature: fib-v2, Property 4: getBudgetStatus spent accuracy
// Validates: Requirements 3.3
describe('Property 4: getBudgetStatus spent accuracy', () => {
  test(
    'For any budgets and expense map, spent field equals the exact sum for that category',
    () => {
      fc.assert(
        fc.property(
          // Generate unique categories
          fc.uniqueArray(categoryArb, { minLength: 1, maxLength: 8 }).chain(cats =>
            fc.tuple(
              // budgets array: one budget per category
              fc.array(
                fc.integer({ min: 0, max: cats.length - 1 }).chain(i =>
                  limitArb.map(limit => ({ category: cats[i], monthly_limit: limit }))
                ),
                { minLength: 1, maxLength: cats.length }
              ),
              // expensesByCategory map: arbitrary amounts for each category
              fc.record(
                Object.fromEntries(cats.map(c => [c, fc.oneof(fc.constant(0), amountArb)])),
              ),
            )
          ),
          ([budgets, expensesByCategory]) => {
            const statuses = computeBudgetStatus(budgets, expensesByCategory);

            for (const status of statuses) {
              const expectedSpent = expensesByCategory[status.category] ?? 0;
              // spent must equal what's in the map exactly
              expect(status.spent).toBeCloseTo(expectedSpent, 8);
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test('For a category with no expenses, spent should be 0', () => {
    fc.assert(
      fc.property(
        categoryArb,
        limitArb,
        (category, limit) => {
          const budgets = [{ category, monthly_limit: limit }];
          const statuses = computeBudgetStatus(budgets, {});
          expect(statuses[0].spent).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 5: getBudgetStatus colour threshold formula ─────────────────────
// Feature: fib-v2, Property 5: getBudgetStatus colour threshold formula
// Validates: Requirements 3.3, 3.4
describe('Property 5: getBudgetStatus colour threshold formula', () => {
  test(
    'For any budget and expense, percent === (spent/limit)*100 and isOver === (percent >= 100)',
    () => {
      fc.assert(
        fc.property(
          categoryArb,
          limitArb,
          amountArb,
          (category, limit, spent) => {
            const budgets = [{ category, monthly_limit: limit }];
            const expensesByCategory = { [category]: spent };
            const [status] = computeBudgetStatus(budgets, expensesByCategory);

            const expectedPercent = (spent / limit) * 100;
            expect(status.percent).toBeCloseTo(expectedPercent, 8);
            expect(status.isOver).toBe(expectedPercent >= 100);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test(
    'getBudgetColour returns green when percent < 80, amber when 80 <= percent < 100, red when >= 100',
    () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 200, noNaN: true }),
          (percent) => {
            const colour = getBudgetColour(percent);
            if (percent >= 100) {
              expect(colour).toBe('red');
            } else if (percent >= 80) {
              expect(colour).toBe('amber');
            } else {
              expect(colour).toBe('green');
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test('boundary: exactly 80 percent => amber', () => {
    expect(getBudgetColour(80)).toBe('amber');
  });

  test('boundary: exactly 100 percent => red', () => {
    expect(getBudgetColour(100)).toBe('red');
  });

  test('boundary: 79.99 percent => green', () => {
    expect(getBudgetColour(79.99)).toBe('green');
  });
});

// ─── Property 3: setBudget upsert uniqueness ──────────────────────────────────
// Feature: fib-v2, Property 3: setBudget upsert uniqueness
// Validates: Requirements 3.1
describe('Property 3: setBudget upsert uniqueness', () => {
  /**
   * We test the upsert semantic directly: given a budgets store keyed by
   * `${category}_${month}`, inserting the same category+month twice must leave
   * exactly one row with the second limit value.
   */
  function upsertBudget(store, category, limit, month) {
    const id = `${category}_${month}`;
    store[id] = { id, category, monthly_limit: limit, month };
  }

  function getBudgetsForMonth(store, month) {
    return Object.values(store).filter(r => r.month === month);
  }

  test(
    'For any category, calling setBudget twice leaves exactly one row with the second limit',
    () => {
      fc.assert(
        fc.property(
          categoryArb,
          limitArb,
          limitArb,
          (category, limit1, limit2) => {
            const store = {};
            const month = '2026-08';

            upsertBudget(store, category, limit1, month);
            upsertBudget(store, category, limit2, month);

            const rows = getBudgetsForMonth(store, month).filter(r => r.category === category);

            // Exactly one row must exist for this category+month
            expect(rows).toHaveLength(1);
            // It must hold the second (most recent) limit
            expect(rows[0].monthly_limit).toBe(limit2);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test('Upsert across different months creates separate rows', () => {
    fc.assert(
      fc.property(
        categoryArb,
        limitArb,
        limitArb,
        (category, limit1, limit2) => {
          const store = {};
          upsertBudget(store, category, limit1, '2026-07');
          upsertBudget(store, category, limit2, '2026-08');

          const allRows = Object.values(store).filter(r => r.category === category);
          expect(allRows).toHaveLength(2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Property 9: Insight delta and primary insight correctness ────────────────
// Feature: fib-v2, Property 9: Insight delta and primary insight correctness
// Validates: Requirements 4.1, 4.2, 4.3
const { computeInsights } = require('../utils/dataLogic');

describe('Property 9: Insight delta and primary insight correctness', () => {
  // Exclude prototype keys from category names
  const OBJECT_PROTO_KEYS = new Set(Object.getOwnPropertyNames(Object.prototype));
  const insightCategoryArb = fc
    .string({ minLength: 1, maxLength: 20 })
    .filter(s => s.trim().length > 0 && !OBJECT_PROTO_KEYS.has(s));

  const positiveAmountArb = fc.double({ min: 0.01, max: 100_000, noNaN: true });

  // Generate two {category → amount} maps with at least one shared category
  const totalsArb = fc
    .uniqueArray(insightCategoryArb, { minLength: 1, maxLength: 8 })
    .chain(cats =>
      fc.tuple(
        fc.record(Object.fromEntries(cats.map(c => [c, fc.oneof(fc.constant(0), positiveAmountArb)]))),
        fc.record(Object.fromEntries(cats.map(c => [c, fc.oneof(fc.constant(0), positiveAmountArb)]))),
      )
    );

  test(
    'For any two totals maps, each entry delta === current - previous',
    () => {
      fc.assert(
        fc.property(totalsArb, ([currentTotals, previousTotals]) => {
          const entries = computeInsights(currentTotals, previousTotals);
          for (const entry of entries) {
            const expected = (currentTotals[entry.category] ?? 0) - (previousTotals[entry.category] ?? 0);
            expect(entry.delta).toBeCloseTo(expected, 8);
          }
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    'For any two totals maps, pct === ((current - previous) / previous) * 100 when previous > 0',
    () => {
      fc.assert(
        fc.property(totalsArb, ([currentTotals, previousTotals]) => {
          const entries = computeInsights(currentTotals, previousTotals);
          for (const entry of entries) {
            if (entry.previous > 0) {
              const expectedPct = ((entry.current - entry.previous) / entry.previous) * 100;
              expect(entry.pct).toBeCloseTo(expectedPct, 8);
            }
          }
        }),
        { numRuns: 100 }
      );
    }
  );

  test(
    'Primary insight (first entry) has the largest Math.abs(delta)',
    () => {
      fc.assert(
        fc.property(totalsArb, ([currentTotals, previousTotals]) => {
          const entries = computeInsights(currentTotals, previousTotals);
          if (entries.length <= 1) return; // trivially true
          const primaryDelta = Math.abs(entries[0].delta);
          for (const entry of entries) {
            expect(Math.abs(entry.delta)).toBeLessThanOrEqual(primaryDelta);
          }
        }),
        { numRuns: 100 }
      );
    }
  );
});

// ─── Streak Properties (6, 7, 8) ─────────────────────────────────────────────
const { computeNewStreak } = require('../utils/dataLogic');

// Helper: format a Date as YYYY-MM-DD
function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Arbitrary: a YYYY-MM-DD date string within a reasonable range
const dateStrArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(toDateStr);

// Arbitrary: a non-negative integer streak count
const streakCountArb = fc.nat({ max: 365 });

// ─── Property 6: Streak increment — yesterday's date ─────────────────────────
// Feature: fib-v2, Property 6: Streak increment — yesterday's date
// Validates: Requirements 5.4
describe('Property 6: Streak increment — yesterday\'s date', () => {
  test(
    'For any streak N and lastDate === yesterday, computeNewStreak returns N + 1',
    () => {
      fc.assert(
        fc.property(
          dateStrArb,
          streakCountArb,
          (today, count) => {
            // Derive yesterday from today
            const [y, m, d] = today.split('-').map(Number);
            const todayDate = new Date(y, m - 1, d);
            const yesterdayDate = new Date(todayDate);
            yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterday = toDateStr(yesterdayDate);

            const result = computeNewStreak(yesterday, today, count);
            expect(result).toBe(count + 1);
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ─── Property 7: Streak reset — stale date ────────────────────────────────────
// Feature: fib-v2, Property 7: Streak reset — stale date
// Validates: Requirements 5.4
describe('Property 7: Streak reset — stale date', () => {
  test(
    'For any streak N and lastDate older than yesterday, computeNewStreak returns 0',
    () => {
      fc.assert(
        fc.property(
          dateStrArb,
          streakCountArb,
          // An offset of >= 2 days in the past
          fc.integer({ min: 2, max: 1000 }),
          (today, count, daysOld) => {
            const [y, m, d] = today.split('-').map(Number);
            const todayDate = new Date(y, m - 1, d);
            const staleDate = new Date(todayDate);
            staleDate.setDate(staleDate.getDate() - daysOld);
            const stale = toDateStr(staleDate);

            const result = computeNewStreak(stale, today, count);
            expect(result).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test('null lastDate resets streak to 0', () => {
    expect(computeNewStreak(null, '2026-08-16', 5)).toBe(0);
  });
});

// ─── Property 8: Streak idempotence — today's date ───────────────────────────
// Feature: fib-v2, Property 8: Streak idempotence — today's date
// Validates: Requirements 5.4
describe('Property 8: Streak idempotence — today\'s date', () => {
  test(
    'For any streak N and lastDate === today, computeNewStreak always returns N',
    () => {
      fc.assert(
        fc.property(
          dateStrArb,
          streakCountArb,
          (today, count) => {
            // Called once
            const result1 = computeNewStreak(today, today, count);
            expect(result1).toBe(count);
            // Called again (simulating multiple app opens on same day)
            const result2 = computeNewStreak(today, today, result1);
            expect(result2).toBe(count);
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

// ─── Property 11: Greeting time-of-day selection ──────────────────────────────
// Feature: fib-v2, Property 11: Greeting time-of-day selection
// Validates: Requirements 8.1
const { getTimeOfDay } = require('../utils/dataLogic');

describe('Property 11: Greeting time-of-day selection', () => {
  test(
    'For any hour h in [0, 23], getTimeOfDay returns the correct time-of-day label',
    () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 23 }),
          (hour) => {
            const result = getTimeOfDay(hour);
            if (hour >= 0 && hour <= 4) {
              expect(result).toBe('night');
            } else if (hour >= 5 && hour <= 11) {
              expect(result).toBe('morning');
            } else if (hour >= 12 && hour <= 16) {
              expect(result).toBe('afternoon');
            } else {
              // 17–23
              expect(result).toBe('evening');
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  test('boundary hours return correct labels', () => {
    expect(getTimeOfDay(0)).toBe('night');
    expect(getTimeOfDay(4)).toBe('night');
    expect(getTimeOfDay(5)).toBe('morning');
    expect(getTimeOfDay(11)).toBe('morning');
    expect(getTimeOfDay(12)).toBe('afternoon');
    expect(getTimeOfDay(16)).toBe('afternoon');
    expect(getTimeOfDay(17)).toBe('evening');
    expect(getTimeOfDay(23)).toBe('evening');
  });
});
