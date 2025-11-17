# iOS-Backend Integration Testing Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Health Check](#backend-health-check)
3. [API Testing with curl](#api-testing-with-curl)
4. [iOS Simulator Testing](#ios-simulator-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Common Issues & Troubleshooting](#common-issues--troubleshooting)
7. [Testing Checklist](#testing-checklist)

---

## Prerequisites

### Required Software
- **Node.js 16+** - Backend runtime
- **npm** - Package manager
- **Xcode 14+** - iOS development
- **iOS Simulator** - Run the app
- **curl or Postman** - Test API endpoints

### Required Files
```
✅ backend/nodejs/config/firebase-key.json (Real Firebase credentials)
✅ backend/nodejs/.env (Configured environment variables)
✅ ios/BibleApp/Services/APIClient.swift (Integrated API client)
```

### Verify Backend is Running
```bash
# Navigate to backend directory
cd /home/user/bibleapp/backend/nodejs

# Start the server
npm run dev

# Expected output:
# ✓ Firebase initialized with service account
# Bible App Backend running on port 3000
# Environment: development
# 📅 Starting daily lesson notification scheduler...
# ✓ Daily broadcast scheduler started (9:00 AM UTC)
```

---

## Backend Health Check

### 1. Check Server Health Endpoint

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T16:24:34.815Z"
}
```

**Status Codes:**
- `200 OK` - Server is running normally
- `Connection refused` - Server is not running, start with `npm run dev`

---

## API Testing with curl

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!",
    "displayName":"Test User"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "user123",
    "email": "test@example.com",
    "displayName": "Test User",
    "preferences": {
      "notificationsEnabled": true,
      "theme": "system"
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `201 Created` - User created successfully
- `400 Bad Request` - Missing required fields or validation error
- `409 Conflict` - Email already exists

**Common Errors:**
```json
{
  "error": "Email already exists",
  "code": "EMAIL_EXISTS",
  "details": {"email": "Email is already registered"}
}
```

**Validation Rules:**
- Email: Valid email format required
- Password: Min 8 chars, uppercase, lowercase, number, special char required
- Display Name: 2-50 chars, letters/spaces/hyphens/apostrophes only

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"TestPass123!"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "user123",
    "email": "test@example.com",
    "displayName": "Test User",
    "createdAt": "2025-11-17T16:24:34.815Z",
    "preferences": {
      "notificationsEnabled": true
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Codes:**
- `200 OK` - Login successful
- `401 Unauthorized` - Invalid credentials
- `404 Not Found` - User not found

---

### 3. Fetch All Lessons

**Endpoint:** `GET /api/lessons`

```bash
curl http://localhost:3000/api/lessons
```

**Expected Response:**
```json
[
  {
    "id": "lesson1",
    "title": "Leadership Foundations",
    "category": "Leadership & Authority",
    "difficulty": "Beginner",
    "content": "Understanding biblical leadership principles...",
    "keyTakeaway": "True leadership is servant leadership",
    "bibleVerses": [
      {
        "book": "Matthew",
        "chapter": 23,
        "verse": 11,
        "text": "The greatest among you will be your servant..."
      }
    ],
    "createdAt": "2025-11-15T10:00:00.000Z",
    "duration": 15,
    "imageURL": null
  },
  ...
]
```

**Status Codes:**
- `200 OK` - Lessons returned successfully
- `500 Internal Server Error` - Database connection error

**Query Parameters:**
- None for `/api/lessons` (returns all lessons)

---

### 4. Get Single Lesson

**Endpoint:** `GET /api/lessons/:id`

```bash
curl http://localhost:3000/api/lessons/lesson1
```

**Expected Response:**
```json
{
  "id": "lesson1",
  "title": "Leadership Foundations",
  "category": "Leadership & Authority",
  "difficulty": "Beginner",
  "content": "Understanding biblical leadership principles...",
  "keyTakeaway": "True leadership is servant leadership",
  "bibleVerses": [...],
  "createdAt": "2025-11-15T10:00:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Lesson returned
- `404 Not Found` - Lesson ID doesn't exist

---

### 5. Get Lessons by Category

**Endpoint:** `GET /api/lessons/category/:category`

```bash
curl "http://localhost:3000/api/lessons/category/Leadership%20%26%20Authority"
```

**Valid Categories:**
- `Leadership & Authority`
- `Integrity & Ethics`
- `Financial Stewardship`
- `Trust & Faith`
- `Serving Others`
- `Perseverance`
- `Wisdom & Discernment`
- `Community & Partnership`
- `Time & Productivity`
- `Decision Making`

**Expected Response:**
```json
[
  {
    "id": "lesson1",
    "title": "Leadership Foundations",
    "category": "Leadership & Authority",
    ...
  },
  {
    "id": "lesson2",
    "title": "Ethical Decision Making",
    "category": "Leadership & Authority",
    ...
  }
]
```

---

### 6. Save FCM Token

**Endpoint:** `POST /api/notifications/save-token`

```bash
curl -X POST http://localhost:3000/api/notifications/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user123",
    "token":"dGVzdF9mY21fdG9rZW5fMTIzNDU2Nzg5MA=="
  }'
```

**Expected Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- `200 OK` - Token saved successfully
- `400 Bad Request` - Missing userId or token
- `401 Unauthorized` - Invalid/missing auth token

---

### 7. Get User Preferences

**Endpoint:** `GET /api/preferences?userId=user123`

```bash
curl "http://localhost:3000/api/preferences?userId=user123" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response:**
```json
{
  "success": true,
  "preferences": {
    "notificationsEnabled": true,
    "dailyReminderTime": "09:00",
    "preferredCategories": ["Leadership & Authority"],
    "emailNotifications": true,
    "theme": "system"
  }
}
```

---

## iOS Simulator Testing

### 1. Launch iOS App in Simulator

```bash
# Navigate to iOS project
cd /home/user/bibleapp/ios/BibleApp

# Open in Xcode
open -a Xcode .

# Or build and run directly
xcodebuild -scheme BibleApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```

### 2. Verify APIClient Configuration

The APIClient automatically configures for simulator:
```swift
// In APIClient.init()
#if targetEnvironment(simulator)
self.baseURL = "http://localhost:3000"  // Points to localhost
#else
self.baseURL = ProcessInfo.processInfo.environment["API_URL"] ?? "http://localhost:3000"
#endif
```

**Simulator Networking:**
- Simulator can reach `localhost` on the host machine
- Backend must be running on `http://localhost:3000`
- No special network configuration needed

### 3. Enable Console Logging

To see API calls in Xcode console:
1. Open Xcode console: `Cmd + Shift + C`
2. Run the app on simulator
3. Watch for APIClient debug output

**Sample Console Output:**
```
✓ APIClient initialized
✓ Loading stored tokens...
→ Making request: POST /api/auth/login
← Response: 200 OK
✓ Token saved to keychain
```

---

## End-to-End Testing

### Test Flow 1: User Registration & Login

#### Step 1: Open Login Screen
1. Launch app in simulator
2. LoginView should appear
3. Verify form fields are empty

#### Step 2: Test Registration
1. Tap "Sign Up" button
2. Fill in form:
   ```
   Full Name: John Doe
   Email: john.doe@example.com
   Password: SecurePass123!
   Confirm Password: SecurePass123!
   ```
3. Verify password strength indicator shows "Strong"
4. Tap "Create Account"
5. **Expected:** App shows loading spinner, then navigates to home screen

#### Step 3: Verify Token Storage
1. On home screen, the user is authenticated
2. Token is stored securely in Keychain
3. User can navigate freely without re-login

#### Step 4: Test Login After Logout
1. Navigate to settings/profile
2. Tap "Sign Out" button
3. App returns to LoginView
4. Token is cleared from Keychain
5. Enter credentials and tap "Sign In"
6. **Expected:** Login succeeds, user is authenticated again

---

### Test Flow 2: Load and Browse Lessons

#### Step 1: Verify Lessons Load
1. After login, navigate to Lessons tab
2. LessonsView appears with loading spinner
3. Lessons load from backend API
4. Grid/list displays all lessons
5. **Expected:** Multiple lessons visible with titles, categories, difficulty

#### Step 2: Test Category Filter
1. Tap category filter (e.g., "Leadership & Authority")
2. **Expected:** Lessons filtered to show only that category
3. Tap another category
4. **Expected:** Lessons update in real-time

#### Step 3: Test Search
1. Type search text in search bar
2. Lessons filter by title/content
3. Clear search
4. **Expected:** All lessons reappear

#### Step 4: View Lesson Details
1. Tap on a lesson in the list
2. LessonDetailView opens
3. Full content, Bible verses, practical steps display
4. **Expected:** All lesson data visible and readable

---

### Test Flow 3: Preferences Sync

#### Step 1: Open Preferences
1. Navigate to Settings/Preferences
2. **Expected:** Current preferences load from backend

#### Step 2: Update Notification Settings
1. Toggle "Enable Notifications" switch
2. **Expected:** Switch updates, change syncs to backend
3. Select different notification time (e.g., 7:00 AM)
4. **Expected:** Time picker works, selection saved

#### Step 3: Update Preferred Categories
1. Select categories of interest
2. **Expected:** Selection persists
3. Close app and reopen
4. **Expected:** Selected categories still saved

---

### Test Flow 4: FCM Token Management

#### Step 1: Request Notification Permission
1. On first launch, iOS prompts for notification permission
2. Tap "Allow"
3. **Expected:** Permission granted, app can receive notifications

#### Step 2: Verify FCM Token is Saved
1. Open app console in Xcode
2. Look for: `✓ FCM Token saved to backend for user: user123`
3. **Expected:** Token successfully uploaded to backend

#### Step 3: Subscribe to Topics
1. App subscribes to default topics: "lessons", "announcements"
2. **Expected:** Console shows: `✓ Subscribed to topic: lessons`

---

## Common Issues & Troubleshooting

### Issue 1: "Network Error" on Login

**Symptom:**
```
Error: Network error: Connection refused
```

**Causes:**
1. Backend server not running
2. Wrong backend URL
3. Firewall blocking localhost

**Solution:**
```bash
# Check backend is running
cd /home/user/bibleapp/backend/nodejs
npm run dev

# Verify server responds
curl http://localhost:3000/health

# In Xcode, check console for network errors
# Backend must be on http://localhost:3000
```

---

### Issue 2: "Invalid Credentials" on Login

**Symptom:**
```
Error: Unauthorized. Please login again.
```

**Causes:**
1. Email doesn't exist
2. Password incorrect
3. User account not created yet

**Solution:**
```bash
# First create test account with registration
# Then use same credentials for login
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","displayName":"Test"}'

# Then login with these credentials
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

---

### Issue 3: "No FCM Token Available" Message

**Symptom:**
```
⚠️  No FCM token available to subscribe
```

**Causes:**
1. Firebase not initialized
2. App hasn't received FCM token yet
3. Notification permission not granted

**Solution:**
```swift
// In PushNotificationManager:
// 1. Request notification permission
let granted = await notificationManager.requestNotificationPermission()

// 2. Wait for FCM token callback
// Firebase typically sends token within 1-2 seconds

// 3. Check console for token update
// ✓ FCM Token updated: dGVzdF9mY21fdG9rZW5f...
```

---

### Issue 4: Lessons Not Loading

**Symptom:**
```
Error: Failed to load lessons: Internal Server Error
```

**Causes:**
1. Backend database not initialized
2. Firestore connection failed
3. No lessons in database

**Solution:**
```bash
# Check backend logs for errors
# Backend should show:
# ✓ Firebase initialized with service account

# Verify lessons endpoint works
curl http://localhost:3000/api/lessons

# If empty, lessons need to be created in Firestore:
# 1. Go to Firebase Console
# 2. Create "lessons" collection
# 3. Add sample lesson documents
```

---

### Issue 5: "Unauthorized" on Preference Update

**Symptom:**
```
Error: Unauthorized. Please login again.
```

**Causes:**
1. JWT token expired
2. Token not included in request headers
3. Token corrupted/invalid

**Solution:**
```swift
// APIClient automatically adds Authorization header:
// request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

// If token is missing/invalid:
// 1. Log out user
apiClient.clearTokens()

// 2. Force re-login
// 3. New token will be obtained and stored in Keychain

// To verify token in Keychain:
let token = KeychainService.shared.retrieve(key: "authToken")
print("Token present: \(token != nil)")
```

---

### Issue 6: Localhost Connection on Device

**Symptom:**
```
Error: Cannot connect to localhost:3000 on physical device
```

**Cause:**
- Physical device can't access localhost (only simulator can)

**Solution:**
```swift
// In APIClient.init(), update for physical device:
#if targetEnvironment(simulator)
self.baseURL = "http://localhost:3000"
#else
self.baseURL = "http://YOUR_MACHINE_IP:3000"  // e.g., 192.168.1.100:3000
#endif

// Find your machine IP:
ipconfig getifaddr en0  # On macOS

// Backend server must be accessible:
curl http://192.168.1.100:3000/health
```

---

## Testing Checklist

### Backend Setup
- [ ] Node.js backend running (`npm run dev`)
- [ ] Backend responds to health check (`/health`)
- [ ] Firebase service account configured
- [ ] `.env` file set up correctly
- [ ] Port 3000 is available and not blocked

### API Testing (curl)
- [ ] Health endpoint responds: `GET /health`
- [ ] User registration works: `POST /api/auth/register`
- [ ] User login works: `POST /api/auth/login`
- [ ] Lessons endpoint responds: `GET /api/lessons`
- [ ] Single lesson loads: `GET /api/lessons/:id`
- [ ] Category filtering works: `GET /api/lessons/category/:category`
- [ ] FCM token saves: `POST /api/notifications/save-token`
- [ ] Preferences load: `GET /api/preferences?userId=:id`

### iOS App Setup
- [ ] APIClient.swift exists in project
- [ ] API client configured for simulator (localhost)
- [ ] Authentication views use APIClient
- [ ] LessonsViewModel uses APIClient
- [ ] PushNotificationManager uses APIClient
- [ ] No compiler errors
- [ ] App compiles successfully

### Authentication Flow
- [ ] Sign up screen displays
- [ ] Email validation works (real-time error display)
- [ ] Password strength indicator shows
- [ ] Sign up with valid credentials succeeds
- [ ] JWT token received and stored
- [ ] User authenticated after signup
- [ ] Login screen displays
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong credentials shows error
- [ ] Sign out clears token
- [ ] After sign out, must log in again

### Lessons Flow
- [ ] Lessons load after login
- [ ] Loading spinner displays while fetching
- [ ] Multiple lessons visible in list
- [ ] Lesson data displays correctly (title, category, difficulty)
- [ ] Lesson filtering by category works
- [ ] Lesson search works
- [ ] Tapping lesson opens detail view
- [ ] Lesson detail shows full content and Bible verses
- [ ] Back button returns to list

### Error Handling
- [ ] Network error shows user-friendly message
- [ ] Invalid credentials show specific error
- [ ] Missing required fields show validation errors
- [ ] Server errors don't crash app
- [ ] Error messages are actionable

### Notifications
- [ ] App requests notification permission on first launch
- [ ] Permission grant/deny handled correctly
- [ ] FCM token received and logged
- [ ] Token saved to backend successfully
- [ ] App subscribes to default topics
- [ ] No crashes when notifications arrive

### Data Persistence
- [ ] Close app and reopen
- [ ] User still authenticated (token from Keychain)
- [ ] Preferences retained
- [ ] Favorites/progress saved locally
- [ ] No re-login required after app restart

### Performance
- [ ] Lessons load in < 2 seconds
- [ ] Login responds in < 3 seconds
- [ ] No UI freezing during API calls
- [ ] Loading spinners display during waits
- [ ] Proper error recovery

---

## Testing with Postman (Optional)

### Import API Collection

1. **Create New Collection**
   - Postman → Collections → Create New
   - Name: "Biblical Lessons API"

2. **Add Requests**

   **Health Check**
   - Method: GET
   - URL: `http://localhost:3000/health`

   **Register User**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/register`
   - Body (JSON):
   ```json
   {
     "email":"test@example.com",
     "password":"TestPass123!",
     "displayName":"Test User"
   }
   ```

   **Login**
   - Method: POST
   - URL: `http://localhost:3000/api/auth/login`
   - Body (JSON):
   ```json
   {
     "email":"test@example.com",
     "password":"TestPass123!"
   }
   ```

3. **Use Token in Requests**
   - Copy `token` from login response
   - In Headers, add: `Authorization: Bearer {token}`

---

## Debugging Tips

### Enable Console Logging

**In APIClient.swift:**
```swift
private func request<T: Decodable>(...) async throws -> T {
    print("→ \(method) \(endpoint)")

    let (data, response) = try await session.data(for: request)

    print("← \(httpResponse.statusCode)")
    print("Response: \(String(data: data, encoding: .utf8) ?? "")")

    return try handleResponse(data: data, response: response)
}
```

### Check Network Traffic with Charles Proxy

1. Install Charles Proxy
2. Configure simulator to use Charles as proxy
3. See all HTTP requests/responses
4. Very useful for debugging API issues

### Print Token for Verification

```swift
let token = KeychainService.shared.retrieve(key: "authToken")
print("Stored token: \(token ?? "NO TOKEN")")
```

### Verify Backend Logs

Terminal output shows:
```
→ POST /api/auth/login
← Response: 200
✓ User authenticated
```

---

## Success Criteria

### All tests pass when:
✅ Backend server is running and healthy
✅ User can register with valid credentials
✅ User can login with correct email/password
✅ User receives valid JWT token
✅ Lessons load and display correctly
✅ Lessons can be filtered by category
✅ All API endpoints respond with proper status codes
✅ Error messages are clear and actionable
✅ No crashes or unhandled exceptions
✅ FCM token is saved to backend
✅ Preferences sync with backend
✅ User stays logged in after app restart

---

## Next Steps After Testing

Once testing is complete:

1. **Fix any issues** - Address failing tests
2. **Optimize performance** - Add caching, pagination
3. **Add more features** - Favorites, progress tracking, user profile
4. **Production deployment** - Update API URL, configure HTTPS
5. **Submit to App Store** - Follow Apple guidelines

---

## Quick Test Script

Save as `test-api.sh` and run to test all endpoints:

```bash
#!/bin/bash

echo "Testing Biblical Lessons API"
echo "=============================="

BASE_URL="http://localhost:3000"

echo "1. Health Check..."
curl -s $BASE_URL/health | jq .

echo -e "\n2. Register User..."
curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"TestPass123!","displayName":"Test"}' | jq .

echo -e "\n3. Get Lessons..."
curl -s $BASE_URL/api/lessons | jq '.[0:2]'

echo -e "\nDone!"
```

Run with: `bash test-api.sh`

---

*Testing Guide Created: 2025-11-17*
*Last Updated: 2025-11-17*
