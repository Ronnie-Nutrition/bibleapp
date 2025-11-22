/**
 * Validation Middleware Tests
 * Tests for request validation middleware
 */

const request = require('supertest');
const express = require('express');
const { validateRequest, ValidationError, validators } = require('../middleware/validation');

describe('Validation Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Test endpoint 1: Register user
    app.post('/register',
      validateRequest({
        required: ['email', 'password', 'displayName'],
        fields: {
          email: { type: 'email' },
          password: { type: 'password' },
          displayName: { type: 'string', options: { minLength: 2, maxLength: 100 } }
        }
      }),
      (req, res) => {
        res.json({ success: true, data: req.body });
      }
    );

    // Test endpoint 2: Update lesson
    app.post('/lessons',
      validateRequest({
        required: ['title', 'content', 'category'],
        fields: {
          title: { type: 'string', options: { minLength: 5, maxLength: 200 } },
          content: { type: 'string', options: { minLength: 50 } },
          category: { type: 'enum', values: ['leadership', 'finance', 'ethics'] },
          difficulty: { type: 'enum', values: ['beginner', 'intermediate', 'advanced'], required: false }
        }
      }),
      (req, res) => {
        res.json({ success: true });
      }
    );

    // Error handler
    app.use((err, req, res, next) => {
      res.status(400).json({
        error: err.message,
        code: err.code || 'VALIDATION_ERROR',
        field: err.field
      });
    });
  });

  describe('Email Validation', () => {
    test('should validate correct email', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'SecurePass123',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'invalid-email',
          password: 'SecurePass123',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.field).toBe('email');
    });

    test('should reject missing email', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          password: 'SecurePass123',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_FIELDS');
    });

    test('should reject email with special characters', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user @example.com',
          password: 'SecurePass123',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Password Validation', () => {
    test('should validate strong password', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'StrongPass123',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(200);
    });

    test('should reject password without uppercase', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'weakpass123',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(400);
      expect(res.body.field).toBe('password');
      expect(res.body.error).toContain('uppercase');
    });

    test('should reject password without lowercase', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'WEAKPASS123',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('lowercase');
    });

    test('should reject password without number', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'WeakPass',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('number');
    });

    test('should reject password too short', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'Pass1',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('at least 8');
    });
  });

  describe('String Validation', () => {
    test('should validate string field', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'SecurePass123',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(200);
    });

    test('should reject displayName too short', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'SecurePass123',
          displayName: 'J'
        });

      expect(res.status).toBe(400);
      expect(res.body.field).toBe('displayName');
    });

    test('should reject displayName too long', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'SecurePass123',
          displayName: 'a'.repeat(101)
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Enum Validation', () => {
    test('should validate correct enum value', async () => {
      const res = await request(app)
        .post('/lessons')
        .send({
          title: 'Leadership 101',
          content: 'This is a comprehensive lesson about leadership principles.',
          category: 'leadership'
        });

      expect(res.status).toBe(200);
    });

    test('should reject invalid enum value', async () => {
      const res = await request(app)
        .post('/lessons')
        .send({
          title: 'Leadership 101',
          content: 'This is a comprehensive lesson about leadership principles.',
          category: 'invalid'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('leadership');
    });

    test('should allow optional enum fields', async () => {
      const res = await request(app)
        .post('/lessons')
        .send({
          title: 'Leadership 101',
          content: 'This is a comprehensive lesson about leadership principles.',
          category: 'leadership'
        });

      expect(res.status).toBe(200);
    });
  });

  describe('Missing Fields', () => {
    test('should report all missing fields', async () => {
      const res = await request(app)
        .post('/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_FIELDS');
      expect(res.body.missing.length).toBe(3);
    });

    test('should report some missing fields', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.missing).toContain('password');
      expect(res.body.missing).toContain('displayName');
    });
  });

  describe('Direct Validators', () => {
    test('email validator - valid email', () => {
      expect(() => {
        validators.email('test@example.com');
      }).not.toThrow();
    });

    test('email validator - invalid email', () => {
      expect(() => {
        validators.email('invalid');
      }).toThrow();
    });

    test('password validator - valid password', () => {
      expect(() => {
        validators.password('SecurePass123');
      }).not.toThrow();
    });

    test('password validator - weak password', () => {
      expect(() => {
        validators.password('weak');
      }).toThrow();
    });

    test('string validator - valid string', () => {
      expect(() => {
        validators.string('John Doe', 'name', { minLength: 2, maxLength: 100 });
      }).not.toThrow();
    });

    test('string validator - string too short', () => {
      expect(() => {
        validators.string('J', 'name', { minLength: 2 });
      }).toThrow();
    });

    test('number validator - valid number', () => {
      expect(() => {
        validators.number(50, 'age', { min: 0, max: 100 });
      }).not.toThrow();
    });

    test('number validator - number out of range', () => {
      expect(() => {
        validators.number(150, 'age', { min: 0, max: 100 });
      }).toThrow();
    });

    test('boolean validator - valid boolean', () => {
      expect(() => {
        validators.boolean(true, 'isActive');
      }).not.toThrow();
    });

    test('boolean validator - invalid boolean', () => {
      expect(() => {
        validators.boolean('true', 'isActive');
      }).toThrow();
    });

    test('id validator - valid UUID', () => {
      expect(() => {
        validators.id('550e8400-e29b-41d4-a716-446655440000', 'id');
      }).not.toThrow();
    });

    test('id validator - valid Firebase ID', () => {
      expect(() => {
        validators.id('lesson-001-abc123', 'id');
      }).not.toThrow();
    });

    test('id validator - invalid id format', () => {
      expect(() => {
        validators.id('invalid', 'id');
      }).toThrow();
    });

    test('enum validator - valid enum', () => {
      expect(() => {
        validators.enum('active', 'status', ['active', 'inactive', 'pending']);
      }).not.toThrow();
    });

    test('enum validator - invalid enum', () => {
      expect(() => {
        validators.enum('unknown', 'status', ['active', 'inactive']);
      }).toThrow();
    });

    test('url validator - valid URL', () => {
      expect(() => {
        validators.url('https://example.com', 'website');
      }).not.toThrow();
    });

    test('url validator - invalid URL', () => {
      expect(() => {
        validators.url('example.com', 'website');
      }).toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle null values', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: null,
          password: 'SecurePass123',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(400);
    });

    test('should handle undefined values', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          password: 'SecurePass123',
          displayName: 'John Doe'
        });

      expect(res.status).toBe(400);
    });

    test('should handle empty strings', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: '',
          password: '',
          displayName: ''
        });

      expect(res.status).toBe(400);
    });

    test('should handle extra fields in request', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'SecurePass123',
          displayName: 'John Doe',
          extraField: 'should be ignored'
        });

      // Extra fields are allowed by default
      expect(res.status).toBe(200);
    });
  });

  describe('Error Messages', () => {
    test('should provide helpful error for invalid email', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'test',
          password: 'SecurePass123',
          displayName: 'John'
        });

      expect(res.body.error).toBe('Invalid email format');
    });

    test('should provide helpful error for weak password', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'user@example.com',
          password: 'weak123',
          displayName: 'John'
        });

      expect(res.body.error).toContain('uppercase');
    });

    test('should specify field in error response', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'invalid',
          password: 'SecurePass123',
          displayName: 'John'
        });

      expect(res.body.field).toBe('email');
    });
  });
});
