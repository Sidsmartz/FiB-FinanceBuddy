import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import DashboardScreen from './screens/DashboardScreen';
import ExpenseScreen from './screens/ExpenseScreen';
import GoalsScreen from './screens/GoalsScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import { DataProvider } from './context/DataContext';

const Tab = createBottomTabNavigator();

const HeaderTitle = () => (
  <View style={{ flexDirection: 'row' }}>
    <Text style={styles.headerTitleBlue}>FiB</Text>
    <Text style={styles.headerTitle}> - </Text>
    <Text style={styles.headerTitleBlue}>Fi</Text>
    <Text style={styles.headerTitle}>nance </Text>
    <Text style={styles.headerTitleBlue}>B</Text>
    <Text style={styles.headerTitle}>uddy</Text>
  </View>
);

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
              headerTitle: () => <HeaderTitle />,
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
            name="Transactions" 
            component={TransactionsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="list" size={size} color={color} />
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
    fontSize: 14,
  },
  headerTitleBlue: {
    color: '#7eb8ff',
    fontFamily: 'PixelFont',
    fontSize: 14,
  },
  tabBar: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    height: 60,
  },
});
