# Design Document — FiB Redesign

## Overview

This redesign targets four areas: a fast expense-logging UX, an Android home-screen widget, DataContext correctness fixes, and a production-ready release pipeline. The visual identity (dark pixel-art theme, ₹ currency, existing components) is unchanged.

The biggest UX problem today is that the Expense screen forces users to scroll past two unrelated forms (Add Balance, Add to Savings) before reaching expense logging. The redesign promotes quick-log to the top of the screen and separates full-log behind an expandable section.

---

## Architecture

```
FiB-FinanceBuddy/
├── constants/
│   └── categories.js          ← SINGLE source of CATEGORIES and COLORS
├── context/
│   └── DataContext.js         ← fixed: persistData everywhere, orphan cleanup, validation
├── screens/
│   ├── ExpenseScreen.js       ← Quick-Log at top, full forms below
│   ├── DashboardScreen.js     ← unchanged (imports from constants)
│   ├── GoalsScreen.js         ← unchanged (imports from constants)
│   └── TransactionsScreen.js  ← unchanged (imports from constants)
├── widget/
│   ├── FiBWidget.js           ← react-native-android-widget WidgetTaskHandler
│   ├── FiBWidgetPreview.js    ← widget preview component
│   └── QuickLogActivity.js    ← minimal overlay Activity for widget log
├── metro.config.js            ← add dropConsole for production
├── app.json                   ← updated with permissions, widget plugin
├── eas.json                   ← production → aab, preview → apk
├── RELEASE.md                 ← step-by-step release guide
└── README.md                  ← product-facing rewrite
```

---

## Components and Interfaces

### `constants/categories.js`
```js
export const CATEGORIES = [
  'Books', 'Food', 'Gifts', 'Movies',
  'Groceries', 'Transport', 'Entertainment', 'Others'
];
export const CATEGORY_COLORS = { /* map category → hex */ };
```
All screens and the widget import from here. No more duplication.

### Quick-Log Section (in `ExpenseScreen`)
- Amount `TextInput` (numeric, autofocus)
- Category grid: 2-column `FlatList` of `TouchableOpacity` chips
- Single "LOG" button, enabled only when amount > 0 and category selected
- Inline error text (no `alert()`)
- On success: clears form, plays success banner, calls `addExpense`

### Full-Log Section (in `ExpenseScreen`)
- Collapsed by default behind a "FULL LOG ▼" toggle
- Contains the existing title / amount / category / date / split fields
- The Balance and Savings forms remain below quick-log, unchanged

### Android Widget
```
react-native-android-widget
  └── FiBWidget (2×1 layout)
        ├── balance text
        └── "LOG EXPENSE" button  → launches QuickLogActivity
  
  QuickLogActivity (overlay)
        ├── AmountInput
        ├── CategoryRow (horizontal scroll)
        └── Confirm button  → writes to AsyncStorage, calls updateWidget()
```

Widget reads balance from a dedicated AsyncStorage key `'fibWidgetBalance'` that DataContext writes on every balance change. This avoids the widget needing to parse the full `financeData` blob.

### DataContext fixes
- Extract a `_buildPersistPayload()` helper that assembles the full state object
- All mutations (`addExpense`, `updateExpense`, `deleteSavingsGoal`, etc.) call `persistData` via this helper
- `loadData` wraps everything in try-catch; invalid/missing keys fall back to defaults
- New `_validatePersistedData(parsed)` function checks shape and fills defaults
- `deleteSavingsGoal` removes orphaned savings and adjusts balance before persisting

---

## Data Models

No schema changes. The existing shape is preserved:
```js
{
  expenses:      [{ id, title, amount, category, split, date }],
  savings:       [{ id, title, amount, date, goalId }],
  savingsGoals:  [{ id, name, target, current }],
  balance:       number,
  emergencySavings: number,
  goalSavings:   [...],
  incomeFlows:   [...],
  balanceHistory:[{ id, title, amount, date }]
}
```

New key added for widget:
```js
fibWidgetBalance: number   // written on every balance mutation
```

### Input Validation Rules
- Amount: `parseFloat(v)` must be finite, > 0, ≤ 10_000_000
- Title / goal name: `value.trim()` before store; empty trimmed string rejected for full-log
- Quick-log title: auto-generated as `category + ' expense'` (e.g., `"Food expense"`)

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Property 1: Quick-log grows expense list by exactly one
*For any* DataContext state and any valid (amount > 0, category selected) quick-log submission, the expense list length after submission equals the length before plus one.
**Validates: Requirements 1.1, 1.2, 1.3**

Property 2: Quick-log deducts from balance
*For any* DataContext balance B and any valid quick-log expense of amount A, the balance after submission equals B − A.
**Validates: Requirements 1.3**

Property 3: Invalid amount is rejected without side effects
*For any* attempt to submit a quick-log with an amount that is blank, zero, negative, non-numeric, or greater than 10,000,000, the expense list and balance are unchanged.
**Validates: Requirements 1.4, 5.1**

Property 4: Whitespace-only titles are trimmed to empty and rejected
*For any* string composed entirely of whitespace characters, trimming it produces an empty string, and attempting to log it in a full-log submission is rejected.
**Validates: Requirements 5.2**

Property 5: updateExpense preserves total balance
*For any* expense in the list updated with a new amount, the new balance equals old balance + old amount − new amount.
**Validates: Requirements 3.2**

Property 6: deleteSavingsGoal removes orphaned savings
*For any* goal G with associated savings entries, deleting G results in no savings entries with `goalId === G.id` remaining in the list.
**Validates: Requirements 3.3**

Property 7: deleteSavingsGoal restores balance for orphaned savings
*For any* goal G with total associated savings amount S, the balance after deleting G equals balance before + S.
**Validates: Requirements 3.3**

Property 8: persistData round-trip
*For any* valid DataContext state object, serializing it to JSON and parsing it back produces a structurally identical object.
**Validates: Requirements 3.4, 5.3**

Property 9: Amount validation accepts only valid finite positive numbers within bounds
*For any* numeric string input, the validation function returns true if and only if `parseFloat(input)` is finite, > 0, and ≤ 10,000,000.
**Validates: Requirements 5.1**

---

## Error Handling

| Scenario | Handling |
|---|---|
| AsyncStorage write fails | Non-blocking toast; in-memory state already updated so UI stays responsive |
| AsyncStorage read on app load fails | Fall back to empty defaults; structured `console.error` |
| Widget AsyncStorage read fails | Show last known balance + "─" indicator; no crash |
| Invalid amount submitted | Inline error text below the field; no `alert()` |
| Quick-log with empty category | LOG button disabled (never reaches submission) |
| `deleteSavingsGoal` with savings having that goalId | Orphan cleanup runs first; balance corrected atomically |

---

## Testing Strategy

### Property-Based Testing
**Library**: `fast-check` (well-maintained JS PBT library, works with Jest/Vitest in RN projects).
Configure each property test to run a minimum of 100 iterations.

Each property-based test MUST be tagged with:
`// Feature: fib-redesign, Property {N}: {property_text}`

### Unit Testing
**Library**: Jest (already standard in Expo projects).

Unit tests cover:
- `validateAmount()` with specific known-good and known-bad inputs
- `_validatePersistedData()` with malformed JSON shapes
- `CATEGORIES` import resolves correctly from constants file
- Widget balance key is written when `addExpense` is called

### Test Annotation Format
Property tests reference requirements using:
`// Validates: Requirements X.Y`

### What is NOT tested here
- UI rendering / visual regression (not automatable in this setup)
- Widget rendering on home screen (requires physical Android device)
- EAS build pipeline (external CI)
