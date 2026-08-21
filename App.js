import './shims';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import DashboardScreen from './screens/DashboardScreen';
import ExpenseScreen from './screens/ExpenseScreen';
import GoalsScreen from './screens/GoalsScreen';
import TransactionsScreen from './screens/TransactionsScreen';
import BudgetScreen from './screens/BudgetScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import { DataProvider, useData } from './context/DataContext';
import QuickLogActivity from './widget/QuickLogActivity';
import BongoCat from './components/BongoCat';
import * as Animatable from 'react-native-animatable';
import { Dimensions, ActivityIndicator } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const linking = {
  prefixes: ['financebuddy://'],
  config: {
    screens: {
      QuickLog: 'quicklog',
    },
  },
};

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

// Calls checkAndUpdateStreak once on every app open (must be inside DataProvider).
// Requirements: 5.4
function StreakInitialiser() {
  const { checkAndUpdateStreak } = useData();
  useEffect(() => {
    checkAndUpdateStreak();
  }, []);
  return null;
}

function MainTabs() {
  return (
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
        component={DashboardStack}
        options={{
          headerShown: false,
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
  );
}

/**
 * AppRoot — lives inside DataProvider so it can read onboardingComplete.
 * Requirements: 6.1, 6.2 — gates between OnboardingScreen and main tabs.
 */
function AppRoot() {
  const { onboardingComplete, isLoading } = useData();

  if (isLoading) {
    return (
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }]}>
        <Animatable.View animation="pulse" easing="ease-out" iterationCount="infinite" style={{ alignItems: 'center' }}>
          <BongoCat size={Dimensions.get('window').width * 0.4} />
          <Text style={{
            color: '#7eb8ff',
            fontFamily: 'PixelFont',
            fontSize: 12,
            letterSpacing: 2,
            marginTop: 24,
          }}>
            LOADING FiB...
          </Text>
        </Animatable.View>
      </View>
    );
  }

  if (!onboardingComplete) {
    return <OnboardingScreen />;
  }

  return (
    <>
      <StreakInitialiser />
      <NavigationContainer linking={linking}>
        <RootStack.Navigator screenOptions={{ headerShown: false, presentation: 'transparentModal' }}>
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen name="QuickLog">
            {({ navigation }) => <QuickLogActivity onDone={() => navigation.goBack()} />}
          </RootStack.Screen>
        </RootStack.Navigator>
      </NavigationContainer>
    </>
  );
}

// Stack navigator that wraps Dashboard + BudgetScreen
function DashboardStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: '#ffffff',
      }}
    >
      <Stack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={({ navigation }) => ({
          headerTitle: () => <HeaderTitle />,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Budget')}
              style={{ paddingRight: 8 }}
            >
              <Ionicons name="wallet-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ title: 'Monthly Budgets' }}
      />
    </Stack.Navigator>
  );
}

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
      <AppRoot />
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
