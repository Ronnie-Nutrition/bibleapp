/**
 * Request Validation Middleware
 * Provides reusable validation functions and middleware for API requests
 */

// Validation error class
class ValidationError extends Error {
  constructor(field, message, value = undefined) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.statusCode = 400;
  }
}

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements: min 8 chars, at least one uppercase, one lowercase, one number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// URL validation
const URL_REGEX = /^https?:\/\/.+/;

/**
 * Validators object with individual validation functions
 */
const validators = {
  /**
   * Validate email format
   */
  email: (value) => {
    if (!value) throw new ValidationError('email', 'Email is required');
    if (typeof value !== 'string') throw new ValidationError('email', 'Email must be a string');
    if (!EMAIL_REGEX.test(value)) throw new ValidationError('email', 'Invalid email format');
    if (value.length > 255) throw new ValidationError('email', 'Email too long (max 255 characters)');
    return true;
  },

  /**
   * Validate password strength
   */
  password: (value, options = {}) => {
    const { minLength = 8, requireSpecial = false } = options;

    if (!value) throw new ValidationError('password', 'Password is required');
    if (typeof value !== 'string') throw new ValidationError('password', 'Password must be a string');
    if (value.length < minLength) {
      throw new ValidationError('password', `Password must be at least ${minLength} characters`);
    }
    if (value.length > 128) throw new ValidationError('password', 'Password too long (max 128 characters)');

    // Check for at least one uppercase, one lowercase, one number
    if (!/(?=.*[a-z])/.test(value)) {
      throw new ValidationError('password', 'Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      throw new ValidationError('password', 'Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(value)) {
      throw new ValidationError('password', 'Password must contain at least one number');
    }

    return true;
  },

  /**
   * Validate string field
   */
  string: (value, fieldName, options = {}) => {
    const { required = true, minLength = 1, maxLength = 255, allowEmpty = false } = options;

    if (!value && required && !allowEmpty) {
      throw new ValidationError(fieldName, `${fieldName} is required`);
    }

    if (value && typeof value !== 'string') {
      throw new ValidationError(fieldName, `${fieldName} must be a string`);
    }

    if (value && value.length < minLength) {
      throw new ValidationError(fieldName, `${fieldName} must be at least ${minLength} characters`);
    }

    if (value && value.length > maxLength) {
      throw new ValidationError(fieldName, `${fieldName} must not exceed ${maxLength} characters`);
    }

    return true;
  },

  /**
   * Validate number field
   */
  number: (value, fieldName, options = {}) => {
    const { required = true, min = 0, max = Number.MAX_SAFE_INTEGER } = options;

    if (value === null || value === undefined) {
      if (required) throw new ValidationError(fieldName, `${fieldName} is required`);
      return true;
    }

    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(fieldName, `${fieldName} must be a number`);
    }

    if (value < min) {
      throw new ValidationError(fieldName, `${fieldName} must be at least ${min}`);
    }

    if (value > max) {
      throw new ValidationError(fieldName, `${fieldName} must not exceed ${max}`);
    }

    return true;
  },

  /**
   * Validate UUID/ID format
   */
  id: (value, fieldName) => {
    if (!value) throw new ValidationError(fieldName, `${fieldName} is required`);
    if (typeof value !== 'string') throw new ValidationError(fieldName, `${fieldName} must be a string`);

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = uuidRegex.test(value);

    // Also accept Firebase-style IDs (alphanumeric)
    const isValidId = /^[a-zA-Z0-9_-]{10,}$/.test(value);

    if (!isUuid && !isValidId) {
      throw new ValidationError(fieldName, `${fieldName} has invalid format`);
    }

    return true;
  },

  /**
   * Validate boolean field
   */
  boolean: (value, fieldName, options = {}) => {
    const { required = true } = options;

    if (value === null || value === undefined) {
      if (required) throw new ValidationError(fieldName, `${fieldName} is required`);
      return true;
    }

    if (typeof value !== 'boolean') {
      throw new ValidationError(fieldName, `${fieldName} must be a boolean`);
    }

    return true;
  },

  /**
   * Validate URL format
   */
  url: (value, fieldName) => {
    if (!value) throw new ValidationError(fieldName, `${fieldName} is required`);
    if (typeof value !== 'string') throw new ValidationError(fieldName, `${fieldName} must be a string`);
    if (!URL_REGEX.test(value)) throw new ValidationError(fieldName, `${fieldName} must be a valid URL`);
    return true;
  },

  /**
   * Validate enum values
   */
  enum: (value, fieldName, allowedValues) => {
    if (!value) throw new ValidationError(fieldName, `${fieldName} is required`);
    if (!allowedValues.includes(value)) {
      throw new ValidationError(
        fieldName,
        `${fieldName} must be one of: ${allowedValues.join(', ')}`
      );
    }
    return true;
  },

  /**
   * Validate required fields exist in object
   */
  requiredFields: (obj, fields) => {
    const missing = [];
    for (const field of fields) {
      if (obj[field] === null || obj[field] === undefined || obj[field] === '') {
        missing.push(field);
      }
    }

    if (missing.length > 0) {
      const error = new Error(`Missing required fields: ${missing.join(', ')}`);
      error.statusCode = 400;
      error.code = 'MISSING_FIELDS';
      error.missing = missing;
      throw error;
    }

    return true;
  },

  /**
   * Validate object contains only expected fields
   */
  allowedFields: (obj, allowedFields) => {
    const extraFields = Object.keys(obj).filter(key => !allowedFields.includes(key));

    if (extraFields.length > 0) {
      const error = new Error(`Unexpected fields: ${extraFields.join(', ')}`);
      error.statusCode = 400;
      error.code = 'UNEXPECTED_FIELDS';
      error.extra = extraFields;
      throw error;
    }

    return true;
  }
};

/**
 * Express middleware for handling validation errors
 */
const validationErrorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: err.message,
      code: 'VALIDATION_ERROR',
      field: err.field
    });
  }

  if (err.code === 'MISSING_FIELDS') {
    return res.status(400).json({
      error: err.message,
      code: 'MISSING_FIELDS',
      missing: err.missing || []
    });
  }

  if (err.code === 'UNEXPECTED_FIELDS') {
    return res.status(400).json({
      error: err.message,
      code: 'UNEXPECTED_FIELDS',
      extra: err.extra || []
    });
  }

  next(err);
};

/**
 * Request validation middleware factory
 * Usage: app.post('/register', validateRequest(schema), handler);
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const data = req.body;

      // Check required fields
      if (schema.required) {
        validators.requiredFields(data, schema.required);
      }

      // Validate each field
      if (schema.fields) {
        Object.keys(schema.fields).forEach(field => {
          const fieldSchema = schema.fields[field];
          const value = data[field];

          if (fieldSchema.type === 'email') {
            if (value) validators.email(value);
          } else if (fieldSchema.type === 'password') {
            if (value) validators.password(value, fieldSchema.options);
          } else if (fieldSchema.type === 'string') {
            if (value || fieldSchema.required) {
              validators.string(value, field, fieldSchema.options);
            }
          } else if (fieldSchema.type === 'number') {
            if (value !== null || fieldSchema.required) {
              validators.number(value, field, fieldSchema.options);
            }
          } else if (fieldSchema.type === 'boolean') {
            if (value !== null || fieldSchema.required) {
              validators.boolean(value, field, fieldSchema.options);
            }
          } else if (fieldSchema.type === 'id') {
            if (value) validators.id(value, field);
          } else if (fieldSchema.type === 'url') {
            if (value) validators.url(value, field);
          } else if (fieldSchema.type === 'enum') {
            if (value) validators.enum(value, field, fieldSchema.values);
          }
        });
      }

      // Check for unexpected fields
      if (schema.allowedFields) {
        validators.allowedFields(data, schema.allowedFields);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validators,
  ValidationError,
  validationErrorHandler,
  validateRequest
};
