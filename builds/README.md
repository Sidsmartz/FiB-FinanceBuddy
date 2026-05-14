# FiB - Finance Buddy APK Builds

This folder contains APK builds for different versions of the FiB Finance Buddy app.

## Available Builds

### ✅ Successfully Built:
- **FiB-v1.0.0.apk** - Base version (Prev commit)
  - Core dashboard functionality
  - Basic expense and savings tracking
  - No TransactionsScreen yet

- **FiB-v1.1.0.apk** - TransactionsScreen Implementation
  - Added TransactionsScreen with basic filtering
  - Transaction management and UI improvements
  - Enhanced navigation with 4 tabs

### 🔄 Pending Builds:
- **FiB-v1.2.0.apk** - Balance Tab & Date Range Features
  - Balance tab in transactions screen
  - Date range filtering functionality
  - Advanced transaction filtering

- **FiB-v1.3.0.apk** - Enhanced Delete Functionality
  - Fixed and tested transaction deletion
  - Comprehensive error handling
  - Stability improvements

## Build Process

APKs are built using:
```bash
# Checkout specific version
git checkout v1.x.0

# Clean and prebuild
Remove-Item -Recurse -Force android
npx expo prebuild --platform android

# Configure Android SDK
# Create android/local.properties with SDK path

# Build release APK
cd android
.\gradlew assembleRelease

# Copy to builds folder
copy app\build\outputs\apk\release\app-release.apk ..\builds\FiB-vX.X.X.apk
```

## Version History

- **v1.0.0**: Base functionality with dashboard, expense tracking, and savings goals
- **v1.1.0**: Added comprehensive TransactionsScreen with filtering and sorting
- **v1.2.0**: Enhanced with balance tab and date range filtering (pending build)
- **v1.3.0**: Improved delete functionality with error handling (pending build)

## Notes

- All APKs use version numbers in `app.json` while keeping `package.json` at 1.0.0
- Local builds require Android SDK and proper configuration
- Each version represents incremental feature additions to the finance tracking app

## Installation

1. Enable "Install from Unknown Sources" in Android settings
2. Transfer APK to your Android device
3. Install the APK file
4. All data is stored locally on your device using AsyncStorage