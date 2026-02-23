# Lililia

Portal institucional ligero de SecondBrain. Landing page y dashboard de visualizacion con server-side rendering.

## Stack

- **Runtime:** Node.js + Express.js 5
- **Vistas:** EJS templates
- **Assets:** CSS/JS estaticos

## Como Ejecutar

```bash
cd apps/lililia
npm install
npm start         # Produccion (port 3002)
```

## Rutas

| Ruta | Vista | Descripcion |
|------|-------|-------------|
| `/` | `index.ejs` | Landing page institucional |
| `/dashboard` | `dashboard.ejs` | Dashboard de visualizacion |

## Tests

```bash
npm test          # Smoke tests con coverage
```

## Estructura

```
lililia/
├── server.js           # Entry point Express
├── views/
│   ├── index.ejs       #   Landing page
│   ├── dashboard.ejs   #   Dashboard
│   └── partials/       #   Componentes reutilizables
├── public/             # CSS, JS, imagenes
├── __tests__/          # Test suite
└── package.json
```
