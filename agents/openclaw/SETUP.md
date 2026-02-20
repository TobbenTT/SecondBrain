# Conectar SecondBrain con OpenClaw

## Prerequisitos

- Node.js >= 22
- SecondBrain dashboard corriendo (`cd apps/dashboard && node server.js`)
- Cuenta de WhatsApp en el telefono

## Paso 1: Instalar OpenClaw

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

## Paso 2: Obtener tu API Key

Inicia el servidor de SecondBrain. La primera vez crea una API key automaticamente:

```bash
cd apps/dashboard && node server.js
```

Busca en la consola la linea:
```
API Key created: sb_xxxxxxxxxxxx
Save this key for OpenClaw config.
```

Si no la ves, puedes consultar la key existente:
```bash
# Desde SQLite directamente
sqlite3 apps/dashboard/data/second_brain.db "SELECT key FROM api_keys WHERE active=1"
```

O crear una nueva desde la API (con el server corriendo):
```bash
curl -X POST http://localhost:3000/api/keys \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <tu_key_existente>" \
  -d '{"name": "Mi OpenClaw", "username": "david"}'
```

## Paso 3: Instalar el Skill

```bash
# Copiar el skill a la carpeta de OpenClaw
cp -r agents/openclaw/secondbrain-skill ~/.openclaw/skills/secondbrain-api
```

## Paso 4: Configurar OpenClaw

```bash
# Copiar el template de configuracion
cp agents/openclaw/openclaw.config.json ~/.openclaw/openclaw.json

# Editar y reemplazar <TU_API_KEY>
nano ~/.openclaw/openclaw.json
```

O configurar via CLI:
```bash
openclaw config set SECONDBRAIN_URL http://localhost:3000
openclaw config set SECONDBRAIN_API_KEY sb_xxxxxxxxxxxx
```

## Paso 5: Copiar el Heartbeat

```bash
cp agents/openclaw/HEARTBEAT.md ~/.openclaw/workspace/HEARTBEAT.md
```

## Paso 6: Conectar WhatsApp

```bash
openclaw onboard
# Selecciona "WhatsApp"
# Escanea el QR con tu telefono
```

## Paso 7: Probar

Desde WhatsApp, envia:
```
Hola
```
El agente deberia responder con tu checklist del dia.

Luego prueba captura:
```
Hay que revisar el presupuesto de HSE para el Q2
```
Deberia responder: "Capturado: Revisar presupuesto HSE Q2. Asignado a jose, prioridad media."

## Acceso Remoto (fuera de la red local)

Si quieres que OpenClaw funcione cuando no estas en la misma red:

### Opcion A: Cloudflare Tunnel (Recomendado)
```bash
# Instalar cloudflared
# https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

cloudflared tunnel --url http://localhost:3000
```

Esto te da una URL publica (tipo `https://xxxx.trycloudflare.com`).
Actualiza `SECONDBRAIN_URL` en openclaw.json con esa URL.

### Opcion B: ngrok
```bash
ngrok http 3000
```

### Opcion C: Tailscale (red privada)
```bash
# Si ambos dispositivos estan en Tailscale
# Usa la IP de Tailscale del servidor como SECONDBRAIN_URL
```

## Verificacion

```bash
# Probar el skill directamente
npx openclaw-cli exec secondbrain-api --action summary --username david

# Ver logs
openclaw logs --follow
```

## Troubleshooting

| Problema | Solucion |
|----------|----------|
| "No se pudo conectar a SecondBrain" | Verificar que `node server.js` esta corriendo |
| "API key required" | Verificar SECONDBRAIN_API_KEY en openclaw.json |
| WhatsApp no conecta | Ejecutar `openclaw onboard` de nuevo, re-escanear QR |
| Skill no se encuentra | Verificar que esta en `~/.openclaw/skills/secondbrain-api/` |
| Heartbeat no funciona | Verificar `activeHours` en openclaw.json |
