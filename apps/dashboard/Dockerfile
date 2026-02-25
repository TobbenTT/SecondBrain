FROM node:20-alpine

RUN apk add --no-cache su-exec

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p data logs public/voice-notes public/gallery public/avatars \
    && chmod +x entrypoint.sh

EXPOSE ${PORT:-3000}

ENTRYPOINT ["./entrypoint.sh"]
