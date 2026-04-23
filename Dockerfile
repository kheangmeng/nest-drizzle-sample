# --- Stage 1: Base ---
FROM node:25.9-alpine AS base
RUN npm install -g npm
WORKDIR /app

# --- Stage 2: Dependencies ---
FROM base AS deps
COPY package.json package-lock.json ./
# Install all dependencies including devDependencies for building
RUN npm install

# --- Stage 3: Builder ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Run the build (transpiles TS to JS in dist/)
RUN npm run build
# Remove devDependencies to keep the final image slim
# RUN npm prune --prod

# --- Stage 4: Production Runtime ---
FROM node:25.9-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install sqlite runtime dependencies if needed
# RUN apk add --no-cache sqlite

# Copy only necessary files from builder
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
# Copy assets (templates, firebase config, etc.)
COPY --from=builder --chown=node:node /app/src/mail/templates ./dist/src/mail/templates
COPY --chown=node:node firebase-adminsdk.json .env ./
# Using a wildcard pattern (sqlite.d[b]) makes the file optional during build
COPY --chown=node:node sqlite.d[b] ./
COPY drizzle.config.ts ./
# Create necessary directories and ensure the 'node' user owns the app directory.
# This is required for SQLite to create/open the database file and lock files in the root.
RUN mkdir -p uploads logs && chown -R node:node /app

EXPOSE 3000

# Use a non-root user for security
USER node

CMD ["node", "dist/src/main.js"]