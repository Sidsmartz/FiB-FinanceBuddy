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
        <Text style={styles.amount}>${emergencySavings.toFixed(2)}</Text>
        <TextInput
          style={styles.input}
          placeholder="Add Amount"
          placeholderTextColor="#006600"
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
          placeholderTextColor="#006600"
          value={goalName}
          onChangeText={setGoalName}
        />
        <TextInput
          style={styles.input}
          placeholder="Target Amount"
          placeholderTextColor="#006600"
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
              ${goal.current.toFixed(2)} / ${goal.target.toFixed(2)}
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
            placeholderTextColor="#006600"
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
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#00ff00',
    borderStyle: 'dashed',
    padding: 12,
    marginBottom: 12,
    color: '#00ff00',
    fontFamily: 'monospace',
    backgroundColor: '#0a0a0a',
  },
  button: {
    borderWidth: 2,
    borderColor: '#00ff00',
    borderStyle: 'dashed',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#002200',
  },
  buttonText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 14,
  },
  goalItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  goalName: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 16,
    marginBottom: 4,
  },
  goalProgress: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 20,
    borderWidth: 2,
    borderColor: '#00ff00',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff00',
  },
  smallButton: {
    borderWidth: 2,
    borderColor: '#00ff00',
    borderStyle: 'dashed',
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#002200',
  },
});
