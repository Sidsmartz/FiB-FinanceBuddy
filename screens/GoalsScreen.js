import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';

export default function GoalsScreen() {
  const { emergencySavings, goalSavings, updateEmergencySavings, addGoalSaving, updateGoalSaving } = useData();
  const [emergencyAmount, setEmergencyAmount] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [addAmount, setAddAmount] = useState('');

  const handleUpdateEmergency = () => {
    if (!emergencyAmount) return;
    updateEmergencySavings(emergencySavings + parseFloat(emergencyAmount));
    setEmergencyAmount('');
  };

  const handleAddGoal = () => {
    if (!goalName || !goalTarget) {
      alert('Please fill all fields');
      return;
    }
    addGoalSaving({
      name: goalName,
      target: parseFloat(goalTarget),
    });
    setGoalName('');
    setGoalTarget('');
  };

  const handleAddToGoal = () => {
    if (!selectedGoal || !addAmount) return;
    updateGoalSaving(selectedGoal, parseFloat(addAmount));
    setAddAmount('');
    setSelectedGoal(null);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>EMERGENCY SAVINGS</Text>
        <Text style={styles.amount}>₹{emergencySavings.toFixed(2)}</Text>
        <TextInput
          style={styles.input}
          placeholder="Add Amount"
          placeholderTextColor="#444444"
          value={emergencyAmount}
          onChangeText={setEmergencyAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateEmergency}>
          <Text style={styles.buttonText}>ADD</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.box}>
        <Text style={styles.title}>CREATE GOAL</Text>
        <TextInput
          style={styles.input}
          placeholder="Goal Name"
          placeholderTextColor="#444444"
          value={goalName}
          onChangeText={setGoalName}
        />
        <TextInput
          style={styles.input}
          placeholder="Target Amount"
          placeholderTextColor="#444444"
          value={goalTarget}
          onChangeText={setGoalTarget}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleAddGoal}>
          <Text style={styles.buttonText}>CREATE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.box}>
        <Text style={styles.title}>GOAL SAVINGS</Text>
        {goalSavings.map(goal => (
          <View key={goal.id} style={styles.goalItem}>
            <Text style={styles.goalName}>{goal.name}</Text>
            <Text style={styles.goalProgress}>
              ₹{goal.current.toFixed(2)} / ₹{goal.target.toFixed(2)}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }
                ]} 
              />
            </View>
            <TouchableOpacity 
              style={styles.smallButton}
              onPress={() => setSelectedGoal(goal.id)}
            >
              <Text style={styles.buttonText}>ADD FUNDS</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {selectedGoal && (
        <View style={styles.box}>
          <Text style={styles.title}>ADD TO GOAL</Text>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            placeholderTextColor="#444444"
            value={addAmount}
            onChangeText={setAddAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleAddToGoal}>
            <Text style={styles.buttonText}>CONFIRM</Text>
          </TouchableOpacity>
        </View>
      )}
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
    borderColor: '#333333',
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
    color: '#ffffff',
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
  goalItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  goalName: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 12,
    marginBottom: 8,
  },
  goalProgress: {
    color: '#cccccc',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    marginBottom: 12,
  },
  progressBar: {
    height: 24,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 12,
    backgroundColor: '#000000',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
  },
  smallButton: {
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
});
