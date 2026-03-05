# FiB - Finance Buddy 🐱

Your personal finance tracking companion with a cute animated cat buddy!

## Overview

FiB (Finance Buddy) is a minimalist, pixel-art themed mobile finance tracker built with React Native and Expo. It helps you manage your money with a delightful user experience featuring smooth animations, interactive charts, and a friendly pixel cat companion. All your financial data stays private and secure on your device with local storage.

## Key Features

### 🏠 Dashboard
- **Current Balance Display**: See your available funds at a glance
- **Monthly Spending Summary**: Track total expenses for the current month
- **Monthly Savings Display**: See how much you've saved this month
- **Month Navigation**: Browse through previous months with arrow buttons
- **7-Day Spending Trend**: Interactive line chart showing daily spending patterns (current month only)
- **Monthly Spending Graph**: Full month spending visualization (toggleable)
- **Category Breakdown**: Animated pie chart with expense distribution by category
- **Interactive Rupee Animation**: Tap anywhere to create floating rupee symbols (₹)
- **Animated Cat Companion**: A friendly pixel cat that keeps you company
- **Screen Focus Animations**: Smooth fade-in animations replay every time you navigate to a screen

### 💰 Expense & Savings Tracking
- **Add Balance**: Quick balance top-up with success feedback
- **Add to Savings**: Save money to specific goals with date tracking
- **Log Expenses**: Record expenses with:
  - Title/description
  - Amount (₹)
  - Category selection (modal picker)
  - Date picker (log past transactions)
  - Split tracking (optional)
- **Categories**: Books, Food, Gifts, Movies, Groceries, Transport, Entertainment, Others
- **Real-time Updates**: Balance automatically adjusts when expenses or savings are logged
- **Animated UI**: Smooth transitions and micro-interactions

### 🎯 Savings Goals
- **Create Custom Goals**: Set up multiple savings goals with:
  - Goal name (e.g., Vacation, New Phone, Emergency Fund)
  - Optional target amount
  - Progress tracking
- **Add to Goals**: Contribute to specific goals from the Expense screen
- **Visual Progress**: See progress bars and percentages for goals with targets
- **Total Savings Display**: View your total saved amount across all goals
- **Goal Management**: Delete goals you no longer need

### 📈 Income Planning
- **Expected Income Tracking**: Log future income sources with:
  - Source name
  - Expected amount
  - Expected date
- **Allocation Planning**: Plan how to split income between:
  - Savings allocation
  - Spending allocation
- **Income Flow Management**: View and manage all expected income streams

## Tech Stack

### Frontend
- **React Native** (0.83.2) - Cross-platform mobile framework
- **Expo** (~55.0.0) - Development platform and build tools
- **React** (19.2.0) - UI library
- **React Navigation** (7.0.15) - Navigation and routing
  - Bottom Tabs Navigator for main navigation
  - `useIsFocused` hook for screen-aware animations

### UI & Animations
- **react-native-animatable** (1.4.0) - Declarative animations (fadeIn, fadeInDown, fadeInUp)
- **react-native-reanimated** (4.2.2) - High-performance animations
- **react-native-chart-kit** (6.12.0) - Line and pie charts
- **react-native-svg** (15.9.0) - SVG rendering for charts
- **@expo/vector-icons** (15.1.1) - Ionicons for navigation
- **@react-native-community/datetimepicker** - Native date picker

### Fonts
- **Press Start 2P** (PixelFont.ttf) - Retro pixel font for headings
- **Ubuntu Mono** (UbuntuMono-Regular.ttf) - Monospace font for inputs and small text

### Data & Storage
- **AsyncStorage** (@react-native-async-storage/async-storage 2.1.0) - Local data persistence
- **Context API** - Global state management

### Design System
- **Color Scheme**: Minimal dark theme (black/white/gray with blue and green accents)
- **Typography**: Pixel font for personality, monospace for readability
- **Layout**: Clean borders, proper spacing, card-based UI
- **Currency**: Indian Rupees (₹)

## Architecture

### State Management
- **DataContext**: Centralized state using React Context API
  - Expenses array with timestamps and dates
  - Savings array with goal references
  - Savings goals array with progress tracking
  - Current balance
  - Income flows array
  - CRUD operations for all data types

### Data Persistence
- All data stored locally using AsyncStorage
- Automatic save on every data change
- Data structure:
```javascript
{
  expenses: [{ id, title, amount, category, split, date }],
  savings: [{ id, title, amount, date, goalId }],
  savingsGoals: [{ id, name, target, current }],
  balance: number,
  incomeFlows: [{ id, source, amount, expectedDate, allocations, completed }]
}
```

### Screen Structure
- **App.js**: Navigation setup, font loading, header configuration
- **DashboardScreen**: Charts, balance display, month navigation, cat animation, tap-to-create rupees
- **ExpenseScreen**: Balance management, savings, and expense logging
- **GoalsScreen**: Savings goals creation and tracking
- **IncomeScreen**: Income planning and allocation
- **BongoCat.js**: Animated pixel cat component
- **DataContext.js**: Global state and AsyncStorage integration

## How to Run

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo Go app on your phone (download from App Store or Google Play)
- OR Android Studio / Xcode for emulator

### Installation Steps

1. **Clone and navigate to the project:**
```bash
cd finance-tracker
```

2. **Install dependencies:**
```bash
npm install
```

3. **Download and setup fonts:**
   
   **Pixel Font (Main/Headings):**
   - Download "Press Start 2P" from [Google Fonts](https://fonts.google.com/specimen/Press+Start+2P)
   - Rename to `PixelFont.ttf` and place in `assets/fonts/`
   
   **Ubuntu Mono (Small text):**
   - Download from [Google Fonts](https://fonts.google.com/specimen/Ubuntu+Mono)
   - Place `UbuntuMono-Regular.ttf` in `assets/fonts/`

4. **Start the development server:**
```bash
npm start
```

5. **Run on your device:**
   - **Physical Device**: Scan the QR code with Expo Go app
   - **Android Emulator**: Press `a` in terminal
   - **iOS Simulator**: Press `i` in terminal (Mac only)
   - **Web Browser**: Press `w` in terminal

### Alternative Commands
```bash
npm run android  # Start with Android emulator
npm run ios      # Start with iOS simulator
npm run web      # Start in web browser
```

## Building for Production

See [BUILD_APK.md](BUILD_APK.md) for detailed instructions on building an APK for Android using EAS Build.

## Project Structure

```
finance-tracker/
├── App.js                      # Main app entry, navigation setup
├── index.js                    # Expo entry point
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
├── package.json                # Dependencies
├── BUILD_APK.md                # Build instructions
├── assets/
│   ├── fonts/
│   │   ├── PixelFont.ttf      # Press Start 2P font
│   │   └── UbuntuMono-Regular.ttf
│   ├── icon.png               # App icon
│   ├── splash-icon.png        # Splash screen
│   └── android-icon-*.png     # Android adaptive icons
├── components/
│   └── BongoCat.js            # Animated cat component
├── context/
│   └── DataContext.js         # Global state management
└── screens/
    ├── DashboardScreen.js     # Home screen with charts
    ├── ExpenseScreen.js       # Expense and savings logging
    ├── GoalsScreen.js         # Savings goals management
    └── IncomeScreen.js        # Income planning
```

## Design Philosophy

FiB embraces a minimal, retro aesthetic with modern UX principles:
- **Pixel Art Theme**: Nostalgic pixel fonts and graphics
- **Dark Mode**: Easy on the eyes, battery-friendly
- **Smooth Animations**: Delightful micro-interactions without being distracting
- **Privacy First**: All data stored locally on your device
- **Offline First**: Works perfectly without internet connection
- **Simple & Focused**: No feature bloat, just what you need

## Data Privacy

- All financial data is stored locally on your device using AsyncStorage
- No data is sent to external servers
- No analytics or tracking
- No account required
- Your money, your data, your privacy

## License

This project is open source and available for personal use.

## Credits

- Built with React Native and Expo
- Fonts: Press Start 2P and Ubuntu Mono from Google Fonts
- Icons: Ionicons from @expo/vector-icons
- Charts: react-native-chart-kit

---

Made with ❤️ for personal finance tracking
