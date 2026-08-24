import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Modal, Platform, FlatList,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useData } from '../context/DataContext';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';
import { validateAmount, sanitizeTitle, isNonEmptyTitle } from '../utils/validation';

// ─── Quick-Log Section ────────────────────────────────────────────────────────

function QuickLogSection({ onSuccess }) {
  const { addExpense, categories, addCustomCategory, currency } = useData();
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [addCatError, setAddCatError] = useState('');

  const canLog = validateAmount(amount) && selectedCategory !== '';

  const handleLog = () => {
    if (!validateAmount(amount)) {
      setError('Enter a valid amount (e.g. 50)');
      return;
    }
    if (!selectedCategory) {
      setError('Select a category');
      return;
    }
    setError('');
    addExpense({
      title: `${selectedCategory} expense`,
      amount: parseFloat(amount),
      category: selectedCategory,
      split: 0,
      date: new Date().toISOString(),
    });
    setAmount('');
    setSelectedCategory('');
    onSuccess();
  };

  const handleAmountChange = (v) => {
    setAmount(v);
    if (error) setError('');
  };

  const handleAddCategory = () => {
    const result = addCustomCategory(newCatLabel);
    if (result.success) {
      setSelectedCategory(newCatLabel.trim());
      setNewCatLabel('');
      setAddCatError('');
      setShowAddCatModal(false);
    } else {
      setAddCatError(result.error);
    }
  };

  return (
    <View style={styles.quickBox}>
      <Text style={styles.sectionTitle}>QUICK LOG.</Text>

      <TextInput
        style={[styles.input, error && !validateAmount(amount) ? styles.inputError : null]}
        placeholder={`Amount  ${currency}`}
        placeholderTextColor="#444444"
        value={amount}
        onChangeText={handleAmountChange}
        keyboardType="numeric"
        autoFocus={false}
      />

      {/* 2-column category grid */}
      <View style={styles.catGrid}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, selectedCategory === cat.label && styles.catChipActive]}
            onPress={() => {
              setSelectedCategory(cat.label);
              if (error) setError('');
            }}
          >
            <Text style={[styles.catChipText, selectedCategory === cat.label && styles.catChipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.catChip, styles.catChipAdd]}
          onPress={() => setShowAddCatModal(true)}
        >
          <Text style={styles.catChipAddText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {error !== '' && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, !canLog && styles.buttonDisabled]}
        onPress={handleLog}
        disabled={!canLog}
      >
        <Text style={[styles.buttonText, !canLog && styles.buttonTextDisabled]}>LOG</Text>
      </TouchableOpacity>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCatModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <Text style={styles.modalTitle}>ADD CATEGORY.</Text>
            <TextInput
              style={styles.input}
              placeholder="Category name"
              placeholderTextColor="#444444"
              value={newCatLabel}
              onChangeText={(v) => { setNewCatLabel(v); setAddCatError(''); }}
              autoFocus
            />
            {addCatError !== '' && <Text style={styles.errorText}>{addCatError}</Text>}
            <TouchableOpacity style={styles.button} onPress={handleAddCategory}>
              <Text style={styles.buttonText}>ADD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => { setShowAddCatModal(false); setNewCatLabel(''); setAddCatError(''); }}>
              <Text style={styles.buttonText}>CANCEL</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Full-Log Section (collapsible) ──────────────────────────────────────────

function FullLogSection({ onSuccess }) {
  const { addExpense, categories, addCustomCategory } = useData();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [split, setSplit] = useState('');
  const [date, setDate] = useState(new Date());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [addCatError, setAddCatError] = useState('');

  const handleAddExpense = () => {
    const cleanTitle = sanitizeTitle(title);
    if (!isNonEmptyTitle(cleanTitle) || !validateAmount(amount) || !category) {
      return;
    }
    addExpense({
      title: cleanTitle,
      amount: parseFloat(amount),
      category,
      split: split ? parseFloat(split) : 0,
      date: date.toISOString(),
    });
    setTitle(''); setAmount(''); setCategory(''); setSplit(''); setDate(new Date());
    onSuccess();
  };

  const handleAddCategory = () => {
    const result = addCustomCategory(newCatLabel);
    if (result.success) {
      setCategory(newCatLabel.trim());
      setNewCatLabel('');
      setAddCatError('');
      setShowAddCatModal(false);
    } else {
      setAddCatError(result.error);
    }
  };

  return (
    <View style={styles.box}>
      <TouchableOpacity onPress={() => setExpanded(e => !e)} style={styles.toggleRow}>
        <Text style={styles.sectionTitle}>FULL LOG.</Text>
        <Text style={styles.toggleArrow}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <>
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
          <TouchableOpacity style={styles.input} onPress={() => setShowCategoryModal(true)}>
            <Text style={[styles.inputText, !category && styles.placeholder]}>
              {category || 'Select Category'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.input} onPress={() => setShowDateModal(true)}>
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
                if (selectedDate) setDate(selectedDate);
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
        </>
      )}

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <Text style={styles.modalTitle}>SELECT CATEGORY.</Text>
            {categories.map((cat, idx) => (
              <Animatable.View key={cat.id} animation="fadeInRight" delay={idx * 50}>
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => { setCategory(cat.label); setShowCategoryModal(false); }}
                >
                  <Text style={styles.categoryText}>{cat.label}</Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
            <Animatable.View animation="fadeInRight" delay={categories.length * 50}>
              <TouchableOpacity
                style={[styles.categoryItem, styles.addCategoryItem]}
                onPress={() => { setShowCategoryModal(false); setShowAddCatModal(true); }}
              >
                <Text style={styles.addCategoryText}>+ Add category</Text>
              </TouchableOpacity>
            </Animatable.View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowCategoryModal(false)}>
              <Text style={styles.buttonText}>CLOSE</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCatModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <Text style={styles.modalTitle}>ADD CATEGORY.</Text>
            <TextInput
              style={styles.input}
              placeholder="Category name"
              placeholderTextColor="#444444"
              value={newCatLabel}
              onChangeText={(v) => { setNewCatLabel(v); setAddCatError(''); }}
              autoFocus
            />
            {addCatError !== '' && <Text style={styles.errorText}>{addCatError}</Text>}
            <TouchableOpacity style={styles.button} onPress={handleAddCategory}>
              <Text style={styles.buttonText}>ADD</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => { setShowAddCatModal(false); setNewCatLabel(''); setAddCatError(''); }}>
              <Text style={styles.buttonText}>CANCEL</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ExpenseScreen() {
  const { addSaving, addBalance, savingsGoals, currency } = useData();
  const [balanceTitle, setBalanceTitle] = useState('');
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
    if (isFocused) setAnimKey(prev => prev + 1);
  }, [isFocused]);

  const showSuccessBanner = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleAddBalance = () => {
    const cleanTitle = sanitizeTitle(balanceTitle);
    if (!validateAmount(balanceAmount) || !isNonEmptyTitle(cleanTitle)) return;
    addBalance(parseFloat(balanceAmount), cleanTitle);
    setBalanceAmount('');
    setBalanceTitle('');
    showSuccessBanner();
  };

  const handleAddSaving = () => {
    if (!validateAmount(savingAmount) || !savingGoal) return;
    addSaving({
      title: savingGoal.name,
      amount: parseFloat(savingAmount),
      date: savingDate.toISOString(),
      goalId: savingGoal.id,
    });
    setSavingAmount('');
    setSavingDate(new Date());
    setSavingGoal(null);
    showSuccessBanner();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 48 }}>
      {showSuccess && (
        <Animatable.View animation="bounceIn" style={styles.successBanner}>
          <Text style={styles.successText}>✔ SUCCESS!</Text>
        </Animatable.View>
      )}

      {/* ── Quick-Log (top) ── */}
      <Animatable.View key={`quick-${animKey}`} animation="fadeInDown" delay={80}>
        <QuickLogSection onSuccess={showSuccessBanner} />
      </Animatable.View>

      {/* ── Full-Log (collapsible) ── */}
      <Animatable.View key={`full-${animKey}`} animation="fadeInDown" delay={140}>
        <FullLogSection onSuccess={showSuccessBanner} />
      </Animatable.View>

      {/* ── Add Balance ── */}
      <Animatable.View key={`balance-${animKey}`} animation="fadeInDown" delay={200} style={styles.box}>
        <Text style={styles.sectionTitle}>ADD BALANCE.</Text>
        <TextInput
          style={styles.input}
          placeholder="Title (e.g., Salary, Gift)"
          placeholderTextColor="#444444"
          value={balanceTitle}
          onChangeText={setBalanceTitle}
        />
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

      {/* ── Add to Savings ── */}
      <Animatable.View key={`saving-${animKey}`} animation="fadeInDown" delay={250} style={styles.boxGreen}>
        <Text style={styles.sectionTitle}>ADD TO SAVINGS.</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowGoalModal(true)}>
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
        <TouchableOpacity style={styles.input} onPress={() => setShowSavingDateModal(true)}>
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
              if (selectedDate) setSavingDate(selectedDate);
            }}
            maximumDate={new Date()}
          />
        )}
        <TouchableOpacity style={styles.button} onPress={handleAddSaving}>
          <Text style={styles.buttonText}>SAVE</Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* Goal picker modal */}
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
                  <Animatable.View key={goal.id} animation="fadeInRight" delay={idx * 50}>
                    <TouchableOpacity
                      style={styles.categoryItem}
                      onPress={() => { setSavingGoal(goal); setShowGoalModal(false); }}
                    >
                      <Text style={styles.categoryText}>{goal.name}</Text>
                      <Text style={styles.goalProgress}>
                        {currency}{goal.current.toFixed(2)}{goal.target ? ` / ${currency}${goal.target.toFixed(2)}` : ''}
                      </Text>
                    </TouchableOpacity>
                  </Animatable.View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowGoalModal(false)}>
              <Text style={styles.buttonText}>CLOSE</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  quickBox: {
    borderWidth: 1,
    borderColor: '#7eb8ff',
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#0a0a0a',
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
  sectionTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleArrow: {
    color: '#7eb8ff',
    fontFamily: 'PixelFont',
    fontSize: 10,
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
  inputError: {
    borderColor: '#ff6b6b',
  },
  inputText: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
  },
  placeholder: {
    color: '#666666',
  },
  errorText: {
    color: '#ff6b6b',
    fontFamily: 'UbuntuMono',
    fontSize: 11,
    marginBottom: 10,
  },
  // Category grid — 2 columns
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  catChip: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#333333',
    paddingVertical: 10,
    alignItems: 'center',
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
  catChipAdd: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#444444',
    borderStyle: 'dashed',
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  catChipAddText: {
    color: '#666666',
    fontFamily: 'PixelFont',
    fontSize: 8,
    letterSpacing: 1,
  },
  addCategoryItem: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  addCategoryText: {
    color: '#7eb8ff',
    fontFamily: 'UbuntuMono',
    fontSize: 13,
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
