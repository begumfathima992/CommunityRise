export default {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup/env.cjs'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  transform: {},
  testTimeout: 30000,
  watchman: false,
};
