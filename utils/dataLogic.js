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

// ─── Category helpers (pure) ─────────────────────────────────────────────────

/**
 * Merges DEFAULT_CATEGORIES with an array of custom categories.
 * Deduplicates by id — defaults always win.
 * Requirements: 2.2, 2.4
 * @param {Array} defaultCategories
 * @param {Array} customCategories
 * @returns {Array}
 */
export function mergeCategories(defaultCategories, customCategories) {
  const defaultIds = new Set(defaultCategories.map(c => c.id));
  const dedupedCustom = customCategories.filter(c => !defaultIds.has(c.id));
  return [...defaultCategories, ...dedupedCustom];
}

/**
 * Attempts to add a new custom category to an existing merged list.
 * Returns { success: true, categories } or { success: false, error }.
 * Requirements: 2.4, 2.5
 * @param {Array} currentCategories - merged list (defaults + existing customs)
 * @param {Array} defaultCategories - the fixed default list
 * @param {string} label - new category label
 * @param {number} maxCategories - upper bound (default 20)
 * @returns {{ success: boolean, categories?: Array, error?: string }}
 */
export function applyAddCustomCategory(currentCategories, defaultCategories, label, maxCategories = 20) {
  const trimmed = typeof label === 'string' ? label.trim() : '';
  if (!trimmed) return { success: false, error: 'Label cannot be empty' };

  if (currentCategories.length >= maxCategories) {
    return { success: false, error: `Maximum of ${maxCategories} categories reached` };
  }

  const id = `custom_${trimmed.toLowerCase().replace(/\s+/g, '_')}`;
  const newCat = { id, label: trimmed, icon: 'pricetag-outline' };
  return { success: true, categories: [...currentCategories, newCat] };
}

// ─── Budget helpers (pure) ────────────────────────────────────────────────────

/**
 * Computes BudgetStatus for each budgeted category.
 * Requirements: 3.3
 * @param {Array<{category: string, monthly_limit: number}>} budgets
 * @param {{ [category: string]: number }} expensesByCategory - map of category → total spent
 * @returns {Array<{category: string, limit: number, spent: number, percent: number, isOver: boolean}>}
 */
export function computeBudgetStatus(budgets, expensesByCategory) {
  return budgets.map(budget => {
    const spent = expensesByCategory[budget.category] ?? 0;
    const limit = budget.monthly_limit;
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    return {
      category: budget.category,
      limit,
      spent,
      percent,
      isOver: percent >= 100,
    };
  });
}

/**
 * Returns a colour string based on the budget percent used.
 * Requirements: 3.4
 * @param {number} percent
 * @returns {'green' | 'amber' | 'red'}
 */
export function getBudgetColour(percent) {
  if (percent >= 100) return 'red';
  if (percent >= 80) return 'amber';
  return 'green';
}

// ─── Insight helpers (pure) ───────────────────────────────────────────────────

/**
 * Computes month-over-month spending changes per category.
 * Requirements: 4.1, 4.2, 4.3
 *
 * @param {{ [category: string]: number }} currentTotals  - this month's category → total map
 * @param {{ [category: string]: number }} previousTotals - last month's category → total map
 * @returns {Array<{category: string, current: number, previous: number, delta: number, pct: number}>}
 *   Sorted by Math.abs(delta) descending. pct is Infinity when previous === 0 and current > 0.
 */
export function computeInsights(currentTotals, previousTotals) {
  const allCategories = new Set([
    ...Object.keys(currentTotals),
    ...Object.keys(previousTotals),
  ]);

  const entries = [];
  for (const category of allCategories) {
    const current = currentTotals[category] ?? 0;
    const previous = previousTotals[category] ?? 0;
    const delta = current - previous;
    const pct = previous === 0
      ? (current > 0 ? Infinity : 0)
      : ((current - previous) / previous) * 100;

    entries.push({ category, current, previous, delta, pct });
  }

  // Sort by absolute delta descending (largest change first = primary insight)
  entries.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  return entries;
}

// ─── Streak helpers (pure) ────────────────────────────────────────────────────

/**
 * Computes the new streak count based on the last logged date, today's date,
 * and the current streak count. All dates are YYYY-MM-DD strings.
 * Rules (Requirements: 5.4):
 *   - If lastDate === yesterday → increment by 1
 *   - If lastDate === today     → unchanged (idempotent)
 *   - Otherwise                → reset to 0
 *
 * @param {string | null} lastDate   - last logged date in YYYY-MM-DD, or null
 * @param {string}        today      - today's date in YYYY-MM-DD
 * @param {number}        currentCount
 * @returns {number}
 */
export function computeNewStreak(lastDate, today, currentCount) {
  if (!lastDate) return 0;

  // Compute yesterday from today string
  const todayParts = today.split('-').map(Number);
  const todayDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

  if (lastDate === today) return currentCount;
  if (lastDate === yesterday) return currentCount + 1;
  return 0;
}

/**
 * Returns a time-of-day label based on the hour (0–23).
 * Requirements: 8.1
 * morning: 05–11, afternoon: 12–16, evening: 17–23, night: 00–04
 * @param {number} hour - integer in [0, 23]
 * @returns {'morning' | 'afternoon' | 'evening' | 'night'}
 */
export function getTimeOfDay(hour) {
  if (hour >= 5 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 16) return 'afternoon';
  if (hour >= 17 && hour <= 23) return 'evening';
  return 'night';
}
