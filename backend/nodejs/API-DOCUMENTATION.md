# Bible App API Documentation

## Overview

The Bible App API provides RESTful endpoints for managing lessons, user progress, favorites, and preferences. All endpoints follow REST conventions and return JSON responses.

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://api.bibleapp.com`

### API Version
`1.0.0`

## Authentication

Most protected endpoints require Bearer token authentication via JWT.

### How to Authenticate

1. **Register or Login** to get a JWT token:
   ```bash
   POST /api/auth/register
   # or
   POST /api/auth/login
   ```

2. **Include token in Authorization header** for protected endpoints:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### Example

```bash
curl -X GET http://localhost:3000/api/progress \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

| Endpoint Type | Limit | Window |
|---|---|---|
| Authentication | 5 requests | 15 minutes |
| General API | 30 requests | 1 minute |
| Read operations | 100 requests | 1 minute |
| Heavy operations | 5 requests | 1 minute |

### Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1609459200
```

### Exceeding Rate Limits

When you exceed the rate limit, you'll receive a 429 response:

```json
{
  "error": "Too many requests, please slow down",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 45,
  "limits": {
    "limit": 30,
    "remaining": 0,
    "reset": 1609459245000
  }
}
```

Wait the specified `retryAfter` seconds before making another request.

## Endpoints

### Health Check

**Get API Status**
```
GET /health
```

Returns the current status and timestamp of the API.

**Example:**
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

### Authentication Endpoints

#### Register User

**Create a new user account**
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe"
}
```

**Requirements:**
- Email: Valid email format
- Password: Min 8 characters, must include uppercase, lowercase, and number
- Display Name: 2-100 characters

**Response (201 Created):**
```json
{
  "user": {
    "uid": "user-123",
    "email": "user@example.com",
    "displayName": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Login User

**Authenticate with email and password**
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "uid": "user-123",
    "email": "user@example.com",
    "displayName": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### Forgot Password

**Request password reset link**
```
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset link sent to email"
}
```

---

#### Reset Password

**Change password with verification**
```
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "userId": "user-123",
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456"
}
```

**Response (200 OK):**
```json
{
  "success": true
}
```

---

### Lesson Endpoints

#### Get All Lessons

**Retrieve all available lessons**
```
GET /api/lessons
```

**Query Parameters:**
- `category` (optional): Filter by category
- `difficulty` (optional): Filter by difficulty (Beginner, Intermediate, Advanced)
- `skip` (optional): Number of results to skip (pagination)
- `limit` (optional): Maximum number of results

**Response (200 OK):**
```json
[
  {
    "id": "lesson-001",
    "title": "The Parable of the Talents",
    "subtitle": "Faithful Management of Resources",
    "category": "Financial Stewardship",
    "difficulty": "Beginner",
    "duration": 12,
    "content": "Jesus taught that we are stewards...",
    "keyTakeaway": "God expects faithful stewardship...",
    "bibleVerses": [
      {
        "id": "verse-001",
        "book": "Matthew",
        "chapter": 25,
        "verse": 14,
        "endVerse": 30,
        "text": "For it is just like a man..."
      }
    ],
    "practicalSteps": [
      "Audit your current talents...",
      "Set specific, measurable goals..."
    ]
  }
]
```

---

#### Get Lesson by ID

**Retrieve a specific lesson**
```
GET /api/lessons/{lessonId}
```

**Path Parameters:**
- `lessonId`: The lesson ID (e.g., "lesson-001")

**Response (200 OK):**
Returns the full lesson object (same schema as above)

---

### Progress Endpoints

#### Save Lesson Progress

**Track user's progress on a lesson**
```
POST /api/progress
```

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "userId": "user-123",
  "lessonId": "lesson-001",
  "completionPercentage": 75,
  "timeSpent": 600
}
```

**Parameters:**
- `userId`: User ID
- `lessonId`: Lesson ID
- `completionPercentage`: 0-100
- `timeSpent`: Time in seconds (optional)

**Response (201 Created):**
```json
{
  "id": "progress-123",
  "userId": "user-123",
  "lessonId": "lesson-001",
  "completionPercentage": 75,
  "timeSpent": 600,
  "completedAt": "2024-01-15T10:30:00Z",
  "isFavorite": false
}
```

---

#### Get User Progress

**Get all progress records for authenticated user**
```
GET /api/progress
```

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
[
  {
    "id": "progress-123",
    "userId": "user-123",
    "lessonId": "lesson-001",
    "completionPercentage": 75,
    "timeSpent": 600,
    "completedAt": "2024-01-15T10:30:00Z",
    "isFavorite": false
  }
]
```

---

#### Update Lesson Progress

**Update progress on a specific lesson**
```
PUT /api/progress/{progressId}
```

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `progressId`: The progress record ID

**Request Body:**
```json
{
  "completionPercentage": 100,
  "timeSpent": 900
}
```

**Response (200 OK):**
Returns the updated progress object

---

#### Delete Progress

**Delete a progress record**
```
DELETE /api/progress/{progressId}
```

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "success": true
}
```

---

### Favorites Endpoints

#### Toggle Favorite

**Add or remove lesson from favorites**
```
POST /api/favorites/{lessonId}
```

**Authentication:** Required (Bearer token)

**Path Parameters:**
- `lessonId`: The lesson ID

**Request Body:**
```json
{
  "isFavorite": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "isFavorite": true
}
```

---

#### Check Favorite Status

**Check if a lesson is favorited**
```
GET /api/favorites/{lessonId}
```

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "isFavorite": true
}
```

---

#### Get Favorite Lessons

**Get all favorited lessons**
```
GET /api/favorites
```

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
[
  {
    "id": "lesson-001",
    "title": "The Parable of the Talents",
    "subtitle": "Faithful Management of Resources",
    "category": "Financial Stewardship",
    "difficulty": "Beginner",
    "duration": 12,
    "content": "...",
    "keyTakeaway": "...",
    "bibleVerses": [],
    "practicalSteps": []
  }
]
```

---

### Preferences Endpoints

#### Get User Preferences

**Retrieve user's app preferences**
```
GET /api/preferences
```

**Authentication:** Required (Bearer token)

**Response (200 OK):**
```json
{
  "userId": "user-123",
  "isDarkMode": false,
  "notificationEnabled": true,
  "notificationTime": "08:00",
  "theme": "light",
  "language": "en"
}
```

---

#### Update User Preferences

**Update user's app preferences**
```
PUT /api/preferences
```

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "isDarkMode": true,
  "notificationEnabled": true,
  "notificationTime": "09:00",
  "theme": "dark",
  "language": "en"
}
```

**Response (200 OK):**
Returns the updated preferences object

---

## Error Handling

### Error Response Format

All error responses follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `MISSING_FIELDS` | 400 | Required fields missing |
| `INVALID_EMAIL` | 400 | Email format invalid |
| `WEAK_PASSWORD` | 400 | Password doesn't meet requirements |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Server error |

### Validation Errors

Example validation error response:

```json
{
  "error": "Invalid email format",
  "code": "VALIDATION_ERROR",
  "field": "email"
}
```

### Missing Fields Errors

Example missing fields response:

```json
{
  "error": "Missing required fields: email, password",
  "code": "MISSING_FIELDS",
  "missing": ["email", "password"]
}
```

---

## Examples

### Complete Registration Flow

```bash
# 1. Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "displayName": "John Doe"
  }'

# Response:
# {
#   "user": { "uid": "...", "email": "john@example.com", "displayName": "John Doe" },
#   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
# }

# 2. Save token and use it for authenticated requests
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 3. Get all lessons
curl -X GET http://localhost:3000/api/lessons

# 4. Save progress on a lesson
curl -X POST http://localhost:3000/api/progress \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "user-123",
    "lessonId": "lesson-001",
    "completionPercentage": 50,
    "timeSpent": 600
  }'

# 5. Add lesson to favorites
curl -X POST http://localhost:3000/api/favorites/lesson-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"isFavorite": true}'

# 6. Get all favorites
curl -X GET http://localhost:3000/api/favorites \
  -H "Authorization: Bearer $TOKEN"
```

### Using with JavaScript/Fetch

```javascript
const BASE_URL = 'http://localhost:3000';
let authToken = null;

// Register
async function register(email, password, displayName) {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName })
  });

  const data = await response.json();
  authToken = data.token;
  return data;
}

// Get all lessons
async function getLessons() {
  const response = await fetch(`${BASE_URL}/api/lessons`);
  return response.json();
}

// Save progress (requires authentication)
async function saveProgress(userId, lessonId, completionPercentage) {
  const response = await fetch(`${BASE_URL}/api/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      userId,
      lessonId,
      completionPercentage
    })
  });

  if (response.status === 429) {
    const error = await response.json();
    console.log(`Rate limited. Wait ${error.retryAfter} seconds`);
    return null;
  }

  return response.json();
}
```

---

## Pagination

Endpoints that return collections support pagination:

**Query Parameters:**
- `skip`: Number of items to skip (default: 0)
- `limit`: Maximum items to return (default: 50, max: 200)

**Example:**
```bash
curl "http://localhost:3000/api/lessons?skip=0&limit=10"
```

---

## Filtering

Some endpoints support filtering:

**Lesson Filtering:**
- `category`: Filter by category (e.g., "Financial Stewardship")
- `difficulty`: Filter by difficulty (Beginner, Intermediate, Advanced)

**Example:**
```bash
curl "http://localhost:3000/api/lessons?difficulty=Intermediate&category=Leadership"
```

---

## Versioning

The API version is included in all responses. When breaking changes are introduced, a new version will be released as `/api/v2/`, etc.

Currently: **v1** (`/api/`)

---

## Support

For API support, contact: support@bibleapp.com

## See Also

- [Validation Middleware Guide](./VALIDATION-GUIDE.md)
- [Rate Limiting Guide](./RATE-LIMITING-GUIDE.md)
- [OpenAPI Specification](./openapi.json)
