# Rate Limiting Middleware Guide

## Overview

The rate limiting middleware protects the API from abuse by limiting the number of requests from a single user or IP address within a specified time window. This prevents:

- Brute force attacks on authentication endpoints
- DDoS attacks
- Resource exhaustion
- Malicious scraping

## File Location

`/middleware/rateLimiting.js` - Contains rate limiting middleware and configuration

## Quick Start

### 1. Import the middleware

```javascript
const { rateLimit, rateLimits } = require('../middleware/rateLimiting');
```

### 2. Use predefined limits on a route

```javascript
app.post('/login', rateLimits.login, handler);
app.get('/lessons', rateLimits.lessons, handler);
```

### 3. Or create custom limits

```javascript
const customLimit = rateLimit('general', {
  windowMs: 5 * 60 * 1000,  // 5 minutes
  maxRequests: 20
});

app.get('/search', customLimit, handler);
```

## Default Rate Limits

The middleware comes with predefined limits for different endpoint types:

### Authentication Endpoints (Strictest)
```
Limit: 5 requests per 15 minutes
Endpoints: /register, /login, /forgot-password, /reset-password
Purpose: Prevent brute force attacks
```

### General API Endpoints
```
Limit: 30 requests per 1 minute
Endpoints: /lessons, /progress, /favorites, /preferences
Purpose: Normal API operation
```

### Read-Heavy Endpoints
```
Limit: 100 requests per 1 minute
Endpoints: /search, GET all
Purpose: High-volume read operations
```

### Heavy Operations
```
Limit: 5 requests per 1 minute
Endpoints: /bulk-upload, /export
Purpose: Resource-intensive operations
```

## Usage Examples

### Using Predefined Limits

```javascript
const { rateLimits } = require('../middleware/rateLimiting');

// Authentication endpoints
authRouter.post('/register', rateLimits.register, handler);
authRouter.post('/login', rateLimits.login, handler);
authRouter.post('/forgot-password', rateLimits.passwordReset, handler);

// General endpoints
lessonsRouter.get('/', rateLimits.getAll, handler);
lessonsRouter.post('/', rateLimits.lessons, handler);
progressRouter.post('/', rateLimits.progress, handler);

// Heavy operations
adminRouter.post('/bulk-upload', rateLimits.bulkUpload, handler);
```

### Creating Custom Limits

```javascript
const { createRateLimit } = require('../middleware/rateLimiting');

// Strict limit for expensive operations
const expensiveLimit = createRateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 3,
  message: 'Limited to 3 requests per hour for this operation'
});

app.post('/expensive-operation', expensiveLimit, handler);
```

### Creating Grouped Rate Limits

```javascript
const { rateLimit } = require('../middleware/rateLimiting');

// Apply same limit to multiple endpoints
const searchLimit = rateLimit('read', {
  windowMs: 5 * 60 * 1000,  // 5 minutes
  maxRequests: 50,
  keyPrefix: 'search'
});

app.get('/search/lessons', searchLimit, handler);
app.get('/search/verses', searchLimit, handler);
```

## How It Works

### Rate Limiting Keys

The middleware generates a unique key for each request to track usage:

**For Authenticated Users:**
- Uses the Firebase user ID
- Key format: `prefix:user:{userId}`
- Limits are per-user regardless of IP

**For Anonymous Users:**
- Uses the client's IP address
- Key format: `prefix:ip:{ipAddress}`
- Limits are per-IP address

### Example: Authentication Flow

```
Request 1: POST /login from IP 192.168.1.100
  → Creates key: "auth:ip:192.168.1.100"
  → Count: 1/5
  → Response: 200 OK with X-RateLimit headers

Request 2: POST /login from same IP
  → Key: "auth:ip:192.168.1.100"
  → Count: 2/5
  → Response: 200 OK

... (3 more requests)

Request 6: POST /login from same IP
  → Key: "auth:ip:192.168.1.100"
  → Count: 6/5 (EXCEEDED)
  → Response: 429 Too Many Requests

Wait 15 minutes...

Request 7: POST /login from same IP
  → Window expired
  → Key: "auth:ip:192.168.1.100" (reset)
  → Count: 1/5
  → Response: 200 OK
```

## Response Headers

The middleware includes standard rate limiting headers:

```http
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 1609459200
```

**Explanation:**
- `X-RateLimit-Limit`: Maximum requests allowed in the window
- `X-RateLimit-Remaining`: Requests remaining before limit
- `X-RateLimit-Reset`: Unix timestamp when the limit resets

## Error Response Format

When a rate limit is exceeded, the API returns a 429 (Too Many Requests) response:

```json
{
  "error": "Too many authentication attempts, please try again later",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 892,
  "limits": {
    "limit": 5,
    "remaining": 0,
    "reset": 1609459200000
  }
}
```

**Fields:**
- `error`: Human-readable error message
- `code`: Error code for programmatic handling
- `retryAfter`: Seconds to wait before retrying
- `limits`: Details about the limit configuration

## Advanced Configuration

### Custom Store (Redis)

For production with multiple server instances, use Redis:

```javascript
const redis = require('redis');
const { createRateLimit } = require('../middleware/rateLimiting');

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// Create a Redis-backed store (you'll need to implement this)
class RedisRateLimitStore {
  isWithinLimit(key, limit, windowMs) {
    // Implementation using Redis INCR and EXPIRE
  }
  // ... other methods
}

const customLimit = createRateLimit({
  windowMs: 60 * 1000,
  maxRequests: 30,
  store: new RedisRateLimitStore(redisClient)
});
```

### Environment-Based Configuration

```javascript
const { rateLimit } = require('../middleware/rateLimiting');

// Stricter limits in production
const isDev = process.env.NODE_ENV === 'development';
const maxRequests = isDev ? 1000 : 30; // Lenient in dev

const apiLimit = rateLimit('general', {
  maxRequests,
  windowMs: isDev ? 60 * 60 * 1000 : 60 * 1000
});

app.get('/api/lessons', apiLimit, handler);
```

### Skip Rate Limiting for Admins

```javascript
const { skipRateLimitForAdmin } = require('../middleware/rateLimiting');

// Admins bypass rate limits
app.use(skipRateLimitForAdmin);

app.post('/expensive', rateLimits.heavy, handler);
// Admins can make unlimited requests
```

## Monitoring

### Get Current Rate Limit Status

```javascript
const { getRateLimitStatus } = require('../middleware/rateLimiting');

// Get all rate limit entries
const allLimits = getRateLimitStatus();

// Get limits for specific pattern
const authLimits = getRateLimitStatus('auth');

// Output:
// {
//   'auth:ip:192.168.1.100': { count: 3, resetTime: 1609459200000, remaining: 892 },
//   'auth:ip:192.168.1.101': { count: 5, resetTime: 1609459200000, remaining: 0 }
// }
```

### Reset a Specific Limit

```javascript
const { resetRateLimit } = require('../middleware/rateLimiting');

// Admin manually resets a user's limit
resetRateLimit('auth:ip:192.168.1.100');
```

### Create a Monitoring Endpoint

```javascript
const { getRateLimitStatus } = require('../middleware/rateLimiting');

// Admin endpoint to view rate limit status
app.get('/admin/rate-limits', adminAuth, (req, res) => {
  const status = getRateLimitStatus();
  res.json(status);
});
```

## Best Practices

### 1. **Appropriate Limits**
- Authentication: 5-10 requests per 15 minutes
- General API: 20-50 requests per minute
- Read-heavy: 100+ requests per minute
- Heavy operations: 2-5 requests per minute

### 2. **User-Friendly Messages**
```javascript
// Good
"Too many login attempts. Please try again in 15 minutes."

// Poor
"429 Error"
```

### 3. **Clear Documentation**
- Document rate limits in your API docs
- Include rate limit headers in responses
- Show error messages clearly to users

### 4. **Testing**
- Test rate limiting behavior
- Verify correct error responses
- Test recovery after window expires

### 5. **Monitoring**
- Log when rate limits are exceeded
- Monitor for unusual patterns
- Alert on potential attacks

### 6. **Gradual Tightening**
- Start with generous limits
- Tighten based on observed usage
- Adjust by endpoint type

## Example: Complete Implementation

```javascript
const express = require('express');
const { rateLimits, rateLimit } = require('../middleware/rateLimiting');

const app = express();

// Auth endpoints with strict limits
app.post('/auth/register', rateLimits.register, registerHandler);
app.post('/auth/login', rateLimits.login, loginHandler);
app.post('/auth/forgot-password', rateLimits.passwordReset, forgotHandler);

// API endpoints with moderate limits
app.get('/api/lessons', rateLimits.getAll, getLessonsHandler);
app.post('/api/progress', rateLimits.progress, saveProgressHandler);
app.post('/api/favorites', rateLimits.favorites, toggleFavoriteHandler);

// Search with higher limits
const searchLimit = rateLimit('read', {
  windowMs: 5 * 60 * 1000,
  maxRequests: 50,
  keyPrefix: 'search'
});
app.get('/api/search', searchLimit, searchHandler);

// Heavy operations with strict limits
app.post('/api/bulk-upload', rateLimits.bulkUpload, bulkUploadHandler);
app.get('/api/export', rateLimits.export, exportHandler);

// Admin monitoring endpoint
app.get('/admin/rate-limits', adminAuth, (req, res) => {
  const { getRateLimitStatus } = require('../middleware/rateLimiting');
  res.json(getRateLimitStatus());
});
```

## Testing Rate Limits

### Test with curl

```bash
# First request (should succeed)
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}' \
  -v

# Check headers
# X-RateLimit-Limit: 5
# X-RateLimit-Remaining: 4

# Make 5 more requests quickly...

# 6th request (should be rate limited)
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass"}' \
  -v

# Response:
# HTTP/1.1 429 Too Many Requests
# {
#   "error": "Too many authentication attempts...",
#   "code": "RATE_LIMIT_EXCEEDED",
#   "retryAfter": 892
# }
```

### Test with Node.js

```javascript
const axios = require('axios');

async function testRateLimit() {
  const config = {
    method: 'post',
    url: 'http://localhost:3000/login',
    data: {
      email: 'test@example.com',
      password: 'password'
    }
  };

  for (let i = 0; i < 10; i++) {
    try {
      const response = await axios(config);
      console.log(`Request ${i + 1}: ${response.status} - Remaining: ${response.headers['x-ratelimit-remaining']}`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`Request ${i + 1}: RATE LIMITED - Retry after ${error.response.data.retryAfter}s`);
      } else {
        console.error(`Request ${i + 1}: ERROR - ${error.message}`);
      }
    }

    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

testRateLimit();
```

## Troubleshooting

### Rate Limit Too Strict
- Check the configured limits
- Verify key generation is working correctly
- Ensure time window is appropriate
- Test with different scenarios

### Rate Limit Not Working
- Verify middleware is applied to the route
- Check middleware order (should be early in chain)
- Ensure IP/user ID extraction is working
- Check for middleware bypassing

### Memory Issues
- Monitor in-memory store size (especially under load)
- Consider Redis for production
- Implement automatic cleanup of expired entries

### Testing Issues
- Clear in-memory store between tests
- Use custom store instances for isolated tests
- Mock time for predictable behavior

## Production Recommendations

1. **Use Redis or memcached** for distributed rate limiting
2. **Monitor rate limit hits** to detect attacks
3. **Adjust limits based on actual usage patterns**
4. **Implement gradual backoff** for aggressive requests
5. **Log all 429 responses** for analysis
6. **Use CDN/WAF** for additional DDoS protection
7. **Set up alerts** for unusual rate limit activity

## API Clients

When building API clients, handle rate limiting gracefully:

```javascript
// Client-side rate limit handling
async function makeRequest(url, options) {
  try {
    const response = await fetch(url, options);

    // Check rate limit headers
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (response.status === 429) {
      const retryAfter = JSON.parse(await response.text()).retryAfter;
      console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
      await delay(retryAfter * 1000);
      return makeRequest(url, options); // Retry
    }

    if (remaining && parseInt(remaining) < 5) {
      console.warn(`Approaching rate limit. ${remaining} requests remaining`);
    }

    return response;
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

---

## Quick Reference

| Type | Limit | Window | Use Case |
|------|-------|--------|----------|
| auth | 5 | 15 min | Prevent brute force |
| general | 30 | 1 min | Standard API |
| read | 100 | 1 min | High-volume reads |
| heavy | 5 | 1 min | Resource-intensive |

## See Also

- [Validation Middleware Guide](./VALIDATION-GUIDE.md)
- [API Documentation](./docs/API.md)
- Rate Limiting Best Practices: https://cloud.google.com/architecture/rate-limiting-strategies-techniques
