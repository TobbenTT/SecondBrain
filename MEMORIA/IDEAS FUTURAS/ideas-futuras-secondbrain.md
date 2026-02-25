# Ideas Futuras — SecondBrain

> Estas ideas requieren investigacion y planificacion antes de implementarse.
> No son urgentes pero agregan valor a largo plazo.
> Ultima actualizacion: 2026-02-25

---

## 1. Migracion de Supabase a PostgreSQL Local

**Estado:** Investigacion
**Prioridad:** Media-Alta (ahorro de costos)
**Contexto:** Inteligencia-de-correos usa Supabase ($25/mes). Se puede reemplazar con PostgreSQL en Docker.

**Que implica:**
- Agregar contenedor PostgreSQL 16 al docker-compose
- Exportar datos de Supabase con `pg_dump`
- Importar en PostgreSQL local con `pg_restore`
- Cambiar connection string en .env de inteligencia-correos
- Reemplazar `supabase.from('tabla')` por queries SQL directas con `pg` npm
- Eliminar dependencia `@supabase/supabase-js`
- Dashboard podria seguir con SQLite o migrar tambien a PostgreSQL

**Ventajas:**
- Ahorro de $25/mes ($300/año)
- Control total sobre los datos — no dependen de un tercero
- Sin limites de filas, storage o bandwidth de Supabase
- Misma tecnologia (PostgreSQL) pero local
- Backups bajo tu control, no dependen de Supabase
- Menor latencia (BD esta en el mismo servidor, no en la nube)

**Desventajas:**
- Pierdes Supabase Auth (hay que replicar con auth del dashboard)
- RLS de Supabase hay que configurarlo manual en PostgreSQL nativo
- Tu eres responsable de los updates de seguridad de PostgreSQL
- Necesita ventana de mantenimiento para la migracion (downtime)
- Si el VPS cae, la BD cae con el (en Supabase estan separados)

---

## 2. Redis para Sesiones Persistentes

**Estado:** Investigacion
**Prioridad:** Alta (afecta experiencia de usuario)
**Contexto:** Hoy se usa MemoryStore — cada vez que se reinicia el contenedor, todos los usuarios quedan deslogueados.

**Que implica:**
- Agregar contenedor Redis 7 Alpine al docker-compose
- Instalar `connect-redis` + `ioredis` en dashboard
- Reemplazar MemoryStore por RedisStore en session config de server.js
- Redis solo accesible desde red Docker interna (no exponer puerto)

**Ventajas:**
- Sesiones sobreviven reinicios del dashboard — no mas logout masivo
- Extremadamente rapido (in-memory, microsegundos)
- Estandar de la industria para session storage
- Bajo consumo de RAM (~5-10MB para cientos de sesiones)
- Base para escalamiento horizontal futuro (multiples instancias del dashboard)
- Facil de implementar (pocas lineas de codigo)

**Desventajas:**
- Un contenedor mas que mantener (aunque Redis es muy estable)
- Si Redis cae, nadie puede loguearse hasta que vuelva
- Consume RAM del VPS (minimo, pero es recurso compartido)
- Otra dependencia en el stack

---

## 3. Seguridad Nivel Consultora Internacional

**Estado:** Investigacion / Roadmap
**Prioridad:** Media (importante para certificaciones y licitaciones)
**Contexto:** VSC es consultora internacional. Clientes en mineria/energia exigen certificaciones.

**Ventajas:**
- Acceso a licitaciones grandes (mineras, energia, gobierno) que exigen ISO 27001
- Confianza de clientes internacionales — diferenciador competitivo
- Cumplimiento legal obligatorio (Ley 21.719 Chile 2026, GDPR si hay clientes EU)
- Proteccion real contra ataques y filtraciones de datos
- Audit trail completo para demostrar cumplimiento ante reguladores
- Backups encriptados protegen contra ransomware y perdida de datos

**Desventajas:**
- Certificarse en ISO 27001 es costoso ($5,000-15,000 USD auditoria externa)
- Requiere documentacion extensa (politicas, procedimientos, registros)
- Necesita un DPO (Data Protection Officer) — puede ser alguien interno capacitado
- La encriptacion de columnas (pgcrypto) agrega complejidad a las queries
- pgAudit genera muchos logs — necesita gestion de espacio en disco
- Mantener certificaciones requiere auditorias anuales

### 3.1 Encriptacion
- **En transito:** Ya existe (HTTPS via nginx + Let's Encrypt)
- **En reposo:** LUKS para volumen Docker o pgcrypto para columnas sensibles
- **Backups:** GPG para encriptar dumps antes de storage offsite
- **Columnas a encriptar:** emails, nombres, transcripciones, datos financieros

### 3.2 Auditoria
- pgAudit (extension PostgreSQL) para loguear todas las queries
- Tabla `audit_log` con usuario, accion, tabla, timestamp
- Retener logs minimo 1 año

### 3.3 Proteccion contra ataques
- Rate limiting por IP (express-rate-limit)
- fail2ban para bloqueo automatico tras intentos fallidos
- Bloqueo de cuenta tras 5 intentos de login fallidos
- WAF (ModSecurity) en nginx

### 3.4 Backups automaticos
- `pg_dump` diario encriptado con GPG
- Retencion: 7 diarios + 4 semanales + 12 mensuales
- Destino offsite: S3, Backblaze, o segundo VPS
- Test de restauracion mensual

### 3.5 Certificaciones (roadmap)
| Certificacion | Para que | Timeline |
|--------------|----------|----------|
| ISO 27001 | Gestion seguridad informacion — minimo para licitaciones grandes | 6-12 meses |
| ISO 27701 | Extension privacidad (cubre GDPR + leyes LATAM) | 6-12 meses |
| SOC 2 Type I | Controles de seguridad definidos | 3-6 meses |
| SOC 2 Type II | Controles funcionando 6+ meses | 12+ meses |

### 3.6 Regulaciones por mercado
| Region | Ley | Aplica si... |
|--------|-----|-------------|
| Chile | Ley 21.719 (2026) | Guardas datos de personas chilenas |
| EU | GDPR | Clientes o datos de personas EU |
| Brasil | LGPD | Clientes brasileños |
| Colombia | Ley 1581 | Clientes colombianos |
| USA | SOC 2 + CCPA | Clientes americanos |

---

## 4. Arquitectura de Red Docker Segura

**Estado:** Investigacion
**Prioridad:** Media
**Contexto:** Separar redes Docker para que BD y Redis no sean accesibles desde fuera.

**Ventajas:**
- BD y Redis invisibles desde internet — solo los servicios internos los ven
- Ataque al dashboard no da acceso directo a la BD
- Cumple principio de minimo privilegio (requisito ISO 27001)
- Sin costo adicional — es configuracion de Docker

**Desventajas:**
- Mas complejo de debuggear (no puedes conectar pgAdmin directo desde tu PC)
- Si necesitas acceso remoto a la BD, requiere tunnel SSH
- Configuracion inicial mas compleja en docker-compose

```
Internet
    |
    v
nginx (TLS 1.3)
    |
    +-- WAF (ModSecurity / fail2ban)
    |
    +-- dashboard (:3000) -----+
    |                          |  red: internal + web
    +-- correos  (:3003) ------+
    |                          v
    |                   PostgreSQL (:5432)  -- red: internal (solo)
    |                   Redis (:6379)       -- red: internal (solo)
    |
    +-- Backups automaticos
        +-- pg_dump diario -> GPG encrypt
        +-- Retencion: 7d + 4s + 12m
        +-- Destino: offsite (S3/Backblaze)
```

---

## 5. File Manager Web para CEO

**Estado:** Pendiente grabacion del CEO para entender requisitos
**Prioridad:** Baja
**Contexto:** El CEO quiere ver archivos/carpetas del servidor sin usar terminal.

**Opciones evaluadas:**
- **FileBrowser** (filebrowser/filebrowser) — interfaz web ligera, autenticacion propia, Docker
- **Cockpit** — panel de admin Linux con file manager integrado
- **Construir dentro del dashboard** — seccion "Archivos" con tree view

**Ventajas:**
- CEO autonomo — no necesita pedir archivos a TI
- Acceso desde cualquier dispositivo (web)
- Se puede restringir a carpetas especificas (no ve todo el servidor)
- FileBrowser tiene preview de documentos, imagenes, PDFs

**Desventajas:**
- Riesgo de seguridad si se configura mal (acceso a archivos del sistema)
- Otro servicio mas que mantener y asegurar
- El CEO podria borrar archivos importantes por error
- Si se construye dentro del dashboard, agrega complejidad al codigo

**Decision:** Esperar grabacion del CEO para entender exactamente que necesita ver.

---

## 6. Daily Digest Automatico (Tap on Shoulder)

**Estado:** Diseñado en docs de Jose, no implementado
**Prioridad:** Media
**Contexto:** Building block #7 de Nate Jones. Resumen matutino automatico.

**Que implica:**
- Cron job a las 8:00 AM
- Query: ideas pendientes, proyectos activos, compromisos proximos, herramientas por vencer
- Generar resumen con Gemini/Ollama
- Enviar como notificacion en dashboard o email
- Personalizado por usuario (cada uno ve lo suyo)

**Ventajas:**
- Nadie se olvida de pendientes — el sistema te recuerda cada mañana
- Ahorra tiempo: no hay que revisar cada seccion manualmente
- Prioriza automaticamente lo urgente
- Refuerza la disciplina GTD sin esfuerzo humano
- Puede incluir metricas clave (presupuesto, dotacion, compliance)

**Desventajas:**
- Si el contenido no es util, se convierte en "spam" y lo ignoran
- Consume tokens de Gemini/Ollama para generar cada resumen
- Requiere que los datos esten actualizados (basura entra, basura sale)
- Implementar emails requiere SMTP configurado
- Zonas horarias si el equipo esta en distintos paises

---

## 7. Confidence Score en GTD (Bouncer)

**Estado:** Diseñado en docs de Jose, no implementado
**Prioridad:** Media
**Contexto:** Building block #6 de Nate Jones. classify-idea.md no retorna score de confianza.

**Que implica:**
- Modificar `classify-idea.md` para incluir `confianza: 0.87` en output JSON
- En ideas.js: si confianza >= 0.7 -> clasificar automatico, si < 0.7 -> marcar "needs_review"
- Crear tabla `inbox_log` para audit trail completo de clasificaciones

**Ventajas:**
- Ideas con alta confianza se procesan solas — menos trabajo manual
- Ideas con baja confianza se marcan para revision humana — menos errores
- Audit trail completo: que entro, como se clasifico, con que confianza
- Permite mejorar el prompt con el tiempo (ver donde falla la IA)
- Alineado con la vision arquitectonica de Jose

**Desventajas:**
- El score de confianza de la IA no siempre es preciso (puede estar segura y equivocada)
- Agregar tabla inbox_log aumenta el uso de disco
- El umbral 0.7 es arbitrario — necesita ajuste con datos reales
- Mas complejidad en el flujo de ideas

---

## 8. WhatsApp / Email Ingestion

**Estado:** Diseñado en arquitectura de Jose, no implementado
**Prioridad:** Baja
**Contexto:** Capturar ideas directamente desde WhatsApp o email.

**Opciones:**
- WhatsApp Business API (costo mensual)
- Email: Microsoft Graph API o IMAP listener
- Webhook que recibe mensajes y los inyecta como ideas en el GTD

**Ventajas:**
- Captura sin friccion — mandas WhatsApp o email y listo
- No necesitas abrir el dashboard para capturar una idea rapida
- Funciona desde el celular sin app adicional
- Multiples canales de entrada = mas ideas capturadas

**Desventajas:**
- WhatsApp Business API tiene costo mensual (~$15-50/mes segun proveedor)
- Email ingestion requiere parsear HTML, attachments, spam
- Riesgo de spam: cualquiera podria inyectar basura si el email es publico
- Seguridad: mensajes de WhatsApp/email viajan por terceros
- Mantenimiento: si Meta cambia la API de WhatsApp, se rompe

---

## 9. 2FA (Autenticacion de Dos Factores)

**Estado:** No implementado
**Prioridad:** Media (requerido para ISO 27001)

**Opciones:**
- TOTP (Google Authenticator / Authy) — gratis, estandar
- Email OTP — mas simple pero menos seguro
- WebAuthn / Passkeys — moderno pero mas complejo

**Ventajas:**
- Si roban la contraseña, no pueden entrar sin el segundo factor
- Requisito para ISO 27001 y SOC 2
- TOTP es gratis y funciona offline
- Genera confianza en clientes que auditen la seguridad de VSC

**Desventajas:**
- Friccion para el usuario (sacar el celular cada login)
- Si pierden el celular, quedan bloqueados (necesita recovery codes)
- Email OTP depende de que el email funcione (si el servidor de email cae, nadie entra)
- Implementacion requiere cambios en login flow, BD (secret keys), y UI

---

## 10. Migracion Dashboard SQLite -> PostgreSQL

**Estado:** Evaluacion
**Prioridad:** Baja (SQLite funciona bien para el volumen actual)

**Cuando migrar:**
- Si hay mas de 10 usuarios concurrentes escribiendo
- Si necesitas joins complejos entre dashboard y correos
- Si quieres una sola BD para todo

**Ventajas:**
- Una sola BD para todo el sistema — queries cruzadas entre servicios
- Mejor rendimiento con muchas escrituras concurrentes
- Soporte nativo para pgcrypto, pgAudit, RLS
- Herramientas profesionales (pgAdmin, pg_dump, replicacion)
- Permite escalar a multiples instancias del dashboard

**Desventajas:**
- SQLite funciona perfecto para el volumen actual (~5-10 usuarios)
- Agrega complejidad innecesaria si no hay problemas de rendimiento
- Migracion de schema + datos requiere tiempo y testing
- PostgreSQL consume mas RAM que SQLite (~50-100MB base)
- Over-engineering si el equipo es pequeño
