import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useData } from '../context/DataContext';

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
      <View style={styles.box}>
        <Text style={styles.title}>ADD EXPECTED INCOME</Text>
        <TextInput
          style={styles.input}
          placeholder="Source"
          placeholderTextColor="#006600"
          value={source}
          onChangeText={setSource}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#006600"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Expected Date (e.g., End of March)"
          placeholderTextColor="#006600"
          value={date}
          onChangeText={setDate}
        />
        <TouchableOpacity style={styles.button} onPress={handleAddIncome}>
          <Text style={styles.buttonText}>ADD</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.box}>
        <Text style={styles.title}>INCOME FLOWS</Text>
        {incomeFlows.map(flow => (
          <View key={flow.id} style={styles.flowItem}>
            <Text style={styles.flowSource}>{flow.source}</Text>
            <Text style={styles.flowAmount}>${flow.amount.toFixed(2)}</Text>
            <Text style={styles.flowDate}>{flow.expectedDate}</Text>
            
            {flow.allocations.length > 0 && (
              <View style={styles.allocations}>
                <Text style={styles.allocTitle}>PLAN:</Text>
                {flow.allocations.map((alloc, idx) => (
                  <Text key={idx} style={styles.allocText}>
                    {alloc.type}: ${alloc.amount.toFixed(2)}
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
      </View>

      {selectedFlow && (
        <View style={styles.box}>
          <Text style={styles.title}>PLAN ALLOCATION</Text>
          <TextInput
            style={styles.input}
            placeholder="Savings Amount"
            placeholderTextColor="#006600"
            value={savingsAlloc}
            onChangeText={setSavingsAlloc}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Spend Amount"
            placeholderTextColor="#006600"
            value={spendAlloc}
            onChangeText={setSpendAlloc}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handlePlanAllocation}>
            <Text style={styles.buttonText}>SAVE PLAN</Text>
          </TouchableOpacity>
        </View>
      )}
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
  flowItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  flowSource: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 16,
    marginBottom: 4,
  },
  flowAmount: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  flowDate: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 8,
  },
  allocations: {
    marginVertical: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  allocTitle: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 4,
  },
  allocText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  smallButton: {
    borderWidth: 2,
    borderColor: '#00ff00',
    borderStyle: 'dashed',
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#002200',
  },
  completedText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 14,
    marginTop: 8,
  },
});
