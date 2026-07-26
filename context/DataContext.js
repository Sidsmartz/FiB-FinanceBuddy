import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validatePersistedData, applyUpdateExpense, applyDeleteSavingsGoal } from '../utils/dataLogic';

const STORAGE_KEY = 'financeData';
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
  /** Non-null when the last AsyncStorage write failed */
  const [storageError, setStorageError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const validated = validatePersistedData(parsed);
        setExpenses(validated.expenses);
        setSavings(validated.savings);
        setSavingsGoals(validated.savingsGoals);
        setBalance(validated.balance);
        setEmergencySavings(validated.emergencySavings);
        setGoalSavings(validated.goalSavings);
        setIncomeFlows(validated.incomeFlows);
        setBalanceHistory(validated.balanceHistory);
      }
    } catch (error) {
      console.error('[FiB] Error loading data:', error);
    }
  };

  // ─── Core persist helper ───────────────────────────────────────────────────
  /**
   * Assembles the full state payload and writes to AsyncStorage.
   * All mutations MUST go through this. Requirements: 3.2
   */
  const persistData = useCallback(async ({
    expensesData       = expenses,
    savingsData        = savings,
    savingsGoalsData   = savingsGoals,
    balanceData        = balance,
    emergencySavingsData = emergencySavings,
    goalSavingsData    = goalSavings,
    incomeFlowsData    = incomeFlows,
    balanceHistoryData = balanceHistory,
  }) => {
    const payload = {
      expenses:         expensesData,
      savings:          savingsData,
      savingsGoals:     savingsGoalsData,
      balance:          balanceData,
      emergencySavings: emergencySavingsData,
      goalSavings:      goalSavingsData,
      incomeFlows:      incomeFlowsData,
      balanceHistory:   balanceHistoryData,
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setStorageError(null);
    } catch (err) {
      console.error('[FiB] Failed to persist data:', err);
      setStorageError(err.message ?? 'Storage write failed');
    }
    // Keep widget balance in sync on every write
    await _writeWidgetBalance(balanceData);
  }, [expenses, savings, savingsGoals, balance, emergencySavings, goalSavings, incomeFlows, balanceHistory]);

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const addExpense = (expense) => {
    const newExpenses = [...expenses, { ...expense, id: Date.now().toString() }];
    const newBalance = balance - expense.amount;
    setExpenses(newExpenses);
    setBalance(newBalance);
    persistData({ expensesData: newExpenses, balanceData: newBalance });
  };

  const updateExpense = (id, updatedExpense) => {
    const { expenses: newExpenses, balance: newBalance } = applyUpdateExpense(expenses, balance, id, updatedExpense);
    setExpenses(newExpenses);
    setBalance(newBalance);
    persistData({ expensesData: newExpenses, balanceData: newBalance });
  };

  const deleteExpense = (id) => {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;
    const newExpenses = expenses.filter(e => e.id !== id);
    const newBalance = balance + expense.amount;
    setExpenses(newExpenses);
    setBalance(newBalance);
    persistData({ expensesData: newExpenses, balanceData: newBalance });
  };

  const deleteSaving = (id) => {
    const saving = savings.find(s => s.id === id);
    if (!saving) return;
    const newSavings = savings.filter(s => s.id !== id);
    const newBalance = balance + saving.amount;
    setSavings(newSavings);
    setBalance(newBalance);

    if (saving.goalId) {
      const newGoals = savingsGoals.map(g =>
        g.id === saving.goalId
          ? { ...g, current: Math.max(0, g.current - saving.amount) }
          : g
      );
      setSavingsGoals(newGoals);
      persistData({ savingsData: newSavings, savingsGoalsData: newGoals, balanceData: newBalance });
    } else {
      persistData({ savingsData: newSavings, balanceData: newBalance });
    }
  };

  const addSaving = (saving) => {
    const newSavings = [...savings, { ...saving, id: Date.now().toString() }];
    const newBalance = balance - saving.amount;
    setSavings(newSavings);
    setBalance(newBalance);

    if (saving.goalId) {
      const newGoals = savingsGoals.map(g =>
        g.id === saving.goalId ? { ...g, current: g.current + saving.amount } : g
      );
      setSavingsGoals(newGoals);
      persistData({ savingsData: newSavings, savingsGoalsData: newGoals, balanceData: newBalance });
    } else {
      persistData({ savingsData: newSavings, balanceData: newBalance });
    }
  };

  const createSavingsGoal = (goal) => {
    const newGoal = { ...goal, id: Date.now().toString(), current: 0 };
    const newGoals = [...savingsGoals, newGoal];
    setSavingsGoals(newGoals);
    persistData({ savingsGoalsData: newGoals });
  };

  const deleteSavingsGoal = (id) => {
    const { savingsGoals: newGoals, savings: newSavings, balance: newBalance } =
      applyDeleteSavingsGoal(savingsGoals, savings, balance, id);
    setSavingsGoals(newGoals);
    setSavings(newSavings);
    setBalance(newBalance);
    persistData({ savingsGoalsData: newGoals, savingsData: newSavings, balanceData: newBalance });
  };

  const addBalance = (amount, title = 'Balance Added') => {
    const newBalance = balance + amount;
    const newHistory = [...balanceHistory, {
      id: Date.now().toString(),
      title,
      amount,
      date: new Date().toISOString(),
    }];
    setBalance(newBalance);
    setBalanceHistory(newHistory);
    persistData({ balanceData: newBalance, balanceHistoryData: newHistory });
  };

  const deleteBalanceHistory = (id) => {
    const item = balanceHistory.find(b => b.id === id);
    if (!item) return;
    const newHistory = balanceHistory.filter(b => b.id !== id);
    const newBalance = balance - item.amount;
    setBalanceHistory(newHistory);
    setBalance(newBalance);
    persistData({ balanceHistoryData: newHistory, balanceData: newBalance });
  };

  const updateEmergencySavings = (amount) => {
    setEmergencySavings(amount);
    persistData({ emergencySavingsData: amount });
  };

  const addGoalSaving = (goal) => {
    const newGoals = [...goalSavings, { ...goal, id: Date.now(), current: 0 }];
    setGoalSavings(newGoals);
    persistData({ goalSavingsData: newGoals });
  };

  const updateGoalSaving = (id, amount) => {
    const newGoals = goalSavings.map(g =>
      g.id === id ? { ...g, current: g.current + amount } : g
    );
    setGoalSavings(newGoals);
    persistData({ goalSavingsData: newGoals });
  };

  const addIncomeFlow = (flow) => {
    const newFlows = [...incomeFlows, { ...flow, id: Date.now() }];
    setIncomeFlows(newFlows);
    persistData({ incomeFlowsData: newFlows });
  };

  const updateIncomeFlow = (id, updates) => {
    const newFlows = incomeFlows.map(f =>
      f.id === id ? { ...f, ...updates } : f
    );
    setIncomeFlows(newFlows);
    persistData({ incomeFlowsData: newFlows });
  };

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
      storageError,
      addExpense,
      updateExpense,
      deleteExpense,
      deleteSaving,
      addSaving,
      createSavingsGoal,
      deleteSavingsGoal,
      addBalance,
      deleteBalanceHistory,
      updateEmergencySavings,
      addGoalSaving,
      updateGoalSaving,
      addIncomeFlow,
      updateIncomeFlow,
    }}>
      {children}
    </DataContext.Provider>
  );
};

