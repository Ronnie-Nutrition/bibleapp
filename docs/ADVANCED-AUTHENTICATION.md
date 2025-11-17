# Advanced Authentication API Documentation

Complete guide to the enhanced authentication system with validation, password reset, and error handling.

## Overview

The Advanced Authentication API provides:

- **Email Validation** - RFC-compliant email format validation
- **Password Strength Requirements** - 8+ characters with uppercase, lowercase, numbers, and special characters
- **Email Uniqueness Checking** - Prevents duplicate email registrations
- **Password Reset Flow** - Secure password recovery with verification
- **Email Updates** - Change email with validation
- **Detailed Error Responses** - Specific error codes and messages for better UX
- **Custom JWT Tokens** - Secure token generation for client authentication

---

## Base URL

```
http://localhost:3000/api/auth
```

## Authentication

All endpoints (except register and login) should include the user's Firebase UID in the request for authorization purposes.

---

## API Endpoints

### 1. Register New User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account with validation

**Request Body:**
- `email` (required) - User's email address
- `password` (required) - User's password (must meet strength requirements)
- `displayName` (required) - User's display name (2-50 characters, letters/spaces/hyphens/apostrophes)

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*)

**Display Name Requirements:**
- 2-50 characters
- Only letters, spaces, hyphens, and apostrophes allowed

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "displayName": "John Doe"
  }'
```

**Success Response (201 Created):**

```json
{
  "userId": "firebase-uid-123",
  "email": "user@example.com",
  "displayName": "John Doe"
}
```

**Error Responses:**

Missing fields (400):
```json
{
  "error": "Missing required fields",
  "code": "MISSING_FIELDS",
  "fields": {
    "email": null,
    "password": "Password is required",
    "displayName": null
  }
}
```

Invalid email format (400):
```json
{
  "error": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

Email already registered (400):
```json
{
  "error": "Email already registered",
  "code": "EMAIL_EXISTS"
}
```

Weak password (400):
```json
{
  "error": "Password does not meet strength requirements",
  "code": "WEAK_PASSWORD",
  "details": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter (A-Z)",
    "Password must contain at least one special character (!@#$%^&*)"
  ]
}
```

Invalid display name (400):
```json
{
  "error": "Display name must be at least 2 characters long",
  "code": "INVALID_DISPLAY_NAME"
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and retrieve access credentials

**Request Body:**
- `email` (required) - User's email address
- `password` (required) - User's password

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

**Success Response (200):**

```json
{
  "userId": "firebase-uid-123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "customToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ...",
  "user": {
    "id": "firebase-uid-123",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false,
    "preferences": {
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
    },
    "stats": {
      "lessonsCompleted": 0,
      "lessonsStarted": 0,
      "totalTimeSpent": 0,
      "favoriteCount": 0,
      "currentStreak": 0,
      "longestStreak": 0
    }
  }
}
```

**Error Responses:**

Missing credentials (400):
```json
{
  "error": "Email and password are required",
  "code": "MISSING_CREDENTIALS"
}
```

Invalid credentials (401):
```json
{
  "error": "Invalid email or password",
  "code": "INVALID_CREDENTIALS"
}
```

---

### 3. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Generate a password reset link and send to email

**Request Body:**
- `email` (required) - User's email address

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

**Error Responses:**

Invalid email format (400):
```json
{
  "error": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

User not found (404):
```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

---

### 4. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset user password (requires current password verification)

**Request Body:**
- `userId` (required) - User's Firebase UID
- `currentPassword` (required) - Current password (for verification)
- `newPassword` (required) - New password (must meet strength requirements)

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "firebase-uid-123",
    "currentPassword": "OldPass123!",
    "newPassword": "NewSecurePass456!"
  }'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**

Weak new password (400):
```json
{
  "error": "New password does not meet strength requirements",
  "code": "WEAK_PASSWORD",
  "details": [
    "Password must contain at least one special character (!@#$%^&*)"
  ]
}
```

Same password (400):
```json
{
  "error": "New password must be different from current password",
  "code": "SAME_PASSWORD"
}
```

---

### 5. Update Email

**Endpoint:** `POST /api/auth/update-email`

**Description:** Update user's email address

**Request Body:**
- `userId` (required) - User's Firebase UID
- `newEmail` (required) - New email address

**Request:**

```bash
curl -X POST http://localhost:3000/api/auth/update-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "firebase-uid-123",
    "newEmail": "newemail@example.com"
  }'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email updated successfully"
}
```

**Error Responses:**

Invalid email format (400):
```json
{
  "error": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

Email already registered (400):
```json
{
  "error": "Email already registered",
  "code": "EMAIL_EXISTS"
}
```

---

### 6. Get User

**Endpoint:** `GET /api/auth/user/:userId`

**Description:** Retrieve user profile data

**URL Parameters:**
- `userId` (required) - User's Firebase UID

**Request:**

```bash
curl http://localhost:3000/api/auth/user/firebase-uid-123
```

**Success Response (200):**

```json
{
  "id": "firebase-uid-123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "emailVerified": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "preferences": {
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
  },
  "stats": {
    "lessonsCompleted": 0,
    "lessonsStarted": 0,
    "totalTimeSpent": 0,
    "favoriteCount": 0,
    "currentStreak": 0,
    "longestStreak": 0
  }
}
```

**Error Responses:**

User not found (404):
```json
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
```

---

## Validation Rules

| Field | Rules |
|-------|-------|
| `email` | Valid RFC email format, must be unique |
| `password` | Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char |
| `displayName` | 2-50 chars, letters/spaces/hyphens/apostrophes only |
| `newPassword` | Same as password validation |
| `currentPassword` | Must match user's actual password |

---

## Error Codes Reference

| Code | Status | Description |
|------|--------|-------------|
| `MISSING_FIELDS` | 400 | Required field(s) missing |
| `MISSING_CREDENTIALS` | 400 | Email or password missing |
| `MISSING_EMAIL` | 400 | Email is required |
| `MISSING_USER_ID` | 400 | User ID is required |
| `INVALID_EMAIL` | 400 | Email format is invalid |
| `EMAIL_EXISTS` | 400 | Email already registered |
| `INVALID_DISPLAY_NAME` | 400 | Display name doesn't meet requirements |
| `WEAK_PASSWORD` | 400 | Password doesn't meet strength requirements |
| `SAME_PASSWORD` | 400 | New password same as current |
| `INVALID_CREDENTIALS` | 401 | Email/password combination incorrect |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `REGISTRATION_ERROR` | 500 | General registration error |
| `LOGIN_ERROR` | 500 | General login error |
| `RESET_ERROR` | 500 | General password reset error |
| `UPDATE_ERROR` | 500 | General update error |
| `FETCH_ERROR` | 500 | General fetch error |

---

## Testing with cURL

### Test 1: Register with Weak Password

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "weak",
    "displayName": "Test User"
  }'
```

Expected: 400 with weak password details

### Test 2: Register with Valid Credentials

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "displayName": "Test User"
  }'
```

Expected: 201 with userId

### Test 3: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Expected: 200 with user data and custom token

### Test 4: Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Expected: 200 with success message

### Test 5: Get User

```bash
curl http://localhost:3000/api/auth/user/firebase-uid-123
```

Expected: 200 with user profile data

---

## Integration with iOS App

The iOS app uses these endpoints through the `AuthenticationManager`:

```swift
// Sign up with validation
await authManager.signUp(
  email: "user@example.com",
  password: "SecurePass123!",
  displayName: "John Doe"
)

// Sign in
await authManager.signIn(
  email: "user@example.com",
  password: "SecurePass123!"
)

// Reset password
await authManager.resetPassword(
  currentPassword: "OldPass123!",
  newPassword: "NewPass456!"
)

// Update email
await authManager.updateEmail(newEmail: "newemail@example.com")

// Handle errors
if let error = authManager.errorMessage {
  print("Auth error: \(error)")
}
```

---

## Security Considerations

1. **Password Storage** - Firebase stores passwords hashed with bcrypt
2. **HTTPS Only** - All endpoints should be accessed over HTTPS in production
3. **Rate Limiting** - Consider implementing rate limiting for register/login endpoints
4. **Email Verification** - Verify email before allowing full access (optional but recommended)
5. **Custom Tokens** - Use Firebase custom tokens for secure communication
6. **Session Management** - Implement token refresh and expiration

---

## Password Strength Examples

### ✅ Valid Passwords:
- `SecurePass123!`
- `MyBible@2024`
- `Faith#Rules99`
- `Entrepreneur$Success42`

### ❌ Invalid Passwords:
- `password` (no uppercase, number, or special char)
- `Pass123` (no special char, too short)
- `PASSWORD123!` (no lowercase)
- `password123!` (no uppercase)

---

## Next Steps

1. ✓ Install email-validator dependency
2. ✓ Implement advanced authentication validation
3. → Enhance iOS authentication UI with password strength indicator
4. → Add password reset flow to iOS
5. → Implement email verification
6. → Add rate limiting to authentication endpoints

---

## API Version

**Version:** 2.0.0

**Last Updated:** November 2024

**Breaking Changes from v1.0:**
- Passwords now require strength validation
- Password reset endpoint added
- Email update endpoint added
- Detailed error responses with codes
- Custom JWT tokens in login response
