# Building APK for Android

## Option 1: Local Storage Only (Recommended - No Backend Needed)

Your app already uses AsyncStorage to save data locally on your phone. No cloud database required!

### Steps to Build APK:

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

This will build an APK file that you can download and install on your phone.

5. **Download and Install:**
- Once the build completes, you'll get a download link
- Download the APK to your phone
- Enable "Install from Unknown Sources" in Android settings
- Install the APK

### Data Storage:
- All your data is stored locally on your phone
- No internet connection needed after installation
- Data persists even if you close the app

---

## Option 2: With Cloud Database (For Syncing Across Devices)

If you want to sync data across multiple devices or have cloud backups:

### Free Cloud Database Options:

#### A. MongoDB Atlas (Free Tier - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account (512MB storage free)
3. Create a cluster
4. Get connection string
5. Deploy backend to free hosting

#### B. Supabase (Free Tier)
1. Go to https://supabase.com
2. Create free account
3. Create project
4. Use built-in PostgreSQL database
5. Get API URL and keys

### Free Backend Hosting Options:

#### A. Railway.app (Free Tier)
```bash
# In the backend folder
npm install -g railway
railway login
railway init
railway up
```

#### B. Render.com (Free Tier)
1. Push backend code to GitHub
2. Go to https://render.com
3. Connect GitHub repo
4. Deploy as Web Service
5. Get the URL

#### C. Vercel (Free Tier - Serverless)
```bash
npm install -g vercel
cd backend
vercel
```

### Setup Backend:

1. **Update backend/server.js with your MongoDB connection:**
```javascript
mongoose.connect('YOUR_MONGODB_ATLAS_CONNECTION_STRING');
```

2. **Deploy backend to Railway/Render/Vercel**

3. **Update app config/mongodb.js:**
```javascript
const API_URL = 'https://your-backend-url.com';
```

4. **Uncomment sync in context/DataContext.js:**
```javascript
await syncData(data); // Remove the comment
```

5. **Rebuild the APK with EAS**

---

## Recommendation:

Start with **Option 1** (local storage only). It's simpler and works perfectly for personal use. You can always add cloud sync later if needed.

The app will work offline and all your financial data stays private on your device.
