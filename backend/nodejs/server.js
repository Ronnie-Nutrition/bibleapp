const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase Admin SDK
const { admin, db, auth, messaging } = require('./config/firebase');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MARK: - Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MARK: - Authentication Routes
const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    const userRecord = await auth.createUser({
      email,
      password,
      displayName
    });

    // Create user document in Firestore
    const { FieldValue } = require('firebase-admin/firestore');
    await db.collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      email,
      displayName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      preferences: {
        notificationsEnabled: true,
        emailNotifications: true,
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
    });

    res.status(201).json({ userId: userRecord.uid, email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    const userRecord = await auth.getUserByEmail(email);
    const userDoc = await db.collection('users').doc(userRecord.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ userId: userRecord.uid, user: userDoc.data() });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.use('/api/auth', authRouter);

// MARK: - Lessons Routes
const lessonsRouter = express.Router();

lessonsRouter.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('lessons')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const lessons = [];
    snapshot.forEach(doc => {
      lessons.push({ id: doc.id, ...doc.data() });
    });

    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

lessonsRouter.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('lessons').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

lessonsRouter.get('/category/:category', async (req, res) => {
  try {
    const snapshot = await db.collection('lessons')
      .where('category', '==', req.params.category)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const lessons = [];
    snapshot.forEach(doc => {
      lessons.push({ id: doc.id, ...doc.data() });
    });

    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/lessons', lessonsRouter);

// MARK: - Push Notifications Routes
const notificationService = require('./services/notificationService');
const notificationsRouter = express.Router();

/**
 * POST /api/notifications/send-topic
 * Send notification to all users subscribed to a topic
 */
notificationsRouter.post('/send-topic', async (req, res) => {
  try {
    const { topic, title, body, data } = req.body;

    if (!topic || !title || !body) {
      return res.status(400).json({
        error: 'Missing required fields: topic, title, body'
      });
    }

    const messageId = await notificationService.sendToTopic(topic, title, body, data);
    res.json({ success: true, messageId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/send-user
 * Send notification to a specific user's registered devices
 */
notificationsRouter.post('/send-user', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        error: 'Missing required fields: userId, title, body'
      });
    }

    const responses = await notificationService.sendToUser(userId, title, body, data);
    res.json({ success: true, responses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/subscribe
 * Subscribe user's devices to a topic
 */
notificationsRouter.post('/subscribe', async (req, res) => {
  try {
    const { tokens, topic } = req.body;

    if (!tokens || !Array.isArray(tokens) || !topic) {
      return res.status(400).json({
        error: 'Missing required fields: tokens (array), topic'
      });
    }

    await notificationService.subscribeToTopic(tokens, topic);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/unsubscribe
 * Unsubscribe user's devices from a topic
 */
notificationsRouter.post('/unsubscribe', async (req, res) => {
  try {
    const { tokens, topic } = req.body;

    if (!tokens || !Array.isArray(tokens) || !topic) {
      return res.status(400).json({
        error: 'Missing required fields: tokens (array), topic'
      });
    }

    await notificationService.unsubscribeFromTopic(tokens, topic);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/send-daily-reminder
 * Send daily lesson reminder to all subscribed users
 */
notificationsRouter.post('/send-daily-reminder', async (req, res) => {
  try {
    const { lessonId, lessonTitle, lessonCategory } = req.body;

    if (!lessonId || !lessonTitle) {
      return res.status(400).json({
        error: 'Missing required fields: lessonId, lessonTitle'
      });
    }

    const messageId = await notificationService.sendDailyLessonReminder(
      lessonId,
      lessonTitle,
      lessonCategory
    );
    res.json({ success: true, messageId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/send-batch
 * Send notification to multiple users
 */
notificationsRouter.post('/send-batch', async (req, res) => {
  try {
    const { userIds, title, body, data } = req.body;

    if (!Array.isArray(userIds) || !title || !body) {
      return res.status(400).json({
        error: 'Missing required fields: userIds (array), title, body'
      });
    }

    const results = await notificationService.sendBatchNotification(
      userIds,
      title,
      body,
      data
    );
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/save-token
 * Save FCM token for a user (called from iOS app)
 */
notificationsRouter.post('/save-token', async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        error: 'Missing required fields: userId, token'
      });
    }

    await notificationService.saveFCMToken(userId, token);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/notifications/remove-token
 * Remove FCM token for a user (called on logout)
 */
notificationsRouter.post('/remove-token', async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        error: 'Missing required fields: userId, token'
      });
    }

    await notificationService.removeFCMToken(userId, token);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/notifications/stats
 * Get notification statistics
 */
notificationsRouter.get('/stats', async (req, res) => {
  try {
    const stats = await notificationService.getNotificationStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/notifications', notificationsRouter);

// MARK: - Scheduler Routes
const schedulerService = require('./services/schedulerService');
const schedulerRouter = express.Router();

/**
 * GET /api/scheduler/status
 * Get scheduler status and active jobs
 */
schedulerRouter.get('/status', (req, res) => {
  try {
    const status = schedulerService.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/scheduler/history
 * Get notification history
 */
schedulerRouter.get('/history', async (req, res) => {
  try {
    const { userId } = req.query;
    const history = await schedulerService.getNotificationHistory(userId);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/scheduler/update-time
 * Update user's preferred notification time
 */
schedulerRouter.post('/update-time', async (req, res) => {
  try {
    const { userId, time } = req.body;

    if (!userId || !time) {
      return res.status(400).json({
        error: 'Missing required fields: userId, time (HH:mm format)'
      });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({
        error: 'Invalid time format. Use HH:mm (24-hour format)'
      });
    }

    await schedulerService.updateUserNotificationTime(userId, time);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/scheduler', schedulerRouter);

// MARK: - User Preferences Routes
const preferencesService = require('./services/preferencesService');
const preferencesRouter = express.Router();

/**
 * GET /api/preferences
 * Get user preferences
 */
preferencesRouter.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    const preferences = await preferencesService.getUserPreferences(userId);
    res.json({ success: true, preferences });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/preferences/update
 * Update a single preference
 */
preferencesRouter.post('/update', async (req, res) => {
  try {
    const { userId, preference, value } = req.body;

    if (!userId || !preference) {
      return res.status(400).json({
        error: 'Missing required fields: userId, preference'
      });
    }

    await preferencesService.updatePreference(userId, preference, value);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/preferences/notification-type
 * Update notification type preferences
 */
preferencesRouter.post('/notification-type', async (req, res) => {
  try {
    const { userId, type, enabled } = req.body;

    if (!userId || !type || enabled === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: userId, type, enabled'
      });
    }

    await preferencesService.updateNotificationType(userId, type, enabled);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/preferences/categories
 * Update preferred lesson categories
 */
preferencesRouter.post('/categories', async (req, res) => {
  try {
    const { userId, categories } = req.body;

    if (!userId || !Array.isArray(categories)) {
      return res.status(400).json({
        error: 'Missing required fields: userId, categories (array)'
      });
    }

    await preferencesService.updatePreferredCategories(userId, categories);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/preferences/daily-time
 * Update daily reminder time
 */
preferencesRouter.post('/daily-time', async (req, res) => {
  try {
    const { userId, time } = req.body;

    if (!userId || !time) {
      return res.status(400).json({
        error: 'Missing required fields: userId, time (HH:mm format)'
      });
    }

    await preferencesService.updateDailyReminderTime(userId, time);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/preferences/batch-update
 * Batch update multiple preferences
 */
preferencesRouter.post('/batch-update', async (req, res) => {
  try {
    const { userId, updates } = req.body;

    if (!userId || !updates || typeof updates !== 'object') {
      return res.status(400).json({
        error: 'Missing required fields: userId, updates (object)'
      });
    }

    await preferencesService.updatePreferences(userId, updates);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/preferences/reset
 * Reset preferences to defaults
 */
preferencesRouter.post('/reset', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    await preferencesService.resetPreferences(userId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/preferences/stats
 * Get preference statistics
 */
preferencesRouter.get('/stats', async (req, res) => {
  try {
    const stats = await preferencesService.getPreferenceStatistics();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/preferences', preferencesRouter);

// MARK: - Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// MARK: - Start Server and Schedulers
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bible App Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Start schedulers
  schedulerService.startDailyLessonScheduler();

  // Optionally start personalized schedulers (requires more resources)
  // Uncomment to enable personalized notification times
  // schedulerService.startPersonalizedSchedulers();
});
