# Requirements Document

## Introduction

FiB (Finance Buddy) is a React Native / Expo personal finance tracker. This spec covers a focused redesign with four goals:

1. Make expense logging faster and friction-free (quick-log flow)
2. Add an Android home-screen widget so users can log an expense without opening the app
3. Fix functional bugs and code quality issues in the existing codebase
4. Produce a product-grade README and a correct, Play Store–ready release pipeline

The feature set and visual identity (dark pixel-art theme, ₹ currency) are preserved.

---

## Glossary

- **App**: The FiB React Native application
- **Quick-Log**: A minimal 2-tap flow to record an expense (amount + category, title optional)
- **Full-Log**: The existing 5-field expense form (title, amount, category, date, split)
- **Widget**: An Android home-screen App Widget rendered via `react-native-android-widget`
- **DataContext**: The React Context that holds all in-memory state and drives AsyncStorage persistence
- **AsyncStorage**: The on-device key-value store used for all data persistence
- **CATEGORIES**: The canonical list of expense categories shared across the whole app
- **EAS**: Expo Application Services — cloud build and submit tooling
- **AAB**: Android App Bundle — the format required by Google Play for new apps
- **APK**: Android Package — sideloadable format, used for preview/testing builds
- **versionCode**: The integer build number required by Android and Google Play
- **GitHub Release**: A tagged, versioned artifact published to a GitHub repository
- **PBT**: Property-Based Testing — testing approach that verifies properties hold for arbitrary inputs

---

## Requirements

### Requirement 1 — Quick-Log Expense Flow

**User Story:** As a user, I want to log a common expense in two taps, so that I don't break my flow for a ₹50 chai.

#### Acceptance Criteria

1. WHEN the user opens the Expense screen, THE App SHALL display a Quick-Log section above the Full-Log form containing an amount field and a category grid.
2. WHEN the user enters a numeric amount and selects a category in the Quick-Log section, THE App SHALL enable a single "LOG" button that records the expense with the current date and an auto-generated title derived from the category.
3. WHEN the user submits a Quick-Log entry, THE App SHALL add the expense to DataContext, deduct it from balance, and display a success indicator within 300 ms.
4. IF the user submits a Quick-Log entry with a blank or zero amount, THEN THE App SHALL prevent the submission and display an inline error message without showing an alert dialog.
5. WHEN a Quick-Log entry is submitted successfully, THE App SHALL clear the amount field and deselect the category so the section is ready for the next entry.

---

### Requirement 2 — Android Home-Screen Widget

**User Story:** As a user, I want a home-screen widget, so that I can log an expense without unlocking the app.

#### Acceptance Criteria

1. THE App SHALL provide an Android home-screen widget implemented with `react-native-android-widget` that displays the current balance and a "Log Expense" button.
2. WHEN the user taps "Log Expense" on the widget, THE Widget SHALL open a minimal overlay Activity showing only an amount field and a category row.
3. WHEN the user confirms an expense in the widget overlay, THE App SHALL persist the new expense to AsyncStorage and update the widget balance display.
4. WHEN the widget is placed on the home screen, THE Widget SHALL refresh its displayed balance each time the app writes new data to AsyncStorage.
5. IF AsyncStorage read fails during widget render, THEN THE Widget SHALL display the last known balance and a "─" indicator rather than crashing.

---

### Requirement 3 — DataContext Bug Fixes and Shared Constants

**User Story:** As a developer, I want DataContext to be consistent and maintainable, so that data never silently desyncs.

#### Acceptance Criteria

1. THE App SHALL define CATEGORIES in a single shared constants file and import it in every screen and the widget that needs it.
2. WHEN `updateExpense` is called, THE DataContext SHALL use the same `persistData` helper used by all other mutations so that all fields are written atomically.
3. WHEN `deleteSavingsGoal` is called, THE DataContext SHALL also remove all `savings` entries whose `goalId` matches the deleted goal and adjust the balance accordingly.
4. WHEN the App loads, THE DataContext SHALL validate the persisted JSON structure and fall back to empty defaults for any missing or malformed keys without throwing.
5. WHEN any DataContext mutation completes, THE App SHALL confirm the write succeeded before updating in-memory state, and SHALL surface a non-blocking error toast if AsyncStorage throws.

---

### Requirement 4 — Release Pipeline and Play Store Readiness

**User Story:** As a developer, I want an automated, versioned release process, so that I can ship to GitHub Releases and Google Play without manual steps.

#### Acceptance Criteria

1. THE App SHALL maintain `version` (semver string) and `versionCode` (auto-incrementing integer) in `app.json` that are the single source of truth for all builds.
2. WHEN building for production, THE EAS configuration SHALL produce an AAB (`buildType: "aab"`) for the `production` profile and an APK for the `preview` profile.
3. THE repository SHALL include a `RELEASE.md` document that describes: (a) how to bump the version, (b) how to tag and create a GitHub Release, (c) how to trigger an EAS production build, and (d) how to submit to Google Play via EAS Submit.
4. THE `README.md` SHALL be rewritten as a product-facing document covering: feature overview, screenshots placeholder section, installation from GitHub Releases, privacy statement, and Play Store badge placeholder.
5. WHERE a production build is being created, THE EAS configuration SHALL include a signing keystore reference so that builds are signed consistently and reproducibly.

---

### Requirement 5 — Input Validation and Security Hardening

**User Story:** As a user, I want the app to handle bad input gracefully, so that my data is never corrupted.

#### Acceptance Criteria

1. WHEN the user enters an expense or balance amount, THE App SHALL accept only finite positive numbers and reject strings, negative values, and values exceeding 10,000,000 (ten million).
2. WHEN the user enters a title or goal name, THE App SHALL trim leading and trailing whitespace before storing the value.
3. WHEN data is loaded from AsyncStorage, THE App SHALL parse it inside a try-catch and log a structured error to the console rather than propagating an unhandled exception.
4. WHEN the app is built for production, THE build SHALL NOT include `console.log` statements in release output (metro config `dropConsole` or equivalent).
5. THE App SHALL NOT request any Android permissions beyond those strictly required by `react-native-android-widget` and `@react-native-async-storage/async-storage`.
