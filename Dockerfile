### Multi-stage Dockerfile for Next.js app using Ubuntu

# Build stage: use Ubuntu and install Node 20
FROM ubuntu:24.04 AS builder
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl ca-certificates build-essential python3 git gnupg \
	&& rm -rf /var/lib/apt/lists/*

# Install Node.js 20.x from NodeSource
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends nodejs \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests and install dependencies
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --silent; elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm install --frozen-lockfile --silent; else npm install --silent; fi

# Copy source and build
COPY . .
RUN npm run build --silent

# Production stage: slimmer Ubuntu with Node runtime
FROM ubuntu:24.04 AS runner
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates curl \
	&& rm -rf /var/lib/apt/lists/*

# Install Node.js 20 runtime
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends nodejs \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV NODE_ENV=production

# Copy built assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Install production dependencies
RUN if [ -f package-lock.json ]; then npm ci --only=production --silent; else npm install --only=production --silent; fi

EXPOSE 3000
CMD ["npm", "start"]
