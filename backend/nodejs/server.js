const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// Note: In production, use environment variables for credentials
// const serviceAccount = require('./config/firebase-key.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: process.env.FIREBASE_DATABASE_URL
// });

const db = admin.firestore();
const messaging = admin.messaging();

// MARK: - Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// MARK: - Authentication Routes
const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      email,
      displayName,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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

    const userRecord = await admin.auth().getUserByEmail(email);
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
const notificationsRouter = express.Router();

notificationsRouter.post('/send', async (req, res) => {
  try {
    const { topic, title, body, data } = req.body;

    const message = {
      notification: { title, body },
      data: data || {},
      topic
    };

    const response = await messaging.send(message);
    res.json({ messageId: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

notificationsRouter.post('/send-to-device', async (req, res) => {
  try {
    const { token, title, body, data } = req.body;

    const message = {
      notification: { title, body },
      data: data || {},
      token
    };

    const response = await messaging.send(message);
    res.json({ messageId: response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/notifications', notificationsRouter);

// MARK: - Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// MARK: - Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bible App Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
