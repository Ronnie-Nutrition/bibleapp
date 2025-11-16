# Push Notifications Quick Start (15 minutes)

Fast setup guide to get push notifications working.

## Step 1: Get APNs Certificate (5 min)

### 1.1 Create Certificate

1. Go to [developer.apple.com](https://developer.apple.com/account)
2. Sign in → **Certificates, Identifiers & Profiles**
3. Click **Certificates** → **+** button
4. Select **Apple Push Notification service SSL**
5. Choose your Bundle ID: `com.yourcompany.bibleapp`
6. Upload a CSR (create on Mac with Keychain Access if needed)
7. Download the certificate

### 1.2 Export Certificate

1. Open **Keychain Access** on Mac
2. Find "Apple Push Services: com.yourcompany.bibleapp"
3. Right-click → **Export**
4. Save as `APNsAuthKey.p8` or `.p12`
5. Keep empty password

## Step 2: Upload to Firebase (2 min)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select BibleApp project
3. Go to **Project Settings** → **Cloud Messaging**
4. Scroll to **APNs certificates**
5. Click **Upload**
6. Select your `.p8` or `.p12` file
7. Wait for confirmation ✓

## Step 3: Configure iOS App (3 min)

In Xcode:

1. Select **BibleApp** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability**
4. Add:
   - **Push Notifications**
   - **Background Modes** → check "Remote notifications"

## Step 4: Test It (5 min)

### Via Firebase Console

1. In Firebase Console → **Cloud Messaging**
2. Click **Create your first campaign**
3. Enter title and body
4. Click **Send test message**
5. Choose your device
6. Check your phone/simulator ✓

### Via API

```bash
# Start backend
cd backend/nodejs
npm run dev

# Send test notification
curl -X POST http://localhost:3000/api/notifications/send-topic \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "lessons",
    "title": "Test Notification",
    "body": "Push notifications are working!",
    "data": {"type": "test"}
  }'
```

Check your device for notification ✓

## Common Issues

### "Certificate not found"
- Verify certificate uploaded in Firebase Console
- Check bundle ID matches
- Wait 30 seconds for activation

### "Notifications not received"
- Make sure app has notification permission granted
- Check app is in background (not actively using)
- Verify Firebase is initialized in app

### "No devices registered"
- App must call `registerForRemoteNotifications()`
- Check console for FCM token message
- Verify Firebase Messaging is configured

## What's Included

✅ Notification permission requesting
✅ FCM token registration and management
✅ Topic-based broadcasting
✅ Direct device notifications
✅ Notification logging
✅ Error handling

## Next Steps

After testing:
1. Add APNs certificate to Firebase ✓
2. Test via Firebase Console ✓
3. Test via API ✓
4. Implement notification UI
5. Set up daily reminders
6. Monitor delivery rates

See [PUSH-NOTIFICATIONS.md](PUSH-NOTIFICATIONS.md) for detailed setup.
See [PUSH-NOTIFICATIONS-TESTING.md](PUSH-NOTIFICATIONS-TESTING.md) for full API reference.

---

**Everything working?** Start building lesson notification features! 🎉
