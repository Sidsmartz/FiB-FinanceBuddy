import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, TouchableWithoutFeedback, TouchableOpacity, Modal, TextInput, Platform, Alert, Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useData } from '../context/DataContext';
import BongoCat from '../components/BongoCat';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';
import { getBudgetColour, computeInsights, getTimeOfDay } from '../utils/dataLogic';

import { CATEGORY_COLORS_ARRAY } from '../constants/categories';

const TapRupee = ({ x, y, id, onComplete }) => {
  const [translateY] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => onComplete(id));
  }, []);

  return (
    <Animated.Text
      style={[
        styles.tapRupee,
        {
          position: 'absolute',
          left: x - 20,
          top: y - 20,
          opacity,
          transform: [{ translateY }],
          zIndex: 1000,
          pointerEvents: 'none',
        },
      ]}
    >
      ₹
    </Animated.Text>
  );
};

export default function DashboardScreen({ navigation }) {
  const { expenses, savings, balance, updateExpense, deleteExpense, categories, addCustomCategory, getBudgetStatus, getMonthTotals, streak, notifDenied, dismissNotifBanner, userName } = useData();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [tapRupees, setTapRupees] = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthGraph, setShowMonthGraph] = useState(true);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [showEditDateModal, setShowEditDateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [addCatError, setAddCatError] = useState('');
  const isFocused = useIsFocused();

  const currentMonthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

  // Budget statuses for the currently viewed month (re-computed when month changes)
  const budgetStatuses = useMemo(() => {
    return getBudgetStatus(currentMonthKey);
  }, [selectedMonth, selectedYear, expenses]);

  // Insight card data: month-over-month comparison — Requirements: 4.1, 4.2, 4.3
  const insightEntries = useMemo(() => {
    const currentMonth = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    const prevDate = new Date(selectedYear, selectedMonth - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const current = getMonthTotals(currentMonth);
    const previous = getMonthTotals(prevMonth);
    const bothEmpty = Object.keys(current).length === 0 && Object.keys(previous).length === 0;
    if (bothEmpty) return null;
    return computeInsights(current, previous);
  }, [selectedMonth, selectedYear, expenses]);

  const isCurrentMonth = selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth();

  useEffect(() => {
    if (isFocused) {
      setAnimKey(prev => prev + 1);
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isFocused]);

  const handleTap = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const newRupee = {
      id: Date.now() + Math.random(), // Ensure unique ID
      x: locationX,
      y: locationY,
    };
    setTapRupees(prev => [...prev, newRupee]);
  };

  const removeRupee = (id) => {
    setTapRupees(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const monthlyExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === selectedMonth && expDate.getFullYear() === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  const monthlySavings = useMemo(() => {
    return savings.filter(sav => {
      const savDate = new Date(sav.date);
      return savDate.getMonth() === selectedMonth && savDate.getFullYear() === selectedYear;
    });
  }, [savings, selectedMonth, selectedYear]);

  const totalSpent = useMemo(() => {
    return monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [monthlyExpenses]);

  const totalSaved = useMemo(() => {
    return monthlySavings.reduce((sum, sav) => sum + sav.amount, 0);
  }, [monthlySavings]);

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    const now = new Date();
    if (selectedYear === now.getFullYear() && selectedMonth === now.getMonth()) {
      return; // Don't go beyond current month
    }
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const getMonthLabel = () => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${monthNames[selectedMonth]} ${selectedYear.toString().slice(-2)}`;
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setEditTitle(expense.title);
    setEditAmount(expense.amount.toString());
    setEditCategory(expense.category);
    setEditDate(new Date(expense.date));
  };

  const handleSaveEdit = () => {
    if (!editTitle || !editAmount || !editCategory) {
      alert('Please fill all required fields');
      return;
    }

    updateExpense(editingExpense.id, {
      title: editTitle,
      amount: parseFloat(editAmount),
      category: editCategory,
      date: editDate.toISOString(),
      split: editingExpense.split || 0,
    });

    setEditingExpense(null);
    setEditTitle('');
    setEditAmount('');
    setEditCategory('');
    setEditDate(new Date());
  };

  const handleDeleteExpense = (id) => {
    Alert.alert(
      'Delete Transaction',
      'Delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) }
      ]
    );
  };

  const handleAddCategory = () => {
    const result = addCustomCategory(newCatLabel);
    if (result.success) {
      setEditCategory(newCatLabel.trim());
      setNewCatLabel('');
      setAddCatError('');
      setShowAddCatModal(false);
    } else {
      setAddCatError(result.error);
    }
  };

  const categoryData = useMemo(() => {
    const data = {};
    monthlyExpenses.forEach(exp => {
      data[exp.category] = (data[exp.category] || 0) + exp.amount;
    });
    return categories.map((cat, idx) => ({
      name: cat.label,
      amount: data[cat.label] || 0,
      color: CATEGORY_COLORS_ARRAY[idx] || '#444444',
      legendFontColor: '#ffffff',
      legendFontSize: 10,
    })).filter(item => item.amount > 0);
  }, [monthlyExpenses, categories]);

  // Full month spending data (for previous months)
  const monthSpendingData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];
    const amounts = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const dayExpenses = monthlyExpenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getDate() === day;
      });
      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      // Only show every 3rd day label to avoid crowding
      days.push(day % 3 === 1 ? day.toString() : '');
      amounts.push(total);
    }
    return { days, amounts };
  }, [monthlyExpenses, selectedMonth, selectedYear]);

  // Last 7 days spending data (for current month only)
  const last7DaysData = useMemo(() => {
    const days = [];
    const amounts = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.toDateString() === date.toDateString();
      });
      const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      days.push(date.getDate().toString());
      amounts.push(total);
    }
    return { days, amounts };
  }, [expenses]);

  return (
    <ScrollView style={styles.container}>
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={{ minHeight: Dimensions.get('window').height - 100 }}>
          {tapRupees.map(rupee => (
            <TapRupee key={rupee.id} x={rupee.x} y={rupee.y} id={rupee.id} onComplete={removeRupee} />
          ))}
          
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Notification denied banner — Requirements: 5.3 */}
          {notifDenied && (
            <Animatable.View animation="fadeInDown" style={styles.notifBanner}>
              <Text style={styles.notifBannerText}>Enable notifications to get daily reminders</Text>
              <View style={styles.notifBannerActions}>
                <TouchableOpacity
                  style={styles.notifBannerButton}
                  onPress={() => Linking.openSettings()}
                >
                  <Text style={styles.notifBannerButtonText}>SETTINGS</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.notifBannerDismiss}
                  onPress={dismissNotifBanner}
                >
                  <Text style={styles.notifBannerDismissText}>✕</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          )}
          {/* Month Navigation */}
          {/* Personalised greeting — Requirements: 8.1, 8.2, 8.3 */}
          {!!userName && (
            <Animatable.View key={`greeting-${animKey}`} animation="fadeInDown" delay={50} style={styles.greetingContainer}>
              <Text style={styles.greetingText}>
                Hello, {userName}! Good {getTimeOfDay(new Date().getHours())}
              </Text>
            </Animatable.View>
          )}
          {/* Month Navigation */}
          <Animatable.View key={`month-${animKey}`} animation="fadeInDown" delay={100} style={styles.monthNav}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <Text style={styles.navArrow}>◄</Text>
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{getMonthLabel()}</Text>
            <TouchableOpacity 
              onPress={goToNextMonth} 
              style={styles.navButton}
              disabled={selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth()}
            >
              <Text style={[styles.navArrow, (selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth()) && styles.navDisabled]}>►</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Bongo Cat - separate from balance */}
          <Animatable.View key={`cat-${animKey}`} animation="bounceIn" duration={1500} style={styles.catContainer}>
            <BongoCat size={Dimensions.get('window').width * 0.6} />
          </Animatable.View>

          {/* Balance box - only show for current month */}
          {isCurrentMonth && (
            <Animatable.View key={`balance-${animKey}`} animation="fadeInUp" delay={200} style={styles.balanceRow}>
              <View style={[styles.box, styles.balanceBox]}>
                <Text style={styles.title}>BALANCE.</Text>
                <Text style={styles.amount}>₹{balance.toFixed(2)}</Text>
              </View>
              {streak > 0 && (
                <View style={styles.streakPill}>
                  <Text style={styles.streakText}>🔥 {streak} day streak</Text>
                </View>
              )}
            </Animatable.View>
          )}

          <Animatable.View key={`spent-${animKey}`} animation="fadeInUp" delay={isCurrentMonth ? 400 : 200} style={styles.box}>
            <Text style={styles.title}>SPENT THIS MONTH.</Text>
            <Text style={styles.amount}>₹{totalSpent.toFixed(2)}</Text>
        </Animatable.View>

        <Animatable.View key={`saved-${animKey}`} animation="fadeInUp" delay={isCurrentMonth ? 500 : 300} style={styles.boxGreen}>
            <Text style={styles.title}>SAVED THIS MONTH.</Text>
            <Text style={styles.amountGreen}>₹{totalSaved.toFixed(2)}</Text>
        </Animatable.View>

        {/* Insight card — month-over-month comparison. Requirements: 4.1–4.5 */}
        <Animatable.View key={`insight-${animKey}`} animation="fadeInUp" delay={isCurrentMonth ? 550 : 250} style={styles.box}>
          <Text style={styles.title}>MONTH OVER MONTH.</Text>
          {insightEntries === null ? (
            <Text style={styles.emptyText}>Not enough data yet — keep logging!</Text>
          ) : (
            <>
              {/* Primary insight — largest absolute change */}
              {(() => {
                const primary = insightEntries[0];
                const isIncrease = primary.delta > 0;
                const tintColor = isIncrease ? '#ff6b6b' : '#4ade80';
                const arrow = isIncrease ? '▲' : '▼';
                const pctStr = isFinite(primary.pct)
                  ? `${Math.abs(primary.pct).toFixed(0)}%`
                  : 'new';
                return (
                  <View style={styles.insightPrimary}>
                    <Text style={[styles.insightPrimaryText, { color: tintColor }]}>
                      {arrow} {primary.category}: ₹{Math.abs(primary.delta).toFixed(0)} ({pctStr})
                    </Text>
                  </View>
                );
              })()}

              {/* 2-column list of all category changes */}
              <View style={styles.insightGrid}>
                {insightEntries.map((entry) => {
                  const isIncrease = entry.delta > 0;
                  const colour = isIncrease ? '#ff6b6b' : '#4ade80';
                  const arrow = isIncrease ? '▲' : entry.delta < 0 ? '▼' : '–';
                  const pctStr = isFinite(entry.pct)
                    ? `${Math.abs(entry.pct).toFixed(0)}%`
                    : 'new';
                  return (
                    <View key={entry.category} style={styles.insightCell}>
                      <Text style={styles.insightCatText} numberOfLines={1}>{entry.category}</Text>
                      <Text style={[styles.insightChangeText, { color: colour }]}>
                        {arrow} {pctStr}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </Animatable.View>

        {/* Last 7 days - only for current month */}
        {isCurrentMonth && last7DaysData.amounts.some(a => a > 0) && (
          <Animatable.View key={`chart-${animKey}`} animation="fadeInUp" delay={600} style={styles.box}>
            <Text style={styles.title}>LAST 7 DAYS SPENDING.</Text>
            <LineChart
              data={{
                labels: last7DaysData.days,
                datasets: [{ data: last7DaysData.amounts.length > 0 ? last7DaysData.amounts : [0] }],
              }}
              width={Dimensions.get('window').width - 80}
              height={180}
              chartConfig={{
                backgroundColor: '#000000',
                backgroundGradientFrom: '#0a0a0a',
                backgroundGradientTo: '#1a1a1a',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 0 },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#ffffff',
                },
              }}
              bezier
              style={styles.chart}
            />
          </Animatable.View>
        )}

        {/* Full month graph - with toggle */}
        {showMonthGraph && monthSpendingData.amounts.some(a => a > 0) && (
          <Animatable.View key={`monthchart-${animKey}`} animation="fadeInUp" delay={isCurrentMonth ? 700 : 400} style={styles.box}>
            <View style={styles.chartHeader}>
              <Text style={styles.title}>MONTHLY SPENDING.</Text>
              <TouchableOpacity onPress={() => setShowMonthGraph(false)}>
                <Text style={styles.toggleText}>HIDE</Text>
              </TouchableOpacity>
            </View>
            <LineChart
              data={{
                labels: monthSpendingData.days,
                datasets: [{ data: monthSpendingData.amounts.length > 0 ? monthSpendingData.amounts : [0] }],
              }}
              width={Dimensions.get('window').width - 80}
              height={200}
              chartConfig={{
                backgroundColor: '#000000',
                backgroundGradientFrom: '#0a0a0a',
                backgroundGradientTo: '#1a1a1a',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 0 },
                propsForDots: {
                  r: '2',
                  strokeWidth: '1',
                  stroke: '#ffffff',
                },
              }}
              bezier
              style={styles.chart}
            />
          </Animatable.View>
        )}

        {!showMonthGraph && (
          <Animatable.View key={`showgraph-${animKey}`} animation="fadeInUp" style={styles.boxToggle}>
            <TouchableOpacity onPress={() => setShowMonthGraph(true)}>
              <Text style={styles.toggleTextLarge}>SHOW MONTHLY GRAPH</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}

        {categoryData.length > 0 && (
          <Animatable.View key={`pie-${animKey}`} animation="fadeInUp" delay={isCurrentMonth ? 800 : 500} style={styles.box}>
            <Text style={styles.title}>SPENDING BY CATEGORY.</Text>
            <PieChart
              data={categoryData}
              width={Dimensions.get('window').width - 80}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                backgroundColor: '#000000',
              }}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="10"
              absolute
            />
          </Animatable.View>
        )}

        {/* Budget progress bars */}
        <Animatable.View key={`budget-${animKey}`} animation="fadeInUp" delay={isCurrentMonth ? 900 : 550} style={styles.box}>
          <View style={styles.budgetHeader}>
            <Text style={styles.title}>MONTHLY BUDGETS.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Budget')} style={styles.budgetLink}>
              <Text style={styles.budgetLinkText}>SET →</Text>
            </TouchableOpacity>
          </View>
          {budgetStatuses.length === 0 ? (
            <TouchableOpacity onPress={() => navigation.navigate('Budget')}>
              <Text style={styles.emptyText}>No budgets set — tap to set up budgets</Text>
            </TouchableOpacity>
          ) : (
            budgetStatuses.map((status) => {
              const colour = getBudgetColour(status.percent);
              const barColour = colour === 'red' ? '#ff6b6b' : colour === 'amber' ? '#f59e0b' : '#4ade80';
              const fillWidth = Math.min(status.percent, 100);
              return (
                <View key={status.category} style={styles.budgetRow}>
                  <View style={styles.budgetLabelRow}>
                    <Text style={styles.budgetCategoryText}>{status.category}</Text>
                    <Text style={[styles.budgetAmountText, { color: barColour }]}>
                      ₹{status.spent.toFixed(0)} / ₹{status.limit.toFixed(0)}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${fillWidth}%`, backgroundColor: barColour }]} />
                  </View>
                </View>
              );
            })
          )}
        </Animatable.View>

        <Animatable.View key={`recent-${animKey}`} animation="fadeInUp" delay={isCurrentMonth ? 1000 : 600} style={styles.boxGray}>
          <Text style={styles.title}>{isCurrentMonth ? 'RECENT EXPENSES.' : 'TRANSACTIONS.'}</Text>
          {monthlyExpenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses yet</Text>
          ) : (
            monthlyExpenses.slice(isCurrentMonth ? -5 : 0).reverse().map((exp, idx) => (
              <Animatable.View 
                key={exp.id} 
                animation="fadeInRight" 
                delay={(isCurrentMonth ? 1100 : 700) + (idx * 100)}
                style={styles.expenseItem}
              >
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseText}>{exp.title}</Text>
                  <Text style={styles.expenseCategory}>
                    {exp.category} ΓÇó {new Date(exp.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </Text>
                </View>
                <View style={styles.expenseRight}>
                  <Text style={styles.expenseAmount}>₹{exp.amount}</Text>
                  <View style={styles.expenseActions}>
                    <TouchableOpacity onPress={() => handleEditExpense(exp)} style={styles.actionButton}>
                      <Text style={styles.actionText}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteExpense(exp.id)} style={styles.actionButton}>
                      <Text style={styles.deleteActionText}>×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animatable.View>
            ))
          )}
        </Animatable.View>

        {/* Edit Modal */}
        <Modal
          visible={editingExpense !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingExpense(null)}
        >
          <View style={styles.modalOverlay}>
            <Animatable.View animation="zoomIn" duration={300} style={styles.modalBox}>
              <Text style={styles.modalTitle}>EDIT TRANSACTION.</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Title"
                placeholderTextColor="#444444"
                value={editTitle}
                onChangeText={setEditTitle}
              />

              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor="#444444"
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
              />

              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={[styles.inputText, !editCategory && styles.placeholder]}>
                  {editCategory || 'Select Category'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.input} 
                onPress={() => setShowEditDateModal(true)}
              >
                <Text style={styles.inputText}>
                  {editDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </Text>
              </TouchableOpacity>

              {showEditDateModal && (
                <DateTimePicker
                  value={editDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowEditDateModal(Platform.OS === 'ios');
                    if (selectedDate) {
                      setEditDate(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}

              <TouchableOpacity 
                style={styles.button}
                onPress={handleSaveEdit}
              >
                <Text style={styles.buttonText}>SAVE</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setEditingExpense(null)}
              >
                <Text style={styles.buttonText}>CANCEL</Text>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </Modal>

        {/* Category Modal */}
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
                <Animatable.View
                  key={cat.id}
                  animation="fadeInRight"
                  delay={idx * 50}
                >
                  <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => {
                      setEditCategory(cat.label);
                      setShowCategoryModal(false);
                    }}
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
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowCategoryModal(false)}
              >
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
      </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  catContainer: {
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 30,
  },
  box: {
    borderWidth: 1,
    borderColor: '#4a9eff',
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
  },
  boxGreen: {
    borderWidth: 1,
    borderColor: '#4ade80',
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
  },
  boxGray: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 20,
    marginBottom: 40,
    backgroundColor: '#0a0a0a',
  },
  boxToggle: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 12,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleText: {
    color: '#666666',
    fontFamily: 'PixelFont',
    fontSize: 8,
    letterSpacing: 1,
  },
  toggleTextLarge: {
    color: '#666666',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 2,
  },
  amount: {
    color: '#7eb8ff',
    fontFamily: 'PixelFont',
    fontSize: 24,
  },
  amountGreen: {
    color: '#4ade80',
    fontFamily: 'PixelFont',
    fontSize: 24,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
  },
  monthLabel: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 14,
    letterSpacing: 2,
  },
  navButton: {
    padding: 8,
  },
  navArrow: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 16,
  },
  navDisabled: {
    color: '#333333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 0,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseText: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
  },
  expenseCategory: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 10,
    marginTop: 2,
  },
  expenseAmount: {
    color: '#7eb8ff',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    marginBottom: 4,
  },
  expenseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionText: {
    color: '#7eb8ff',
    fontFamily: 'PixelFont',
    fontSize: 14,
  },
  deleteActionText: {
    color: '#ff6b6b',
    fontFamily: 'PixelFont',
    fontSize: 18,
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
  closeButton: {
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginTop: 12,
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
  addCategoryItem: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  addCategoryText: {
    color: '#7eb8ff',
    fontFamily: 'UbuntuMono',
    fontSize: 13,
  },
  errorText: {
    color: '#ff6b6b',
    fontFamily: 'UbuntuMono',
    fontSize: 11,
    marginBottom: 10,
  },
  emptyText: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  tapRupee: {
    color: '#7eb8ff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetLink: {
    padding: 4,
  },
  budgetLinkText: {
    color: '#7eb8ff',
    fontFamily: 'PixelFont',
    fontSize: 8,
    letterSpacing: 1,
  },
  budgetRow: {
    marginBottom: 12,
  },
  budgetLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  budgetCategoryText: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    fontSize: 11,
  },
  budgetAmountText: {
    fontFamily: 'UbuntuMono',
    fontSize: 11,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  progressFill: {
    height: '100%',
  },
  insightPrimary: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  insightPrimaryText: {
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 1,
  },
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  insightCell: {
    width: '50%',
    paddingVertical: 4,
    paddingRight: 8,
  },
  insightCatText: {
    color: '#aaaaaa',
    fontFamily: 'UbuntuMono',
    fontSize: 10,
  },
  insightChangeText: {
    fontFamily: 'UbuntuMono',
    fontSize: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  balanceBox: {
    flex: 1,
    marginBottom: 0,
  },
  streakPill: {
    borderWidth: 1,
    borderColor: '#f97316',
    backgroundColor: '#0a0a0a',
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakText: {
    color: '#f97316',
    fontFamily: 'PixelFont',
    fontSize: 9,
    letterSpacing: 1,
  },
  notifBanner: {
    borderWidth: 1,
    borderColor: '#f59e0b',
    backgroundColor: '#1a1000',
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifBannerText: {
    color: '#f59e0b',
    fontFamily: 'UbuntuMono',
    fontSize: 11,
    flex: 1,
    marginRight: 8,
  },
  notifBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notifBannerButton: {
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  notifBannerButtonText: {
    color: '#f59e0b',
    fontFamily: 'PixelFont',
    fontSize: 8,
    letterSpacing: 1,
  },
  notifBannerDismiss: {
    padding: 4,
  },
  notifBannerDismissText: {
    color: '#f59e0b',
    fontFamily: 'UbuntuMono',
    fontSize: 14,
  },
  greetingContainer: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  greetingText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 11,
    letterSpacing: 1,
  },
});
