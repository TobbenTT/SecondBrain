FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p data logs public/voice-notes public/gallery public/avatars \
    && chown -R node:node data logs public/voice-notes public/gallery public/avatars

EXPOSE 3000

USER node

CMD ["node", "server.js"]
