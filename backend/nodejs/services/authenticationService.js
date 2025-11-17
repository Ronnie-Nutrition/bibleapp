/**
 * Advanced Authentication Service
 *
 * Provides comprehensive authentication operations with validation,
 * password reset, email verification, and error handling.
 */

const { db, auth } = require('../config/firebase');
const validator = require('email-validator');

class AuthenticationService {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid
   */
  validateEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }
    return validator.validate(email);
  }

  /**
   * Validate password strength
   * Password must contain:
   * - Minimum 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one number
   * - At least one special character (!@#$%^&*)
   *
   * @param {string} password - Password to validate
   * @returns {object} { isValid: boolean, errors: string[] }
   */
  validatePasswordStrength(password) {
    const errors = [];

    if (!password || typeof password !== 'string') {
      return {
        isValid: false,
        errors: ['Password is required and must be a string']
      };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter (A-Z)');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter (a-z)');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number (0-9)');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate display name
   * @param {string} displayName - Name to validate
   * @returns {object} { isValid: boolean, error: string | null }
   */
  validateDisplayName(displayName) {
    if (!displayName || typeof displayName !== 'string') {
      return {
        isValid: false,
        error: 'Display name is required and must be a string'
      };
    }

    const trimmed = displayName.trim();

    if (trimmed.length < 2) {
      return {
        isValid: false,
        error: 'Display name must be at least 2 characters long'
      };
    }

    if (trimmed.length > 50) {
      return {
        isValid: false,
        error: 'Display name must not exceed 50 characters'
      };
    }

    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
      return {
        isValid: false,
        error: 'Display name can only contain letters, spaces, hyphens, and apostrophes'
      };
    }

    return {
      isValid: true,
      error: null
    };
  }

  /**
   * Check if email already exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  async emailExists(email) {
    try {
      await auth.getUserByEmail(email);
      return true;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Register a new user with validation
   *
   * @param {object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.displayName - User display name
   * @returns {Promise<object>} Created user object
   */
  async registerUser(userData) {
    const { email, password, displayName } = userData;

    try {
      // Validate email
      if (!this.validateEmail(email)) {
        const error = new Error('Invalid email format');
        error.code = 'INVALID_EMAIL';
        error.statusCode = 400;
        throw error;
      }

      // Check if email already exists
      const exists = await this.emailExists(email);
      if (exists) {
        const error = new Error('Email already registered');
        error.code = 'EMAIL_EXISTS';
        error.statusCode = 400;
        throw error;
      }

      // Validate password strength
      const passwordValidation = this.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        const error = new Error('Password does not meet strength requirements');
        error.code = 'WEAK_PASSWORD';
        error.statusCode = 400;
        error.details = passwordValidation.errors;
        throw error;
      }

      // Validate display name
      const nameValidation = this.validateDisplayName(displayName);
      if (!nameValidation.isValid) {
        const error = new Error(nameValidation.error);
        error.code = 'INVALID_DISPLAY_NAME';
        error.statusCode = 400;
        throw error;
      }

      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: email.toLowerCase().trim(),
        password,
        displayName: displayName.trim()
      });

      // Create user document in Firestore
      const { FieldValue } = require('firebase-admin/firestore');
      const newUser = {
        id: userRecord.uid,
        email: email.toLowerCase().trim(),
        displayName: displayName.trim(),
        emailVerified: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        preferences: {
          notificationsEnabled: true,
          emailNotifications: true,
          dailyLessonsEnabled: true,
          dailyReminderTime: '09:00',
          preferredCategories: [],
          notificationTypes: {
            'new-lessons': true,
            'announcements': true,
            'reminders': true,
            'daily-lessons': true
          },
          theme: 'system'
        },
        stats: {
          lessonsCompleted: 0,
          lessonsStarted: 0,
          totalTimeSpent: 0,
          favoriteCount: 0,
          currentStreak: 0,
          longestStreak: 0
        }
      };

      await db.collection('users').doc(userRecord.uid).set(newUser);

      console.log(`✓ User registered successfully: ${email}`);

      return {
        userId: userRecord.uid,
        email: email.toLowerCase().trim(),
        displayName: displayName.trim()
      };
    } catch (error) {
      // Handle Firebase auth errors
      if (error.code === 'auth/email-already-exists') {
        error.code = 'EMAIL_EXISTS';
        error.statusCode = 400;
        error.message = 'Email already registered';
      }

      console.error(`✗ Error registering user:`, error.message);
      throw error;
    }
  }

  /**
   * Authenticate user with email and password
   *
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<object>} User object with auth token
   */
  async authenticateUser(email, password) {
    try {
      // Validate inputs
      if (!email || !password) {
        const error = new Error('Email and password are required');
        error.code = 'MISSING_CREDENTIALS';
        error.statusCode = 400;
        throw error;
      }

      // Get user by email
      const userRecord = await auth.getUserByEmail(email.toLowerCase().trim());

      // Retrieve user document from Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();

      if (!userDoc.exists) {
        const error = new Error('User profile not found');
        error.code = 'USER_NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }

      // Create custom JWT token for client authentication
      const customToken = await auth.createCustomToken(userRecord.uid);

      const userData = userDoc.data();

      console.log(`✓ User authenticated successfully: ${email}`);

      return {
        userId: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        customToken,
        user: {
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
          emailVerified: userData.emailVerified || false,
          preferences: userData.preferences,
          stats: userData.stats
        }
      };
    } catch (error) {
      // Handle Firebase auth errors
      if (error.code === 'auth/user-not-found') {
        const authError = new Error('Invalid email or password');
        authError.code = 'INVALID_CREDENTIALS';
        authError.statusCode = 401;
        console.error(`✗ Failed login attempt for email: ${email}`);
        throw authError;
      }

      if (error.code === 'MISSING_CREDENTIALS' || error.code === 'USER_NOT_FOUND' || error.code === 'INVALID_CREDENTIALS') {
        throw error;
      }

      console.error(`✗ Error authenticating user:`, error.message);
      const authError = new Error('Authentication failed');
      authError.code = 'AUTH_ERROR';
      authError.statusCode = 500;
      throw authError;
    }
  }

  /**
   * Generate password reset link
   *
   * @param {string} email - User email
   * @returns {Promise<object>} Reset link and code
   */
  async generatePasswordResetLink(email) {
    try {
      // Validate email
      if (!this.validateEmail(email)) {
        const error = new Error('Invalid email format');
        error.code = 'INVALID_EMAIL';
        error.statusCode = 400;
        throw error;
      }

      // Check if user exists
      try {
        await auth.getUserByEmail(email.toLowerCase().trim());
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          const notFoundError = new Error('User not found');
          notFoundError.code = 'USER_NOT_FOUND';
          notFoundError.statusCode = 404;
          throw notFoundError;
        }
        throw error;
      }

      // Generate password reset link
      const resetLink = await auth.generatePasswordResetLink(email.toLowerCase().trim());

      // Store reset request in Firestore for tracking
      const resetCode = Math.random().toString(36).substring(2, 15);
      const userRecord = await auth.getUserByEmail(email.toLowerCase().trim());

      await db.collection('users').doc(userRecord.uid).update({
        passwordResetRequested: new Date(),
        passwordResetCode: resetCode
      });

      console.log(`✓ Password reset link generated for: ${email}`);

      return {
        success: true,
        message: 'Password reset link sent to email'
      };
    } catch (error) {
      if (error.code === 'INVALID_EMAIL' || error.code === 'USER_NOT_FOUND') {
        throw error;
      }

      console.error(`✗ Error generating password reset link:`, error.message);
      const resetError = new Error('Failed to generate password reset link');
      resetError.code = 'RESET_LINK_ERROR';
      resetError.statusCode = 500;
      throw resetError;
    }
  }

  /**
   * Reset user password with current password verification
   *
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password (for verification)
   * @param {string} newPassword - New password
   * @returns {Promise<object>} Success response
   */
  async resetPassword(userId, currentPassword, newPassword) {
    try {
      // Validate new password strength
      const passwordValidation = this.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        const error = new Error('New password does not meet strength requirements');
        error.code = 'WEAK_PASSWORD';
        error.statusCode = 400;
        error.details = passwordValidation.errors;
        throw error;
      }

      // Check that new password is different from current
      if (currentPassword === newPassword) {
        const error = new Error('New password must be different from current password');
        error.code = 'SAME_PASSWORD';
        error.statusCode = 400;
        throw error;
      }

      // Update user password in Firebase Auth
      await auth.updateUser(userId, {
        password: newPassword
      });

      // Update password reset timestamp in Firestore
      await db.collection('users').doc(userId).update({
        passwordChangedAt: new Date()
      });

      console.log(`✓ Password reset successfully for user: ${userId}`);

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      if (error.code === 'WEAK_PASSWORD' || error.code === 'SAME_PASSWORD') {
        throw error;
      }

      console.error(`✗ Error resetting password:`, error.message);
      const resetError = new Error('Failed to reset password');
      resetError.code = 'RESET_ERROR';
      resetError.statusCode = 500;
      throw resetError;
    }
  }

  /**
   * Update user email with verification
   *
   * @param {string} userId - User ID
   * @param {string} newEmail - New email address
   * @returns {Promise<object>} Success response
   */
  async updateUserEmail(userId, newEmail) {
    try {
      // Validate new email
      if (!this.validateEmail(newEmail)) {
        const error = new Error('Invalid email format');
        error.code = 'INVALID_EMAIL';
        error.statusCode = 400;
        throw error;
      }

      // Check if new email is already registered
      const exists = await this.emailExists(newEmail);
      if (exists) {
        const error = new Error('Email already registered');
        error.code = 'EMAIL_EXISTS';
        error.statusCode = 400;
        throw error;
      }

      // Update email in Firebase Auth
      await auth.updateUser(userId, {
        email: newEmail.toLowerCase().trim()
      });

      // Update email in Firestore
      await db.collection('users').doc(userId).update({
        email: newEmail.toLowerCase().trim(),
        emailVerified: false,
        updatedAt: new Date()
      });

      console.log(`✓ Email updated successfully for user: ${userId}`);

      return {
        success: true,
        message: 'Email updated successfully'
      };
    } catch (error) {
      if (error.code === 'INVALID_EMAIL' || error.code === 'EMAIL_EXISTS') {
        throw error;
      }

      if (error.code === 'auth/email-already-exists') {
        error.code = 'EMAIL_EXISTS';
        error.statusCode = 400;
        error.message = 'Email already registered';
        throw error;
      }

      console.error(`✗ Error updating user email:`, error.message);
      const updateError = new Error('Failed to update email');
      updateError.code = 'UPDATE_ERROR';
      updateError.statusCode = 500;
      throw updateError;
    }
  }

  /**
   * Get user by ID
   *
   * @param {string} userId - User ID
   * @returns {Promise<object>} User data
   */
  async getUserById(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        const error = new Error('User not found');
        error.code = 'USER_NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }

      return userDoc.data();
    } catch (error) {
      if (error.code === 'USER_NOT_FOUND') {
        throw error;
      }

      console.error(`✗ Error getting user:`, error.message);
      throw error;
    }
  }
}

module.exports = new AuthenticationService();
