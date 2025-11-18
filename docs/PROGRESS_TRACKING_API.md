# Progress Tracking API Documentation

## Overview

The Progress Tracking API enables entrepreneurs to track their journey through biblical lessons, monitor completion statistics, maintain learning streaks, and compete on leaderboards. This system provides motivation through gamification while helping users build consistent daily habits.

## Base URL

All progress tracking endpoints are available at `/api/progress`

## Key Features

- **Lesson Completion Tracking** - Mark lessons as complete with timestamps
- **Streak Calculation** - Track consecutive days of learning
- **Time Tracking** - Monitor time spent on each lesson
- **Statistics Dashboard** - Comprehensive completion stats
- **Leaderboards** - Competitive rankings by completion
- **Date Range Queries** - Analyze progress over specific periods
- **Category Analysis** - Track learning across different biblical topics

## Data Model

### Progress Document Structure (Firestore)

Collection: `user_progress`
Document ID: `{userId}`

```json
{
  "userId": "user123",
  "completedLessons": [
    {
      "lessonId": "lesson456",
      "completedAt": "2025-11-18T10:30:00.000Z",
      "lessonTitle": "Servant Leadership",
      "lessonCategory": "leadership",
      "timeSpent": 420
    }
  ],
  "totalCompleted": 15,
  "totalTimeSpent": 6300,
  "currentStreak": 7,
  "longestStreak": 12,
  "lastActivityAt": "2025-11-18T10:30:00.000Z",
  "lastStreakDate": "2025-11-18T10:30:00.000Z",
  "createdAt": "2025-10-01T08:00:00.000Z"
}
```

---

## API Endpoints

### 1. Complete a Lesson

**POST** `/api/progress/complete`

Mark a lesson as complete and update user progress statistics.

**Request Body:**
```json
{
  "userId": "user123",
  "lessonId": "lesson456",
  "timeSpent": 420
}
```

**Parameters:**
- `userId` (string, required) - User ID
- `lessonId` (string, required) - Lesson ID to mark as complete
- `timeSpent` (number, optional) - Time spent in seconds

**Success Response (201):**
```json
{
  "success": true,
  "message": "Lesson marked as complete",
  "lessonId": "lesson456",
  "completedAt": "2025-11-18T10:30:00.000Z",
  "stats": {
    "totalCompleted": 15,
    "totalTimeSpent": 6300,
    "currentStreak": 7,
    "longestStreak": 12,
    "completionRate": 30,
    "categoriesStudied": [
      { "category": "leadership", "count": 5 },
      { "category": "integrity", "count": 10 }
    ],
    "averageTimePerLesson": 420,
    "lastActivityAt": "2025-11-18T10:30:00.000Z",
    "thisWeek": 5,
    "thisMonth": 15
  }
}
```

**Error Responses:**

*400 - Missing Fields*
```json
{
  "error": "Missing required fields",
  "code": "MISSING_FIELDS",
  "fields": {
    "userId": "User ID is required",
    "lessonId": null
  }
}
```

*404 - Lesson Not Found*
```json
{
  "error": "Lesson not found",
  "code": "COMPLETION_ERROR"
}
```

*409 - Already Completed*
```json
{
  "error": "Lesson already completed",
  "code": "COMPLETION_ERROR"
}
```

**Example Usage:**
```bash
curl -X POST http://localhost:3000/api/progress/complete \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "lessonId": "lesson456",
    "timeSpent": 420
  }'
```

---

### 2. Get User Progress

**GET** `/api/progress/:userId`

Retrieve all completed lessons for a user.

**Parameters:**
- `userId` (path parameter, required) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "progress": {
    "userId": "user123",
    "completedLessons": [
      {
        "lessonId": "lesson456",
        "completedAt": "2025-11-18T10:30:00.000Z",
        "lessonTitle": "Servant Leadership",
        "lessonCategory": "leadership",
        "timeSpent": 420
      },
      {
        "lessonId": "lesson789",
        "completedAt": "2025-11-17T09:15:00.000Z",
        "lessonTitle": "Integrity in Business",
        "lessonCategory": "integrity",
        "timeSpent": 600
      }
    ],
    "totalCompleted": 15,
    "totalTimeSpent": 6300,
    "currentStreak": 7,
    "longestStreak": 12,
    "lastActivityAt": "2025-11-18T10:30:00.000Z"
  }
}
```

**Example Usage:**
```bash
curl http://localhost:3000/api/progress/user123
```

---

### 3. Get User Statistics

**GET** `/api/progress/:userId/stats`

Get comprehensive statistics about user's learning progress.

**Parameters:**
- `userId` (path parameter, required) - User ID

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalCompleted": 15,
    "totalTimeSpent": 6300,
    "currentStreak": 7,
    "longestStreak": 12,
    "completionRate": 30,
    "categoriesStudied": [
      { "category": "leadership", "count": 5 },
      { "category": "integrity", "count": 7 },
      { "category": "wisdom", "count": 3 }
    ],
    "averageTimePerLesson": 420,
    "lastActivityAt": "2025-11-18T10:30:00.000Z",
    "thisWeek": 5,
    "thisMonth": 15
  }
}
```

**Statistics Explained:**
- `totalCompleted` - Total lessons completed all-time
- `totalTimeSpent` - Total seconds spent on all lessons
- `currentStreak` - Consecutive days with at least one lesson completed
- `longestStreak` - Best streak ever achieved
- `completionRate` - Percentage of all available lessons completed
- `categoriesStudied` - Breakdown of lessons by category
- `averageTimePerLesson` - Average time spent per lesson (seconds)
- `lastActivityAt` - Last time user completed a lesson
- `thisWeek` - Lessons completed in past 7 days
- `thisMonth` - Lessons completed in past 30 days

**Example Usage:**
```bash
curl http://localhost:3000/api/progress/user123/stats
```

---

### 4. Check Lesson Completion Status

**GET** `/api/progress/:userId/lesson/:lessonId`

Check if a specific lesson has been completed by a user.

**Parameters:**
- `userId` (path parameter, required) - User ID
- `lessonId` (path parameter, required) - Lesson ID

**Success Response (200):**
```json
{
  "completed": true,
  "lessonId": "lesson456",
  "userId": "user123",
  "completedAt": "2025-11-18T10:30:00.000Z",
  "timeSpent": 420
}
```

**Example Usage:**
```bash
curl http://localhost:3000/api/progress/user123/lesson/lesson456
```

---

### 5. Uncomplete a Lesson

**DELETE** `/api/progress/:userId/lesson/:lessonId`

Remove a lesson from completed list (for corrections or mistakes).

**Parameters:**
- `userId` (path parameter, required) - User ID
- `lessonId` (path parameter, required) - Lesson ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Lesson unmarked as complete",
  "lessonId": "lesson456"
}
```

**Error Response (404):**
```json
{
  "error": "Lesson not found in completed lessons",
  "code": "UNCOMPLETE_ERROR"
}
```

**Example Usage:**
```bash
curl -X DELETE http://localhost:3000/api/progress/user123/lesson/lesson456
```

---

### 6. Get Lessons in Date Range

**GET** `/api/progress/:userId/range`

Retrieve lessons completed within a specific date range.

**Parameters:**
- `userId` (path parameter, required) - User ID
- `startDate` (query parameter, required) - ISO 8601 date string
- `endDate` (query parameter, required) - ISO 8601 date string

**Success Response (200):**
```json
{
  "success": true,
  "count": 5,
  "startDate": "2025-11-01T00:00:00.000Z",
  "endDate": "2025-11-30T23:59:59.999Z",
  "lessons": [
    {
      "lessonId": "lesson456",
      "completedAt": "2025-11-18T10:30:00.000Z",
      "lessonTitle": "Servant Leadership",
      "lessonCategory": "leadership",
      "timeSpent": 420
    },
    {
      "lessonId": "lesson789",
      "completedAt": "2025-11-17T09:15:00.000Z",
      "lessonTitle": "Integrity in Business",
      "lessonCategory": "integrity",
      "timeSpent": 600
    }
  ]
}
```

**Example Usage:**
```bash
curl "http://localhost:3000/api/progress/user123/range?startDate=2025-11-01T00:00:00.000Z&endDate=2025-11-30T23:59:59.999Z"
```

---

### 7. Get Leaderboard

**GET** `/api/progress/leaderboard`

Get top users by total lessons completed (for gamification and community engagement).

**Query Parameters:**
- `limit` (optional, default: 10, max: 100) - Number of users to return

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "leaderboard": [
    {
      "userId": "user123",
      "totalCompleted": 45,
      "currentStreak": 30,
      "longestStreak": 45
    },
    {
      "userId": "user456",
      "totalCompleted": 38,
      "currentStreak": 15,
      "longestStreak": 25
    },
    {
      "userId": "user789",
      "totalCompleted": 32,
      "currentStreak": 10,
      "longestStreak": 20
    }
  ]
}
```

**Example Usage:**
```bash
curl http://localhost:3000/api/progress/leaderboard
curl http://localhost:3000/api/progress/leaderboard?limit=25
```

---

## Streak Calculation Logic

Streaks are calculated based on consecutive days with at least one completed lesson:

**Streak Rules:**
- Complete a lesson **same day** → Streak maintained
- Complete a lesson **next day** (within 24-48 hours) → Streak incremented
- Miss a day (48+ hours) → Streak resets to 1

**Example:**
- Day 1: Complete lesson → Streak = 1
- Day 2: Complete lesson → Streak = 2
- Day 3: Complete lesson → Streak = 3
- Day 5: Complete lesson (missed day 4) → Streak = 1

---

## iOS Integration Examples

### SwiftUI ViewModel Integration

```swift
class ProgressViewModel: ObservableObject {
    @Published var userStats: UserStats?
    @Published var currentStreak: Int = 0
    @Published var completionRate: Int = 0

    func completeLesson(userId: String, lessonId: String, timeSpent: Int) async {
        let url = URL(string: "http://localhost:3000/api/progress/complete")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body = [
            "userId": userId,
            "lessonId": lessonId,
            "timeSpent": timeSpent
        ] as [String : Any]

        request.httpBody = try? JSONSerialization.data(withJSONObject: body)

        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            let response = try JSONDecoder().decode(CompletionResponse.self, from: data)

            DispatchQueue.main.async {
                self.userStats = response.stats
                self.currentStreak = response.stats.currentStreak
                self.completionRate = response.stats.completionRate
            }
        } catch {
            print("Error completing lesson: \\(error)")
        }
    }

    func fetchUserStats(userId: String) async {
        let url = URL(string: "http://localhost:3000/api/progress/\\(userId)/stats")!

        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(StatsResponse.self, from: data)

            DispatchQueue.main.async {
                self.userStats = response.stats
                self.currentStreak = response.stats.currentStreak
                self.completionRate = response.stats.completionRate
            }
        } catch {
            print("Error fetching stats: \\(error)")
        }
    }
}
```

### Streak Badge UI Component

```swift
struct StreakBadgeView: View {
    let currentStreak: Int
    let longestStreak: Int

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "flame.fill")
                .font(.system(size: 40))
                .foregroundColor(currentStreak > 0 ? .orange : .gray)

            Text("\\(currentStreak)")
                .font(.title.bold())

            Text("Day Streak")
                .font(.caption)
                .foregroundColor(.secondary)

            if longestStreak > currentStreak {
                Text("Best: \\(longestStreak)")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}
```

---

## Database Schema

### Firestore Collections

**Collection:** `user_progress`

**Indexes Required:**
```
- totalCompleted (descending) - For leaderboards
- lastActivityAt (descending) - For recent activity queries
- userId + completedLessons.lessonId - For checking completion status
```

**Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /user_progress/{userId} {
      // Users can read and write their own progress
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Leaderboard queries require authentication
      allow read: if request.auth != null;
    }
  }
}
```

---

## Best Practices

### For Mobile Apps

1. **Cache Locally** - Store progress data locally and sync periodically
2. **Optimistic Updates** - Update UI immediately, sync in background
3. **Offline Support** - Queue completions when offline, sync when online
4. **Badge Notifications** - Celebrate streaks and milestones
5. **Daily Reminders** - Use push notifications to maintain streaks

### For Backend

1. **Validate Lesson IDs** - Always check if lesson exists before marking complete
2. **Prevent Duplicates** - Check if lesson already completed (409 response)
3. **Track Time Accurately** - Have client send actual time spent, not estimated
4. **Calculate Streaks Server-Side** - Don't trust client for streak calculations
5. **Index for Performance** - Create Firestore indexes for common queries

### For Analytics

1. **Track Completion Rates** - Monitor which lessons have highest/lowest completion
2. **Identify Drop-off Points** - Find where users stop progressing
3. **Monitor Engagement** - Track daily/weekly/monthly active learners
4. **A/B Test Categories** - See which biblical topics resonate most
5. **Streak Analysis** - Understand what helps users maintain streaks

---

## Common Use Cases

### Show User Dashboard
```
GET /api/progress/{userId}/stats
Display: Total completed, current streak, completion rate, recent activity
```

### Complete Lesson Flow
```
1. User finishes lesson
2. POST /api/progress/complete with timeSpent
3. Display completion animation + updated streak
4. Show next recommended lesson
```

### Weekly Progress Report
```
GET /api/progress/{userId}/range?startDate={7_days_ago}&endDate={now}
Display: Lessons this week, time spent, categories covered
```

### Leaderboard Screen
```
GET /api/progress/leaderboard?limit=50
Display: Top entrepreneurs, their streaks, completed lessons
Add "You're ranked #23!" badge
```

---

## Error Handling

All endpoints return consistent error formats:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `MISSING_FIELDS` - Required parameters missing
- `MISSING_USER_ID` - User ID not provided
- `MISSING_PARAMS` - Path parameters missing
- `INVALID_TIME_SPENT` - Time must be positive number
- `INVALID_DATE_FORMAT` - Date string not ISO 8601
- `COMPLETION_ERROR` - Error completing lesson
- `UNCOMPLETE_ERROR` - Error removing completion
- `STATS_ERROR` - Error fetching statistics
- `FETCH_ERROR` - Error fetching progress data
- `RANGE_ERROR` - Error querying date range
- `LEADERBOARD_ERROR` - Error fetching leaderboard

---

## Version History

- **v1.0.0** (2025-11-18) - Initial release
  - Lesson completion tracking
  - Streak calculation
  - Statistics dashboard
  - Leaderboard support
  - Date range queries
  - Category analysis
