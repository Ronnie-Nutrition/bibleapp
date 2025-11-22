const request = require('supertest');
const express = require('express');

jest.mock('../services/schedulerService', () => ({
  getStatus: jest.fn(),
  getNotificationHistory: jest.fn(),
  updateUserNotificationTime: jest.fn(),
}));

const schedulerService = require('../services/schedulerService');

const app = express();
app.use(express.json());

const schedulerRouter = express.Router();

schedulerRouter.get('/status', (req, res) => {
  try {
    const status = schedulerService.getStatus();
    res.json({ success: true, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

schedulerRouter.get('/history', async (req, res) => {
  try {
    const { userId } = req.query;
    const history = await schedulerService.getNotificationHistory(userId);
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

schedulerRouter.post('/update-time', async (req, res) => {
  try {
    const { userId, time } = req.body;

    if (!userId || !time) {
      return res.status(400).json({
        error: 'Missing required fields: userId, time (HH:mm format)'
      });
    }

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

describe('Scheduler Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/scheduler/status', () => {
    test('should fetch scheduler status', (done) => {
      schedulerService.getStatus.mockReturnValue({
        isRunning: true,
        activeJobs: 5,
        lastRun: '2024-11-22T09:00:00Z'
      });

      request(app)
        .get('/api/scheduler/status')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.success).toBe(true);
          expect(res.body.status.isRunning).toBe(true);
          expect(schedulerService.getStatus).toHaveBeenCalled();
          done();
        });
    });

    test('should handle getStatus errors', (done) => {
      schedulerService.getStatus.mockImplementation(() => {
        throw new Error('Scheduler error');
      });

      request(app)
        .get('/api/scheduler/status')
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);

          expect(res.body.error).toBeDefined();
          done();
        });
    });
  });

  describe('GET /api/scheduler/history', () => {
    test('should fetch notification history for user', async () => {
      schedulerService.getNotificationHistory.mockResolvedValue([
        {
          id: 'notif1',
          lessonId: 'lesson1',
          sentAt: '2024-11-22T09:00:00Z',
          status: 'sent'
        },
        {
          id: 'notif2',
          lessonId: 'lesson2',
          sentAt: '2024-11-21T09:00:00Z',
          status: 'sent'
        }
      ]);

      const res = await request(app)
        .get('/api/scheduler/history')
        .query({ userId: 'user123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(schedulerService.getNotificationHistory).toHaveBeenCalledWith('user123');
    });

    test('should fetch notification history without userId (global)', async () => {
      schedulerService.getNotificationHistory.mockResolvedValue([
        {
          id: 'notif1',
          userId: 'user1',
          lessonId: 'lesson1',
          sentAt: '2024-11-22T09:00:00Z',
          status: 'sent'
        }
      ]);

      const res = await request(app)
        .get('/api/scheduler/history');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.history)).toBe(true);
    });

    test('should handle history fetch errors', async () => {
      schedulerService.getNotificationHistory.mockRejectedValue(
        new Error('Database error')
      );

      const res = await request(app)
        .get('/api/scheduler/history')
        .query({ userId: 'user123' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });

    test('should return empty array if no history', async () => {
      schedulerService.getNotificationHistory.mockResolvedValue([]);

      const res = await request(app)
        .get('/api/scheduler/history')
        .query({ userId: 'user123' });

      expect(res.status).toBe(200);
      expect(res.body.history.length).toBe(0);
    });
  });

  describe('POST /api/scheduler/update-time', () => {
    test('should update user notification time', async () => {
      schedulerService.updateUserNotificationTime.mockResolvedValue(undefined);

      const res = await request(app)
        .post('/api/scheduler/update-time')
        .send({
          userId: 'user123',
          time: '08:30'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(schedulerService.updateUserNotificationTime).toHaveBeenCalledWith(
        'user123',
        '08:30'
      );
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post('/api/scheduler/update-time')
        .send({
          time: '08:30'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    test('should return 400 if time is missing', async () => {
      const res = await request(app)
        .post('/api/scheduler/update-time')
        .send({
          userId: 'user123'
        });

      expect(res.status).toBe(400);
    });

    test('should validate time format - reject invalid format', async () => {
      const res = await request(app)
        .post('/api/scheduler/update-time')
        .send({
          userId: 'user123',
          time: '25:00'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid time format');
    });

    test('should validate time format - reject wrong separator', async () => {
      const res = await request(app)
        .post('/api/scheduler/update-time')
        .send({
          userId: 'user123',
          time: '08.30'
        });

      expect(res.status).toBe(400);
    });

    test('should accept valid 24-hour format times', async () => {
      const validTimes = ['00:00', '09:30', '12:00', '18:45', '23:59'];

      for (const time of validTimes) {
        schedulerService.updateUserNotificationTime.mockResolvedValue(undefined);

        const res = await request(app)
          .post('/api/scheduler/update-time')
          .send({
            userId: 'user123',
            time
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
      }
    });

    test('should handle update errors', async () => {
      schedulerService.updateUserNotificationTime.mockRejectedValue(
        new Error('User not found')
      );

      const res = await request(app)
        .post('/api/scheduler/update-time')
        .send({
          userId: 'nonexistent',
          time: '09:00'
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });
});
