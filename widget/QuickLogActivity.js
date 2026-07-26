/**
 * QuickLogActivity — minimal overlay screen launched from the widget.
 * Shows amount input + horizontal category scroll + confirm button.
 * On confirm: writes expense to AsyncStorage and triggers widget refresh.
 * Requirements: 2.2, 2.3
 */
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateWidget } from 'react-native-android-widget';
import { CATEGORIES } from '../constants/categories';
import { validateAmount } from '../utils/validation';
import { validatePersistedData } from '../utils/dataLogic';

const STORAGE_KEY = 'financeData';
const WIDGET_BALANCE_KEY = 'fibWidgetBalance';

export default function QuickLogActivity({ onDone }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const canConfirm = validateAmount(amount) && category !== '';

  const handleConfirm = async () => {
    if (!canConfirm) {
      setError('Enter a valid amount and pick a category.');
      return;
    }
    setError('');

    try {
      // Read current data
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const state = validatePersistedData(parsed);

      // Build new expense
      const newExpense = {
        id: Date.now().toString(),
        title: `${category} expense`,
        amount: parseFloat(amount),
        category,
        split: 0,
        date: new Date().toISOString(),
      };

      // Update state
      const newExpenses = [...state.expenses, newExpense];
      const newBalance = state.balance - newExpense.amount;
      const newState = { ...state, expenses: newExpenses, balance: newBalance };

      // Persist
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      await AsyncStorage.setItem(WIDGET_BALANCE_KEY, JSON.stringify(newBalance));

      // Refresh widget
      await updateWidget({ widgetName: 'FiBWidget' });
    } catch (err) {
      console.error('[FiB] QuickLogActivity error:', err);
    }

    setDone(true);
    if (onDone) onDone();
  };

  if (done) {
    return (
      <SafeAreaView style={styles.overlay}>
        <Text style={styles.doneText}>✔ LOGGED!</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>QUICK LOG.</Text>

        <TextInput
          style={[styles.input, error && !validateAmount(amount) ? styles.inputError : null]}
          placeholder="Amount  ₹"
          placeholderTextColor="#444444"
          value={amount}
          onChangeText={v => { setAmount(v); if (error) setError(''); }}
          keyboardType="numeric"
          autoFocus
        />

        {/* Horizontal category scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, category === cat && styles.catChipActive]}
              onPress={() => { setCategory(cat); if (error) setError(''); }}
            >
              <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {error !== '' && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, !canConfirm && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={!canConfirm}
        >
          <Text style={[styles.buttonText, !canConfirm && styles.buttonTextDisabled]}>
            CONFIRM
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '90%',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#7eb8ff',
    padding: 24,
  },
  title: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 14,
    marginBottom: 14,
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    backgroundColor: '#000000',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  catRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  catChip: {
    borderWidth: 1,
    borderColor: '#333333',
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    backgroundColor: '#000000',
  },
  catChipActive: {
    borderColor: '#7eb8ff',
    backgroundColor: '#0d1f33',
  },
  catChipText: {
    color: '#666666',
    fontFamily: 'PixelFont',
    fontSize: 8,
    letterSpacing: 1,
  },
  catChipTextActive: {
    color: '#7eb8ff',
  },
  errorText: {
    color: '#ff6b6b',
    fontFamily: 'UbuntuMono',
    fontSize: 11,
    marginBottom: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  buttonDisabled: {
    borderColor: '#333333',
    backgroundColor: '#0a0a0a',
  },
  buttonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 1,
  },
  buttonTextDisabled: {
    color: '#444444',
  },
  doneText: {
    color: '#4ade80',
    fontFamily: 'PixelFont',
    fontSize: 14,
    letterSpacing: 3,
  },
});
