# iOS Xcode Project Setup Guide

## Overview

This guide walks you through creating the Xcode project for the Bible App and importing all the existing Swift code files.

**Current Status:**
- ✅ Backend running on `localhost:3000`
- ✅ All iOS Swift files ready in `/ios/BibleApp/`
- ⏳ Xcode project needs to be created

---

## Prerequisites

- **macOS** with Xcode 14.0+ installed
- **Backend running** on `localhost:3000` (already started!)
- All Swift files in `/ios/BibleApp/` directory

---

## Step 1: Create New Xcode Project

1. **Open Xcode**

2. **Create a new project:**
   - File → New → Project
   - Choose **iOS** → **App**
   - Click **Next**

3. **Configure project:**
   - **Product Name:** `BibleApp`
   - **Team:** Select your Apple Developer account (or "None" for simulator testing)
   - **Organization Identifier:** `com.yourdomain` (e.g., `com.bibleapp`)
   - **Bundle Identifier:** Will auto-generate (e.g., `com.yourdomain.BibleApp`)
   - **Interface:** **SwiftUI**
   - **Language:** **Swift**
   - **Use Core Data:** Unchecked
   - **Include Tests:** Checked (optional)
   - Click **Next**

4. **Save location:**
   - Navigate to: `/home/user/bibleapp/ios/`
   - **IMPORTANT:** Uncheck "Create Git repository on my Mac" (we already have one)
   - Click **Create**

5. **Xcode will create:**
   - `BibleApp.xcodeproj` (project file)
   - Default ContentView.swift, BibleAppApp.swift, etc.

---

## Step 2: Clean Up Default Files

Xcode creates some default files we don't need:

1. **In Project Navigator (left sidebar), delete these files:**
   - `ContentView.swift` (we have our own views)
   - `Assets.xcassets` folder (keep if you want to add app icons later)

2. **Select "Move to Trash" when prompted**

---

## Step 3: Add Existing Swift Files to Project

Now we'll add all our prepared Swift code files:

### 3.1: Add Services Folder

1. **Right-click on `BibleApp` folder** (the yellow folder icon)
2. **Select "Add Files to 'BibleApp'..."**
3. **Navigate to:** `/home/user/bibleapp/ios/BibleApp/Services/`
4. **Select all files:**
   - `APIClient.swift`
   - `AuthenticationManager.swift`
   - `FirebaseService.swift`
   - `PushNotificationManager.swift`
5. **IMPORTANT:** Check these options:
   - ✅ "Copy items if needed"
   - ✅ "Create groups"
   - ✅ Add to target: "BibleApp"
6. **Click "Add"**

### 3.2: Add Models Folder

1. **Right-click on `BibleApp` folder**
2. **Select "Add Files to 'BibleApp'..."**
3. **Navigate to:** `/home/user/bibleapp/ios/BibleApp/Models/`
4. **Select all files:**
   - `Lesson.swift`
   - `User.swift`
   - `Progress.swift` ✨ (NEW - progress tracking)
   - `Note.swift` ✨ (NEW - notes system)
5. **Check same options as above**
6. **Click "Add"**

### 3.3: Add Views Folder

1. **Right-click on `BibleApp` folder**
2. **Select "Add Files to 'BibleApp'..."**
3. **Navigate to:** `/home/user/bibleapp/ios/BibleApp/Views/`
4. **Select:** `MainTabView.swift`
5. **Check same options**
6. **Click "Add"**

### 3.4: Add Features Folder

1. **Right-click on `BibleApp` folder**
2. **Select "Add Files to 'BibleApp'..."**
3. **Navigate to:** `/home/user/bibleapp/ios/BibleApp/Features/`
4. **Select the entire `Features` folder**
5. **Check same options**
6. **Click "Add"**

### 3.5: Update App Entry Point

The `App` folder already exists, but we need to update it:

1. **Open:** `App/BibleAppApp.swift` (Xcode auto-created this)
2. **Replace its contents** with our version:

```bash
# Copy our version over the default
cp /home/user/bibleapp/ios/BibleApp/App/BibleAppApp.swift /path/to/xcode/project/BibleApp/App/BibleAppApp.swift
```

**Or manually update it to:**

```swift
import SwiftUI

@main
struct BibleAppApp: App {
    @StateObject private var authManager = AuthenticationManager()

    var body: some Scene {
        WindowGroup {
            if authManager.isAuthenticated {
                MainTabView()
                    .environmentObject(authManager)
            } else {
                LoginView()
                    .environmentObject(authManager)
            }
        }
    }
}
```

---

## Step 4: Configure Info.plist

We need to allow HTTP connections to localhost for testing:

1. **In Project Navigator, click on `BibleApp` (top blue icon)**
2. **Select the `BibleApp` target**
3. **Go to "Info" tab**
4. **Right-click in the property list → "Add Row"**
5. **Add this configuration:**

**Key:** `App Transport Security Settings` (type: Dictionary)

Then expand it and add:

**Key:** `Allow Arbitrary Loads in Web Content` (type: Boolean) → Value: `YES`

OR for more security (only allow localhost):

**Key:** `Exception Domains` (type: Dictionary)
  - **Key:** `localhost` (type: Dictionary)
    - **Key:** `NSExceptionAllowsInsecureHTTPLoads` (type: Boolean) → Value: `YES`

---

## Step 5: Verify Project Structure

Your Xcode Project Navigator should now look like:

```
BibleApp
├── App
│   └── BibleAppApp.swift
├── Services
│   ├── APIClient.swift ✨ (Updated with progress & notes)
│   ├── AuthenticationManager.swift
│   ├── FirebaseService.swift
│   └── PushNotificationManager.swift
├── Models
│   ├── Lesson.swift
│   ├── User.swift
│   ├── Progress.swift ✨ (NEW)
│   └── Note.swift ✨ (NEW)
├── Views
│   └── MainTabView.swift
├── Features
│   ├── Authentication
│   │   └── LoginView.swift
│   ├── Lessons
│   │   ├── LessonsViewModel.swift
│   │   └── LessonDetailView.swift
│   └── UserProfile
│       └── NotificationPreferencesView.swift
└── Assets.xcassets
```

---

## Step 6: Build the Project

1. **Select a simulator:**
   - In Xcode toolbar, click device selector
   - Choose **iPhone 15** or **iPhone 14**

2. **Build the project:**
   - Press **⌘B** (or Product → Build)

3. **Watch for errors:**
   - **If successful:** "Build Succeeded" ✅
   - **If errors:** Check the issue navigator (⌘5) for details

### Common Build Issues:

**Error: "Cannot find type 'ProgressStats' in scope"**
- **Fix:** Make sure `Progress.swift` was added to target

**Error: "Cannot find type 'LessonNote' in scope"**
- **Fix:** Make sure `Note.swift` was added to target

**Error: "Missing imports"**
- **Fix:** Most files should only need `import Foundation` and `import SwiftUI`

---

## Step 7: Run in Simulator

Once build succeeds:

1. **Press ⌘R** (or click the Play button ▶️)
2. **Simulator will launch**
3. **App will install and open**

**Expected behavior:**
- App shows LoginView (if not authenticated)
- Or shows MainTabView (if authenticated)
- Backend connection automatic to `localhost:3000`

---

## Step 8: Verify Backend Connection

Once app is running:

1. **Check Xcode Console** (⌘⇧C or View → Debug Area → Show Debug Area)

2. **Look for API calls in console output**

3. **Test in terminal:**
```bash
# Backend should show incoming requests
# Check backend logs in the terminal where npm start is running
```

---

## What's Next?

Once Xcode project is set up and building:

✅ **Backend:** Running on `localhost:3000`
✅ **iOS Project:** Created in Xcode
✅ **Swift Files:** All imported
✅ **Build:** Successful

**→ Move to:** `docs/LOCAL_TESTING_GUIDE.md` for feature testing!

---

## Alternative: Swift Package Manager (If Using)

If you prefer SPM instead of direct file inclusion:

1. **Create Package.swift** in `/ios/BibleApp/`
2. **Define package dependencies** (if any)
3. **Add to Xcode:** File → Add Packages

(For this project, direct file inclusion is simpler since we're not using external packages)

---

## Troubleshooting

### Xcode Can't Find Files

**Problem:** Files show red in Project Navigator

**Fix:**
1. Select the file
2. In File Inspector (right sidebar), check "Target Membership"
3. Ensure "BibleApp" is checked

### Build Errors After Adding Files

**Problem:** "Duplicate symbol" or "Redefinition" errors

**Fix:**
1. Each file should only be added once
2. Check Project Navigator for duplicates
3. Remove duplicates (select → Delete → Remove Reference)

### Simulator Not Connecting to Backend

**Problem:** "Cannot connect to localhost:3000"

**Fix:**
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check Info.plist has localhost exception
3. iOS Simulator can access macOS localhost directly

### File Organization Different

**Problem:** My file structure doesn't match the guide

**Fix:**
- The exact folder structure doesn't matter
- What matters: All .swift files are added to Xcode target
- Use any organization that makes sense to you

---

## Next Steps

After Xcode project is set up:

1. **Follow:** `docs/LOCAL_TESTING_GUIDE.md`
2. **Test:** All 8 features (progress tracking, notes, etc.)
3. **Fix:** Any issues that come up
4. **Deploy:** Backend to GCP
5. **Submit:** App to App Store

---

## Questions?

If you encounter issues during setup:

1. **Check build errors** in Issue Navigator (⌘5)
2. **Read error messages** - they usually tell you what's wrong
3. **Verify file paths** - make sure all files are in correct location
4. **Clean build folder** - Product → Clean Build Folder (⌘⇧K)

---

**Backend Status:** ✅ Running on `localhost:3000`
**Ready for:** Xcode project setup → Testing → Deployment → App Store! 🚀
