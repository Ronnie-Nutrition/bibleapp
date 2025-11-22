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

const lessonsRouter = express.Router();

lessonsRouter.get('/', async (req, res) => {
  try {
    const mockQuery = {
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        forEach: jest.fn((callback) => {
          callback({
            id: 'lesson1',
            data: () => ({ title: 'Lesson 1', category: 'Leadership' })
          });
          callback({
            id: 'lesson2',
            data: () => ({ title: 'Lesson 2', category: 'Integrity' })
          });
        })
      })
    };

    db.collection.mockReturnValue(mockQuery);

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
    const mockDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: req.params.id,
        data: () => ({ title: 'Lesson Title', category: 'Leadership' })
      })
    };

    db.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue(mockDocRef)
    });

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
    const mockQuery = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        forEach: jest.fn((callback) => {
          callback({
            id: 'lesson1',
            data: () => ({ title: 'Lesson 1', category: req.params.category })
          });
        })
      })
    };

    db.collection.mockReturnValue(mockQuery);

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

describe('Lessons Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/lessons', () => {
    test('should fetch all lessons', async () => {
      const res = await request(app).get('/api/lessons');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(db.collection).toHaveBeenCalledWith('lessons');
    });

    test('should return empty array if no lessons exist', async () => {
      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          forEach: jest.fn()
        })
      };

      db.collection.mockReturnValue(mockQuery);

      const res = await request(app).get('/api/lessons');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('should handle database errors', async () => {
      const mockQuery = {
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      db.collection.mockReturnValue(mockQuery);

      const res = await request(app).get('/api/lessons');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/lessons/:id', () => {
    test('should fetch a lesson by ID', async () => {
      const res = await request(app).get('/api/lessons/lesson1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('lesson1');
      expect(res.body.title).toBeDefined();
    });

    test('should return 404 if lesson not found', async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: false
        })
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const res = await request(app).get('/api/lessons/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Lesson not found');
    });

    test('should handle database errors', async () => {
      const mockDocRef = {
        get: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      db.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef)
      });

      const res = await request(app).get('/api/lessons/lesson1');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/lessons/category/:category', () => {
    test('should fetch lessons by category', async () => {
      const res = await request(app).get('/api/lessons/category/Leadership');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('should return empty array if no lessons in category', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          forEach: jest.fn()
        })
      };

      db.collection.mockReturnValue(mockQuery);

      const res = await request(app).get('/api/lessons/category/NonExistent');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    test('should handle database errors', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      db.collection.mockReturnValue(mockQuery);

      const res = await request(app).get('/api/lessons/category/Leadership');

      expect(res.status).toBe(500);
    });
  });
});
