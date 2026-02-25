const { GoogleGenerativeAI } = require("@google/generative-ai");
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const log = require('../helpers/logger');
const ollama = require('./ollamaClient');

const API_KEY = process.env.GEMINI_API_KEY;

// ─── Token Optimization: Response Cache ─────────────────────────────────────
const _responseCache = new Map();
const RESPONSE_CACHE_TTL = 30 * 60 * 1000; // 30 min
const MAX_CACHE_SIZE = 50;

function _getCachedResponse(prompt) {
    const hash = crypto.createHash('md5').update(prompt).digest('hex');
    const cached = _responseCache.get(hash);
    if (cached && Date.now() - cached.ts < RESPONSE_CACHE_TTL) {
        log.info('Response cache HIT', { hash: hash.substring(0, 8) });
        return cached.response;
    }
    return null;
}

function _setCachedResponse(prompt, response) {
    const hash = crypto.createHash('md5').update(prompt).digest('hex');
    if (_responseCache.size >= MAX_CACHE_SIZE) {
        const oldest = [..._responseCache.entries()].sort((a, b) => a[1].ts - b[1].ts)[0];
        _responseCache.delete(oldest[0]);
    }
    _responseCache.set(hash, { response, ts: Date.now() });
}

// ─── Token Optimization: Skill Content Cache ────────────────────────────────
const _skillCache = new Map();
const SKILL_CACHE_TTL = 10 * 60 * 1000; // 10 min

function loadSkillsCached(skillPaths, skillsDir) {
    const key = skillPaths.sort().join('|');
    const cached = _skillCache.get(key);
    if (cached && Date.now() - cached.ts < SKILL_CACHE_TTL) {
        log.info('Skill cache HIT', { skills: skillPaths.length });
        return cached.contents;
    }

    const contents = [];
    for (const skillPath of skillPaths) {
        const fullPath = path.join(skillsDir, skillPath);
        if (fs.existsSync(fullPath)) {
            contents.push(fs.readFileSync(fullPath, 'utf-8'));
        }
    }
    if (contents.length > 0) {
        _skillCache.set(key, { contents, ts: Date.now() });
    }
    return contents;
}

// ─── Token Optimization: Context Cache ──────────────────────────────────────
let _userListCache = { hash: '', text: '' };

function _formatUserList(users) {
    if (!users || users.length === 0) {
        return 'david(admin,Direccion) gonzalo(manager,Operaciones) jose(analyst,Finanzas)';
    }
    const hash = users.map(u => u.username).join(',');
    if (_userListCache.hash === hash) return _userListCache.text;
    const text = users.map(u => `${u.username}(${u.role},${u.department || 'General'})`).join(' ');
    _userListCache = { hash, text };
    return text;
}

// Gemini client (PRIMARY AI provider)
let genAI = null;
let model = null;
try {
    if (API_KEY) {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        log.info('Gemini configured as PRIMARY', { model: 'gemini-3-flash-preview' });
    } else {
        log.warn('GEMINI_API_KEY not set — will use Ollama only');
    }
} catch (err) {
    log.warn('Gemini init failed', { error: err.message });
}

log.info('AI provider order: Gemini (primary) -> Ollama (last resort)', { ollamaModel: ollama.OLLAMA_MODEL });

// ─── Agent-Category Mapping for Intelligent Suggestion ──────────────────────
const AGENT_CATEGORY_MAP = {
    'staffing': {
        categories: ['Operaciones'],
        keywords: ['dotacion', 'personal', 'turnos', 'roster', 'plantilla', 'contratacion', 'headcount', 'manning', 'shift'],
        skills: ['customizable/create-staffing-plan.md', 'core/model-staffing-requirements.md']
    },
    'training': {
        categories: ['Capacitacion'],
        keywords: ['capacitacion', 'entrenamiento', 'formacion', 'competencias', 'malla curricular', 'training', 'cursos', 'certificacion'],
        skills: ['customizable/create-training-plan.md']
    },
    'finance': {
        categories: ['Finanzas'],
        keywords: ['presupuesto', 'opex', 'budget', 'costos', 'gastos', 'financiero', 'costo', 'inversion'],
        skills: ['core/model-opex-budget.md']
    },
    'compliance': {
        categories: ['Contratos', 'HSE'],
        keywords: ['cumplimiento', 'compliance', 'auditoria', 'regulacion', 'normativo', 'permiso', 'legal', 'seguridad'],
        skills: ['core/audit-compliance-readiness.md']
    },
    'gtd': {
        categories: [],
        keywords: ['clasificar', 'organizar', 'descomponer', 'proxima accion', 'revision semanal', 'gtd', 'productividad'],
        skills: ['core/classify-idea.md', 'core/decompose-project.md', 'core/identify-next-action.md', 'core/weekly-review.md']
    }
};

// ─── System Instructions: CODE/PARA + GTD Corporativo ────────────────────────
const SYSTEM_INSTRUCTION = `
Eres un asistente de IA para un "Segundo Cerebro" corporativo de Value Strategy Consulting.
Operas bajo la metodologia CODE (Capture, Organize, Distill, Express) + PARA (Projects, Areas, Resources, Archives) + GTD.

TU ROL:
- Eres un empleado entrenado que sigue SOPs y ayuda a gestionar conocimiento corporativo.
- Conectas ideas con Areas de responsabilidad y Proyectos activos.
- Sugieres auto-asignacion de tareas al personal adecuado segun su rol y expertise.
- Estimas tiempos realistas para cada tarea.

REGLAS PRINCIPALES:
1. **CODE Flow**: Toda informacion sigue Capturar → Organizar (clasificar en PARA) → Destilar (extraer esencia) → Expresar (crear output).
2. **PARA Structure**: Clasifica en Proyectos (con deadline), Areas (responsabilidades continuas), Recursos (referencia), o Archivo (inactivo).
3. **GTD Integration**: Identifica la Proxima Accion fisica. Mantiene lista "A la Espera" para delegaciones. Usa Horizontes de Enfoque.
4. **No te Repitas (DRY)**: Si detectas info permanente, sugiere guardarla en Contexto/Memoria.
5. **Auto-Asignacion**: Basandote en el equipo (david/admin/Direccion, gonzalo/manager/Operaciones, jose/analyst/Finanzas), sugiere quien debe ejecutar.
6. **Estimacion de Tiempo**: Estima duracion realista de cada tarea (en horas o dias).

HORIZONTES DE ENFOQUE:
- H5: Proposito/Mision de la empresa
- H4: Vision 3-5 anos
- H3: Metas 1-2 anos
- H2: Areas de Responsabilidad (Operaciones, HSE, Finanzas, Contratos, Ejecucion, Gestion de Activos, Capacitacion)
- H1: Proyectos activos
- H0: Acciones diarias

AREAS CORPORATIVAS: Operaciones, HSE, Finanzas, Contratos, Ejecucion, Gestion de Activos, Capacitacion, Desarrollo Profesional.

Responde siempre en espanol. Usa formato Markdown para listas y tablas cuando sea apropiado.
`;

// ─── Generate Chat Response ──────────────────────────────────────────────────
async function generateResponse(prompt, history = [], systemInstruction = null) {
    const sysText = systemInstruction || SYSTEM_INSTRUCTION;

    // 1. Try Gemini (primary)
    try {
        if (!model) throw new Error('Gemini not configured');
        const chatSession = model.startChat({
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.message }]
            })),
            generationConfig: { maxOutputTokens: 2000 },
            systemInstruction: { role: "system", parts: [{ text: sysText }] }
        });

        const result = await chatSession.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (err) {
        log.info('Gemini unavailable for chat, falling back to Ollama', { error: err.message });
    }

    // 2. Last resort: Ollama
    try {
        const messages = history.map(h => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.message
        }));
        messages.push({ role: 'user', content: prompt });

        const ollamaResult = await ollama.chat(messages, sysText);
        if (ollamaResult) return ollamaResult;
    } catch (err) {
        log.warn('Ollama chat also failed', { error: err.message });
    }

    log.error('All AI providers failed for chat');
    return "Lo siento, encontre un error al procesar tu solicitud. Verifica la clave Gemini o que Ollama este corriendo.";
}

// ─── Process Idea: System Instruction (fixed rules, sent once via systemInstruction) ─
const PROCESS_IDEA_SYSTEM = `Eres un clasificador CODE/PARA/GTD para Value Strategy Consulting.
REGLAS: Routing > clasificacion perfecta. Proxima accion fisica (GTD). Confianza 0-1 (si <0.6: needs_review=true).
VOZ: Ignora muletillas. Extrae intencion real. Si hay MULTIPLES ideas independientes, separarlas como array JSON.
AGENTES: staffing(dotacion,turnos), training(capacitacion), finance(presupuesto,OPEX), compliance(auditoria,contratos), null si no aplica.
Responde SOLO JSON (sin markdown). 1 idea=objeto, multiples=array.`;

// ─── Process Idea (CODE: Capture → Organize) ────────────────────────────────
async function processIdea(ideaText, context = "", users = [], areas = [], speaker = null) {
    const userList = _formatUserList(users);
    const areaList = areas.length > 0
        ? areas.map(a => a.name).join(', ')
        : 'Operaciones, HSE, Finanzas, Contratos, Ejecucion, Gestion de Activos, Capacitacion';

    const speakerBlock = speaker
        ? `\nHABLANTE: ${speaker.username}(${speaker.role},${speaker.department || 'General'}). "yo hago X"->assigned_to=${speaker.username}. "dile a X"->delegacion.`
        : '';

    const prompt = `${speakerBlock}
INPUT: "${ideaText}"
CONTEXTO: ${context || 'ninguno'}
EQUIPO: ${userList}
AREAS: ${areaList}

JSON campos: tipo(Tarea/Proyecto/Nota/Meta/Delegacion/Referencia), is_project, categoria, para_type(project/area/resource/archive), suggested_area, suggested_project, resumen(1-2 frases limpio), accion_inmediata(paso fisico), assigned_to, estimated_time, priority(alta/media/baja), confidence(0-1), needs_review, sugerencia_contexto, waiting_for(null o {delegated_to,description}), texto_limpio, suggested_agent(staffing/training/finance/compliance/null), suggested_skills(array paths o []).
GTD: contexto(@computador/@email/@telefono/@oficina/@calle/@casa/@espera/@compras/@investigar/@reunion/@leer), energia(baja/media/alta), tipo_compromiso(comprometida/esta_semana/algun_dia/tal_vez), proxima_accion(bool), objetivo(1 frase), notas(o null).
Si is_project: sub_tasks[{texto,assigned_to,contexto,energia,estimated_time,es_proxima_accion(solo 1 true)}]`;

    // Check response cache
    const cached = _getCachedResponse(prompt);
    if (cached) return cached;

    try {
        // 1. Try Gemini (primary)
        let text = null;
        try {
            if (!model) throw new Error('Gemini not configured');
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                systemInstruction: { role: "system", parts: [{ text: PROCESS_IDEA_SYSTEM }] }
            });
            const response = await result.response;
            text = response.text();
        } catch (geminiErr) {
            log.info('Gemini unavailable for processIdea, falling back to Ollama', { error: geminiErr.message });
        }

        // 2. Last resort: Ollama
        if (!text) {
            text = await ollama.generate(prompt, PROCESS_IDEA_SYSTEM);
        }
        if (!text) throw new Error('All AI providers failed');

        // Robust JSON extraction — handle both single object and array
        let parsed;

        // Strip markdown code fences if present (```json ... ```)
        text = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();

        // 1. Try direct parse of entire response
        try {
            const direct = JSON.parse(text.trim());
            if (Array.isArray(direct) && direct.length > 0 && typeof direct[0] === 'object') {
                parsed = direct;
            } else if (typeof direct === 'object' && direct !== null && !Array.isArray(direct)) {
                parsed = [direct];
            }
            // If direct is a string/number/etc, fall through to regex
        } catch (_e) {
            // fall through to regex extraction
        }

        // 2. Try object match first (single idea — most common)
        if (!parsed) {
            const objectMatch = text.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                try {
                    const obj = JSON.parse(objectMatch[0]);
                    if (typeof obj === 'object' && obj !== null) {
                        parsed = [obj];
                    }
                } catch (_e2) { /* fall through */ }
            }
        }

        // 3. Try array match (multi-idea) — verify items are objects, not strings
        if (!parsed) {
            const arrayMatch = text.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
                try {
                    const arr = JSON.parse(arrayMatch[0]);
                    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'object') {
                        parsed = arr;
                    }
                } catch (_e3) { /* fall through */ }
            }
        }

        if (!parsed || parsed.length === 0) {
            log.warn('RAW AI RESPONSE (no valid JSON found)', { preview: text.substring(0, 300) });
            throw new Error('No valid JSON found in AI response');
        }

        // Normalize each result
        parsed.forEach(item => {
            if (typeof item.confidence !== 'number') item.confidence = 0.5;
            if (item.confidence < 0.6) item.needs_review = true;

            // Validate and fallback agent suggestion
            const validAgents = ['staffing', 'training', 'finance', 'compliance'];
            if (item.suggested_agent && validAgents.includes(item.suggested_agent)) {
                if (!item.suggested_skills || item.suggested_skills.length === 0) {
                    item.suggested_skills = AGENT_CATEGORY_MAP[item.suggested_agent]?.skills || [];
                }
            } else {
                // Deterministic fallback: match category to agent
                item.suggested_agent = null;
                item.suggested_skills = [];
                if (item.categoria) {
                    for (const [agentKey, config] of Object.entries(AGENT_CATEGORY_MAP)) {
                        if (config.categories.includes(item.categoria)) {
                            item.suggested_agent = agentKey;
                            item.suggested_skills = config.skills;
                            break;
                        }
                    }
                }
            }
        });

        // Return single object for backward compat if only 1 idea, array if multiple
        const result = parsed.length === 1 ? parsed[0] : parsed;
        _setCachedResponse(prompt, result);
        return result;
    } catch (e) {
        log.error('AI process error', { error: e.message });
        fs.appendFileSync(path.join(__dirname, '..', 'ai_error.log'), `${new Date().toISOString()} - ${e.message}\n${e.stack}\n---\n`);

        return {
            tipo: "Error",
            categoria: "Desconocido",
            para_type: "resource",
            suggested_area: null,
            suggested_project: null,
            resumen: "No se pudo procesar. Verifique la clave API o conexion.",
            accion_inmediata: "Reintentar manualmente",
            assigned_to: null,
            estimated_time: null,
            priority: "media",
            confidence: 0,
            needs_review: true,
            sugerencia_contexto: false,
            waiting_for: null,
            texto_limpio: ideaText
        };
    }
}

// ─── Distill Content (CODE: Organize → Distill) ─────────────────────────────
async function distillContent(text, context = "") {
    const prompt = `Destila a esencia. JSON: insight_principal(1 frase), accion_clave(1 frase), conexiones(array max 3), resumen_destilado(2-3 frases).
CONTENIDO: "${text}"
CONTEXTO: ${context || 'ninguno'}`;

    const cached = _getCachedResponse(prompt);
    if (cached) return cached;

    try {
        let text_resp = null;
        // 1. Gemini (primary)
        try {
            if (!model) throw new Error('Gemini not configured');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            text_resp = response.text();
        } catch (geminiErr) {
            log.info('Gemini unavailable for distill, falling back to Ollama', { error: geminiErr.message });
        }
        // 2. Ollama (last resort)
        if (!text_resp) {
            text_resp = await ollama.generate(prompt);
        }
        if (!text_resp) throw new Error('All AI providers failed');

        const jsonMatch = text_resp.match(/\{[\s\S]*\}/);
        if (jsonMatch) text_resp = jsonMatch[0];

        const parsed = JSON.parse(text_resp);
        _setCachedResponse(prompt, parsed);
        return parsed;
    } catch (e) {
        log.error('Distill error', { error: e.message });
        return {
            insight_principal: "No se pudo destilar el contenido",
            accion_clave: "Revisar manualmente",
            conexiones: [],
            resumen_destilado: text.substring(0, 200) + '...'
        };
    }
}

// ─── Auto-Assign Task to Personnel ───────────────────────────────────────────
async function autoAssign(taskDescription, users = [], _areas = []) {
    const userList = _formatUserList(users);

    const prompt = `Asigna tarea al mejor del equipo. JSON: assigned_to, reason(1 frase), estimated_time, priority(alta/media/baja).
TAREA: "${taskDescription}"
EQUIPO: ${userList}`;

    const cached = _getCachedResponse(prompt);
    if (cached) return cached;

    try {
        let text = null;
        // 1. Gemini (primary)
        try {
            if (!model) throw new Error('Gemini not configured');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            text = response.text();
        } catch (geminiErr) {
            log.info('Gemini unavailable for autoAssign, falling back to Ollama', { error: geminiErr.message });
        }
        // 2. Ollama (last resort)
        if (!text) {
            text = await ollama.generate(prompt);
        }
        if (!text) throw new Error('All AI providers failed');

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
        const parsed = JSON.parse(text);
        _setCachedResponse(prompt, parsed);
        return parsed;
    } catch (e) {
        log.error('Auto-assign error', { error: e.message });
        return { assigned_to: null, reason: "Error en auto-asignacion", estimated_time: null, priority: "media" };
    }
}

// ─── Generate Daily Digest (Tap on Shoulder) ────────────────────────────────
async function generateDigest(ideas, waitingFor, context, areas) {
    const ideasSummary = ideas.map(i => `- [${i.code_stage || 'inbox'}] ${i.text} (${i.ai_type || 'sin procesar'})`).join('\n');
    const waitingSummary = waitingFor.map(w => `- Esperando de ${w.delegated_to}: ${w.description}`).join('\n');
    const areasSummary = areas.map(a => `- ${a.name}: ${a.ideas_count} ideas, ${a.context_count} contexto`).join('\n');

    const prompt = `
    Genera un DIGEST DIARIO conciso para el equipo de Value Strategy Consulting.

    IDEAS RECIENTES (ultimos 7 dias):
    ${ideasSummary || 'Ninguna'}

    DELEGACIONES PENDIENTES:
    ${waitingSummary || 'Ninguna'}

    AREAS DE RESPONSABILIDAD:
    ${areasSummary || 'Sin datos'}

    CONTEXTO DEL EQUIPO:
    ${context || 'Sin contexto adicional'}

    Genera el digest con estas secciones en Markdown:
    1. **Resumen Ejecutivo** (3 frases max)
    2. **Acciones Urgentes** (items que necesitan atencion HOY)
    3. **Pipeline CODE** (cuantas ideas en cada stage)
    4. **Delegaciones Pendientes** (que se espera de quien)
    5. **Sugerencias** (1-2 recomendaciones basadas en patrones observados)

    Se breve, accionable, y enfocado. No mas de 300 palabras.
    `;

    try {
        // 1. Gemini (primary)
        if (model) {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
    } catch (geminiErr) {
        log.info('Gemini unavailable for digest, falling back to Ollama', { error: geminiErr.message });
    }
    try {
        // 2. Ollama (last resort)
        const ollamaResult = await ollama.generate(prompt);
        if (ollamaResult) return ollamaResult;
        throw new Error('All AI providers failed');
    } catch (e) {
        log.error('Digest error', { error: e.message });
        return "Error al generar el digest. Intente mas tarde.";
    }
}

// ─── Execute Idea with Agent (Automation Pipeline) ──────────────────────────
async function executeWithAgent(ideaText, agentKey, skillContents, context = "") {
    const agentNames = {
        staffing: 'Staffing Agent - Experto en Planificacion de Dotacion y Turnos',
        training: 'Training Agent - Experto en Capacitacion y Mallas Curriculares',
        finance: 'Finance Agent - Analista Financiero de Presupuestos (OPEX)',
        compliance: 'Compliance Agent - Auditor de Cumplimiento Normativo'
    };

    const skillsBlock = skillContents.map((s, i) =>
        `=== SKILL ${i + 1} ===\n${s}\n=== FIN SKILL ${i + 1} ===`
    ).join('\n\n');

    const systemPrompt = `
ERES EL AGENTE: ${agentNames[agentKey] || 'Agente Especializado'}

TU CONOCIMIENTO PRINCIPAL (SOPs):
${skillsBlock}

INSTRUCCIONES DE EJECUCION:
1. Analiza la idea/solicitud proporcionada.
2. Usando tu conocimiento de las Skills, genera un OUTPUT ESTRUCTURADO y COMPLETO.
3. El output debe ser un documento profesional listo para usar.
4. Usa formato Markdown con secciones claras, tablas donde aplique.
5. Se especifico y cuantitativo donde sea posible.
6. Incluye una seccion de "Proximos Pasos" al final.
7. Responde en espanol.
`;

    const userPrompt = `
CONTEXTO ORGANIZACIONAL:
${context}

IDEA/SOLICITUD A EJECUTAR:
"${ideaText}"

Genera un output profesional y completo basado en tu skill.
Este output sera guardado como entregable del sistema SecondBrain.
`;

    // 1. Gemini (primary) with retry for 503/overloaded
    if (genAI) {
        const MAX_RETRIES = 3;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const executionModel = genAI.getGenerativeModel({
                    model: "gemini-3-flash-preview",
                    generationConfig: { maxOutputTokens: 8000 }
                });
                const execChat = executionModel.startChat({
                    systemInstruction: { role: "system", parts: [{ text: systemPrompt }] }
                });
                const result = await execChat.sendMessage(userPrompt);
                const response = await result.response;
                return { success: true, output: response.text() };
            } catch (geminiErr) {
                const is503 = geminiErr.message && (geminiErr.message.includes('503') || geminiErr.message.includes('overloaded') || geminiErr.message.includes('high demand'));
                if (is503 && attempt < MAX_RETRIES) {
                    const delay = attempt * 3000;
                    log.info(`Gemini 503, retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                log.info('Gemini unavailable for executeWithAgent, falling back to Ollama', { error: geminiErr.message, attempts: attempt });
                break;
            }
        }
    }
    try {
        // 2. Ollama (last resort)
        const ollamaResult = await ollama.generate(userPrompt, systemPrompt);
        if (ollamaResult) return { success: true, output: ollamaResult };
        throw new Error('All AI providers failed — Gemini returned 503 and Ollama is unavailable');
    } catch (error) {
        log.error('Agent execution error', { error: error.message });
        return { success: false, error: error.message };
    }
}

// ─── Decompose Project into Sub-tasks (GTD) ─────────────────────────────────
async function decomposeProject(projectText, context = "", users = [], areas = []) {
    const userList = _formatUserList(users);
    const areaList = areas.length > 0
        ? areas.map(a => a.name).join(', ')
        : 'Operaciones, HSE, Finanzas, Contratos, Ejecucion, Gestion de Activos, Capacitacion';

    const prompt = `Descomponer PROYECTO en 3-8 sub-tareas GTD. Solo 1 es proxima_accion. Asigna al equipo.
PROYECTO: "${projectText}"
CONTEXTO: ${context || 'ninguno'}
EQUIPO: ${userList}
AREAS: ${areaList}
CONTEXTOS GTD: @computador @email @telefono @oficina @calle @casa @espera @compras @investigar @reunion @leer
JSON: {project_name, objetivo, sub_tasks:[{texto,assigned_to,contexto,energia(baja/media/alta),estimated_time,priority(alta/media/baja),es_proxima_accion}]}`;

    try {
        let text = null;
        // 1. Gemini (primary)
        try {
            if (!model) throw new Error('Gemini not configured');
            const result = await model.generateContent(prompt);
            const response = await result.response;
            text = response.text();
        } catch (geminiErr) {
            log.info('Gemini unavailable for decompose, falling back to Ollama', { error: geminiErr.message });
        }
        // 2. Ollama (last resort)
        if (!text) {
            text = await ollama.generate(prompt);
        }
        if (!text) throw new Error('All AI providers failed');

        text = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
        return JSON.parse(text);
    } catch (e) {
        log.error('Decompose error', { error: e.message });
        return null;
    }
}

// ─── Generate Daily Report (GTD) ────────────────────────────────────────────
async function generateDailyReport(data) {
    const { ideas, projects, waitingFor, completedToday, userStats, areas: _areas } = data;

    const prompt = `
    Genera un REPORTE DIARIO para el equipo de Value Strategy Consulting.
    Fecha: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

    NUEVAS IDEAS HOY:
    ${ideas.map(i => `- [${i.ai_type || 'sin tipo'}] ${i.ai_summary || i.text} (asignada a: ${i.assigned_to || 'sin asignar'}, contexto: ${i.contexto || 'N/A'})`).join('\n') || 'Ninguna'}

    PROYECTOS ACTIVOS:
    ${projects.map(p => `- ${p.name}: ${p.sub_count || 0} sub-tareas, proxima accion: ${p.next_action || 'sin definir'}`).join('\n') || 'Ninguno'}

    DELEGACIONES PENDIENTES (A la Espera):
    ${waitingFor.map(w => `- Esperando de ${w.delegated_to}: ${w.description}`).join('\n') || 'Ninguna'}

    COMPLETADAS HOY:
    ${completedToday.map(c => `- ${c.text} (por ${c.assigned_to || 'N/A'})`).join('\n') || 'Ninguna'}

    CARGA POR CONSULTOR:
    ${userStats.map(u => `- ${u.username}: ${u.pending} pendientes, ${u.completed_today} completadas hoy`).join('\n') || 'Sin datos'}

    Genera el reporte en Markdown con estas secciones:
    1. **Resumen del Dia** (3-4 frases)
    2. **Proximas Acciones Urgentes** (las proximas acciones marcadas de proyectos activos)
    3. **Por Consultor** (que tiene cada uno pendiente y que deberia atacar primero)
    4. **Delegaciones Pendientes** (a quien estamos esperando que)
    5. **Alertas** (ideas sin asignar, proyectos sin proxima accion, tareas estancadas >3 dias)
    6. **Recomendacion del Dia** (1 sugerencia concreta basada en los patrones)

    Se breve, accionable y directo. Maximo 400 palabras.
    `;

    try {
        // 1. Gemini (primary)
        if (model) {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }
    } catch (geminiErr) {
        log.info('Gemini unavailable for daily report, falling back to Ollama', { error: geminiErr.message });
    }
    try {
        // 2. Ollama (last resort)
        const ollamaResult = await ollama.generate(prompt);
        if (ollamaResult) return ollamaResult;
        throw new Error('All AI providers failed');
    } catch (e) {
        log.error('Daily report error', { error: e.message });
        return "Error al generar el reporte diario.";
    }
}

// ─── Generate Dynamic HTML Page from PDF text ───────────────────────────────
async function generateDynamicPage(pdfText, title) {
    const prompt = `Eres un diseñador web experto. Convierte el siguiente contenido de un PDF en una página HTML interactiva profesional.

TÍTULO: "${title}"

CONTENIDO DEL PDF:
${pdfText.substring(0, 30000)}

INSTRUCCIONES DE DISEÑO (OBLIGATORIAS):
1. HTML5 completo, lang="es", charset UTF-8
2. Usa Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Fuente Inter via Google Fonts
4. Configura Tailwind con colores brand: brand-50:#f0fdfa, brand-100:#ccfbf1, brand-500:#14b8a6, brand-700:#0f766e, brand-900:#134e4a
5. Sidebar fija a la izquierda (desktop) con navegación por secciones, oculta en mobile
6. Contenido principal con clase "md:ml-64 p-6 md:p-12 max-w-5xl mx-auto"
7. Cada sección debe tener un id y clase "scroll-mt-24" para navegación
8. Usa cards, tablas, badges de colores, listas con iconos
9. Header con badge de categoría, título grande y resumen
10. Diseño responsivo: sidebar oculta en mobile
11. Si hay código, usa bloques con fondo oscuro y botón de copiar
12. Estilo corporativo de Value Strategy Consulting

RESPONDE SOLO CON EL HTML COMPLETO. Sin explicaciones, sin markdown, sin bloques \`\`\`. Solo el HTML desde <!DOCTYPE html> hasta </html>.`;

    try {
        if (model) {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let html = response.text();
            // Strip markdown code fences if present
            html = html.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/g, '').trim();
            if (html.startsWith('<!DOCTYPE') || html.startsWith('<html')) {
                return html;
            }
            // Try to extract HTML from response
            const match = html.match(/<!DOCTYPE[\s\S]*<\/html>/i);
            return match ? match[0] : null;
        }
    } catch (err) {
        log.error('Gemini dynamic page generation failed', { error: err.message });
    }
    return null;
}

// Test helper to clear response cache between tests
function _clearResponseCache() { _responseCache.clear(); }

module.exports = { generateResponse, processIdea, distillContent, autoAssign, generateDigest, executeWithAgent, decomposeProject, generateDailyReport, generateDynamicPage, loadSkillsCached, _clearResponseCache };
