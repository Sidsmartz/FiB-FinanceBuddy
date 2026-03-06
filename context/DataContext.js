import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [emergencySavings, setEmergencySavings] = useState(0);
  const [goalSavings, setGoalSavings] = useState([]);
  const [incomeFlows, setIncomeFlows] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem('financeData');
      if (data) {
        const parsed = JSON.parse(data);
        setExpenses(parsed.expenses || []);
        setSavings(parsed.savings || []);
        setSavingsGoals(parsed.savingsGoals || []);
        setBalance(parsed.balance || 0);
        setEmergencySavings(parsed.emergencySavings || 0);
        setGoalSavings(parsed.goalSavings || []);
        setIncomeFlows(parsed.incomeFlows || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem('financeData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addExpense = (expense) => {
    const newExpenses = [...expenses, { ...expense, id: Date.now() }];
    setExpenses(newExpenses);
    setBalance(balance - expense.amount);
    saveData({ expenses: newExpenses, savings, savingsGoals, balance: balance - expense.amount, emergencySavings, goalSavings, incomeFlows });
  };

  const updateExpense = (id, updatedExpense) => {
    const oldExpense = expenses.find(e => e.id === id);
    const newExpenses = expenses.map(e => e.id === id ? { ...updatedExpense, id } : e);
    setExpenses(newExpenses);
    // Adjust balance: add back old amount, subtract new amount
    const newBalance = balance + oldExpense.amount - updatedExpense.amount;
    setBalance(newBalance);
    saveData({ expenses: newExpenses, savings, savingsGoals, balance: newBalance, emergencySavings, goalSavings, incomeFlows });
  };

  const deleteExpense = (id) => {
    const expense = expenses.find(e => e.id === id);
    const newExpenses = expenses.filter(e => e.id !== id);
    setExpenses(newExpenses);
    // Add the expense amount back to balance
    const newBalance = balance + expense.amount;
    setBalance(newBalance);
    saveData({ expenses: newExpenses, savings, savingsGoals, balance: newBalance, emergencySavings, goalSavings, incomeFlows });
  };

  const addSaving = (saving) => {
    const newSavings = [...savings, { ...saving, id: Date.now() }];
    setSavings(newSavings);
    setBalance(balance - saving.amount);
    
    // Update the savings goal amount
    if (saving.goalId) {
      const newGoals = savingsGoals.map(g => 
        g.id === saving.goalId ? { ...g, current: g.current + saving.amount } : g
      );
      setSavingsGoals(newGoals);
      saveData({ expenses, savings: newSavings, savingsGoals: newGoals, balance: balance - saving.amount, emergencySavings, goalSavings, incomeFlows });
    } else {
      saveData({ expenses, savings: newSavings, savingsGoals, balance: balance - saving.amount, emergencySavings, goalSavings, incomeFlows });
    }
  };

  const createSavingsGoal = (goal) => {
    const newGoal = { ...goal, id: Date.now(), current: 0 };
    const newGoals = [...savingsGoals, newGoal];
    setSavingsGoals(newGoals);
    saveData({ expenses, savings, savingsGoals: newGoals, balance, emergencySavings, goalSavings, incomeFlows });
  };

  const deleteSavingsGoal = (id) => {
    const newGoals = savingsGoals.filter(g => g.id !== id);
    setSavingsGoals(newGoals);
    saveData({ expenses, savings, savingsGoals: newGoals, balance, emergencySavings, goalSavings, incomeFlows });
  };

  const addBalance = (amount) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    saveData({ expenses, savings, savingsGoals, balance: newBalance, emergencySavings, goalSavings, incomeFlows });
  };

  const updateEmergencySavings = (amount) => {
    setEmergencySavings(amount);
    saveData({ expenses, savings, savingsGoals, balance, emergencySavings: amount, goalSavings, incomeFlows });
  };

  const addGoalSaving = (goal) => {
    const newGoals = [...goalSavings, { ...goal, id: Date.now(), current: 0 }];
    setGoalSavings(newGoals);
    saveData({ expenses, savings, savingsGoals, balance, emergencySavings, goalSavings: newGoals, incomeFlows });
  };

  const updateGoalSaving = (id, amount) => {
    const newGoals = goalSavings.map(g => 
      g.id === id ? { ...g, current: g.current + amount } : g
    );
    setGoalSavings(newGoals);
    saveData({ expenses, savings, savingsGoals, balance, emergencySavings, goalSavings: newGoals, incomeFlows });
  };

  const addIncomeFlow = (flow) => {
    const newFlows = [...incomeFlows, { ...flow, id: Date.now() }];
    setIncomeFlows(newFlows);
    saveData({ expenses, savings, savingsGoals, balance, emergencySavings, goalSavings, incomeFlows: newFlows });
  };

  const updateIncomeFlow = (id, updates) => {
    const newFlows = incomeFlows.map(f => 
      f.id === id ? { ...f, ...updates } : f
    );
    setIncomeFlows(newFlows);
    saveData({ expenses, savings, savingsGoals, balance, emergencySavings, goalSavings, incomeFlows: newFlows });
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
      addExpense,
      updateExpense,
      deleteExpense,
      addSaving,
      createSavingsGoal,
      deleteSavingsGoal,
      addBalance,
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
