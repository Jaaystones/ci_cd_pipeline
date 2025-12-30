# CI/CD Pipeline API

A Node.js/Express REST API with user authentication, built with Drizzle ORM and PostgreSQL.

## Features

- User registration and login with JWT authentication
- PostgreSQL database with Drizzle ORM
- Docker development environment
- Security middleware with Arcjet
- HTML UIs for sign-in and sign-up
- Input validation with Zod

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- pnpm

## Quick Start

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Start the development environment: `pnpm run dev:docker`

The API will be available at `http://localhost:4000`

## Environment Configuration

### Development (.env.development)

```bash
# Server
PORT=4000
NODE_ENV=development
LOG_LEVEL=info

# Database
DATABASE_NAME=neondb_owner
DATABASE_USER=neondb_owner
DATABASE_PASSWORD=xxxxxxxxxxx
DATABASE_HOST=neon_local_dev
DATABASE_PORT=5432
DATABASE_URL=postgres://neondb_owner:xxxx@neon_local_dev:5432/xxxx

# JWT
JWT_SECRET=your_jwt_secret_key

# Arcjet
ARCJET_API_KEY=your_arcjet_key
ARCJET_ENV=development
```

### Production (.env.production)

```bash
# Server
PORT=4000
NODE_ENV=production
LOG_LEVEL=info

# Database
DATABASE_NAME=your_prod_db
DATABASE_USER=your_prod_user
DATABASE_PASSWORD=your_prod_password
DATABASE_HOST=your_prod_host
DATABASE_PORT=5432
DATABASE_SSL=true
DATABASE_URL=your_production_database_url

# JWT
JWT_SECRET=your_production_jwt_secret

# Arcjet
ARCJET_API_KEY=your_prod_arcjet_key
ARCJET_ENV=production
```

## Running Locally

### With Docker (Recommended)

```bash
pnpm run dev:docker
```

This starts:
- PostgreSQL database in Docker
- Node.js app in Docker
- Applies database migrations
- Serves the API at http://localhost:4000

### Without Docker

```bash
# Start PostgreSQL (e.g., via Docker or local install)
# Then:
pnpm install
pnpm run db:generate
pnpm run db:migrate
pnpm dev
```

## API Endpoints

### Authentication

- `POST /api/auth/sign-up` - Register a new user
- `POST /api/auth/sign-in` - Login user
- `POST /api/auth/sign-out` - Logout user

### UI Pages

- `GET /signin.html` - Sign-in form
- `GET /signup.html` - Sign-up form

### Health Check

- `GET /health` - Application health status
- `GET /api` - API status

## Database

The app uses PostgreSQL with Drizzle ORM for type-safe database operations.

### Migrations

```bash
pnpm run db:generate  # Generate migration files
pnpm run db:migrate   # Apply migrations
pnpm run db:rollback # Rollback last migration
```

## Project Structure

```
src/
├── app.js              # Express app setup
├── index.js            # Server entry point
├── config/
│   ├── database.js     # Database connection
│   └── logger.js       # Logging configuration
├── controllers/
│   └── auth.controller.js
├── middleware/
│   └── security.middleware.js
├── models/
│   └── user.model.js   # Drizzle schema
├── routes/
│   └── auth.route.js
├── services/
│   └── auth.service.js
├── utils/
│   ├── cookies.js
│   ├── format.js
│   ├── jwt.js
│   └── validations/
│       └── auth.validation.js
public/
├── signin.html
└── signup.html
```

## Security

- Password hashing with bcrypt
- JWT tokens for authentication
- Arcjet security middleware for bot protection and rate limiting
- Input validation with Zod
- CORS and Helmet for security headers

## Development

```bash
pnpm dev          # Start with watch mode (local)
pnpm lint         # Run ESLint
pnpm format       # Format code with Prettier
pnpm test         # Run tests (when implemented)
```

## Deployment

Build the Docker image and deploy with your preferred method.

```bash
docker build -t ci-cd-pipeline .
docker run -p 4000:4000 --env-file .env.production ci-cd-pipeline
```

For production, ensure `NODE_ENV=production` and use a production database.
