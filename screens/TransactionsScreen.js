import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useData } from '../context/DataContext';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionsScreen() {
  const { expenses, savings, deleteExpense, deleteSaving } = useData();
  const [filterType, setFilterType] = useState('all'); // all, expense, saving
  const [sortBy, setSortBy] = useState('date'); // date, amount
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      setAnimKey(prev => prev + 1);
    }
  }, [isFocused]);

  const allTransactions = useMemo(() => {
    const expenseTransactions = expenses.map(e => ({
      ...e,
      type: 'expense',
      displayDate: new Date(e.date),
    }));

    const savingTransactions = savings.map(s => ({
      ...s,
      type: 'saving',
      displayDate: new Date(s.date),
    }));

    let combined = [...expenseTransactions, ...savingTransactions];

    // Apply filter
    if (filterType === 'expense') {
      combined = combined.filter(t => t.type === 'expense');
    } else if (filterType === 'saving') {
      combined = combined.filter(t => t.type === 'saving');
    }

    // Apply sort
    if (sortBy === 'date') {
      combined.sort((a, b) => b.displayDate - a.displayDate);
    } else if (sortBy === 'amount') {
      combined.sort((a, b) => b.amount - a.amount);
    }

    return combined;
  }, [expenses, savings, filterType, sortBy]);

  const handleDelete = (transaction) => {
    if (transaction.type === 'expense') {
      deleteExpense(transaction.id);
    } else {
      deleteSaving(transaction.id);
    }
  };

  const getFilterLabel = () => {
    if (filterType === 'all') return 'ALL TRANSACTIONS';
    if (filterType === 'expense') return 'EXPENSES';
    return 'SAVINGS';
  };

  return (
    <View style={styles.container}>
      <Animatable.View key={`filters-${animKey}`} animation="fadeInDown" delay={100} style={styles.filterBox}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>{getFilterLabel()}</Text>
          <Ionicons name="filter" size={16} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.sortButtons}>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
            onPress={() => setSortBy('date')}
          >
            <Text style={styles.sortButtonText}>DATE</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'amount' && styles.sortButtonActive]}
            onPress={() => setSortBy('amount')}
          >
            <Text style={styles.sortButtonText}>AMOUNT</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>

      <ScrollView style={styles.scrollView}>
        {allTransactions.length === 0 ? (
          <Animatable.View animation="fadeIn" style={styles.emptyBox}>
            <Text style={styles.emptyText}>NO TRANSACTIONS YET.</Text>
          </Animatable.View>
        ) : (
          allTransactions.map((transaction, index) => (
            <Animatable.View 
              key={`${transaction.type}-${transaction.id}`}
              animation="fadeInUp"
              delay={index * 50}
              style={[
                styles.transactionItem,
                transaction.type === 'saving' && styles.transactionItemSaving
              ]}
            >
              <View style={styles.transactionHeader}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>{transaction.title}</Text>
                  <Text style={styles.transactionDate}>
                    {transaction.displayDate.toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </Text>
                  {transaction.type === 'expense' && transaction.category && (
                    <Text style={styles.transactionCategory}>{transaction.category}</Text>
                  )}
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.type === 'saving' && styles.transactionAmountSaving
                  ]}>
                    {transaction.type === 'expense' ? '-' : '+'}₹{transaction.amount.toFixed(2)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(transaction)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </Animatable.View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <Text style={styles.modalTitle}>FILTER TRANSACTIONS.</Text>
            
            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setFilterType('all');
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.filterOptionText}>ALL TRANSACTIONS</Text>
              {filterType === 'all' && <Ionicons name="checkmark" size={20} color="#7eb8ff" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setFilterType('expense');
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.filterOptionText}>EXPENSES ONLY</Text>
              {filterType === 'expense' && <Ionicons name="checkmark" size={20} color="#7eb8ff" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.filterOption}
              onPress={() => {
                setFilterType('saving');
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.filterOptionText}>SAVINGS ONLY</Text>
              {filterType === 'saving' && <Ionicons name="checkmark" size={20} color="#7eb8ff" />}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.buttonText}>CLOSE</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  filterBox: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  filterButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a9eff',
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#1a1a1a',
  },
  filterButtonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 1,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sortButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  sortButtonActive: {
    borderColor: '#7eb8ff',
    backgroundColor: '#0a0a0a',
  },
  sortButtonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 9,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  emptyText: {
    color: '#666666',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 2,
  },
  transactionItem: {
    borderWidth: 1,
    borderColor: '#4a9eff',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#0a0a0a',
  },
  transactionItemSaving: {
    borderColor: '#4ade80',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 12,
    marginBottom: 6,
  },
  transactionDate: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 11,
    marginBottom: 4,
  },
  transactionCategory: {
    color: '#7eb8ff',
    fontFamily: 'UbuntuMono',
    fontSize: 10,
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  transactionAmount: {
    color: '#ff6b6b',
    fontFamily: 'PixelFont',
    fontSize: 16,
    marginBottom: 8,
  },
  transactionAmountSaving: {
    color: '#4ade80',
  },
  deleteButton: {
    padding: 4,
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
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  filterOptionText: {
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
  buttonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 1,
  },
});
