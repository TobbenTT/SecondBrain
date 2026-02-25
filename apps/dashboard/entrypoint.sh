#!/bin/sh
# Fix ownership of mounted volumes (created by previous root containers)
chown -R node:node /app/data /app/logs /app/public/voice-notes /app/public/gallery /app/public/avatars 2>/dev/null || true

# Execute as node user
exec su-exec node node server.js
