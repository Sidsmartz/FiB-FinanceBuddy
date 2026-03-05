import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
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
    const newExpenses = [...expenses, { ...expense, id: Date.now(), date: new Date().toISOString() }];
    setExpenses(newExpenses);
    setBalance(balance - expense.amount);
    saveData({ expenses: newExpenses, balance: balance - expense.amount, emergencySavings, goalSavings, incomeFlows });
  };

  const addBalance = (amount) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    saveData({ expenses, balance: newBalance, emergencySavings, goalSavings, incomeFlows });
  };

  const updateEmergencySavings = (amount) => {
    setEmergencySavings(amount);
    saveData({ expenses, balance, emergencySavings: amount, goalSavings, incomeFlows });
  };

  const addGoalSaving = (goal) => {
    const newGoals = [...goalSavings, { ...goal, id: Date.now(), current: 0 }];
    setGoalSavings(newGoals);
    saveData({ expenses, balance, emergencySavings, goalSavings: newGoals, incomeFlows });
  };

  const updateGoalSaving = (id, amount) => {
    const newGoals = goalSavings.map(g => 
      g.id === id ? { ...g, current: g.current + amount } : g
    );
    setGoalSavings(newGoals);
    saveData({ expenses, balance, emergencySavings, goalSavings: newGoals, incomeFlows });
  };

  const addIncomeFlow = (flow) => {
    const newFlows = [...incomeFlows, { ...flow, id: Date.now() }];
    setIncomeFlows(newFlows);
    saveData({ expenses, balance, emergencySavings, goalSavings, incomeFlows: newFlows });
  };

  const updateIncomeFlow = (id, updates) => {
    const newFlows = incomeFlows.map(f => 
      f.id === id ? { ...f, ...updates } : f
    );
    setIncomeFlows(newFlows);
    saveData({ expenses, balance, emergencySavings, goalSavings, incomeFlows: newFlows });
  };

  return (
    <DataContext.Provider value={{
      expenses,
      balance,
      emergencySavings,
      goalSavings,
      incomeFlows,
      addExpense,
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
