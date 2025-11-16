# Getting Started with Biblical Lessons App

Complete guide to get your app running locally and ready for App Store submission.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start (5 minutes)](#quick-start-5-minutes)
3. [Detailed Setup](#detailed-setup)
4. [First Run](#first-run)
5. [What's Next](#whats-next)

---

## Prerequisites

### Required
- Xcode 14.0+ (for iOS development)
- Node.js 16+ (for backend)
- Python 3.9+ (for Django backend)
- Git
- Firebase Account (free tier is fine for development)
- Apple Developer Account ($99/year for App Store)

### Recommended
- macOS (for easier development) or Windows/Linux
- 50GB free disk space
- 8GB+ RAM
- GitHub account

---

## Quick Start (5 minutes)

### 1. Clone Repository
```bash
cd /home/user/bibleapp
git clone <your-repo-url> .
```

### 2. Run Setup Script

**macOS/Linux:**
```bash
bash scripts/setup-firebase.sh
```

**Windows:**
```cmd
scripts\setup-firebase.bat
```

### 3. Add Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project called "BibleApp"
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save as `backend/nodejs/config/firebase-key.json`

### 4. Load Lessons

```bash
cd backend/nodejs
npm install
node ../../scripts/load-lessons.js
```

### 5. Start iOS App

```bash
open ios/BibleApp.xcworkspace
```

Press Cmd+R to run in the simulator.

---

## Detailed Setup

### Step 1: Set Up Firebase

**Complete guide:** [FIREBASE-SETUP.md](FIREBASE-SETUP.md)
**Quick version:** [FIREBASE-QUICK-START.md](FIREBASE-QUICK-START.md)

Key tasks:
- Create Firebase project
- Enable Authentication (Email/Password)
- Create Firestore Database
- Enable Cloud Messaging
- Download service account JSON

### Step 2: iOS Development Environment

1. **Install Xcode** (from App Store or [developer.apple.com](https://developer.apple.com))

2. **Install CocoaPods** (if using):
```bash
sudo gem install cocoapods
```

3. **Set Up iOS Project:**
```bash
cd ios
pod install  # Or use Swift Package Manager in Xcode
```

4. **Add Google Service Info:**
   - Get `GoogleService-Info.plist` from Firebase Console
   - Add to Xcode: Right-click BibleApp folder → Add Files
   - Ensure it's added to BibleApp target

5. **Open in Xcode:**
```bash
open BibleApp.xcworkspace
```

### Step 3: Configure Node.js Backend

```bash
cd backend/nodejs

# Install dependencies
npm install

# Create .env from example
cp .env.example .env

# Edit .env with your Firebase credentials
# nano .env  (or use your preferred editor)

# Start server
npm run dev
# Server runs on http://localhost:3000
```

### Step 4: Configure Django Backend

```bash
cd backend/django

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env

# Edit .env with your Firebase credentials
# nano .env

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
# Server runs on http://localhost:8000
```

### Step 5: Load Sample Lessons

**Option A: Using Node.js**
```bash
cd backend/nodejs
node ../../scripts/load-lessons.js
```

**Option B: Using Python**
```bash
cd backend/django
source venv/bin/activate
python ../../scripts/load_lessons.py
```

Both scripts will:
- Load 5 sample lessons from `content/lessons.json`
- Create them in your Firestore database
- Display confirmation messages

---

## First Run

### 1. Start All Services

**Terminal 1 - iOS App:**
```bash
open ios/BibleApp.xcworkspace
# Then press Cmd+R in Xcode to run on simulator
```

**Terminal 2 - Node.js Backend:**
```bash
cd backend/nodejs
npm run dev
```

**Terminal 3 - Django Backend:**
```bash
cd backend/django
source venv/bin/activate
python manage.py runserver
```

### 2. Test the App

In the iOS simulator:

1. **Create Account:**
   - Click Sign Up
   - Enter email: `test@example.com`
   - Enter password: `password123`
   - Enter name: `Test User`
   - Click "Create Account"

2. **Browse Lessons:**
   - Tap "Lessons" tab
   - You should see 5 biblical lessons

3. **View Lesson:**
   - Tap any lesson to see full content
   - Click "Mark as Complete"
   - Return to see checkmark

4. **Verify in Firebase:**
   - Go to Firebase Console
   - Check `users` collection for your user
   - Check `users/{userId}/progress` for lesson progress

### 3. Run Verification Tests

```bash
# Test Node.js connection
cd backend/nodejs
npm test

# Test Django
cd backend/django
python manage.py test

# Test with curl (requires running servers)
curl http://localhost:3000/health
curl http://localhost:8000/health
```

---

## What's Next

### Immediate (This Week)
- [ ] Complete Firebase setup
- [ ] Load sample lessons
- [ ] Test iOS app with simulator
- [ ] Test authentication flow
- [ ] Verify lessons display correctly

### Short Term (Next Week)
- [ ] Set up push notifications
- [ ] Add more lessons
- [ ] Test on physical iOS device
- [ ] Set up GitHub CI/CD
- [ ] Create TestFlight builds

### Medium Term (2-4 Weeks)
- [ ] Implement user preferences
- [ ] Add offline lesson access
- [ ] Implement analytics
- [ ] User testing with beta group
- [ ] Refine UI/UX based on feedback

### Long Term (Before App Store)
- [ ] Final security audit
- [ ] Performance optimization
- [ ] Privacy policy and legal
- [ ] Screenshots and metadata for App Store
- [ ] TestFlight beta testing
- [ ] App Store submission

---

## Directory Structure

```
bibleapp/
├── ios/                          # SwiftUI iOS app
│   └── BibleApp/
│       ├── App/                  # Entry point
│       ├── Features/             # Feature modules
│       ├── Services/             # Firebase, Network
│       ├── Models/               # Data models
│       └── Views/                # UI components
│
├── backend/
│   ├── nodejs/                   # Express API server
│   │   ├── config/               # Firebase config
│   │   ├── routes/               # API routes
│   │   └── package.json
│   │
│   └── django/                   # Django backend
│       ├── config/               # Firebase config
│       ├── apps/                 # Django apps
│       └── requirements.txt
│
├── content/
│   └── lessons.json              # Sample lesson data
│
├── scripts/
│   ├── load-lessons.js           # Load lessons (Node.js)
│   ├── load_lessons.py           # Load lessons (Python)
│   ├── setup-firebase.sh         # Setup script (macOS)
│   └── setup-firebase.bat        # Setup script (Windows)
│
├── docs/
│   ├── GETTING-STARTED.md        # This file
│   ├── SETUP.md                  # Development setup
│   ├── FIREBASE-SETUP.md         # Firebase configuration
│   ├── FIREBASE-QUICK-START.md   # 10-minute setup
│   ├── FIREBASE-TESTING.md       # Testing guide
│   ├── APPSTORE.md               # App Store submission
│   └── ARCHITECTURE.md           # Architecture guide
│
└── README.md
```

---

## Troubleshooting

### "firebase-key.json not found"
**Solution:** Download from Firebase Console → Project Settings → Service Accounts

### "Pod install fails"
**Solution:**
```bash
cd ios
pod repo update
pod install
```

### "Lessons not loading"
**Solution:** Run the load script:
```bash
cd backend/nodejs
node ../../scripts/load-lessons.js
```

### "Firestore permission denied"
**Solution:** Check Firestore Rules:
1. Go to Firebase Console → Firestore → Rules
2. Replace with rules from `backend/firestore.rules`
3. Click Publish

### "Port already in use"
**Solution:**
```bash
# Change port in .env
PORT=3001  # or another available port

# Or kill existing process
lsof -i :3000  # find process
kill -9 <PID>
```

### "Module not found"
**Solution:** Install dependencies:
```bash
# Node.js
npm install

# Python
pip install -r requirements.txt
```

---

## Documentation Index

- **Getting Started** (this file): Overview and first steps
- **SETUP.md**: Development environment setup
- **FIREBASE-SETUP.md**: Detailed Firebase configuration
- **FIREBASE-QUICK-START.md**: 10-minute Firebase setup
- **FIREBASE-TESTING.md**: Verify Firebase is working
- **APPSTORE.md**: Prepare for App Store submission
- **README.md**: Project overview

---

## Support

For issues:
1. Check the relevant documentation file
2. Search [Firebase Docs](https://firebase.google.com/docs)
3. Check [SwiftUI Docs](https://developer.apple.com/xcode/swiftui/)
4. Create a GitHub issue with details

---

## Next: Continue to Firebase Setup

**Ready to set up Firebase?** Go to [FIREBASE-QUICK-START.md](FIREBASE-QUICK-START.md) for a 10-minute setup!

Good luck! 🚀
