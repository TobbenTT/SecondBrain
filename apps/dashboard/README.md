# SecondBrain Dashboard

Backend principal del sistema SecondBrain. Plataforma de gestion de conocimiento corporativo con metodologias PARA y GTD, captura de ideas por texto/voz, y procesamiento con IA.

## Stack

- **Runtime:** Node.js + Express.js 5
- **Base de datos:** SQLite (better-sqlite3)
- **IA:** Google Gemini API
- **Auth:** bcryptjs + express-session
- **Vistas:** EJS templates
- **Seguridad:** Helmet, CORS, rate limiting

## Como Ejecutar

```bash
cd apps/dashboard
cp .env.example .env    # Configurar variables
npm install
npm run dev             # Desarrollo (port 3000)
npm start               # Produccion
```

## Variables de Entorno

| Variable | Descripcion | Requerida |
|----------|-------------|-----------|
| `GEMINI_API_KEY` | API key de Google Gemini | Si |
| `SESSION_SECRET` | Secret para sesiones Express | Si |
| `PORT` | Puerto del servidor (default: 3000) | No |
| `NODE_ENV` | Entorno (development/production/test) | No |
| `ALLOWED_ORIGINS` | CORS origins permitidos | No |

## Tests

```bash
npm test          # Correr tests con coverage
npm run test:watch  # Modo watch
```

163 tests con Jest + Supertest cubriendo:
- API endpoints (CRUD ideas, auth, areas, GTD, stats)
- Database (schema, migrations, queries)
- Middleware (auth, authorization, roles)
- Helpers (utils, logger, ideaProcessor)
- Security (SQL injection, XSS, path traversal)
- Services (AI integration, file handling)

## Estructura

```
dashboard/
├── server.js           # Entry point + middleware config
├── database.js         # SQLite schema + migrations
├── routes/             # Express routes
│   ├── auth.js         #   Login/logout/registro
│   ├── ideas.js        #   CRUD ideas + voz
│   ├── ai.js           #   Procesamiento Gemini
│   ├── files.js        #   Upload/download archivos
│   ├── areas.js        #   Areas organizacionales
│   ├── gtd.js          #   Workflow GTD
│   ├── stats.js        #   Estadisticas
│   ├── admin.js        #   Administracion
│   ├── comments.js     #   Comentarios en ideas
│   ├── review.js       #   Revision de ideas
│   └── external.js     #   API externa
├── middleware/
│   ├── auth.js         #   Verificacion de sesion
│   └── authorize.js    #   Control de roles
├── helpers/
│   ├── logger.js       #   Winston logging
│   ├── utils.js        #   Utilidades generales
│   └── ideaProcessor.js #  Procesamiento de ideas
├── services/           # Logica de negocio
├── views/              # Templates EJS
├── public/             # CSS, JS, assets
├── data/               # SQLite DB + JSON seeds
├── __tests__/          # Test suite
└── .env.example        # Variables de entorno
```

## Roles

| Rol | Permisos |
|-----|----------|
| `admin` | Todo: CRUD usuarios, areas, configuracion |
| `user` | Crear/editar ideas propias, ver dashboard |
| `consultor` | Ver ideas asignadas, agregar comentarios |
