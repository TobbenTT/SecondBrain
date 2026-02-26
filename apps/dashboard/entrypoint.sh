#!/bin/sh
# Fix ownership of mounted volumes (may be created as root by Docker)
chown -R node:node /app/data /app/logs /app/public/voice-notes /app/public/gallery /app/public/avatars 2>/dev/null || true
chown -R node:node /knowledge 2>/dev/null || true

# Drop privileges and run as non-root user (OWASP A05: Security Misconfiguration)
exec su-exec node node server.js
