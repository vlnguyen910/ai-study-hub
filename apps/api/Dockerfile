# Stage 1: Build stage
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app

# Copy all source files
COPY . .

# Install all dependencies (development + production)
RUN pnpm install --frozen-lockfile

# Generate Prisma Client and build the NestJS app
RUN pnpm --filter api db:generate
RUN pnpm --filter api build

# Deploy the standalone package (installs only production dependencies in a flattened structure)
RUN pnpm --filter api --prod deploy /app/deployed

# Manually copy the compiled dist and prisma folders into the deployed output folder
RUN cp -r apps/api/dist /app/deployed/dist
RUN cp -r apps/api/prisma /app/deployed/prisma

# Run prisma generate in the deployed folder using the builder's prisma CLI to generate production client
WORKDIR /app/deployed
RUN /app/apps/api/node_modules/.bin/prisma generate --schema=prisma/schema.prisma

# Stage 2: Runner stage (lightweight production image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install LibreOffice and fonts for PDF preview conversion
RUN apk add --no-cache \
    libreoffice \
    ttf-dejavu \
    fontconfig

# Copy the deployed self-contained folder
COPY --from=builder /app/deployed ./

EXPOSE 8080

# Default start command for API
CMD ["node", "dist/main.js"]
