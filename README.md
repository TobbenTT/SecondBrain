# SecondBrain Dashboard

**Sistema de gestion de conocimiento corporativo con IA** para Value Strategy Consulting.

Implementa las metodologias **CODE** (Capture, Organize, Distill, Express), **PARA** (Projects, Areas, Resources, Archives) y **GTD** (Getting Things Done) con un motor de IA (Google Gemini) que clasifica, asigna y ejecuta automaticamente.

## Arquitectura

```
                       SecondBrain Dashboard
  ┌─────────────────────────────────────────────────────┐
  │  Frontend (EJS + Vanilla JS)                        │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
  │  │  Ideas   │ │   Chat   │ │Analytics │  ...        │
  │  └────┬─────┘ └────┬─────┘ └────┬─────┘            │
  ├───────┼────────────┼────────────┼───────────────────┤
  │  Express.js API (50+ endpoints)                     │
  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
  │  │  Routes  │ │Middleware│ │ Helpers  │             │
  │  │  9 files │ │Auth+RBAC │ │Processor │             │
  │  └────┬─────┘ └──────────┘ └────┬─────┘            │
  │       │                         │                   │
  │  ┌────┴──────────────────┐ ┌────┴──────────┐       │
  │  │   SQLite (13 tablas)  │ │  AI Service   │       │
  │  │   WAL mode + indexes  │ │  Google Gemini│       │
  │  └───────────────────────┘ └───────────────┘       │
  └─────────────────────────────────────────────────────┘
           │                           │
    ┌──────┴──────┐             ┌──────┴──────┐
    │  OpenClaw   │             │   Skills    │
    │  (webhook)  │             │  (Markdown) │
    └─────────────┘             └─────────────┘
```

## Funcionalidades

### Gestion de Ideas (CODE Flow)
- **Capture**: Texto libre o nota de voz (grabacion WebM con transcripcion en tiempo real)
- **Organize**: IA clasifica tipo, categoria, prioridad, asigna persona y area
- **Distill**: IA extrae la esencia y proxima accion concreta
- **Express**: Genera output profesional (plan, presupuesto, auditoria)

### Organizacion (PARA)
- **Projects**: Proyectos con deadline, descomposicion automatica en sub-tareas
- **Areas**: Areas de responsabilidad continuas (Operaciones, HSE, Finanzas, etc.)
- **Resources**: Contexto permanente — memoria corporativa DRY
- **Archives**: Items inactivos

### Productividad (GTD)
- Contextos de ejecucion (@computador, @email, @telefono, @oficina, @calle, @casa, @espera, @compras, @investigar, @reunion, @leer)
- Niveles de energia (baja, media, alta)
- Tipos de compromiso (comprometida, esta_semana, algun_dia, tal_vez)
- Lista "Waiting For" para delegaciones
- Checklist diario por usuario
- Reporte diario generado por IA
- Metricas de efectividad GTD

### Pipeline de Ejecucion con Agentes
- IA sugiere agente automaticamente (Staffing, Training, Finance, Compliance, GTD)
- Cada agente usa Skills (SOPs en Markdown) como instrucciones
- Genera documentos profesionales (planes de dotacion, presupuestos OPEX, auditorias)
- Output guardado y vinculado a la idea original

### Otras funciones
- Chat con IA (contexto conversacional + RAG desde memoria corporativa)
- Agente de investigacion profunda (Research Agent)
- Agente de revision critica (Review Agent)
- Gestion de archivos con tags (.md, .pdf, .txt, .docx)
- Biblioteca de Skills con visor integrado
- Analytics y estadisticas avanzadas
- Busqueda global (ideas, areas, contexto)
- Exportar/Importar datos (JSON)
- Integracion externa via API Keys + webhooks
- Modo oscuro
- Vista de reportabilidad (asignaciones del equipo)

## Stack tecnologico

| Capa | Tecnologia |
|------|------------|
| Backend | Express 5.2, Node.js 20+ |
| Templates | EJS |
| Base de datos | SQLite3 (WAL mode) |
| IA | Google Gemini 3 Flash (`@google/generative-ai`) |
| Seguridad | Helmet, bcryptjs, express-rate-limit, express-session |
| Logging | Winston (structured, daily rotation) |
| Frontend | Vanilla JS, CSS con dark mode |
| Testing | Jest + Supertest |
| Linting | ESLint + Prettier |
| Deploy | Docker (Node 20 Alpine) |

## Requisitos previos

- **Node.js** 20+
- **Google Gemini API Key** ([obtener aqui](https://aistudio.google.com/apikey))
- (Opcional) **Docker** para despliegue containerizado

## Instalacion

### Opcion 1: Local

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd SecondBrain

# Instalar dependencias
cd apps/dashboard
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu API Key de Gemini y un SESSION_SECRET seguro
```

### Opcion 2: Docker

```bash
# Desde la raiz del proyecto
docker build -t secondbrain .
docker run -d \
  --name secondbrain \
  -p 3000:3000 \
  -e GEMINI_API_KEY=tu-api-key \
  -e SESSION_SECRET=$(openssl rand -hex 32) \
  -e NODE_ENV=production \
  -v secondbrain-data:/app/data \
  secondbrain
```

La imagen incluye health check en `/health` con intervalo de 30 segundos.

## Configuracion

Crear un archivo `.env` en `apps/dashboard/`:

```env
# Requerida — API Key de Google Gemini
GEMINI_API_KEY=tu-api-key-de-gemini

# Requerida — Secreto para sesiones
# Generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=tu-secreto-aleatorio

# Opcional
PORT=3000                  # Puerto del servidor (default: 3000)
NODE_ENV=development       # development | production
ALLOWED_ORIGINS=           # Origenes CORS permitidos en produccion (separados por coma)
```

## Uso

### Iniciar el servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Produccion
npm start

# Con puerto personalizado
node server.js -p 8080
```

El servidor inicia en `http://localhost:3000`.

### Usuarios por defecto

| Usuario | Password | Rol | Departamento | Expertise |
|---------|----------|-----|-------------|-----------|
| david | vsc2026 | admin | Direccion | Estrategia, Operaciones, Gestion |
| gonzalo | vsc2026 | manager | Operaciones | HSE, Ejecucion, Contratos |
| jose | vsc2026 | analyst | Finanzas | Finanzas, Presupuestos, Analisis |

> Cambiar las contrasenas en produccion.

### Flujo tipico de uso

1. **Login** en `http://localhost:3000/login`
2. **Capturar idea**: Escribir texto o grabar nota de voz en la seccion "Ideas"
3. La IA automaticamente:
   - Clasifica el tipo (Tarea, Proyecto, Nota, Delegacion, Referencia)
   - Asigna la persona adecuada segun expertise del equipo
   - Sugiere area de responsabilidad y agente de ejecucion
   - Estima tiempo y determina prioridad
   - Asigna contexto GTD y nivel de energia
4. **Revisar** ideas organizadas — las de baja confianza se marcan para revision humana
5. **Ejecutar** con agente si aplica — genera plan, presupuesto, etc.
6. **Monitorear** progreso en Analytics, Checklist diario y Reporte IA

### Captura por voz

1. Click en el icono de microfono en la seccion Ideas
2. Hablar naturalmente — el sistema limpia muletillas automaticamente ("eh", "o sea", "bueno")
3. Si el audio contiene multiples ideas, la IA las separa automaticamente
4. Cada idea se clasifica y asigna individualmente

### Ejecucion con agentes

Cuando la IA detecta que una idea puede ejecutarse con un agente:

1. Aparece un badge del agente sugerido en la tarjeta (ej: "Staffing")
2. Click en "Ejecutar con [Agente]"
3. Confirmar agente y skills en el modal
4. El sistema genera el output (15-30 segundos)
5. El output queda vinculado a la idea y puede verse en cualquier momento

**Agentes disponibles:**

| Agente | Especialidad | Skills |
|--------|-------------|--------|
| Staffing | Dotacion, turnos, personal | create-staffing-plan, model-staffing-requirements |
| Training | Capacitacion, formacion | create-training-plan |
| Finance | Presupuestos, costos, OPEX | model-opex-budget |
| Compliance | Auditorias, cumplimiento, contratos | audit-compliance-readiness |
| GTD | Clasificacion, descomposicion, revision | classify-idea, decompose-project, identify-next-action, weekly-review |

### Chat con IA

La seccion Chat permite conversar con la IA en contexto:
- Tiene acceso a toda la memoria corporativa (context_items)
- Historial de conversacion persistente por sesion
- Puede discutir skills de la biblioteca
- Genera respuestas en Markdown con formato

### Analytics

La seccion de estadisticas muestra:
- Ideas por etapa CODE (captured, organized, distilled, expressed)
- Distribucion PARA (projects, areas, resources, archives)
- Ideas por dia/semana, tasas de completacion
- Productividad por usuario
- Areas mas activas

## API

### Autenticacion

Dos metodos soportados:

1. **Session** — Login via `/login` (navegador web)
2. **API Key** — Header `X-API-Key: sb_xxxxx` (integraciones externas)

Las API Keys se gestionan en la seccion de configuracion del dashboard o via endpoint.

### Endpoints principales

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/health` | Health check (publico) |
| POST | `/login` | Iniciar sesion |
| GET | `/api/ideas` | Listar ideas con filtros |
| POST | `/api/ideas` | Crear idea con clasificacion IA |
| POST | `/api/ideas/voice` | Subir nota de voz |
| POST | `/api/ideas/:id/organize` | Organizar idea (CODE) |
| POST | `/api/ideas/:id/distill` | Destilar idea (CODE) |
| POST | `/api/ideas/:id/express` | Expresar idea (CODE) |
| POST | `/api/ideas/:id/execute` | Ejecutar con agente |
| POST | `/api/ideas/:id/complete` | Marcar completada |
| POST | `/api/ideas/:id/decompose` | Descomponer proyecto en sub-tareas |
| PUT | `/api/ideas/:id/gtd` | Actualizar campos GTD |
| POST | `/api/ai/chat` | Chat con IA |
| POST | `/api/ai/research` | Investigacion profunda |
| POST | `/api/ai/review` | Revision critica |
| POST | `/api/ai/preview` | Preview de clasificacion antes de guardar |
| GET | `/api/ai/context` | Listar memoria corporativa |
| GET | `/api/areas` | Listar areas PARA |
| GET | `/api/stats/analytics` | Analytics avanzados |
| GET | `/api/gtd/daily-report` | Reporte diario IA |
| GET | `/api/gtd/effectiveness` | Metricas GTD |
| GET | `/api/checklist/:user` | Checklist diario |
| GET | `/api/waiting-for` | Lista de delegaciones |
| GET | `/api/search` | Busqueda global |
| POST | `/api/external/capture` | Captura externa (API Key) |
| GET | `/api/export` | Exportar datos (JSON) |
| POST | `/api/import` | Importar datos (admin) |
| GET | `/api/agents` | Listar agentes disponibles |

**Filtros de ideas** (query params en GET /api/ideas):
- `code_stage` — captured, organized, distilled, expressed
- `para_type` — project, area, resource, archive
- `area_id` — ID del area
- `assigned_to` — username asignado
- `contexto` — contexto GTD (@computador, @email, etc.)
- `energia` — baja, media, alta
- `completada` — 0 o 1
- `page`, `limit` — paginacion (max 100)

### Rate Limiting

| Scope | Limite |
|-------|--------|
| API general | 200 req / 15 min |
| AI endpoints | 15 req / 1 min |
| Login | 10 intentos / 15 min |
| Uploads | 10 req / 1 min |

### Ejemplo: Captura externa

```bash
curl -X POST http://localhost:3000/api/external/capture \
  -H "Content-Type: application/json" \
  -H "X-API-Key: sb_tu-api-key" \
  -d '{"text": "Revisar presupuesto Q2 del proyecto ACME", "source": "openclaw"}'
```

## Base de datos

SQLite con WAL mode, foreign keys habilitadas y busy_timeout de 5 segundos. 13 tablas con migraciones automaticas al iniciar:

| Tabla | Proposito |
|-------|-----------|
| `ideas` | Ideas/tareas — campos CODE, PARA, GTD, ejecucion, IA (65+ columnas) |
| `areas` | Areas de responsabilidad PARA |
| `context_items` | Memoria permanente — conocimiento DRY |
| `waiting_for` | Delegaciones GTD con tracking |
| `chat_history` | Historial de conversaciones IA |
| `projects` | Registro de proyectos con tech stack |
| `users` | Usuarios con roles, departamento y expertise |
| `inbox_log` | Auditoria de toda entrada al sistema |
| `api_keys` | Llaves para integraciones externas |
| `daily_checklist` | Tracking diario por usuario |
| `skills` | Catalogo de habilidades/SOPs |
| `material_apoyo` | Material de referencia |
| `gtd_contexts` | Contextos GTD predefinidos |

14 indexes para performance en queries frecuentes.

## Estructura del proyecto

```
SecondBrain/
├── Dockerfile                 # Imagen Docker produccion
├── .dockerignore
├── README.md
├── apps/dashboard/
│   ├── server.js              # Entry point Express
│   ├── database.js            # SQLite schema + migraciones + seeds
│   ├── package.json
│   ├── .env.example
│   ├── routes/
│   │   ├── auth.js            # Login / Logout
│   │   ├── ideas.js           # CRUD Ideas + CODE flow + ejecucion
│   │   ├── ai.js              # Chat, Research, Review, Context
│   │   ├── areas.js           # CRUD Areas PARA
│   │   ├── files.js           # Documentos + Skills
│   │   ├── gtd.js             # Contextos, Waiting-For, Checklist, Reportes
│   │   ├── stats.js           # Estadisticas y Analytics
│   │   ├── external.js        # API externa + Webhooks + API Keys
│   │   └── admin.js           # Usuarios, Proyectos, Search, Export/Import
│   ├── services/
│   │   ├── ai.js              # Motor IA (Gemini) + AGENT_CATEGORY_MAP
│   │   ├── orchestratorBridge.js  # Ejecucion de comandos del sistema
│   │   ├── researchAgent.js   # Agente de investigacion profunda
│   │   └── reviewAgent.js     # Agente de revision critica
│   ├── middleware/
│   │   ├── auth.js            # apiKeyAuth + requireAuth
│   │   └── authorize.js       # requireAdmin + requireOwnerOrAdmin
│   ├── helpers/
│   │   ├── ideaProcessor.js   # Pipeline de procesamiento de ideas
│   │   ├── logger.js          # Winston structured logging
│   │   ├── validate.js        # Validacion de request body
│   │   ├── AppError.js        # Clase de error operacional
│   │   └── utils.js           # Utilidades (formatFileSize, tags, escapeHtml)
│   ├── views/
│   │   ├── index.ejs          # Dashboard principal
│   │   ├── login.ejs          # Pagina de login
│   │   └── archivo.ejs        # Visor de documentos
│   ├── public/
│   │   ├── js/main.js         # Logica frontend (80+ funciones)
│   │   └── css/               # Estilos + dark mode + componentes
│   ├── data/                  # SQLite DB + tags.json + projects.json
│   └── __tests__/
│       ├── api.test.js        # Tests de integracion API (26+)
│       ├── database.test.js   # Tests de schema y CRUD
│       └── security.test.js   # Tests de seguridad (IDOR, auth, validation)
├── core/skills/               # SOPs en Markdown para agentes
└── knowledge/                 # Documentos subidos
```

## Testing

```bash
cd apps/dashboard

# Ejecutar todos los tests con cobertura
npm test

# Watch mode
npm run test:watch

# Lint
npm run lint

# Formatear
npm run format
```

**62 tests** cubriendo:
- Integration tests de API (endpoints, filtros, paginacion)
- Database schema validation y CRUD
- Security tests (IDOR, authorization, input validation, rate limiting)

## Seguridad

| Medida | Implementacion |
|--------|---------------|
| Headers HTTP | Helmet (CSP, X-Frame-Options, HSTS, etc.) |
| Passwords | bcrypt con salt rounds = 10 |
| Rate Limiting | Por endpoint (API, AI, Login, Upload) |
| IDOR | Middleware `requireOwnerOrAdmin` en recursos |
| RBAC | Roles admin, manager, analyst con `requireAdmin` |
| Sesiones | httpOnly, sameSite: lax, secure en produccion |
| SQL Injection | Queries 100% parametrizadas |
| CORS | Configurable por entorno (permisivo en dev, restrictivo en prod) |
| Input Validation | Middleware `validateBody` con sanitizacion |
| XSS | DOMPurify en frontend, `escapeHtml` en backend |

## Integracion con OpenClaw

SecondBrain se integra bidireccionalmente con [Sistema OpenClaw](https://github.com/tu-org/Sistema-OpenClaw):

- **OpenClaw → SecondBrain**: Captura resultados via `POST /api/external/capture`
- **SecondBrain → OpenClaw**: Webhook via `POST /api/webhook/openclaw`
- **API Key**: Se genera automaticamente al primer inicio (revisar logs del servidor)

## Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm start` | Servidor en modo produccion |
| `npm run dev` | Servidor con auto-reload (--watch) |
| `npm test` | Tests con cobertura (Jest) |
| `npm run test:watch` | Tests en modo watch |
| `npm run lint` | Verificar estilo de codigo |
| `npm run lint:fix` | Auto-corregir problemas de estilo |
| `npm run format` | Formatear codigo (Prettier) |
| `npm run format:check` | Verificar formato sin modificar |

## Licencia

Proyecto privado — Value Strategy Consulting
