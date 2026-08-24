/**
 * FiB home-screen widget layout — 2×1 dark style.
 * Uses react-native-android-widget primitives.
 * Shows "Amount Spent Today" instead of balance.
 *
 * The entire widget is one tappable surface (clickAction on root FlexWidget).
 * Using a nested clickable FlexWidget caused tap events to stop routing
 * correctly after the first requestWidgetUpdate call.
 */
import React from 'react';
import {
  FlexWidget,
  TextWidget,
} from 'react-native-android-widget';

/**
 * @param {object} props
 * @param {number} props.spentToday  Total amount spent today
 * @param {boolean} props.hasError  True when last SQLite read failed
 */
export default function FiBWidgetPreview({ spentToday = 0, hasError = false, currency = '₹' }) {
  const amountText = hasError
    ? `${currency} ─`
    : `${currency}${Number(spentToday).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  return (
    <FlexWidget
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'financebuddy://quicklog' }}
      style={{
        width: 'match_parent',
        height: 'match_parent',
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
          letterSpacing: 2,
          marginBottom: 4,
        }}
      />

      {/* Amount Spent Today label */}
      <TextWidget
        text="Amount Spent Today:"
        style={{
          color: '#999999',
          fontSize: 8,
          letterSpacing: 1,
          marginBottom: 2,
        }}
      />

      {/* Amount */}
      <TextWidget
        text={amountText}
        style={{
          color: '#ffffff',
          fontSize: 20,
          marginBottom: 12,
        }}
      />

      {/* LOG EXPENSE label — purely visual, tap is handled by root widget */}
      <FlexWidget
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
            letterSpacing: 1,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
