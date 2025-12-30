# Node.js/Express app Dockerfile using pnpm
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Default to production; overridden in docker-compose.dev.yml
ENV NODE_ENV=production

# Enable corepack to use the pinned pnpm version
ENV COREPACK_ENABLE_STRICT=0
RUN corepack enable

# Install dependencies first (better Docker layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source
COPY . .

# Expose the HTTP port
EXPOSE 4000

# Default command (production-style). Dev compose overrides this with `pnpm dev` if desired.
CMD ["pnpm", "run", "dev"]
