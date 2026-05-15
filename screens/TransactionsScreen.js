import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, Platform, Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';
import { useData } from '../context/DataContext';

const TABS = ['EXPENSES', 'BALANCE', 'SAVINGS'];
const CATEGORIES = ['All', 'Books', 'Food', 'Gifts', 'Movies', 'Groceries', 'Transport', 'Entertainment', 'Others'];

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TransactionsScreen() {
  const { expenses, balanceHistory, savings, deleteExpense, deleteBalanceHistory, deleteSaving } = useData();
  const isFocused = useIsFocused();
  const [animKey, setAnimKey] = useState(0);
  const [activeTab, setActiveTab] = useState('EXPENSES');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  React.useEffect(() => {
    if (isFocused) setAnimKey(prev => prev + 1);
  }, [isFocused]);

  const filtered = useMemo(() => {
    let list = [];
    if (activeTab === 'EXPENSES') list = [...expenses];
    else if (activeTab === 'BALANCE') list = [...balanceHistory];
    else if (activeTab === 'SAVINGS') list = [...savings];

    // Sort newest first
    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Category filter (expenses only)
    if (activeTab === 'EXPENSES' && categoryFilter !== 'All') {
      list = list.filter(e => e.category === categoryFilter);
    }

    // Date range
    if (fromDate) list = list.filter(e => new Date(e.date) >= fromDate);
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter(e => new Date(e.date) <= end);
    }

    return list;
  }, [activeTab, expenses, balanceHistory, savings, categoryFilter, fromDate, toDate]);

  const total = useMemo(() =>
    filtered.reduce((sum, item) => sum + item.amount, 0),
    [filtered]
  );

  const clearFilters = () => {
    setCategoryFilter('All');
    setFromDate(null);
    setToDate(null);
  };

  const confirmDelete = (item) => {
    Alert.alert(
      'Delete',
      `Delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: () => {
            if (activeTab === 'EXPENSES') deleteExpense(item.id);
            else if (activeTab === 'BALANCE') deleteBalanceHistory(item.id);
            else if (activeTab === 'SAVINGS') deleteSaving(item.id);
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <Animatable.View key={`tabs-${animKey}`} animation="fadeInDown" delay={80} style={styles.tabRow}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </Animatable.View>

      {/* Filters */}
      <Animatable.View key={`filters-${animKey}`} animation="fadeInDown" delay={140} style={styles.filterRow}>
        {activeTab === 'EXPENSES' && (
          <TouchableOpacity style={styles.filterChip} onPress={() => setShowCategoryModal(true)}>
            <Text style={styles.filterChipText}>{categoryFilter === 'All' ? 'CATEGORY' : categoryFilter.toUpperCase()}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.filterChip} onPress={() => setShowFromPicker(true)}>
          <Text style={styles.filterChipText}>{fromDate ? formatDate(fromDate) : 'FROM'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setShowToPicker(true)}>
          <Text style={styles.filterChipText}>{toDate ? formatDate(toDate) : 'TO'}</Text>
        </TouchableOpacity>
        {(categoryFilter !== 'All' || fromDate || toDate) && (
          <TouchableOpacity style={styles.clearChip} onPress={clearFilters}>
            <Text style={styles.clearChipText}>✕</Text>
          </TouchableOpacity>
        )}
      </Animatable.View>

      {showFromPicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => { setShowFromPicker(false); if (d) setFromDate(d); }}
          maximumDate={new Date()}
        />
      )}
      {showToPicker && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, d) => { setShowToPicker(false); if (d) setToDate(d); }}
          maximumDate={new Date()}
        />
      )}

      {/* Summary */}
      <Animatable.View key={`summary-${animKey}`} animation="fadeIn" delay={180} style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{filtered.length} ITEMS</Text>
        <Text style={styles.summaryAmount}>
          {activeTab === 'BALANCE' ? '+' : '-'}₹{total.toFixed(2)}
        </Text>
      </Animatable.View>

      {/* List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text style={styles.emptyText}>No transactions found.</Text>
        ) : (
          filtered.map((item, idx) => (
            <Animatable.View
              key={item.id}
              animation="fadeInUp"
              delay={idx * 40}
              style={styles.item}
            >
              <View style={styles.itemLeft}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemMeta}>
                  {formatDate(item.date)}
                  {item.category ? `  ·  ${item.category}` : ''}
                  {item.split ? `  ·  split ₹${item.split}` : ''}
                </Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={[
                  styles.itemAmount,
                  activeTab === 'BALANCE' ? styles.amountGreen : styles.amountRed
                ]}>
                  {activeTab === 'BALANCE' ? '+' : '-'}₹{item.amount.toFixed(2)}
                </Text>
                <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Category filter modal */}
      <Modal visible={showCategoryModal} transparent animationType="fade" onRequestClose={() => setShowCategoryModal(false)}>
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={250} style={styles.modalBox}>
            <Text style={styles.modalTitle}>FILTER BY CATEGORY.</Text>
            {CATEGORIES.map((cat, idx) => (
              <Animatable.View key={cat} animation="fadeInRight" delay={idx * 40}>
                <TouchableOpacity
                  style={[styles.catItem, categoryFilter === cat && styles.catItemActive]}
                  onPress={() => { setCategoryFilter(cat); setShowCategoryModal(false); }}
                >
                  <Text style={[styles.catText, categoryFilter === cat && styles.catTextActive]}>{cat}</Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCategoryModal(false)}>
              <Text style={styles.closeBtnText}>CLOSE</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4a9eff' },
  tabText: { color: '#555', fontFamily: 'PixelFont', fontSize: 8, letterSpacing: 1 },
  tabTextActive: { color: '#ffffff' },
  filterRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#111',
  },
  filterChip: {
    borderWidth: 1, borderColor: '#333', paddingHorizontal: 10,
    paddingVertical: 6, backgroundColor: '#0a0a0a',
  },
  filterChipText: { color: '#aaa', fontFamily: 'PixelFont', fontSize: 7, letterSpacing: 1 },
  clearChip: {
    borderWidth: 1, borderColor: '#ff6b6b', paddingHorizontal: 10,
    paddingVertical: 6, backgroundColor: '#0a0a0a',
  },
  clearChipText: { color: '#ff6b6b', fontFamily: 'PixelFont', fontSize: 9 },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#111',
  },
  summaryLabel: { color: '#444', fontFamily: 'PixelFont', fontSize: 8, letterSpacing: 1 },
  summaryAmount: { color: '#ffffff', fontFamily: 'PixelFont', fontSize: 12 },
  list: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  emptyText: {
    color: '#444', fontFamily: 'UbuntuMono', fontSize: 12,
    textAlign: 'center', marginTop: 60,
  },
  item: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#111',
  },
  itemLeft: { flex: 1, marginRight: 12 },
  itemTitle: { color: '#ffffff', fontFamily: 'UbuntuMono', fontSize: 13, marginBottom: 4 },
  itemMeta: { color: '#444', fontFamily: 'UbuntuMono', fontSize: 10 },
  itemRight: { alignItems: 'flex-end', gap: 6 },
  itemAmount: { fontFamily: 'PixelFont', fontSize: 11 },
  amountRed: { color: '#ff6b6b' },
  amountGreen: { color: '#4ade80' },
  deleteBtn: { padding: 4 },
  deleteText: { color: '#333', fontFamily: 'PixelFont', fontSize: 10 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center', padding: 20,
  },
  modalBox: {
    borderWidth: 1, borderColor: '#333',
    padding: 20, backgroundColor: '#0a0a0a',
  },
  modalTitle: {
    color: '#ffffff', fontFamily: 'PixelFont',
    fontSize: 10, letterSpacing: 2, marginBottom: 16,
  },
  catItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#111' },
  catItemActive: { backgroundColor: '#111' },
  catText: { color: '#666', fontFamily: 'UbuntuMono', fontSize: 13 },
  catTextActive: { color: '#ffffff' },
  closeBtn: {
    borderWidth: 1, borderColor: '#333', padding: 14,
    alignItems: 'center', marginTop: 12, backgroundColor: '#0a0a0a',
  },
  closeBtnText: { color: '#ffffff', fontFamily: 'PixelFont', fontSize: 10, letterSpacing: 1 },
});
