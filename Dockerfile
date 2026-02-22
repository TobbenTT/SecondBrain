# SecondBrain Dashboard — Docker Image
# Multi-stage build for production

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
COPY apps/dashboard/package.json apps/dashboard/package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application code
COPY apps/dashboard/ ./
COPY core/ /app-root/core/
COPY knowledge/ /app-root/knowledge/

# Create data directory
RUN mkdir -p data logs

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

USER node

CMD ["node", "server.js"]
