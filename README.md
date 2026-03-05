# FiB - Finance Buddy 🐱

Your personal finance tracking companion with a cute animated cat buddy!

## Overview

FiB (Finance Buddy) is a minimalist, pixel-art themed mobile finance tracker built with React Native and Expo. It helps you manage your money with a delightful user experience featuring smooth animations, interactive charts, and a friendly pixel cat companion. All your financial data stays private and secure on your device with local storage.

## Key Features

### 🏠 Dashboard
- **Current Balance Display**: See your available funds at a glance
- **Monthly Spending Summary**: Track total expenses for the current month
- **7-Day Spending Trend**: Interactive line chart showing daily spending patterns
- **Category Breakdown**: Animated pie chart with expense distribution by category
- **Interactive Rupee Animation**: Tap anywhere to create floating rupee symbols (₹)
- **Animated Cat Companion**: A friendly pixel cat that keeps you company
- **Screen Focus Animations**: Smooth fade-in animations replay every time you navigate to a screen

### 💰 Expense Tracking
- **Add Balance**: Quick balance top-up with success feedback
- **Log Expenses**: Record expenses with:
  - Title/description
  - Amount (₹)
  - Category selection (modal picker)
  - Split tracking (optional)
- **Categories**: Books, Food, Gifts, Movies, Groceries, Transport, Entertainment, Others
- **Real-time Updates**: Balance automatically adjusts when expenses are logged
- **Animated UI**: Smooth transitions and micro-interactions

### 🎯 Goals & Savings
- **Emergency Savings**: Track your emergency fund with progress display
- **Custom Goal Savings**: Create multiple savings goals with:
  - Goal name
  - Target amount
  - Current progress
  - Visual progress bars
  - Incremental contributions
- **Progress Tracking**: See how close you are to reaching each goal

### 📈 Income Planning
- **Expected Income Tracking**: Log future income sources with:
  - Source name
  - Expected amount
  - Expected date
- **Allocation Planning**: Plan how to split income between:
  - Savings allocation (%)
  - Spending allocation (%)
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

### Fonts
- **Press Start 2P** (PixelFont.ttf) - Retro pixel font for headings
- **Ubuntu Mono** (UbuntuMono-Regular.ttf) - Monospace font for inputs and small text

### Data & Storage
- **AsyncStorage** (@react-native-async-storage/async-storage 2.1.0) - Local data persistence
- **Context API** - Global state management
- **axios** (1.7.9) - HTTP client (ready for future backend integration)

### Design System
- **Color Scheme**: Minimal dark theme (black/white/gray with blue accents)
- **Typography**: Pixel font for personality, monospace for readability
- **Layout**: Clean borders, proper spacing, card-based UI
- **Currency**: Indian Rupees (₹)

## Architecture

### State Management
- **DataContext**: Centralized state using React Context API
  - Expenses array with timestamps
  - Current balance
  - Emergency savings amount
  - Goal savings array
  - Income flows array
  - CRUD operations for all data types

### Data Persistence
- All data stored locally using AsyncStorage
- Automatic save on every data change
- Data structure:
```javascript
{
  expenses: [{ id, title, amount, category, split, date }],
  balance: number,
  emergencySavings: number,
  goalSavings: [{ id, name, target, current }],
  incomeFlows: [{ id, source, amount, date, savingsAlloc, spendAlloc }]
}
```

### Screen Structure
- **App.js**: Navigation setup, font loading, header configuration
- **DashboardScreen**: Charts, balance display, cat animation, tap-to-create rupees
- **ExpenseScreen**: Balance management and expense logging
- **GoalsScreen**: Emergency and goal savings tracking
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

See [BUILD_APK.md](BUILD_APK.md) for detailed instructions on:
- Building APK for Android using EAS Build
- Local storage setup (no backend needed)
- Optional cloud database integration for multi-device sync

## Project Structure

```
finance-tracker/
├── App.js                      # Main app entry, navigation setup
├── index.js                    # Expo entry point
├── app.json                    # Expo configuration
├── package.json                # Dependencies
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
├── screens/
│   ├── DashboardScreen.js     # Home screen with charts
│   ├── ExpenseScreen.js       # Expense logging
│   ├── GoalsScreen.js         # Savings goals
│   └── IncomeScreen.js        # Income planning
├── config/                     # Configuration files (future backend)
└── backend/                    # Backend code (optional)
```

## Design Philosophy

FiB embraces a minimal, retro aesthetic with modern UX principles:
- **Pixel Art Theme**: Nostalgic pixel fonts and graphics
- **Dark Mode**: Easy on the eyes, battery-friendly
- **Smooth Animations**: Delightful micro-interactions without being distracting
- **Privacy First**: All data stored locally on your device
- **Offline First**: Works perfectly without internet connection
- **Simple & Focused**: No feature bloat, just what you need

## Future Enhancements (Optional)

### MongoDB Integration
To add cloud sync across devices:
1. Set up MongoDB Atlas or local MongoDB instance
2. Create a backend API (Node.js/Express recommended)
3. Update `config/mongodb.js` with your API endpoint
4. Uncomment the sync line in `context/DataContext.js`

Example backend endpoints needed:
- `POST /sync` - Sync all data
- `GET /data/:userId` - Fetch user data

See [BUILD_APK.md](BUILD_APK.md) for free hosting options (Railway, Render, Vercel).

## Data Privacy

- All financial data is stored locally on your device using AsyncStorage
- No data is sent to external servers (unless you set up optional cloud sync)
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
