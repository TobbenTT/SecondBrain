# Ideas Futuras — SecondBrain

> Estas ideas requieren investigacion y planificacion antes de implementarse.
> No son urgentes pero agregan valor a largo plazo.
> Ultima actualizacion: 2026-02-25

---

## 1. Migracion de Supabase a PostgreSQL Local

**Estado:** COMPLETADO en staging (Fase 2, feb 2026). Pendiente migrar produccion.
**Prioridad:** Media-Alta (ahorro de costos)
**Contexto:** Inteligencia-de-correos usa Supabase ($25/mes). Se puede reemplazar con PostgreSQL en Docker.

**Estrategia: Preparar en segundo plano sin afectar produccion**

Se puede dejar todo listo para que el dia que digan "SI" sea 1 click:

1. Agregar PostgreSQL 16 al docker-compose (contenedor corriendo pero nada lo usa todavia)
2. Crear script `migrate-to-postgres.sh` que:
   - Exporta de Supabase con `pg_dump`
   - Exporta de SQLite con `.dump`
   - Importa todo al PostgreSQL local
3. Preparar el codigo con env var `DB_ENGINE=sqlite|postgres` — el dashboard lee de uno u otro segun la variable
4. **Cuando digan SI**: cambiar `DB_ENGINE=postgres` en `.env`, correr el script, reiniciar contenedores

El dashboard sigue funcionando con SQLite mientras tanto. PostgreSQL corre en paralelo sin que nadie lo note.

**Que implica (tecnico):**

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
- Se puede preparar sin afectar produccion (todo en paralelo)

**Desventajas:**

- Pierdes Supabase Auth (hay que replicar con auth del dashboard)
- RLS de Supabase hay que configurarlo manual en PostgreSQL nativo
- Tu eres responsable de los updates de seguridad de PostgreSQL
- Necesita ventana de mantenimiento para la migracion (downtime minimo si se prepara bien)
- Si el VPS cae, la BD cae con el (en Supabase estan separados)

---

## 2. Redis para Sesiones Persistentes

**Estado:** COMPLETADO en staging (Fase 3, feb 2026). Redis 7 Alpine + connect-redis. Pendiente produccion.
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

**Estado:** PARCIAL en staging (Fase 5, feb 2026). Account lockout, audit log, redes Docker, GPG backups, fail2ban. Pendiente pgAudit, WAF, certificaciones.
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

| Certificacion | Para que                                                          | Timeline   |
| ------------- | ----------------------------------------------------------------- | ---------- |
| ISO 27001     | Gestion seguridad informacion — minimo para licitaciones grandes | 6-12 meses |
| ISO 27701     | Extension privacidad (cubre GDPR + leyes LATAM)                   | 6-12 meses |
| SOC 2 Type I  | Controles de seguridad definidos                                  | 3-6 meses  |
| SOC 2 Type II | Controles funcionando 6+ meses                                    | 12+ meses  |

### 3.6 Regulaciones por mercado

| Region   | Ley               | Aplica si...                       |
| -------- | ----------------- | ---------------------------------- |
| Chile    | Ley 21.719 (2026) | Guardas datos de personas chilenas |
| EU       | GDPR              | Clientes o datos de personas EU    |
| Brasil   | LGPD              | Clientes brasileños               |
| Colombia | Ley 1581          | Clientes colombianos               |
| USA      | SOC 2 + CCPA      | Clientes americanos                |

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

## 9. 2FA Adaptativo (Risk-Based Authentication)

**Estado:** COMPLETADO en staging (Fase 4, feb 2026). TOTP + recovery codes + trusted devices. WebAuthn pendiente.
**Prioridad:** Media (requerido para ISO 27001)

**Enfoque:** 2FA adaptativo — NO pedir segundo factor siempre, solo cuando hay riesgo.

**Cuando se pide 2FA:**

| Situacion                                                     | 2FA? |
| ------------------------------------------------------------- | ---- |
| Login desde IP conocida + dispositivo habitual                | No   |
| Login desde IP nueva o pais diferente                         | Si   |
| Login despues de 30 dias sin verificar                        | Si   |
| Accion sensible (borrar datos, cambiar password, admin panel) | Si   |
| 3+ intentos fallidos de login en esa cuenta                   | Si   |
| Cambiar email o rol de usuario                                | Si   |

**Implementacion tecnica:**

- Tabla `trusted_devices` (IP + user-agent hash + fecha de ultimo 2FA)
- Si combo IP+device esta en la tabla y no ha expirado → skip 2FA
- Si es nuevo → pedir TOTP o email OTP
- Para acciones sensibles → siempre pedir, sin importar dispositivo

**Opciones de segundo factor:**

| Metodo                                                | Como funciona                                                                | Pros                                                           | Contras                                          |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| TOTP (Microsoft Authenticator / Google Authenticator) | Codigo de 6 digitos que cambia cada 30 segundos                              | Gratis, funciona offline, estandar                             | Requiere sacar el celular                        |
| WebAuthn / Passkeys (RECOMENDADO)                     | El navegador usa Windows Hello: PIN, huella digital, o reconocimiento facial | Mas rapido (1 toque), no necesitas celular, phishing-resistant | Requiere navegador moderno y hardware compatible |
| Email OTP                                             | Codigo enviado por email                                                     | Simple de implementar                                          | Menos seguro, depende del email                  |
| Push notification                                     | Microsoft Authenticator envia "Aprobar/Rechazar" al celular                  | Muy comodo, 1 tap                                              | Requiere internet en el celular                  |

**Recomendacion:** Soportar multiples metodos. WebAuthn como principal (huella/PIN de Windows Hello) + TOTP como fallback (Microsoft Authenticator en el celular). El usuario elige cual prefiere.

**WebAuthn en detalle (huella / PIN / cara):**

- El navegador (Chrome, Edge, Firefox) detecta Windows Hello automaticamente
- El usuario registra su dispositivo una vez (huella, PIN, o cara)
- En el siguiente login que requiera 2FA → el navegador pide la huella/PIN directamente
- No se envia nada por internet — la verificacion es local en el dispositivo
- Si el usuario cambia de PC → usa TOTP como fallback hasta registrar el nuevo dispositivo
- Libreria npm: `@simplewebauthn/server` + `@simplewebauthn/browser`

**Ventajas:**

- Si roban la contraseña, no pueden entrar sin el segundo factor
- Requisito para ISO 27001 y SOC 2
- TOTP es gratis y funciona offline
- Genera confianza en clientes que auditen la seguridad de VSC
- Sin friccion en uso diario — solo pide 2FA cuando hay riesgo real
- Acciones sensibles siempre protegidas aunque el login fue normal

**Desventajas:**

- Si pierden el celular, quedan bloqueados (necesita recovery codes)
- Email OTP depende de que el email funcione (si el servidor de email cae, nadie entra)
- Implementacion requiere cambios en login flow, BD (secret keys, trusted_devices), y UI
- La logica de "riesgo" puede tener falsos positivos (VPN cambia IP constantemente)

---

## 10. Migracion Dashboard SQLite -> PostgreSQL

**Estado:** COMPLETADO en staging (Fase 2, feb 2026). Dashboard usa PostgreSQL 16 en staging. Pendiente produccion.
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

---

## 11. Staging Environment (Entorno de Pruebas)

**Estado:** COMPLETADO (Fase 1, feb 2026). staging.aiprowork.com operativo con PostgreSQL, Redis, basic auth.
**Prioridad:** Media-Alta (previene errores en produccion)
**Contexto:** Tener una copia identica del sistema donde probar cambios antes de pasarlos a produccion.

**Como funciona:**

- **Produccion** (`app.tudominio.com`): Lo que ven los usuarios reales, datos reales
- **Staging** (`staging.tudominio.com`): Copia identica donde pruebas features nuevos, con datos de prueba
- Cuando un cambio funciona bien en staging → se pasa a produccion con confianza

**Implementacion con Docker:**

- Segundo `docker-compose.staging.yml` con los mismos servicios pero en puertos distintos
- BD separada (copia de produccion o datos de prueba) — nunca tocar datos reales
- Subdominio `staging.tudominio.com` apuntando al mismo VPS via nginx
- Mismo codigo pero en branch `staging` o `develop` de git
- Proteger con password (nginx basic auth) para que solo el equipo acceda

```
Flujo de trabajo:
  develop branch → staging (pruebas) → main branch → produccion

  Desarrollador hace cambios
       ↓
  Push a branch develop
       ↓
  Deploy automatico a staging.tudominio.com
       ↓
  Probar que todo funciona (QA)
       ↓
  Merge a main → deploy a produccion
```

**Ventajas:**

- Nunca rompes produccion — los errores se detectan en staging antes
- Puedes probar features grandes sin miedo (ej: migracion de BD, 2FA, etc.)
- El CEO/equipo puede ver y aprobar cambios antes de que salgan en vivo
- Estandar de la industria — requisito para ISO 27001 y SOC 2
- Si staging falla, produccion sigue funcionando sin problema
- Permite hacer testing de carga sin afectar usuarios reales

**Desventajas:**

- Consume recursos del VPS (duplicas contenedores — ~200-500MB RAM extra)
- Necesita mantener datos de prueba actualizados (o script para copiar de produccion)
- Un servicio mas que mantener (actualizar staging tambien cuando hay cambios de infra)
- Si el VPS es limitado en RAM, puede no ser viable tener ambos corriendo a la vez
- Requiere disciplina: si el equipo no usa staging, es desperdicio de recursos

---

## ROADMAP — Orden de Ejecucion

> Staging primero, luego probar todo lo grande ahi antes de tocar produccion.

### Fase 1: Staging Environment (Idea #11) — COMPLETADO

- [X] Crear `docker-compose.staging.yml`
- [X] Configurar subdominio `staging.aiprowork.com` en nginx
- [X] Proteger con basic auth
- [ ] Branch `develop` apunta a staging (se trabaja directo en main por ahora)

### Fase 2: PostgreSQL Local en Staging (Ideas #1 y #10) — COMPLETADO

- [X] Agregar contenedor PostgreSQL 16 al compose de staging
- [X] Migrar SQLite del dashboard al mismo PostgreSQL en staging (28 tablas)
- [X] Auth local con bcrypt (sin Supabase en staging)
- [X] Seeds con usuarios de prueba (david, gonzalo, jose, consultor)
- [ ] Migrar datos de Supabase (correos) al PostgreSQL local en staging
- [ ] Cuando pase QA → pasar a produccion

### Fase 3: Redis + Sesiones (Idea #2) — COMPLETADO en staging

- [X] Agregar Redis 7 Alpine al compose de staging
- [X] Reemplazar MemoryStore por RedisStore (condicional con REDIS_HOST)
- [X] Health check incluye estado de Redis
- [ ] Verificar que sesiones sobreviven reinicios (pendiente test en VPS)
- [ ] Pasar a produccion

### Fase 4: 2FA Adaptativo (Idea #9) — COMPLETADO en staging

- [X] TOTP con Google/Microsoft Authenticator (otplib + qrcode)
- [X] Secretos TOTP encriptados con AES-256-GCM
- [X] Codigos de recuperacion (10 single-use, bcrypt-hashed)
- [X] Dispositivos confiables (30 dias, IP + user-agent hash)
- [X] 2FA adaptativo (risk-based: IP nueva, dispositivo nuevo, 3+ fallos)
- [X] QR code con expiracion de 3 minutos
- [X] Admin puede forzar 2FA por usuario
- [ ] WebAuthn (huella/PIN/cara) — Fase 4b futura
- [ ] Probar en staging y pasar a produccion

### Fase 5: Seguridad avanzada (Ideas #3 y #4) — COMPLETADO en staging

- [X] Bloqueo de cuenta tras 5 intentos fallidos en 15 min (lockout 30 min)
- [X] Tabla audit_log con 15 tipos de eventos de seguridad
- [X] Visor de auditoria en admin con filtros (evento, actor, fecha)
- [X] Redes Docker separadas (web + internal) — BD/Redis solo accesibles internamente
- [X] Backups encriptados con GPG (opcional, auto-detecta key)
- [X] fail2ban configurado (5 intentos en 10 min → ban 30 min)
- [X] Admin puede desbloquear cuentas manualmente
- [X] Rate limiting ya existente (nginx + express-rate-limit)
- [ ] Generar GPG key en VPS y probar backup encriptado
- [ ] Copiar configs fail2ban al VPS y verificar
- [ ] Probar redes Docker con docker compose down && up
- [ ] Pasar a produccion

### Fase 6: Features de valor (Ideas #6 y #7)

- Daily Digest automatico (Tap on Shoulder)
- Confidence Score en GTD (Bouncer)

### Fase 7: Largo plazo (Ideas #5 y #8)

- File Manager para CEO (esperar requisitos)
- WhatsApp / Email ingestion

```
Timeline visual (actualizado feb 2026):

Fase 1 ████████████████████  Staging           DONE
Fase 2 ████████████████████  PostgreSQL local   DONE (staging)
Fase 3 ████████████████████  Redis sesiones     DONE (staging)
Fase 4 ████████████████████  2FA adaptativo     DONE (staging)
Fase 5 ████████████████████  Seguridad avanzada DONE (staging)
Fase 6 ░░░░░░░░░░░░░░░░░░██  Features de valor SIGUIENTE
Fase 7 ░░░░░░░░░░░░░░░░░░░░  Largo plazo
```
