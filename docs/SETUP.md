# Development Setup Guide

This guide walks you through setting up the Biblical Lessons App for local development.

## Prerequisites

### iOS Development
- Xcode 14.0 or later
- iOS 14.0+ target
- CocoaPods or Swift Package Manager for dependency management
- Apple Developer Account (for App Store Connect)

### Backend Development
- Node.js 16+ (for Express backend)
- Python 3.9+ (for Django backend)
- Firebase CLI
- PostgreSQL or MySQL (for Django database)

### Environment Setup
- Git
- GitHub account

## iOS Setup

### 1. Install Xcode
Download Xcode from the App Store or [Apple's Developer website](https://developer.apple.com/xcode/).

### 2. Install CocoaPods (if using CocoaPods)
```bash
sudo gem install cocoapods
```

### 3. Navigate to iOS Project
```bash
cd ios
```

### 4. Install Dependencies
**Using CocoaPods:**
```bash
pod install
```

**Using Swift Package Manager:**
- Open `BibleApp.xcodeproj` in Xcode
- Go to File → Add Packages
- Add Firebase packages via GitHub

### 5. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Add iOS app to your Firebase project
4. Download `GoogleService-Info.plist`
5. Add it to your Xcode project:
   - Right-click on BibleApp folder
   - Select "Add Files to BibleApp"
   - Choose `GoogleService-Info.plist`
   - Ensure it's added to the BibleApp target

### 6. Open in Xcode
```bash
open BibleApp.xcworkspace
```

### 7. Run the App
- Select a simulator or device
- Press Cmd+R or click Product → Run

## Node.js Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend/nodejs
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create `.env` File
```bash
cp .env.example .env
```

Configure the following variables:
```
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_DATABASE_URL=your-database-url
```

### 4. Set Up Firebase Admin
1. Go to Firebase Console → Project Settings
2. Click "Service Accounts"
3. Click "Generate New Private Key"
4. Save the JSON and extract credentials for `.env`

### 5. Start the Server
```bash
npm run dev
```

Server will run on `http://localhost:3000`

## Django Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend/django
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Create `.env` File
```bash
cp .env.example .env
```

Configure:
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/bible_app
FIREBASE_PROJECT_ID=your-project-id
```

### 5. Set Up Database
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Admin)
```bash
python manage.py createsuperuser
```

### 7. Run Development Server
```bash
python manage.py runserver
```

Server will run on `http://localhost:8000`

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Name it "BibleApp"
4. Enable Google Analytics (optional)

### 2. Enable Authentication
- Go to Authentication
- Click "Get Started"
- Enable "Email/Password" provider
- Enable "Apple" provider (for iOS)

### 3. Create Firestore Database
- Go to Firestore Database
- Click "Create database"
- Start in "Test mode" (development only!)
- Choose your region

### 4. Set Up Collections
- Create "users" collection
- Create "lessons" collection
- Create "notifications" collection

### 5. Load Lesson Data
Use Firebase Admin SDK or console to load lessons from `content/lessons.json`

## GitHub Setup

### 1. Create Repository
```bash
cd /home/user/bibleapp
git init
git add .
git commit -m "Initial commit: Bible app project structure"
```

### 2. Add Remote
```bash
git remote add origin https://github.com/yourusername/bibleapp.git
git push -u origin main
```

## Running Everything Together

### Terminal 1: iOS Development
```bash
cd ios
open BibleApp.xcworkspace
# Then run in Xcode
```

### Terminal 2: Node.js Backend
```bash
cd backend/nodejs
npm run dev
# Runs on http://localhost:3000
```

### Terminal 3: Django Backend
```bash
cd backend/django
source venv/bin/activate
python manage.py runserver
# Runs on http://localhost:8000
```

## Next Steps

1. ✅ Complete Firebase configuration
2. ✅ Load sample lessons into Firestore
3. ✅ Test authentication flow
4. ✅ Set up push notifications
5. ✅ Configure API endpoints in iOS app

## Troubleshooting

### Xcode Build Issues
- Clean build folder: Cmd+Shift+K
- Delete derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
- Pod reinstall: `pod install --repo-update`

### Firebase Authentication Issues
- Verify `GoogleService-Info.plist` is in project
- Check Firebase project ID matches configuration
- Ensure Firebase credentials are valid

### Backend Connection Issues
- Verify backend servers are running
- Check firewall settings
- Update API endpoints in iOS app if needed

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [SwiftUI Documentation](https://developer.apple.com/xcode/swiftui/)
- [Express.js Guide](https://expressjs.com/)
- [Django Documentation](https://docs.djangoproject.com/)
