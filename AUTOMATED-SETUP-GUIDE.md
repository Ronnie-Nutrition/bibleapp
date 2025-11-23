# 🚀 Automated Xcode Setup Guide

This guide walks you through using the automated setup scripts to integrate your BibleApp with Xcode on your Mac.

## What These Scripts Do

### `setup-xcode.sh` - Main Setup Script
**Automates the entire Xcode integration process:**
- ✅ Checks prerequisites (Xcode, Ruby, CocoaPods)
- ✅ Configures Bundle ID and Team ID
- ✅ Updates project configuration files
- ✅ Installs Firebase dependencies via CocoaPods
- ✅ Creates Xcode workspace
- ✅ Verifies the setup is complete

**Time:** ~5-10 minutes (depending on internet speed)

### `verify-setup.sh` - Verification Script
**Verifies everything is properly configured:**
- ✅ Checks all required files exist
- ✅ Verifies Swift source files are present
- ✅ Confirms Firebase setup
- ✅ Checks Xcode installation
- ✅ Reports any issues or warnings

**Time:** ~30 seconds

## Prerequisites

Before running the scripts, ensure you have:

### Required
- [ ] Mac computer running macOS 11 or later
- [ ] Xcode 14.0 or later installed
- [ ] CocoaPods (will be installed if missing)
- [ ] Git (for cloning/pulling the repo)

### Optional but Recommended
- [ ] Apple Developer Account (for Team ID)
- [ ] Firebase project already created
- [ ] Terminal familiarity

## Installation

### Step 1: Download/Update the Repository

```bash
# If you haven't cloned yet:
git clone https://github.com/Ronnie-Nutrition/bibleapp.git
cd bibleapp

# If already cloned:
cd path/to/bibleapp
git pull origin main  # or your current branch
```

### Step 2: Make Scripts Executable

```bash
chmod +x setup-xcode.sh
chmod +x verify-setup.sh
```

### Step 3: Verify Scripts Are Ready

```bash
ls -la setup-xcode.sh verify-setup.sh
# Should show: -rwxr-xr-x  (executable)
```

## Usage

### Option A: Quick Setup (Recommended)

Run this command and follow the prompts:

```bash
bash setup-xcode.sh
```

The script will:
1. Check that Xcode is installed
2. Ask for your Bundle ID (or use default)
3. Ask for your Team ID (optional)
4. Install CocoaPods dependencies
5. Create Xcode workspace
6. Verify everything worked

### Option B: Setup with Custom Configuration

```bash
# Set environment variables before running
export BUNDLE_ID="com.mycompany.biblelessons"
export TEAM_ID="ABC123DEFG"
export USE_COCOAPODS="true"

bash setup-xcode.sh
```

### Option C: Verify Without Changing Anything

If you've already run setup and want to verify it's correct:

```bash
bash verify-setup.sh
```

## Step-by-Step Walkthrough

### 1️⃣ Open Terminal

```bash
# Open Terminal on your Mac
# Option 1: Press Cmd+Space, type "Terminal", press Enter
# Option 2: Applications → Utilities → Terminal
```

### 2️⃣ Navigate to Project Directory

```bash
cd path/to/bibleapp
```

Replace `path/to/bibleapp` with your actual project path. For example:
```bash
cd ~/Documents/bibleapp
# or
cd /Users/yourname/Projects/bibleapp
```

### 3️⃣ Make Scripts Executable

```bash
chmod +x setup-xcode.sh verify-setup.sh
```

### 4️⃣ Run the Setup Script

```bash
bash setup-xcode.sh
```

### 5️⃣ Follow the Prompts

The script will ask:

**Bundle ID:**
```
Enter Bundle ID (default: com.yourcompany.bibleapp): com.mycompany.biblelessons
```
- Press Enter to use default
- Or type your actual Bundle ID (must be unique)
- Format: `com.companyname.appname`

**Team ID:**
```
Enter Team ID (optional, can be set in Xcode later): ABC123DEFG
```
- Press Enter if you don't have it yet
- Find your Team ID: [Apple Developer Account](https://developer.apple.com/account) → Membership

### 6️⃣ Wait for Installation

The script will install CocoaPods and Firebase dependencies. This may take 3-5 minutes.

```
Installing CocoaPods (this may take a few minutes)...
[!] The `BibleApp [master]` target overrides the `GCC_PREPROCESSOR_DEFINITIONS` ...
Downloading dependencies
Installing Firebase (9.6.0)
...
Pod installation complete!
```

### 7️⃣ Verify the Setup

Once complete, you'll see:

```
╔════════════════════════════════════════════════════════╗
║  Setup Complete! ✓                                    ║
╚════════════════════════════════════════════════════════╝

Project Configuration:
  Bundle ID:        com.mycompany.biblelessons
  Team ID:          ABC123DEFG
  CocoaPods:        true

Next Steps:
  1. Open in Xcode:  open "~/path/to/bibleapp/ios/BibleApp.xcworkspace"
  2. Select a simulator (iPhone 14 Pro recommended)
  3. Press Cmd+B to build
  4. Press Cmd+R to run on simulator
```

### 8️⃣ Open in Xcode

Copy and paste the command shown, or run manually:

```bash
open ios/BibleApp.xcworkspace
```

**⚠️ Important:** Use `.xcworkspace` (not `.xcodeproj`)!

### 9️⃣ Configure Team in Xcode (if needed)

If you didn't provide a Team ID:

1. In Xcode, select **BibleApp** project (left panel)
2. Select **BibleApp** target
3. Go to **Signing & Capabilities** tab
4. Click the **Team** dropdown
5. Select your team
6. If you don't see your team, click **Add an Account** and sign in

### 🔟 Build and Test

```bash
# In Xcode, or press these keyboard shortcuts:
Cmd+B  # Build
Cmd+R  # Run on simulator
```

## Common Issues & Solutions

### Issue: "Cannot find module 'Firebase'"

**Solution:**
```bash
# Make sure you're using the workspace, not the project file
open ios/BibleApp.xcworkspace  # ✅ Correct
# NOT: open ios/BibleApp.xcodeproj  # ❌ Wrong
```

### Issue: "gem install cocoapods" fails

**Solution:**
```bash
# Update RubyGems first
sudo gem update --system

# Then install CocoaPods
sudo gem install cocoapods

# Then run setup script again
bash setup-xcode.sh
```

### Issue: "Permission denied" running script

**Solution:**
```bash
# Make it executable
chmod +x setup-xcode.sh

# Then run it
bash setup-xcode.sh
```

### Issue: "Xcode not found"

**Solution:**
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Or reset Xcode path if already installed
sudo xcode-select --reset
```

### Issue: Pod install hangs or times out

**Solution:**
```bash
# Update CocoaPods repository
pod repo update

# Then try again
cd ios
pod install
```

## Verification Steps

### After Running Setup

Run the verification script:

```bash
bash verify-setup.sh
```

You should see:
```
✓ Xcode project (BibleApp.xcodeproj)
✓ Info.plist
✓ Entitlements file
✓ Podfile
✓ Found 12/12 Swift files
✓ Bundle ID configured: com.mycompany.biblelessons
✓ Firebase config found
✓ CocoaPods installed
✓ Xcode workspace created
✓ Xcode found
```

### Checklist Before Opening Xcode

- [ ] `setup-xcode.sh` ran successfully
- [ ] `verify-setup.sh` shows all items with ✓
- [ ] No red errors in output
- [ ] Pod installation completed
- [ ] `ios/BibleApp.xcworkspace` exists

## Next Steps in Xcode

Once Xcode opens, you need to:

1. **Add Firebase Configuration**
   - Download `GoogleService-Info.plist` from Firebase Console
   - Drag into Xcode project
   - Make sure `BibleApp` target is checked

2. **Enable Push Notifications**
   - BibleApp target → Signing & Capabilities
   - Click "+ Capability"
   - Add "Push Notifications"

3. **Verify Team (if not set)**
   - BibleApp target → General
   - Select your Team from dropdown

4. **Build Project**
   - Press Cmd+B
   - Should complete without errors

5. **Run on Simulator**
   - Press Cmd+R
   - Should launch without crashes

## Configuration Files Explained

### `.xcodeproj` vs `.xcworkspace`

- **`.xcodeproj`** - Original Xcode project (without CocoaPods)
- **`.xcworkspace`** - Project with CocoaPods dependencies
- **Always use `.xcworkspace`** after running this setup!

### `Podfile`

Contains list of dependencies:
- Firebase/Analytics
- Firebase/Auth
- Firebase/Firestore
- Firebase/Messaging

### `Info.plist`

App configuration file with:
- Bundle ID
- App name
- Minimum iOS version
- Privacy descriptions
- ATS settings (for API calls)

### `BibleApp.entitlements`

Capabilities needed for:
- Push Notifications
- Keychain access
- Sign in with Apple (prepared for future)

## Troubleshooting Advanced Issues

### Issue: Build fails with "Team ID not available"

**Solution:**
```bash
# Run again and provide Team ID when prompted
bash setup-xcode.sh

# Or set it in environment first
export TEAM_ID="YOUR_TEAM_ID"
bash setup-xcode.sh
```

### Issue: Simulator build fails

**Solution:**
```bash
# Try cleaning build folder
Cmd+Shift+K  # In Xcode

# Or from Terminal
cd ios
rm -rf Pods Podfile.lock
pod install
```

### Issue: Firebase not working

**Checklist:**
- [ ] GoogleService-Info.plist added to project
- [ ] File is in Xcode's file browser
- [ ] BibleApp target is checked in File Inspector
- [ ] Bundle ID in Info.plist matches Firebase app

### Issue: Pods won't install

**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

## Getting Help

If you encounter issues:

1. **Check the error message** - It usually tells you what's wrong
2. **Run verify-setup.sh** - See what's missing
3. **Check the troubleshooting section** above
4. **Google the error** - Most Xcode issues have solutions online
5. **Check Xcode logs** - View → Navigators → Issue Navigator (Cmd+5)

## Advanced Options

### Use Swift Package Manager Instead of CocoaPods

If you prefer SPM over CocoaPods:

```bash
# Set environment variable
export USE_COCOAPODS="false"

# Run setup
bash setup-xcode.sh
```

Then in Xcode:
- File → Add Packages
- Enter: `https://github.com/firebase/firebase-ios-sdk.git`
- Add Firebase packages

### Skip Setup and Do Manually

If you prefer manual setup:

1. Download `GoogleService-Info.plist` from Firebase
2. Open `ios/BibleApp.xcworkspace` in Xcode
3. Right-click BibleApp → Add Files → Select `GoogleService-Info.plist`
4. Configure team in Xcode: Target → Signing & Capabilities
5. Add Push Notifications capability
6. Build and test

## Summary

**What you did:**
- ✅ Ran `setup-xcode.sh` to automate configuration
- ✅ CocoaPods installed Firebase dependencies
- ✅ Created Xcode workspace
- ✅ Configured Bundle ID and Team ID
- ✅ Ready to develop in Xcode!

**What's next:**
- 📱 Open in Xcode
- 🔧 Add Firebase config (GoogleService-Info.plist)
- 🏗️ Build and test on simulator
- 📤 Prepare for App Store submission

---

**Need help?** Check:
- `docs/XCODE-SETUP-COMPLETE.md` - Detailed manual setup guide
- `docs/PRIVACY-POLICY.md` - Privacy policy template
- `docs/APPSTORE.md` - App Store submission guide

**Version:** 1.0
**Last Updated:** November 2024
