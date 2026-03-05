import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Animated, TouchableWithoutFeedback } from 'react-native';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { useData } from '../context/DataContext';
import BongoCat from '../components/BongoCat';
import * as Animatable from 'react-native-animatable';
import { useIsFocused } from '@react-navigation/native';

const CATEGORIES = ['Books', 'Food', 'Gifts', 'Movies', 'Groceries', 'Transport', 'Entertainment', 'Others'];
const COLORS = ['#ffffff', '#cccccc', '#999999', '#666666', '#e0e0e0', '#b3b3b3', '#808080', '#4d4d4d'];

const TapRupee = ({ x, y, id, onComplete }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

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
        },
      ]}
    >
      ₹
    </Animated.Text>
  );
};

export default function DashboardScreen() {
  const { expenses, balance } = useData();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [tapRupees, setTapRupees] = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const isFocused = useIsFocused();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

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
      id: Date.now(),
      x: locationX,
      y: locationY,
    };
    setTapRupees([...tapRupees, newRupee]);
  };

  const removeRupee = (id) => {
    setTapRupees(tapRupees.filter(r => r.id !== id));
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
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
  }, [expenses]);

  const totalSpent = useMemo(() => {
    return monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [monthlyExpenses]);

  const categoryData = useMemo(() => {
    const data = {};
    monthlyExpenses.forEach(exp => {
      data[exp.category] = (data[exp.category] || 0) + exp.amount;
    });
    return CATEGORIES.map((cat, idx) => ({
      name: cat,
      amount: data[cat] || 0,
      color: COLORS[idx],
      legendFontColor: '#ffffff',
      legendFontSize: 10,
    })).filter(item => item.amount > 0);
  }, [monthlyExpenses]);

  // Last 7 days spending data
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
          {/* Bongo Cat - separate from balance */}
          <Animatable.View key={`cat-${animKey}`} animation="bounceIn" duration={1500} style={styles.catContainer}>
            <BongoCat size={Dimensions.get('window').width * 0.6} />
          </Animatable.View>

          {/* Balance box */}
          <Animatable.View key={`balance-${animKey}`} animation="fadeInUp" delay={200} style={styles.box}>
            <Text style={styles.title}>BALANCE.</Text>
            <Text style={styles.amount}>₹{balance.toFixed(2)}</Text>
          </Animatable.View>

          <Animatable.View key={`spent-${animKey}`} animation="fadeInUp" delay={400} style={styles.box}>
            <Text style={styles.title}>SPENT THIS MONTH.</Text>
            <Text style={styles.amount}>₹{totalSpent.toFixed(2)}</Text>
        </Animatable.View>

        {last7DaysData.amounts.some(a => a > 0) && (
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

        {categoryData.length > 0 && (
          <Animatable.View key={`pie-${animKey}`} animation="fadeInUp" delay={800} style={styles.box}>
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

        <Animatable.View key={`recent-${animKey}`} animation="fadeInUp" delay={1000} style={styles.boxGray}>
          <Text style={styles.title}>RECENT EXPENSES.</Text>
          {monthlyExpenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses yet</Text>
          ) : (
            monthlyExpenses.slice(-5).reverse().map((exp, idx) => (
              <Animatable.View 
                key={exp.id} 
                animation="fadeInRight" 
                delay={1100 + (idx * 100)}
                style={styles.expenseItem}
              >
                <View>
                  <Text style={styles.expenseText}>{exp.title}</Text>
                  <Text style={styles.expenseCategory}>{exp.category}</Text>
                </View>
                <Text style={styles.expenseAmount}>₹{exp.amount}</Text>
              </Animatable.View>
            ))
          )}
        </Animatable.View>
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
  boxGray: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
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
});
