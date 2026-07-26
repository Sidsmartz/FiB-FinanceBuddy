/**
 * Property tests for Quick-Log logic.
 * We test the pure data transformations that addExpense performs.
 */
const fc = require('fast-check');
const { validateAmount } = require('../utils/validation');
const { CATEGORIES } = require('../constants/categories');

// ─── Pure quick-log logic (mirrors DataContext.addExpense) ────────────────────

function quickLog(expenses, balance, amount, category) {
  const newExpense = {
    id: Date.now().toString(),
    title: `${category} expense`,
    amount,
    category,
    split: 0,
    date: new Date().toISOString(),
  };
  return {
    expenses: [...expenses, newExpense],
    balance: balance - amount,
  };
}

function quickLogAttempt(expenses, balance, amountStr, category) {
  if (!validateAmount(amountStr) || !category) {
    return { expenses, balance, rejected: true };
  }
  const result = quickLog(expenses, balance, parseFloat(amountStr), category);
  return { ...result, rejected: false };
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const validAmountArb = fc.double({ min: 0.01, max: 10_000_000, noNaN: true })
  .map(n => String(n));

const categoryArb = fc.constantFrom(...CATEGORIES);

const expenseArb = fc.record({
  id:       fc.string({ minLength: 1 }),
  title:    fc.string(),
  amount:   fc.double({ min: 0.01, max: 10_000_000, noNaN: true }),
  category: categoryArb,
  date:     fc.constant(new Date().toISOString()),
  split:    fc.constant(0),
});

const invalidAmountArb = fc.oneof(
  fc.constant(''),
  fc.constant('0'),
  fc.constant('-1'),
  fc.constant('abc'),
  fc.constant('NaN'),
  fc.constant('Infinity'),
  fc.double({ min: -10_000_000, max: 0, noNaN: true }).map(String),
  fc.double({ min: 10_000_001, max: Number.MAX_SAFE_INTEGER, noNaN: true }).map(String),
);

// ─── Property 1 ───────────────────────────────────────────────────────────────
// Feature: fib-redesign, Property 1: Quick-log grows expense list by exactly one
// Validates: Requirements 1.1, 1.2, 1.3
describe('Quick-Log grows expense list by exactly one', () => {
  test('Property 1: valid quick-log adds exactly one expense', () => {
    fc.assert(
      fc.property(
        fc.array(expenseArb, { maxLength: 20 }),
        validAmountArb,
        categoryArb,
        fc.double({ min: 0, max: 100_000, noNaN: true }),
        (existingExpenses, amountStr, category, balance) => {
          const before = existingExpenses.length;
          const result = quickLogAttempt(existingExpenses, balance, amountStr, category);
          expect(result.rejected).toBe(false);
          expect(result.expenses.length).toBe(before + 1);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Property 1: new expense has correct category and auto-generated title', () => {
    fc.assert(
      fc.property(validAmountArb, categoryArb, (amountStr, category) => {
        const result = quickLog([], 1000, parseFloat(amountStr), category);
        const added = result.expenses[0];
        expect(added.category).toBe(category);
        expect(added.title).toBe(`${category} expense`);
      }),
      { numRuns: 200 }
    );
  });
});

// ─── Property 2 ───────────────────────────────────────────────────────────────
// Feature: fib-redesign, Property 2: Quick-log deducts from balance
// Validates: Requirements 1.3
describe('Quick-Log deducts from balance', () => {
  test('Property 2: balance after quick-log = balance before - amount', () => {
    fc.assert(
      fc.property(
        validAmountArb,
        categoryArb,
        fc.double({ min: 0, max: 1_000_000, noNaN: true }),
        (amountStr, category, balance) => {
          const amount = parseFloat(amountStr);
          const result = quickLog([], balance, amount, category);
          expect(result.balance).toBeCloseTo(balance - amount, 6);
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ─── Property 3 ───────────────────────────────────────────────────────────────
// Feature: fib-redesign, Property 3: Invalid amount is rejected without side effects
// Validates: Requirements 1.4, 5.1
describe('Invalid amount is rejected without side effects', () => {
  test('Property 3: invalid amounts leave expenses and balance unchanged', () => {
    fc.assert(
      fc.property(
        fc.array(expenseArb, { maxLength: 20 }),
        invalidAmountArb,
        categoryArb,
        fc.double({ min: 0, max: 100_000, noNaN: true }),
        (existingExpenses, badAmount, category, balance) => {
          const result = quickLogAttempt(existingExpenses, balance, badAmount, category);
          expect(result.rejected).toBe(true);
          expect(result.expenses).toEqual(existingExpenses);
          expect(result.balance).toBe(balance);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Property 3: empty category leaves expenses and balance unchanged', () => {
    fc.assert(
      fc.property(
        fc.array(expenseArb, { maxLength: 20 }),
        validAmountArb,
        fc.double({ min: 0, max: 100_000, noNaN: true }),
        (existingExpenses, amountStr, balance) => {
          const result = quickLogAttempt(existingExpenses, balance, amountStr, '');
          expect(result.rejected).toBe(true);
          expect(result.expenses).toEqual(existingExpenses);
          expect(result.balance).toBe(balance);
        }
      ),
      { numRuns: 100 }
    );
  });
});
