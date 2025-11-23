# Complete Xcode Setup Guide - BibleApp

This guide walks you through opening the newly generated Xcode project and completing the setup on your Mac.

## Prerequisites
- Mac with Xcode 14.0 or later installed
- Apple Developer Account (free or paid)
- Firebase project already created
- CocoaPods or SPM for dependency management

## Step 1: Open the Xcode Project

### 1.1 Open in Xcode
1. On your Mac, open Xcode
2. Click **File → Open** (or Cmd+O)
3. Navigate to `/path/to/bibleapp/ios/`
4. Select the `BibleApp.xcodeproj` folder
5. Click **Open**

You should now see the project structure in Xcode.

### 1.2 Verify Project Structure
In Xcode's Project Navigator (left panel), you should see:
```
BibleApp
├── App
│   └── BibleAppApp.swift
├── Features
├── Models
├── Services
├── Views
├── Assets.xcassets
└── Info.plist
```

## Step 2: Configure Bundle ID and Team

### 2.1 Set Bundle ID
1. Click the `BibleApp` project in the Navigator
2. Select the `BibleApp` target
3. Go to **General** tab
4. Find **Bundle Identifier**
5. Change from `com.yourcompany.bibleapp` to your actual bundle ID (e.g., `com.mycompany.biblelessons`)
6. Example: `com.yourname.biblelessons`

### 2.2 Set Development Team
1. In the same **General** tab
2. Find **Signing & Capabilities** section
3. Click the dropdown next to "Team"
4. Select your Apple Developer Team
   - If you don't have a team, select "Add an Account" and sign in with your Apple ID
5. Xcode will automatically generate a provisioning profile

## Step 3: Add Firebase Configuration

### 3.1 Download GoogleService-Info.plist
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Go to **Your apps** tab
5. Find your iOS app or click **Add App** → **iOS**
6. Enter your Bundle ID (must match what you set in Xcode)
7. Click **Register app**
8. Click **Download GoogleService-Info.plist**

### 3.2 Add to Xcode
1. In Xcode, right-click the `BibleApp` folder in Navigator
2. Select **Add Files to "BibleApp"**
3. Select the `GoogleService-Info.plist` file
4. **Important**: Check the `BibleApp` target checkbox
5. Click **Add**

You should now see `GoogleService-Info.plist` in your project.

## Step 4: Configure Push Notifications

### 4.1 Enable Push Notifications in Xcode
1. Select the `BibleApp` target
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability** button
4. Search for "Push Notifications"
5. Click to add it
6. Xcode will add the push notifications entitlement

### 4.2 Configure APNs Certificate (in Firebase)
1. Go to [Apple Developer Console](https://developer.apple.com/account)
2. Go to **Certificates, Identifiers & Profiles**
3. Under **Certificates**, click **+**
4. Select **Apple Push Notification service SSL (Sandbox & Production)**
5. Select your App ID (BibleApp)
6. Follow the CSR upload process
7. Download the certificate

### 4.3 Upload to Firebase
1. In Firebase Console, go to **Cloud Messaging**
2. Click **APNs certificates**
3. Click **Upload**
4. Upload your APNs certificate
5. Click **Upload**

## Step 5: Add Swift Files to Xcode

The Swift files already exist in the file system, but we need to add them to the Xcode project so they compile.

### 5.1 Add All Swift Files
1. In Xcode, right-click the `BibleApp` folder
2. Select **Add Files to "BibleApp"**
3. Navigate to the `ios/BibleApp` directory
4. Select all the folders:
   - App/
   - Features/
   - Models/
   - Services/
   - Views/
5. **Important**: Check that `BibleApp` target is selected
6. Click **Add**

### 5.2 Verify Files Are Added
You should see in the Navigator:
```
BibleApp
├── App/
│   └── BibleAppApp.swift
├── Features/
│   ├── Authentication/
│   ├── Lessons/
│   └── UserProfile/
├── Models/
│   ├── Lesson.swift
│   ├── User.swift
├── Services/
│   ├── APIClient.swift
│   ├── AuthenticationManager.swift
│   ├── FirebaseService.swift
│   └── PushNotificationManager.swift
└── Views/
    ├── MainTabView.swift
    └── ...
```

## Step 6: Configure Build Settings

### 6.1 Set Minimum iOS Version
1. Select `BibleApp` project
2. Select `BibleApp` target
3. Go to **Build Settings** tab
4. Search for "iOS Deployment Target"
5. Set to **14.0**

### 6.2 Code Signing Style
1. In **Build Settings**, search for "Code Signing Style"
2. Set to **Automatic** (recommended for development)

## Step 7: Add Firebase Dependencies

You have two options:

### Option A: CocoaPods (Recommended for Firebase)
1. Open Terminal
2. Navigate to `ios/` directory: `cd path/to/bibleapp/ios/`
3. Create a Podfile: `pod init`
4. Edit Podfile and add:
```ruby
target 'BibleApp' do
  pod 'Firebase/Analytics'
  pod 'Firebase/Auth'
  pod 'Firebase/Firestore'
  pod 'Firebase/Messaging'
end
```
5. Run: `pod install`
6. Close the Xcode project
7. Open the new `.xcworkspace` file instead
8. In Xcode: **File → Open → BibleApp.xcworkspace**

### Option B: Swift Package Manager (SPM)
1. In Xcode, go to **File → Add Packages**
2. Enter: `https://github.com/firebase/firebase-ios-sdk.git`
3. Select version: Up to Next Major (5.0.0)
4. Add to `BibleApp` target
5. Select Firebase products:
   - FirebaseAuth
   - FirebaseFirestore
   - FirebaseMessaging
   - FirebaseAnalytics

## Step 8: Create Assets

### 8.1 App Icon
1. In Xcode Navigator, select **Assets.xcassets**
2. Click **AppIcon** set
3. Drag your 1024x1024 app icon to the appropriate slots
4. The icon should NOT have transparency

### 8.2 Launch Screen
1. Go to **File → New → File**
2. Select **LaunchScreen.storyboard**
3. Click **Create**
4. Design your launch screen (or leave as default)

## Step 9: Build and Test

### 9.1 Select a Simulator
1. At the top of Xcode, select a simulator from the device dropdown
2. Example: "iPhone 14 Pro"

### 9.2 Build the Project
1. Press **Cmd+B** or **Product → Build**
2. Wait for compilation to complete
3. You should see "Build Successful" message

### 9.3 Run on Simulator
1. Press **Cmd+R** or **Product → Run**
2. The app should launch in the selected simulator
3. Test basic functionality:
   - Launch screen appears
   - Navigation works
   - Lessons load (check API URL is correct)

### 9.4 Fix Common Build Errors

**Error: "Cannot find module 'Firebase'"**
- If using CocoaPods, make sure you're using the `.xcworkspace` file
- If using SPM, make sure Firebase packages are added correctly

**Error: "GoogleService-Info.plist not found"**
- Verify the file is added to the project
- Check that the Build Phases include it in "Copy Bundle Resources"

**Error: "Cannot find symbol" for Swift files**
- Verify all files are added to the BibleApp target
- Go to **Target → Build Phases → Compile Sources**
- All .swift files should be listed

## Step 10: Configure Production Settings

### 10.1 Update Bundle ID
**Change from development to production:**
1. Select `BibleApp` target
2. Go to **General** tab
3. Update **Bundle Identifier** to your final ID (e.g., `com.companyname.biblelessons`)

### 10.2 Update Version Number
1. **Version** (Marketing Version): `1.0`
2. **Build** (Build Number): `1`

### 10.3 Set Production API URL
1. In Xcode, go to **Build Settings**
2. Search for "User-Defined"
3. Add a new setting:
   - Key: `API_URL`
   - Value: `https://api.yourdomain.com` (your production API URL)
4. Update APIClient.swift to use this:
```swift
#if targetEnvironment(simulator)
self.baseURL = "http://localhost:3000"
#else
let apiUrl = Bundle.main.object(forInfoDictionaryKey: "API_URL") as? String ?? "https://api.yourdomain.com"
self.baseURL = apiUrl
#endif
```

## Step 11: Archiving for App Store

### 11.1 Create Archive
1. Select **Generic iOS Device** from device dropdown (top left)
2. Go to **Product → Archive**
3. Wait for the archive to complete
4. The Organizer window opens automatically

### 11.2 Validate with App Store
1. In Organizer, select your archive
2. Click **Validate App**
3. Select your team
4. Click **Validate**
5. If validation passes, you can submit

### 11.3 Submit to App Store
1. Click **Distribute App**
2. Select **App Store Connect**
3. Follow the prompts
4. Select your app and version
5. Submit for review

## Step 12: Post-Submission Checklist

Before submitting to App Store Review, ensure:
- [ ] Bundle ID is final (cannot be changed after submission)
- [ ] All API endpoints point to production servers
- [ ] Privacy Policy URL is set correctly in Info.plist
- [ ] All required permissions are declared
- [ ] App icon is included
- [ ] Screenshots are uploaded in App Store Connect
- [ ] Description and keywords are set
- [ ] Age rating (4+) is selected
- [ ] Minimum iOS version is set to 14.0
- [ ] No hardcoded localhost or test URLs remain
- [ ] Firebase production security rules are enabled

## Troubleshooting

### Issue: "Module 'Firebase' not found"
**Solution**:
- Using CocoaPods? Use `BibleApp.xcworkspace` not `.xcodeproj`
- Using SPM? Verify packages are added to target

### Issue: "The app does not connect to backend"
**Solution**:
- Check API_URL is set correctly
- Verify backend server is running
- Check network connectivity
- Look at console logs for detailed error messages

### Issue: "Push notifications not working"
**Solution**:
- Verify GoogleService-Info.plist is added
- Check APNs certificate is uploaded to Firebase
- Verify push notification capability is enabled in Xcode
- Check device has notifications enabled in Settings

### Issue: "Unable to locate Xcode project"
**Solution**:
- Make sure you're opening `BibleApp.xcodeproj` (or `.xcworkspace` if using CocoaPods)
- Check the file exists in the expected location
- Try: `xcode-select --reset` in Terminal

## Next Steps

1. ✅ Xcode project is now open and configured
2. ✅ Firebase is integrated
3. → Complete TestFlight beta testing
4. → Prepare marketing materials (screenshots, description)
5. → Create privacy policy (already provided in this project)
6. → Submit to App Store Review
7. → Monitor for review status
8. → Release to users

## Support

For additional help:
- [Xcode Documentation](https://developer.apple.com/documentation/xcode/)
- [Firebase iOS Guide](https://firebase.google.com/docs/ios/setup)
- [App Store Connect Help](https://help.apple.com/app-store-connect)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

**Last Updated**: November 2024
**Xcode Version**: 14.0+
**iOS Minimum Version**: 14.0
