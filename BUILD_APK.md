# Building APK for Android

## Build Steps

Your app uses AsyncStorage to save data locally on your phone. No cloud database or backend required!

### 1. Install EAS CLI:
```bash
npm install -g eas-cli
```

### 2. Login to Expo:
```bash
eas login
```
(Create a free account at expo.dev if you don't have one)

### 3. Configure the project:
```bash
eas build:configure
```

### 4. Build the APK:
```bash
eas build -p android --profile preview
```

This will build an APK file that you can download and install on your phone.

### 5. Download and Install:
- Once the build completes, you'll get a download link
- Download the APK to your phone
- Enable "Install from Unknown Sources" in Android settings
- Install the APK

## Data Storage

- All your data is stored locally on your phone using AsyncStorage
- No internet connection needed after installation
- Data persists even if you close the app
- Your financial data stays private on your device

## Build Profiles

The `eas.json` file contains different build profiles:

- **preview**: Builds an APK for testing (recommended)
- **production**: Builds an optimized APK for distribution
- **development**: Builds a development client with debugging tools

To build for production:
```bash
eas build -p android --profile production
```
