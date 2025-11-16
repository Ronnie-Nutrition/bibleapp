/**
 * Notification Service
 *
 * Handles sending push notifications via Firebase Cloud Messaging
 * to users via topics and direct device tokens.
 */

const { messaging, db } = require('../config/firebase');

class NotificationService {
  /**
   * Send notification to all users subscribed to a topic
   *
   * @param {string} topic - Topic name (e.g., 'lessons', 'daily-lessons')
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {object} data - Additional data to send with notification
   * @returns {Promise<string>} Message ID
   */
  async sendToTopic(topic, title, body, data = {}) {
    try {
      const message = {
        notification: {
          title,
          body
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          priority: 'high'
        },
        apns: {
          headers: {
            'apns-priority': '10'
          },
          payload: {
            aps: {
              alert: {
                title,
                body
              },
              badge: 1,
              sound: 'default',
              category: 'NOTIFICATION_ACTION'
            },
            custom_data: data
          }
        },
        webpush: {
          notification: {
            title,
            body,
            icon: 'https://example.com/icon.png'
          }
        },
        topic
      };

      const response = await messaging.send(message);
      console.log(`✓ Notification sent to topic '${topic}':`);
      console.log(`  Title: ${title}`);
      console.log(`  Message ID: ${response}`);

      // Log to Firestore
      await db.collection('notification_logs').add({
        type: 'topic',
        topic,
        title,
        body,
        data,
        messageId: response,
        sentAt: new Date(),
        status: 'sent'
      });

      return response;
    } catch (error) {
      console.error(`✗ Error sending notification to topic '${topic}':`, error.message);

      // Log error to Firestore
      await db.collection('notification_logs').add({
        type: 'topic',
        topic,
        title,
        body,
        sentAt: new Date(),
        status: 'failed',
        error: error.message
      }).catch(err => console.error('Failed to log error:', err));

      throw error;
    }
  }

  /**
   * Send notification to specific user's registered devices
   *
   * @param {string} userId - User ID
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {object} data - Additional data
   * @returns {Promise<array>} Array of message IDs
   */
  async sendToUser(userId, title, body, data = {}) {
    try {
      // Get user's FCM tokens from Firestore
      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }

      const tokens = userDoc.data()?.fcmTokens || [];

      if (tokens.length === 0) {
        console.warn(`⚠️  No FCM tokens registered for user ${userId}`);
        return [];
      }

      const message = {
        notification: { title, body },
        data: {
          ...data,
          userId,
          timestamp: new Date().toISOString()
        }
      };

      // Send to all user devices
      const promises = tokens.map(token =>
        messaging.send({
          ...message,
          token
        }).catch(error => ({
          token,
          error: error.message
        }))
      );

      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => typeof r === 'string').length;
      const failureCount = responses.filter(r => typeof r === 'object').length;

      console.log(`✓ Notifications sent to user ${userId}:`);
      console.log(`  Successful: ${successCount}`);
      if (failureCount > 0) console.log(`  Failed: ${failureCount}`);

      // Log to Firestore
      await db.collection('notification_logs').add({
        type: 'user',
        userId,
        title,
        body,
        data,
        sentAt: new Date(),
        status: 'sent',
        deviceCount: tokens.length,
        successCount
      });

      return responses;
    } catch (error) {
      console.error(`✗ Error sending notification to user ${userId}:`, error.message);

      await db.collection('notification_logs').add({
        type: 'user',
        userId,
        title,
        body,
        sentAt: new Date(),
        status: 'failed',
        error: error.message
      }).catch(err => console.error('Failed to log error:', err));

      throw error;
    }
  }

  /**
   * Subscribe FCM tokens to a topic
   *
   * @param {array} tokens - Array of FCM tokens
   * @param {string} topic - Topic name
   * @returns {Promise<void>}
   */
  async subscribeToTopic(tokens, topic) {
    try {
      if (!tokens || tokens.length === 0) {
        console.warn('⚠️  No tokens provided to subscribe');
        return;
      }

      await messaging.subscribeToTopic(tokens, topic);
      console.log(`✓ Subscribed ${tokens.length} device(s) to topic: '${topic}'`);

      // Log subscription
      await db.collection('subscriptions').add({
        tokens: tokens.slice(0, 10), // Log first 10 for privacy
        tokenCount: tokens.length,
        topic,
        subscribedAt: new Date()
      });

    } catch (error) {
      console.error(`✗ Error subscribing to topic '${topic}':`, error.message);
      throw error;
    }
  }

  /**
   * Unsubscribe FCM tokens from a topic
   *
   * @param {array} tokens - Array of FCM tokens
   * @param {string} topic - Topic name
   * @returns {Promise<void>}
   */
  async unsubscribeFromTopic(tokens, topic) {
    try {
      if (!tokens || tokens.length === 0) {
        console.warn('⚠️  No tokens provided to unsubscribe');
        return;
      }

      await messaging.unsubscribeFromTopic(tokens, topic);
      console.log(`✓ Unsubscribed ${tokens.length} device(s) from topic: '${topic}'`);
    } catch (error) {
      console.error(`✗ Error unsubscribing from topic '${topic}':`, error.message);
      throw error;
    }
  }

  /**
   * Send daily lesson notification to all users who opted in
   *
   * @param {string} lessonId - Lesson ID
   * @param {string} lessonTitle - Lesson title
   * @param {string} lessonCategory - Lesson category (optional)
   * @returns {Promise<string>} Message ID
   */
  async sendDailyLessonReminder(lessonId, lessonTitle, lessonCategory = '') {
    try {
      const title = 'New Biblical Lesson';
      const body = lessonTitle;

      // Send to topic (all subscribed users)
      const messageId = await this.sendToTopic(
        'daily-lessons',
        title,
        body,
        {
          lessonId,
          lessonTitle,
          lessonCategory,
          type: 'daily-lesson'
        }
      );

      // Log the reminder
      await db.collection('lesson_notifications').add({
        lessonId,
        lessonTitle,
        lessonCategory,
        sentAt: new Date(),
        messageId,
        type: 'daily-reminder'
      });

      console.log(`✓ Daily lesson reminder sent for: ${lessonTitle}`);
      return messageId;
    } catch (error) {
      console.error('✗ Error sending daily lesson reminder:', error.message);
      throw error;
    }
  }

  /**
   * Send batch notifications to multiple users
   *
   * @param {array} userIds - Array of user IDs
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {object} data - Additional data
   * @returns {Promise<object>} Results object with success/failure counts
   */
  async sendBatchNotification(userIds, title, body, data = {}) {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        throw new Error('userIds must be a non-empty array');
      }

      console.log(`📤 Sending batch notification to ${userIds.length} users...`);

      const results = {
        total: userIds.length,
        successful: 0,
        failed: 0,
        errors: []
      };

      // Send to each user
      for (const userId of userIds) {
        try {
          await this.sendToUser(userId, title, body, data);
          results.successful++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            userId,
            error: error.message
          });
        }
      }

      console.log(`✓ Batch notification complete:`);
      console.log(`  Successful: ${results.successful}`);
      console.log(`  Failed: ${results.failed}`);

      // Log batch to Firestore
      await db.collection('batch_notifications').add({
        title,
        body,
        data,
        recipientCount: userIds.length,
        results,
        sentAt: new Date()
      });

      return results;
    } catch (error) {
      console.error('✗ Error sending batch notification:', error.message);
      throw error;
    }
  }

  /**
   * Get notification statistics
   *
   * @returns {Promise<object>} Statistics object
   */
  async getNotificationStats() {
    try {
      const logs = await db.collection('notification_logs')
        .orderBy('sentAt', 'desc')
        .limit(100)
        .get();

      const stats = {
        total: logs.size,
        sent: 0,
        failed: 0,
        byType: {}
      };

      logs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'sent') {
          stats.sent++;
        } else {
          stats.failed++;
        }

        const type = data.type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('✗ Error getting notification stats:', error.message);
      throw error;
    }
  }

  /**
   * Save FCM token for a user
   *
   * @param {string} userId - User ID
   * @param {string} token - FCM token
   * @returns {Promise<void>}
   */
  async saveFCMToken(userId, token) {
    try {
      if (!userId || !token) {
        throw new Error('userId and token are required');
      }

      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new Error(`User ${userId} not found`);
      }

      const existingTokens = userDoc.data()?.fcmTokens || [];

      // Only add if not already present
      if (!existingTokens.includes(token)) {
        existingTokens.push(token);

        await userRef.update({
          fcmTokens: existingTokens,
          lastTokenUpdate: new Date()
        });

        console.log(`✓ FCM token saved for user ${userId}`);

        // Auto-subscribe to default topics
        await this.subscribeToTopic([token], 'lessons');
        await this.subscribeToTopic([token], 'announcements');
      }
    } catch (error) {
      console.error('✗ Error saving FCM token:', error.message);
      throw error;
    }
  }

  /**
   * Remove FCM token for a user (on logout)
   *
   * @param {string} userId - User ID
   * @param {string} token - FCM token
   * @returns {Promise<void>}
   */
  async removeFCMToken(userId, token) {
    try {
      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) return;

      const tokens = userDoc.data()?.fcmTokens || [];
      const updatedTokens = tokens.filter(t => t !== token);

      await userRef.update({
        fcmTokens: updatedTokens
      });

      console.log(`✓ FCM token removed for user ${userId}`);
    } catch (error) {
      console.error('✗ Error removing FCM token:', error.message);
      throw error;
    }
  }
}

module.exports = new NotificationService();
