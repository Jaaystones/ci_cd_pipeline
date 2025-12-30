#!/bin/bash
set -e

# =========================
# Load environment variables
# =========================
echo "Loading environment variables from .env.development..."

if [ ! -f .env.development ]; then
    echo "Error: .env.development file not found!"
    echo "Please copy .env.development.example to .env.development and fill in the values."
    exit 1
fi

# Export all variables
set -a
. .env.development
set +a

# =========================
# Check Docker
# =========================
if ! docker info >/dev/null 2>&1; then
  echo "Error: Docker daemon is not running or not accessible."
  echo "Make sure your user is in the docker group or run with sudo."
  exit 1
fi

# =========================
# Prepare local directories
# =========================
mkdir -p .neon_local
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
  echo ".neon_local/" >> .gitignore
  echo "Added .neon_local/ to .gitignore"
fi

# =========================
# Start Docker containers
# =========================
echo "Starting Docker containers..."
docker compose -f docker-compose.dev.yml up -d --build

# =========================
# Wait for DB to be healthy
# =========================
echo "Waiting for the database to be healthy..."

DB_CONTAINER="neon_local_dev"
DB_NAME="${DATABASE_NAME:-neondb_owner}"
TIMEOUT=60
counter=0

while [ "$(docker inspect -f '{{.State.Health.Status}}' $DB_CONTAINER)" != "healthy" ]; do
  sleep 2
  counter=$((counter + 2))
  if [ $counter -ge $TIMEOUT ]; then
    echo "Error: Database container did not become healthy within $TIMEOUT seconds."
    docker logs $DB_CONTAINER
    exit 1
  fi
done

echo "Database container is healthy! ✅"

# =========================
# Wait for the database to exist
# =========================
echo "Waiting for database '$DB_NAME' to be ready..."

counter=0
while ! docker exec -i $DB_CONTAINER psql -U "${DATABASE_USER:-postgres}" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME';" | grep -q 1; do
  sleep 2
  counter=$((counter + 2))
  if [ $counter -ge $TIMEOUT ]; then
    echo "Error: Database '$DB_NAME' was not created within $TIMEOUT seconds."
    docker logs $DB_CONTAINER
    exit 1
  fi
done

echo "Database '$DB_NAME' exists! ✅"

# =========================
# Generate migrations with Drizzle
# =========================
echo "Generating migrations with Drizzle..."
docker compose -f docker-compose.dev.yml exec -T ci_cd_pipeline_app_dev pnpm run db:generate

# =========================
# Apply migrations with Drizzle
# =========================
echo "Applying latest schema with Drizzle..."
docker compose -f docker-compose.dev.yml exec -T ci_cd_pipeline_app_dev pnpm run db:migrate

# =========================
# Print final info
# =========================
echo ""
echo "Development environment is up and running!"
echo " - App: http://localhost:${PORT:-3000}"
echo " - Neon Local DB container: $DB_CONTAINER"
echo " - Use Ctrl+C to stop the app and containers."
