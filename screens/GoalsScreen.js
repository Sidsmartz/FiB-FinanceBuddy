import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';

export default function GoalsScreen() {
  const { emergencySavings, goalSavings, updateEmergencySavings, addGoalSaving, updateGoalSaving } = useData();
  const [emergencyAmount, setEmergencyAmount] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');
  const [animKey, setAnimKey] = useState(0);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      setAnimKey(prev => prev + 1);
    }
  }, [isFocused]);

  // Calculate total general savings
  const totalSavings = goalSavings.reduce((sum, goal) => sum + goal.current, 0);

  const handleUpdateEmergency = (isAdd = true) => {
    if (!emergencyAmount) return;
    const amount = parseFloat(emergencyAmount);
    if (isAdd) {
      updateEmergencySavings(emergencySavings + amount);
    } else {
      const newAmount = emergencySavings - amount;
      if (newAmount < 0) {
        alert('Cannot remove more than available');
        return;
      }
      updateEmergencySavings(newAmount);
    }
    setEmergencyAmount('');
  };

  const handleUpdateSavings = (isAdd = true) => {
    if (!savingsAmount) return;
    const amount = parseFloat(savingsAmount);
    const savingsGoal = goalSavings.find(g => g.name === 'Savings');
    
    if (isAdd) {
      if (savingsGoal) {
        updateGoalSaving(savingsGoal.id, amount);
      } else {
        addGoalSaving({
          name: 'Savings',
          target: 999999999,
        });
      }
    } else {
      if (!savingsGoal) {
        alert('No savings to remove from');
        return;
      }
      const newAmount = savingsGoal.current - amount;
      if (newAmount < 0) {
        alert('Cannot remove more than available');
        return;
      }
      updateGoalSaving(savingsGoal.id, -amount);
    }
    setSavingsAmount('');
  };

  return (
    <ScrollView style={styles.container}>
      <Animatable.View key={`emergency-${animKey}`} animation="fadeInDown" delay={100} style={styles.box}>
        <Text style={styles.title}>EMERGENCY SAVINGS.</Text>
        <Text style={styles.amount}>₹{emergencySavings.toFixed(2)}</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#666666"
          value={emergencyAmount}
          onChangeText={setEmergencyAmount}
          keyboardType="numeric"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => handleUpdateEmergency(true)}>
            <Text style={styles.buttonText}>ADD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonHalf, styles.buttonRemove]} onPress={() => handleUpdateEmergency(false)}>
            <Text style={styles.buttonText}>REMOVE</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      <Animatable.View key={`savings-${animKey}`} animation="fadeInUp" delay={200} style={styles.box}>
        <Text style={styles.title}>SAVINGS.</Text>
        <Text style={styles.amount}>₹{totalSavings.toFixed(2)}</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#666666"
          value={savingsAmount}
          onChangeText={setSavingsAmount}
          keyboardType="numeric"
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => handleUpdateSavings(true)}>
            <Text style={styles.buttonText}>ADD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonHalf, styles.buttonRemove]} onPress={() => handleUpdateSavings(false)}>
            <Text style={styles.buttonText}>REMOVE</Text>
          </TouchableOpacity>
        </View>
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonHalf: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  buttonRemove: {
    borderColor: '#ff6b6b',
  },
  buttonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 1,
  },
});
