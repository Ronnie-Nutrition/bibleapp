# Quick Test Reference Card

## Start Here

### 1️⃣ Start Backend (Terminal 1)
```bash
cd /home/user/bibleapp/backend/nodejs
npm run dev
```
✅ **Expected:** Server running on `http://localhost:3000`

---

### 2️⃣ Quick Health Check
```bash
curl http://localhost:3000/health
```
✅ **Expected:** `{"status":"ok","timestamp":"..."}`

---

### 3️⃣ Test User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","displayName":"Test User"}'
```
✅ **Expected:** 201 Created with JWT token

---

### 4️⃣ Test User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```
✅ **Expected:** 200 OK with JWT token

---

### 5️⃣ Test Lessons Endpoint
```bash
curl http://localhost:3000/api/lessons
```
✅ **Expected:** Array of lessons

---

## iOS Simulator Testing

### Launch App
```bash
cd /home/user/bibleapp/ios/BibleApp
open -a Xcode .
```

### Test Sequence
1. **Login Screen** → App shows
2. **Sign Up** → Fill form → Submit
3. **Home Screen** → User authenticated
4. **Lessons Tab** → Lessons load from backend
5. **Settings** → Preferences sync with backend

---

## Useful Curl Commands

### Register Account
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"SecurePass123!",
    "displayName":"User Name"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "password":"SecurePass123!"
  }'
```

### Get All Lessons
```bash
curl http://localhost:3000/api/lessons
```

### Get Lesson by Category
```bash
curl "http://localhost:3000/api/lessons/category/Leadership%20%26%20Authority"
```

### Save FCM Token
```bash
curl -X POST http://localhost:3000/api/notifications/save-token \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user123",
    "token":"your_fcm_token_here"
  }'
```

### Get Preferences
```bash
curl "http://localhost:3000/api/preferences?userId=user123"
```

---

## Password Requirements

For testing, use passwords that meet these requirements:
- **Minimum:** 8 characters
- **Must include:** Uppercase letter (A-Z)
- **Must include:** Lowercase letter (a-z)
- **Must include:** Number (0-9)
- **Must include:** Special character (!@#$%^&*)

**Example Valid Password:** `TestPass123!`

---

## Category Names (for filtering)

Use these exact names when testing category filtering:
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

---

## Test Accounts

### Account 1
```
Email: john@example.com
Password: SecurePass123!
Display Name: John Entrepreneur
```

### Account 2
```
Email: sarah@example.com
Password: SafePass456!
Display Name: Sarah Business
```

### Account 3
```
Email: mike@example.com
Password: StrongPass789!
Display Name: Mike Leader
```

---

## Common Issues Quick Fix

| Issue | Solution |
|-------|----------|
| "Connection refused" | Run `npm run dev` in backend directory |
| "Invalid credentials" | Make sure user registered first |
| "Email already exists" | Use different email or delete account |
| "Network error" | Check backend is running on port 3000 |
| "No lessons loading" | Verify lessons exist in Firebase |
| "FCM token missing" | Request notification permission |

---

## Debugging Shortcuts

### Check if Backend is Running
```bash
ps aux | grep "node server.js"
```

### Kill Backend Process
```bash
pkill -f "node server.js"
```

### Check Port 3000 is Available
```bash
lsof -i :3000
```

### View Backend Logs
```bash
cd /home/user/bibleapp/backend/nodejs
npm run dev 2>&1 | tee server.log
```

### Test with Postman Alternative (using Python)
```bash
python3 -c "
import requests
r = requests.get('http://localhost:3000/health')
print(r.status_code)
print(r.json())
"
```

---

## API Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Check input validation |
| 401 | Unauthorized | Login required |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Check backend logs |

---

## Testing Flow Diagram

```
Start App
    ↓
LoginView
    ↓
[Sign Up] OR [Sign In]
    ↓
APIClient.registerUser() / loginUser()
    ↓
Backend validates → Firebase creates user
    ↓
Returns JWT token
    ↓
Token saved in Keychain
    ↓
HomeView (authenticated)
    ↓
LessonsView
    ↓
APIClient.getLessons()
    ↓
Backend returns [Lesson]
    ↓
Lessons display in list
    ↓
User interaction (filter, search, detail view)
```

---

## Success Indicators

✅ All tests pass when you see:
- Backend health check responds
- User registration returns token
- User login returns token
- Lessons load with data
- All API status codes are 200/201
- No error messages in Xcode console
- App doesn't crash during operations

---

## File Locations

**Backend:**
- Server: `/home/user/bibleapp/backend/nodejs/server.js`
- Firebase config: `/home/user/bibleapp/backend/nodejs/config/firebase.js`
- Environment: `/home/user/bibleapp/backend/nodejs/.env`

**iOS:**
- APIClient: `/home/user/bibleapp/ios/BibleApp/Services/APIClient.swift`
- LoginView: `/home/user/bibleapp/ios/BibleApp/Features/Authentication/LoginView.swift`
- LessonsView: `/home/user/bibleapp/ios/BibleApp/Features/Lessons/LessonsViewModel.swift`

**Documentation:**
- Integration Guide: `/home/user/bibleapp/docs/INTEGRATION-COMPLETE.md`
- Testing Guide: `/home/user/bibleapp/docs/TESTING-GUIDE.md`
- This Card: `/home/user/bibleapp/docs/QUICK-TEST-REFERENCE.md`

---

## One-Liner Test Commands

```bash
# Test health
curl http://localhost:3000/health && echo ""

# Register + Login combo (save token)
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"Pass123!","displayName":"Test"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# Get lessons with token
curl -s -X GET http://localhost:3000/api/lessons -H "Authorization: Bearer $TOKEN" | jq '.[0]'
```

---

## Remember

- **Backend must be running** before testing
- **Port 3000** must be available
- **Simulator can reach localhost** (no special setup needed)
- **Each test account needs unique email**
- **Passwords must be strong** (8+ chars with mixed case, number, special char)
- **Check console output** in Xcode for detailed error messages

---

**For full details, see:** `docs/TESTING-GUIDE.md`

*Quick Reference Card - Updated: 2025-11-17*
