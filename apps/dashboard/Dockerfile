FROM node:20-alpine

RUN apk add --no-cache su-exec

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p data logs public/voice-notes public/gallery public/avatars \
    && chown -R node:node /app \
    && chmod +x entrypoint.sh

EXPOSE ${PORT:-3000}

# Entrypoint fixes volume permissions (needs root), then drops to node via su-exec
ENTRYPOINT ["./entrypoint.sh"]
