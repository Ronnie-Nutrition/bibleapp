# Firebase Project Setup Guide

Complete step-by-step guide to set up Firebase for the Biblical Lessons app.

## Table of Contents
1. [Create Firebase Project](#create-firebase-project)
2. [Enable Services](#enable-services)
3. [Configure Authentication](#configure-authentication)
4. [Set Up Firestore Database](#set-up-firestore-database)
5. [Configure Security Rules](#configure-security-rules)
6. [Set Up Push Notifications](#set-up-push-notifications)
7. [Create Service Accounts](#create-service-accounts)
8. [Load Sample Data](#load-sample-data)
9. [Configure App Credentials](#configure-app-credentials)

---

## Create Firebase Project

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Click **"Create a project"** or **"Add project"**

### Step 2: Configure Project
1. **Project Name:** "BibleApp" or "Biblical Lessons"
2. **Project ID:** (auto-generated or custom)
3. **Accept terms** and click **Continue**
4. **Google Analytics:** Optional (you can enable for analytics)
5. Click **Create project**

### Step 3: Wait for Project Creation
- Firebase will set up your project (takes ~5-10 seconds)
- You'll see "Your new cloud project is ready"
- Click **Continue** to go to the project dashboard

---

## Enable Services

From the Firebase Console dashboard:

### Storage Services to Enable
1. **Firestore Database** - for lessons, users, progress
2. **Authentication** - for user login/signup
3. **Cloud Messaging** - for push notifications
4. **Storage** - for lesson images (optional)

---

## Configure Authentication

### Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Click **Email/Password** provider
4. Toggle **Enable** to on
5. Click **Save**

### Enable Apple Sign-In (for iOS)

1. In **Authentication**, click **Sign-in method**
2. Click **Apple**
3. Toggle **Enable** to on
4. Enter your **Team ID** (from Apple Developer Account)
5. Enter your **Key ID** (from Apple Developer Account)
6. Click **Save**

**To get Apple Team ID and Key ID:**
1. Go to [developer.apple.com](https://developer.apple.com)
2. Sign in to your account
3. Go to **Certificates, Identifiers & Profiles**
4. Under **Keys**, create a new key with "Sign in with Apple"
5. Copy the Key ID and Team ID

---

## Set Up Firestore Database

### Create Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. **Security rules:** Select **Start in test mode** (for development)
4. **Location:** Select closest to your users
5. Click **Create**

### Create Collections

The database will automatically be created. Now add collections:

#### 1. Users Collection
```
Collection: users
```
Don't add documents yet; they'll be created when users sign up.

#### 2. Lessons Collection
```
Collection: lessons
```
We'll load sample data from `content/lessons.json`

#### 3. Create the Structure
You can either:
- **Option A:** Use the Firebase Console UI (easier for beginners)
- **Option B:** Use the Node.js script provided below (faster)

---

## Configure Security Rules

### Firestore Security Rules

Replace the default security rules with these production-ready rules:

1. In Firestore Database, go to **Rules**
2. Clear existing content and paste:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Allow read/write to all users for lessons (public)
    match /lessons/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }

    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;

      // Sub-collection: user progress
      match /progress/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    // Push notifications (admin only)
    match /notifications/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

### Understanding the Rules
- **Users:** Each user can only read/write their own data
- **Lessons:** Authenticated users can read; only admins can write
- **Progress:** Each user can track their own progress
- **Default:** Everything else is denied

---

## Set Up Push Notifications

### Enable Cloud Messaging

1. In Firebase Console, go to **Cloud Messaging**
2. You'll see **Server API Key** and other credentials
3. Copy the **Server API Key** for later

### Generate APNs Certificate (for iOS)

1. Go to [Apple Developer Console](https://developer.apple.com/account)
2. Go to **Certificates, Identifiers & Profiles**
3. Under **Certificates**, click **+**
4. Select **Apple Push Notification service SSL (Sandbox & Production)**
5. Select your App ID (BibleApp)
6. Follow the CSR upload process
7. Download the certificate

### Upload APNs Certificate to Firebase

1. In Firebase Console, go to **Cloud Messaging**
2. Go to **APNs certificates**
3. Click **Upload**
4. Upload your APNs certificate
5. Click **Upload**

---

## Create Service Accounts

Service accounts allow your backends to authenticate with Firebase.

### For Node.js Backend

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click **Service Accounts**
3. Click **Generate New Private Key**
4. A JSON file will download (e.g., `bibleapp-firebase-key.json`)
5. **IMPORTANT:** Keep this file secret!

### For Django Backend

1. Same as above—use the same service account

### For Local Development

1. Save the service account JSON file
2. Place in `backend/nodejs/config/firebase-key.json`
3. Place in `backend/django/config/firebase-key.json`
4. **Never commit** these files to Git

---

## Load Sample Data

### Using Node.js Script

Create a script to load sample lessons:

```javascript
// File: scripts/load-lessons.js
const admin = require('firebase-admin');
const serviceAccount = require('../backend/nodejs/config/firebase-key.json');
const lessonsData = require('../content/lessons.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function loadLessons() {
  console.log('Loading lessons...');

  for (const lesson of lessonsData) {
    try {
      await db.collection('lessons').doc(lesson.id).set(lesson);
      console.log(`✓ Loaded: ${lesson.title}`);
    } catch (error) {
      console.error(`✗ Error loading ${lesson.title}:`, error);
    }
  }

  console.log('All lessons loaded!');
  process.exit(0);
}

loadLessons().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

### Run the Script

```bash
cd /path/to/bibleapp
node scripts/load-lessons.js
```

### Alternative: Manual Upload via Firebase Console

1. In Firestore Database, click **Start collection**
2. Collection name: `lessons`
3. Manually add documents from `content/lessons.json`

(This is slower but requires no additional setup)

---

## Configure App Credentials

### iOS App - GoogleService-Info.plist

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click **Your apps** tab
3. Under **iOS apps**, click your app or **Add app**
4. Select **iOS**
5. Enter **Bundle ID:** `com.yourcompany.bibleapp`
6. Click **Register app**
7. Click **Download GoogleService-Info.plist**
8. Add to Xcode:
   - Right-click BibleApp folder in Xcode
   - Select **Add Files to BibleApp**
   - Select `GoogleService-Info.plist`
   - Check **BibleApp** target
   - Click **Add**

### Node.js Backend - Service Account JSON

1. Download service account from Project Settings → Service Accounts
2. Save as `backend/nodejs/config/firebase-key.json`
3. Update `.env` with credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=<copy from JSON>
FIREBASE_CLIENT_EMAIL=<copy from JSON>
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### Django Backend - Service Account

1. Same as Node.js
2. Save as `backend/django/config/firebase-key.json`
3. Update `.env` with credentials

---

## Verify Setup

### Test Firebase Connection

#### Test from Node.js
```bash
cd backend/nodejs
node -e "
const admin = require('firebase-admin');
const serviceAccount = require('./config/firebase-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
db.collection('lessons').limit(1).get()
  .then(snapshot => {
    console.log('✓ Firebase connection successful!');
    console.log('✓ Found', snapshot.docs.length, 'lessons');
    process.exit(0);
  })
  .catch(error => {
    console.error('✗ Error:', error.message);
    process.exit(1);
  });
"
```

#### Test from Django
```bash
cd backend/django
python manage.py shell
```

Then in Python:
```python
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate('config/firebase-key.json')
firebase_admin.initialize_app(cred)

db = firestore.client()
lessons = db.collection('lessons').limit(1).get()
print(f"✓ Firebase connection successful!")
print(f"✓ Found {len(list(lessons))} lessons")
```

#### Test from iOS
1. Open BibleApp in Xcode
2. Add a print statement in AppDelegate:
```swift
FirebaseApp.configure()
print("✓ Firebase initialized successfully!")
```
3. Run the app
4. Check console for success message

---

## Security Checklist

- [ ] Service account key files are NOT in Git (add to .gitignore)
- [ ] Firestore rules are in production mode (not test mode)
- [ ] Only admins can write lessons
- [ ] Users can only access their own data
- [ ] Push notification keys are stored securely
- [ ] All credentials use environment variables
- [ ] HTTPS is enforced in production

---

## Troubleshooting

### Issue: "Permission denied" when accessing Firestore
**Solution:** Check security rules. Ensure user is authenticated.

### Issue: "Invalid API Key" in iOS
**Solution:** Verify GoogleService-Info.plist is properly added to Xcode target.

### Issue: Service account can't access database
**Solution:** Verify service account JSON credentials are correct. Regenerate if needed.

### Issue: Push notifications not received
**Solution:** Verify APNs certificate is uploaded. Check device token is registered.

### Issue: Lessons not loading
**Solution:** Run the load-lessons.js script. Verify Firestore data exists in console.

---

## Next Steps

1. ✅ Create Firebase project
2. ✅ Enable Authentication, Firestore, Cloud Messaging
3. ✅ Configure security rules
4. ✅ Create service accounts
5. ✅ Load sample data
6. ✅ Add credentials to your app
7. → Test the app and authentication flow
8. → Implement push notifications
9. → Prepare for App Store submission

---

## Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase iOS Setup](https://firebase.google.com/docs/ios/setup)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
