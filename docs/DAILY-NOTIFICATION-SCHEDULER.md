# Daily Notification Scheduler Setup

Complete guide to set up automatic daily biblical lesson notifications for users.

## Overview

The Daily Notification Scheduler automatically sends biblical lessons to users at specified times. It supports:

- **Broadcast Notifications** - Daily lesson to all subscribed users (default at 9 AM UTC)
- **Personalized Notifications** - Custom notification times for individual users
- **Random Lesson Selection** - Randomly picks a lesson from your library
- **Scheduling Management** - Start/stop/update schedules dynamically
- **Notification History** - Track all sent notifications in Firestore

---

## How It Works

### Broadcast Scheduler (Default)

Runs once daily at 9 AM UTC and sends to all users subscribed to the `daily-lessons` topic:

```
┌─ Server starts
├─ node-cron initializes
├─ Every day at 9 AM UTC:
│  ├─ Selects random lesson
│  ├─ Sends to all subscribers
│  └─ Logs to Firestore
└─ Continues running
```

### Personalized Scheduler (Optional)

Each user gets their own schedule based on `preferences.dailyReminderTime`:

```
User A: 8:00 AM UTC → Notification sent
User B: 12:00 PM UTC → Notification sent
User C: 6:00 PM UTC → Notification sent
```

---

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd backend/nodejs
npm install
```

This installs `node-cron` for scheduling.

### 2. Start Backend

```bash
npm run dev
```

Output should show:

```
📅 Starting daily lesson notification scheduler...
✓ Daily broadcast scheduler started (9:00 AM UTC)
```

### 3. Test Scheduler Status

```bash
curl http://localhost:3000/api/scheduler/status
```

Expected response:

```json
{
  "success": true,
  "status": {
    "activeJobs": 1,
    "jobs": ["daily-broadcast"],
    "defaultTime": "09:00"
  }
}
```

---

## API Endpoints

### 1. Get Scheduler Status

**Endpoint:** `GET /api/scheduler/status`

**Description:** Get active scheduler jobs and status

**Response:**

```json
{
  "success": true,
  "status": {
    "activeJobs": 1,
    "jobs": ["daily-broadcast"],
    "defaultTime": "09:00"
  }
}
```

### 2. Get Notification History

**Endpoint:** `GET /api/scheduler/history?userId=optional`

**Description:** Get history of sent notifications

**Query Parameters:**

- `userId` (optional) - Filter by specific user

**Request:**

```bash
# Get all notifications
curl http://localhost:3000/api/scheduler/history

# Get notifications for specific user
curl http://localhost:3000/api/scheduler/history?userId=user-123
```

**Response:**

```json
{
  "success": true,
  "history": [
    {
      "id": "doc-id",
      "type": "daily-lesson",
      "lessonId": "lesson-001",
      "lessonTitle": "The Parable of the Talents",
      "scheduledTime": "2024-01-15T09:00:00.000Z",
      "status": "sent"
    }
  ]
}
```

### 3. Update User Notification Time

**Endpoint:** `POST /api/scheduler/update-time`

**Description:** Update when a user receives daily notifications

**Request:**

```bash
curl -X POST http://localhost:3000/api/scheduler/update-time \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid-here",
    "time": "14:30"
  }'
```

**Response:**

```json
{
  "success": true
}
```

---

## Configuration

### Change Default Broadcast Time

Edit `backend/nodejs/services/schedulerService.js`:

```javascript
// Change this line (default is 9 AM UTC)
const broadcastJob = cron.schedule('0 9 * * *', async () => {
  // Every day at 9 AM UTC

// To 6 PM UTC:
const broadcastJob = cron.schedule('0 18 * * *', async () => {

// To 2 AM UTC:
const broadcastJob = cron.schedule('0 2 * * *', async () => {
```

**Cron Format:** `minute hour * * *`

- Hour: 0-23 (UTC)
- Minute: 0-59

### Enable Personalized Schedulers

In `backend/nodejs/server.js`, uncomment this line:

```javascript
// Uncomment to enable personalized notification times
schedulerService.startPersonalizedSchedulers();
```

**Warning:** This creates a scheduler for each user with notifications enabled. For large user bases (1000+), consider using a queue system like Bull or Bee-Queue instead.

---

## Testing

### Simulate Daily Notification

You can manually trigger the daily notification:

```javascript
// In backend/nodejs/server.js for testing
schedulerService.sendDailyLessonNotification();
```

Or use this curl command to trigger directly:

```bash
# Manually send daily reminder (for testing)
curl -X POST http://localhost:3000/api/notifications/send-daily-reminder \
  -H "Content-Type: application/json" \
  -d '{
    "lessonId": "lesson-001",
    "lessonTitle": "The Parable of the Talents",
    "lessonCategory": "Financial Stewardship"
  }'
```

### Monitor Scheduler Logs

Check Firestore collections:

1. Go to Firebase Console
2. Firestore Database
3. Check these collections:
   - `scheduled_notifications` - All broadcast notifications
   - `user_notifications` - Per-user notifications (if personalized enabled)

### Test Personalized Notification Time

```bash
# Set user's preferred time
curl -X POST http://localhost:3000/api/scheduler/update-time \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "time": "14:30"
  }'

# Verify it was updated
curl http://localhost:3000/api/scheduler/status
```

---

## Data Structure

### Scheduled Notification Log

Stored in Firestore `scheduled_notifications` collection:

```javascript
{
  type: "daily-lesson",
  lessonId: "lesson-001",
  lessonTitle: "The Parable of the Talents",
  lessonCategory: "Financial Stewardship",
  messageId: "message-uuid",
  scheduledTime: Timestamp,
  status: "sent" | "failed",
  error: "error message if failed"
}
```

### User Notification Time Preference

Stored in Firestore `users/{userId}` document:

```javascript
{
  preferences: {
    notificationsEnabled: true,
    dailyReminderTime: "14:30",  // HH:mm format in UTC
    emailNotifications: true,
    theme: "system"
  }
}
```

---

## Troubleshooting

### Issue: "Scheduler not starting"

**Solution:**

1. Verify node-cron is installed: `npm list node-cron`
2. Check server logs for errors
3. Verify Firebase is initialized
4. Check service account has database access

### Issue: "Notifications not sending"

**Solution:**

1. Verify lessons exist in Firestore
2. Check user subscriptions to `daily-lessons` topic
3. Verify Firebase Cloud Messaging API is enabled
4. Check notification logs in Firestore

### Issue: "Time format invalid"

**Solution:**

Use 24-hour format: `HH:mm`

Valid examples:
- `09:00` (9 AM)
- `14:30` (2:30 PM)
- `23:59` (11:59 PM)

### Issue: "Too many scheduled jobs"

**Solution:**

If enabling personalized schedulers with many users:

1. Consider using a queue system (Bull, Bee-Queue)
2. Batch notifications by time
3. Use topic-based subscriptions instead
4. Implement user preference aggregation

---

## Performance Considerations

### Broadcast Scheduler (Default)

- ✅ Single job (low overhead)
- ✅ Scales to millions of users
- ✅ All users get same notification
- ✅ Recommended for most apps

### Personalized Schedulers

- ⚠️ One job per user with notifications enabled
- ⚠️ High overhead at scale (1000+ users)
- ✅ Each user gets custom time
- 📌 Consider for small user bases only

**Better Alternative for Personalized Times:**

Use Firebase Cloud Scheduler + Cloud Functions:

1. Single Cloud Function triggered at each time slot
2. Function queries users with that preference
3. Sends batch notifications
4. Scales efficiently

---

## Next Steps

1. ✓ Install node-cron dependency
2. ✓ Start scheduler with backend
3. ✓ Test scheduler status endpoint
4. → Create iOS UI for notification preferences
5. → Update user preferences from mobile app
6. → Monitor notification analytics

---

## Useful Resources

- [node-cron Documentation](https://www.npmjs.com/package/node-cron)
- [Cron Expression Format](https://crontab.guru/)
- [Firebase Firestore Logging](https://firebase.google.com/docs/firestore)
- [Cloud Scheduler Alternative](https://cloud.google.com/scheduler/docs)
