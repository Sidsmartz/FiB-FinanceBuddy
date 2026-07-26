/**
 * FiB home-screen widget layout — 2×1 dark style.
 * Uses react-native-android-widget primitives.
 * Requirements: 2.1
 */
import React from 'react';
import {
  FlexWidget,
  TextWidget,
  TouchableWidget,
} from 'react-native-android-widget';

/**
 * @param {object} props
 * @param {number} props.balance  Current balance to display
 * @param {boolean} props.hasError  True when last AsyncStorage read failed
 */
export default function FiBWidgetPreview({ balance = 0, hasError = false }) {
  const balanceText = hasError
    ? '₹ ─'
    : `₹${Number(balance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <FlexWidget
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        borderRadius: 12,
        padding: 16,
      }}
    >
      {/* App label */}
      <TextWidget
        text="FiB"
        style={{
          color: '#7eb8ff',
          fontSize: 10,
          fontFamily: 'PixelFont',
          letterSpacing: 2,
          marginBottom: 4,
        }}
      />

      {/* Balance */}
      <TextWidget
        text={balanceText}
        style={{
          color: '#ffffff',
          fontSize: 20,
          fontFamily: 'PixelFont',
          marginBottom: 12,
        }}
      />

      {/* Log Expense button */}
      <TouchableWidget
        clickAction="OPEN_QUICK_LOG"
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: 4,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderColor: '#7eb8ff',
          borderWidth: 1,
        }}
      >
        <TextWidget
          text="LOG EXPENSE"
          style={{
            color: '#7eb8ff',
            fontSize: 8,
            fontFamily: 'PixelFont',
            letterSpacing: 1,
          }}
        />
      </TouchableWidget>
    </FlexWidget>
  );
}
