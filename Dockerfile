# Multi-stage Dockerfile for Ikasso (Next.js 14, standalone output)

FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies only once using workspaces
FROM base AS deps
COPY package.json package-lock.json .npmrc* ./
COPY apps ./apps
COPY packages ./packages
RUN npm ci --include=dev

# Build the Next.js app (apps/web)
FROM deps AS build
ENV NODE_ENV=production
RUN npm run build --workspace=apps/web

# Runtime image
FROM node:18-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Copy Next standalone server
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

# Default Next port
ENV PORT=3000
EXPOSE 3000

# Set base URL if provided
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Launch the Next standalone server
CMD ["node", "apps/web/server.js"]

