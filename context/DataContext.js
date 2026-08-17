import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { applyUpdateExpense, applyDeleteSavingsGoal, computeBudgetStatus, computeNewStreak } from '../utils/dataLogic';
import { initDB, getMeta, setMeta, runMigrationIfNeeded } from '../utils/db';
import { DEFAULT_CATEGORIES } from '../constants/categories';

const MAX_CATEGORIES = 20;

const WIDGET_BALANCE_KEY = 'fibWidgetBalance';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// ─── Widget balance helper ────────────────────────────────────────────────────
async function _writeWidgetBalance(newBalance) {
  try {
    await AsyncStorage.setItem(WIDGET_BALANCE_KEY, JSON.stringify(newBalance));
  } catch (err) {
    console.error('[FiB] Failed to write widget balance:', err);
  }
}

export const DataProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [emergencySavings, setEmergencySavings] = useState(0);
  const [goalSavings, setGoalSavings] = useState([]);
  const [incomeFlows, setIncomeFlows] = useState([]);
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [streak, setStreak] = useState(0);
  const [notifDenied, setNotifDenied] = useState(false);
  const [userName, setUserName] = useState('');
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // SQLite database instance — initialised once on mount
  const dbRef = useRef(null);

  useEffect(() => {
    async function init() {
      const db = initDB();
      dbRef.current = db;
      await runMigrationIfNeeded(db);
      loadData(db);
      checkAndAutoAddIncome();
      await setupNotifications(db);
    }
    init();
  }, []);

  // ─── Notification setup — Task 9.1 ─────────────────────────────────────────
  // Requirements: 5.1, 5.2
  const setupNotifications = async (db) => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        const bannerDismissed = getMeta(db, 'notif_banner_dismissed');
        if (bannerDismissed !== '1') {
          setNotifDenied(true);
        }
        return;
      }
      const existingId = getMeta(db, 'notification_id');
      if (existingId) return;
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "FiB — Time to log! 🐱",
          body: "Keep your streak alive. Log today's expenses now.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });
      setMeta(db, 'notification_id', id);
    } catch (err) {
      console.error('[FiB] Notification setup failed:', err);
    }
  };

  // ─── Task 3.1: Load all tables from SQLite into React state ───────────────
  // Requirements: 1.4
  const loadData = (db) => {
    try {
      const expensesRows = db.getAllSync('SELECT * FROM expenses', []);
      const savingsRows = db.getAllSync('SELECT * FROM savings', []);
      const goalsRows = db.getAllSync('SELECT * FROM savings_goals', []);
      const incomeFlowsRows = db.getAllSync('SELECT * FROM income_flows', []);

      // balance_history has no dedicated table — we store balance + emergency in meta
      const balanceMeta = getMeta(db, 'balance');
      const emergencyMeta = getMeta(db, 'emergency_savings');
      const balanceHistoryRaw = getMeta(db, 'balance_history');

      // Load custom categories and merge with DEFAULT_CATEGORIES
      const customCatsRaw = getMeta(db, 'custom_categories');
      const customCats = customCatsRaw ? JSON.parse(customCatsRaw) : [];
      setCategories([...DEFAULT_CATEGORIES, ...customCats]);

      // Load display name — Requirements: 8.1
      const storedName = getMeta(db, 'user_name');
      setUserName(storedName ?? '');

      // Load onboarding state — Requirements: 6.1, 6.2
      const onboardingDone = getMeta(db, 'onboarding_complete');
      setOnboardingComplete(onboardingDone === '1');

      setExpenses(expensesRows.map(_rowToExpense));
      setSavings(savingsRows.map(_rowToSaving));
      setSavingsGoals(goalsRows.map(_rowToGoal));
      setIncomeFlows(incomeFlowsRows.map(_rowToIncomeFlow));
      setBalance(balanceMeta !== null ? parseFloat(balanceMeta) : 0);
      setEmergencySavings(emergencyMeta !== null ? parseFloat(emergencyMeta) : 0);
      setBalanceHistory(balanceHistoryRaw ? JSON.parse(balanceHistoryRaw) : []);
    } catch (error) {
      console.error('[FiB] Error loading data from SQLite:', error);
    }
  };

  // ─── Row mappers ──────────────────────────────────────────────────────────

  const _rowToExpense = (row) => ({
    id: row.id,
    title: row.title,
    amount: row.amount,
    category: row.category,
    date: row.date,
    split: !!row.split,
    splitWith: row.split_with,
    isRecurring: !!row.is_recurring,
  });

  const _rowToSaving = (row) => ({
    id: row.id,
    title: row.title,
    amount: row.amount,
    date: row.date,
    goalId: row.goal_id,
  });

  const _rowToGoal = (row) => ({
    id: row.id,
    name: row.name,
    target: row.target,
    current: row.current,
  });

  const _rowToIncomeFlow = (row) => ({
    id: row.id,
    source: row.source,
    amount: row.amount,
    expectedDate: row.expected_date,
    recurring: !!row.recurring,
    frequency: row.frequency,
    autoAdd: !!row.auto_add,
    completed: !!row.completed,
    savingsAlloc: row.savings_alloc,
    spendAlloc: row.spend_alloc,
  });

  // ─── Expense mutations (SQLite-backed) — Task 3.2 (already done) ─────────

  const addExpense = (expense) => {
    const db = dbRef.current;
    const id = Date.now().toString();
    const newExpense = { ...expense, id };
    const newBalance = balance - expense.amount;

    db.runSync(
      `INSERT INTO expenses (id, title, amount, category, date, split, split_with, is_recurring)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        expense.title ?? '',
        expense.amount,
        expense.category ?? '',
        expense.date ?? new Date().toISOString(),
        expense.split ? 1 : 0,
        expense.splitWith ?? null,
        expense.isRecurring ? 1 : 0,
      ],
    );
    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance', String(newBalance)]);

    setExpenses(prev => [...prev, newExpense]);
    setBalance(newBalance);
    _writeWidgetBalance(newBalance);

    // Update streak whenever an expense is logged — Requirements: 5.4
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const lastDate = getMeta(db, 'last_logged_date');
    const countRaw = getMeta(db, 'streak_count');
    const currentCount = countRaw !== null ? parseInt(countRaw, 10) : 0;
    const newCount = computeNewStreak(lastDate, todayStr, currentCount);
    setMeta(db, 'last_logged_date', todayStr);
    setMeta(db, 'streak_count', String(newCount));
    setStreak(newCount);
  };

  const updateExpense = (id, updatedExpense) => {
    const db = dbRef.current;
    const { expenses: newExpenses, balance: newBalance } = applyUpdateExpense(expenses, balance, id, updatedExpense);

    db.runSync(
      `UPDATE expenses SET title = ?, amount = ?, category = ?, date = ?, split = ?, split_with = ?, is_recurring = ?
       WHERE id = ?`,
      [
        updatedExpense.title ?? '',
        updatedExpense.amount,
        updatedExpense.category ?? '',
        updatedExpense.date ?? new Date().toISOString(),
        updatedExpense.split ? 1 : 0,
        updatedExpense.splitWith ?? null,
        updatedExpense.isRecurring ? 1 : 0,
        id,
      ],
    );
    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance', String(newBalance)]);

    setExpenses(newExpenses);
    setBalance(newBalance);
    _writeWidgetBalance(newBalance);
  };

  const deleteExpense = (id) => {
    const db = dbRef.current;
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    const newExpenses = expenses.filter(e => e.id !== id);
    const newBalance = balance + expense.amount;

    db.runSync('DELETE FROM expenses WHERE id = ?', [id]);
    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance', String(newBalance)]);

    setExpenses(newExpenses);
    setBalance(newBalance);
    _writeWidgetBalance(newBalance);
  };

  // ─── Savings mutations — Task 3.3 ─────────────────────────────────────────
  // Requirements: 1.4

  const addSaving = (saving) => {
    const db = dbRef.current;
    const id = Date.now().toString();
    const newSaving = { ...saving, id };
    const newBalance = balance - saving.amount;

    db.runSync(
      `INSERT INTO savings (id, title, amount, date, goal_id) VALUES (?, ?, ?, ?, ?)`,
      [id, saving.title ?? '', saving.amount, saving.date ?? new Date().toISOString(), saving.goalId ?? null],
    );
    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance', String(newBalance)]);

    if (saving.goalId) {
      const newGoals = savingsGoals.map(g =>
        g.id === saving.goalId ? { ...g, current: g.current + saving.amount } : g
      );
      db.runSync(
        `UPDATE savings_goals SET current = current + ? WHERE id = ?`,
        [saving.amount, saving.goalId],
      );
      setSavingsGoals(newGoals);
    }

    setSavings(prev => [...prev, newSaving]);
    setBalance(newBalance);
    _writeWidgetBalance(newBalance);
  };

  const deleteSaving = (id) => {
    const db = dbRef.current;
    const saving = savings.find(s => s.id === id);
    if (!saving) return;
    const newSavings = savings.filter(s => s.id !== id);
    const newBalance = balance + saving.amount;

    db.runSync('DELETE FROM savings WHERE id = ?', [id]);
    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance', String(newBalance)]);

    if (saving.goalId) {
      const newGoals = savingsGoals.map(g =>
        g.id === saving.goalId
          ? { ...g, current: Math.max(0, g.current - saving.amount) }
          : g
      );
      db.runSync(
        `UPDATE savings_goals SET current = MAX(0, current - ?) WHERE id = ?`,
        [saving.amount, saving.goalId],
      );
      setSavingsGoals(newGoals);
    }

    setSavings(newSavings);
    setBalance(newBalance);
    _writeWidgetBalance(newBalance);
  };

  const createSavingsGoal = (goal) => {
    const db = dbRef.current;
    const id = Date.now().toString();
    const newGoal = { ...goal, id, current: 0 };

    db.runSync(
      `INSERT INTO savings_goals (id, name, target, current) VALUES (?, ?, ?, ?)`,
      [id, goal.name ?? '', goal.target ?? 0, 0],
    );

    setSavingsGoals(prev => [...prev, newGoal]);
  };

  const deleteSavingsGoal = (id) => {
    const db = dbRef.current;
    // Use pure logic from dataLogic.js to compute next state
    const { savingsGoals: newGoals, savings: newSavings, balance: newBalance } =
      applyDeleteSavingsGoal(savingsGoals, savings, balance, id);

    // Delete orphaned savings from DB
    db.runSync('DELETE FROM savings WHERE goal_id = ?', [id]);
    db.runSync('DELETE FROM savings_goals WHERE id = ?', [id]);
    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance', String(newBalance)]);

    setSavingsGoals(newGoals);
    setSavings(newSavings);
    setBalance(newBalance);
    _writeWidgetBalance(newBalance);
  };

  // ─── Balance / income mutations — Task 3.4 ────────────────────────────────
  // Requirements: 1.4

  const addBalance = (amount, title = 'Balance Added') => {
    const db = dbRef.current;
    const newBalance = balance + amount;
    const newEntry = {
      id: Date.now().toString(),
      title,
      amount,
      date: new Date().toISOString(),
    };
    const newHistory = [...balanceHistory, newEntry];

    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance', String(newBalance)]);
    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance_history', JSON.stringify(newHistory)]);

    setBalance(newBalance);
    setBalanceHistory(newHistory);
    _writeWidgetBalance(newBalance);
  };

  const deleteBalanceHistory = (id) => {
    const db = dbRef.current;
    const item = balanceHistory.find(b => b.id === id);
    if (!item) return;
    const newHistory = balanceHistory.filter(b => b.id !== id);
    const newBalance = balance - item.amount;

    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance', String(newBalance)]);
    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance_history', JSON.stringify(newHistory)]);

    setBalance(newBalance);
    setBalanceHistory(newHistory);
    _writeWidgetBalance(newBalance);
  };

  const updateEmergencySavings = (amount) => {
    const db = dbRef.current;
    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['emergency_savings', String(amount)]);
    setEmergencySavings(amount);
  };

  const addGoalSaving = (goal) => {
    const newGoals = [...goalSavings, { ...goal, id: Date.now(), current: 0 }];
    setGoalSavings(newGoals);
  };

  const updateGoalSaving = (id, amount) => {
    const newGoals = goalSavings.map(g =>
      g.id === id ? { ...g, current: g.current + amount } : g
    );
    setGoalSavings(newGoals);
  };

  const addIncomeFlow = (flow) => {
    const db = dbRef.current;
    const id = Date.now().toString();
    const newFlow = { ...flow, id };

    db.runSync(
      `INSERT INTO income_flows
       (id, source, amount, expected_date, recurring, frequency, auto_add, completed, savings_alloc, spend_alloc)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        flow.source ?? '',
        flow.amount ?? 0,
        flow.expectedDate ?? null,
        flow.recurring ? 1 : 0,
        flow.frequency ?? null,
        flow.autoAdd ? 1 : 0,
        flow.completed ? 1 : 0,
        flow.savingsAlloc ?? 0,
        flow.spendAlloc ?? 0,
      ],
    );

    setIncomeFlows(prev => [...prev, newFlow]);
  };

  const deleteIncomeFlow = (id) => {
    const db = dbRef.current;
    db.runSync('DELETE FROM income_flows WHERE id = ?', [id]);
    setIncomeFlows(prev => prev.filter(f => f.id !== id));
  };

  const updateIncomeFlow = (id, updates) => {
    const db = dbRef.current;
    const newFlows = incomeFlows.map(f => f.id === id ? { ...f, ...updates } : f);
    const updated = newFlows.find(f => f.id === id);
    if (!updated) return;

    db.runSync(
      `UPDATE income_flows
       SET source = ?, amount = ?, expected_date = ?, recurring = ?, frequency = ?,
           auto_add = ?, completed = ?, savings_alloc = ?, spend_alloc = ?
       WHERE id = ?`,
      [
        updated.source ?? '',
        updated.amount ?? 0,
        updated.expectedDate ?? null,
        updated.recurring ? 1 : 0,
        updated.frequency ?? null,
        updated.autoAdd ? 1 : 0,
        updated.completed ? 1 : 0,
        updated.savingsAlloc ?? 0,
        updated.spendAlloc ?? 0,
        id,
      ],
    );

    setIncomeFlows(newFlows);
  };

  // ─── Custom category management — Task 4.2 ────────────────────────────────
  // Requirements: 2.2, 2.4, 2.5
  const addCustomCategory = (label) => {
    const db = dbRef.current;
    const trimmed = label?.trim();
    if (!trimmed) return { success: false, error: 'Label cannot be empty' };

    if (categories.length >= MAX_CATEGORIES) {
      return { success: false, error: 'Maximum of 20 categories reached' };
    }

    const id = `custom_${Date.now()}`;
    const newCat = { id, label: trimmed, icon: 'pricetag-outline' };

    // Only persist custom (non-default) categories
    const existingCustom = categories.filter(
      c => !DEFAULT_CATEGORIES.some(d => d.id === c.id)
    );
    const updatedCustom = [...existingCustom, newCat];

    setMeta(db, 'custom_categories', JSON.stringify(updatedCustom));
    setCategories(prev => [...prev, newCat]);
    return { success: true };
  };

  // ─── Budget methods — Task 5.4 ────────────────────────────────────────────
  // Requirements: 3.1, 3.2, 3.3

  /**
   * Upserts a monthly budget for a category in the current YYYY-MM month.
   * Requirements: 3.1
   */
  const setBudget = (category, monthlyLimit) => {
    const db = dbRef.current;
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const id = `${category}_${month}`;
    db.runSync(
      `INSERT OR REPLACE INTO budgets (id, category, monthly_limit, month) VALUES (?, ?, ?, ?)`,
      [id, category, monthlyLimit, month],
    );
  };

  /**
   * Returns all budget rows for the given YYYY-MM month string.
   * Requirements: 3.2
   */
  const getBudgets = (month) => {
    const db = dbRef.current;
    return db.getAllSync('SELECT * FROM budgets WHERE month = ?', [month]);
  };

  /**
   * Returns an array of BudgetStatus objects for the given month,
   * by joining budgets with expenses grouped by category.
   * Requirements: 3.3
   */
  const getBudgetStatus = (month) => {
    const db = dbRef.current;
    const budgets = db.getAllSync('SELECT * FROM budgets WHERE month = ?', [month]);
    if (budgets.length === 0) return [];

    const expenseRows = db.getAllSync(
      `SELECT category, SUM(amount) as total FROM expenses WHERE date LIKE ? GROUP BY category`,
      [`${month}%`],
    );

    const expensesByCategory = {};
    for (const row of expenseRows) {
      expensesByCategory[row.category] = row.total;
    }

    return computeBudgetStatus(budgets, expensesByCategory);
  };

  // ─── Month totals — Task 6.3 ──────────────────────────────────────────────
  // Requirements: 4.1
  /**
   * Returns a { category → totalAmount } map for all expenses in the given YYYY-MM month.
   */
  const getMonthTotals = (month) => {
    const db = dbRef.current;
    const rows = db.getAllSync(
      `SELECT category, SUM(amount) as total FROM expenses WHERE date LIKE ? GROUP BY category`,
      [`${month}%`],
    );
    const totals = {};
    for (const row of rows) {
      totals[row.category] = row.total;
    }
    return totals;
  };

  // ─── Streak — Task 8.5 ───────────────────────────────────────────────────────
  // Requirements: 5.4
  /**
   * Reads last_logged_date and streak_count from meta, computes the new streak
   * using the pure computeNewStreak helper, persists the result, and updates
   * the streak state.
   */
  const checkAndUpdateStreak = () => {
    const db = dbRef.current;
    if (!db) return;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const lastDate = getMeta(db, 'last_logged_date');
    const countRaw = getMeta(db, 'streak_count');
    const currentCount = countRaw !== null ? parseInt(countRaw, 10) : 0;

    const newCount = computeNewStreak(lastDate, todayStr, currentCount);

    setMeta(db, 'last_logged_date', todayStr);
    setMeta(db, 'streak_count', String(newCount));
    setStreak(newCount);
  };

  // ─── Auto-add income on due date ─────────────────────────────────────────
  /**
   * Called on every app open. Checks all income flows with autoAdd=true
   * whose expectedDate is today or earlier. For each due flow, credits the
   * balance and advances the expectedDate by one frequency period.
   */
  const checkAndAutoAddIncome = () => {
    const db = dbRef.current;
    if (!db) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const flows = db.getAllSync('SELECT * FROM income_flows WHERE auto_add = 1 AND completed = 0', []);

    for (const row of flows) {
      if (!row.expected_date) continue;
      const due = new Date(row.expected_date);
      due.setHours(0, 0, 0, 0);
      if (due > today) continue;

      // Read current balance + history directly from DB
      const balanceRaw = getMeta(db, 'balance');
      const currentBalance = balanceRaw !== null ? parseFloat(balanceRaw) : 0;
      const historyRaw = getMeta(db, 'balance_history');
      const currentHistory = historyRaw ? JSON.parse(historyRaw) : [];

      const newBalance = currentBalance + row.amount;
      const entry = {
        id: Date.now().toString() + row.id,
        title: row.source || 'Income',
        amount: row.amount,
        date: new Date().toISOString(),
      };
      const newHistory = [...currentHistory, entry];

      db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance', String(newBalance)]);
      db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance_history', JSON.stringify(newHistory)]);

      // Advance expectedDate by one period
      const next = new Date(due);
      switch (row.frequency) {
        case 'Weekly': next.setDate(next.getDate() + 7); break;
        case 'Bi-weekly': next.setDate(next.getDate() + 14); break;
        case 'Monthly':
        default: next.setMonth(next.getMonth() + 1); break;
      }

      db.runSync('UPDATE income_flows SET expected_date = ? WHERE id = ?', [next.toISOString(), row.id]);
    }

    // Reload state after all credits applied
    const finalBalance = getMeta(db, 'balance');
    const finalHistory = getMeta(db, 'balance_history');
    if (finalBalance !== null) {
      setBalance(parseFloat(finalBalance));
      _writeWidgetBalance(parseFloat(finalBalance));
    }
    if (finalHistory) setBalanceHistory(JSON.parse(finalHistory));
    setIncomeFlows(db.getAllSync('SELECT * FROM income_flows', []).map(_rowToIncomeFlow));
  };

  // ─── Onboarding completion — Requirements: 6.1, 6.2 ─────────────────────
  /**
   * Called by OnboardingScreen when the user taps Done on Step 2.
   * Updates in-memory state so App.js can switch to the main tab navigator.
   * The meta('onboarding_complete','1') write is done in OnboardingScreen
   * before calling this method.
   */
  const completeOnboarding = () => {
    setOnboardingComplete(true);
    // Also refresh userName in case it was set during onboarding
    const db = dbRef.current;
    if (db) {
      const storedName = getMeta(db, 'user_name');
      setUserName(storedName ?? '');
    }
  };

  // ─── Dismiss notification denied banner — Task 9.2 ───────────────────────
  // Requirements: 5.3
  const dismissNotifBanner = () => {
    const db = dbRef.current;
    if (!db) return;
    setMeta(db, 'notif_banner_dismissed', '1');
    setNotifDenied(false);
  };

  // Expose the raw DB reference for consumers that need direct meta access
  const getDB = () => dbRef.current;

  return (
    <DataContext.Provider value={{
      expenses,
      savings,
      savingsGoals,
      balance,
      emergencySavings,
      goalSavings,
      incomeFlows,
      balanceHistory,
      categories,
      streak,
      notifDenied,
      userName,
      addExpense,
      updateExpense,
      deleteExpense,
      addSaving,
      deleteSaving,
      createSavingsGoal,
      deleteSavingsGoal,
      addBalance,
      deleteBalanceHistory,
      updateEmergencySavings,
      addGoalSaving,
      updateGoalSaving,
      addIncomeFlow,
      updateIncomeFlow,
      deleteIncomeFlow,
      addCustomCategory,
      setBudget,
      getBudgets,
      getBudgetStatus,
      getMonthTotals,
      checkAndUpdateStreak,
      dismissNotifBanner,
      onboardingComplete,
      completeOnboarding,
      checkAndAutoAddIncome,
      getDB,
    }}>
      {children}
    </DataContext.Provider>
  );
};
