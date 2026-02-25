FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p data public/voice-notes && chown -R node:node data public/voice-notes

EXPOSE 3000

USER node

CMD ["node", "server.js"]
