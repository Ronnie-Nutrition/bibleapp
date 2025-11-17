# User Preferences API Documentation

Complete API reference for managing user notification preferences.

## Overview

The User Preferences API allows you to save and retrieve user notification settings, preferred lesson categories, and notification times. All preferences are stored in Firestore and synced with the iOS app.

## Base URL

```
http://localhost:3000/api/preferences
```

## Authentication

All endpoints require `userId` to identify the user. The userId should be the Firebase UID.

## API Endpoints

### 1. Get User Preferences

**Endpoint:** `GET /api/preferences`

**Description:** Retrieve all user preferences

**Query Parameters:**
- `userId` (required) - User's Firebase UID

**Request:**

```bash
curl http://localhost:3000/api/preferences?userId=user-uid-here
```

**Response:**

```json
{
  "success": true,
  "preferences": {
    "notificationsEnabled": true,
    "emailNotifications": true,
    "dailyLessonsEnabled": true,
    "dailyReminderTime": "09:00",
    "preferredCategories": [
      "Financial Stewardship",
      "Leadership & Authority"
    ],
    "notificationTypes": {
      "new-lessons": true,
      "announcements": true,
      "reminders": true,
      "daily-lessons": true
    },
    "theme": "system"
  }
}
```

### 2. Update Single Preference

**Endpoint:** `POST /api/preferences/update`

**Description:** Update a single preference value

**Request Body:**
- `userId` (required) - User's Firebase UID
- `preference` (required) - Preference key
- `value` (required) - New value

**Valid Preference Keys:**
- `notificationsEnabled` (boolean)
- `emailNotifications` (boolean)
- `dailyLessonsEnabled` (boolean)
- `theme` (string: "light", "dark", "system")

**Request:**

```bash
curl -X POST http://localhost:3000/api/preferences/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid-here",
    "preference": "notificationsEnabled",
    "value": false
  }'
```

**Response:**

```json
{
  "success": true
}
```

### 3. Update Notification Type

**Endpoint:** `POST /api/preferences/notification-type`

**Description:** Enable or disable specific notification types

**Request Body:**
- `userId` (required) - User's Firebase UID
- `type` (required) - Notification type
- `enabled` (required) - Boolean

**Valid Notification Types:**
- `new-lessons` - New lessons available
- `announcements` - App announcements
- `reminders` - Custom reminders
- `daily-lessons` - Daily lesson notifications

**Request:**

```bash
curl -X POST http://localhost:3000/api/preferences/notification-type \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid-here",
    "type": "announcements",
    "enabled": true
  }'
```

**Response:**

```json
{
  "success": true
}
```

### 4. Update Preferred Categories

**Endpoint:** `POST /api/preferences/categories`

**Description:** Set preferred lesson categories for notifications

**Request Body:**
- `userId` (required) - User's Firebase UID
- `categories` (required) - Array of category names

**Valid Categories:**
- "Leadership & Authority"
- "Integrity & Ethics"
- "Financial Stewardship"
- "Trust & Faith"
- "Serving Others"
- "Perseverance"
- "Wisdom & Discernment"
- "Community & Partnership"
- "Time & Productivity"
- "Decision Making"

**Request:**

```bash
curl -X POST http://localhost:3000/api/preferences/categories \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid-here",
    "categories": [
      "Financial Stewardship",
      "Leadership & Authority",
      "Trust & Faith"
    ]
  }'
```

**Response:**

```json
{
  "success": true
}
```

### 5. Update Daily Reminder Time

**Endpoint:** `POST /api/preferences/daily-time`

**Description:** Set the time for daily lesson reminders (UTC)

**Request Body:**
- `userId` (required) - User's Firebase UID
- `time` (required) - Time in HH:mm format (24-hour, UTC)

**Valid Times:**
- Must be in HH:mm format
- Hours: 00-23
- Minutes: 00-59
- Timezone: UTC

**Request:**

```bash
curl -X POST http://localhost:3000/api/preferences/daily-time \
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

### 6. Batch Update Preferences

**Endpoint:** `POST /api/preferences/batch-update`

**Description:** Update multiple preferences at once

**Request Body:**
- `userId` (required) - User's Firebase UID
- `updates` (required) - Object with preference key-value pairs

**Request:**

```bash
curl -X POST http://localhost:3000/api/preferences/batch-update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid-here",
    "updates": {
      "notificationsEnabled": true,
      "emailNotifications": false,
      "theme": "dark"
    }
  }'
```

**Response:**

```json
{
  "success": true
}
```

### 7. Reset Preferences to Defaults

**Endpoint:** `POST /api/preferences/reset`

**Description:** Reset all user preferences to default values

**Request Body:**
- `userId` (required) - User's Firebase UID

**Default Values:**
```json
{
  "notificationsEnabled": true,
  "emailNotifications": true,
  "dailyLessonsEnabled": true,
  "dailyReminderTime": "09:00",
  "preferredCategories": [],
  "notificationTypes": {
    "new-lessons": true,
    "announcements": true,
    "reminders": true,
    "daily-lessons": true
  },
  "theme": "system"
}
```

**Request:**

```bash
curl -X POST http://localhost:3000/api/preferences/reset \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uid-here"
  }'
```

**Response:**

```json
{
  "success": true
}
```

### 8. Get Preference Statistics

**Endpoint:** `GET /api/preferences/stats`

**Description:** Get aggregate statistics about user preferences (admin/analytics only)

**Request:**

```bash
curl http://localhost:3000/api/preferences/stats
```

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "notificationsEnabled": 145,
    "emailNotificationsEnabled": 120,
    "dailyLessonsEnabled": 140,
    "preferredCategories": {
      "Financial Stewardship": 85,
      "Leadership & Authority": 70,
      "Trust & Faith": 60
    },
    "notificationTypes": {
      "new-lessons": 140,
      "announcements": 130,
      "reminders": 100,
      "daily-lessons": 140
    },
    "notificationTimes": {
      "09:00": 45,
      "14:30": 35,
      "18:00": 30
    }
  }
}
```

---

## Error Responses

### Missing Required Fields

**Status Code:** 400

```json
{
  "error": "Missing required fields: userId, preference"
}
```

### Invalid Preference

**Status Code:** 400

```json
{
  "error": "Invalid preference key: invalidKey"
}
```

### Invalid Time Format

**Status Code:** 400

```json
{
  "error": "Invalid time format. Use HH:mm (24-hour format)"
}
```

### User Not Found

**Status Code:** 500

```json
{
  "error": "User user-123 not found"
}
```

### Server Error

**Status Code:** 500

```json
{
  "error": "Internal Server Error"
}
```

---

## Testing with cURL

### Test 1: Get User Preferences

```bash
curl http://localhost:3000/api/preferences?userId=test-user-123
```

### Test 2: Enable Notifications

```bash
curl -X POST http://localhost:3000/api/preferences/update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "preference": "notificationsEnabled",
    "value": true
  }'
```

### Test 3: Set Daily Reminder Time

```bash
curl -X POST http://localhost:3000/api/preferences/daily-time \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "time": "14:00"
  }'
```

### Test 4: Set Preferred Categories

```bash
curl -X POST http://localhost:3000/api/preferences/categories \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "categories": [
      "Financial Stewardship",
      "Leadership & Authority"
    ]
  }'
```

### Test 5: Reset Preferences

```bash
curl -X POST http://localhost:3000/api/preferences/reset \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user-123"}'
```

---

## Integration with iOS App

The iOS app uses these endpoints through the `NotificationPreferencesViewModel`:

```swift
// Load preferences
await viewModel.loadPreferences()

// Update a preference
await viewModel.updatePreference(key: "notificationsEnabled", value: true)

// Update notification time
await viewModel.updateNotificationTime(newTime)

// Update categories
await viewModel.updatePreferredCategories()
```

---

## Data Persistence

All preferences are stored in Firestore at:

```
firestore/
├── users/
│   └── {userId}/
│       └── preferences: {
│           notificationsEnabled: boolean,
│           emailNotifications: boolean,
│           dailyLessonsEnabled: boolean,
│           dailyReminderTime: string,
│           preferredCategories: array,
│           notificationTypes: object,
│           theme: string
│       }
```

---

## Validation Rules

| Field | Type | Rules |
|-------|------|-------|
| `notificationsEnabled` | Boolean | - |
| `emailNotifications` | Boolean | - |
| `dailyLessonsEnabled` | Boolean | - |
| `dailyReminderTime` | String | HH:mm format, 24-hour, UTC |
| `preferredCategories` | Array | Valid lesson category names |
| `notificationTypes` | Object | Valid type keys: new-lessons, announcements, reminders, daily-lessons |
| `theme` | String | "light", "dark", or "system" |

---

## Rate Limiting

No rate limiting implemented. In production, consider adding:

```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/preferences', limiter);
```

---

## Performance Tips

1. **Batch Updates:** Use `/batch-update` when updating multiple preferences
2. **Caching:** Cache preferences client-side and sync periodically
3. **Validation:** Validate on client-side before sending to server
4. **Async:** Use async/await for better error handling

---

## Examples

### Complete User Setup Flow

```javascript
// 1. Create new user (done during signup)
const userId = "new-user-id";

// 2. Load default preferences (auto-created in signup)
GET /api/preferences?userId=${userId}

// 3. User updates their preferences
POST /api/preferences/update
{
  "userId": userId,
  "preference": "notificationsEnabled",
  "value": true
}

// 4. User selects lesson categories
POST /api/preferences/categories
{
  "userId": userId,
  "categories": ["Financial Stewardship", "Trust & Faith"]
}

// 5. User sets daily reminder time
POST /api/preferences/daily-time
{
  "userId": userId,
  "time": "14:30"
}
```

---

## API Version

**Version:** 1.0.0

**Last Updated:** November 2024
