module.exports = {
  testEnvironment: 'node',
  verbose: true,
  collectCoverage: tdasdrue,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  moduleFileExtensions: ['js', 'json', 'node']
};