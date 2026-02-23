# SecondBrain Orchestrator

Dashboard de visualizacion de modulos organizacionales. Interfaz moderna para gestionar Staffing, Training, Finance, Audit y Skills del sistema SecondBrain.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **UI:** Tailwind CSS + Framer Motion + Lucide Icons
- **Linting:** ESLint (next config)

## Como Ejecutar

```bash
cd apps/orchestrator
npm install
npm run dev       # Desarrollo (port 3001)
npm run build     # Build produccion
npm start         # Produccion (port 3001)
```

## Modulos

| Modulo | Ruta | Descripcion |
|--------|------|-------------|
| Staffing | `/staffing` | Planificacion de dotacion y turnos |
| Training | `/training` | Gestion de capacitacion y cursos |
| Finance | `/finance` | Calculos financieros y presupuestos |
| Audit | `/audit` | Auditorias y compliance |
| Database | `/database` | Visualizacion de datos |
| Skills Lab | `/skills-lab` | Explorador de skills del sistema |

Cada modulo tiene su pagina frontend (`app/{modulo}/page.tsx`) y API routes (`app/api/{modulo}/route.ts`).

## Tests

```bash
npm test          # Tests de integridad
npm run build     # Verificacion TypeScript completa
```

## Estructura

```
orchestrator/
├── app/                    # Next.js App Router
│   ├── layout.tsx          #   Root layout
│   ├── page.tsx            #   Home dashboard
│   ├── globals.css         #   Estilos globales
│   ├── api/                #   API routes
│   │   ├── staffing/
│   │   ├── training/
│   │   ├── finance/
│   │   ├── audit/
│   │   ├── database/
│   │   └── skills/
│   ├── staffing/           #   Paginas de modulos
│   ├── training/
│   ├── finance/
│   ├── audit/
│   ├── database/
│   └── skills-lab/
├── components/             # Componentes React compartidos
├── lib/                    # Utilidades
├── public/                 # Assets estaticos
├── seeds/                  # Datos iniciales
├── __tests__/              # Test suite
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```
