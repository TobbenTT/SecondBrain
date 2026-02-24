#!/bin/bash
# ============================================================================
# SecondBrain — VPS Setup Script
# Ejecutar como root en Ubuntu 22.04/24.04 LTS
# Uso: curl -sL <url>/setup-vps.sh | bash
#   o: chmod +x setup-vps.sh && sudo ./setup-vps.sh
# ============================================================================

set -euo pipefail

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
header() { echo -e "\n${BLUE}━━━ $1 ━━━${NC}\n"; }

# ─── Verificar root ─────────────────────────────────────────────────────────
if [ "$EUID" -ne 0 ]; then
    error "Ejecutar como root: sudo ./setup-vps.sh"
fi

header "1/7 — Actualizar sistema"
apt update && apt upgrade -y
apt install -y curl wget git ufw htop nano unzip software-properties-common
log "Sistema actualizado"

header "2/7 — Instalar Docker"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
    log "Docker instalado"
else
    log "Docker ya instalado: $(docker --version)"
fi

# Docker Compose ya viene incluido en Docker moderno (docker compose)
docker compose version || error "Docker Compose no disponible"
log "Docker Compose OK"

header "3/7 — Instalar Ollama"
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sh
    systemctl enable ollama
    systemctl start ollama
    log "Ollama instalado"
else
    log "Ollama ya instalado: $(ollama --version)"
fi

# Esperar a que Ollama inicie
sleep 3
log "Descargando modelo llama3 (esto puede tardar 5-10 minutos)..."
ollama pull llama3
log "Modelo llama3 descargado"

header "4/7 — Configurar Ollama para escuchar en todas las interfaces"
# Necesario para que Docker containers accedan a Ollama via host.docker.internal
mkdir -p /etc/systemd/system/ollama.service.d
cat > /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
EOF
systemctl daemon-reload
systemctl restart ollama
log "Ollama configurado para aceptar conexiones de Docker"

header "5/7 — Configurar Firewall (UFW)"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp       # HTTP (Nginx)
ufw allow 443/tcp      # HTTPS (Nginx + SSL)
# NO exponer puertos 3000-3003 directamente — Nginx hace proxy
ufw --force enable
log "Firewall configurado (SSH + HTTP + HTTPS)"

header "6/7 — Instalar Nginx"
apt install -y nginx
systemctl enable nginx
log "Nginx instalado"

header "7/7 — Crear usuario de despliegue"
if ! id "deployer" &>/dev/null; then
    useradd -m -s /bin/bash -G docker deployer
    log "Usuario 'deployer' creado y agregado al grupo docker"
    warn "Configura SSH key: ssh-copy-id deployer@<tu-vps-ip>"
else
    log "Usuario 'deployer' ya existe"
    usermod -aG docker deployer
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  VPS lista para SecondBrain!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Siguiente paso: Clonar el repo y configurar .env"
echo "  su - deployer"
echo "  git clone https://github.com/TobbenTT/SecondBrain.git"
echo "  cd SecondBrain"
echo "  # Copiar y editar los archivos .env (ver DEPLOY.md)"
echo "  docker compose up -d --build"
echo ""
