// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Firebase
jest.mock('./services/firebase.config', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
  analytics: null,
}));

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Mock implementation that immediately calls callback with null user
    setTimeout(() => callback(null), 0);
    return jest.fn(); // unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  getAuth: jest.fn(),
}));
