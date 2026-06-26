# Stage 1: Build stage
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

# Copy monorepo configuration and lockfile
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./

# Copy package.json of all workspaces to cache install step
COPY apps/api/package.json ./apps/api/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/tokens/package.json ./packages/tokens/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/ui/package.json ./packages/ui/

# Install all dependencies (workspace-wide)
RUN pnpm install --frozen-lockfile

# Copy entire source code to build
COPY . .

# Generate Prisma Client and compile NestJS app
RUN pnpm --filter api db:generate
RUN pnpm --filter api build

# Stage 2: Runner stage (lightweight production image)
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm

ENV NODE_ENV=production

# Copy necessary monorepo structures and compiled outputs
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080

# Default command (Can be overridden by Railway Start Command for the Worker service)
CMD ["pnpm", "--filter", "api", "start:prod"]
