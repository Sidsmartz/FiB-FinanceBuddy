import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useData } from '../context/DataContext';
import * as Animatable from 'react-native-animatable';

const CATEGORIES = ['Books', 'Food', 'Gifts', 'Movies', 'Groceries', 'Transport', 'Entertainment', 'Others'];

export default function ExpenseScreen() {
  const { addExpense, addBalance } = useData();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [split, setSplit] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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

  return (
    <ScrollView style={styles.container}>
      {showSuccess && (
        <Animatable.View animation="bounceIn" style={styles.successBanner}>
          <Text style={styles.successText}>✓ SUCCESS!</Text>
        </Animatable.View>
      )}

      <Animatable.View animation="fadeInDown" delay={100} style={styles.box}>
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

      <Animatable.View animation="fadeInUp" delay={200} style={styles.box}>
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
});
