### Multi-stage Dockerfile for Next.js app
# Build stage
FROM --platform=linux/amd64 node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --silent; elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm install --frozen-lockfile --silent; else npm install --silent; fi

# Copy source
COPY . .

# Build
RUN npm run build --silent

# Production stage
FROM --platform=linux/amd64 node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built assets and node_modules from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Install production dependencies
RUN if [ -f package-lock.json ]; then npm ci --only=production --silent; else npm install --only=production --silent; fi

EXPOSE 3000
CMD ["npm", "start"]
