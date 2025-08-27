# Testing Guide

This directory contains comprehensive unit and integration tests for the Apex Test payment processing API.

## Test Structure

```
test/
├── README.md                     # This file
├── setup.js                      # Test environment setup
├── validators.test.js            # Validation utility tests
├── parsers.test.js               # ISO message parsing tests
├── transactionController.test.js # Transaction logic tests
|── settlementWebhook.test.js     # Settlement webhook endpoint integration tests
└── apiEndpoints.test.js          # API endpoint integration tests
```

## Test Categories

### 1. Unit Tests

- **validators.test.js**: Tests for validation utilities

  - Card number validation (Luhn algorithm)
  - ISO message format validation
  - Required fields checking

- **parsers.test.js**: Tests for parsing utilities

  - ISO message parsing
  - Data type conversion
  - Error handling for malformed messages

- **transactionController.test.js**: Tests for business logic
  - Transaction initiation validation
  - Authorization logic
  - Status management
  - Error handling

### 2. Integration Tests

- **apiEndpoints.test.js**: Tests for complete API endpoints
  - Health check endpoints
  - Merchant endpoints
  - Transaction endpoints
  - Request validation
  - Error handling
  - CORS configuration
  - Response format consistency

## Running Tests

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Redis server running (for idempotency tests)
- Depending on the number of cores your cpu has, you can adjust the jest.config.js options to limit number of test running concurrently

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

### Running Specific Test Files

```bash
# Run only validation tests
npm test -- validators.test.js

# Run only parser tests
npm test -- parsers.test.js

# Run only transaction controller tests
npm test -- transaction-controller.test.js

# Run only API endpoint tests
npm test -- api-endpoints.test.js
```

### Running Specific Test Suites

```bash
# Run only card number validation tests
npm test -- --testNamePattern="isValidCardNumber"

# Run only ISO message parsing tests
npm test -- --testNamePattern="parseIsoMessage"

# Run only transaction initiation tests
npm test -- --testNamePattern="Transaction Initiation"
```

## Test Configuration

### Jest Configuration

The project uses Jest as the testing framework with the following configuration:

- **Environment**: Node.js
- **Coverage**: Enabled with HTML, LCOV, and text reports
- **Timeout**: 10 seconds per test
- **Mocking**: Automatic mock clearing and restoration
- **Setup**: Global test utilities and environment variables

### Test Setup

The `setup.js` file provides:

- Environment variable configuration
- Global test utilities
- Mock data generators
- Console method mocking
- Test lifecycle hooks

### Global Test Utilities

```javascript
// Available in all test files
global.testUtils = {
  generateMockMerchant(),      // Generate mock merchant data
  generateMockTransaction(),   // Generate mock transaction data
  generateMockISOMessage(),    // Generate mock ISO messages
  generateMockResponse(),      // Generate mock Express response
  generateMockRequest(),       // Generate mock Express request
  expectValidationError(),     // Helper for validation error tests
  expectValidationSuccess(),   // Helper for validation success tests
  expectAsyncSuccess(),        // Helper for async success tests
  expectAsyncError()           // Helper for async error tests
};
```

## Writing Tests

### Test Naming Convention

- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Use `test()` or `it()` for individual test cases

### Example Test Structure

```javascript
describe("Feature Name", () => {
  describe("Specific Functionality", () => {
    test("should handle valid input correctly", () => {
      // Arrange
      const input = "valid input";

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expectedValue);
    });

    test("should handle invalid input gracefully", () => {
      // Arrange
      const input = "invalid input";

      // Act & Assert
      expect(() => functionUnderTest(input)).toThrow(Error);
    });
  });
});
```

### Mocking Guidelines

- Mock external dependencies (databases, APIs, file system)
- Use Jest's built-in mocking capabilities
- Clear mocks between tests for isolation
- Provide realistic mock data and responses

### Assertion Best Practices

- Test one behavior per test case
- Use specific assertions (e.g., `toBe()` vs `toBeTruthy()`)
- Test both success and failure scenarios
- Verify error messages and status codes
- Test edge cases and boundary conditions

## Coverage Reports

### Coverage Types

- **Statements**: Percentage of statements executed
- **Branches**: Percentage of conditional branches executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

### Coverage Goals

- **Minimum**: 80% overall coverage
- **Target**: 90% overall coverage
- **Critical Paths**: 100% coverage for payment processing logic

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

## Continuous Integration

### Pre-commit Hooks

- Run tests before committing code
- Ensure minimum coverage thresholds are met
- Validate code quality with ESLint

### CI/CD Pipeline

- Automated test execution on pull requests
- Coverage reporting and trending
- Test result notifications

## Troubleshooting

### Common Issues

1. **Redis Connection Errors**

   - Ensure Redis server is running
   - Check Redis connection configuration
   - Verify network connectivity

2. **Database Connection Issues**

   - Check database configuration
   - Ensure test database exists
   - Verify connection credentials

3. **Mock Failures**

   - Clear mocks between tests
   - Check mock implementation
   - Verify import paths

4. **Timeout Errors**
   - Increase Jest timeout if needed
   - Check for infinite loops
   - Verify async/await usage

### Debug Mode

```bash
# Run tests with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test with debugging
npm test -- --verbose --detectOpenHandles
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Test names should explain the scenario
3. **Arrange-Act-Assert**: Structure tests in three clear sections
4. **Mock External Dependencies**: Don't test external services
5. **Test Edge Cases**: Include boundary conditions and error scenarios
6. **Maintain Test Data**: Keep test data realistic and up-to-date
7. **Regular Maintenance**: Update tests when code changes

## Contributing

When adding new features or modifying existing code:

1. Write tests for new functionality
2. Ensure existing tests still pass
3. Maintain or improve coverage percentages
4. Follow the established testing patterns
5. Document any new test utilities or patterns

---

For questions about testing, contact the development team or create an issue in the repository.
