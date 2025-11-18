/**
 * Progress Tracking Routes
 *
 * API endpoints for tracking user progress through biblical lessons
 */

const express = require('express');
const router = express.Router();
const progressService = require('../services/progressService');

/**
 * GET /api/progress/leaderboard
 * Get leaderboard of top users by completion
 * IMPORTANT: This must come before /:userId routes to avoid conflicts
 *
 * Query params:
 * - limit: number (optional, default 10, max 100)
 *
 * Returns:
 * - 200: Leaderboard data
 * - 500: Server error
 */
router.get('/leaderboard', async (req, res) => {
  try {
    let limit = parseInt(req.query.limit) || 10;
    limit = Math.min(Math.max(limit, 1), 100); // Between 1 and 100

    const leaderboard = await progressService.getLeaderboard(limit);
    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'LEADERBOARD_ERROR'
    });
  }
});

/**
 * POST /api/progress/complete
 * Mark a lesson as complete
 *
 * Body:
 * - userId: string (required)
 * - lessonId: string (required)
 * - timeSpent: number (optional, in seconds)
 *
 * Returns:
 * - 201: Lesson marked as complete with updated stats
 * - 400: Missing required fields
 * - 404: Lesson not found
 * - 409: Lesson already completed
 * - 500: Server error
 */
router.post('/complete', async (req, res) => {
  try {
    const { userId, lessonId, timeSpent } = req.body;

    if (!userId || !lessonId) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS',
        fields: {
          userId: !userId ? 'User ID is required' : null,
          lessonId: !lessonId ? 'Lesson ID is required' : null
        }
      });
    }

    // Validate timeSpent if provided
    if (timeSpent !== undefined && timeSpent !== null) {
      if (typeof timeSpent !== 'number' || timeSpent < 0) {
        return res.status(400).json({
          error: 'timeSpent must be a positive number (seconds)',
          code: 'INVALID_TIME_SPENT'
        });
      }
    }

    const result = await progressService.completeLesson(userId, lessonId, timeSpent);
    res.status(201).json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'COMPLETION_ERROR'
    });
  }
});

/**
 * DELETE /api/progress/:userId/lesson/:lessonId
 * Uncomplete a lesson (for corrections)
 *
 * Returns:
 * - 200: Lesson unmarked as complete
 * - 404: Progress or lesson not found
 * - 500: Server error
 */
router.delete('/:userId/lesson/:lessonId', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;

    if (!userId || !lessonId) {
      return res.status(400).json({
        error: 'userId and lessonId are required',
        code: 'MISSING_PARAMS'
      });
    }

    const result = await progressService.uncompleteLesson(userId, lessonId);
    res.json(result);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      error: error.message,
      code: error.code || 'UNCOMPLETE_ERROR'
    });
  }
});

/**
 * GET /api/progress/:userId
 * Get all user progress (completed lessons)
 *
 * Returns:
 * - 200: User progress data with all completed lessons
 * - 400: Missing userId
 * - 500: Server error
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    const progress = await progressService.getUserProgress(userId);
    res.json({
      success: true,
      progress
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'FETCH_ERROR'
    });
  }
});

/**
 * GET /api/progress/:userId/stats
 * Get user statistics (streaks, completion rate, etc.)
 *
 * Returns:
 * - 200: User statistics
 * - 400: Missing userId
 * - 500: Server error
 */
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    const stats = await progressService.getUserStats(userId);
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'STATS_ERROR'
    });
  }
});

/**
 * GET /api/progress/:userId/lesson/:lessonId
 * Check if a specific lesson is completed
 *
 * Returns:
 * - 200: Completion status
 * - 400: Missing parameters
 * - 500: Server error
 */
router.get('/:userId/lesson/:lessonId', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;

    if (!userId || !lessonId) {
      return res.status(400).json({
        error: 'userId and lessonId are required',
        code: 'MISSING_PARAMS'
      });
    }

    const result = await progressService.isLessonCompleted(userId, lessonId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'CHECK_ERROR'
    });
  }
});

/**
 * GET /api/progress/:userId/range
 * Get lessons completed in a date range
 *
 * Query params:
 * - startDate: ISO date string (required)
 * - endDate: ISO date string (required)
 *
 * Returns:
 * - 200: Lessons completed in range
 * - 400: Missing or invalid parameters
 * - 500: Server error
 */
router.get('/:userId/range', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'startDate and endDate are required',
        code: 'MISSING_DATES'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use ISO date strings',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    const lessons = await progressService.getLessonsInDateRange(userId, start, end);
    res.json({
      success: true,
      count: lessons.length,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      lessons
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'RANGE_ERROR'
    });
  }
});

module.exports = router;
