import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import DashboardScreen from './screens/DashboardScreen';
import ExpenseScreen from './screens/ExpenseScreen';
import GoalsScreen from './screens/GoalsScreen';
import IncomeScreen from './screens/IncomeScreen';
import { DataProvider } from './context/DataContext';

const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused }) => (
  <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
    <Text style={styles.tabText}>{label}</Text>
  </View>
);

export default function App() {
  return (
    <DataProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            tabBarStyle: styles.tabBar,
            tabBarShowLabel: false,
          }}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon label="HOME" focused={focused} />
            }}
          />
          <Tab.Screen 
            name="Expense" 
            component={ExpenseScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon label="EXPENSE" focused={focused} />
            }}
          />
          <Tab.Screen 
            name="Goals" 
            component={GoalsScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon label="GOALS" focused={focused} />
            }}
          />
          <Tab.Screen 
            name="Income" 
            component={IncomeScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon label="INCOME" focused={focused} />
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 2,
    borderBottomColor: '#00ff00',
  },
  headerTitle: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 2,
    borderTopColor: '#00ff00',
    height: 60,
  },
  tabIcon: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  tabIconFocused: {
    borderColor: '#00ff00',
    backgroundColor: '#002200',
  },
  tabText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 10,
  },
});
