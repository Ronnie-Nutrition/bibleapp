const request = require('supertest');
const express = require('express');

// Mock the firebase config module
jest.mock('../../config/firebase');

// Create test app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes after mocking
const authService = require('../../services/authenticationService');

// Setup auth routes (simplified version of server.js auth routes)
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        fields: {
          email: !email ? 'Email is required' : null,
          password: !password ? 'Password is required' : null,
          displayName: !displayName ? 'Display name is required' : null
        }
      });
    }

    const result = await authService.registerUser({ email, password, displayName });
    res.status(201).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'REGISTRATION_ERROR',
      details: error.details || undefined
    });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    }

    const result = await authService.authenticateUser(email, password);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'LOGIN_ERROR'
    });
  }
});

app.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    }

    const result = await authService.generatePasswordResetLink(email);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'RESET_ERROR'
    });
  }
});

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    const validUser = {
      email: 'test@example.com',
      password: 'Test123!@#',
      displayName: 'Test User'
    };

    test('should register user successfully', async () => {
      // Mock the service to return success
      jest.spyOn(authService, 'registerUser').mockResolvedValueOnce({
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      });

      const response = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      });
      expect(authService.registerUser).toHaveBeenCalledWith(validUser);
    });

    test('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com' }); // missing password and displayName

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        fields: {
          email: null,
          password: 'Password is required',
          displayName: 'Display name is required'
        }
      });
    });

    test('should return 400 for invalid email', async () => {
      const error = new Error('Invalid email format');
      error.code = 'INVALID_EMAIL';
      error.statusCode = 400;

      jest.spyOn(authService, 'registerUser').mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/auth/register')
        .send({ ...validUser, email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    });

    test('should return 400 for weak password', async () => {
      const error = new Error('Password does not meet strength requirements');
      error.code = 'WEAK_PASSWORD';
      error.statusCode = 400;
      error.details = ['Password must be at least 8 characters long'];

      jest.spyOn(authService, 'registerUser').mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/auth/register')
        .send({ ...validUser, password: 'weak' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Password does not meet strength requirements',
        code: 'WEAK_PASSWORD',
        details: ['Password must be at least 8 characters long']
      });
    });

    test('should return 400 for existing email', async () => {
      const error = new Error('Email already registered');
      error.code = 'EMAIL_EXISTS';
      error.statusCode = 400;

      jest.spyOn(authService, 'registerUser').mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS'
      });
    });
  });

  describe('POST /auth/login', () => {
    const validLogin = {
      email: 'test@example.com',
      password: 'Test123!@#'
    };

    test('should login user successfully', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        customToken: 'token-123',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          emailVerified: true,
          preferences: {},
          stats: {}
        }
      };

      jest.spyOn(authService, 'authenticateUser').mockResolvedValueOnce(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send(validLogin);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUser);
      expect(authService.authenticateUser).toHaveBeenCalledWith('test@example.com', 'Test123!@#');
    });

    test('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com' }); // missing password

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      });
    });

    test('should return 401 for invalid credentials', async () => {
      const error = new Error('Invalid email or password');
      error.code = 'INVALID_CREDENTIALS';
      error.statusCode = 401;

      jest.spyOn(authService, 'authenticateUser').mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/auth/login')
        .send(validLogin);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    });

    test('should return 404 for user not found', async () => {
      const error = new Error('User profile not found');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;

      jest.spyOn(authService, 'authenticateUser').mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/auth/login')
        .send(validLogin);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'User profile not found',
        code: 'USER_NOT_FOUND'
      });
    });
  });

  describe('POST /auth/forgot-password', () => {
    test('should generate password reset link successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset link sent to email'
      };

      jest.spyOn(authService, 'generatePasswordResetLink').mockResolvedValueOnce(mockResponse);

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResponse);
      expect(authService.generatePasswordResetLink).toHaveBeenCalledWith('test@example.com');
    });

    test('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/auth/forgot-password')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      });
    });

    test('should return 400 for invalid email', async () => {
      const error = new Error('Invalid email format');
      error.code = 'INVALID_EMAIL';
      error.statusCode = 400;

      jest.spyOn(authService, 'generatePasswordResetLink').mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    });

    test('should return 404 for user not found', async () => {
      const error = new Error('User not found');
      error.code = 'USER_NOT_FOUND';
      error.statusCode = 404;

      jest.spyOn(authService, 'generatePasswordResetLink').mockRejectedValueOnce(error);

      const response = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    });
  });
});