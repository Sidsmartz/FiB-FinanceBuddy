import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import DashboardScreen from './screens/DashboardScreen';
import ExpenseScreen from './screens/ExpenseScreen';
import GoalsScreen from './screens/GoalsScreen';
import IncomeScreen from './screens/IncomeScreen';
import { DataProvider } from './context/DataContext';

const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'PixelFont': require('./assets/fonts/PixelFont.ttf'),
          'UbuntuMono': require('./assets/fonts/UbuntuMono-Regular.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Font loading error:', error);
        setFontsLoaded(true); // Continue anyway
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <DataProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: '#ffffff',
            tabBarInactiveTintColor: '#666666',
          }}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Expense" 
            component={ExpenseScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="wallet" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Goals" 
            component={GoalsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="trophy" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen 
            name="Income" 
            component={IncomeScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="trending-up" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </DataProvider>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 16,
  },
  tabBar: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    height: 60,
  },
});
