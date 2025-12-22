# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Node.js/Express REST API with JWT authentication using Drizzle ORM and Neon PostgreSQL database. Uses ES modules with custom import path aliases defined in package.json.

## Essential Commands

### Development
```bash
pnpm dev              # Start development server with --watch flag
```

### Code Quality
```bash
pnpm lint             # Run ESLint
pnpm lint:fix         # Auto-fix ESLint issues
pnpm format           # Format code with Prettier
pnpm prettier:check   # Check formatting without changes
```

### Database Operations
```bash
pnpm db:generate      # Generate Drizzle migrations from schema
pnpm db:migrate       # Apply migrations to database
pnpm db:studio        # Open Drizzle Studio (database GUI)
pnpm db:rollback      # Rollback last migration
```

## Architecture

### Import Aliases
Project uses custom import paths (defined in package.json "imports" field):
- `#config/*` → `./src/config/*`
- `#models/*` → `./src/models/*`
- `#controllers/*` → `./src/controllers/*`
- `#routes/*` → `./src/routes/*`
- `#utils/*` → `./src/utils/*`
- `#middleware/*` → `./src/middleware/*`
- `#services/*` → `./src/services/*`
- `#validations/*` → `./src/validations/*`

Always use these aliases instead of relative paths when importing across directories.

### Application Structure

**Entry point flow:**
1. `src/index.js` - Loads environment variables and imports server
2. `src/server.js` - Starts HTTP server
3. `src/app.js` - Express app configuration with middleware stack

**Layer architecture (controller → service → model):**
- **Routes** (`src/routes/`) - Define endpoints and map to controllers
- **Controllers** (`src/controllers/`) - Handle HTTP request/response, validate input using Zod schemas
- **Services** (`src/services/`) - Business logic and data operations
- **Models** (`src/models/`) - Drizzle ORM table schemas
- **Validations** (`src/validations/`) - Zod schemas for input validation
- **Middleware** (`src/middleware/`) - Currently empty, for future middleware
- **Utils** (`src/utils/`) - Reusable utilities (JWT, cookies, formatting)

### Database (Drizzle ORM)
- Uses Neon serverless PostgreSQL with HTTP driver
- Database instance exported from `src/config/database.js`
- Schema files in `src/models/` (currently only user.model.js)
- Migrations stored in `drizzle/` directory
- Schema changes workflow: modify model → run `pnpm db:generate` → run `pnpm db:migrate`

### Authentication Flow
- JWT-based authentication with httpOnly cookies
- Password hashing with bcrypt (10 rounds)
- Token contains: _id, name, email, role
- JWT expiration: 7 days
- Cookie expiration: 15 minutes
- Middleware functions: `isAuth`, `isAdmin` (in src/utils/jwt.js)

### Logging
- Winston logger configured in `src/config/logger.js`
- Log levels: defaults to 'info', configurable via LOG_LEVEL env var
- Outputs: console + file (logs/error.log, logs/combined.log)
- Development mode adds colorized console output
- Morgan HTTP request logging piped through Winston

### Code Style
- ES modules only (type: "module" in package.json)
- 2-space indentation
- Single quotes
- Semicolons required
- Unix line endings
- No var (use const/let)
- Arrow functions preferred
- Unused variables must be prefixed with underscore

## Environment Variables
Required variables (see .env):
- `DATABASE_URL` - Neon PostgreSQL connection string
- `PORT` - Server port (default: 4000)
- `JWT_SECRET` - Secret for signing JWT tokens
- `LOG_LEVEL` - Winston log level (optional, default: 'info')
- `NODE_ENV` - Environment (affects logging and cookie security)

## Package Manager
Uses **pnpm** exclusively (specified in package.json packageManager field). Do not use npm or yarn.

## Current Implementation Status
- ✅ User signup endpoint (`POST /api/auth/sign-up`)
- ⏳ Sign-in and sign-out routes commented out but not implemented
- ⏳ No test framework configured (npm test returns error)
- ⏳ Middleware directory exists but empty

## Key Patterns

### Error Handling
- Controllers use try-catch blocks
- Validation errors return 400 with formatted Zod errors
- Duplicate email returns 409 conflict
- Errors logged via Winston before propagating
- Use `next(e)` to pass unhandled errors to Express error handler

### Validation Pattern
```javascript
const validationResult = schema.safeParse(req.body);
if (!validationResult.success) {
  return res.status(400).json({ 
    error: 'Validation failed',
    details: formatValidationErrors(validationResult.error)
  });
}
```

### Service Layer Pattern
Services throw errors on failure; controllers catch and translate to HTTP responses.
