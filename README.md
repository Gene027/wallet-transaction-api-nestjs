# Wallet & Transactions API

A lightweight backend API for wallet and transaction management that merchants can integrate with.

## Features

- Customer management with wallet balances
- Credit and debit transactions
- Transaction idempotency
- Balance validation (prevents negative balances)
- Transaction history tracking

## Architecture

This project uses a clean, simple architecture:

```
src/
├── entities/              # Shared TypeORM entities
│   ├── customer.entity.ts
│   ├── transaction.entity.ts
│   └── base.entity.ts
├── migrations/            # Database migrations
├── data-source.ts         # TypeORM CLI configuration
└── app.module.ts          # Database connection configured here

libs/
├── customer/              # Customer business logic
└── transaction/           # Transaction business logic
```

### Why This Structure?

- **Simple**: Database connection in app.module, entities shared across all modules
- **Scalable**: Feature modules (customer, transaction) handle business logic
- **Clean**: No unnecessary abstraction layers
- **Direct**: Each module imports only the entities it needs

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and configure your database:

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=wallet_transaction
DB_SSL=false
PORT=8000

# Generate once with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
API_KEY_SECRET=your_64_char_hex_secret_here
```

## API Key Authentication

### How it works

Merchant API keys are AES-256-GCM encrypted tokens. Each key embeds a merchant UUID so no database lookup is needed per request — the `ApiKeyGuard` decrypts the key inline and injects `merchantId` into the request.

Key format: `wt_<base64url(iv + authTag + encryptedPayload)>`

### Generating a key

1. Ensure `API_KEY_SECRET` is set in `.env`.
2. Run the generation script:

```bash
# Auto-generate a new merchant UUID
npm run generate:api-key

# Or supply an existing merchant UUID
npm run generate:api-key -- <your-merchant-uuid>
```

Example output:

```
Generated API Key
─────────────────────────────────────────
Merchant ID : 3f1b2c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d
API Key     : wt_ABCDefgh1234...

Store the API Key securely — it cannot be recovered if lost.
```

> The Merchant ID is embedded inside the encrypted key. You only need to share the API Key with the merchant.

### Using the key in requests

Pass it in the `x-api-key` header:

```bash
curl -X POST http://localhost:8000/customers \
  -H "Content-Type: application/json" \
  -H "x-api-key: wt_ABCDefgh1234..." \
  -d '{"name": "Praise Blupay", "email": "praise@example.com"}'
```

### Using the key in Swagger

1. Open [http://localhost:8000/docs](http://localhost:8000/docs).
2. Click the **Authorize** button (top-right lock icon).
3. Paste your `wt_...` key into the **ApiKey** field.
4. Click **Authorize**, then **Close**.

All protected endpoints will now send `x-api-key` automatically — identical to how Bearer token auth works in Swagger.

### Database Setup

Run migrations to create the database schema:

```bash
npm run migration:run
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Database Migrations

### Generate a new migration

After changing entities, generate a migration (creates `src/migrations/<timestamp>-Auto.ts`):

```bash
npm run migration:generate
```

### Run pending migrations

```bash
npm run migration:run
```

### Revert last migration

```bash
npm run migration:revert
```

## Development Commands

```bash
# Format code
npm run format

# Lint code
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:cov
```

## Best Practices

1. **Always use cents** for monetary values to avoid floating-point precision issues
2. **Check balance before debits** to ensure wallet never goes negative
3. **Use idempotency keys** for all financial transactions
4. **Use database transactions** for operations modifying multiple records
5. **Index frequently queried fields** (already done for critical fields)

## Project Structure Benefits

### Simple & Direct
- Database connection lives in `app.module.ts`
- No abstraction layers between modules and TypeORM
- Feature modules import only what they need

### Scalable
- Easy to add new feature modules
- Shared entities in `src/entities/`
- Each module manages its own business logic

### Clean
- Clear separation: infrastructure (app.module) vs business logic (libs)
- No unnecessary DAL layer for this use case
- TypeORM repositories provide all needed data access patterns

## License

UNLICENSED
