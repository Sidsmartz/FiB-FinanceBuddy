import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useData } from '../context/DataContext';

const CATEGORIES = ['Books', 'Food', 'Gifts', 'Movies', 'Groceries', 'Transport', 'Entertainment', 'Others'];

export default function ExpenseScreen() {
  const { addExpense, addBalance } = useData();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [split, setSplit] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');

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
    });

    setTitle('');
    setAmount('');
    setCategory('');
    setSplit('');
  };

  const handleAddBalance = () => {
    if (!balanceAmount) return;
    addBalance(parseFloat(balanceAmount));
    setBalanceAmount('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>ADD BALANCE</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#006600"
          value={balanceAmount}
          onChangeText={setBalanceAmount}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={handleAddBalance}>
          <Text style={styles.buttonText}>ADD</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.box}>
        <Text style={styles.title}>LOG EXPENSE</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#006600"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#006600"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={styles.input} 
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={styles.inputText}>
            {category || 'Select Category'}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Split Amount (optional)"
          placeholderTextColor="#006600"
          value={split}
          onChangeText={setSplit}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
          <Text style={styles.buttonText}>LOG EXPENSE</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>SELECT CATEGORY</Text>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={styles.categoryItem}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
  inputText: {
    color: '#00ff00',
    fontFamily: 'monospace',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderWidth: 2,
    borderColor: '#00ff00',
    borderStyle: 'dashed',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  modalTitle: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 12,
  },
  categoryItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  categoryText: {
    color: '#00ff00',
    fontFamily: 'monospace',
  },
});
