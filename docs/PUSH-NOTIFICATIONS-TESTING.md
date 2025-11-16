# Push Notifications Testing Guide

Complete guide to test push notifications for the Biblical Lessons app.

## Quick Test (3 minutes)

### 1. Set Up Backend

```bash
cd backend/nodejs
npm install
npm run dev
```

Server runs on `http://localhost:3000`

### 2. Send Test Notification

```bash
# Send to all users subscribed to "lessons" topic
curl -X POST http://localhost:3000/api/notifications/send-topic \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "lessons",
    "title": "Test Notification",
    "body": "This is a test message",
    "data": {"lessonId": "test-123"}
  }'
```

Expected response:
```json
{
  "success": true,
  "messageId": "message-id-here"
}
```

---

## Testing via API

### Available Endpoints

#### 1. Send to Topic (Broadcast)

**Endpoint:** `POST /api/notifications/send-topic`

**Description:** Send notification to all users subscribed to a topic

**Request:**
```bash
curl -X POST http://localhost:3000/api/notifications/send-topic \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "lessons",
    "title": "New Lesson",
    "body": "Check out: The Parable of the Talents",
    "data": {
      "lessonId": "lesson-001",
      "lessonCategory": "Financial Stewardship"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "messageId": "0:1234567890123456%1234567890abcd"
}
```

#### 2. Send to Specific User

**Endpoint:** `POST /api/notifications/send-user`

**Description:** Send notification to a specific user's registered devices

**Request:**
```bash
curl -X POST http://localhost:3000/api/notifications/send-user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid-here",
    "title": "Welcome!",
    "body": "Thanks for downloading Biblical Lessons",
    "data": {
      "type": "welcome"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "responses": ["message-id-1", "message-id-2"]
}
```

#### 3. Subscribe to Topic

**Endpoint:** `POST /api/notifications/subscribe`

**Description:** Subscribe device tokens to a topic

**Request:**
```bash
curl -X POST http://localhost:3000/api/notifications/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "tokens": [
      "fcm-token-1",
      "fcm-token-2"
    ],
    "topic": "daily-lessons"
  }'
```

**Response:**
```json
{
  "success": true
}
```

#### 4. Send Daily Reminder

**Endpoint:** `POST /api/notifications/send-daily-reminder`

**Description:** Send lesson reminder to all subscribers

**Request:**
```bash
curl -X POST http://localhost:3000/api/notifications/send-daily-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "lesson-002",
    "lessonTitle": "Integrity in Business Dealings",
    "lessonCategory": "Integrity & Ethics"
  }'
```

**Response:**
```json
{
  "success": true,
  "messageId": "message-id-here"
}
```

#### 5. Send Batch Notifications

**Endpoint:** `POST /api/notifications/send-batch`

**Description:** Send notification to multiple users at once

**Request:**
```bash
curl -X POST http://localhost:3000/api/notifications/send-batch \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [
      "user-1",
      "user-2",
      "user-3"
    ],
    "title": "Special Announcement",
    "body": "New biblical lessons available",
    "data": {
      "type": "announcement"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "results": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "errors": []
  }
}
```

#### 6. Save FCM Token

**Endpoint:** `POST /api/notifications/save-token`

**Description:** Register device token for a user (called from iOS app)

**Request:**
```bash
curl -X POST http://localhost:3000/api/notifications/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid-here",
    "token": "fcm-device-token-here"
  }'
```

**Response:**
```json
{
  "success": true
}
```

#### 7. Remove FCM Token

**Endpoint:** `POST /api/notifications/remove-token`

**Description:** Remove device token (called on logout)

**Request:**
```bash
curl -X POST http://localhost:3000/api/notifications/remove-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid-here",
    "token": "fcm-device-token-here"
  }'
```

**Response:**
```json
{
  "success": true
}
```

#### 8. Get Statistics

**Endpoint:** `GET /api/notifications/stats`

**Description:** Get notification send statistics

**Request:**
```bash
curl http://localhost:3000/api/notifications/stats
```

**Response:**
```json
{
  "total": 10,
  "sent": 9,
  "failed": 1,
  "byType": {
    "topic": 5,
    "user": 4,
    "batch": 1
  }
}
```

---

## Testing via Firebase Console

### Send Test Notification

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select BibleApp project
3. Go to **Cloud Messaging**
4. Click **Create your first campaign**
5. Enter:
   - **Notification Title:** "Test Notification"
   - **Notification Text:** "This is a test"
6. Click **Send test message**
7. Select a test device
8. Notification appears instantly

---

## iOS Testing

### Prerequisites

- Xcode with BibleApp project open
- iOS 14+ simulator or device
- Firebase configured in app

### Test Steps

1. **Start Backend:**
```bash
cd backend/nodejs
npm run dev
```

2. **Run iOS App:**
   - In Xcode: Cmd+R
   - App launches in simulator

3. **Create Account:**
   - Email: `test@example.com`
   - Password: `password123`
   - Name: `Test User`

4. **Grant Notification Permission:**
   - Simulator shows permission dialog
   - Tap "Allow" or "Allow Notifications"

5. **Open Simulator Logs:**
   - Simulator menu: System Log
   - Watch for FCM token registration
   - Look for "FCM Token:" message

6. **Send Test Notification:**
```bash
curl -X POST http://localhost:3000/api/notifications/send-topic \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "lessons",
    "title": "Test Lesson",
    "body": "Testing push notifications",
    "data": {"lessonId": "test-001"}
  }'
```

7. **Verify Notification:**
   - Notification banner appears on simulator
   - Tap to open notification
   - App should handle the notification
   - Check console logs for handling

---

## Troubleshooting

### Issue: "APNs certificate not found"

**Solution:**
1. Verify certificate uploaded to Firebase Console
2. Check it matches your bundle ID
3. Re-upload if needed
4. Wait 30 seconds for certificate to activate

### Issue: "Invalid APNS certificate"

**Solution:**
1. Download new certificate from Apple Developer
2. Convert to .p8 format if needed
3. Re-upload to Firebase
4. Restart app

### Issue: Notifications not received on device

**Solution:**
1. Check device has notification permission granted
2. Verify app is in background (not currently in use)
3. Check internet connection is active
4. Look for error messages in Xcode console
5. Verify Firebase credentials are correct

### Issue: "No tokens registered"

**Solution:**
1. Ensure app calls `registerForRemoteNotifications()`
2. Check FCM token is being saved to backend
3. Verify Firebase initialization in app
4. Check app has notification permission

### Issue: "Topic not found"

**Solution:**
1. Verify topic name is correct (case-sensitive)
2. Ensure tokens are subscribed to topic
3. Common topics: `lessons`, `daily-lessons`, `announcements`
4. Use lowercase with hyphens for topic names

### Issue: Messages in Firebase Console

**Solution:**
1. Check Xcode console for Firebase errors
2. Verify service account has correct permissions
3. Check Firebase Cloud Messaging API is enabled
4. Ensure backend has Firebase credentials

---

## Sample Test Data

### Lesson Notifications

```bash
# Send lesson notification
curl -X POST http://localhost:3000/api/notifications/send-daily-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "lesson-001",
    "lessonTitle": "The Parable of the Talents",
    "lessonCategory": "Financial Stewardship"
  }'
```

### Announcement Notification

```bash
curl -X POST http://localhost:3000/api/notifications/send-topic \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "announcements",
    "title": "Important Update",
    "body": "New biblical lessons available this week",
    "data": {
      "type": "announcement",
      "priority": "high"
    }
  }'
```

### Welcome Notification

```bash
curl -X POST http://localhost:3000/api/notifications/send-user \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "new-user-id",
    "title": "Welcome to Biblical Lessons!",
    "body": "Start your journey of faith-based entrepreneurship",
    "data": {
      "type": "welcome",
      "lessonId": "lesson-001"
    }
  }'
```

---

## Performance Testing

### Load Test: Send to 1000 Users

```bash
# Send batch notification to many users
curl -X POST http://localhost:3000/api/notifications/send-batch \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [
      "user-1", "user-2", ... "user-1000"
    ],
    "title": "Daily Lesson",
    "body": "New biblical lesson available",
    "data": {"type": "daily"}
  }'
```

### Monitor Performance

```bash
# Check notification statistics
curl http://localhost:3000/api/notifications/stats | jq '.'
```

---

## Verification Checklist

- [ ] Backend server running on port 3000
- [ ] Firebase project created and configured
- [ ] APNs certificate uploaded to Firebase
- [ ] iOS app has push notification capability
- [ ] FCM tokens being saved to Firestore
- [ ] Can send notification via API
- [ ] Can send notification via Firebase Console
- [ ] Notification appears on simulator/device
- [ ] Notification can be tapped to open app
- [ ] Notification data is accessible in app

---

## Next Steps

After testing:
1. Implement iOS UI to handle notifications
2. Set up daily notification scheduler
3. Add user preference for notification types
4. Monitor notification delivery rates
5. Analyze user engagement with notifications

---

## Support

For issues:
- Check [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- Review [iOS Push Notification Guide](https://developer.apple.com/documentation/usernotifications)
- Check Xcode console logs for errors
