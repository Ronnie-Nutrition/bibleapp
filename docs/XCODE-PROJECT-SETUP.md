# BibleApp Xcode Project Setup - Complete Guide for App Store

> **Status:** All Swift source files are ready. This guide creates the Xcode project container.

## Overview of Existing Work (Don't Duplicate)

Based on the previous sessions, the following are **ALREADY COMPLETE**:

✅ **iOS Source Code (12 Swift files)**
- App entry point (`BibleAppApp.swift`, `AppDelegate`)
- Services: `APIClient.swift` (API integration), `PushNotificationManager.swift`, `FirebaseService.swift`, `AuthenticationManager.swift`
- Views: `MainTabView.swift`, `LoginView.swift`, `LessonDetailView.swift`, `NotificationPreferencesView.swift`
- ViewModels: `LessonsViewModel.swift`
- Models: `Lesson.swift`, `User.swift`
- Tests: 4 test files with 100+ test cases

✅ **Backend Integration**
- Node.js backend with 30+ endpoints (progress, favorites, auth, lessons, notifications, preferences, scheduler)
- Django backend with models and views
- 5+ comprehensive test files

✅ **Content**
- 24 lessons in JSON format with full content, verses, and practical steps

✅ **Documentation**
- 19 comprehensive guides covering Firebase, push notifications, API integration, etc.

✅ **CI/CD**
- GitHub Actions workflows configured

---

## What We Need to Create Now

We need to create the **Xcode project container** (`.xcodeproj`) that ties all the Swift source files together.

### Bundle ID Configuration

Before starting, decide your bundle ID. Examples:
- `com.biblicallessons.app` (recommended)
- `com.yourcompany.bibleapp`
- `com.entrepreneurs.biblelessons`

**This MUST match:**
- Your App Store Connect app configuration
- Your Apple Developer certificate
- The bundle ID in code signing

---

## Step 1: Create the Xcode Project (in Xcode)

### 1a. Open Xcode

```bash
open /Applications/Xcode.app
```

### 1b. Create New Project

1. Click **File** → **New** → **Project**
2. Select **iOS** tab
3. Choose **App** template
4. Click **Next**

### 1c. Configure Project

Fill in the following fields:

| Field | Value | Notes |
|-------|-------|-------|
| **Product Name** | Biblical Lessons | Or your app name |
| **Team ID** | (Your Team) | Select from dropdown |
| **Organization Identifier** | biblical-lessons | Used for bundle ID |
| **Bundle Identifier** | com.biblical-lessons.bibleapp | Format: com.yourorganization.appname |
| **Language** | Swift | Required |
| **User Interface** | SwiftUI | Already using SwiftUI |
| **iOS Minimum** | 14.0 | Required minimum |

5. Click **Create** and save in: `/home/user/bibleapp/ios/`

This creates: `/home/user/bibleapp/ios/BibleApp.xcodeproj`

---

## Step 2: Replace Auto-Generated Files

### 2a. Remove Xcode-Generated Swift Files

In Xcode (keeping the project reference):

1. Right-click `ContentView.swift` → **Delete** (select "Remove Reference")
2. Right-click `BibleAppApp.swift` (Xcode-generated) → **Delete** → **Remove Reference**
3. Right-click any other generated files → **Delete** → **Remove Reference**

### 2b. Add Existing Swift Source Files

In Xcode:

1. Select the **BibleApp** project folder
2. Click **File** → **Add Files to "BibleApp"**
3. Navigate to `/home/user/bibleapp/ios/BibleApp/`
4. Select **all folders** and Swift files:
   - ✅ `App/`
   - ✅ `Features/`
   - ✅ `Models/`
   - ✅ `Services/`
   - ✅ `Views/`
   - ✅ `Tests/`
5. Check "Copy items if needed" → **Add**

### 2c. Verify File Structure in Xcode

After adding files, your Xcode project should show:

```
BibleApp
├── App
│   ├── BibleAppApp.swift
│   └── AppDelegate.swift
├── Features
│   ├── Lessons/
│   ├── Authentication/
│   └── UserProfile/
├── Models
│   ├── Lesson.swift
│   └── User.swift
├── Services
│   ├── APIClient.swift
│   ├── PushNotificationManager.swift
│   ├── FirebaseService.swift
│   └── AuthenticationManager.swift
├── Views
│   ├── MainTabView.swift
│   └── (other views)
├── Tests
│   ├── AuthenticationManagerTests.swift
│   ├── LessonsViewModelTests.swift
│   ├── APIClientTests.swift
│   └── PushNotificationManagerTests.swift
└── Resources
    ├── Assets.xcassets
    └── Localizable.strings
```

---

## Step 3: Configure Project Settings

### 3a. Set Deployment Target

1. Select **BibleApp** project in Xcode
2. Select **BibleApp** target
3. Go to **Build Settings**
4. Search "Minimum Deployments"
5. Set to **iOS 14.0**

### 3b. Enable Capabilities

1. Select **BibleApp** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability** and add:
   - ✅ Push Notifications
   - ✅ Sign in with Apple (if using)
   - ✅ Remote notifications (background modes)
   - ✅ Background fetch (optional)

### 3c. Configure Code Signing

1. Select **BibleApp** target
2. Go to **Signing & Capabilities**
3. Team: Select your Apple Developer Team
4. Bundle Identifier: `com.biblical-lessons.bibleapp` (must match App Store)
5. Signing Certificate: Automatic (let Xcode manage)

---

## Step 4: Add Dependencies (CocoaPods or SPM)

### Option A: Using CocoaPods (Recommended for existing setup)

1. Create `Podfile`:

```bash
cd /home/user/bibleapp/ios
pod init
```

2. Edit `Podfile` to add:

```ruby
target 'BibleApp' do
  # Firebase pods
  pod 'Firebase/Core'
  pod 'Firebase/Auth'
  pod 'Firebase/Firestore'
  pod 'Firebase/Messaging'

  # Other dependencies
  pod 'Alamofire'  # If using for networking

  target 'BibleAppTests' do
    inherit! :search_paths
  end
end
```

3. Install pods:

```bash
pod install
```

4. **Close** Xcode project and **open** the `.xcworkspace` instead:

```bash
open BibleApp.xcworkspace
```

### Option B: Using Swift Package Manager (SPM)

1. In Xcode: **File** → **Add Packages**
2. Add Firebase packages from: `https://github.com/firebase/firebase-ios-sdk.git`

---

## Step 5: Configure Info.plist

The `Info.plist` file should include:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Required -->
    <key>CFBundleName</key>
    <string>Biblical Lessons</string>

    <key>CFBundleVersion</key>
    <string>1</string>

    <key>CFBundleShortVersionString</key>
    <string>1.0</string>

    <!-- Firebase -->
    <key>FIREBASE_PROJECT_ID</key>
    <string>your-firebase-project-id</string>

    <!-- API Configuration -->
    <key>API_URL</key>
    <string>https://your-backend-url.com</string>  <!-- Update after deploying -->

    <!-- Appearance -->
    <key>UILaunchStoryboardName</key>
    <string>LaunchScreen</string>

    <!-- Permissions -->
    <key>NSUserNotificationUsageDescription</key>
    <string>We send you lessons and reminders based on your preferences</string>

    <key>NSLocalNetworkUsageDescription</key>
    <string>We use local network to sync with your device</string>

    <!-- Required for iOS 14+ -->
    <key>UIApplicationSceneManifest</key>
    <dict>
        <key>UIApplicationSupportsMultipleScenes</key>
        <true/>
    </dict>
</dict>
</plist>
```

---

## Step 6: Add App Icons and Launch Screen

### 6a. App Icon

1. In Xcode, go to **Assets.xcassets**
2. Select **AppIcon**
3. Drag and drop icons for each size:
   - 1024x1024 (required - used for all sizes)
   - Or provide individual sizes for each device type

### 6b. Launch Screen

1. Create a `LaunchScreen.storyboard` or use the default
2. In **Build Settings**, ensure:
   - **Launch Screen Interface File Base Name**: `LaunchScreen`

---

## Step 7: Configure Firebase

### 7a. Add GoogleService-Info.plist

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **Settings** ⚙️
3. Go to **Your apps** → select iOS app
4. Click **Download GoogleService-Info.plist**
5. In Xcode: **File** → **Add Files**
6. Select the downloaded `GoogleService-Info.plist`
7. Check "Copy items if needed" → **Add**

### 7b. Initialize Firebase in Code

In `AppDelegate.swift` (already in your code), Firebase is initialized:

```swift
func application(_ application: UIApplication,
                 didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    FirebaseApp.configure()  // This runs automatically
    return true
}
```

---

## Step 8: Test the Build

### 8a. Build for Simulator

```bash
xcodebuild -workspace ios/BibleApp.xcworkspace \
  -scheme BibleApp \
  -configuration Debug \
  -derivedDataPath build
```

### 8b. Run Tests

```bash
xcodebuild -workspace ios/BibleApp.xcworkspace \
  -scheme BibleApp \
  -configuration Debug \
  test
```

### 8c. Run in Xcode

1. Select **BibleApp** scheme
2. Select **iPhone 15 Pro** (or preferred simulator)
3. Press **Cmd+R** to run

---

## Step 9: Prepare for App Store Connect

### 9a. Create App Record in App Store Connect

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+**
3. Select **New App**
4. Fill in:
   - **Platform**: iOS
   - **Name**: Biblical Lessons
   - **Primary Language**: English
   - **Bundle ID**: `com.biblical-lessons.bibleapp` (must match Xcode)
   - **SKU**: `BL-001` (unique identifier)

### 9b. Fill App Information

In App Store Connect → **App Information**:

- **Subtitle**: Biblical wisdom for entrepreneurs
- **Category**: Books
- **Content Rating**: Complete the rating questionnaire
- **Age Rating**: 4+

### 9c. Add Screenshots

Required for each device:
- iPhone 6.5" (or latest)
- iPad (if supporting)

Minimum 2 screenshots, maximum 10 per device size.

### 9d. Add Description

```
Biblical Lessons for Entrepreneurs is a comprehensive iOS app that brings timeless biblical
principles to modern business challenges.

Features:
• 24+ lessons on biblical entrepreneurship principles
• Progress tracking and favorites
• Personalized notifications
• Search and filtering
• Offline access to all lessons
• Beautiful, intuitive interface

Learn about:
- Financial Stewardship
- Integrity & Ethics
- Leadership & Authority
- Trust & Faith
- Serving Others
- Perseverance
- Wisdom & Discernment
- Community & Partnership

Perfect for business owners, entrepreneurs, and anyone seeking biblical guidance for their career.
```

---

## Step 10: Build for App Store

### 10a. Archive for App Store

In Xcode:

1. Select **BibleApp** scheme
2. Select **Generic iOS Device** (not simulator)
3. Click **Product** → **Archive**
4. In **Organizer**, select your archive
5. Click **Distribute App**
6. Select **App Store Connect** → **Upload**

### 10b. Submit for Review

In App Store Connect:

1. Go to your app → **Build** section
2. Select the build you uploaded
3. Complete all required information
4. Click **Submit for Review**

---

## Troubleshooting

### "No Such Module" Error

Solution: Run `pod install` again and reopen `.xcworkspace`

### Code Signing Issues

Solution:
1. Go to **Signing & Capabilities**
2. Select correct Team
3. Let Xcode auto-manage signing certificates

### Build Fails on Dependencies

Solution:
1. Clean build folder: **Cmd+Shift+K**
2. Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
3. Rebuild: **Cmd+B**

### App Crashes on Launch

Check:
1. Firebase initialization in `AppDelegate`
2. Firebase credentials in `GoogleService-Info.plist`
3. API endpoint configuration in `APIClient.swift`

---

## Final Checklist Before App Store

Before submitting to App Store, verify:

- ✅ Bundle ID matches App Store Connect
- ✅ Version number set correctly (1.0)
- ✅ Build number incremented (1)
- ✅ App Icon added (1024x1024 minimum)
- ✅ Screenshots added for each device
- ✅ Description and keywords added
- ✅ Privacy Policy URL added
- ✅ Support email configured
- ✅ Code signing certificate valid
- ✅ All tests pass
- ✅ App builds and runs without errors
- ✅ Push notifications configured
- ✅ Firebase credentials correct
- ✅ API endpoints point to production backend

---

## Next Steps

1. Follow steps 1-7 to create and configure the Xcode project
2. Build and test locally (step 8)
3. Create App Store Connect record (step 9)
4. Build and submit (step 10)

**Good luck! Your app is ready for the App Store.** 🚀
