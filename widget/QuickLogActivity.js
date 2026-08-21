/**
 * QuickLogActivity — minimal overlay screen launched from the widget.
 * Shows amount input + horizontal category scroll + confirm button.
 * Writes directly to SQLite via expo-sqlite (same DB as the main app).
 */
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { useFocusEffect } from '@react-navigation/native';
import { useData } from '../context/DataContext';
import FiBWidgetPreview from './FiBWidgetPreview';
import { CATEGORIES } from '../constants/categories';
import { validateAmount } from '../utils/validation';

function getSpentToday(db) {
  const today = new Date();
  const todayPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const row = db.getFirstSync(
    `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date LIKE ?`,
    [`${todayPrefix}%`],
  );
  return row ? row.total : 0;
}

async function writeExpenseToSQLite(amount, category) {
  try {
    const db = SQLite.openDatabaseSync('fib.db');
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const date = new Date().toISOString();

    db.runSync(
      `INSERT INTO expenses (id, title, amount, category, date, split, split_with, is_recurring)
       VALUES (?, ?, ?, ?, ?, 0, NULL, 0)`,
      [id, `${category} expense`, amount, category, date],
    );

    // Update balance in meta
    const balRow = db.getFirstSync('SELECT value FROM meta WHERE key = ?', ['balance']);
    const currentBalance = balRow ? parseFloat(balRow.value) : 0;
    const newBalance = currentBalance - amount;
    db.runSync('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)', ['balance', String(newBalance)]);

    // Read today's total from SQLite for the widget
    const spentToday = getSpentToday(db);

    return { success: true, spentToday };
  } catch (err) {
    console.error('[FiB] QuickLogActivity SQLite error:', err);
    return { success: false, spentToday: 0 };
  }
}

export default function QuickLogActivity({ onDone }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const { reloadData, onboardingComplete } = useData();

  if (!onboardingComplete) {
    return (
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>COMPLETE ONBOARDING FIRST</Text>
          <Text style={styles.subtitle}>Open the app and set up your initial balance before using this widget.</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setDone(true); if (onDone) onDone(); }}>
            <Text style={styles.cancelText}>CLOSE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Reset all form state every time this screen gains focus.
  // This fixes the issue where React Navigation reuses the same component
  // instance on subsequent deep-link navigations from the widget.
  useFocusEffect(
    useCallback(() => {
      setAmount('');
      setCategory('');
      setError('');
      setDone(false);
    }, [])
  );

  const canConfirm = validateAmount(amount) && category !== '';

  const handleConfirm = async () => {
    if (!canConfirm) {
      setError('Enter a valid amount and pick a category.');
      return;
    }
    setError('');

    const { success, spentToday } = await writeExpenseToSQLite(parseFloat(amount), category);
    if (success) {
      // 1. Force the main app UI to refresh from SQLite immediately!
      if (reloadData) {
        reloadData();
      }

      // 2. Safely tell the Android widget to update its preview
      try {
        await requestWidgetUpdate({
          widgetName: 'FiBWidget',
          renderWidget: () => <FiBWidgetPreview spentToday={spentToday} hasError={false} />,
        });
      } catch (_) { }
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
