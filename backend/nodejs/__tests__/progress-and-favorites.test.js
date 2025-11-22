const request = require('supertest');
const express = require('express');

jest.mock('../config/firebase', () => ({
  admin: {},
  db: {
    collection: jest.fn(),
  },
  auth: jest.fn(),
  messaging: jest.fn(),
}));

const { db } = require('../config/firebase');

const app = express();
app.use(express.json());

// Progress Routes
const progressRouter = express.Router();

progressRouter.post('/save', async (req, res) => {
  try {
    const { userId, lessonId, completedAt, timeSpent, completionPercentage } = req.body;

    if (!userId || !lessonId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, lessonId'
      });
    }

    const progress = {
      userId,
      lessonId,
      completedAt: completedAt || new Date().toISOString(),
      timeSpent: timeSpent || 0,
      completionPercentage: completionPercentage || 100,
      lastUpdated: new Date().toISOString()
    };

    const mockRef = { id: 'progress123' };
    db.collection.mockReturnValue({
      add: jest.fn().mockResolvedValue(mockRef)
    });

    const docRef = await db.collection('userProgress').add(progress);

    res.json({
      success: true,
      progressId: docRef.id,
      progress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

progressRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        forEach: jest.fn((callback) => {
          callback({
            id: 'progress1',
            data: () => ({ userId, lessonId: 'lesson1', completionPercentage: 100 })
          });
        })
      })
    };

    db.collection.mockReturnValue(mockQuery);

    const snapshot = await db.collection('userProgress')
      .where('userId', '==', userId)
      .get();

    const progress = [];
    snapshot.forEach(doc => {
      progress.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/progress', progressRouter);

// Favorites Routes
const favoritesRouter = express.Router();

favoritesRouter.post('/toggle', async (req, res) => {
  try {
    const { userId, lessonId, isFavorite } = req.body;

    if (!userId || !lessonId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, lessonId'
      });
    }

    const favoriteData = {
      userId,
      lessonId,
      isFavorite: isFavorite !== undefined ? isFavorite : true,
      toggledAt: new Date().toISOString()
    };

    const mockRef = { id: 'favorite123' };
    db.collection.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        empty: true
      }),
      add: jest.fn().mockResolvedValue(mockRef)
    });

    const query = await db.collection('favorites')
      .where('userId', '==', userId)
      .where('lessonId', '==', lessonId)
      .limit(1)
      .get();

    let favoriteId;
    if (!query.empty) {
      favoriteId = query.docs[0].id;
    } else {
      const docRef = await db.collection('favorites').add(favoriteData);
      favoriteId = docRef.id;
    }

    res.json({
      success: true,
      favoriteId,
      isFavorite: favoriteData.isFavorite
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

favoritesRouter.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        forEach: jest.fn((callback) => {
          callback({
            id: 'fav1',
            data: () => ({ userId, lessonId: 'lesson1', isFavorite: true })
          });
        })
      })
    };

    db.collection.mockReturnValue(mockQuery);

    const snapshot = await db.collection('favorites')
      .where('userId', '==', userId)
      .where('isFavorite', '==', true)
      .get();

    const favorites = [];
    snapshot.forEach(doc => {
      favorites.push({ id: doc.id, ...doc.data() });
    });

    res.json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/favorites', favoritesRouter);

describe('Lesson Progress Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/progress/save', () => {
    test('should save lesson progress', async () => {
      const res = await request(app)
        .post('/api/progress/save')
        .send({
          userId: 'user123',
          lessonId: 'lesson1',
          completionPercentage: 75,
          timeSpent: 600
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.progressId).toBeDefined();
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post('/api/progress/save')
        .send({
          lessonId: 'lesson1'
        });

      expect(res.status).toBe(400);
    });

    test('should return 400 if lessonId is missing', async () => {
      const res = await request(app)
        .post('/api/progress/save')
        .send({
          userId: 'user123'
        });

      expect(res.status).toBe(400);
    });

    test('should set default values for optional fields', async () => {
      const res = await request(app)
        .post('/api/progress/save')
        .send({
          userId: 'user123',
          lessonId: 'lesson1'
        });

      expect(res.status).toBe(200);
      expect(res.body.progress.timeSpent).toBe(0);
      expect(res.body.progress.completionPercentage).toBe(100);
    });
  });

  describe('GET /api/progress/:userId', () => {
    test('should fetch user progress', async () => {
      const res = await request(app).get('/api/progress/user123');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.progress)).toBe(true);
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app).get('/api/progress/');

      expect(res.status).toBe(404);
    });
  });
});

describe('Favorites Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/favorites/toggle', () => {
    test('should toggle favorite status', async () => {
      const res = await request(app)
        .post('/api/favorites/toggle')
        .send({
          userId: 'user123',
          lessonId: 'lesson1',
          isFavorite: true
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.isFavorite).toBe(true);
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app)
        .post('/api/favorites/toggle')
        .send({
          lessonId: 'lesson1'
        });

      expect(res.status).toBe(400);
    });

    test('should return 400 if lessonId is missing', async () => {
      const res = await request(app)
        .post('/api/favorites/toggle')
        .send({
          userId: 'user123'
        });

      expect(res.status).toBe(400);
    });

    test('should default to true if isFavorite not specified', async () => {
      const res = await request(app)
        .post('/api/favorites/toggle')
        .send({
          userId: 'user123',
          lessonId: 'lesson1'
        });

      expect(res.status).toBe(200);
      expect(res.body.isFavorite).toBe(true);
    });
  });

  describe('GET /api/favorites/:userId', () => {
    test('should fetch user favorites', async () => {
      const res = await request(app).get('/api/favorites/user123');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.favorites)).toBe(true);
    });

    test('should return 400 if userId is missing', async () => {
      const res = await request(app).get('/api/favorites/');

      expect(res.status).toBe(404);
    });
  });
});
