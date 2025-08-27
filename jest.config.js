module.exports = {
  // Stop running tests after `n` failures
  bail: 15,

  // Test environment
  testEnvironment: "node",

  // Test file patterns
  testMatch: ["**/test/**/*.test.js", "**/__tests__/**/*.js"],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/bin/**",
    "!src/logs/**",
    "!**/node_modules/**",
  ],

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/test/setup.js"],

  // Module name mapping for mocks
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Reset modules between tests
  resetModules: true,
};
