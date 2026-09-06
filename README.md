# FiB — Finance Buddy

![Version](https://img.shields.io/badge/version-1.6.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A pixel-art personal finance tracker. Fully offline, no accounts, no ads, no cloud. Your data lives on your device.

---

## Features

### Core Tracking
- **Quick Log & Full Log** — Log expenses in seconds with a 2-column category grid, or use the full form with title, split amount, and date picker
- **Balance Management** — Add income credits manually; balance updates in real time
- **Savings Goals** — Create goals and contribute to them; progress tracked with a 3D piggy bank
- **Income Flows** — Record expected income with source, amount, and date; plan savings/spend allocations; mark as complete; or delete

### Analytics & Insights
- **Month-over-Month Insight Card** — Compares current month vs previous month spending per category; highlights the largest change
- **7-Day Spending Chart** — Line chart of the last 7 days
- **Full Month Chart** — Daily spending across the whole selected month
- **Pie Chart** — Spending breakdown by category for any month
- **Month Navigation** — Swipe back through any past month on the dashboard

### Budgets
- **Per-Category Monthly Budgets** — Set a limit for each category; saves on blur
- **Progress Bars** — Colour-coded (green / amber / red) budget bars on the dashboard
- **Budget Screen** — Accessible from the wallet icon in the dashboard header

### Categories
- **13 Built-in Categories** — Food, Groceries, Transport, Health, Shopping, Entertainment, Movies, Subscriptions, Utilities, Education, EMI, Gifts, Others
- **Custom Categories** — Add your own (up to 20 total); persisted locally

### Streaks & Notifications
- **Daily Logging Streak** — Tracks consecutive days of expense logging; shown as a 🔥 pill next to balance
- **Daily 8 PM Notification** — Scheduled once on first launch; reminds you to log for the day
- **Notification Denied Banner** — Dismissible in-app banner with a Settings deep-link if permission was refused

### Personalisation
- **Onboarding Flow** — 3-step first-run setup: name + currency → income setup → budget limits
- **Display Name + Greeting** — "Hello, {name}! Good morning/afternoon/evening 🌅" at the top of the dashboard
- **Currency Selection** — Choose from 100+ world currencies during onboarding; changeable any time in Settings; symbol appears on every amount across all screens
- **Settings Screen** — Searchable currency picker accessible from the dashboard header

### Storage & Architecture
- **SQLite (expo-sqlite)** — All data stored in a local `fib.db` database
- **One-time AsyncStorage Migration** — Existing v1 data is migrated to SQLite on first launch; AsyncStorage is then cleared
- **Meta Table** — Key-value store for flags (migrated, onboarding_complete, notification_id, streak, currency, user_name, etc.)

### Widget
- **Android Home Screen Widget** — Shows today's balance; "LOG EXPENSE" button launches a quick-log overlay that writes directly to SQLite

### Support
- **Buy Me a Diet Coke 🥤** — Links to [support-fib.vercel.app](https://support-fib.vercel.app) from the Goals screen (UPI QR with dynamic amount)

---

## Screens

| Screen | Description |
|--------|-------------|
| **OnboardingScreen** | 3-step first-run: welcome + name + currency / income setup / budget setup |
| **DashboardScreen** | Balance, streak pill, greeting, insight card, charts, pie chart, budget bars, recent expenses |
| **ExpenseScreen** | Quick-log (category grid), Full-log (collapsible), Add Balance, Add to Savings |
| **GoalsScreen** | Savings goals list with progress bars + 3D piggy bank + support section |
| **TransactionsScreen** | Tabbed view of Expenses / Balance / Savings with category filter + date range filter |
| **IncomeScreen** | Income flows list with add, allocate, complete, and delete |
| **BudgetScreen** | Per-category budget editor (saves on blur) |
| **SettingsScreen** | Currency picker with search |

---

## Tech Stack

| | |
|---|---|
| Framework | React Native 0.83 + Expo SDK 55 |
| Storage | expo-sqlite (SQLite) |
| Navigation | React Navigation v7 (bottom tabs + native stack) |
| Charts | react-native-chart-kit |
| 3D | Three.js + expo-gl |
| Animations | react-native-animatable |
| Widget | react-native-android-widget |
| Notifications | expo-notifications |
| Testing | Jest + fast-check (property-based tests) |
| Fonts | PixelFont (headings), Ubuntu Mono (body) |

---

## Quick Start

```bash
git clone https://github.com/Sidsmartz/FiB-FinanceBuddy.git
cd FiB-FinanceBuddy
npm install
npx expo start
```

Press `a` for Android, `i` for iOS, or scan the QR with Expo Go.

## Building

```bash
# APK (sideload / testing)
eas build --platform android --profile preview

# AAB (Play Store)
eas build --platform android --profile production
```

See `RELEASE.md` for version bump, tagging, and Play Console steps.

---

## Credits

- **3D Piggy Bank** — [Sketchfab](https://sketchfab.com/3d-models/piggy-bank-4d5bf8d42f2d4c3493dc13a168944d64)
- **Ubuntu Mono** — [Ubuntu Font License](https://ubuntu.com/legal/font-licence)
- **Press Start 2P** — CodeMan38, [SIL Open Font License](https://scripts.sil.org/OFL)

## License

MIT — see `LICENSE`.
