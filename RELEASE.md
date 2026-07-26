# Release Process & Store Roadmap

Follow these instructions whenever you want to publish a new update for FinanceBuddy to the Google Play Store (or simply create a new formal version on GitHub).

## 1. Version Bumping
Before building a new release, you must update the version numbers.
1. Open `app.json`.
2. Increase the `"version"` string (e.g., from `"1.0.0"` to `"1.1.0"`).
3. **CRITICAL FOR PLAY STORE:** Increase the `"versionCode"` integer by at least `1` (e.g., from `1` to `2`). Google Play will reject any uploaded bundle that does not have a higher `versionCode` than the previous one.
*(Note: You do NOT need to change the version in `eas.json` or any other config files. `app.json` is the single source of truth for Expo app versions).*

## 2. Git & GitHub Release
1. Stage all your changes:
   ```bash
   git add .
   ```
2. Commit with the new version name:
   ```bash
   git commit -m "Release v1.1.0"
   ```
3. Tag the commit (replace `1.1.0` with your new version):
   ```bash
   git tag v1.1.0
   ```
4. Push to GitHub:
   ```bash
   git push origin main
   git push origin v1.1.0
   ```
5. Go to your GitHub repository in the browser, click "Releases" -> "Draft a new release", select the tag you just pushed, and hit "Publish".

## 3. Expo Building
Make sure your Expo cache is cleared if you've had issues previously:
```bash
npx expo start -c
```
Then build the Android App Bundle (`.aab`) required for Google Play Console:
```bash
eas build --platform android
```
*(When Expo finishes, download the .aab file from the link provided in the terminal).*

## 4. Google Play Console Upload
1. Ensure your Store Assets (512x512 Icon, 1024x500 Feature Graphic, Screenshots) and Privacy Policy URL are updated under "App content" / "Store presence".
2. Go to **Production** on the left menu.
3. Click **Create new release**.
4. Upload the new `.aab` file you downloaded from Expo.
5. Add release notes detailing what is new in this update.
6. Click **Next**, review, and click **Save** / **Send for review**.

---
*Note on Store Assets:* The images currently inside your `./assets/` folder (like `icon.png`, `splash-icon.png`, etc.) are actively referenced by `app.json`. If they are still the default Expo templates, make sure to replace them with your custom FinanceBuddy logo before doing your EAS build!
