# Stones API – Docker + Neon Setup

This project is a Node.js/Express REST API that uses Neon (serverless Postgres) with Drizzle ORM.

This document explains how to run the app in Docker using **Neon Local** for development and
how to deploy the same image against a **Neon Cloud** database in production.

## Prerequisites

- Docker and Docker Compose installed
- A Neon account with a project created
- For development:
  - Neon API key
  - Neon project ID
  - Optional: parent branch ID for creating ephemeral dev/test branches
- For production:
  - A Neon Cloud connection string (the `DATABASE_URL` from the Neon console)

## Environment configuration

The application always reads its database connection from the `DATABASE_URL` environment variable.
The **same image** is used for both development and production; only the environment variables differ.

### Development – `.env.development`

For local development with Neon Local, configure `.env.development` (created for you in this repo)
with values appropriate for your Neon project:

```bash
# Application
NODE_ENV=development
PORT=4000
LOG_LEVEL=info
JWT_SECRET=change_me_for_local_dev_only

# Neon Local proxy configuration
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
PARENT_BRANCH_ID=your_parent_branch_id_here  # optional, used as the parent for ephemeral branches

# Neon Local + serverless driver integration
DRIVER=serverless
NEON_LOCAL_FETCH_ENDPOINT=http://db:5432/sql

# Database URL used by the app and Drizzle ORM in development.
# `db` is the Neon Local service name from docker-compose.dev.yml.
DATABASE_URL=postgres://neon:npg@db:5432/neondb
```

### Production – `.env.production`

For production, configure `.env.production` with your real secrets and Neon Cloud database URL.
Only a template with placeholders is committed to the repo; replace the values in your deployment
environment (and avoid committing real secrets back to git).

```bash
# Application
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
JWT_SECRET=replace_with_strong_production_secret

# Neon Cloud production database URL (example)
DATABASE_URL=postgres://user:password@your-neon-host.neon.tech/your_db_name?sslmode=require
```

## How the app chooses the database

The database client is configured in `src/config/database.js`:

- In **non-production** (`NODE_ENV !== 'production'`):
  - `NEON_LOCAL_FETCH_ENDPOINT` (defaulting to `http://db:5432/sql`) is used to talk to the
    Neon Local proxy container.
  - `DATABASE_URL` should point at the Neon Local Postgres endpoint (service name `db` from
    `docker-compose.dev.yml`).
- In **production** (`NODE_ENV === 'production'`):
  - The app connects directly to Neon Cloud using the `DATABASE_URL` value from `.env.production`.
  - No Neon Local proxy is involved in production.

## Running locally with Neon Local (development)

1. Ensure `.env.development` is filled in with your Neon API key, project ID, and (optionally)
   a `PARENT_BRANCH_ID` for the branch you want to clone from.
2. Start the development stack (app + Neon Local):

   ```bash
   docker compose -f docker-compose.dev.yml up --build
   ```

3. Once the containers are up, the API will be available at:

   - Application: http://localhost:4000
   - Health check: http://localhost:4000/health

4. Neon Local will automatically create an **ephemeral branch** for this dev environment when
   the `db` container starts and delete it when the container stops. This gives you an isolated
   database for each local run without manual cleanup.

### Notes for local development

- The `app` service mounts the current directory into the container (`.:/app`) and runs the
  code from there. You can use your normal local editor, and changes will be reflected inside
  the container.
- The default command in the image is `node src/index.js`, but you can adjust the `command`
  in `docker-compose.dev.yml` to use `pnpm dev` if you prefer watch mode.

## Running against Neon Cloud (production)

1. In Neon Cloud, create your production database and copy the connection string from the
   Neon console.
2. Update `.env.production` on your deployment machine with:

   - A strong `JWT_SECRET`
   - The Neon Cloud `DATABASE_URL` value
3. Build and start the production stack:

   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```

4. The API will listen on `http://localhost:4000` by default (or the port you configure).

In this mode, the application connects **directly** to Neon Cloud:

- There is **no** Neon Local proxy container.
- Only `DATABASE_URL` and other app secrets from `.env.production` are required.

## Switching between dev and prod

- **Dev (`docker-compose.dev.yml`)**
  - `NODE_ENV=development`
  - `DATABASE_URL` → Neon Local (`postgres://neon:npg@db:5432/neondb`)
  - Neon Local uses `NEON_API_KEY`, `NEON_PROJECT_ID`, and (optionally) `PARENT_BRANCH_ID` to
    create ephemeral branches for each Docker environment.

- **Prod (`docker-compose.prod.yml`)**
  - `NODE_ENV=production`
  - `DATABASE_URL` → Neon Cloud URL from the Neon console (e.g. `...neon.tech...`)
  - No Neon Local proxy or Neon API key is used.

With this setup, you can confidently develop and test against disposable Neon branches locally
while keeping production connected to your managed Neon Cloud database.
