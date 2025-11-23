// Mock Firebase configuration for testing

const mockAuth = {
  verifyIdToken: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  getUser: jest.fn(),
  getUserByEmail: jest.fn(),
  generatePasswordResetLink: jest.fn(),
  createCustomToken: jest.fn()
};

const mockFirestore = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    })),
    where: jest.fn(() => ({
      get: jest.fn()
    })),
    orderBy: jest.fn(() => ({
      limit: jest.fn(() => ({
        get: jest.fn()
      }))
    }))
  })),
  batch: jest.fn(() => ({
    set: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    commit: jest.fn()
  }))
};

const mockMessaging = {
  send: jest.fn(),
  sendMulticast: jest.fn()
};

const mockStorage = {
  bucket: jest.fn(() => ({
    file: jest.fn(() => ({
      save: jest.fn(),
      download: jest.fn(),
      delete: jest.fn()
    }))
  }))
};

module.exports = {
  admin: {
    apps: [],
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn()
    },
    auth: () => mockAuth,
    firestore: () => mockFirestore,
    messaging: () => mockMessaging,
    storage: () => mockStorage
  },
  db: mockFirestore,
  auth: mockAuth,
  messaging: mockMessaging,
  storage: mockStorage
};