import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useData } from '../context/DataContext';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function TransactionsScreen() {
  const { expenses, savings, balanceHistory, deleteExpense, deleteSaving, deleteBalanceHistory } = useData();
  const [activeTab, setActiveTab] = useState('transactions'); // transactions, balance
  const [filterType, setFilterType] = useState('all'); // all, expense, saving
  const [sortBy, setSortBy] = useState('date'); // date, amount
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
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

    // Apply type filter
    if (filterType === 'expense') {
      combined = combined.filter(t => t.type === 'expense');
    } else if (filterType === 'saving') {
      combined = combined.filter(t => t.type === 'saving');
    }

    // Apply date range filter
    if (startDate) {
      combined = combined.filter(t => t.displayDate >= startDate);
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      combined = combined.filter(t => t.displayDate <= endOfDay);
    }

    // Apply sort
    if (sortBy === 'date') {
      combined.sort((a, b) => b.displayDate - a.displayDate);
    } else if (sortBy === 'amount') {
      combined.sort((a, b) => b.amount - a.amount);
    }

    return combined;
  }, [expenses, savings, filterType, sortBy, startDate, endDate]);

  const balanceTransactions = useMemo(() => {
    let items = [...balanceHistory].map(b => ({
      ...b,
      displayDate: new Date(b.date),
    }));

    // Apply date range filter
    if (startDate) {
      items = items.filter(t => t.displayDate >= startDate);
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      items = items.filter(t => t.displayDate <= endOfDay);
    }

    // Sort by date
    items.sort((a, b) => b.displayDate - a.displayDate);

    return items;
  }, [balanceHistory, startDate, endDate]);

  const handleDelete = (transaction) => {
    console.log('Delete attempt:', { 
      activeTab, 
      transactionId: transaction?.id, 
      transactionType: transaction?.type,
      transaction 
    });
    
    try {
      if (!transaction || !transaction.id) {
        console.error('Invalid transaction object:', transaction);
        alert('Error: Invalid transaction data');
        return;
      }

      if (activeTab === 'balance') {
        console.log('Deleting balance history item:', transaction.id);
        deleteBalanceHistory(transaction.id);
      } else if (transaction.type === 'expense') {
        console.log('Deleting expense:', transaction.id);
        deleteExpense(transaction.id);
      } else if (transaction.type === 'saving') {
        console.log('Deleting saving:', transaction.id);
        deleteSaving(transaction.id);
      } else {
        console.error('Unknown transaction type:', transaction.type);
        alert('Error: Unknown transaction type');
      }
    } catch (error) {
      console.error('Delete error:', error);
      console.error('Error stack:', error.stack);
      alert(`Error deleting transaction: ${error.message}`);
    }
  };

  const getFilterLabel = () => {
    if (filterType === 'all') return 'ALL TRANSACTIONS';
    if (filterType === 'expense') return 'EXPENSES';
    return 'SAVINGS';
  };

  const clearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    setShowDateRangeModal(false);
  };

  return (
    <View style={styles.container}>
      <Animatable.View key={`tabs-${animKey}`} animation="fadeInDown" delay={50} style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={styles.tabText}>TRANSACTIONS</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'balance' && styles.tabActive]}
          onPress={() => setActiveTab('balance')}
        >
          <Text style={styles.tabText}>BALANCE HISTORY</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View key={`filters-${animKey}`} animation="fadeInDown" delay={100} style={styles.filterBox}>
        <TouchableOpacity 
          style={styles.dateRangeButton}
          onPress={() => setShowDateRangeModal(true)}
        >
          <Ionicons name="calendar-outline" size={16} color="#ffffff" />
          <Text style={styles.dateRangeText}>
            {startDate || endDate 
              ? `${startDate ? startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Start'} - ${endDate ? endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'End'}`
              : 'DATE RANGE'}
          </Text>
        </TouchableOpacity>

        {activeTab === 'transactions' && (
          <>
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
          </>
        )}
      </Animatable.View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'transactions' ? (
          allTransactions.length === 0 ? (
            <Animatable.View animation="fadeIn" style={styles.emptyBox}>
              <Text style={styles.emptyText}>NO TRANSACTIONS YET.</Text>
            </Animatable.View>
          ) : (
            allTransactions.map((transaction, index) => (
              <Animatable.View 
                key={`${transaction.type}-${transaction.id}`}
                animation="fadeInUp"
                delay={index * 30}
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
                      {transaction.type === 'expense' ? '-' : '+'}₹{Number(transaction.amount || 0).toFixed(2)}
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
          )
        ) : (
          balanceTransactions.length === 0 ? (
            <Animatable.View animation="fadeIn" style={styles.emptyBox}>
              <Text style={styles.emptyText}>NO BALANCE HISTORY YET.</Text>
            </Animatable.View>
          ) : (
            balanceTransactions.map((item, index) => (
              <Animatable.View 
                key={`balance-${item.id}`}
                animation="fadeInUp"
                delay={index * 30}
                style={styles.balanceItem}
              >
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{item.title}</Text>
                    <Text style={styles.transactionDate}>
                      {item.displayDate.toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.balanceAmount}>
                      +₹{Number(item.amount || 0).toFixed(2)}
                    </Text>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item)}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Animatable.View>
            ))
          )
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

      <Modal
        visible={showDateRangeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDateRangeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
            <Text style={styles.modalTitle}>SELECT DATE RANGE.</Text>
            
            <Text style={styles.dateLabel}>START DATE</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateInputText}>
                {startDate ? startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select Start Date'}
              </Text>
            </TouchableOpacity>

            {showStartPicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowStartPicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setStartDate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
              />
            )}

            <Text style={styles.dateLabel}>END DATE</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateInputText}>
                {endDate ? endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Select End Date'}
              </Text>
            </TouchableOpacity>

            {showEndPicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowEndPicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setEndDate(selectedDate);
                  }
                }}
                maximumDate={new Date()}
                minimumDate={startDate}
              />
            )}

            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearDateRange}
            >
              <Text style={styles.buttonText}>CLEAR FILTER</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDateRangeModal(false)}
            >
              <Text style={styles.buttonText}>APPLY</Text>
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    backgroundColor: '#0a0a0a',
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#7eb8ff',
  },
  tabText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 9,
    letterSpacing: 1,
  },
  filterBox: {
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    padding: 20,
    backgroundColor: '#0a0a0a',
  },
  dateRangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4ade80',
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#1a1a1a',
    gap: 8,
  },
  dateRangeText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 1,
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
  balanceItem: {
    borderWidth: 1,
    borderColor: '#fbbf24',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#0a0a0a',
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
  balanceAmount: {
    color: '#fbbf24',
    fontFamily: 'PixelFont',
    fontSize: 16,
    marginBottom: 8,
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
  dateLabel: {
    color: '#7eb8ff',
    fontFamily: 'PixelFont',
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 14,
    marginBottom: 8,
    backgroundColor: '#000000',
  },
  dateInputText: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    fontSize: 13,
  },
  clearButton: {
    borderWidth: 1,
    borderColor: '#ff4444',
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginTop: 12,
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
