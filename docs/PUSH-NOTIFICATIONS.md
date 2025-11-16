# Push Notifications Setup Guide

Complete guide to implementing push notifications for the Biblical Lessons app.

## Overview

Push notifications allow you to send messages to users about new lessons, reminders, and engagement. The system uses:
- **Firebase Cloud Messaging (FCM)** - Message delivery
- **Apple Push Notification Service (APNs)** - iOS delivery
- **Node.js/Django Backend** - Message scheduling and sending

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Set Up APNs Certificate](#step-1-set-up-apns-certificate)
3. [Step 2: Upload to Firebase](#step-2-upload-to-firebase)
4. [Step 3: Configure iOS App](#step-3-configure-ios-app)
5. [Step 4: Set Up Backend](#step-4-set-up-backend)
6. [Step 5: Test Notifications](#step-5-test-notifications)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Xcode 14.0+
- Apple Developer Account (paid)
- Firebase project with Firestore
- iOS app configured in Firebase Console
- Node.js or Django backend running

---

## Step 1: Set Up APNs Certificate

### 1.1 Create Certificate Signing Request (CSR)

On your Mac:

1. Open **Keychain Access** (Applications → Utilities)
2. Go to **Keychain Access** → **Certificate Assistant** → **Request a Certificate from a Certificate Authority**
3. Fill in:
   - **Email Address:** your-email@example.com
   - **Common Name:** Your Name or Company
   - **CA Email Address:** leave blank
   - **Request is:** "Saved to disk"
4. Click **Continue**
5. Save as `CertificateSigningRequest.certSigningRequest`
6. Click **Done**

### 1.2 Create APNs Certificate

1. Go to [developer.apple.com](https://developer.apple.com/account)
2. Sign in with your Apple Developer account
3. Click **Certificates, Identifiers & Profiles**
4. Click **Certificates** (in left sidebar)
5. Click the **+** button to create new certificate
6. Select **Apple Push Notification service SSL (Sandbox & Production)**
7. Click **Continue**
8. Select your **Bundle ID** (e.g., com.yourcompany.bibleapp)
9. Click **Continue**
10. Upload your CSR file (CertificateSigningRequest.certSigningRequest)
11. Click **Continue**
12. Click **Download** to save the certificate
13. Double-click the downloaded .cer file to install in Keychain

---

## Step 2: Upload to Firebase

### 2.1 Export from Keychain

1. Open **Keychain Access**
2. Find your certificate: "Apple Push Services: com.yourcompany.bibleapp"
3. Right-click on the certificate
4. Select **Export "Apple Push Services..."**
5. Save as `APNsAuthKey.p8` (or .p12 format)
6. When prompted, optionally set a password (leave blank for easier setup)

### 2.2 Upload to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your BibleApp project
3. Go to **Project Settings** (gear icon)
4. Click **Cloud Messaging** tab
5. Scroll to **APNs certificates**
6. Click **Upload**
7. Select your exported certificate file
8. Click **Upload**

You should see confirmation: "Certificate uploaded successfully"

---

## Step 3: Configure iOS App

### 3.1 Update App Capabilities

1. Open `ios/BibleApp.xcodeproj` in Xcode
2. Select **BibleApp** target
3. Go to **Signing & Capabilities**
4. Click **+ Capability**
5. Search for and add:
   - **Push Notifications**
   - **Background Modes** (select "Remote notifications")

### 3.2 Add Firebase Messaging Delegate

Update `ios/BibleApp/App/BibleAppApp.swift` to handle messaging:

```swift
import FirebaseMessaging

// Add to AppDelegate class
extension AppDelegate: MessagingDelegate {
    // Handle FCM token registration
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        let dataDict: [String: String] = ["token": fcmToken ?? ""]
        NotificationCenter.default.post(
            name: NSNotification.Name("FCMToken"),
            object: nil,
            userInfo: dataDict
        )

        // Send token to your backend for user notification subscriptions
        if let token = fcmToken {
            print("FCM Token: \(token)")
            // TODO: Save token to backend
        }
    }
}
```

### 3.3 Request User Permission

Add to `BibleAppApp.swift`:

```swift
UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
    DispatchQueue.main.async {
        UIApplication.shared.registerForRemoteNotifications()
    }
}
```

---

## Step 4: Set Up Backend

### 4.1 Create Notification Service

Create `backend/nodejs/services/notificationService.js`:

```javascript
const { messaging, db } = require('../config/firebase');

class NotificationService {
  /**
   * Send notification to a topic (all users subscribed)
   */
  async sendToTopic(topic, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body
        },
        data,
        android: {
          priority: 'high'
        },
        apns: {
          headers: {
            'apns-priority': '10'
          },
          payload: {
            aps: {
              alert: {
                title,
                body
              },
              badge: 1,
              sound: 'default'
            }
          }
        },
        topic
      };

      const response = await messaging.send(message);
      console.log('Notification sent to topic:', response);
      return response;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to specific user device
   */
  async sendToUser(userId, title, body, data = {}) {
    try {
      // Get user's FCM tokens from Firestore
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }

      const tokens = userDoc.data()?.fcmTokens || [];

      if (tokens.length === 0) {
        console.warn(`No FCM tokens for user ${userId}`);
        return;
      }

      const message = {
        notification: { title, body },
        data
      };

      // Send to all user devices
      const promises = tokens.map(token =>
        messaging.send({
          ...message,
          token
        })
      );

      const responses = await Promise.all(promises);
      console.log('Notifications sent to user:', responses);
      return responses;
    } catch (error) {
      console.error('Error sending user notification:', error);
      throw error;
    }
  }

  /**
   * Subscribe user to topic
   */
  async subscribeToTopic(tokens, topic) {
    try {
      if (tokens.length === 0) return;

      await messaging.subscribeToTopic(tokens, topic);
      console.log(`Subscribed ${tokens.length} devices to topic: ${topic}`);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe user from topic
   */
  async unsubscribeFromTopic(tokens, topic) {
    try {
      if (tokens.length === 0) return;

      await messaging.unsubscribeFromTopic(tokens, topic);
      console.log(`Unsubscribed ${tokens.length} devices from topic: ${topic}`);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }

  /**
   * Send daily lesson notification
   */
  async sendDailyLessonReminder(lessonId, lessonTitle) {
    try {
      // Get users who want daily reminders
      const usersSnapshot = await db.collection('users')
        .where('preferences.notificationsEnabled', '==', true)
        .get();

      const users = [];
      usersSnapshot.forEach(doc => {
        users.push(doc.id);
      });

      if (users.length === 0) return;

      // Send to topic instead of individual users
      await this.sendToTopic('daily-lessons', 'New Lesson Available', lessonTitle, {
        lessonId,
        type: 'new-lesson'
      });

      // Log notification
      await db.collection('notifications').add({
        type: 'daily-lesson',
        lessonId,
        lessonTitle,
        sentAt: new Date(),
        recipientCount: users.length
      });

      console.log(`Daily reminder sent to ${users.length} users`);
    } catch (error) {
      console.error('Error sending daily reminder:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
```

### 4.2 Add Notification Routes

Update `backend/nodejs/server.js`:

```javascript
const notificationService = require('./services/notificationService');

// MARK: - Notification Routes (Update existing)
const notificationsRouter = express.Router();

// Send to topic (all subscribers)
notificationsRouter.post('/send-topic', async (req, res) => {
  try {
    const { topic, title, body, data } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({
        error: 'Missing required fields: topic, title, body'
      });
    }

    const response = await notificationService.sendToTopic(topic, title, body, data);
    res.json({ success: true, messageId: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send to specific user
notificationsRouter.post('/send-user', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        error: 'Missing required fields: userId, title, body'
      });
    }

    const responses = await notificationService.sendToUser(userId, title, body, data);
    res.json({ success: true, responses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscribe to topic
notificationsRouter.post('/subscribe', async (req, res) => {
  try {
    const { tokens, topic } = req.body;

    if (!tokens || !topic) {
      return res.status(400).json({
        error: 'Missing required fields: tokens, topic'
      });
    }

    await notificationService.subscribeToTopic(tokens, topic);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe from topic
notificationsRouter.post('/unsubscribe', async (req, res) => {
  try {
    const { tokens, topic } = req.body;

    if (!tokens || !topic) {
      return res.status(400).json({
        error: 'Missing required fields: tokens, topic'
      });
    }

    await notificationService.unsubscribeFromTopic(tokens, topic);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send daily lesson reminder
notificationsRouter.post('/send-daily-reminder', async (req, res) => {
  try {
    const { lessonId, lessonTitle } = req.body;

    if (!lessonId || !lessonTitle) {
      return res.status(400).json({
        error: 'Missing required fields: lessonId, lessonTitle'
      });
    }

    await notificationService.sendDailyLessonReminder(lessonId, lessonTitle);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/notifications', notificationsRouter);
```

---

## Step 5: Test Notifications

### 5.1 Test via Firebase Console

1. Go to Firebase Console → Cloud Messaging
2. Click **Create your first campaign**
3. Enter:
   - **Title:** "Test Notification"
   - **Body:** "This is a test message"
4. Click **Send test message**
5. Select a device to test
6. You should receive the notification

### 5.2 Test via API

```bash
# Send to all subscribers of a topic
curl -X POST http://localhost:3000/api/notifications/send-topic \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "lessons",
    "title": "New Lesson Available",
    "body": "Check out: The Parable of the Talents",
    "data": {"lessonId": "lesson-001"}
  }'

# Send to specific user
curl -X POST http://localhost:3000/api/notifications/send-user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid-here",
    "title": "Welcome!",
    "body": "Thanks for downloading Biblical Lessons",
    "data": {"type": "welcome"}
  }'
```

### 5.3 Test in iOS App

1. Build and run app in simulator
2. Go through Firebase authentication (sign up)
3. Close app
4. Send notification via API or Firebase Console
5. Notification should appear on simulator
6. Tap it to open app

---

## Troubleshooting

### Issue: "APNs certificate not found"
**Solution:**
1. Verify certificate is uploaded in Firebase Console
2. Check bundle ID matches your app
3. Re-download and re-upload certificate if needed

### Issue: "No devices registered"
**Solution:**
1. Ensure app has push notification permission enabled
2. Check that app calls `registerForRemoteNotifications()`
3. Verify FCM token is being generated and saved

### Issue: "Invalid topic"
**Solution:**
1. Topic name must match what's subscribed in app
2. Common topics: "lessons", "daily-lessons", "announcements"
3. Keep topic names lowercase and use hyphens

### Issue: "Permission denied" sending notifications
**Solution:**
1. Check Firebase Cloud Messaging API is enabled
2. Verify service account has correct permissions
3. Check backend has Firebase credentials

### Issue: Notifications not appearing in app
**Solution:**
1. Check app has notification permission granted
2. Verify `UNUserNotificationCenter` delegate is set up
3. Check app is actually receiving the notification (add logging)
4. Ensure notification handling code is in `willPresent` delegate

---

## iOS Notification Handling

Update `ios/BibleApp/App/BibleAppApp.swift` to handle notifications properly:

```swift
// Add this extension to handle incoming notifications
extension AppDelegate: UNUserNotificationCenterDelegate {
    // Handle notification while app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        let userInfo = notification.request.content.userInfo

        // Log notification
        print("Foreground notification received:")
        if let title = notification.request.content.title as String? {
            print("  Title: \(title)")
        }
        if let body = notification.request.content.body as String? {
            print("  Body: \(body)")
        }

        // Handle notification data
        if let lessonId = userInfo["lessonId"] as? String {
            print("  Lesson ID: \(lessonId)")
            // TODO: Navigate to lesson
        }

        // Show notification banner even while app is open
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.alert, .sound, .badge])
        }
    }

    // Handle notification tap
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo

        print("Notification tapped:")
        if let lessonId = userInfo["lessonId"] as? String {
            print("  Opening lesson: \(lessonId)")
            // TODO: Navigate to lesson detail
        }

        completionHandler()
    }
}
```

---

## Next Steps

1. ✓ Set up APNs certificate
2. ✓ Upload to Firebase
3. ✓ Configure iOS app
4. ✓ Set up backend
5. ✓ Test notifications
6. → Implement in UI
7. → Schedule daily reminders
8. → Track notification engagement

---

## Useful Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [iOS Push Notification Guide](https://developer.apple.com/documentation/usernotifications)
- [APNs Setup Guide](https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server)
