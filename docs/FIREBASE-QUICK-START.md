# Firebase Quick Start Guide

Fast setup for Firebase in 10 minutes.

## Step 1: Create Firebase Project (2 min)

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click **Get Started**
3. Click **Create a project**
4. Name: `BibleApp`
5. Continue → Continue → Create Project
6. Wait for project to be ready

## Step 2: Get Service Account (2 min)

1. Click **Settings** (gear icon) → **Project Settings**
2. Click **Service Accounts** tab
3. Click **Generate New Private Key**
4. A JSON file downloads
5. Rename it to `firebase-key.json`

### iOS App Setup

1. In Firebase Console, click **Create app** → iOS
2. Bundle ID: `com.yourcompany.bibleapp`
3. Download `GoogleService-Info.plist`
4. Drag into Xcode (to BibleApp folder)

## Step 3: Enable Services (2 min)

In Firebase Console:

1. **Authentication**
   - Click **Get Started**
   - Enable **Email/Password**
   - Save

2. **Firestore Database**
   - Click **Create database**
   - Start in **test mode**
   - Click **Create**

3. **Cloud Messaging**
   - Just note the **Server API Key** (for later)

## Step 4: Add Service Account (2 min)

### For Node.js Backend
```bash
mkdir -p backend/nodejs/config
cp ~/Downloads/firebase-key.json backend/nodejs/config/
```

### For Django Backend
```bash
mkdir -p backend/django/config
cp ~/Downloads/firebase-key.json backend/django/config/
```

⚠️ **IMPORTANT:** Don't commit these files!

## Step 5: Load Sample Lessons (2 min)

### With Node.js
```bash
cd backend/nodejs
npm install
node scripts/load-lessons.js
```

### OR With Python
```bash
cd backend/django
pip install firebase-admin
python scripts/load_lessons.py
```

## Step 6: Test Connection (1 min)

### Test Node.js
```bash
cd backend/nodejs
npm test
```

### Test Django
```bash
cd backend/django
python manage.py test
```

## Done! ✓

Your Firebase project is ready. Check the console to verify:
- ✓ Lessons loaded in Firestore
- ✓ Authentication enabled
- ✓ Cloud Messaging configured

---

## Troubleshooting

### "Permission denied" error
**Fix:** Go to Firestore → Rules, paste this:
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lessons/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
Click **Publish**

### "firebase-key.json not found"
**Fix:** Follow Step 4 above to place the file in the correct location

### Lessons not loading
**Fix:**
1. Verify Firestore database exists
2. Run the load script again
3. Check Firebase Console for errors

---

## Next Steps

1. ✓ Firebase configured
2. → Test iOS app authentication
3. → Set up push notifications
4. → Deploy backends
