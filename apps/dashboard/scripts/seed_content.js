const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(DB_PATH);

const SKILLS = [
    {
        name: "Guía: Segundo Cerebro",
        description: "Aprende a capturar, organizar y revisar con este sistema.",
        content: `
# 🧠 Cómo usar tu Segundo Cerebro

Este sistema está diseñado para liberar tu mente. No intentes recordar todo, anótalo.

## flujo de Trabajo
1. **Capturar**: Usa el micrófono o texto en "Ideas" para cualquier pensamiento rápido.
2. **Procesar**: Usa el botón "Procesar" para que la IA categorice y extraiga tareas.
3. **Revisar**: Usa el "Weekly Review Agent" cada viernes.

## Tips
* Usa **tags** en tus archivos para encontrarlos rápido.
* Sube PDFs de referencia a la sección **Archivos**.
        `,
        tags: "onboarding,core"
    },
    {
        name: "Guía: Deep Research",
        description: "Cómo usar el agente de investigación profunda.",
        content: `
# 🕵️ Deep Research Agent

Este agente no solo busca en Google, razona sobre el tema.

## Cuándo usarlo
* Necesitas entender un tema complejo (ej: "Impacto de Quantum Computing en Ciberseguridad").
* Quieres un resumen comparativo de tecnologías.

## Cómo usarlo
1. Ve al Dashboard Principal -> Overview.
2. Click en la tarjeta **Deep Research**.
3. Escribe tu pregunta con detalles.
        `,
        tags: "ai,research"
    },
    {
        name: "Guía: Notas de Voz",
        description: "Cómo usar el reconocimiento de voz efectivamente.",
        content: `
# 🎤 Notas de Voz

El sistema usa la API nativa del navegador para transcribir en tiempo real.

## Instrucciones
1. Click en el icono de micrófono.
2. Habla claro y pausado.
3. Di "Punto" o "Coma" para puntuación básica (depende del navegador).
4. El texto se añade al de "Nueva Idea".
5. Si grabas audio (móvil), también se guarda el archivo .webm.
        `,
        tags: "voice,tools"
    }
];

const MEMORIES = [
    {
        key: "Reglas de IA",
        content: "La IA debe ser siempre concisa, usar formato Markdown y nunca inventar datos sin avisar. Priorizar listas y negritas.",
        category: "core"
    },
    {
        key: "Preferencias de Usuario",
        content: "El usuario prefiere el modo oscuro. Le gusta que las respuestas sean directas al grano. El idioma principal es Español.",
        category: "preference"
    }
];

db.serialize(() => {
    // Create Tables if not exist (to ensure seed works standalone)
    db.run(`CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        name TEXT,
        description TEXT,
        content TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS context_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        content TEXT,
        category TEXT,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Skills
    const stmtSkill = db.prepare("INSERT OR IGNORE INTO skills (id, name, description, content, tags) VALUES (?, ?, ?, ?, ?)");
    SKILLS.forEach(s => {
        const id = crypto.randomUUID();
        stmtSkill.run(id, s.name, s.description, s.content, s.tags);
    });
    stmtSkill.finalize();

    // Context / Memory
    const stmtMem = db.prepare("INSERT OR IGNORE INTO context_items (key, content, category) VALUES (?, ?, ?)");
    MEMORIES.forEach(m => {
        stmtMem.run(m.key, m.content, m.category);
    });
    stmtMem.finalize();

    console.log("✅ Contenido semilla insertado correctamente.");
});

db.close();
