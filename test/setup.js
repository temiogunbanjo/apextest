// Test setup file for Jest
// This file runs before each test file

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.PORT = "3001";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.REDIS_URL = "redis://localhost:6379";

// Global test utilities
global.testUtils = {
  // Mock data generators
  generateMockMerchant: (overrides = {}) => ({
    id: "merchant-uuid-123",
    name: "Test Merchant",
    email: "test@merchant.com",
    bankAccountNumber: "0123456789",
    bankName: "Test Bank",
    settlementCurrency: "NGN",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  generateMockTransaction: (overrides = {}) => ({
    id: 1,
    uniqueId: "txn-uuid-456",
    merchantId: "merchant-uuid-123",
    amount: 1000.0,
    currency: "NGN",
    cardPanMasked: "411111******1111",
    authCode: null,
    processorRef: null,
    network: null,
    acquirer: null,
    settledAt: null,
    status: "pending",
    transactionStatus: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  generateMockISOMessage: (overrides = {}) => {
    const defaults = {
      mti: "0200",
      cardNumber: "4111111111111111",
      amount: "1000.00",
      merchantId: "merchant-uuid-123",
    };

    const merged = { ...defaults, ...overrides };
    return `${merged.mti}|${merged.cardNumber}|${merged.amount}|${merged.merchantId}`;
  },

  // Mock response generators
  generateMockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    };
    return res;
  },

  generateMockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  }),

  // Validation helpers
  expectValidationError: (validationFunction, invalidInput, errorMessage) => {
    expect(() => validationFunction(invalidInput)).toThrow(errorMessage);
  },

  expectValidationSuccess: (validationFunction, validInput) => {
    expect(validationFunction(validInput)).toBe(true);
  },

  // Async test helpers
  expectAsyncSuccess: async (asyncFunction, ...args) => {
    const result = await asyncFunction(...args);
    expect(result).toBeDefined();
    return result;
  },

  expectAsyncError: async (asyncFunction, errorMessage, ...args) => {
    await expect(asyncFunction(...args)).rejects.toThrow(errorMessage);
  },
};

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock process.exit to prevent tests from exiting
process.exit = jest.fn();

// Setup test database connection (if needed)
beforeAll(async () => {
  // Any global setup can go here
  console.log("Setting up test environment...");
});

// Cleanup after all tests
afterAll(async () => {
  // Any global cleanup can go here
  console.log("Cleaning up test environment...");
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Global test timeout
jest.setTimeout(10000);
