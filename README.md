# Apex Test - Payment Processing API

A robust payment processing API designed to handle financial transactions between merchants and payment processors. Built with enterprise-grade architecture focusing on reliability, security, and scalability.

## Features

- **Transaction Management**: Complete payment transaction lifecycle
- **Merchant Management**: Merchant registration and banking integration
- **Settlement Management**: Automated settlement processing and tracking (cron jobs not completed)
- **Webhook Support**: Real-time settlement notifications with signature verification
- **Idempotency**: Prevents duplicate transaction creation
- **EMV Support**: Chip card transaction processing (not completed)
- **ISO Message Parsing**: Standard financial message format support
- **JWT Authentication**: Secure API access control (not completed)
- **Redis Caching**: High-performance data storage
- **API Documentation**: Swagger/OpenAPI 3.0 specification

## Architecture Overview

### Technology Stack

- **Database**: SQLite (dev) / MySQL (test/prod) with Sequelize ORM
- **Caching**: Redis for idempotency and session management
- **Validation**: Custom validator for request validation
- **Logging**: File logger with structured logging
- **Testing**: Jest framework with Supertest for API testing

### Design Patterns

- **TDD Pattern**: API implementations guided by generated test
- **MVC Architecture**: Clear separation of concerns
- **Middleware Pattern**: Modular request processing
- **Repository Pattern**: Database abstraction layer
- **Factory Pattern**: Model instantiation
- **Strategy Pattern**: Payment processor abstraction

## Project Structure

```
├── src/
│   ├── bin/           # Server entry point
│   ├── controllers/   # Business logic handlers
│   ├── models/        # Database models & associations
│   ├── routes/        # API route definitions
│   ├── middlewares/   # Request processing middleware
│   ├── utils/         # Helper functions & utilities
│   ├── core/          # Core business logic
│   ├── constants/     # Application constants
│   ├── logs/          # Application logs
│   ├── events/        # Logging and event handling
│   └── db/            # Database operations
├── models/            # Sequelize model definitions
├── migrations/        # Database schema migrations
├── seeders/          # Database seed data
├── config/           # Configuration files
├── test/             # Test files
└── swagger.json      # API documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Redis server (for idempotency)
- SQLite (development) or MySQL (production)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd apextest
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your_jwt_secret_here
   REDIS_URL=redis://localhost:6379
   DATABASE_URL_TEST=postgresql://user:password@localhost/prod_db
   DATABASE_URL_PROD=postgresql://user:password@localhost/prod_db
   ```

4. **Database Setup**

   ```bash
   # Create database
   npm run db:create

   # Run migrations
   npm run db:migrate

   # Seed initial data
   npx sequelize-cli db:seed:all
   ```

5. **Start Redis Server**

   ```bash
   # macOS (using Homebrew)
   brew services start redis

   # Linux
   sudo systemctl start redis

   # Windows
   redis-server
   ```

6. **Run the Application**

   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run db:create` - Create database file
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:undo` - Rollback all migrations

## API Authentication

1. **Middleware**: `authMiddleware` validates tokens
2. **Security**: crypto for hashing

### Protected Endpoints

- `GET /v1/transactions` - Fetch all transactions
- `POST /v1/transactions/initiate` - Create transaction
- `POST /v1/transactions/:id/authorize` - Authorize transaction

## Idempotency Implementation

### How It Works

1. **Request Hashing**: SHA-256 hash of request body
2. **Redis Storage**: Temporary storage with TTL (5 minutes)
3. **Conflict Detection**: Hash comparison for duplicate requests
4. **Response Caching**: Cached responses for identical requests

### Benefits

- Prevents duplicate transaction creation
- Handles network retries gracefully
- Maintains data consistency
- Improves API reliability

## Payment Processing Flow

### Transaction Lifecycle

1. **Initiation**: Parse ISO message, validate merchant, create transaction
2. **Authorization**: Process EMV data, update transaction status
3. **Settlement**: Mark for settlement processing
4. **Completion**: Final status update

### ISO Message Format

```
MTI|CardNumber|Amount|MerchantId
0200|4111111111111111|1000.00|merchant-uuid-123
```

### EMV Data Processing

- Chip card transaction data
- Authorization code generation
- Processor integration simulation

## Settlement Management

### Webhook Processing

The API provides real-time settlement notifications through secure webhook endpoints:

- **Signature Verification**: HMAC-SHA256 signature validation for webhook security
- **Rate Limiting**: Configurable rate limiting to prevent webhook abuse
- **Status Tracking**: Complete settlement lifecycle management
- **Transaction Linking**: Associates settlements with specific transactions

### Settlement Lifecycle

1. **Initiated**: Settlement request received and recorded
2. **Processing**: Settlement being processed by payment processor
3. **Completed**: Settlement successfully processed and funds transferred
4. **Failed**: Settlement failed with detailed failure reason

### Webhook Security Features

- **Signature Validation**: Each webhook must include a valid HMAC signature
- **Timestamp Verification**: Webhooks older than 5 minutes are rejected
- **Rate Limiting**: Maximum 10 webhook requests per minute per IP
- **Payload Validation**: Comprehensive validation of webhook data structure

## Testing

### Test Structure

- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Model and migration testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testNamePattern="Transaction"
```

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

## Configuration

### Database Configuration

- **Development**: SQLite with local file storage
- **Test**: MySQL with test database
- **Production**: MySQL with production database

## Deployment

### Production Considerations

1. **Environment Variables**: Secure configuration management
2. **Database**: Production-grade MySQL setup
3. **Redis**: High-availability Redis cluster
4. **Load Balancing**: Multiple server instances
5. **Monitoring**: Application performance monitoring
6. **Logging**: Centralized log aggregation
7. **Security**: HTTPS, rate limiting, CORS configuration

## Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request
5. Code review and merge

### Code Standards

- **ESLint**: Code quality enforcement
- **JSDoc**: Function documentation

## Future Enhancements

### Planned Features

- **Webhook Support**: Real-time transaction notifications
- **Multi-Currency**: International payment support
- **Analytics Dashboard**: Transaction insights and reporting
- **Mobile SDK**: Client library for mobile apps
- **Retry Mechanism**: Reliable retry mechanisms for fails transactions
- **Rate Limiting**: API usage throttling
- **Audit Logging**: Comprehensive audit trail

### Technical Improvements

- **TypeScript Migration**: Enhanced type safety
- **Microservices**: Service decomposition
- **Event Sourcing**: Transaction event history

---
