# App Store Connect Setup Guide

This guide walks you through preparing your app for the Apple App Store.

## Prerequisites

- Apple Developer Account ($99/year)
- Completed app ready for submission
- Marketing materials (screenshots, app description)
- Privacy Policy URL
- Support email address

## Step 1: Create App Bundle ID

### In Xcode:
1. Open `BibleApp.xcodeproj`
2. Select the BibleApp target
3. Go to "Signing & Capabilities"
4. Verify Bundle Identifier (e.g., `com.yourcompany.bibleapp`)
5. Ensure the bundle ID matches what you'll register

### Register Bundle ID on Apple Developer:
1. Go to [developer.apple.com](https://developer.apple.com)
2. Sign in to your account
3. Go to "Certificates, Identifiers & Profiles"
4. Click "Identifiers"
5. Click the "+" button to register a new identifier
6. Select "App IDs"
7. Fill in:
   - App Name: "Biblical Lessons"
   - Bundle ID: `com.yourcompany.bibleapp`
   - Capabilities: Push Notifications, Sign in with Apple

## Step 2: Create Signing Certificates

### Create a Certificate Signing Request (CSR):
1. On your Mac, open Keychain Access
2. Go to Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
3. Email Address: your developer email
4. Common Name: your name or team
5. Request is: Saved to disk
6. Save the CSR file

### Create Distribution Certificate:
1. Go to [developer.apple.com](https://developer.apple.com)
2. Go to "Certificates, Identifiers & Profiles" → "Certificates"
3. Click "+"
4. Select "App Store and Ad Hoc"
5. Upload your CSR
6. Download the certificate
7. Double-click to install in Keychain

## Step 3: Create Provisioning Profile

### For App Store Distribution:
1. Go to [developer.apple.com](https://developer.apple.com)
2. Go to "Provisioning Profiles"
3. Click "+"
4. Select "App Store"
5. Select your Bundle ID
6. Select your Distribution Certificate
7. Name: "BibleApp App Store"
8. Download the profile
9. Double-click to install in Xcode

## Step 4: Set Up App Store Connect

### Create App Record:
1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Go to "My Apps"
3. Click "+"
4. Select "New App"
5. Fill in:
   - Platform: iOS
   - Name: "Biblical Lessons"
   - Primary Language: English
   - Bundle ID: (select your registered bundle ID)
   - SKU: (unique identifier, e.g., BL-2024-001)
   - Access: Full Access

## Step 5: Fill in App Information

### In App Store Connect, complete:

#### App Information
- Category: Books
- Subcategory: Religion & Spirituality
- Content Rights: Owns Content
- Age Rating: 4+

#### Pricing and Availability
- Price Tier: Free
- Availability: Worldwide (or select specific regions)

#### General App Information
- Subtitle: "Biblical wisdom for entrepreneurs"
- Description:
```
Biblical Lessons for Entrepreneurs is a comprehensive iOS app that brings timeless biblical
principles to modern business challenges. Designed for business owners who want to build their
enterprises on biblical foundations.

Features:
• Daily biblical lessons on leadership, integrity, faith, and stewardship
• Real-life application of scripture to entrepreneurial challenges
• Progress tracking and personalized learning paths
• Offline access to all lessons
• Push notifications for daily inspiration

Whether you're facing a major business decision, struggling with team leadership, or seeking
biblical guidance for your entrepreneurial journey, this app provides practical wisdom from
scripture that applies directly to modern business.

Learn from biblical principles on:
• Financial stewardship
• Integrity in dealings
• Servant leadership
• Overcoming fear
• Wisdom in decision-making
• Building trust and relationships
• Purpose-driven entrepreneurship

All lessons are crafted to be jargon-free, practical, and immediately applicable to your business.
```

- Keywords: bible, lessons, entrepreneur, business, faith, leadership, Christianity
- Support URL: https://yourwebsite.com/support
- Privacy Policy URL: https://yourwebsite.com/privacy
- App Privacy Policy: [Fill based on GDPR/privacy requirements]

#### Screenshots and Preview
Upload for each device size:
- 5.5" Display (iPhone 14 Plus/Pro Max)
- 6.7" Display (iPhone 14 Pro Max)
- 6.1" Display (iPhone 14 Pro)
- 5.8" Display (iPhone XS)

Screenshots should show:
1. App home screen
2. Lesson browsing
3. Lesson detail with scripture
4. User profile/progress
5. Key features

#### Preview
Create a short video showing:
- Opening the app
- Browsing lessons
- Reading a lesson
- Marking as complete

## Step 6: Configure Build Settings for Distribution

### In Xcode:
1. Select BibleApp project
2. Select BibleApp target
3. Go to "Build Settings"
4. Search for "Code Signing"
5. Set:
   - Code Signing Style: Automatic (or Manual)
   - Signing Certificate: Apple Distribution
   - Provisioning Profile: BibleApp App Store

### Build Settings for Release:
- Product → Scheme → Edit Scheme
- Select "Release" as build configuration
- Under "Pre-actions" → Add build number script

## Step 7: Archive and Upload

### Archive Your App:
1. Select Generic iOS Device (not a simulator)
2. Product → Archive
3. Wait for archive to complete
4. Organizer window opens automatically

### Validate with App Store:
1. Select your archive
2. Click "Validate"
3. Select team
4. Validate

### Submit to App Store:
1. Select your archive
2. Click "Distribute App"
3. Select "App Store Connect"
4. Follow prompts to submit

## Step 8: Review and Release

### In App Store Connect:
1. Go to your app
2. Go to "TestFlight" section
3. Wait for app processing (usually 1-2 hours)
4. Review notes and make any final changes

### Submit for Review:
1. Go to "App Store" section
2. Click "Submit for Review"
3. Answer review questions
4. Select release type (Automatic or Manual)
5. Submit

## Step 9: Monitor Review

### App Review Status:
- In Review: Apple is reviewing your app
- Ready for Sale: Approved! You can release it
- Rejected: Need to fix issues and resubmit

Monitor email for review status updates.

## Common App Store Rejection Reasons (Avoid These!)

1. **Incomplete functionality** - Ensure all features work
2. **Missing privacy policy** - Must have one
3. **Sign in required without benefit** - Optional sign-in is fine
4. **Misleading descriptions** - Match actual functionality
5. **Excessive ads** - Keep ads minimal
6. **Bugs or crashes** - Test thoroughly
7. **Copyright issues** - Ensure all Bible verses are properly cited

## Marketing Tips

1. **Prepare for launch:** Social media, press release, beta testing
2. **Optimize listing:** Use relevant keywords, compelling screenshots
3. **Gather reviews:** Launch to TestFlight beta testers first
4. **Plan updates:** Regular updates keep app visible
5. **Engage users:** Respond to reviews and feedback

## Post-Launch

### Monitor Analytics:
- Crash reports
- User engagement
- Downloads and revenue
- Reviews and ratings

### Regular Updates:
- Fix bugs reported
- Add new lessons quarterly
- Improve performance
- Update design if needed

## Resources

- [App Store Connect Help](https://help.apple.com/app-store-connect)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [iOS App Distribution Guide](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-release)
