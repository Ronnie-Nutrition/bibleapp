/**
 * Progress Tracking Service
 *
 * Tracks user progress through biblical lessons including:
 * - Completed lessons
 * - Daily streaks
 * - Completion statistics
 * - Time spent learning
 */

const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin').firestore;

class ProgressService {
  constructor() {
    this.progressCollection = 'user_progress';
    this.lessonsCollection = 'lessons';
  }

  /**
   * Mark a lesson as complete
   *
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @param {number} timeSpent - Time spent in seconds (optional)
   * @returns {Promise<Object>} Completion result with updated stats
   */
  async completeLesson(userId, lessonId, timeSpent = null) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    if (!userId || !lessonId) {
      throw new Error('userId and lessonId are required');
    }

    try {
      // Check if lesson exists
      const lessonDoc = await db.collection(this.lessonsCollection).doc(lessonId).get();
      if (!lessonDoc.exists) {
        const error = new Error('Lesson not found');
        error.statusCode = 404;
        throw error;
      }

      const lessonData = lessonDoc.data();

      // Get or create user progress document
      const progressRef = db.collection(this.progressCollection).doc(userId);
      const progressDoc = await progressRef.get();

      const now = new Date();
      const completionData = {
        lessonId,
        completedAt: now.toISOString(),
        lessonTitle: lessonData.title || 'Untitled',
        lessonCategory: lessonData.category || 'general',
        timeSpent: timeSpent || null
      };

      if (!progressDoc.exists) {
        // Create new progress document
        await progressRef.set({
          userId,
          completedLessons: [completionData],
          totalCompleted: 1,
          totalTimeSpent: timeSpent || 0,
          lastActivityAt: now.toISOString(),
          createdAt: now.toISOString(),
          currentStreak: 1,
          longestStreak: 1,
          lastStreakDate: now.toISOString()
        });
      } else {
        const progressData = progressDoc.data();
        const completedLessons = progressData.completedLessons || [];

        // Check if already completed
        const alreadyCompleted = completedLessons.some(
          lesson => lesson.lessonId === lessonId
        );

        if (alreadyCompleted) {
          const error = new Error('Lesson already completed');
          error.statusCode = 409;
          throw error;
        }

        // Calculate streak
        const streakData = this.calculateStreak(progressData.lastStreakDate, now);

        let newStreak = progressData.currentStreak || 0;
        if (streakData.currentStreak === 'increment') {
          newStreak = (progressData.currentStreak || 0) + 1;
        } else if (streakData.currentStreak !== null) {
          newStreak = streakData.currentStreak;
        }

        // Update progress
        await progressRef.update({
          completedLessons: FieldValue.arrayUnion(completionData),
          totalCompleted: FieldValue.increment(1),
          totalTimeSpent: FieldValue.increment(timeSpent || 0),
          lastActivityAt: now.toISOString(),
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, progressData.longestStreak || 0),
          lastStreakDate: now.toISOString()
        });
      }

      // Get updated stats
      const stats = await this.getUserStats(userId);

      return {
        success: true,
        message: 'Lesson marked as complete',
        lessonId,
        completedAt: now.toISOString(),
        stats
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Calculate streak based on last activity
   *
   * @param {string} lastStreakDate - Last streak date ISO string
   * @param {Date} currentDate - Current date
   * @returns {Object} Streak data
   */
  calculateStreak(lastStreakDate, currentDate) {
    if (!lastStreakDate) {
      return { currentStreak: 1 };
    }

    const lastDate = new Date(lastStreakDate);
    const diffTime = currentDate - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day - maintain current streak
      return { currentStreak: null }; // Will use existing value
    } else if (diffDays === 1) {
      // Consecutive day - increment streak
      return { currentStreak: 'increment' };
    } else {
      // Streak broken - reset to 1
      return { currentStreak: 1 };
    }
  }

  /**
   * Uncomplete a lesson (for corrections)
   *
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Result
   */
  async uncompleteLesson(userId, lessonId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const progressRef = db.collection(this.progressCollection).doc(userId);
    const progressDoc = await progressRef.get();

    if (!progressDoc.exists) {
      const error = new Error('No progress found for user');
      error.statusCode = 404;
      throw error;
    }

    const progressData = progressDoc.data();
    const completedLessons = progressData.completedLessons || [];

    const lessonIndex = completedLessons.findIndex(
      lesson => lesson.lessonId === lessonId
    );

    if (lessonIndex === -1) {
      const error = new Error('Lesson not found in completed lessons');
      error.statusCode = 404;
      throw error;
    }

    const removedLesson = completedLessons[lessonIndex];
    completedLessons.splice(lessonIndex, 1);

    await progressRef.update({
      completedLessons,
      totalCompleted: FieldValue.increment(-1),
      totalTimeSpent: FieldValue.increment(-(removedLesson.timeSpent || 0))
    });

    return {
      success: true,
      message: 'Lesson unmarked as complete',
      lessonId
    };
  }

  /**
   * Get all user progress
   *
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User progress data
   */
  async getUserProgress(userId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const progressDoc = await db.collection(this.progressCollection).doc(userId).get();

    if (!progressDoc.exists) {
      return {
        userId,
        completedLessons: [],
        totalCompleted: 0,
        totalTimeSpent: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActivityAt: null
      };
    }

    return {
      userId,
      ...progressDoc.data()
    };
  }

  /**
   * Get user statistics
   *
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats(userId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const progressDoc = await db.collection(this.progressCollection).doc(userId).get();

    if (!progressDoc.exists) {
      return {
        totalCompleted: 0,
        totalTimeSpent: 0,
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0,
        categoriesStudied: [],
        averageTimePerLesson: 0,
        lastActivityAt: null,
        thisWeek: 0,
        thisMonth: 0
      };
    }

    const progressData = progressDoc.data();
    const completedLessons = progressData.completedLessons || [];

    // Get total available lessons
    const lessonsSnapshot = await db.collection(this.lessonsCollection).get();
    const totalLessons = lessonsSnapshot.size;

    // Calculate category breakdown
    const categoryMap = new Map();
    completedLessons.forEach(lesson => {
      const category = lesson.lessonCategory || 'general';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });

    const categoriesStudied = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count
    }));

    // Calculate time-based stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = completedLessons.filter(
      lesson => new Date(lesson.completedAt) >= oneWeekAgo
    ).length;

    const thisMonth = completedLessons.filter(
      lesson => new Date(lesson.completedAt) >= oneMonthAgo
    ).length;

    const averageTimePerLesson = progressData.totalCompleted > 0
      ? Math.round(progressData.totalTimeSpent / progressData.totalCompleted)
      : 0;

    return {
      totalCompleted: progressData.totalCompleted || 0,
      totalTimeSpent: progressData.totalTimeSpent || 0,
      currentStreak: progressData.currentStreak || 0,
      longestStreak: progressData.longestStreak || 0,
      completionRate: totalLessons > 0
        ? Math.round((progressData.totalCompleted / totalLessons) * 100)
        : 0,
      categoriesStudied,
      averageTimePerLesson,
      lastActivityAt: progressData.lastActivityAt,
      thisWeek,
      thisMonth
    };
  }

  /**
   * Check if a specific lesson is completed
   *
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} Completion status
   */
  async isLessonCompleted(userId, lessonId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const progressDoc = await db.collection(this.progressCollection).doc(userId).get();

    if (!progressDoc.exists) {
      return {
        completed: false,
        lessonId,
        userId
      };
    }

    const progressData = progressDoc.data();
    const completedLessons = progressData.completedLessons || [];

    const completedLesson = completedLessons.find(
      lesson => lesson.lessonId === lessonId
    );

    return {
      completed: !!completedLesson,
      lessonId,
      userId,
      completedAt: completedLesson?.completedAt || null,
      timeSpent: completedLesson?.timeSpent || null
    };
  }

  /**
   * Get lessons completed in a date range
   *
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Completed lessons in range
   */
  async getLessonsInDateRange(userId, startDate, endDate) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const progressDoc = await db.collection(this.progressCollection).doc(userId).get();

    if (!progressDoc.exists) {
      return [];
    }

    const progressData = progressDoc.data();
    const completedLessons = progressData.completedLessons || [];

    return completedLessons.filter(lesson => {
      const completedDate = new Date(lesson.completedAt);
      return completedDate >= startDate && completedDate <= endDate;
    });
  }

  /**
   * Get leaderboard (top users by completion)
   *
   * @param {number} limit - Number of users to return
   * @returns {Promise<Array>} Top users
   */
  async getLeaderboard(limit = 10) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const snapshot = await db.collection(this.progressCollection)
      .orderBy('totalCompleted', 'desc')
      .limit(limit)
      .get();

    const leaderboard = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      leaderboard.push({
        userId: doc.id,
        totalCompleted: data.totalCompleted || 0,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0
      });
    });

    return leaderboard;
  }
}

module.exports = new ProgressService();
