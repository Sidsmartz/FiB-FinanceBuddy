/**
 * Pure business logic extracted from DataContext so it can be unit/property
 * tested without React or AsyncStorage. Requirements: 3.2, 3.3, 3.4
 */

// ─── Shape validation ─────────────────────────────────────────────────────────

/**
 * Validates the parsed JSON from AsyncStorage and fills any missing / malformed
 * keys with empty defaults. Requirements: 3.4, 5.3
 * @param {any} parsed
 * @returns {object}
 */
export function validatePersistedData(parsed) {
  const isArr = (v) => Array.isArray(v);
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

  return {
    expenses:         isArr(parsed?.expenses)          ? parsed.expenses         : [],
    savings:          isArr(parsed?.savings)            ? parsed.savings          : [],
    savingsGoals:     isArr(parsed?.savingsGoals)       ? parsed.savingsGoals     : [],
    balance:          isNum(parsed?.balance)            ? parsed.balance          : 0,
    emergencySavings: isNum(parsed?.emergencySavings)   ? parsed.emergencySavings : 0,
    goalSavings:      isArr(parsed?.goalSavings)        ? parsed.goalSavings      : [],
    incomeFlows:      isArr(parsed?.incomeFlows)        ? parsed.incomeFlows      : [],
    balanceHistory:   isArr(parsed?.balanceHistory)     ? parsed.balanceHistory   : [],
  };
}

// ─── Balance mutations (pure) ─────────────────────────────────────────────────

/**
 * Returns updated expenses list and new balance after editing an expense.
 * newBalance = oldBalance + oldAmount - newAmount.  Requirements: 3.2
 */
export function applyUpdateExpense(expenses, balance, id, updatedExpense) {
  const oldExpense = expenses.find(e => e.id === id);
  if (!oldExpense) return { expenses, balance };
  const newExpenses = expenses.map(e => e.id === id ? { ...updatedExpense, id } : e);
  const newBalance = balance + oldExpense.amount - updatedExpense.amount;
  return { expenses: newExpenses, balance: newBalance };
}

/**
 * Deletes a goal and all orphaned savings that referenced it,
 * returning the corrected balance.  Requirements: 3.3
 */
export function applyDeleteSavingsGoal(savingsGoals, savings, balance, id) {
  const newGoals = savingsGoals.filter(g => g.id !== id);
  const orphaned = savings.filter(s => s.goalId === id);
  const orphanTotal = orphaned.reduce((sum, s) => sum + s.amount, 0);
  const newSavings = savings.filter(s => s.goalId !== id);
  const newBalance = balance + orphanTotal;
  return { savingsGoals: newGoals, savings: newSavings, balance: newBalance };
}
