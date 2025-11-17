/**
 * User Preferences Service
 *
 * Manages user notification preferences, notification types,
 * and preferred lesson categories.
 */

const { db } = require('../config/firebase');

class PreferencesService {
  /**
   * Get user preferences
   *
   * @param {string} userId - User ID
   * @returns {Promise<object>} User preferences
   */
  async getUserPreferences(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }

      const user = userDoc.data();
      return user.preferences || {};
    } catch (error) {
      console.error('✗ Error getting user preferences:', error.message);
      throw error;
    }
  }

  /**
   * Update general preference
   *
   * @param {string} userId - User ID
   * @param {string} key - Preference key
   * @param {*} value - Preference value
   * @returns {Promise<void>}
   */
  async updatePreference(userId, key, value) {
    try {
      const validKeys = [
        'notificationsEnabled',
        'emailNotifications',
        'dailyLessonsEnabled',
        'theme'
      ];

      if (!validKeys.includes(key)) {
        throw new Error(`Invalid preference key: ${key}`);
      }

      await db.collection('users').doc(userId).update({
        [`preferences.${key}`]: value,
        updatedAt: new Date()
      });

      console.log(`✓ Updated preference "${key}" for user ${userId}`);
    } catch (error) {
      console.error('✗ Error updating preference:', error.message);
      throw error;
    }
  }

  /**
   * Update notification type preferences
   *
   * @param {string} userId - User ID
   * @param {string} type - Notification type (new-lessons, announcements, reminders)
   * @param {boolean} enabled - Whether to enable notifications for this type
   * @returns {Promise<void>}
   */
  async updateNotificationType(userId, type, enabled) {
    try {
      const validTypes = ['new-lessons', 'announcements', 'reminders', 'daily-lessons'];

      if (!validTypes.includes(type)) {
        throw new Error(`Invalid notification type: ${type}`);
      }

      await db.collection('users').doc(userId).update({
        [`preferences.notificationTypes.${type}`]: enabled,
        updatedAt: new Date()
      });

      console.log(`✓ Updated notification type "${type}" to ${enabled} for user ${userId}`);
    } catch (error) {
      console.error('✗ Error updating notification type:', error.message);
      throw error;
    }
  }

  /**
   * Update preferred lesson categories
   *
   * @param {string} userId - User ID
   * @param {array} categories - Array of category names
   * @returns {Promise<void>}
   */
  async updatePreferredCategories(userId, categories) {
    try {
      // Validate categories
      const validCategories = [
        'Leadership & Authority',
        'Integrity & Ethics',
        'Financial Stewardship',
        'Trust & Faith',
        'Serving Others',
        'Perseverance',
        'Wisdom & Discernment',
        'Community & Partnership',
        'Time & Productivity',
        'Decision Making'
      ];

      const invalidCategories = categories.filter(c => !validCategories.includes(c));
      if (invalidCategories.length > 0) {
        throw new Error(`Invalid categories: ${invalidCategories.join(', ')}`);
      }

      await db.collection('users').doc(userId).update({
        'preferences.preferredCategories': categories,
        updatedAt: new Date()
      });

      console.log(`✓ Updated preferred categories for user ${userId}`);
    } catch (error) {
      console.error('✗ Error updating preferred categories:', error.message);
      throw error;
    }
  }

  /**
   * Update daily reminder time preference
   *
   * @param {string} userId - User ID
   * @param {string} time - Time in HH:mm format (UTC)
   * @returns {Promise<void>}
   */
  async updateDailyReminderTime(userId, time) {
    try {
      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        throw new Error('Invalid time format. Use HH:mm (24-hour format)');
      }

      await db.collection('users').doc(userId).update({
        'preferences.dailyReminderTime': time,
        updatedAt: new Date()
      });

      console.log(`✓ Updated daily reminder time to ${time} for user ${userId}`);
    } catch (error) {
      console.error('✗ Error updating daily reminder time:', error.message);
      throw error;
    }
  }

  /**
   * Reset preferences to defaults
   *
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async resetPreferences(userId) {
    try {
      const defaultPreferences = {
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
      };

      await db.collection('users').doc(userId).update({
        preferences: defaultPreferences,
        updatedAt: new Date()
      });

      console.log(`✓ Reset preferences to defaults for user ${userId}`);
    } catch (error) {
      console.error('✗ Error resetting preferences:', error.message);
      throw error;
    }
  }

  /**
   * Batch update preferences
   *
   * @param {string} userId - User ID
   * @param {object} updates - Object with preference updates
   * @returns {Promise<void>}
   */
  async updatePreferences(userId, updates) {
    try {
      const updateData = {};

      // Build update object with nested keys
      for (const [key, value] of Object.entries(updates)) {
        updateData[`preferences.${key}`] = value;
      }

      updateData.updatedAt = new Date();

      await db.collection('users').doc(userId).update(updateData);

      console.log(`✓ Batch updated preferences for user ${userId}`);
    } catch (error) {
      console.error('✗ Error batch updating preferences:', error.message);
      throw error;
    }
  }

  /**
   * Get all users with specific notification preference
   *
   * @param {string} preferenceKey - Preference key to filter by
   * @param {*} value - Value to match
   * @returns {Promise<array>} Array of user IDs
   */
  async getUsersWithPreference(preferenceKey, value) {
    try {
      const snapshot = await db.collection('users')
        .where(`preferences.${preferenceKey}`, '==', value)
        .get();

      const userIds = [];
      snapshot.forEach(doc => {
        userIds.push(doc.id);
      });

      return userIds;
    } catch (error) {
      console.error('✗ Error getting users with preference:', error.message);
      throw error;
    }
  }

  /**
   * Get notification statistics by preference
   *
   * @returns {Promise<object>} Statistics object
   */
  async getPreferenceStatistics() {
    try {
      const snapshot = await db.collection('users').get();

      const stats = {
        totalUsers: 0,
        notificationsEnabled: 0,
        emailNotificationsEnabled: 0,
        dailyLessonsEnabled: 0,
        preferredCategories: {},
        notificationTypes: {
          'new-lessons': 0,
          'announcements': 0,
          'reminders': 0,
          'daily-lessons': 0
        },
        notificationTimes: {}
      };

      snapshot.forEach(doc => {
        const user = doc.data();
        const prefs = user.preferences || {};

        stats.totalUsers++;

        if (prefs.notificationsEnabled) {
          stats.notificationsEnabled++;
        }

        if (prefs.emailNotifications) {
          stats.emailNotificationsEnabled++;
        }

        if (prefs.dailyLessonsEnabled) {
          stats.dailyLessonsEnabled++;
        }

        // Count category preferences
        if (Array.isArray(prefs.preferredCategories)) {
          prefs.preferredCategories.forEach(category => {
            stats.preferredCategories[category] = (stats.preferredCategories[category] || 0) + 1;
          });
        }

        // Count notification types
        if (prefs.notificationTypes) {
          Object.entries(prefs.notificationTypes).forEach(([type, enabled]) => {
            if (enabled) {
              stats.notificationTypes[type]++;
            }
          });
        }

        // Count notification times
        if (prefs.dailyReminderTime) {
          const time = prefs.dailyReminderTime;
          stats.notificationTimes[time] = (stats.notificationTimes[time] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('✗ Error getting preference statistics:', error.message);
      throw error;
    }
  }
}

module.exports = new PreferencesService();
