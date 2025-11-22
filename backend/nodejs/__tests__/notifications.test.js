const request = require('supertest');
const express = require('express');

jest.mock('../services/notificationService', () => ({
  sendToTopic: jest.fn(),
  sendToUser: jest.fn(),
  sendBatchNotification: jest.fn(),
  subscribeToTopic: jest.fn(),
  unsubscribeFromTopic: jest.fn(),
  sendDailyLessonReminder: jest.fn(),
  saveFCMToken: jest.fn(),
  removeFCMToken: jest.fn(),
  getNotificationStats: jest.fn(),
}));

const notificationService = require('../services/notificationService');

const app = express();
app.use(express.json());

const notificationsRouter = express.Router();

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

notificationsRouter.get('/stats', async (req, res) => {
  try {
    const stats = await notificationService.getNotificationStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/notifications', notificationsRouter);

describe('Notifications Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/notifications/send-topic', () => {
    test('should send notification to topic', async () => {
      notificationService.sendToTopic.mockResolvedValue('msg123');

      const res = await request(app)
        .post('/api/notifications/send-topic')
        .send({
          topic: 'daily-lessons',
          title: 'New Lesson',
          body: 'Check out today\'s lesson'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.messageId).toBe('msg123');
    });

    test('should return 400 if topic is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/send-topic')
        .send({
          title: 'New Lesson',
          body: 'Check out today\'s lesson'
        });

      expect(res.status).toBe(400);
    });

    test('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/send-topic')
        .send({
          topic: 'daily-lessons',
          body: 'Check out today\'s lesson'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/notifications/send-user', () => {
    test('should send notification to user', async () => {
      notificationService.sendToUser.mockResolvedValue(['msg123']);

      const res = await request(app)
        .post('/api/notifications/send-user')
        .send({
          userId: 'user123',
          title: 'New Lesson',
          body: 'Check out today\'s lesson'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.responses)).toBe(true);
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/send-user')
        .send({
          title: 'New Lesson',
          body: 'Check out today\'s lesson'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/notifications/subscribe', () => {
    test('should subscribe tokens to topic', async () => {
      notificationService.subscribeToTopic.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/notifications/subscribe')
        .send({
          tokens: ['token1', 'token2'],
          topic: 'daily-lessons'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(notificationService.subscribeToTopic).toHaveBeenCalledWith(
        ['token1', 'token2'],
        'daily-lessons'
      );
    });

    test('should return 400 if tokens is not an array', async () => {
      const res = await request(app)
        .post('/api/notifications/subscribe')
        .send({
          tokens: 'token1',
          topic: 'daily-lessons'
        });

      expect(res.status).toBe(400);
    });

    test('should return 400 if topic is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/subscribe')
        .send({
          tokens: ['token1', 'token2']
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/notifications/unsubscribe', () => {
    test('should unsubscribe tokens from topic', async () => {
      notificationService.unsubscribeFromTopic.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/notifications/unsubscribe')
        .send({
          tokens: ['token1', 'token2'],
          topic: 'daily-lessons'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/notifications/save-token', () => {
    test('should save FCM token', async () => {
      notificationService.saveFCMToken.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/notifications/save-token')
        .send({
          userId: 'user123',
          token: 'fcm_token_here'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(notificationService.saveFCMToken).toHaveBeenCalledWith(
        'user123',
        'fcm_token_here'
      );
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/save-token')
        .send({
          token: 'fcm_token_here'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/notifications/remove-token', () => {
    test('should remove FCM token', async () => {
      notificationService.removeFCMToken.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/notifications/remove-token')
        .send({
          userId: 'user123',
          token: 'fcm_token_here'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/notifications/send-batch', () => {
    test('should send batch notifications', async () => {
      notificationService.sendBatchNotification.mockResolvedValue(['msg1', 'msg2']);

      const res = await request(app)
        .post('/api/notifications/send-batch')
        .send({
          userIds: ['user1', 'user2'],
          title: 'Update',
          body: 'New lesson available'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.results)).toBe(true);
    });

    test('should return 400 if userIds is not an array', async () => {
      const res = await request(app)
        .post('/api/notifications/send-batch')
        .send({
          userIds: 'user1',
          title: 'Update',
          body: 'New lesson available'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/notifications/stats', () => {
    test('should fetch notification stats', async () => {
      notificationService.getNotificationStats.mockResolvedValue({
        totalSent: 1000,
        todaySent: 50,
        failedDeliveries: 5
      });

      const res = await request(app).get('/api/notifications/stats');

      expect(res.status).toBe(200);
      expect(res.body.totalSent).toBeDefined();
      expect(notificationService.getNotificationStats).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      notificationService.getNotificationStats.mockRejectedValue(
        new Error('Database error')
      );

      const res = await request(app).get('/api/notifications/stats');

      expect(res.status).toBe(500);
    });
  });
});
