# Finance Tracker - Dark Pixel Theme

A minimal dark pixel-themed finance tracking app built with React Native and Expo.

## Features

- **Dashboard**: View balance, monthly spending, and category breakdown with pie chart
- **Expense Tracking**: Log expenses with title, amount, category, and split options
- **Goals & Savings**: Track emergency savings and custom goal savings
- **Income Planning**: Plan future income with allocation flowcharts (savings vs spending)
- **Categories**: Books, Food, Gifts, Movies, Groceries, Transport, Entertainment, Others

## Setup

1. Install dependencies:
```bash
cd finance-tracker
npm install
```

2. Run the app:
```bash
npm start
```

Then scan the QR code with Expo Go app on your phone, or press:
- `a` for Android emulator
- `i` for iOS simulator
- `w` for web browser

## Design

Dark pixel theme with:
- Green (#00ff00) text and borders
- Black (#0a0a0a, #1a1a1a) backgrounds
- Dashed border boxes
- Monospace font
- Minimal UI

## Data Storage

Uses AsyncStorage for local data persistence. No backend required for basic functionality.

## MongoDB Integration (Optional)

To connect to MongoDB, you can:
1. Set up MongoDB Atlas or local MongoDB
2. Create an API endpoint to sync data
3. Update the DataContext to sync with your backend

For now, all data is stored locally on the device.
