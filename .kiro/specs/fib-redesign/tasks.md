# Implementation Plan

- [x] 1. Create shared constants and validate input utility


  - Create `constants/categories.js` exporting `CATEGORIES` array and `CATEGORY_COLORS` map
  - Create `utils/validation.js` exporting `validateAmount(value)` and `sanitizeTitle(value)`
  - `validateAmount` returns true for finite, > 0, ≤ 10,000,000; false otherwise
  - `sanitizeTitle` returns `value.trim()`
  - _Requirements: 3.1, 5.1, 5.2_



- [ ] 1.1 Write property test for amount validation
  - **Property 9: Amount validation accepts only valid finite positive numbers within bounds**


  - **Validates: Requirements 5.1**



- [ ] 1.2 Write property test for whitespace title trimming
  - **Property 4: Whitespace-only titles are trimmed to empty and rejected**
  - **Validates: Requirements 5.2**

- [ ] 2. Fix DataContext — consistency, orphan cleanup, and validation on load
  - Replace all direct `saveData(...)` calls in mutations with `persistData(...)` — fix `updateExpense`, `deleteSavingsGoal`, `addGoalSaving`, `updateGoalSaving`, `addIncomeFlow`, `updateIncomeFlow`, `updateEmergencySavings`
  - Add `_validatePersistedData(parsed)` helper that fills missing/malformed keys with empty defaults



  - Update `loadData` to call `_validatePersistedData` and wrap everything in try-catch with `console.error`


  - Update `deleteSavingsGoal` to also filter out orphaned savings, recalculate balance delta, and call `persistData` atomically
  - Write `fibWidgetBalance` key to AsyncStorage on every balance-mutating operation (add wrapper `_writeWidgetBalance(newBalance)`)


  - Wrap all `persistData` calls with try-catch; surface failures via a new `storageError` state exposed on the context
  - _Requirements: 3.2, 3.3, 3.4, 3.5, 5.3_






- [ ] 2.1 Write property test for updateExpense balance invariant
  - **Property 5: updateExpense preserves total balance**




  - **Validates: Requirements 3.2**

- [ ] 2.2 Write property test for deleteSavingsGoal orphan removal
  - **Property 6: deleteSavingsGoal removes orphaned savings**
  - **Validates: Requirements 3.3**

- [x] 2.3 Write property test for deleteSavingsGoal balance restoration


  - **Property 7: deleteSavingsGoal restores balance for orphaned savings**
  - **Validates: Requirements 3.3**



- [x] 2.4 Write property test for persistData JSON round-trip


  - **Property 8: persistData round-trip**



  - **Validates: Requirements 3.4, 5.3**

- [ ] 3. Update all existing screens to import from constants
  - Replace inline `CATEGORIES` arrays in `ExpenseScreen.js`, `DashboardScreen.js`, `TransactionsScreen.js` with import from `constants/categories.js`
  - Remove unused `IncomeScreen` reference if any lingering imports exist in `App.js`
  - _Requirements: 3.1_



- [ ] 4. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Redesign ExpenseScreen with Quick-Log at top
  - Add Quick-Log section at top of `ExpenseScreen`: numeric TextInput, 2-column category grid using `CATEGORIES` from constants, LOG button


  - LOG button disabled when amount is empty/invalid or no category selected
  - On LOG button press: call `validateAmount`, if invalid show inline error text (no `alert()`), if valid call `addExpense` with auto-title `"${category} expense"`, current date, then clear form
  - Add "FULL LOG ▼ / ▲" toggle below Quick-Log section; Full-Log form (title/amount/category/date/split) starts collapsed
  - Balance and Savings forms remain below the toggle, layout unchanged




  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5.1 Write property test for quick-log expense list growth
  - **Property 1: Quick-log grows expense list by exactly one**
  - **Validates: Requirements 1.1, 1.2, 1.3**

- [ ] 5.2 Write property test for quick-log balance deduction
  - **Property 2: Quick-log deducts from balance**
  - **Validates: Requirements 1.3**

- [ ] 5.3 Write property test for invalid amount rejection
  - **Property 3: Invalid amount is rejected without side effects**
  - **Validates: Requirements 1.4, 5.1**

- [ ] 6. Implement Android widget
  - Install `react-native-android-widget` and add plugin to `app.json`
  - Create `widget/FiBWidgetPreview.js`: renders a 2×1 dark widget showing "BALANCE ₹X" and a "LOG EXPENSE" button using the widget primitives (`FlexWidget`, `TextWidget`, `TouchableWidget`)
  - Create `widget/FiBWidget.js`: register the widget provider, handle `WIDGET_ADDED` and `WIDGET_UPDATE` by reading `fibWidgetBalance` from AsyncStorage and calling `updateWidget`
  - Create `widget/QuickLogActivity.js`: a React Native screen registered as an activity that shows amount input + horizontal category scroll + confirm button; on confirm writes new expense via `addExpense` logic and calls `updateWidget`
  - Register `QuickLogActivity` in `app.json` under `android.intentFilters` / widget activity config per `react-native-android-widget` docs
  - Handle AsyncStorage read failure in widget: catch error, display last cached balance with "─" suffix
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 7. Update metro.config.js and build config for production readiness
  - Add `dropConsole: true` to metro config transformer options (or use `minifierConfig` depending on Metro version) so `console.log` is stripped in production bundles
  - Update `eas.json` production profile to `"buildType": "aab"` (keep preview as `"apk"`)
  - Add `credentialsSource: "local"` to production profile as placeholder comment explaining keystore setup
  - Bump `app.json` `versionCode` to `2` and `version` to `"1.1.0"` to reflect this release
  - _Requirements: 4.1, 4.2, 5.4_

- [ ] 8. Write RELEASE.md and rewrite README.md
  - Create `RELEASE.md` covering: (a) how to bump `version`/`versionCode` in `app.json`, (b) how to create and push a git tag (`git tag v1.x.x && git push origin v1.x.x`), (c) how to draft a GitHub Release from that tag, (d) how to run `eas build -p android --profile production` for an AAB, (e) how to run `eas submit -p android` to submit to Play Store, (f) keystore setup instructions
  - Rewrite `README.md` as a product page: app name/tagline, feature overview with emoji section headers, "Download" section pointing to GitHub Releases, privacy statement (local-only storage, no accounts), Play Store badge placeholder, screenshots placeholder, tech stack summary, local dev setup instructions
  - Remove all garbled characters and dead `IncomeScreen` references from docs
  - _Requirements: 4.3, 4.4_

- [ ] 9. Final Checkpoint — Ensure all tests pass, ask the user if questions arise.
