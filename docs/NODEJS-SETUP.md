# Node.js Backend Setup Guide

Complete guide to set up and run the Biblical Lessons API backend locally.

## Prerequisites

- Node.js 14+ (use Node.js 16+ recommended)
- npm or yarn
- Firebase Account (for Firestore database)
- Git

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd backend/nodejs

# Install dependencies
npm install

# Install should complete in ~1-2 minutes
# Shows installed packages: express, firebase-admin, cors, dotenv, node-cron, email-validator
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Minimal .env for local development:**

```env
PORT=3000
NODE_ENV=development
API_URL=http://localhost:3000
JWT_SECRET=your-super-secret-key-for-development-only
LOG_LEVEL=debug
```

### 3. Configure Firebase (Two Options)

#### Option A: Use Firebase Emulator (Easiest for Local Development)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in the project
firebase init emulator

# Start the emulator
firebase emulators:start
```

This starts a local Firestore emulator at `http://localhost:8080`

#### Option B: Use Real Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Create a service account key:
   - Project Settings → Service Accounts
   - Generate new private key
   - Save as `config/firebase-key.json`

4. Add to `.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### 4. Start the Server

```bash
# Start development server with auto-reload
npm run dev

# Output should show:
# ✓ Server running on http://localhost:3000
# ✓ Health check: GET http://localhost:3000/health
# ✓ API available at http://localhost:3000/api/...
```

### 5. Test the Backend

```bash
# In a new terminal, test health endpoint
curl http://localhost:3000/health

# Should return:
# {"status":"ok","timestamp":"2024-11-17T..."}
```

## Detailed Setup

### Directory Structure

```
backend/nodejs/
├── config/
│   ├── firebase.js           # Firebase initialization
│   └── firebase-key.json     # Service account (not committed)
│
├── services/
│   ├── authenticationService.js    # User auth logic
│   ├── preferencesService.js       # Preference management
│   ├── schedulerService.js         # Notification scheduler
│   └── notificationService.js      # Push notifications
│
├── server.js                 # Main Express app
├── package.json             # Dependencies
├── .env                     # Configuration (not committed)
├── .env.example            # Template
└── .gitignore
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `NODE_ENV` | No | development | Environment (development/production) |
| `API_URL` | No | http://localhost:3000 | Backend URL for clients |
| `JWT_SECRET` | Yes | - | Secret for JWT tokens |
| `FIREBASE_PROJECT_ID` | If using Firebase | - | Firebase project ID |
| `FIREBASE_DATABASE_URL` | If using Firebase | - | Firestore database URL |
| `LOG_LEVEL` | No | info | Logging level (debug/info/warn/error) |

### Install Dependencies Details

```bash
npm install
```

**Key packages installed:**
- `express` - Web framework
- `firebase-admin` - Firebase SDK
- `cors` - Cross-origin requests
- `dotenv` - Environment variables
- `node-cron` - Task scheduling
- `email-validator` - Email validation
- `nodemon` - Auto-reload (dev)

**package.json scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

## Running the Server

### Development Mode (Recommended)

```bash
npm run dev

# Features:
# - Auto-reloads on file changes
# - Detailed logging
# - Firebase emulator support
```

### Production Mode

```bash
NODE_ENV=production npm start

# Before production:
# 1. Change JWT_SECRET to a strong value
# 2. Set ALLOWED_ORIGINS for security
# 3. Use real Firebase project (not emulator)
# 4. Configure logging
```

## API Endpoints

All endpoints are prefixed with `/api/`

### Authentication (6 endpoints)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/auth/register` | POST | ❌ | Register new user |
| `/auth/login` | POST | ❌ | Login user |
| `/auth/forgot-password` | POST | ❌ | Request password reset |
| `/auth/reset-password` | POST | ✅ | Reset password |
| `/auth/update-email` | POST | ✅ | Update email |
| `/auth/user/:userId` | GET | ✅ | Get user profile |

### Lessons (3 endpoints)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/lessons` | GET | ❌ | Get all lessons |
| `/lessons/:id` | GET | ❌ | Get lesson detail |
| `/lessons/search` | GET | ❌ | Search lessons |

### User Progress (6 endpoints)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/progress` | GET | ✅ | Get user progress |
| `/progress/lesson/:id` | GET | ✅ | Get progress on lesson |
| `/progress/:id` | POST | ✅ | Create/update progress |
| `/progress/complete/:id` | POST | ✅ | Mark as complete |
| `/progress/favorite/:id` | POST | ✅ | Toggle favorite |
| `/progress/stats` | GET | ✅ | Get progress stats |

### Preferences (8 endpoints)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/preferences` | GET | ✅ | Get preferences |
| `/preferences/update` | POST | ✅ | Update preference |
| `/preferences/notification-type` | POST | ✅ | Toggle notification type |
| `/preferences/categories` | POST | ✅ | Set categories |
| `/preferences/daily-time` | POST | ✅ | Set daily time |
| `/preferences/batch-update` | POST | ✅ | Batch update |
| `/preferences/reset` | POST | ✅ | Reset defaults |
| `/preferences/stats` | GET | ✅ | Get statistics |

### Notifications (3 endpoints)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/notifications/send-to-user` | POST | ✅ | Send to user |
| `/notifications/send-to-topic` | POST | ✅ | Send to topic |
| `/notifications/send-batch` | POST | ✅ | Send batch |

### Scheduler (2 endpoints)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/scheduler/start` | POST | ✅ | Start daily scheduler |
| `/scheduler/status` | GET | ✅ | Get scheduler status |

## Testing Endpoints

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "displayName": "Test User"
  }'

# Response:
# {
#   "userId": "user-id-123",
#   "email": "test@example.com",
#   "displayName": "Test User"
# }
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Response:
# {
#   "userId": "user-id-123",
#   "email": "test@example.com",
#   "customToken": "eyJhbGc..."
# }
```

### Get Lessons

```bash
curl http://localhost:3000/api/lessons

# Returns list of lessons as JSON
```

### Get User Profile

```bash
curl http://localhost:3000/api/auth/user/user-id-123

# Returns user data with preferences and stats
```

### Update Preferences

```bash
curl -X POST http://localhost:3000/api/preferences/batch-update \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-id-123",
    "preferences": {
      "notificationsEnabled": true,
      "dailyLessonsEnabled": true,
      "dailyReminderTime": "09:00"
    }
  }'
```

## Load Initial Data

### Option 1: Load via API

```bash
# Script to load lessons from content/lessons.json
# Create load-lessons.js (provided in FIREBASE-QUICK-START.md)

node scripts/load-lessons.js
```

### Option 2: Manual Load (Firebase Console)

1. Go to Firebase Console
2. Firestore Database → Collections
3. Create `lessons` collection
4. Add documents from `content/lessons.json`

### Option 3: Automatic on First Run

The server checks for lessons on startup and loads if empty (coming in future update).

## Troubleshooting

### "Cannot find module 'firebase-admin'"

```bash
# Solution: Reinstall dependencies
rm -rf node_modules
npm install
```

### "Port 3000 already in use"

```bash
# Solution: Kill process or use different port
lsof -i :3000
kill -9 <PID>

# Or set different port:
PORT=3001 npm run dev
```

### Firebase Connection Error

```
Error: Could not load the default credentials
```

**Solutions:**
1. Create `config/firebase-key.json` from Firebase Console
2. OR set FIREBASE_* environment variables
3. OR use Firebase emulator: `firebase emulators:start`

### CORS Error from iOS App

Make sure `.env` has:
```env
ALLOWED_ORIGINS=http://localhost:3000
```

Or set it in `server.js` directly.

## Development Workflow

### 1. Start Server

```bash
npm run dev
```

### 2. Make Changes

Edit `services/*.js` or `server.js` - nodemon auto-reloads

### 3. Test Locally

```bash
curl http://localhost:3000/api/lessons
```

### 4. Commit Changes

```bash
git add .
git commit -m "Update: description"
git push
```

## Debugging

### Enable Detailed Logging

```env
LOG_LEVEL=debug
```

### Check Server Logs

Look for:
- ✓ Initialization messages
- ✓ Request logs
- ✗ Error messages with stack traces

### Use curl for Testing

```bash
# Test with verbose output
curl -v http://localhost:3000/health

# Test with headers
curl -H "Content-Type: application/json" http://localhost:3000/api/lessons
```

## Performance

### Recommended Settings

- **Development**: Use Firebase Emulator (faster, no network)
- **Production**: Use real Firebase with appropriate indexes
- **Caching**: Add Redis for session caching
- **Load Balancing**: Use multiple instances with PM2

### Monitor Performance

```bash
# Install PM2 for production monitoring
npm install -g pm2

# Start with PM2
pm2 start server.js

# Monitor
pm2 monit
```

## Security Checklist

- [ ] Change `JWT_SECRET` to strong value
- [ ] Set `NODE_ENV=production`
- [ ] Configure `ALLOWED_ORIGINS`
- [ ] Use HTTPS in production
- [ ] Enable Firebase security rules
- [ ] Set up rate limiting
- [ ] Enable CORS for specific domains only
- [ ] Use environment variables for secrets
- [ ] Never commit `.env` or `firebase-key.json`

## Next Steps

Once server is running:
1. ✅ Test all endpoints locally
2. → Update iOS app to use `http://localhost:3000` (see iOS Integration Guide)
3. → Test full end-to-end flow
4. → Deploy to production server

## Getting Help

### Check Logs

```bash
# Follow logs in real-time
tail -f logs/*.log
```

### Common Issues

See `FIREBASE-SETUP.md` and `PUSH-NOTIFICATIONS.md` for more detailed troubleshooting.

### Useful Commands

```bash
# Test specific endpoint
npm run test:auth

# Check database
firebase firestore:shell

# View Firebase logs
firebase functions:log

# Clear Firestore (emulator only)
firebase emulators:export ./backup
```

---

**Last Updated:** November 2024
**Version:** 1.0.0
**Status:** Production Ready
