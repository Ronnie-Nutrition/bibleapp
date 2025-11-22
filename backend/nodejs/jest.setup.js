// Mock Firebase Admin SDK before any tests run
jest.mock('./config/firebase', () => ({
  admin: {
    auth: jest.fn(),
    firestore: jest.fn(),
  },
  db: {
    collection: jest.fn(),
  },
  auth: jest.fn(),
  messaging: jest.fn(),
}));

// Suppress console errors during tests if needed
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
