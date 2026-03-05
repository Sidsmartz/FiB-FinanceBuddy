import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';
import * as Animatable from 'react-native-animatable';

export default function IncomeScreen() {
  const { incomeFlows, addIncomeFlow, updateIncomeFlow } = useData();
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [savingsAlloc, setSavingsAlloc] = useState('');
  const [spendAlloc, setSpendAlloc] = useState('');

  const handleAddIncome = () => {
    if (!source || !amount || !date) {
      alert('Please fill all fields');
      return;
    }
    addIncomeFlow({
      source,
      amount: parseFloat(amount),
      expectedDate: date,
      allocations: [],
      completed: false,
    });
    setSource('');
    setAmount('');
    setDate('');
  };

  const handlePlanAllocation = () => {
    if (!selectedFlow || !savingsAlloc || !spendAlloc) return;
    
    const flow = incomeFlows.find(f => f.id === selectedFlow);
    const total = parseFloat(savingsAlloc) + parseFloat(spendAlloc);
    
    if (total > flow.amount) {
      alert('Allocation exceeds income amount');
      return;
    }

    updateIncomeFlow(selectedFlow, {
      allocations: [
        { type: 'Savings', amount: parseFloat(savingsAlloc) },
        { type: 'Spend', amount: parseFloat(spendAlloc) },
      ],
    });
    
    setSavingsAlloc('');
    setSpendAlloc('');
    setSelectedFlow(null);
  };

  const handleMarkComplete = (id) => {
    updateIncomeFlow(id, { completed: true });
  };

  return (
    <ScrollView style={styles.container}>
      <Animatable.View animation="fadeInDown" delay={100} style={styles.box}>
        <Text style={styles.title}>ADD EXPECTED INCOME.</Text>
        <TextInput
          style={styles.input}
          placeholder="Source"
          placeholderTextColor="#444444"
          value={source}
          onChangeText={setSource}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#444444"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Expected Date (e.g., End of March)"
          placeholderTextColor="#444444"
          value={date}
          onChangeText={setDate}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddIncome}>
          <Text style={styles.buttonText}>ADD</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View animation="fadeInUp" delay={200} style={styles.box}>
        <Text style={styles.title}>INCOME FLOWS.</Text>
        {incomeFlows.map(flow => (
          <View key={flow.id} style={styles.flowItem}>
            <Text style={styles.flowSource}>{flow.source}</Text>
            <Text style={styles.flowAmount}>₹{flow.amount.toFixed(2)}</Text>
            <Text style={styles.flowDate}>{flow.expectedDate}</Text>
            
            {flow.allocations.length > 0 && (
              <View style={styles.allocations}>
                <Text style={styles.allocTitle}>PLAN:</Text>
                {flow.allocations.map((alloc, idx) => (
                  <Text key={idx} style={styles.allocText}>
                    {alloc.type}: ₹{alloc.amount.toFixed(2)}
                  </Text>
                ))}
              </View>
            )}

            {!flow.completed && (
              <>
                <TouchableOpacity 
                  style={styles.smallButton}
                  onPress={() => setSelectedFlow(flow.id)}
                >
                  <Text style={styles.buttonText}>PLAN ALLOCATION</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.smallButton, { marginTop: 8 }]}
                  onPress={() => handleMarkComplete(flow.id)}
                >
                  <Text style={styles.buttonText}>MARK COMPLETE</Text>
                </TouchableOpacity>
              </>
            )}

            {flow.completed && (
              <Text style={styles.completedText}>✓ COMPLETED</Text>
            )}
          </View>
        ))}
      </Animatable.View>

      {selectedFlow && (
        <Animatable.View animation="fadeIn" style={styles.box}>
          <Text style={styles.title}>PLAN ALLOCATION.</Text>
          <TextInput
            style={styles.input}
            placeholder="Savings Amount"
            placeholderTextColor="#444444"
            value={savingsAlloc}
            onChangeText={setSavingsAlloc}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Spend Amount"
            placeholderTextColor="#444444"
            value={spendAlloc}
            onChangeText={setSpendAlloc}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handlePlanAllocation}>
            <Text style={styles.buttonText}>SAVE PLAN</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
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
  flowItem: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  flowSource: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 12,
    marginBottom: 8,
  },
  flowAmount: {
    color: '#7eb8ff',
    fontFamily: 'PixelFont',
    fontSize: 20,
    marginBottom: 8,
  },
  flowDate: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    marginBottom: 12,
  },
  allocations: {
    marginVertical: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#000000',
  },
  allocTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 8,
  },
  allocText: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    marginBottom: 4,
  },
  smallButton: {
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  completedText: {
    color: '#7eb8ff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    marginTop: 12,
  },
});
