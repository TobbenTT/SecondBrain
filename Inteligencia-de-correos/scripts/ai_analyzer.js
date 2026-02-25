/**
 * ai_analyzer.js - Análisis de reuniones con 3 niveles de calidad
 * 
 * NIVEL 🟢 ÓPTIMO:  Gemini analiza transcripción + metadata Fireflies
 * NIVEL 🟡 BUENO:   Gemini falla → Usar metadata de Fireflies directamente
 * NIVEL 🔴 MÍNIMO:  Sin Gemini ni metadata → Resultado básico limpio
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// -----------------------------------------------------------
// CONSTANTES
// -----------------------------------------------------------
const MAX_CHARS_GEMINI = 25000;  // ~6K tokens, seguro para free tier
const MAX_RETRIES = 3;

// -----------------------------------------------------------
// PROMPT PARA GEMINI
// -----------------------------------------------------------
const SYSTEM_PROMPT = `Eres un analista experto en reuniones corporativas.
Tu tarea es extraer información ESTRUCTURADA de la transcripción de una reunión.

REGLAS ESTRICTAS:
1. ASISTENTES: Solo nombres propios de personas reales (ej: "Gonzalo", "David López"). 
   NUNCA incluyas palabras genéricas, tecnologías, o conceptos.
2. RESUMEN: Un párrafo coherente de 3-5 frases que explique los temas principales de la reunión.
3. TEMAS: Lista de las áreas temáticas principales discutidas.
4. ACUERDOS: Decisiones concretas tomadas por el grupo.
5. COMPROMISOS: Tareas asignadas a personas específicas.
6. Si no puedes identificar algo con certeza, usa una lista vacía [].

Responde ÚNICAMENTE con JSON válido (sin texto adicional, sin backticks, sin markdown):
{
  "asistentes": ["nombre1", "nombre2"],
  "resumen": "Párrafo coherente describiendo la reunión",
  "temas": ["tema1", "tema2"],
  "acuerdos": ["decisión1", "decisión2"],
  "compromisos": [{"tarea": "descripción", "quien": "nombre", "cuando": "fecha o Por definir", "prioridad": "Alta/Media/Baja"}],
  "entregables": ["doc1", "doc2"],
  "proxima_reunion": "YYYY-MM-DD o null"
}`;

// -----------------------------------------------------------
// FUNCIÓN PRINCIPAL
// -----------------------------------------------------------

/**
 * Analiza una reunión usando 3 niveles de calidad
 * @param {Object} reunion - Objeto completo con fullText y fireflies metadata
 */
async function analizarConIA(reunion) {
    // Compatibilidad: si recibe un string, convierte a objeto
    if (typeof reunion === 'string') {
        reunion = { fullText: reunion, fireflies: null };
    }

    const transcripcion = reunion.fullText || '';
    const fireflies = reunion.fireflies || {};
    const apiKey = process.env.AI_API_KEY;

    console.log('\n[IA] ══════════════════════════════════════');
    console.log('[IA] INICIO DE ANÁLISIS');
    console.log(`[IA]   Transcripción: ${transcripcion.length} chars`);
    console.log(`[IA]   Fireflies overview: ${fireflies.overview ? 'SÍ' : 'NO'}`);
    console.log(`[IA]   Fireflies action_items: ${fireflies.action_items ? 'SÍ' : 'NO'}`);
    console.log(`[IA]   Fireflies participants: ${(fireflies.participants || []).length}`);
    console.log(`[IA]   Fireflies speakers: ${(fireflies.speakers || []).length}`);
    console.log('[IA] ══════════════════════════════════════');

    // ───────────────────────────────────────────────
    // NIVEL 🟢 ÓPTIMO: Intentar con Gemini
    // ───────────────────────────────────────────────
    if (apiKey && apiKey !== 'tu_api_key_aqui' && transcripcion.length > 20) {
        const resultadoGemini = await intentarGemini(transcripcion, fireflies, apiKey);
        if (resultadoGemini) {
            resultadoGemini._nivel = '🟢 ÓPTIMO (Gemini)';
            console.log('[IA] ✅ Nivel ÓPTIMO: Análisis Gemini exitoso');
            return resultadoGemini;
        }
    } else {
        console.log('[IA] ⚠️ Gemini no disponible (sin API key o transcripción vacía)');
    }

    // ───────────────────────────────────────────────
    // NIVEL 🟡 BUENO: Usar metadata de Fireflies
    // ───────────────────────────────────────────────
    const resultadoFireflies = construirDesdeFireflies(fireflies);
    if (resultadoFireflies) {
        resultadoFireflies._nivel = '🟡 BUENO (Fireflies metadata)';
        console.log('[IA] ✅ Nivel BUENO: Datos de Fireflies usados directamente');
        return resultadoFireflies;
    }

    // ───────────────────────────────────────────────
    // NIVEL 🔴 MÍNIMO: Sin datos estructurados
    // ───────────────────────────────────────────────
    console.log('[IA] ⚠️ Nivel MÍNIMO: Sin Gemini ni metadata de Fireflies');
    return {
        asistentes: ['Participantes no identificados'],
        resumen: 'El análisis automatizado no estuvo disponible para esta reunión. Por favor revisar la transcripción completa adjunta.',
        temas: ['Pendiente de análisis'],
        acuerdos: [],
        compromisos: [],
        entregables: [],
        proxima_reunion: null,
        _nivel: '🔴 MÍNIMO (sin datos)'
    };
}

// -----------------------------------------------------------
// NIVEL 🟢: GEMINI
// -----------------------------------------------------------

async function intentarGemini(transcripcion, fireflies, apiKey) {
    const textoPreparado = prepararTextoParaGemini(transcripcion, fireflies);
    const modelo = process.env.AI_MODEL || 'gemini-2.0-flash';

    for (let intento = 1; intento <= MAX_RETRIES; intento++) {
        try {
            console.log(`\n[GEMINI] 🔄 Intento ${intento}/${MAX_RETRIES} — Modelo: ${modelo}`);
            console.log(`[GEMINI]    Texto enviado: ${textoPreparado.length} chars`);

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelo });

            const prompt = `${SYSTEM_PROMPT}\n\n--- TRANSCRIPCIÓN ---\n${textoPreparado}\n--- FIN ---`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            console.log(`[GEMINI] ✅ Respuesta recibida (${text.length} chars)`);

            // Limpiar y parsear JSON
            text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                console.error('[GEMINI] ❌ No se encontró JSON válido en respuesta');
                if (intento < MAX_RETRIES) continue;
                return null;
            }

            const datos = JSON.parse(jsonMatch[0]);
            return validarResultado(datos);

        } catch (error) {
            const msg = error.message || String(error);
            console.error(`[GEMINI] ❌ Error intento ${intento}: ${msg.substring(0, 200)}`);

            const isRateLimit = msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota');

            if (isRateLimit && intento < MAX_RETRIES) {
                const waitSecs = 15 * intento; // 15s, 30s, 45s
                console.log(`[GEMINI] ⏳ Rate limit. Esperando ${waitSecs}s...`);
                await new Promise(r => setTimeout(r, waitSecs * 1000));
                continue;
            }

            if (intento < MAX_RETRIES) {
                await new Promise(r => setTimeout(r, 5000));
                continue;
            }
        }
    }

    console.log('[GEMINI] ❌ Todos los reintentos agotados');
    return null;
}

/**
 * Prepara el texto para Gemini: incluye metadata de Fireflies + transcripción resumida
 */
function prepararTextoParaGemini(transcripcion, fireflies) {
    let partes = [];

    // Incluir metadata de Fireflies PRIMERO (es información ya procesada)
    if (fireflies.overview) {
        partes.push(`RESUMEN PREVIO (generado por sistema de transcripción):\n${fireflies.overview}`);
    }
    if (fireflies.action_items) {
        partes.push(`ACCIONES IDENTIFICADAS:\n${fireflies.action_items}`);
    }
    if (fireflies.shorthand_bullet) {
        partes.push(`PUNTOS CLAVE:\n${fireflies.shorthand_bullet}`);
    }
    if (fireflies.participants && fireflies.participants.length > 0) {
        partes.push(`PARTICIPANTES REGISTRADOS: ${fireflies.participants.join(', ')}`);
    }
    if (fireflies.speakers && fireflies.speakers.length > 0) {
        partes.push(`SPEAKERS EN AUDIO: ${fireflies.speakers.join(', ')}`);
    }

    // Agregar transcripción (resumida si es muy larga)
    const lineas = transcripcion.split('\n').filter(l => l.trim().length > 0);
    const maxLineas = 400; // ~25K chars aprox

    if (lineas.length <= maxLineas) {
        partes.push(`TRANSCRIPCIÓN COMPLETA:\n${transcripcion}`);
    } else {
        // Tomar inicio, secciones con contenido clave, y final
        const inicio = lineas.slice(0, 80).join('\n');
        const final = lineas.slice(-80).join('\n');

        // Buscar líneas con contenido relevante
        const relevantes = [];
        const patronClave = /(?:acuerd|compromis|tarea|responsable|pendiente|decidimos|vamos a|necesitamos|hay que|te encargo|para el|entreg|fecha límite|plazo|urgente|importante)/i;

        for (let i = 80; i < lineas.length - 80; i++) {
            if (patronClave.test(lineas[i])) {
                // contexto: línea anterior + actual + siguiente
                const ctx = lineas.slice(Math.max(80, i - 1), Math.min(lineas.length - 80, i + 2));
                relevantes.push(...ctx);
            }
        }
        const medio = [...new Set(relevantes)].join('\n');

        partes.push(`TRANSCRIPCIÓN (${lineas.length} líneas, resumida):`);
        partes.push(`=== INICIO ===\n${inicio}`);
        if (medio.length > 0) partes.push(`=== SECCIONES CLAVE ===\n${medio}`);
        partes.push(`=== CIERRE ===\n${final}`);
    }

    let resultado = partes.join('\n\n');

    // Truncar si aún excede el límite
    if (resultado.length > MAX_CHARS_GEMINI) {
        resultado = resultado.substring(0, MAX_CHARS_GEMINI);
    }

    return resultado;
}

// -----------------------------------------------------------
// NIVEL 🟡: CONSTRUIR DESDE FIREFLIES METADATA
// -----------------------------------------------------------

/**
 * Construye resultado estructurado desde metadata de Fireflies.
 * Parsea inteligentemente el formato específico de Fireflies:
 *  - Overview: "- **Título:** Descripción" → párrafo limpio
 *  - Action Items: "**Persona**\nTarea1 (timestamp)" → compromisos con responsable
 *  - Shorthand Bullet: "🚀 **Título** (HH:MM - HH:MM)\nDetalle" → temas limpios
 */
function construirDesdeFireflies(fireflies) {
    if (!fireflies) return null;

    const tieneOverview = fireflies.overview && fireflies.overview.length > 10;
    const tieneActionItems = fireflies.action_items && fireflies.action_items.length > 5;
    const tieneBullets = fireflies.shorthand_bullet && fireflies.shorthand_bullet.length > 5;

    if (!tieneOverview && !tieneActionItems && !tieneBullets) {
        console.log('[FIREFLIES] Sin metadata suficiente');
        return null;
    }

    console.log('[FIREFLIES] Construyendo resultado desde metadata...');

    // ─── 1. ASISTENTES: Extraer nombres de action_items headers ───
    let asistentes = [];

    // Primero: participantes del API de Fireflies
    if (fireflies.participants && fireflies.participants.length > 0) {
        asistentes = fireflies.participants.filter(p => p && typeof p === 'string' && p.length > 1);
    }

    // Si no hay participantes, extraer nombres de los headers **Nombre** en action_items
    if (asistentes.length === 0 && tieneActionItems) {
        const nombresRegex = /^\*\*([A-Za-záéíóúñÁÉÍÓÚÑ\s]+)\*\*$/gm;
        let match;
        while ((match = nombresRegex.exec(fireflies.action_items)) !== null) {
            const nombre = match[1].trim();
            if (nombre.length >= 2 && nombre.length <= 30) {
                asistentes.push(nombre);
            }
        }
    }

    // Fallback: speakers del audio
    if (asistentes.length === 0 && fireflies.speakers && fireflies.speakers.length > 0) {
        asistentes = fireflies.speakers.filter(s => s && s.length > 1);
    }

    if (asistentes.length === 0) {
        asistentes = ['Participantes no identificados'];
    }

    console.log(`[FIREFLIES]   Asistentes extraídos: ${asistentes.join(', ')}`);

    // ─── 2. RESUMEN: Limpiar markdown del overview ───
    let resumen = 'Resumen no disponible';
    if (tieneOverview) {
        resumen = limpiarOverview(fireflies.overview);
    } else if (tieneBullets) {
        resumen = limpiarBullets(fireflies.shorthand_bullet);
    }

    // ─── 3. COMPROMISOS: Parsear action_items con responsable ───
    let compromisos = [];
    if (tieneActionItems) {
        compromisos = parsearActionItems(fireflies.action_items);
    }

    // ─── 4. TEMAS: Parsear shorthand_bullet ───
    let temas = [];
    if (tieneBullets) {
        temas = parsearTemas(fireflies.shorthand_bullet);
    }

    // ─── 5. ACUERDOS: Extraer del overview los puntos clave ───
    let acuerdos = [];
    if (tieneOverview) {
        acuerdos = extraerAcuerdos(fireflies.overview);
    }

    return {
        asistentes,
        resumen,
        temas: temas.length > 0 ? temas : ['Temas según transcripción'],
        acuerdos,
        compromisos,
        entregables: [],
        proxima_reunion: null
    };
}

// -----------------------------------------------------------
// FUNCIONES DE PARSING DE FORMATO FIREFLIES
// -----------------------------------------------------------

/**
 * Limpia el overview de Fireflies:
 * IN:  "- **MVP funcional:** Creación de... - **Interfaz visual:** Página web..."
 * OUT: "MVP funcional: Creación de... Interfaz visual: Página web..."
 */
function limpiarOverview(overview) {
    return overview
        .replace(/\*\*/g, '')           // Quitar markdown bold
        .replace(/^-\s*/gm, '')         // Quitar bullets
        .replace(/\n{2,}/g, '. ')       // Párrafos → frases separadas por punto
        .replace(/\n/g, ' ')            // Saltos de línea → espacios
        .replace(/\s{2,}/g, ' ')        // Espacios múltiples
        .replace(/\.\s*\./g, '.')       // Puntos dobles
        .trim();
}

/**
 * Limpia shorthand_bullets para generar resumen alternativo
 */
function limpiarBullets(bullets) {
    return bullets
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Emojis
        .replace(/\*\*/g, '')
        .replace(/\(\d{1,2}:\d{2}(?::\d{2})?\s*-?\s*\d{0,2}:?\d{0,2}:?\d{0,2}\)/g, '') // Timestamps
        .replace(/\n{2,}/g, '. ')
        .replace(/\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

/**
 * Parsea action_items de Fireflies a compromisos estructurados:
 * IN:  "**David**\nTarea1 (00:05)\nTarea2 (22:38)\n\n**Gonzalo**\nTarea3"
 * OUT: [{tarea: "Tarea1", quien: "David"}, {tarea: "Tarea2", quien: "David"}, ...]
 */
function parsearActionItems(actionItems) {
    const compromisos = [];
    let responsableActual = 'Por asignar';

    const lineas = actionItems.split('\n');

    for (const linea of lineas) {
        const trimmed = linea.trim();
        if (!trimmed) continue;

        // Detectar header de persona: **Nombre**
        const headerMatch = trimmed.match(/^\*\*([A-Za-záéíóúñÁÉÍÓÚÑ\s]+)\*\*$/);
        if (headerMatch) {
            responsableActual = headerMatch[1].trim();
            continue;
        }

        // Es una tarea (línea que no es header)
        if (trimmed.length > 5) {
            // Limpiar timestamp (00:05), (54:05), (01:14:05)
            const tareaLimpia = trimmed
                .replace(/\(\d{1,2}:\d{2}(?::\d{2})?\)/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();

            if (tareaLimpia.length > 5) {
                compromisos.push({
                    tarea: tareaLimpia,
                    quien: responsableActual,
                    cuando: 'Por definir',
                    prioridad: 'Media'
                });
            }
        }
    }

    console.log(`[FIREFLIES]   Compromisos parseados: ${compromisos.length}`);
    return compromisos;
}

/**
 * Parsea shorthand_bullets de Fireflies a lista de temas:
 * IN:  "🚀 **Inicio de pruebas** (00:05 - 03:25)\nDetalle1\nDetalle2"
 * OUT: ["Inicio de pruebas: Detalle1. Detalle2"]
 */
function parsearTemas(bullets) {
    const temas = [];
    const bloques = bullets.split(/(?=[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}])/gu);

    for (const bloque of bloques) {
        if (!bloque.trim()) continue;

        const lineas = bloque.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lineas.length === 0) continue;

        // Primera línea: emoji + **título** + (timestamps)
        let titulo = lineas[0]
            .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Emojis
            .replace(/\*\*/g, '')
            .replace(/\(\d{1,2}:\d{2}(?::\d{2})?\s*-?\s*\d{0,2}:?\d{0,2}:?\d{0,2}\)/g, '') // Timestamps
            .trim();

        if (titulo.length > 3) {
            // Agregar detalles como subtexto
            if (lineas.length > 1) {
                const detalles = lineas.slice(1).join('. ');
                temas.push(`${titulo}: ${detalles}`);
            } else {
                temas.push(titulo);
            }
        }
    }

    console.log(`[FIREFLIES]   Temas parseados: ${temas.length}`);
    return temas;
}

/**
 * Extrae acuerdos/decisiones del overview de Fireflies
 * Cada bullet del overview puede considerarse como un acuerdo/punto clave
 */
function extraerAcuerdos(overview) {
    return overview
        .split(/\n{2,}/)
        .map(linea => {
            return linea
                .replace(/^-\s*/gm, '')
                .replace(/\*\*/g, '')
                .replace(/\n/g, ' ')
                .trim();
        })
        .filter(a => a.length > 10);
}

// -----------------------------------------------------------
// VALIDACIÓN
// -----------------------------------------------------------

function validarResultado(datos) {
    return {
        asistentes: validarAsistentes(datos.asistentes),
        resumen: (typeof datos.resumen === 'string' && datos.resumen.length > 10)
            ? datos.resumen
            : 'Resumen no disponible',
        temas: Array.isArray(datos.temas) ? datos.temas.filter(t => typeof t === 'string') : [],
        acuerdos: Array.isArray(datos.acuerdos) ? datos.acuerdos.filter(a => typeof a === 'string') : [],
        compromisos: validarCompromisos(datos.compromisos),
        entregables: Array.isArray(datos.entregables) ? datos.entregables.filter(e => typeof e === 'string') : [],
        proxima_reunion: datos.proxima_reunion || null
    };
}

function validarAsistentes(asistentes) {
    if (!Array.isArray(asistentes)) return ['Participantes no identificados'];

    const validos = asistentes.filter(n => {
        if (typeof n !== 'string') return false;
        if (n.length < 2 || n.length > 50) return false;
        return !/^(null|undefined|N\/A|ninguno|desconocido|speaker|hablante)$/i.test(n.trim());
    });

    return validos.length > 0 ? validos : ['Participantes no identificados'];
}

function validarCompromisos(compromisos) {
    if (!Array.isArray(compromisos)) return [];
    return compromisos
        .filter(c => c && typeof c === 'object' && c.tarea)
        .map(c => ({
            tarea: String(c.tarea),
            quien: String(c.quien || 'Por asignar'),
            cuando: String(c.cuando || 'Por definir'),
            prioridad: ['Alta', 'Media', 'Baja'].includes(c.prioridad) ? c.prioridad : 'Media'
        }));
}

module.exports = { analizarConIA };
