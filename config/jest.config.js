module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'JS/**/*.js',
    '!JS/**/test-*.js',
    '!JS/**/debug-*.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};