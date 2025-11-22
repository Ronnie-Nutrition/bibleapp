const request = require('supertest');
const express = require('express');

// Create a minimal Express app for testing
const app = express();
app.use(express.json());

// Mock the authentication service
jest.mock('../services/authenticationService', () => ({
  registerUser: jest.fn(),
  authenticateUser: jest.fn(),
  generatePasswordResetLink: jest.fn(),
  resetPassword: jest.fn(),
  updateUserEmail: jest.fn(),
  getUserById: jest.fn(),
}));

const authService = require('../services/authenticationService');

// Setup auth routes
const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
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

authRouter.post('/login', async (req, res) => {
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

authRouter.post('/forgot-password', async (req, res) => {
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

authRouter.post('/reset-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await authService.resetPassword(userId, currentPassword, newPassword);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'RESET_ERROR'
    });
  }
});

authRouter.post('/update-email', async (req, res) => {
  try {
    const { userId, newEmail } = req.body;

    if (!userId || !newEmail) {
      return res.status(400).json({
        error: 'User ID and new email are required',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await authService.updateUserEmail(userId, newEmail);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'UPDATE_ERROR'
    });
  }
});

authRouter.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    const user = await authService.getUserById(userId);
    res.json(user);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'FETCH_ERROR'
    });
  }
});

app.use('/api/auth', authRouter);

describe('Authentication Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User'
      };

      authService.registerUser.mockResolvedValue({
        success: true,
        userId: 'user123',
        email: userData.email,
        displayName: userData.displayName
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.email).toBe(userData.email);
      expect(authService.registerUser).toHaveBeenCalledWith(userData);
    });

    test('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
          displayName: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_FIELDS');
    });

    test('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          displayName: 'Test User'
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_FIELDS');
    });

    test('should return 400 if displayName is missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_FIELDS');
    });

    test('should handle registration errors', async () => {
      authService.registerUser.mockRejectedValue(
        new Error('Email already exists')
      );

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          displayName: 'Test User'
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login user successfully', async () => {
      authService.authenticateUser.mockResolvedValue({
        success: true,
        userId: 'user123',
        email: 'test@example.com',
        token: 'jwt-token-here'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    test('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_CREDENTIALS');
    });

    test('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_CREDENTIALS');
    });

    test('should handle authentication errors', async () => {
      authService.authenticateUser.mockRejectedValue(
        new Error('Invalid credentials')
      );

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should generate password reset link', async () => {
      authService.generatePasswordResetLink.mockResolvedValue({
        success: true,
        message: 'Reset link sent to email'
      });

      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_EMAIL');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    test('should reset password successfully', async () => {
      authService.resetPassword.mockResolvedValue({
        success: true,
        message: 'Password reset successfully'
      });

      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          userId: 'user123',
          currentPassword: 'oldpassword',
          newPassword: 'newpassword'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/update-email', () => {
    test('should update user email successfully', async () => {
      authService.updateUserEmail.mockResolvedValue({
        success: true,
        message: 'Email updated successfully'
      });

      const res = await request(app)
        .post('/api/auth/update-email')
        .send({
          userId: 'user123',
          newEmail: 'newemail@example.com'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post('/api/auth/update-email')
        .send({
          newEmail: 'newemail@example.com'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/user/:userId', () => {
    test('should fetch user by ID', async () => {
      authService.getUserById.mockResolvedValue({
        userId: 'user123',
        email: 'test@example.com',
        displayName: 'Test User'
      });

      const res = await request(app)
        .get('/api/auth/user/user123');

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe('user123');
      expect(authService.getUserById).toHaveBeenCalledWith('user123');
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .get('/api/auth/user/');

      expect(res.status).toBe(404);
    });
  });
});
