/**
 * Daily Notification Scheduler
 *
 * Automatically sends daily biblical lessons to users at their preferred time.
 * Uses node-cron for scheduling tasks.
 */

const cron = require('node-cron');
const { db } = require('../config/firebase');
const notificationService = require('./notificationService');

class SchedulerService {
  constructor() {
    this.scheduledJobs = new Map();
    this.defaultTime = '09:00'; // 9 AM UTC
  }

  /**
   * Start the daily lesson notification scheduler
   * Runs once per day at the specified time for each user
   */
  startDailyLessonScheduler() {
    console.log('📅 Starting daily lesson notification scheduler...');

    // Run every day at 9 AM UTC (for broadcast notifications)
    const broadcastJob = cron.schedule('0 9 * * *', async () => {
      await this.sendDailyLessonNotification();
    });

    this.scheduledJobs.set('daily-broadcast', broadcastJob);
    console.log('✓ Daily broadcast scheduler started (9:00 AM UTC)');

    return broadcastJob;
  }

  /**
   * Send daily lesson to all users
   * Selects a random lesson and sends to all subscribers
   */
  async sendDailyLessonNotification() {
    try {
      console.log('📬 Sending daily lesson notifications...');

      // Get random lesson
      const lesson = await this.getRandomLesson();

      if (!lesson) {
        console.warn('⚠️  No lessons found to send');
        return;
      }

      // Send to all users subscribed to daily-lessons
      const messageId = await notificationService.sendDailyLessonReminder(
        lesson.id,
        lesson.title,
        lesson.category
      );

      // Log the daily notification
      await db.collection('scheduled_notifications').add({
        type: 'daily-lesson',
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        lessonCategory: lesson.category,
        messageId,
        scheduledTime: new Date(),
        status: 'sent'
      });

      console.log(`✓ Daily lesson sent: "${lesson.title}"`);
    } catch (error) {
      console.error('✗ Error sending daily lesson notification:', error.message);

      // Log error
      await db.collection('scheduled_notifications').add({
        type: 'daily-lesson',
        scheduledTime: new Date(),
        status: 'failed',
        error: error.message
      }).catch(err => console.error('Failed to log error:', err));
    }
  }

  /**
   * Start personalized schedulers for individual users
   * Each user gets notifications at their preferred time
   *
   * Note: This is a simplified version. In production, you might use
   * a queue system like Bull for better scalability.
   */
  async startPersonalizedSchedulers() {
    try {
      console.log('⏰ Starting personalized notification schedulers...');

      const usersSnapshot = await db.collection('users')
        .where('preferences.notificationsEnabled', '==', true)
        .get();

      let scheduleCount = 0;

      usersSnapshot.forEach(doc => {
        const user = doc.data();
        const preferredTime = user.preferences?.dailyReminderTime || this.defaultTime;

        // Schedule job for this user
        this.scheduleUserDailyNotification(doc.id, user.email, preferredTime);
        scheduleCount++;
      });

      console.log(`✓ Started ${scheduleCount} personalized notification schedules`);
    } catch (error) {
      console.error('✗ Error starting personalized schedulers:', error.message);
    }
  }

  /**
   * Schedule daily notification for a specific user
   *
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @param {string} time - Preferred time in HH:mm format (UTC)
   */
  scheduleUserDailyNotification(userId, email, time = '09:00') {
    try {
      // Parse time
      const [hours, minutes] = time.split(':').map(Number);

      // Create cron expression (runs at specified time every day)
      const cronExpression = `${minutes} ${hours} * * *`;

      // Cancel existing job if it exists
      const jobKey = `user-${userId}`;
      if (this.scheduledJobs.has(jobKey)) {
        this.scheduledJobs.get(jobKey).stop();
      }

      // Create and store new job
      const job = cron.schedule(cronExpression, async () => {
        await this.sendUserDailyLesson(userId, email);
      });

      this.scheduledJobs.set(jobKey, job);
      console.log(`✓ Scheduled daily notification for ${email} at ${time} UTC`);

      return job;
    } catch (error) {
      console.error(`✗ Error scheduling user notification for ${email}:`, error.message);
      return null;
    }
  }

  /**
   * Send daily lesson to a specific user
   *
   * @param {string} userId - User ID
   * @param {string} email - User email
   */
  async sendUserDailyLesson(userId, email) {
    try {
      // Get random lesson
      const lesson = await this.getRandomLesson();

      if (!lesson) {
        console.warn(`⚠️  No lessons found for user ${email}`);
        return;
      }

      // Send to user
      await notificationService.sendToUser(
        userId,
        'Daily Biblical Lesson',
        lesson.title,
        {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonCategory: lesson.category,
          type: 'daily-lesson'
        }
      );

      // Log
      await db.collection('user_notifications').add({
        userId,
        email,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        sentAt: new Date(),
        type: 'daily-lesson',
        status: 'sent'
      });

      console.log(`✓ Sent daily lesson to ${email}: "${lesson.title}"`);
    } catch (error) {
      console.error(`✗ Error sending daily lesson to ${email}:`, error.message);
    }
  }

  /**
   * Get a random lesson from the database
   *
   * @returns {Promise<object>} Random lesson object
   */
  async getRandomLesson() {
    try {
      // Get all lessons
      const snapshot = await db.collection('lessons').get();

      if (snapshot.empty) {
        return null;
      }

      // Convert to array
      const lessons = [];
      snapshot.forEach(doc => {
        lessons.push({ id: doc.id, ...doc.data() });
      });

      // Return random lesson
      const randomIndex = Math.floor(Math.random() * lessons.length);
      return lessons[randomIndex];
    } catch (error) {
      console.error('✗ Error getting random lesson:', error.message);
      return null;
    }
  }

  /**
   * Update user notification time preference
   *
   * @param {string} userId - User ID
   * @param {string} time - Time in HH:mm format (UTC)
   * @returns {Promise<void>}
   */
  async updateUserNotificationTime(userId, time) {
    try {
      // Update Firestore
      await db.collection('users').doc(userId).update({
        'preferences.dailyReminderTime': time
      });

      // Reschedule the user's notifications
      const userDoc = await db.collection('users').doc(userId).get();
      const user = userDoc.data();

      this.scheduleUserDailyNotification(userId, user.email, time);

      console.log(`✓ Updated notification time for user ${userId} to ${time}`);
    } catch (error) {
      console.error('✗ Error updating user notification time:', error.message);
      throw error;
    }
  }

  /**
   * Stop all scheduled jobs
   */
  stopAllJobs() {
    this.scheduledJobs.forEach((job, key) => {
      job.stop();
      console.log(`✓ Stopped scheduled job: ${key}`);
    });
    this.scheduledJobs.clear();
  }

  /**
   * Stop a specific scheduled job
   *
   * @param {string} userId - User ID (for personalized jobs)
   */
  stopUserJob(userId) {
    const jobKey = `user-${userId}`;
    if (this.scheduledJobs.has(jobKey)) {
      this.scheduledJobs.get(jobKey).stop();
      this.scheduledJobs.delete(jobKey);
      console.log(`✓ Stopped scheduled job for user: ${userId}`);
    }
  }

  /**
   * Get scheduler status
   *
   * @returns {object} Status object
   */
  getStatus() {
    return {
      activeJobs: this.scheduledJobs.size,
      jobs: Array.from(this.scheduledJobs.keys()),
      defaultTime: this.defaultTime
    };
  }

  /**
   * Get notification history
   *
   * @param {string} userId - Optional user ID to filter
   * @returns {Promise<array>} Array of notifications
   */
  async getNotificationHistory(userId = null) {
    try {
      let query = db.collection('scheduled_notifications');

      if (userId) {
        query = query.where('userId', '==', userId);
      }

      const snapshot = await query
        .orderBy('scheduledTime', 'desc')
        .limit(50)
        .get();

      const history = [];
      snapshot.forEach(doc => {
        history.push({ id: doc.id, ...doc.data() });
      });

      return history;
    } catch (error) {
      console.error('✗ Error getting notification history:', error.message);
      return [];
    }
  }
}

module.exports = new SchedulerService();
