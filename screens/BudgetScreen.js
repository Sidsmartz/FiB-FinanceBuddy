/**
 * BudgetScreen — per-category monthly budget editor.
 * Requirements: 3.6
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useData } from '../context/DataContext';

export default function BudgetScreen() {
  const { categories, getBudgets, setBudget } = useData();
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Map of category id → current limit string shown in the input
  const [limits, setLimits] = useState({});

  // Load existing budgets for this month on mount
  useEffect(() => {
    const budgets = getBudgets(currentMonth);
    const map = {};
    for (const b of budgets) {
      map[b.category] = String(b.monthly_limit);
    }
    setLimits(map);
  }, []);

  const handleBlur = (categoryLabel, value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setBudget(categoryLabel, num);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.categoryLabel}>{item.label}</Text>
      <TextInput
        style={styles.input}
        value={limits[item.label] ?? ''}
        onChangeText={(v) => setLimits(prev => ({ ...prev, [item.label]: v }))}
        onBlur={() => handleBlur(item.label, limits[item.label] ?? '')}
        keyboardType="numeric"
        placeholder="No limit"
        placeholderTextColor="#444444"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.heading}>MONTHLY BUDGETS.</Text>
      <Text style={styles.subheading}>Tap a field and enter a limit (₹). Saves on blur.</Text>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  heading: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subheading: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 11,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 14,
    marginBottom: 8,
    backgroundColor: '#0a0a0a',
  },
  categoryLabel: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    fontSize: 13,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 8,
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    fontSize: 13,
    backgroundColor: '#000000',
    width: 100,
    textAlign: 'right',
  },
});
