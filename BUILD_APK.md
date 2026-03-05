# Building APK for Android

## Option 1: Local Build (No Account Required)

Build an APK directly on your machine without using Expo's cloud services.

### Prerequisites:
- Android Studio installed
- Android SDK and build tools
- Java Development Kit (JDK)

### Steps:

1. **Install Expo CLI:**
```bash
npm install -g expo-cli
```

2. **Prebuild the native Android project:**
```bash
npx expo prebuild --platform android
```

This creates an `android` folder with the native Android project.

3. **Build the APK using Gradle:**

**Windows:**
```bash
cd android
.\gradlew assembleRelease
```

**Mac/Linux:**
```bash
cd android
./gradlew assembleRelease
```

4. **Find your APK:**

The APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

5. **Install on your device:**
- Transfer the APK to your phone
- Enable "Install from Unknown Sources" in Android settings
- Install the APK

### Troubleshooting:

If you get signing errors, you can build an unsigned APK for testing:
```bash
./gradlew assembleDebug
```

The debug APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Option 2: EAS Build (Cloud Build - Easier)

Build an APK using Expo's cloud service (requires free Expo account).

### Steps:

1. **Install EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login to Expo:**
```bash
eas login
```
(Create a free account at expo.dev if you don't have one)

3. **Configure the project:**
```bash
eas build:configure
```

4. **Build the APK:**
```bash
eas build -p android --profile preview
```

This will build an APK in the cloud and provide a download link.

5. **Download and Install:**
- Once the build completes, you'll get a download link
- Download the APK to your phone
- Enable "Install from Unknown Sources" in Android settings
- Install the APK

---

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

---

## Recommendation

- **Local Build**: Best if you have Android Studio already installed and want full control
- **EAS Build**: Easier and faster if you don't have Android development tools set up
