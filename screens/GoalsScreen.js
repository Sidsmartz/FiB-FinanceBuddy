import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import * as Animatable from 'react-native-animatable';

export default function GoalsScreen() {
  const { emergencySavings, goalSavings, updateEmergencySavings, addGoalSaving, updateGoalSaving } = useData();
  const [emergencyAmount, setEmergencyAmount] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');

  // Calculate total general savings
  const totalSavings = goalSavings.reduce((sum, goal) => sum + goal.current, 0);

  const handleUpdateEmergency = () => {
    if (!emergencyAmount) return;
    updateEmergencySavings(emergencySavings + parseFloat(emergencyAmount));
    setEmergencyAmount('');
  };

  const handleAddSavings = () => {
    if (!savingsAmount) return;
    // Add to general savings (create a single "Savings" goal if it doesn't exist)
    const savingsGoal = goalSavings.find(g => g.name === 'Savings');
    if (savingsGoal) {
      updateGoalSaving(savingsGoal.id, parseFloat(savingsAmount));
    } else {
      addGoalSaving({
        name: 'Savings',
        target: 999999999, // Large number for general savings
      });
      // Will need to add amount in next interaction
    }
    setSavingsAmount('');
  };

  return (
    <ScrollView style={styles.container}>
      <Animatable.View animation="fadeInDown" delay={100} style={styles.box}>
        <Text style={styles.title}>EMERGENCY SAVINGS.</Text>
        <Text style={styles.amount}>₹{emergencySavings.toFixed(2)}</Text>
        <TextInput
          style={styles.input}
          placeholder="Add Amount"
          placeholderTextColor="#666666"
          value={emergencyAmount}
          onChangeText={setEmergencyAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateEmergency}>
          <Text style={styles.buttonText}>ADD</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={200} style={styles.box}>
        <Text style={styles.title}>SAVINGS.</Text>
        <Text style={styles.amount}>₹{totalSavings.toFixed(2)}</Text>
        <TextInput
          style={styles.input}
          placeholder="Add Amount"
          placeholderTextColor="#666666"
          value={savingsAmount}
          onChangeText={setSavingsAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleAddSavings}>
          <Text style={styles.buttonText}>ADD</Text>
        </TouchableOpacity>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  box: {
    borderWidth: 1,
    borderColor: '#4a9eff',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#0a0a0a',
  },
  title: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 12,
  },
  amount: {
    color: '#7eb8ff',
    fontFamily: 'PixelFont',
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 14,
    marginBottom: 12,
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    backgroundColor: '#000000',
    fontSize: 13,
  },
  button: {
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  buttonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 1,
  },
});
