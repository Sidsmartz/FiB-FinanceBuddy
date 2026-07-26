# FiB - Finance Buddy

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-lightgrey.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

A straightforward, fully offline personal finance tracker. It features a bongocat as your financial buddy to keep things lightweight and fun, acting like a digital savings piggy bank.

FinanceBuddy is designed to just work. No accounts to create, no cloud syncing to deal with, and absolutely no data collection. All of your financial history stays locally on your device where it belongs.

---

## Features

- **100% Offline and Private:** Your data never leaves your phone. You have full ownership of your data.
- **Income and Expense Tracking:** Log your daily transactions and see exactly where your money goes.
- **Insights and Analytics:** View your spending habits with clean, easy-to-read charts.
- **Extremely Fast:** Designed with performance in mind. You can add a transaction in seconds.
- **Dark Mode UI:** A modern interface that is easy on the eyes.
- **Home Screen Widget:** Log quick expenses right from your Android home screen.
- **Bongocat Buddy:** Your personal finance companion keeping track of your digital piggy bank.

## Quick Start (Local Development)

This is a React Native project built with Expo.

### Prerequisites
- Node.js (v18 or newer recommended)
- Android Studio / Xcode (for emulation) or the Expo Go app on your physical device.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sidsmartz/FiB-FinanceBuddy.git
   cd FiB-FinanceBuddy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Press `a` in the terminal to open on Android, `i` to open on iOS, or scan the QR code using the Expo Go app on your physical phone.

## Building and Publishing

We use Expo Application Services (EAS) for builds.
To build an Android App Bundle (.aab) for the Google Play Store:

```bash
eas build --platform android
```
*(See `RELEASE.md` for full instructions on version bumping, git tagging, and Play Console deployment.)*

## Contributing

Contributions, issues, and feature requests are welcome. If you want to help make FinanceBuddy better, feel free to fork the repository and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Credits & Attributions

We are incredibly grateful to the creators who provided open-source or free-to-use assets for this project:

- **3D Piggy Bank Model**: ["Piggy Bank"](https://sketchfab.com/3d-models/piggy-bank-4d5bf8d42f2d4c3493dc13a168944d64) by Sketchfab users, used as the main visual element for savings.
- **Fonts**: 
  - *Ubuntu Mono*: Licensed under the [Ubuntu Font License](https://ubuntu.com/legal/font-licence).
  - *Pixel Font*: Used for our retro/app aesthetic.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
