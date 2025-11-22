const request = require('supertest');
const express = require('express');

jest.mock('../services/preferencesService', () => ({
  getUserPreferences: jest.fn(),
  updatePreference: jest.fn(),
  updateNotificationType: jest.fn(),
  updatePreferredCategories: jest.fn(),
  updateDailyReminderTime: jest.fn(),
  updatePreferences: jest.fn(),
  resetPreferences: jest.fn(),
  getPreferencesStats: jest.fn(),
}));

const preferencesService = require('../services/preferencesService');

const app = express();
app.use(express.json());

const preferencesRouter = express.Router();

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

preferencesRouter.get('/stats', async (req, res) => {
  try {
    const stats = await preferencesService.getPreferencesStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/preferences', preferencesRouter);

describe('Preferences Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/preferences', () => {
    test('should fetch user preferences', async () => {
      preferencesService.getUserPreferences.mockResolvedValue({
        userId: 'user123',
        notificationsEnabled: true,
        dailyReminder: '09:00',
        preferredCategories: ['Leadership', 'Integrity']
      });

      const res = await request(app)
        .get('/api/preferences')
        .query({ userId: 'user123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.preferences.userId).toBe('user123');
      expect(preferencesService.getUserPreferences).toHaveBeenCalledWith('user123');
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app).get('/api/preferences');

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('should handle service errors', async () => {
      preferencesService.getUserPreferences.mockRejectedValue(
        new Error('Database error')
      );

      const res = await request(app)
        .get('/api/preferences')
        .query({ userId: 'user123' });

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/preferences/update', () => {
    test('should update a single preference', async () => {
      preferencesService.updatePreference.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/preferences/update')
        .send({
          userId: 'user123',
          preference: 'notificationsEnabled',
          value: false
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(preferencesService.updatePreference).toHaveBeenCalledWith(
        'user123',
        'notificationsEnabled',
        false
      );
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post('/api/preferences/update')
        .send({
          preference: 'notificationsEnabled',
          value: false
        });

      expect(res.status).toBe(400);
    });

    test('should return 400 if preference is missing', async () => {
      const res = await request(app)
        .post('/api/preferences/update')
        .send({
          userId: 'user123',
          value: false
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/preferences/notification-type', () => {
    test('should update notification type preferences', async () => {
      preferencesService.updateNotificationType.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/preferences/notification-type')
        .send({
          userId: 'user123',
          type: 'dailyReminder',
          enabled: true
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should return 400 if enabled is not provided', async () => {
      const res = await request(app)
        .post('/api/preferences/notification-type')
        .send({
          userId: 'user123',
          type: 'dailyReminder'
        });

      expect(res.status).toBe(400);
    });

    test('should accept enabled as false', async () => {
      preferencesService.updateNotificationType.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/preferences/notification-type')
        .send({
          userId: 'user123',
          type: 'dailyReminder',
          enabled: false
        });

      expect(res.status).toBe(200);
      expect(preferencesService.updateNotificationType).toHaveBeenCalledWith(
        'user123',
        'dailyReminder',
        false
      );
    });
  });

  describe('POST /api/preferences/categories', () => {
    test('should update preferred categories', async () => {
      preferencesService.updatePreferredCategories.mockResolvedValue(undefined);

      const categories = ['Leadership', 'Integrity', 'Stewardship'];
      const res = await request(app)
        .post('/api/preferences/categories')
        .send({
          userId: 'user123',
          categories
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(preferencesService.updatePreferredCategories).toHaveBeenCalledWith(
        'user123',
        categories
      );
    });

    test('should return 400 if categories is not an array', async () => {
      const res = await request(app)
        .post('/api/preferences/categories')
        .send({
          userId: 'user123',
          categories: 'Leadership'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/preferences/daily-time', () => {
    test('should update daily reminder time', async () => {
      preferencesService.updateDailyReminderTime.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/preferences/daily-time')
        .send({
          userId: 'user123',
          time: '08:00'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should return 400 if time is missing', async () => {
      const res = await request(app)
        .post('/api/preferences/daily-time')
        .send({
          userId: 'user123'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/preferences/batch-update', () => {
    test('should batch update preferences', async () => {
      preferencesService.updatePreferences.mockResolvedValue(undefined);

      const updates = {
        notificationsEnabled: false,
        dailyReminder: '10:00'
      };

      const res = await request(app)
        .post('/api/preferences/batch-update')
        .send({
          userId: 'user123',
          updates
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(preferencesService.updatePreferences).toHaveBeenCalledWith(
        'user123',
        updates
      );
    });

    test('should return 400 if updates is not an object', async () => {
      const res = await request(app)
        .post('/api/preferences/batch-update')
        .send({
          userId: 'user123',
          updates: 'not-an-object'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/preferences/reset', () => {
    test('should reset preferences to defaults', async () => {
      preferencesService.resetPreferences.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/preferences/reset')
        .send({
          userId: 'user123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(preferencesService.resetPreferences).toHaveBeenCalledWith('user123');
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post('/api/preferences/reset')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/preferences/stats', () => {
    test('should fetch preferences stats', async () => {
      preferencesService.getPreferencesStats.mockResolvedValue({
        totalUsers: 100,
        notificationsEnabled: 85,
        preferredCategoriesCount: 5
      });

      const res = await request(app).get('/api/preferences/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats.totalUsers).toBeDefined();
    });

    test('should handle service errors', async () => {
      preferencesService.getPreferencesStats.mockRejectedValue(
        new Error('Database error')
      );

      const res = await request(app).get('/api/preferences/stats');

      expect(res.status).toBe(500);
    });
  });
});
