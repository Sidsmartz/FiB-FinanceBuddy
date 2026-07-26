# Release Guide

This document covers the full release process: bumping the version, tagging a GitHub Release, building with EAS, and submitting to Google Play.

---

## 1. Bump the version

Open `app.json` and update both fields:

```json
{
  "expo": {
    "version": "1.2.0",
    "android": {
      "versionCode": 3
    }
  }
}
```

Rules:
- `version` follows semver (`MAJOR.MINOR.PATCH`). Increment `PATCH` for bug fixes, `MINOR` for new features, `MAJOR` for breaking changes.
- `versionCode` is an integer that must be strictly greater than the previous Play Store release. Increment by 1 each time.

Commit the change:

```bash
git add app.json
git commit -m "chore: bump version to 1.2.0 (versionCode 3)"
```

---

## 2. Create and push a Git tag

```bash
git tag v1.2.0
git push origin v1.2.0
```

> The tag must match the `version` in `app.json` prefixed with `v`.

---

## 3. Draft a GitHub Release

1. Go to your repository on GitHub.
2. Click **Releases** → **Draft a new release**.
3. Select the tag you just pushed (`v1.2.0`).
4. Set the release title to `FiB v1.2.0`.
5. Write a changelog in the description (new features, bug fixes).
6. Once the EAS build completes (step 4), attach the downloaded **APK** as a binary asset so users can sideload it.
7. Click **Publish release**.

---

## 4. Build with EAS

### Prerequisites

```bash
npm install -g eas-cli
eas login          # create a free account at expo.dev if needed
```

### Keystore setup (first time only)

EAS can generate and manage your keystore automatically:

```bash
eas credentials
```

Choose **Android** → **production** → **Set up a new keystore** and follow the prompts. EAS stores it securely in the cloud. Download a backup:

```bash
eas credentials --platform android
# Choose "Download keystore" and store the .jks + credentials.json somewhere safe
```

> Never commit the keystore or `credentials.json` to Git.

### Preview build (APK — for sideloading / GitHub Release attachment)

```bash
eas build -p android --profile preview
```

Download the APK from the link printed in the terminal or from [expo.dev/builds](https://expo.dev/builds).

### Production build (AAB — for Google Play)

```bash
eas build -p android --profile production
```

This produces an `.aab` file. Download it from [expo.dev/builds](https://expo.dev/builds).

---

## 5. Submit to Google Play via EAS Submit

### First submission

You need a Google Play service account JSON key. Follow the [EAS Submit guide](https://docs.expo.dev/submit/android/) to create one, then:

```bash
eas submit -p android --latest
```

EAS will prompt for the service account key path on first run. Subsequent submissions reuse the saved config.

### Manual upload (alternative)

1. Go to [Google Play Console](https://play.google.com/console).
2. Select your app → **Production** (or **Internal testing** for the first upload).
3. Click **Create new release** → upload the `.aab` file.
4. Fill in the release notes and roll out.

---

## 6. Google Play checklist before first publish

- [ ] App icon: 512×512 PNG, no rounded corners (Play adds them)
- [ ] Feature graphic: 1024×500 PNG
- [ ] Screenshots: at least 2 phone screenshots (1080×1920 or similar)
- [ ] Short description: ≤ 80 characters
- [ ] Full description: ≤ 4000 characters
- [ ] Privacy policy URL (required even for local-only apps)
- [ ] Content rating questionnaire completed
- [ ] Target API level ≥ 34 (Android 14) for new apps in 2024+
- [ ] App signed with a release keystore (not debug)
- [ ] `versionCode` is higher than any previously uploaded version

---

## 7. Version history

| Version | versionCode | Notes |
|---------|-------------|-------|
| 1.0.0   | 1           | Initial release |
| 1.1.0   | 2           | Quick-Log, Android widget, DataContext fixes |
