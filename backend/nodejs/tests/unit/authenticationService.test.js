// Mock the firebase config module manually
jest.mock('../../config/firebase');

const authService = require('../../services/authenticationService');
const { db, auth } = require('../../config/firebase');

describe('AuthenticationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateEmail', () => {
    test('should return true for valid email', () => {
      expect(authService.validateEmail('test@example.com')).toBe(true);
      expect(authService.validateEmail('user.name@company.co.uk')).toBe(true);
    });

    test('should return false for invalid email', () => {
      expect(authService.validateEmail('invalid-email')).toBe(false);
      expect(authService.validateEmail('test@')).toBe(false);
      expect(authService.validateEmail('@test.com')).toBe(false);
      expect(authService.validateEmail('')).toBe(false);
      expect(authService.validateEmail(null)).toBe(false);
      expect(authService.validateEmail(123)).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    test('should return valid for strong password', () => {
      const result = authService.validatePasswordStrength('Test123!@#');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return errors for weak password', () => {
      const result = authService.validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter (A-Z)');
      expect(result.errors).toContain('Password must contain at least one number (0-9)');
      expect(result.errors).toContain('Password must contain at least one special character (!@#$%^&*)');
    });

    test('should validate all password requirements', () => {
      const testCases = [
        { password: 'testpass', errors: ['uppercase', 'number', 'special'] },
        { password: 'TESTPASS', errors: ['lowercase', 'number', 'special'] },
        { password: 'TestPass', errors: ['number', 'special'] },
        { password: 'TestPass1', errors: ['special'] },
        { password: 'Test1!', errors: ['length'] }
      ];

      testCases.forEach(({ password, errors }) => {
        const result = authService.validatePasswordStrength(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    test('should handle invalid input types', () => {
      const result = authService.validatePasswordStrength(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password is required and must be a string');
    });
  });

  describe('validateDisplayName', () => {
    test('should return valid for proper display names', () => {
      const validNames = ['John Doe', 'Mary-Jane', "O'Connor", 'Jean-Paul'];
      validNames.forEach(name => {
        const result = authService.validateDisplayName(name);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    test('should return error for invalid display names', () => {
      const testCases = [
        { name: 'J', error: 'Display name must be at least 2 characters long' },
        { name: 'a'.repeat(51), error: 'Display name must not exceed 50 characters' },
        { name: 'John123', error: 'Display name can only contain letters, spaces, hyphens, and apostrophes' },
        { name: 'John@Doe', error: 'Display name can only contain letters, spaces, hyphens, and apostrophes' },
        { name: null, error: 'Display name is required and must be a string' }
      ];

      testCases.forEach(({ name, error }) => {
        const result = authService.validateDisplayName(name);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(error);
      });
    });
  });

  describe('emailExists', () => {
    test('should return true if email exists', async () => {
      auth.getUserByEmail.mockResolvedValueOnce({ uid: 'test-uid' });
      
      const exists = await authService.emailExists('existing@test.com');
      expect(exists).toBe(true);
      expect(auth.getUserByEmail).toHaveBeenCalledWith('existing@test.com');
    });

    test('should return false if email does not exist', async () => {
      const error = new Error('User not found');
      error.code = 'auth/user-not-found';
      auth.getUserByEmail.mockRejectedValueOnce(error);
      
      const exists = await authService.emailExists('nonexistent@test.com');
      expect(exists).toBe(false);
    });

    test('should throw error for other Firebase errors', async () => {
      const error = new Error('Network error');
      error.code = 'network-error';
      auth.getUserByEmail.mockRejectedValueOnce(error);
      
      await expect(authService.emailExists('test@test.com')).rejects.toThrow('Network error');
    });
  });

  describe('registerUser', () => {
    const validUserData = {
      email: 'newuser@test.com',
      password: 'Test123!@#',
      displayName: 'Test User'
    };

    beforeEach(() => {
      // Mock Firebase Admin Firestore FieldValue
      jest.mock('firebase-admin/firestore', () => ({
        FieldValue: {
          serverTimestamp: jest.fn(() => 'SERVER_TIMESTAMP')
        }
      }));
    });

    test('should successfully register a new user', async () => {
      auth.getUserByEmail.mockRejectedValueOnce({ code: 'auth/user-not-found' });
      auth.createUser.mockResolvedValueOnce({ uid: 'new-user-id' });
      
      const mockSet = jest.fn().mockResolvedValueOnce();
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ set: mockSet })
      });

      const result = await authService.registerUser(validUserData);
      
      expect(result).toEqual({
        userId: 'new-user-id',
        email: 'newuser@test.com',
        displayName: 'Test User'
      });
      
      expect(auth.createUser).toHaveBeenCalledWith({
        email: 'newuser@test.com',
        password: 'Test123!@#',
        displayName: 'Test User'
      });
      
      expect(mockSet).toHaveBeenCalled();
    });

    test('should throw error for invalid email', async () => {
      const userData = { ...validUserData, email: 'invalid-email' };
      
      await expect(authService.registerUser(userData)).rejects.toMatchObject({
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
        statusCode: 400
      });
    });

    test('should throw error for existing email', async () => {
      auth.getUserByEmail.mockResolvedValueOnce({ uid: 'existing-user' });
      
      await expect(authService.registerUser(validUserData)).rejects.toMatchObject({
        message: 'Email already registered',
        code: 'EMAIL_EXISTS',
        statusCode: 400
      });
    });

    test('should throw error for weak password', async () => {
      auth.getUserByEmail.mockRejectedValueOnce({ code: 'auth/user-not-found' });
      const userData = { ...validUserData, password: 'weak' };
      
      await expect(authService.registerUser(userData)).rejects.toMatchObject({
        message: 'Password does not meet strength requirements',
        code: 'WEAK_PASSWORD',
        statusCode: 400
      });
    });

    test('should throw error for invalid display name', async () => {
      auth.getUserByEmail.mockRejectedValueOnce({ code: 'auth/user-not-found' });
      const userData = { ...validUserData, displayName: 'J' };
      
      await expect(authService.registerUser(userData)).rejects.toMatchObject({
        message: 'Display name must be at least 2 characters long',
        code: 'INVALID_DISPLAY_NAME',
        statusCode: 400
      });
    });
  });

  describe('authenticateUser', () => {
    test('should successfully authenticate user', async () => {
      const mockUser = {
        uid: 'user-123',
        email: 'test@test.com',
        displayName: 'Test User'
      };
      
      const mockUserData = {
        id: 'user-123',
        email: 'test@test.com',
        displayName: 'Test User',
        emailVerified: true,
        preferences: { notificationsEnabled: true },
        stats: { lessonsCompleted: 5 }
      };

      auth.getUserByEmail.mockResolvedValueOnce(mockUser);
      auth.createCustomToken.mockResolvedValueOnce('custom-token');
      
      const mockGet = jest.fn().mockResolvedValueOnce({
        exists: true,
        data: () => mockUserData
      });
      
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet })
      });

      const result = await authService.authenticateUser('test@test.com', 'password');
      
      expect(result).toEqual({
        userId: 'user-123',
        email: 'test@test.com',
        displayName: 'Test User',
        customToken: 'custom-token',
        user: mockUserData
      });
    });

    test('should throw error for missing credentials', async () => {
      await expect(authService.authenticateUser('', '')).rejects.toMatchObject({
        message: 'Email and password are required',
        code: 'MISSING_CREDENTIALS',
        statusCode: 400
      });
    });

    test('should throw error for user not found', async () => {
      const error = new Error('User not found');
      error.code = 'auth/user-not-found';
      auth.getUserByEmail.mockRejectedValueOnce(error);
      
      await expect(authService.authenticateUser('test@test.com', 'password')).rejects.toMatchObject({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
        statusCode: 401
      });
    });

    test('should throw error if user profile not in Firestore', async () => {
      auth.getUserByEmail.mockResolvedValueOnce({ uid: 'user-123' });
      
      const mockGet = jest.fn().mockResolvedValueOnce({ exists: false });
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet })
      });

      await expect(authService.authenticateUser('test@test.com', 'password')).rejects.toMatchObject({
        message: 'User profile not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    });
  });

  describe('generatePasswordResetLink', () => {
    test('should generate password reset link successfully', async () => {
      auth.getUserByEmail.mockResolvedValue({ uid: 'user-123' });
      auth.generatePasswordResetLink.mockResolvedValueOnce('https://reset-link');
      
      const mockUpdate = jest.fn().mockResolvedValueOnce();
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ update: mockUpdate })
      });

      const result = await authService.generatePasswordResetLink('test@test.com');
      
      expect(result).toEqual({
        success: true,
        message: 'Password reset link sent to email'
      });
      
      expect(auth.generatePasswordResetLink).toHaveBeenCalledWith('test@test.com');
      expect(mockUpdate).toHaveBeenCalled();
    });

    test('should throw error for invalid email', async () => {
      await expect(authService.generatePasswordResetLink('invalid-email')).rejects.toMatchObject({
        message: 'Invalid email format',
        code: 'INVALID_EMAIL',
        statusCode: 400
      });
    });

    test('should throw error for non-existent user', async () => {
      const error = new Error('User not found');
      error.code = 'auth/user-not-found';
      auth.getUserByEmail.mockRejectedValueOnce(error);
      
      await expect(authService.generatePasswordResetLink('test@test.com')).rejects.toMatchObject({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully', async () => {
      auth.updateUser.mockResolvedValueOnce();
      
      const mockUpdate = jest.fn().mockResolvedValueOnce();
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ update: mockUpdate })
      });

      const result = await authService.resetPassword('user-123', 'OldPass123!', 'NewPass123!');
      
      expect(result).toEqual({
        success: true,
        message: 'Password changed successfully'
      });
      
      expect(auth.updateUser).toHaveBeenCalledWith('user-123', { password: 'NewPass123!' });
    });

    test('should throw error for weak password', async () => {
      await expect(authService.resetPassword('user-123', 'OldPass123!', 'weak'))
        .rejects.toMatchObject({
          message: 'New password does not meet strength requirements',
          code: 'WEAK_PASSWORD',
          statusCode: 400
        });
    });

    test('should throw error if new password same as current', async () => {
      await expect(authService.resetPassword('user-123', 'Pass123!', 'Pass123!'))
        .rejects.toMatchObject({
          message: 'New password must be different from current password',
          code: 'SAME_PASSWORD',
          statusCode: 400
        });
    });
  });

  describe('updateUserEmail', () => {
    test('should update email successfully', async () => {
      auth.getUserByEmail.mockRejectedValueOnce({ code: 'auth/user-not-found' });
      auth.updateUser.mockResolvedValueOnce();
      
      const mockUpdate = jest.fn().mockResolvedValueOnce();
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ update: mockUpdate })
      });

      const result = await authService.updateUserEmail('user-123', 'newemail@test.com');
      
      expect(result).toEqual({
        success: true,
        message: 'Email updated successfully'
      });
      
      expect(auth.updateUser).toHaveBeenCalledWith('user-123', { email: 'newemail@test.com' });
    });

    test('should throw error for invalid email', async () => {
      await expect(authService.updateUserEmail('user-123', 'invalid-email'))
        .rejects.toMatchObject({
          message: 'Invalid email format',
          code: 'INVALID_EMAIL',
          statusCode: 400
        });
    });

    test('should throw error if email already exists', async () => {
      auth.getUserByEmail.mockResolvedValueOnce({ uid: 'other-user' });
      
      await expect(authService.updateUserEmail('user-123', 'existing@test.com'))
        .rejects.toMatchObject({
          message: 'Email already registered',
          code: 'EMAIL_EXISTS',
          statusCode: 400
        });
    });
  });

  describe('getUserById', () => {
    test('should get user successfully', async () => {
      const mockUserData = {
        id: 'user-123',
        email: 'test@test.com',
        displayName: 'Test User'
      };
      
      const mockGet = jest.fn().mockResolvedValueOnce({
        exists: true,
        data: () => mockUserData
      });
      
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet })
      });

      const result = await authService.getUserById('user-123');
      expect(result).toEqual(mockUserData);
    });

    test('should throw error if user not found', async () => {
      const mockGet = jest.fn().mockResolvedValueOnce({ exists: false });
      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({ get: mockGet })
      });

      await expect(authService.getUserById('user-123')).rejects.toMatchObject({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        statusCode: 404
      });
    });
  });
});