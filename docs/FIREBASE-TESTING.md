# Firebase Integration Testing Guide

How to verify your Firebase configuration is working correctly.

## Verify Service Account Configuration

### Test Node.js Connection

```bash
cd backend/nodejs

# Install dependencies
npm install

# Test Firebase connection
node -e "
const { db, auth, messaging } = require('./config/firebase');

async function test() {
  try {
    console.log('Testing Firestore...');
    const snapshot = await db.collection('lessons').limit(1).get();
    console.log('✓ Firestore connected');
    console.log('  Found', snapshot.size, 'lessons');
  } catch (error) {
    console.error('✗ Firestore error:', error.message);
  }
}

test();
"
```

### Test Django Connection

```bash
cd backend/django

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate.bat

# Test Firebase connection
python manage.py shell <<'EOF'
from config.firebase_config import get_db, get_auth, get_messaging

print('Testing Firestore...')
db = get_db()
docs = list(db.collection('lessons').limit(1).get())
print('✓ Firestore connected')
print(f'  Found {len(docs)} lessons')

exit()
EOF
```

## Verify Lessons Data

### Check in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. You should see:
   - `lessons` collection with 5 documents
   - Each lesson with fields: title, category, content, etc.

### Programmatically

```bash
# Node.js
cd backend/nodejs
npm install
node scripts/load-lessons.js

# Python
cd backend/django
source venv/bin/activate
python scripts/load_lessons.py
```

Both will output:
```
✓ Loaded: "The Parable of the Talents"
✓ Loaded: "Integrity in Business Dealings"
✓ Loaded: "Servant Leadership in Business"
✓ Loaded: "Overcoming Fear and Risk in Business"
✓ Loaded: "Wisdom and Business Decisions"
```

## Test Authentication

### Create Test User (Firebase Console)

1. Go to **Authentication** → **Users** tab
2. Click **Create user**
3. Email: `test@example.com`
4. Password: `test123456`
5. Click **Create**

### Test Login (Node.js)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Expected response:
```json
{
  "userId": "user-uid-here",
  "user": {
    "id": "user-uid-here",
    "email": "test@example.com",
    "displayName": "Test User",
    ...
  }
}
```

### Test User Registration (Node.js)

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"password123",
    "displayName":"New User"
  }'
```

Expected response:
```json
{
  "userId": "new-user-uid",
  "email": "newuser@example.com"
}
```

## Test Lessons API

### Fetch All Lessons

```bash
curl http://localhost:3000/api/lessons
```

Expected response: Array of lessons

### Fetch Single Lesson

```bash
curl http://localhost:3000/api/lessons/lesson-001
```

Expected response:
```json
{
  "id": "lesson-001",
  "title": "The Parable of the Talents",
  "subtitle": "Faithful Management of Resources",
  ...
}
```

### Fetch by Category

```bash
curl "http://localhost:3000/api/lessons/category/Financial%20Stewardship"
```

Expected response: Lessons in that category

## Test Push Notifications

### Send Test Notification (Node.js)

```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "topic":"lessons",
    "title":"New Lesson Available",
    "body":"Check out our latest biblical lesson",
    "data":{"lessonId":"lesson-001"}
  }'
```

### Verify in Firebase Console

1. Go to **Cloud Messaging** tab
2. Look for **Server API Key** (already configured)
3. Check **APNs certificates** are uploaded (for iOS)

## iOS App Testing

### Test Authentication Flow

1. Open `ios/BibleApp.xcworkspace` in Xcode
2. Ensure `GoogleService-Info.plist` is added to project
3. Build and run on simulator
4. Test:
   - Create new account
   - Verify email/password validation
   - Sign in with test account
   - Check app shows user as authenticated

### Test Lessons Loading

1. After signing in, navigate to Lessons tab
2. Verify lessons appear
3. Test filtering by category
4. Test searching
5. Tap lesson to view details

### Test Progress Tracking

1. Open a lesson
2. Click "Mark as Complete"
3. Go back to lessons list
4. Verify completed lesson shows checkmark
5. In Firebase Console → users/{userId}/progress, verify document was created

## Security Rules Testing

### Test Public Read (Should Work)

Authenticated user should be able to read lessons:

```bash
# In Firebase Console, test with a user
```

### Test Admin Write (Should Fail for Regular Users)

Regular user should NOT be able to write lessons:

```bash
# In Firebase Console, try to create a lesson as regular user
# Should get "Permission denied" error
```

### Test User Data Privacy (Should Work)

User should only access their own data:

```bash
# In Firebase Console, sign in as user1
# Can read /users/user1/profile ✓
# Cannot read /users/user2/profile ✗
```

## Production Security Checklist

- [ ] Firestore security rules are PUBLISHED (not in test mode)
- [ ] Service account keys are stored securely (NOT in Git)
- [ ] Only admins can write lessons
- [ ] Users can only access their own data
- [ ] HTTPS is enabled for all API endpoints
- [ ] CORS is configured properly
- [ ] Rate limiting is configured
- [ ] Error messages don't expose sensitive data

## Troubleshooting Test Failures

### "Permission denied" Errors

**Check:**
1. User is authenticated
2. Security rules are published (not test mode)
3. User has correct permissions
4. Firestore path matches security rules

### "Service account key missing"

**Check:**
1. firebase-key.json exists in correct path
2. File permissions are correct
3. JSON is valid (no syntax errors)

### "Lessons not loading"

**Check:**
1. Firestore database is created
2. Lessons collection exists
3. Run load-lessons script: `node scripts/load-lessons.js`
4. Verify in Firebase Console

### "Authentication fails"

**Check:**
1. Firebase Authentication is enabled
2. Email/Password provider is enabled
3. User exists in Firebase Console
4. Credentials are correct

## Next Steps

After testing:
1. ✓ Firebase is properly configured
2. → Set up push notifications
3. → Test on physical iOS device
4. → Set up GitHub CI/CD
5. → Prepare for App Store submission

---

## Useful Commands

```bash
# Load lessons (Node.js)
cd backend/nodejs && node scripts/load-lessons.js

# Load lessons (Python)
cd backend/django && python scripts/load_lessons.py

# Start Node.js server
cd backend/nodejs && npm run dev

# Start Django server
cd backend/django && python manage.py runserver

# Run iOS app in Xcode
open ios/BibleApp.xcworkspace
```
