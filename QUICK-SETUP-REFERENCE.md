# ⚡ Quick Setup Reference Card

## 🚀 One-Command Setup

Copy and paste these commands one at a time:

```bash
# 1. Navigate to project
cd path/to/bibleapp

# 2. Make scripts executable
chmod +x setup-xcode.sh verify-setup.sh cleanup-pods.sh

# 3. Run automated setup
bash setup-xcode.sh

# Follow the prompts (press Enter for defaults)
# When asked:
#   Bundle ID: (press Enter or type your ID)
#   Team ID: (press Enter or type your team ID)
```

**That's it!** The script will:
- ✅ Check Xcode is installed
- ✅ Install CocoaPods (if needed)
- ✅ Install Firebase
- ✅ Create Xcode workspace
- ✅ Configure everything

---

## 📱 Open in Xcode

After setup completes, run:

```bash
open ios/BibleApp.xcworkspace
```

**⚠️ Important:** Always use `.xcworkspace` (with CocoaPods), not `.xcodeproj`

---

## 🏗️ Build & Test

In Xcode:
```
Cmd+B  →  Build
Cmd+R  →  Run on Simulator
```

Or in Terminal:
```bash
cd ios
xcodebuild -workspace BibleApp.xcworkspace -scheme BibleApp -configuration Debug -destination generic/platform=iOS
```

---

## ✅ Verify Setup

Check that everything is configured:

```bash
bash verify-setup.sh
```

Should show all green ✓ checks.

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module 'Firebase'" | Use `.xcworkspace` not `.xcodeproj` |
| Pod install fails | `cd ios && pod repo update && pod install` |
| Permission denied | `chmod +x setup-xcode.sh` |
| Xcode not found | `xcode-select --install` |
| Start over | `bash cleanup-pods.sh` then `bash setup-xcode.sh` |

---

## 📋 Configuration

What gets configured:
- ✅ Bundle ID (`com.yourcompany.bibleapp`)
- ✅ Team ID (Apple Developer)
- ✅ Firebase dependencies
- ✅ Entitlements (push notifications)
- ✅ Info.plist settings
- ✅ Build settings (iOS 14.0+)

---

## 🚨 Before App Store Submission

Update these:

```bash
# 1. Production API URL
ios/BibleApp/Services/APIClient.swift
# Change: self.baseURL = "https://your-api.com"

# 2. Firebase config
# Download GoogleService-Info.plist from Firebase Console
# Add to Xcode project

# 3. App metadata
Xcode → BibleApp target → General
# Update: version, bundle ID, team

# 4. Privacy policy
# Add URL to: Xcode → Info → Privacy Policy URL
```

---

## 📞 Commands Quick Reference

```bash
# Setup
bash setup-xcode.sh              # Full automated setup
bash verify-setup.sh             # Check if everything is correct
bash cleanup-pods.sh             # Reset pods (if needed)

# Manual commands
cd ios
pod install                      # Install pods manually
pod install --repo-update        # Update and reinstall
pod deintegrate                  # Remove pods completely

# Xcode from Terminal
open ios/BibleApp.xcworkspace    # Open in Xcode
xcodebuild -workspace BibleApp.xcworkspace -scheme BibleApp -configuration Debug

# Git
git add -A
git commit -m "description"
git push origin branch-name
```

---

## 📚 Full Guides

- **Detailed Setup:** `AUTOMATED-SETUP-GUIDE.md`
- **Manual Setup:** `docs/XCODE-SETUP-COMPLETE.md`
- **App Store:** `docs/APPSTORE.md`
- **Privacy Policy:** `docs/PRIVACY-POLICY.md`

---

## ⏱️ Timeline

| Step | Time |
|------|------|
| Run setup script | 1 min |
| Install CocoaPods | 1 min |
| Download Firebase | 3-5 min |
| Install pods | 2-3 min |
| Build in Xcode | 2-3 min |
| Run on simulator | 1 min |
| **Total** | **~15 min** |

---

**Last Updated:** November 2024
**Script Version:** 1.0
