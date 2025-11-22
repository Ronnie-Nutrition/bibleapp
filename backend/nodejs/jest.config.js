module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  collectCoverageFrom: [
    'server.js',
    'services/**/*.js',
    'config/**/*.js',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
};
