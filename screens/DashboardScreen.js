import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useData } from '../context/DataContext';

const CATEGORIES = ['Books', 'Food', 'Gifts', 'Movies', 'Groceries', 'Transport', 'Entertainment', 'Others'];
const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];

export default function DashboardScreen() {
  const { expenses, balance } = useData();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
  }, [expenses]);

  const totalSpent = useMemo(() => {
    return monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [monthlyExpenses]);

  const categoryData = useMemo(() => {
    const data = {};
    monthlyExpenses.forEach(exp => {
      data[exp.category] = (data[exp.category] || 0) + exp.amount;
    });
    return CATEGORIES.map((cat, idx) => ({
      name: cat,
      amount: data[cat] || 0,
      color: COLORS[idx],
      legendFontColor: '#00ff00',
      legendFontSize: 12,
    })).filter(item => item.amount > 0);
  }, [monthlyExpenses]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>BALANCE</Text>
        <Text style={styles.amount}>${balance.toFixed(2)}</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.title}>SPENT THIS MONTH</Text>
        <Text style={styles.amount}>${totalSpent.toFixed(2)}</Text>
      </View>

      {categoryData.length > 0 && (
        <View style={styles.box}>
          <Text style={styles.title}>SPENDING BY CATEGORY</Text>
          <PieChart
            data={categoryData}
            width={Dimensions.get('window').width - 60}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      )}

      <View style={styles.box}>
        <Text style={styles.title}>RECENT EXPENSES</Text>
        {monthlyExpenses.slice(-5).reverse().map(exp => (
          <View key={exp.id} style={styles.expenseItem}>
            <Text style={styles.expenseText}>{exp.title}</Text>
            <Text style={styles.expenseAmount}>${exp.amount}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  box: {
    borderWidth: 2,
    borderColor: '#00ff00',
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#1a1a1a',
  },
  title: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 8,
  },
  amount: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 24,
    fontWeight: 'bold',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  expenseText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  expenseAmount: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
