# FiB - Finance Buddy 🐱

Your personal finance tracking companion with a cute animated cat buddy!

## Features

- **Animated Cat Companion**: A friendly pixel cat that keeps you company
- **Dashboard**: View balance, monthly spending with animated charts
- **Line Chart**: Track your last 7 days spending trends
- **Pie Chart**: Category breakdown with smooth animations
- **Expense Tracking**: Log expenses with title, amount, category, and split options
- **Goals & Savings**: Track emergency savings and custom goal savings with progress bars
- **Income Planning**: Plan future income with allocation flowcharts (savings vs spending)
- **Categories**: Books, Food, Gifts, Movies, Groceries, Transport, Entertainment, Others
- **Currency**: Indian Rupees (₹)
- **Cool Animations**: Smooth transitions and delightful micro-interactions

## Setup

1. Install dependencies:
```bash
cd finance-tracker
npm install
```

2. Download fonts:
   
   **Pixel Font (Main/Headings):**
   - Download "Press Start 2P" from [Google Fonts](https://fonts.google.com/specimen/Press+Start+2P)
   - Rename to `PixelFont.ttf` and place in `assets/fonts/`
   
   **Ubuntu Mono (Small text):**
   - Download from [Google Fonts](https://fonts.google.com/specimen/Ubuntu+Mono)
   - Place `UbuntuMono-Regular.ttf` in `assets/fonts/`

3. Run the app:
```bash
npm start
```

Then scan the QR code with Expo Go app on your phone, or press:
- `a` for Android emulator
- `i` for iOS simulator
- `w` for web browser

## Design

Minimal dark theme with:
- Black/white/gray color scheme
- Clean borders
- Pixel font (Press Start 2P) for headings and main text
- Ubuntu Mono for smaller text and inputs
- Ionicons for navigation
- Minimal UI with proper spacing

## Data Storage

Uses AsyncStorage for local data persistence.

## MongoDB Integration

To connect to MongoDB:
1. Set up MongoDB Atlas or local MongoDB instance
2. Create a backend API (Node.js/Express recommended)
3. Update `config/mongodb.js` with your API endpoint
4. Uncomment the sync line in `context/DataContext.js`

Example backend endpoints needed:
- `POST /sync` - Sync all data
- `GET /data/:userId` - Fetch user data
