# Distributed Banking Backend

A distributed banking backend built with Node.js and a microservices architecture.

The project demonstrates authentication, account management, money transfers, database transactions, asynchronous messaging, event-driven architecture, API Gateway routing, and distributed-system concepts.

---

## 1. Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- Redis
- RabbitMQ
- Apache Kafka
- JWT
- Swagger / OpenAPI
- Docker
- Docker Compose

---

## 2. Architecture

The system is divided into independent microservices.

```text
                         CLIENT
                           |
                           v
                    +--------------+
                    | API GATEWAY  |
                    |    :3000     |
                    +--------------+
                           |
              +------------+------------+
              |            |            |
              v            v            v
        +----------+  +----------+  +-------------+
        |   AUTH   |  | ACCOUNT  |  | TRANSACTION |
        |  :3001   |  |  :3002   |  |    :3003   |
        +----------+  +----------+  +-------------+
             |             |              |
             v             v              v
          MongoDB       MongoDB        MongoDB
             |
             v
           Redis


        TRANSACTION SERVICE
               |
        +------+------+
        |             |
        v             v
    RabbitMQ        Kafka
        |             |
        +------+------+
               |
               v
       NOTIFICATION SERVICE
```

---

## 3. Services

### API Gateway

The API Gateway is the main entry point for clients.

It receives incoming HTTP requests and routes them to the appropriate microservice.

#### Responsibilities

- Request routing
- CORS
- Security headers using Helmet
- Request/correlation IDs
- Swagger/OpenAPI
- Health checks
- Readiness checks

#### Port

```text
3000
```

---

### Auth Service

The Auth Service handles authentication and token management.

#### Responsibilities

- User registration
- User login
- Password handling
- JWT access tokens
- JWT refresh tokens
- Redis integration
- RabbitMQ integration
- Kafka integration

#### Port

```text
3001
```

---

### Account Service

The Account Service manages bank accounts and balances.

#### Responsibilities

- Account creation
- Account retrieval
- Account balance management
- Credit operations
- Debit operations
- MongoDB persistence

#### Port

```text
3002
```

---

### Transaction Service

The Transaction Service handles financial transactions and transfers.

#### Responsibilities

- Creating transactions
- Processing transfers
- Coordinating account operations
- Maintaining transaction records
- Publishing transaction events
- Communicating with Account Service
- Using MongoDB transactions for atomic operations

#### Port

```text
3003
```

---

### Notification Service

The Notification Service processes events asynchronously.

#### Responsibilities

- Consuming transaction events
- Processing notification-related events
- RabbitMQ consumer
- Kafka consumer

The Notification Service is not part of the synchronous money-transfer path.

---

# 4. Infrastructure

The project uses Docker Compose for its infrastructure services.

### MongoDB

Primary database used by the banking services.

```text
Port: 27017
```

### Redis

Used for caching and authentication-related data.

```text
Port: 6379
```

### RabbitMQ

Used for asynchronous messaging between services.

```text
AMQP Port: 5672
Management UI: 15672
```

RabbitMQ Management UI:

```text
http://localhost:15672
```

### Kafka

Used for transaction event streaming.

```text
Port: 9092
```

---

# 5. Service Communication

The project uses both synchronous and asynchronous communication.

## Synchronous Communication

HTTP is used when a service needs an immediate response.

Example:

```text
Client
   |
   v
API Gateway
   |
   v
Transaction Service
   |
   v
Account Service
```

For example, the Transaction Service communicates with the Account Service during a transfer.

---

## Asynchronous Communication

RabbitMQ and Kafka are used for asynchronous communication.

Example:

```text
Transaction Service
        |
        +-------------------+
        |                   |
        v                   v
    RabbitMQ              Kafka
        |                   |
        +---------+---------+
                  |
                  v
        Notification Service
```

This allows notification/event processing to happen independently of the main request.

---

# 6. MongoDB Transaction and Atomicity

Money transfers require strong consistency.

A transfer involves multiple operations:

```text
Transfer
   |
   +---- Debit source account
   |
   +---- Credit destination account
   |
   +---- Create transaction record
```

These operations must not partially succeed.

The project uses MongoDB transactions to provide atomicity.

## Successful Transfer

```text
START TRANSACTION
        |
        v
Debit source account
        |
        v
Credit destination account
        |
        v
Create transaction record
        |
        v
     COMMIT
```

## Failed Transfer

```text
START TRANSACTION
        |
        v
Debit source account
        |
        v
Credit destination account
        |
        X
      ERROR
        |
        v
     ROLLBACK
```

If an operation fails, the transaction is rolled back.

This prevents a transfer from leaving the system in a partially updated state.

---

# 7. Authentication

The Auth Service uses JWT-based authentication.

Two token types are used:

```text
Access Token
Refresh Token
```

### Access Token

The access token is short-lived and is used to authenticate API requests.

### Refresh Token

The refresh token is used to obtain a new access token after the access token expires.

Separate secrets are used for access and refresh tokens.

---

# 8. Internal Service Security

Internal banking operations are protected using an internal API key.

This prevents arbitrary external clients from directly calling protected internal endpoints.

The general architecture is:

```text
External Client
       |
       v
API Gateway
       |
       v
Internal Service
       |
       v
Internal Authentication
```

---

# 9. Request IDs

Requests are assigned a request/correlation ID.

The same request ID can be passed between services to make distributed request tracing easier.

Example:

```text
Client Request
      |
      | requestId = abc123
      v
API Gateway
      |
      | requestId = abc123
      v
Transaction Service
      |
      | requestId = abc123
      v
Account Service
```

This makes it easier to correlate logs belonging to the same request.

---

# 10. Health and Readiness

Services expose health and readiness endpoints.

## Health Check

```text
GET /health
```

The health endpoint indicates whether the service process is running.

## Readiness Check

```text
GET /ready
```

The readiness endpoint indicates whether the required dependencies are available.

For example:

```text
Transaction Service
        |
        +---- MongoDB
        |
        +---- RabbitMQ
        |
        +---- Kafka
```

If required dependencies are unavailable, the service should not be considered ready to process normal requests.

---

# 11. Security

The project includes several security measures.

### JWT Security

- Access and refresh tokens
- Separate access and refresh secrets
- Restricted JWT algorithm
- Environment-based secrets

### HTTP Security

- CORS
- Helmet security headers
- JSON request-size limits

### Internal Security

- Internal API key authentication

### Secrets

Sensitive configuration values are stored in environment variables.

Real secrets should never be committed to Git.

---

# 12. Swagger / OpenAPI

Swagger/OpenAPI is used to document the APIs.

The API documentation is available through the API Gateway.

```text
http://localhost:3000/docs
```

Swagger provides an interactive way to view and understand the available API endpoints.

---

# 13. Docker

Docker Compose is used to run the required infrastructure.

## Start Infrastructure

```bash
docker compose up -d
```

## Check Containers

```bash
docker compose ps
```

## Stop Infrastructure

```bash
docker compose down
```

---

# 14. Ports

| Component | Port |
|-----------|------|
| API Gateway | 3000 |
| Auth Service | 3001 |
| Account Service | 3002 |
| Transaction Service | 3003 |
| MongoDB | 27017 |
| Redis | 6379 |
| RabbitMQ | 5672 |
| RabbitMQ Management UI | 15672 |
| Kafka | 9092 |

---

# 15. Environment Variables

The application uses environment variables for configuration and secrets.

A `.env.example` file should be used as a template for local configuration.

Create your own `.env` file and provide the required values.

Do not commit the real `.env` file to Git.

Important configuration includes:

```text
MONGODB_URI
REDIS_URL
RABBITMQ_URL
KAFKA_BROKERS

JWT_ACCESS_SECRET
JWT_ACCESS_EXPIRES_IN

JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN

INTERNAL_API_KEY

CORS_ORIGIN
```

Each service may use a different subset of these variables.

---

# 16. Project Structure

```text
distributed-banking-backend/
|
+-- api-gateway/
|
+-- services/
|   |
|   +-- auth-service/
|   |
|   +-- account-service/
|   |
|   +-- transaction-service/
|   |
|   +-- notification-service/
|
+-- docker-compose.yml
|
+-- .env.example
|
+-- README.md
```

Each service has its own application code, configuration, routes, controllers, services, models, middleware, and messaging logic where required.

---

# 17. Running the Project

## Step 1: Clone the Repository

```bash
git clone <repository-url>
```

Move into the project:

```bash
cd distributed-banking-backend
```

---

## Step 2: Start Infrastructure

Start MongoDB, Redis, RabbitMQ, and Kafka:

```bash
docker compose up -d
```

Verify that the containers are running:

```bash
docker compose ps
```

---

## Step 3: Configure Environment Variables

Create the required `.env` files for the services.

Use `.env.example` as a reference.

Never commit real secrets.

---

## Step 4: Install Dependencies

Install dependencies for each Node.js service.

Example:

```bash
cd services/auth-service
npm install
```

Repeat this for the other services.

---

## Step 5: Start Services

Start each service using its configured npm script.

For development:

```bash
npm run dev
```

---

# 18. Example Banking Flow

A typical transfer request follows this flow:

```text
Client
   |
   v
API Gateway
   |
   v
Transaction Service
   |
   v
Account Service
   |
   v
MongoDB Transaction
   |
   +---- Debit source account
   |
   +---- Credit destination account
   |
   +---- Store transaction
   |
   v
COMMIT
   |
   v
Transaction Event
   |
   +---- RabbitMQ
   |
   +---- Kafka
   |
   v
Notification Service
```

The important distinction is that the database transaction handles the critical financial operation, while messaging is used for asynchronous event processing.

---

# 19. Failure Handling

The system is designed to distinguish between critical banking operations and asynchronous processing.

### Critical Path

```text
Transfer
   |
   v
MongoDB Transaction
   |
   +---- Debit
   +---- Credit
   +---- Transaction Record
```

Failure in this path should cause the database transaction to roll back.

### Asynchronous Path

```text
Transaction Event
       |
       +---- RabbitMQ
       |
       +---- Kafka
       |
       v
Notification Service
```

Failures in asynchronous processing should not incorrectly report a successful financial operation as failed after the database transaction has already committed.

---

# 20. Current Status

The project currently includes:

- [x] Microservices architecture
- [x] API Gateway
- [x] Auth Service
- [x] Account Service
- [x] Transaction Service
- [x] Notification Service
- [x] MongoDB
- [x] Redis
- [x] RabbitMQ
- [x] Kafka
- [x] JWT authentication
- [x] MongoDB transactions
- [x] Transaction events
- [x] Swagger/OpenAPI
- [x] Request/correlation IDs
- [x] Health endpoints
- [x] Readiness endpoints
- [x] CORS
- [x] Helmet
- [x] Request-size limits
- [x] Internal API authentication
- [x] Docker Compose

Automated testing is planned as a separate phase.

---

# 21. Future Improvements

Possible future improvements include:

- Comprehensive automated tests
- Improved Kafka reconnection handling
- Distributed tracing
- Centralized log aggregation
- Metrics and monitoring
- Dead-letter queues
- Event retry strategies
- Idempotency handling
- Rate limiting
- CI/CD pipeline
- Production deployment

---

# 22. Learning Goals

This project demonstrates practical backend and distributed-system concepts including:

- Microservices architecture
- REST APIs
- API Gateway
- Authentication
- Authorization
- JWT
- MongoDB transactions
- Database atomicity
- Redis
- RabbitMQ
- Kafka
- Event-driven architecture
- Synchronous service-to-service communication
- Asynchronous communication
- Request tracing
- Health checks
- Readiness checks
- Docker
- Security hardening
- Distributed-system failure handling

---

# License

This project is currently intended for learning and portfolio purposes.