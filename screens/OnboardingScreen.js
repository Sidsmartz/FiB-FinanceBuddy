/**
 * screens/OnboardingScreen.js — 3-step first-run onboarding pager.
 * Requirements: 6.1–6.11
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import BongoCat from '../components/BongoCat';
import { useData } from '../context/DataContext';
import { setMeta } from '../utils/db';

const PRIVACY_POLICY_TEXT = `Privacy Policy for FinanceBuddy

Effective Date: July 27, 2026

1. Information Collection and Use
FinanceBuddy is designed with your privacy in mind. We do not collect, store, or transmit any personally identifiable information (PII).

The app operates completely offline, and all your financial data, transactions, and settings are stored locally on your device.

2. Analytics
We may collect basic, anonymous analytics data (such as install counts and crash reports) strictly for the purpose of improving the app's performance and understanding its usage. This data contains no personal information and cannot be linked back to you.

3. Data Retention and Updates
Your data remains securely on your device. When you update the app via the App Store or Google Play Store, your data will not be lost. App updates are designed to preserve all local storage. However, if you uninstall the app or clear its data in your device settings, your stored data will be permanently deleted unless you have made a manual backup.

4. Changes to This Privacy Policy
We may update our Privacy Policy from time to time. You are advised to review this page periodically for any changes.

5. Contact Us
If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.`;

const FREQUENCIES = ['Monthly', 'Weekly', 'Bi-weekly', 'Irregular'];

export default function OnboardingScreen() {
  const { categories, addIncomeFlow, setBudget, getDB, completeOnboarding } = useData();

  // ─── Step state ───────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);

  // Step 0 — Welcome
  const [nameInput, setNameInput] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Step 1 — Income
  const [hasIncome, setHasIncome] = useState(null); // null = not answered yet
  const [incomeAmount, setIncomeAmount] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [autoAdd, setAutoAdd] = useState(false);

  // Step 2 — Budget
  const [budgetInputs, setBudgetInputs] = useState({});

  // ─── Step 0 handlers ─────────────────────────────────────────────────────
  const handleGetStarted = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      const db = getDB();
      if (db) setMeta(db, 'user_name', trimmed);
    }
    setStep(1);
  };

  // ─── Step 1 handlers ─────────────────────────────────────────────────────
  const handleIncomeNext = () => {
    if (hasIncome === true) {
      const amount = parseFloat(incomeAmount);
      if (incomeAmount && !isNaN(amount) && amount > 0 && frequency !== 'Irregular') {
        addIncomeFlow({
          source: 'Monthly Income',
          amount,
          frequency,
          recurring: true,
          autoAdd: frequency !== 'Irregular' ? autoAdd : false,
          completed: false,
          savingsAlloc: 0,
          spendAlloc: 0,
        });
      }
    }
    setStep(2);
  };

  const handleSkipIncome = () => setStep(2);

  // ─── Step 2 handlers ─────────────────────────────────────────────────────
  const handleDone = () => {
    Object.entries(budgetInputs).forEach(([category, val]) => {
      const limit = parseFloat(val);
      if (val && !isNaN(limit) && limit > 0) {
        setBudget(category, limit);
      }
    });
    const db = getDB();
    if (db) setMeta(db, 'onboarding_complete', '1');
    completeOnboarding();
  };

  // ─── Renderers ────────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <Animatable.View animation="fadeIn" duration={600} style={styles.stepContainer}>
      <View style={styles.catContainer}>
        <BongoCat size={Dimensions.get('window').width * 0.55} />
      </View>

      <Text style={styles.appTitle}>FiB</Text>
      <Text style={styles.tagline}>Your bongo-cat finance buddy</Text>
      <Text style={styles.tagline}>An app developed to make tracking, budgeting, saving easy. </Text>

      <TextInput
        style={styles.input}
        placeholder="What's your name? (optional)"
        placeholderTextColor="#444444"
        value={nameInput}
        onChangeText={setNameInput}
        autoCapitalize="words"
      />

      <TouchableOpacity onPress={() => setShowPrivacy(true)} style={styles.privacyLink}>
        <Text style={styles.privacyLinkText}>Privacy Policy</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
        <Text style={styles.primaryButtonText}>Get Started →</Text>
      </TouchableOpacity>

      <Modal
        visible={showPrivacy}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrivacy(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={300} style={styles.privacyModal}>
            <Text style={styles.modalTitle}>PRIVACY POLICY.</Text>
            <ScrollView style={styles.privacyScroll} showsVerticalScrollIndicator>
              <Text style={styles.privacyText}>{PRIVACY_POLICY_TEXT}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowPrivacy(false)}>
              <Text style={styles.buttonText}>CLOSE</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </Animatable.View>
  );

  const incomeFieldsDisabled = hasIncome !== true;

  const renderStep1 = () => (
    <Animatable.View animation="fadeIn" duration={600} style={styles.stepContainer}>
      <Text style={styles.stepTitle}>INCOME SETUP.</Text>
      <Text style={styles.stepSubtitle}>Tell FiB about your income so it can track your balance.</Text>

      {/* Do you have income? — shown first */}
      <Text style={styles.label}>Do you have a regular income?</Text>
      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.chip, hasIncome === true && styles.chipSelected]}
          onPress={() => setHasIncome(true)}
        >
          <Text style={[styles.chipText, hasIncome === true && styles.chipTextSelected]}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, hasIncome === false && styles.chipSelectedNo]}
          onPress={() => setHasIncome(false)}
        >
          <Text style={[styles.chipText, hasIncome === false && styles.chipTextSelected]}>No</Text>
        </TouchableOpacity>
      </View>

      {/* Amount — greyed out if no income */}
      <TextInput
        style={[styles.input, incomeFieldsDisabled && styles.inputDisabled]}
        placeholder="Monthly amount (₹)"
        placeholderTextColor="#333333"
        value={incomeAmount}
        onChangeText={setIncomeAmount}
        keyboardType="numeric"
        editable={!incomeFieldsDisabled}
      />

      {/* Frequency picker — greyed out if no income */}
      <Text style={[styles.label, incomeFieldsDisabled && styles.disabledText]}>Frequency</Text>
      <View style={styles.chipRow}>
        {FREQUENCIES.map((freq) => (
          <TouchableOpacity
            key={freq}
            style={[
              styles.chip,
              frequency === freq && !incomeFieldsDisabled && styles.chipSelected,
              incomeFieldsDisabled && styles.chipDisabled,
            ]}
            onPress={() => {
              if (incomeFieldsDisabled) return;
              setFrequency(freq);
              if (freq === 'Irregular') setAutoAdd(false);
            }}
            disabled={incomeFieldsDisabled}
          >
            <Text style={[
              styles.chipText,
              frequency === freq && !incomeFieldsDisabled && styles.chipTextSelected,
              incomeFieldsDisabled && styles.disabledText,
            ]}>
              {freq}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Auto-add toggle — greyed out if no income or Irregular */}
      <View style={[styles.toggleRow, (incomeFieldsDisabled || frequency === 'Irregular') && styles.toggleRowDisabled]}>
        <Text style={[styles.toggleLabel, (incomeFieldsDisabled || frequency === 'Irregular') && styles.disabledText]}>
          Auto-add to balance on due date
        </Text>
        <Switch
          value={autoAdd}
          onValueChange={setAutoAdd}
          disabled={incomeFieldsDisabled || frequency === 'Irregular'}
          trackColor={{ false: '#333333', true: '#4a9eff' }}
          thumbColor={autoAdd && !incomeFieldsDisabled ? '#ffffff' : '#444444'}
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleIncomeNext}>
        <Text style={styles.primaryButtonText}>Next →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipLink} onPress={handleSkipIncome}>
        <Text style={styles.skipLinkText}>I'll set this up later</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderStep2 = () => (
    <Animatable.View animation="fadeIn" duration={600} style={[styles.stepContainer, { flex: 1 }]}>
      <Text style={styles.stepTitle}>BUDGET SETUP.</Text>
      <Text style={styles.stepSubtitle}>Set monthly spending limits per category (optional).</Text>

      {/* Use plain View rows instead of FlatList to avoid nested VirtualizedList warning */}
      {categories.map((item) => (
        <View key={item.id} style={styles.budgetRow}>
          <Text style={styles.budgetLabel}>{item.label}</Text>
          <TextInput
            style={styles.budgetInput}
            placeholder="₹ limit"
            placeholderTextColor="#444444"
            value={budgetInputs[item.label] || ''}
            onChangeText={(val) =>
              setBudgetInputs((prev) => ({ ...prev, [item.label]: val }))
            }
            keyboardType="numeric"
          />
        </View>
      ))}

      <TouchableOpacity style={[styles.primaryButton, styles.doneButton]} onPress={handleDone}>
        <Text style={styles.primaryButtonText}>Done ✓</Text>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && renderStep0()}
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </ScrollView>

      <View style={styles.dotRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
        ))}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 48, // increased top padding for better spacing
    paddingBottom: 72, // increased from 60 for more bottom space
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },

  // ─── Step 0 ───────────────────────────────────────────────────────────────
  catContainer: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  appTitle: {
    color: '#7eb8ff',
    fontFamily: 'PixelFont',
    fontSize: 48,
    letterSpacing: 6,
    marginBottom: 8,
  },
  tagline: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 1,
  },
  privacyLink: {
    marginBottom: 24,
  },
  privacyLinkText: {
    color: '#4a9eff',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    textDecorationLine: 'underline',
  },

  // ─── Step 1 ───────────────────────────────────────────────────────────────
  stepTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 14,
    letterSpacing: 2,
    marginBottom: 12, // increased from 8
    marginTop: 24, // increased from 16
    alignSelf: 'flex-start',
  },
  stepSubtitle: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    marginBottom: 32, // increased from 24
    alignSelf: 'flex-start',
    lineHeight: 18,
  },
  label: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 14, // increased from 10
    alignSelf: 'flex-start',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24, // increased from 20
    alignSelf: 'flex-start',
  },
  chip: {
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0a0a0a',
  },
  chipSelected: {
    borderColor: '#4a9eff',
    backgroundColor: '#0d1a2e',
  },
  chipSelectedNo: {
    borderColor: '#666666',
    backgroundColor: '#1a1a1a',
  },
  chipDisabled: {
    borderColor: '#1a1a1a',
    backgroundColor: '#050505',
  },
  chipText: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
  },
  chipTextSelected: {
    color: '#4a9eff',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32, // increased from 28
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 16, // increased from 14
    backgroundColor: '#0a0a0a',
  },
  toggleRowDisabled: {
    borderColor: '#111111',
    backgroundColor: '#050505',
  },
  toggleLabel: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    flex: 1,
    marginRight: 12,
  },
  disabledText: {
    color: '#333333',
  },
  inputDisabled: {
    borderColor: '#1a1a1a',
    color: '#333333',
    backgroundColor: '#050505',
  },
  skipLink: {
    marginTop: 20, // increased from 16
  },
  skipLinkText: {
    color: '#666666',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    textDecorationLine: 'underline',
  },

  // ─── Step 2 ───────────────────────────────────────────────────────────────
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    padding: 14, // increased from 12
    marginBottom: 12, // increased from 8
    backgroundColor: '#0a0a0a',
    width: '100%',
  },
  budgetLabel: {
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    fontSize: 13,
    flex: 1,
  },
  budgetInput: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 10, // increased from 8
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    backgroundColor: '#000000',
    fontSize: 13,
    width: 100,
    textAlign: 'right',
  },
  doneButton: {
    marginTop: 20, // increased from 16
    marginBottom: 12, // increased from 8
    width: '100%',
  },

  // ─── Shared ───────────────────────────────────────────────────────────────
  input: {
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16, // increased from 14
    marginBottom: 20, // increased from 16
    color: '#ffffff',
    fontFamily: 'UbuntuMono',
    backgroundColor: '#000000',
    fontSize: 13,
    width: '100%',
  },
  primaryButton: {
    borderWidth: 1,
    borderColor: '#ffffff',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    width: '100%',
    marginTop: 12, // increased from 8
  },
  primaryButtonText: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 12,
    letterSpacing: 2,
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

  // ─── Privacy Modal ────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    padding: 20,
  },
  privacyModal: {
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: '#0a0a0a',
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    color: '#ffffff',
    fontFamily: 'PixelFont',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 16,
  },
  privacyScroll: {
    maxHeight: 400,
  },
  privacyText: {
    color: '#cccccc',
    fontFamily: 'UbuntuMono',
    fontSize: 12,
    lineHeight: 20,
  },

  // ─── Step indicator dots ──────────────────────────────────────────────────
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#000000',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
  },
  dotActive: {
    backgroundColor: '#4a9eff',
  },
});
