/**
 * Pure-logic tests for DataContext operations.
 * We extract the business logic as pure functions so they can be tested
 * without React hooks or AsyncStorage.
 */
const fc = require('fast-check');
const { validatePersistedData, applyUpdateExpense, applyDeleteSavingsGoal } = require('../utils/dataLogic');

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const amountArb = fc.double({ min: 0.01, max: 10_000_000, noNaN: true });
const idArb = fc.string({ minLength: 1, maxLength: 10 });

const expenseArb = fc.record({
  id:       idArb,
  title:    fc.string(),
  amount:   amountArb,
  category: fc.constantFrom('Food', 'Transport', 'Books', 'Others'),
  date:     fc.constant(new Date().toISOString()),
  split:    fc.constant(0),
});

const savingArb = (goalId) => fc.record({
  id:     idArb,
  title:  fc.string(),
  amount: amountArb,
  date:   fc.constant(new Date().toISOString()),
  goalId: fc.constant(goalId),
});

const goalArb = fc.record({
  id:      idArb,
  name:    fc.string({ minLength: 1 }),
  target:  fc.option(amountArb, { nil: null }),
  current: amountArb,
});

// ─── Property 5 ───────────────────────────────────────────────────────────────
// Feature: fib-redesign, Property 5: updateExpense preserves total balance
// Validates: Requirements 3.2
describe('updateExpense balance invariant', () => {
  test('Property 5: new balance = old balance + old amount - new amount', () => {
    fc.assert(
      fc.property(
        expenseArb,
        amountArb,
        amountArb,
        (expense, startBalance, newAmount) => {
          const expenses = [expense];
          const result = applyUpdateExpense(expenses, startBalance, expense.id, {
            ...expense,
            amount: newAmount,
          });
          const expected = startBalance + expense.amount - newAmount;
          expect(result.balance).toBeCloseTo(expected, 8);
          expect(result.expenses[0].amount).toBe(newAmount);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Property 5: updating with the same amount leaves balance unchanged', () => {
    fc.assert(
      fc.property(expenseArb, amountArb, (expense, startBalance) => {
        const result = applyUpdateExpense([expense], startBalance, expense.id, expense);
        expect(result.balance).toBeCloseTo(startBalance, 8);
      }),
      { numRuns: 100 }
    );
  });

  test('Property 5: updating a non-existent id is a no-op', () => {
    fc.assert(
      fc.property(expenseArb, amountArb, (expense, startBalance) => {
        const result = applyUpdateExpense([expense], startBalance, 'non-existent-id', expense);
        expect(result.balance).toBe(startBalance);
        expect(result.expenses).toEqual([expense]);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 6 ───────────────────────────────────────────────────────────────
// Feature: fib-redesign, Property 6: deleteSavingsGoal removes orphaned savings
// Validates: Requirements 3.3
describe('deleteSavingsGoal orphan removal', () => {
  test('Property 6: no savings with deleted goalId remain after delete', () => {
    fc.assert(
      fc.property(
        goalArb,
        fc.array(amountArb, { minLength: 0, maxLength: 10 }),
        amountArb,
        (goal, savingAmounts, startBalance) => {
          const goalSavings = savingAmounts.map((amount, i) => ({
            id: `s${i}`,
            title: 'test',
            amount,
            date: new Date().toISOString(),
            goalId: goal.id,
          }));
          // Add some unrelated savings too
          const otherSaving = { id: 'other', title: 'other', amount: 50, date: new Date().toISOString(), goalId: 'other-goal' };
          const allSavings = [...goalSavings, otherSaving];

          const result = applyDeleteSavingsGoal([goal], allSavings, startBalance, goal.id);

          // No orphaned savings remain
          const remaining = result.savings.filter(s => s.goalId === goal.id);
          expect(remaining).toHaveLength(0);
          // Unrelated saving is untouched
          expect(result.savings).toContainEqual(otherSaving);
          // Goal is removed
          expect(result.savingsGoals).toHaveLength(0);
        }
      ),
      { numRuns: 200 }
    );
  });
});

// ─── Property 7 ───────────────────────────────────────────────────────────────
// Feature: fib-redesign, Property 7: deleteSavingsGoal restores balance for orphaned savings
// Validates: Requirements 3.3
describe('deleteSavingsGoal balance restoration', () => {
  test('Property 7: balance increases by sum of orphaned savings amounts', () => {
    fc.assert(
      fc.property(
        goalArb,
        fc.array(amountArb, { minLength: 1, maxLength: 10 }),
        amountArb,
        (goal, savingAmounts, startBalance) => {
          const goalSavings = savingAmounts.map((amount, i) => ({
            id: `s${i}`,
            title: 'test',
            amount,
            date: new Date().toISOString(),
            goalId: goal.id,
          }));
          const expectedDelta = savingAmounts.reduce((a, b) => a + b, 0);
          const result = applyDeleteSavingsGoal([goal], goalSavings, startBalance, goal.id);
          expect(result.balance).toBeCloseTo(startBalance + expectedDelta, 6);
        }
      ),
      { numRuns: 200 }
    );
  });

  test('Property 7: deleting a goal with no savings leaves balance unchanged', () => {
    fc.assert(
      fc.property(goalArb, amountArb, (goal, startBalance) => {
        const result = applyDeleteSavingsGoal([goal], [], startBalance, goal.id);
        expect(result.balance).toBe(startBalance);
      }),
      { numRuns: 100 }
    );
  });
});

// ─── Property 8 ───────────────────────────────────────────────────────────────
// Feature: fib-redesign, Property 8: persistData round-trip
// Validates: Requirements 3.4, 5.3
describe('_validatePersistedData round-trip', () => {
  const validPayloadArb = fc.record({
    expenses:         fc.array(fc.record({ id: idArb, title: fc.string(), amount: amountArb, category: fc.string(), date: fc.string(), split: fc.constant(0) })),
    savings:          fc.array(fc.record({ id: idArb, title: fc.string(), amount: amountArb, date: fc.string(), goalId: fc.option(idArb, { nil: null }) })),
    savingsGoals:     fc.array(fc.record({ id: idArb, name: fc.string(), target: fc.option(amountArb, { nil: null }), current: amountArb })),
    balance:          amountArb,
    emergencySavings: amountArb,
    goalSavings:      fc.array(fc.object()),
    incomeFlows:      fc.array(fc.object()),
    balanceHistory:   fc.array(fc.record({ id: idArb, title: fc.string(), amount: amountArb, date: fc.string() })),
  });

  test('Property 8: valid payload survives JSON serialization round-trip', () => {
    fc.assert(
      fc.property(validPayloadArb, (payload) => {
        const serialized = JSON.stringify(payload);
        const parsed = JSON.parse(serialized);
        const validated = validatePersistedData(parsed);

        // All arrays remain arrays
        expect(Array.isArray(validated.expenses)).toBe(true);
        expect(Array.isArray(validated.savings)).toBe(true);
        expect(Array.isArray(validated.savingsGoals)).toBe(true);
        expect(Array.isArray(validated.goalSavings)).toBe(true);
        expect(Array.isArray(validated.incomeFlows)).toBe(true);
        expect(Array.isArray(validated.balanceHistory)).toBe(true);
        // Numeric fields remain numeric
        expect(typeof validated.balance).toBe('number');
        expect(typeof validated.emergencySavings).toBe('number');
      }),
      { numRuns: 200 }
    );
  });

  test('Property 8: malformed/missing fields produce safe defaults', () => {
    const malformedCases = [
      null,
      undefined,
      {},
      { expenses: 'not-an-array' },
      { balance: 'NaN', expenses: null },
      { balance: Infinity },
    ];
    for (const bad of malformedCases) {
      const result = validatePersistedData(bad);
      expect(Array.isArray(result.expenses)).toBe(true);
      expect(Array.isArray(result.savings)).toBe(true);
      expect(typeof result.balance).toBe('number');
    }
  });
});
