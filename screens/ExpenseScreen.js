import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useData } from '../context/DataContext';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';

const CATEGORIES = ['Books', 'Food', 'Gifts', 'Movies', 'Groceries', 'Transport', 'Entertainment', 'Others'];

export default function ExpenseScreen() {
  const { addExpense, addSaving, addBalance, savingsGoals } = useData();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [split, setSplit] = useState('');
  const [date, setDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [savingAmount, setSavingAmount] = useState('');
  const [savingDate, setSavingDate] = useState(new Date());
  const [savingGoal, setSavingGoal] = useState(null);
  const [showSavingDateModal, setShowSavingDateModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      setAnimKey(prev => prev + 1);
    }
  }, [isFocused]);

  const handleAddExpense = () => {
    if (!title || !amount || !category) {
      alert('Please fill all required fields');
      return;
    }

    addExpense({
      title,
      amount: parseFloat(amount),
      category,
      split: split ? parseFloat(split) : 0,
      date: date.toISOString(),
    });

    setTitle('');
    setAmount('');
    setCategory('');
    setSplit('');
    setDate(new Date());
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleAddBalance = () => {
    if (!balanceAmount) return;
    addBalance(parseFloat(balanceAmount));
    setBalanceAmount('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleAddSaving = () => {
    if (!savingAmount || !savingGoal) {
      alert('Please fill all required fields');
      return;
    }

    addSaving({
      title: savingGoal.name,
      amount: parseFloat(savingAmount),
      date: savingDate.toISOString(),
      goalId: savingGoal.id,
    });

    setSavingAmount('');
    setSavingDate(new Date());
    setSavingGoal(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      {showSuccess && (
        <Animatable.View animation="bounceIn" style={styles.successBanner}>
          <Text style={styles.successText}>✓ SUCCESS!</Text>
        </Animatable.View>
      )}

      <Animatable.View key={`balance-${animKey}`} animation="fadeInDown" delay={100} style={styles.box}>
        <Text style={styles.title}>ADD BALANCE.</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#444444"
          value={balanceAmount}
          onChangeText={setBalanceAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleAddBalance}>
          <Text style={styles.buttonText}>ADD</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View key={`saving-${animKey}`} animation="fadeInDown" delay={150} style={styles.boxGreen}>
        <Text style={styles.title}>ADD TO SAVINGS.</Text>
        
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowGoalModal(true)}
        >
          <Text style={[styles.inputText, !savingGoal && styles.placeholder]}>
            {savingGoal ? savingGoal.name : 'Select Savings Goal'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#444444"
          value={savingAmount}
          onChangeText={setSavingAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowSavingDateModal(true)}
        >
          <Text style={styles.inputText}>
            {savingDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </TouchableOpacity>

        {showSavingDateModal && (
          <DateTimePicker
            value={savingDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowSavingDateModal(Platform.OS === 'ios');
              if (selectedDate) {
                setSavingDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}
        <TouchableOpacity style={styles.button} onPress={handleAddSaving}>
          <Text style={styles.buttonText}>SAVE</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View key={`expense-${animKey}`} animation="fadeInUp" delay={200} style={styles.box}>
        <Text style={styles.title}>LOG EXPENSE.</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#444444"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#444444"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[styles.inputText, !category && styles.placeholder]}>
            {category || 'Select Category'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowDateModal(true)}
        >
          <Text style={styles.inputText}>
            {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </TouchableOpacity>

        {showDateModal && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDateModal(Platform.OS === 'ios');
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Split Amount (optional)"
          placeholderTextColor="#444444"
          value={split}
          onChangeText={setSplit}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
          <Text style={styles.buttonText}>LOG EXPENSE</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <Text style={styles.modalTitle}>SELECT CATEGORY.</Text>
            {CATEGORIES.map((cat, idx) => (
              <Animatable.View
                key={cat}
                animation="fadeInRight"
                delay={idx * 50}
              >
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.categoryText}>{cat}</Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.buttonText}>CLOSE</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>

      <Modal
        visible={showGoalModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <Text style={styles.modalTitle}>SELECT SAVINGS GOAL.</Text>
            <ScrollView style={styles.goalScroll}>
              {savingsGoals.length === 0 ? (
                <Text style={styles.emptyText}>No goals yet. Create one in Goals tab!</Text>
              ) : (
                savingsGoals.map((goal, idx) => (
                  <Animatable.View
                    key={goal.id}
                    animation="fadeInRight"
                    delay={idx * 50}
                  >
                    <TouchableOpacity
                      style={styles.categoryItem}
                      onPress={() => {
                        setSavingGoal(goal);
                        setShowGoalModal(false);
                      }}
                    >
                      <View>
                        <Text style={styles.categoryText}>{goal.name}</Text>
                        <Text style={styles.goalProgress}>
                          ₹{goal.current.toFixed(2)}{goal.target ? ` / ₹${goal.target.toFixed(2)}` : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Animatable.View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowGoalModal(false)}
            >
              <Text style={styles.buttonText}>CLOSE</Text>
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
    borderColor: '#7eb8ff',
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  successText: {
    color: '#7eb8ff',
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
    marginBottom: 12,
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    backgroundColor: '#000000',
    fontSize: 13,
  },
  inputText: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
  },
  placeholder: {
    color: '#666666',
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
  categoryItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  categoryText: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    fontSize: 13,
  },
  closeButton: {
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginTop: 12,
  },
  goalScroll: {
    maxHeight: 300,
  },
  goalProgress: {
    color: '#4ade80',
    fontFamily: 'UbuntuMono',
    fontSize: 11,
    marginTop: 4,
  },
  emptyText: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
