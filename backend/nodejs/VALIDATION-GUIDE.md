# Request Validation Middleware Guide

## Overview

The validation middleware provides a centralized, reusable way to validate all incoming API requests. This ensures consistent error messages, proper data typing, and prevents invalid data from reaching business logic.

## File Location

`/middleware/validation.js` - Contains validators, error handling, and middleware factory

## Quick Start

### 1. Import the middleware in your route file

```javascript
const { validateRequest, validationErrorHandler } = require('../middleware/validation');
```

### 2. Add validation to a route

```javascript
router.post('/register',
  validateRequest({
    required: ['email', 'password', 'displayName'],
    fields: {
      email: { type: 'email' },
      password: { type: 'password' },
      displayName: { type: 'string', options: { minLength: 2, maxLength: 100 } }
    }
  }),
  async (req, res) => {
    // Your handler code here - req.body is guaranteed to be valid
  }
);
```

### 3. Error handler is already set up in server.js

The validation error handler is automatically applied in `server.js`:
```javascript
app.use(validationErrorHandler);
```

## Validation Types

### email
Validates email format according to RFC 5322 (simplified).
- Required by default
- Max length: 255 characters
- Error code: `VALIDATION_ERROR`

**Example:**
```javascript
{ type: 'email' }
```

**Errors:**
- "Email is required"
- "Email must be a string"
- "Invalid email format"
- "Email too long (max 255 characters)"

---

### password
Validates password strength.
- Required by default
- Default min length: 8 characters
- Requires: uppercase letter, lowercase letter, number
- Max length: 128 characters
- Error code: `VALIDATION_ERROR`

**Example:**
```javascript
{ type: 'password', options: { minLength: 10, requireSpecial: true } }
```

**Errors:**
- "Password is required"
- "Password must be a string"
- "Password must be at least 8 characters"
- "Password too long (max 128 characters)"
- "Password must contain at least one lowercase letter"
- "Password must contain at least one uppercase letter"
- "Password must contain at least one number"

---

### string
Validates string fields with length constraints.

**Example:**
```javascript
{
  type: 'string',
  required: true,
  options: {
    minLength: 1,
    maxLength: 255,
    allowEmpty: false
  }
}
```

**Options:**
- `required` (boolean, default: true) - Field must be provided
- `minLength` (number, default: 1) - Minimum string length
- `maxLength` (number, default: 255) - Maximum string length
- `allowEmpty` (boolean, default: false) - Allow empty strings if not required

**Errors:**
- "[fieldName] is required"
- "[fieldName] must be a string"
- "[fieldName] must be at least X characters"
- "[fieldName] must not exceed X characters"

---

### number
Validates numeric fields with min/max constraints.

**Example:**
```javascript
{
  type: 'number',
  required: true,
  options: {
    min: 0,
    max: 100
  }
}
```

**Options:**
- `required` (boolean, default: true) - Field must be provided
- `min` (number, default: 0) - Minimum value
- `max` (number, default: MAX_SAFE_INTEGER) - Maximum value

**Errors:**
- "[fieldName] is required"
- "[fieldName] must be a number"
- "[fieldName] must be at least X"
- "[fieldName] must not exceed X"

---

### boolean
Validates boolean fields.

**Example:**
```javascript
{ type: 'boolean', required: true }
```

**Options:**
- `required` (boolean, default: true) - Field must be provided

**Errors:**
- "[fieldName] is required"
- "[fieldName] must be a boolean"

---

### id
Validates UUID or Firebase-style IDs.

Accepts:
- UUID v4 format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`
- Firebase IDs: 10+ alphanumeric characters (letters, numbers, hyphens, underscores)

**Example:**
```javascript
{ type: 'id' }
```

**Errors:**
- "[fieldName] is required"
- "[fieldName] must be a string"
- "[fieldName] has invalid format"

---

### url
Validates HTTP/HTTPS URLs.

**Example:**
```javascript
{ type: 'url' }
```

**Errors:**
- "[fieldName] is required"
- "[fieldName] must be a string"
- "[fieldName] must be a valid URL"

---

### enum
Validates against a list of allowed values.

**Example:**
```javascript
{
  type: 'enum',
  values: ['beginner', 'intermediate', 'advanced']
}
```

**Errors:**
- "[fieldName] is required"
- "[fieldName] must be one of: beginner, intermediate, advanced"

---

## Complete Examples

### Authentication Endpoint

```javascript
router.post('/register',
  validateRequest({
    required: ['email', 'password', 'displayName'],
    fields: {
      email: { type: 'email' },
      password: { type: 'password' },
      displayName: { type: 'string', options: { minLength: 2, maxLength: 100 } }
    }
  }),
  async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      // Process registration...
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

### Lesson Progress Endpoint

```javascript
router.post('/api/progress',
  validateRequest({
    required: ['userId', 'lessonId', 'completionPercentage'],
    fields: {
      userId: { type: 'id' },
      lessonId: { type: 'id' },
      completionPercentage: { type: 'number', options: { min: 0, max: 100 } },
      timeSpent: { type: 'number', required: false, options: { min: 0 } }
    }
  }),
  async (req, res) => {
    try {
      const { userId, lessonId, completionPercentage, timeSpent } = req.body;
      // Save progress...
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

### Update Lesson Endpoint

```javascript
router.put('/api/lessons/:id',
  validateRequest({
    required: ['title', 'content'],
    fields: {
      title: { type: 'string', options: { minLength: 5, maxLength: 200 } },
      content: { type: 'string', options: { minLength: 50, maxLength: 5000 } },
      category: { type: 'enum', values: ['leadership', 'finance', 'ethics'], required: false },
      difficulty: { type: 'enum', values: ['beginner', 'intermediate', 'advanced'], required: false }
    }
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, category, difficulty } = req.body;
      // Update lesson...
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);
```

## Schema Options

### Required Fields
Fields listed in the `required` array must be present in the request.

```javascript
{
  required: ['email', 'password'],
  // ...
}
```

### Field Configuration

Each field in the `fields` object has:
- `type`: The data type validator to use
- `options`: Type-specific validation options
- `required`: Whether this field is required (optional, defaults to true for most types)

```javascript
{
  fields: {
    email: { type: 'email' },  // Required by default
    phone: { type: 'string', required: false, options: { minLength: 10 } },
    age: { type: 'number', options: { min: 0, max: 150 } }
  }
}
```

### Allowed Fields
Restrict which fields are allowed in the request:

```javascript
{
  allowedFields: ['email', 'password', 'displayName']
}
```

If a request includes other fields, it will be rejected with a 400 error.

## Error Response Format

### Validation Error

```json
{
  "error": "Invalid email format",
  "code": "VALIDATION_ERROR",
  "field": "email"
}
```

### Missing Fields Error

```json
{
  "error": "Missing required fields: email, password",
  "code": "MISSING_FIELDS",
  "missing": ["email", "password"]
}
```

### Unexpected Fields Error

```json
{
  "error": "Unexpected fields: unwantedField",
  "code": "UNEXPECTED_FIELDS",
  "extra": ["unwantedField"]
}
```

## Using Direct Validators

For more complex scenarios, you can use the validators directly:

```javascript
const { validators, ValidationError } = require('../middleware/validation');

router.post('/custom', async (req, res, next) => {
  try {
    const { email, age } = req.body;

    // Validate email
    validators.email(email);

    // Validate age is between 18 and 100
    validators.number(age, 'age', { min: 18, max: 100 });

    // Your business logic...
    res.json({ success: true });
  } catch (error) {
    next(error); // Pass to error handler
  }
});
```

## Best Practices

1. **Validate Early**: Always validate at the route level, before business logic
2. **Clear Error Messages**: Use specific field names in error messages
3. **Fail Fast**: Stop processing invalid requests immediately
4. **Consistent Types**: Use the same types for the same data across endpoints
5. **Document Requirements**: Add comments explaining password, length, or special requirements

## Example: Complete API with Validation

```javascript
const express = require('express');
const { validateRequest, validationErrorHandler } = require('../middleware/validation');

const router = express.Router();

// Get all lessons (no validation needed)
router.get('/', async (req, res) => {
  // Handle request
});

// Create lesson (validate input)
router.post('/',
  validateRequest({
    required: ['title', 'content', 'category'],
    fields: {
      title: { type: 'string', options: { minLength: 5, maxLength: 200 } },
      content: { type: 'string', options: { minLength: 50 } },
      category: { type: 'enum', values: ['leadership', 'finance', 'ethics'] },
      difficulty: { type: 'enum', values: ['beginner', 'intermediate', 'advanced'], required: false }
    }
  }),
  async (req, res, next) => {
    try {
      // Your logic here
      res.status(201).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

// Update lesson (validate input)
router.put('/:id',
  validateRequest({
    required: ['title'],
    fields: {
      title: { type: 'string', options: { minLength: 5, maxLength: 200 } },
      content: { type: 'string', required: false, options: { minLength: 50 } }
    }
  }),
  async (req, res, next) => {
    try {
      // Your logic here
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
```

## Testing Validation

### Test Valid Request

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "displayName": "John Doe"
  }'
```

### Test Invalid Email

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "SecurePass123",
    "displayName": "John Doe"
  }'
```

Response:
```json
{
  "error": "Invalid email format",
  "code": "VALIDATION_ERROR",
  "field": "email"
}
```

### Test Missing Fields

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

Response:
```json
{
  "error": "Missing required fields: password, displayName",
  "code": "MISSING_FIELDS",
  "missing": ["password", "displayName"]
}
```

## Adding to All Endpoints

To systematically add validation to all endpoints:

1. **Identify all POST/PUT/PATCH routes** that accept user input
2. **Define validation schema** for each endpoint
3. **Add validateRequest middleware** before the handler
4. **Test with invalid data** to verify error responses
5. **Update API documentation** with validation requirements

## Extending Validation

To add custom validators:

```javascript
// In validation.js
const customValidators = {
  phoneNumber: (value) => {
    const phoneRegex = /^\+?1?\d{9,15}$/;
    if (!phoneRegex.test(value)) {
      throw new ValidationError('phoneNumber', 'Invalid phone number format');
    }
    return true;
  }
};

// Export for use
module.exports = {
  // ... existing exports
  customValidators
};
```

Then use in schema:
```javascript
// After importing customValidators
if (fieldSchema.customValidator) {
  fieldSchema.customValidator(value);
}
```

---

## Quick Reference

| Type | Required | Options | Example |
|------|----------|---------|---------|
| email | Yes | - | `{ type: 'email' }` |
| password | Yes | minLength, requireSpecial | `{ type: 'password', options: { minLength: 10 } }` |
| string | Yes | required, minLength, maxLength | `{ type: 'string', options: { maxLength: 100 } }` |
| number | Yes | required, min, max | `{ type: 'number', options: { min: 0, max: 100 } }` |
| boolean | Yes | required | `{ type: 'boolean' }` |
| id | Yes | - | `{ type: 'id' }` |
| url | Yes | - | `{ type: 'url' }` |
| enum | Yes | values | `{ type: 'enum', values: ['a', 'b'] }` |

