import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useData } from '../context/DataContext';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';

export default function GoalsScreen() {
  const { savingsGoals, createSavingsGoal, deleteSavingsGoal } = useData();
  const [animKey, setAnimKey] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      setAnimKey(prev => prev + 1);
    }
  }, [isFocused]);

  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current, 0);

  const handleCreateGoal = () => {
    if (!newGoalName) {
      alert('Please enter a goal name');
      return;
    }

    createSavingsGoal({
      name: newGoalName,
      target: newGoalTarget ? parseFloat(newGoalTarget) : null,
    });

    setNewGoalName('');
    setNewGoalTarget('');
    setShowCreateModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      {showSuccess && (
        <Animatable.View animation="bounceIn" style={styles.successBanner}>
          <Text style={styles.successText}>✓ GOAL CREATED!</Text>
        </Animatable.View>
      )}

      <Animatable.View key={`total-${animKey}`} animation="fadeInDown" delay={100} style={styles.boxGreen}>
        <Text style={styles.title}>TOTAL SAVINGS.</Text>
        <Text style={styles.amountGreen}>₹{totalSaved.toFixed(2)}</Text>
      </Animatable.View>

      <Animatable.View key={`create-${animKey}`} animation="fadeInDown" delay={150} style={styles.boxCreate}>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Text style={styles.createText}>+ CREATE NEW SAVINGS GOAL</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View key={`goals-${animKey}`} animation="fadeInUp" delay={200} style={styles.box}>
        <Text style={styles.title}>SAVINGS GOALS.</Text>
        {savingsGoals.length === 0 ? (
          <Text style={styles.emptyText}>No savings goals yet. Create one above!</Text>
        ) : (
          savingsGoals.map((goal, idx) => (
            <Animatable.View 
              key={goal.id} 
              animation="fadeInRight" 
              delay={300 + (idx * 100)}
              style={styles.goalItem}
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalName}>{goal.name}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    if (confirm(`Delete "${goal.name}" goal?`)) {
                      deleteSavingsGoal(goal.id);
                    }
                  }}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteText}>×</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.goalAmount}>
                ₹{goal.current.toFixed(2)}
                {goal.target && ` / ₹${goal.target.toFixed(2)}`}
              </Text>
              {goal.target && (
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }
                    ]} 
                  />
                </View>
              )}
              {goal.target && (
                <Text style={styles.progressText}>
                  {((goal.current / goal.target) * 100).toFixed(1)}% complete
                </Text>
              )}
            </Animatable.View>
          ))
        )}
      </Animatable.View>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <Text style={styles.modalTitle}>CREATE SAVINGS GOAL.</Text>
            <TextInput
              style={styles.input}
              placeholder="Goal Name (e.g., Vacation, New Phone)"
              placeholderTextColor="#444444"
              value={newGoalName}
              onChangeText={setNewGoalName}
            />
            <TextInput
              style={styles.input}
              placeholder="Target Amount (optional)"
              placeholderTextColor="#444444"
              value={newGoalTarget}
              onChangeText={setNewGoalTarget}
              keyboardType="numeric"
            />
            <TouchableOpacity 
              style={styles.button}
              onPress={handleCreateGoal}
            >
              <Text style={styles.buttonText}>CREATE</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCreateModal(false)}
            >
              <Text style={styles.buttonText}>CANCEL</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  successBanner: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#4ade80',
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  successText: {
    color: '#4ade80',
    fontFamily: 'PixelFont',
    fontSize: 12,
    letterSpacing: 2,
  },
  box: {
    borderWidth: 1,
    borderColor: '#4a9eff',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#0a0a0a',
  },
  boxGreen: {
    borderWidth: 1,
    borderColor: '#4ade80',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#0a0a0a',
  },
  boxCreate: {
    borderWidth: 1,
    borderColor: '#4ade80',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
  },
  createText: {
    color: '#4ade80',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 2,
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
  amountGreen: {
    color: '#4ade80',
    fontFamily: 'PixelFont',
    fontSize: 24,
  },
  emptyText: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  goalItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalName: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 12,
  },
  goalAmount: {
    color: '#4ade80',
    fontFamily: 'PixelFont',
    fontSize: 20,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
  },
  progressText: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 11,
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    color: '#ff6b6b',
    fontFamily: 'PixelFont',
    fontSize: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  modalTitle: {
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
  closeButton: {
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginTop: 12,
  },
});
