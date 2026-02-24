# SecondBrain — Guia de Despliegue en VPS

## Requisitos del VPS

| Recurso | Minimo | Recomendado |
|---------|--------|-------------|
| RAM | 8 GB | 16 GB |
| CPU | 4 cores | 8 cores |
| Disco | 40 GB SSD | 80 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

> **Nota:** Ollama con llama3 (8B) necesita ~5GB de RAM. Con 8GB funciona justo. Con 16GB va comodo.

### Proveedores recomendados
- **Hetzner** — CPX31 (8GB/4CPU) ~$15/mes — Mejor precio/rendimiento
- **DigitalOcean** — Premium AMD 8GB ~$56/mes
- **Contabo** — VPS M (16GB/6CPU) ~$13/mes — Mas barato pero mas lento

---

## Paso 1 — Preparar el VPS

### 1.1 Conectarse por SSH
```bash
ssh root@TU_IP_VPS
```

### 1.2 Ejecutar el script de setup
```bash
# Opcion A: Descargar y ejecutar
curl -sO https://raw.githubusercontent.com/TobbenTT/SecondBrain/main/deploy/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh

# Opcion B: Copiar manualmente desde tu PC
scp deploy/setup-vps.sh root@TU_IP_VPS:/root/
ssh root@TU_IP_VPS './setup-vps.sh'
```

El script instala: Docker, Ollama, Nginx, UFW firewall, modelo llama3, usuario `deployer`.

### 1.3 Verificar que Ollama funciona
```bash
ollama list
# Debe mostrar llama3

curl http://localhost:11434/api/generate -d '{"model":"llama3","prompt":"Hola","stream":false}'
# Debe responder con JSON
```

---

## Paso 2 — Clonar el repositorio

```bash
# Cambiar al usuario deployer
su - deployer

# Clonar
git clone https://github.com/TobbenTT/SecondBrain.git
cd SecondBrain
```

---

## Paso 3 — Configurar variables de entorno

Los archivos `.env` NO estan en el repo (estan en .gitignore). Debes crearlos manualmente.

### 3.1 Dashboard (.env)
```bash
cat > apps/dashboard/.env << 'EOF'
# Authentication
AUTH_PASSWORD=vsc2026

# AI — Ollama (primary, Docker accede via host.docker.internal)
OLLAMA_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3
OLLAMA_TIMEOUT=300000

# AI — Gemini (fallback, opcional)
GEMINI_API_KEY=TU_GEMINI_API_KEY

# Server
SESSION_SECRET=GENERA_UN_SECRET_RANDOM_AQUI
PORT=3000
NODE_ENV=production

# CORS — Tu dominio
ALLOWED_ORIGINS=https://TU_DOMINIO.com
EOF
```

> **Generar SESSION_SECRET:**
> ```bash
> openssl rand -hex 32
> ```

### 3.2 OpenClaw (.env)
```bash
cat > openclaw/.env << 'EOF'
# AI Keys (Ollama es primario, cloud es fallback)
GEMINI_API_KEY=TU_GEMINI_API_KEY
ANTHROPIC_API_KEY=

# AI Models
GEMINI_MODEL=gemini-3-flash-preview
CLAUDE_MODEL=claude-sonnet-4-6
LOCAL_MODEL=llama3
OLLAMA_URL=http://host.docker.internal:11434/api/generate

# Database
DB_PATH=../apps/dashboard/data/second_brain.db
SKILLS_DIR=../core/skills

# Intervalos (segundos)
INTERVALO_PM=30
INTERVALO_DEV=60
INTERVALO_BUILDER=45
INTERVALO_QA=60
INTERVALO_CONSULTING=45
INTERVALO_REVIEWER=90

# Opcional
TTS_ENABLED=false
EOF
```

### 3.3 Inteligencia de Correos (.env)
```bash
cat > Inteligencia-de-correos/.env << 'EOF'
# Supabase
DB_HOST=aws-1-eu-north-1.pooler.supabase.com
DB_PORT=6543
DB_USER=postgres.eypurbdkqfwnqiiucraq
DB_PASSWORD=VSC2026.2026
DB_NAME=postgres

# AI (Gemini)
AI_API_KEY=TU_GEMINI_API_KEY
AI_MODEL=gemini-2.0-flash

# Fireflies.ai
FIREFLIES_API_KEY=TU_FIREFLIES_KEY

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
EMAIL_FROM=tu-email@gmail.com
EMAIL_TO=destinatario@email.com

# Server
PORT=3003
WEBHOOK_SECRET=tu_webhook_secret

# Dashboard Bridge
DASHBOARD_URL=http://dashboard:3000
DASHBOARD_API_KEY=sb_12b5199409045112e93c13eef4c149a239841de0b9ed0baf
EOF
```

---

## Paso 4 — Levantar con Docker Compose

```bash
cd ~/SecondBrain

# Construir y levantar todos los servicios
docker compose up -d --build

# Ver logs en tiempo real
docker compose logs -f

# Verificar que todos estan corriendo
docker compose ps
```

**Resultado esperado:**
```
NAME                              STATUS          PORTS
secondbrain-dashboard             Up (healthy)    0.0.0.0:3000->3000/tcp
secondbrain-orchestrator          Up              0.0.0.0:3001->3001/tcp
secondbrain-lililia               Up              0.0.0.0:3002->3002/tcp
secondbrain-openclaw              Up
secondbrain-inteligencia-correos  Up (healthy)    0.0.0.0:3003->3003/tcp
```

### Verificar salud
```bash
# Dashboard
curl http://localhost:3000/health

# Inteligencia de correos
curl http://localhost:3003/health

# Ollama desde dentro del container
docker exec secondbrain-dashboard wget -qO- http://host.docker.internal:11434/api/tags
```

---

## Paso 5 — Configurar Nginx (Reverse Proxy)

### 5.1 Sin dominio (solo IP)
```bash
# Copiar config
sudo cp ~/SecondBrain/deploy/nginx.conf /etc/nginx/sites-available/secondbrain

# Editar: reemplazar TU_DOMINIO.com con tu IP
sudo nano /etc/nginx/sites-available/secondbrain
# Cambiar: server_name TU_DOMINIO.com;
# A:       server_name TU_IP_VPS;
# Eliminar los bloques de orchestrator y lililia (o dejarlos comentados)

# Activar
sudo ln -s /etc/nginx/sites-available/secondbrain /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar y reiniciar
sudo nginx -t
sudo systemctl restart nginx
```

### 5.2 Con dominio + SSL (HTTPS)
```bash
# 1. Apuntar tu dominio a la IP del VPS (registro A en tu DNS)
# 2. Editar el nginx.conf reemplazando TU_DOMINIO.com con tu dominio real

sudo cp ~/SecondBrain/deploy/nginx.conf /etc/nginx/sites-available/secondbrain
sudo nano /etc/nginx/sites-available/secondbrain
# Reemplazar TODAS las ocurrencias de TU_DOMINIO.com

sudo ln -s /etc/nginx/sites-available/secondbrain /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 3. Instalar Certbot (SSL gratis con Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx

# 4. Obtener certificado (reemplaza con tu dominio y email)
sudo certbot --nginx -d TU_DOMINIO.com -d orchestrator.TU_DOMINIO.com -d lililia.TU_DOMINIO.com --non-interactive --agree-tos -m tu-email@example.com

# 5. Renovacion automatica (ya configurada por certbot)
sudo certbot renew --dry-run
```

### 5.3 Verificar
```bash
# Con IP
curl http://TU_IP_VPS/health

# Con dominio + SSL
curl https://TU_DOMINIO.com/health
```

---

## Paso 6 — Configurar Fireflies.ai Webhook

1. Ir a [Fireflies.ai Webhooks](https://app.fireflies.ai/integrations/custom/webhooks)
2. Crear webhook con URL: `https://TU_DOMINIO.com:3003/webhook/fireflies`
   - Si NO tienes subdominio para inteligencia-correos, necesitas exponer el puerto 3003:
     ```bash
     sudo ufw allow 3003/tcp
     ```
   - O crear un subdominio `correos.TU_DOMINIO.com` (descomenta el bloque en nginx.conf)
3. Event: `Transcription completed`
4. Secret: El valor de `WEBHOOK_SECRET` en tu `.env`

---

## Comandos utiles

### Logs
```bash
# Todos los servicios
docker compose logs -f

# Un servicio especifico
docker compose logs -f dashboard
docker compose logs -f openclaw
docker compose logs -f inteligencia-correos

# Ultimas 100 lineas
docker compose logs --tail=100 dashboard
```

### Reiniciar
```bash
# Todo
docker compose restart

# Un servicio
docker compose restart dashboard

# Reconstruir despues de cambios en codigo
docker compose up -d --build dashboard
```

### Actualizar (pull de GitHub)
```bash
cd ~/SecondBrain
git pull origin main
docker compose up -d --build
```

### Base de datos
```bash
# Acceder a la BD SQLite del dashboard
docker exec -it secondbrain-dashboard sh -c "sqlite3 /app/data/second_brain.db"

# Backup de la BD
docker cp secondbrain-dashboard:/app/data/second_brain.db ./backup-$(date +%Y%m%d).db
```

### Ollama
```bash
# Ver modelos instalados
ollama list

# Descargar otro modelo
ollama pull llama3.1

# Ver uso de recursos
ollama ps

# Logs de Ollama
journalctl -u ollama -f
```

### Monitoreo
```bash
# Uso de recursos por contenedor
docker stats

# Espacio en disco
df -h
docker system df

# Limpiar imagenes antiguas
docker system prune -f
```

---

## Arquitectura en produccion

```
Internet
    |
    v
[Firewall UFW] — solo 80/443/22
    |
    v
[Nginx :80/:443] — SSL + rate limiting
    |
    +---> localhost:3000 --> [Dashboard]     --> Ollama (host:11434)
    +---> localhost:3001 --> [Orchestrator]
    +---> localhost:3002 --> [Lililia]

[Fireflies.ai]
    |
    v
localhost:3003 --> [Inteligencia-Correos] --> Dashboard API (webhook)
                                          --> Supabase (PostgreSQL)
                                          --> Email (SMTP)

[Ollama] (host nativo, puerto 11434)
    ^
    |
    +--- Dashboard (via host.docker.internal)
    +--- OpenClaw  (via host.docker.internal)
```

---

## Troubleshooting

### "Ollama connection refused" desde Docker
```bash
# Verificar que Ollama escucha en 0.0.0.0
ss -tlnp | grep 11434
# Debe mostrar 0.0.0.0:11434, NO 127.0.0.1:11434

# Si muestra 127.0.0.1, correr:
sudo systemctl edit ollama
# Agregar:
# [Service]
# Environment="OLLAMA_HOST=0.0.0.0"
sudo systemctl restart ollama
```

### Container no arranca
```bash
# Ver logs del build
docker compose build dashboard 2>&1 | tail -50

# Ver logs del container
docker compose logs dashboard

# Entrar al container para debug
docker exec -it secondbrain-dashboard sh
```

### Puerto ocupado
```bash
# Ver que usa el puerto
ss -tlnp | grep :3000

# Matar proceso
kill $(lsof -t -i:3000)
```

### Reconstruir desde cero
```bash
docker compose down
docker system prune -af
docker compose up -d --build
```
