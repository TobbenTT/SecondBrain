const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const log = require('../helpers/logger');

const API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
    try {
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.message }]
            })),
            generationConfig: {
                maxOutputTokens: 2000,
            },
            systemInstruction: {
                role: "system",
                parts: [{ text: systemInstruction || SYSTEM_INSTRUCTION }]
            }
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        log.error('Error generating AI response', { error: error.message });
        return "Lo siento, encontre un error al procesar tu solicitud. Por favor, verifica tu conexion o intenta mas tarde.";
    }
}

// ─── Process Idea (CODE: Capture → Organize) ────────────────────────────────
// Supports: voice-first input, speaker identity, multi-idea splitting
async function processIdea(ideaText, context = "", users = [], areas = [], speaker = null) {
    const userList = users.length > 0
        ? users.map(u => `- ${u.username} (${u.role}, Dept: ${u.department || 'General'}, Expertise: ${u.expertise || 'General'})`).join('\n')
        : '- david (admin, Direccion)\n- gonzalo (manager, Operaciones)\n- jose (analyst, Finanzas)';

    const areaList = areas.length > 0
        ? areas.map(a => a.name).join(', ')
        : 'Operaciones, HSE, Finanzas, Contratos, Ejecucion, Gestion de Activos, Capacitacion';

    // Speaker identity context
    const speakerBlock = speaker
        ? `\n    QUIEN HABLA (identidad del capturador):
    - Usuario: ${speaker.username}
    - Rol: ${speaker.role}
    - Departamento: ${speaker.department || 'General'}
    - Expertise: ${speaker.expertise || 'General'}
    IMPORTANTE: Usa esta identidad para:
    1. Dar peso a las areas de expertise del hablante al clasificar.
    2. Si el hablante habla de "yo tengo que hacer X", asignale a el mismo (assigned_to = "${speaker.username}").
    3. Si dice "dile a Gonzalo que..." o "Jose deberia...", es delegacion → assigned_to al mencionado, waiting_for al hablante.
    4. Si no queda claro quien ejecuta, asigna basado en expertise del equipo.\n`
        : '';

    const prompt = `
    PRINCIPIOS DE ROUTING (aplica siempre):
    - Prefiere ROUTING sobre organizar: decide a donde va, no como clasificarlo perfectamente.
    - Usa "proxima accion fisica" como unidad de ejecucion (estilo GTD).
    - Mantien categorias PEQUENAS. Si dudas, usa la mas simple.
    - Reporta tu nivel de CONFIANZA honestamente (0.0 a 1.0).
    - Si la confianza es < 0.6, marca needs_review = true.

    MANEJO DE ENTRADA POR VOZ:
    - El texto puede venir de una transcripcion de voz (speech-to-text).
    - IGNORA muletillas, repeticiones, correcciones y relleno verbal ("eh", "bueno", "o sea", "como te digo").
    - LIMPIA el texto mentalmente antes de clasificar: extrae la intencion real.
    - Si el texto contiene MULTIPLES ideas/tareas independientes, DEBES separarlas.
      Ejemplo: "hay que revisar el presupuesto y tambien dile a gonzalo que prepare el informe de seguridad"
      = 2 ideas separadas.

    DETECCION DE MULTIPLES IDEAS:
    - Si el input contiene una sola idea/tarea/nota, responde con UN objeto JSON.
    - Si el input contiene MULTIPLES ideas independientes, responde con un ARRAY JSON de objetos.
    - Cada objeto tiene los mismos campos.
    - Senales de multiples ideas: "y tambien", "otra cosa", "ademas", "por otro lado", coma separando temas distintos.
    ${speakerBlock}
    Analiza esta nueva idea/input y RUTEA usando CODE/PARA/GTD:
    "${ideaText}"

    Contexto del usuario:
    ${context}

    Equipo disponible:
    ${userList}

    Areas de responsabilidad activas: ${areaList}

    Responde UNICAMENTE con JSON (sin markdown, sin backticks).
    Si es UNA idea: un objeto JSON { ... }
    Si son MULTIPLES ideas: un array JSON [ { ... }, { ... } ]

    Campos por cada idea:
    - tipo: (Tarea, Proyecto, Nota, Meta, Delegacion, Referencia)
    - is_project: (true/false) true si esto es un PROYECTO que requiere multiples actividades
    - categoria: La categoria mas relevante de las areas corporativas
    - para_type: ("project" | "area" | "resource" | "archive")
    - suggested_area: El nombre del area de responsabilidad mas relevante (de la lista de areas). Debe ser exactamente uno de la lista.
    - suggested_project: null o nombre de proyecto si aplica
    - resumen: Resumen breve y LIMPIO (1-2 frases, sin muletillas del audio original)
    - accion_inmediata: El SIGUIENTE PASO FISICO y accionable. Debe ser algo que se pueda hacer en los proximos 2 minutos a 2 horas.
    - assigned_to: El username del miembro mas adecuado (basado en expertise y departamento)
    - estimated_time: Tiempo estimado realista (ej: "2 horas", "1 dia", "3 dias")
    - priority: ("alta" | "media" | "baja")
    - confidence: Numero entre 0.0 y 1.0. Que tan seguro estas de esta clasificacion.
    - needs_review: (true/false) true si confidence < 0.6 o si el input es ambiguo
    - sugerencia_contexto: (true/false) si esto deberia guardarse en la memoria permanente
    - waiting_for: null o { delegated_to: "username", description: "que se espera" } si implica delegacion
    - texto_limpio: El texto de esta idea limpio, sin muletillas ni ruido de voz. Si solo hay una idea, es el texto original limpio.
    - suggested_agent: El agente de automatizacion mas adecuado para ejecutar esta idea. Opciones: "staffing" (dotacion, turnos, personal), "training" (capacitacion, formacion), "finance" (presupuestos, costos, OPEX), "compliance" (auditorias, cumplimiento, contratos), o null si ninguno aplica o es simplemente informativa/nota.
    - suggested_skills: Array de nombres de archivos de skill que el agente deberia usar. Opciones: ["customizable/create-staffing-plan.md", "core/model-staffing-requirements.md", "customizable/create-training-plan.md", "core/model-opex-budget.md", "core/audit-compliance-readiness.md"]. Selecciona 1-2 skills mas relevantes, o [] si suggested_agent es null.

    CAMPOS GTD (OBLIGATORIOS — analiza cada uno cuidadosamente):
    - contexto: El contexto GTD donde se ejecuta esta accion. DEBE ser uno de: "@computador", "@email", "@telefono", "@oficina", "@calle", "@casa", "@espera", "@compras", "@investigar", "@reunion", "@leer". Elige el mas apropiado segun la naturaleza de la tarea.
    - energia: Nivel de energia/concentracion requerido. DEBE ser: "baja", "media" o "alta".
    - tipo_compromiso: Nivel de compromiso. DEBE ser: "comprometida" (hay deadline o compromiso firme), "esta_semana" (deberia hacerse esta semana), "algun_dia" (sin urgencia, cuando se pueda), "tal_vez" (idea que quizas nunca se haga).
    - proxima_accion: (true/false) true si esta es la PROXIMA ACCION concreta de un proyecto o lista.
    - objetivo: El objetivo del area al que contribuye esta accion (1 frase corta). Ej: "Mejorar la dotacion del proyecto ACME"
    - notas: Cualquier nota adicional relevante o contexto util. null si no aplica.

    SI is_project ES TRUE, agrega ademas:
    - sub_tasks: Array de objetos, cada uno con:
      - texto: Descripcion de la sub-tarea
      - assigned_to: username responsable
      - contexto: contexto GTD de la sub-tarea
      - energia: energia requerida
      - estimated_time: tiempo estimado
      - es_proxima_accion: (true/false) solo UNA sub-tarea debe ser true (la primera en ejecutarse)
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

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
        return parsed.length === 1 ? parsed[0] : parsed;
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
    const prompt = `
    TAREA: Destilar el siguiente contenido a su esencia.

    CONTENIDO:
    "${text}"

    CONTEXTO RELACIONADO:
    ${context || 'Sin contexto adicional'}

    Responde UNICAMENTE con un objeto JSON (sin markdown, sin backticks):
    - insight_principal: La idea o hallazgo mas importante (1 frase)
    - accion_clave: La accion mas importante que se deriva (1 frase)
    - conexiones: Array de strings con conexiones a otros temas/areas (max 3)
    - resumen_destilado: Resumen ultra-conciso listo para uso rapido (2-3 frases max)
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text_resp = response.text();

        const jsonMatch = text_resp.match(/\{[\s\S]*\}/);
        if (jsonMatch) text_resp = jsonMatch[0];

        return JSON.parse(text_resp);
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
    const userList = users.map(u =>
        `${u.username}: rol=${u.role}, dept=${u.department || 'General'}, expertise=${u.expertise || 'General'}`
    ).join('\n');

    const prompt = `
    Asigna esta tarea al miembro del equipo mas adecuado y estima el tiempo:

    TAREA: "${taskDescription}"

    EQUIPO:
    ${userList}

    Responde UNICAMENTE con JSON (sin markdown):
    - assigned_to: username del mas adecuado
    - reason: Por que esta persona (1 frase)
    - estimated_time: Tiempo estimado (ej: "4 horas", "2 dias")
    - priority: ("alta" | "media" | "baja")
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) text = jsonMatch[0];
        return JSON.parse(text);
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
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

    try {
        const executionModel = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: { maxOutputTokens: 8000 }
        });

        const chat = executionModel.startChat({
            systemInstruction: { role: "system", parts: [{ text: systemPrompt }] }
        });

        const result = await chat.sendMessage(userPrompt);
        const response = await result.response;
        return { success: true, output: response.text() };
    } catch (error) {
        log.error('Agent execution error', { error: error.message });
        return { success: false, error: error.message };
    }
}

// ─── Decompose Project into Sub-tasks (GTD) ─────────────────────────────────
async function decomposeProject(projectText, context = "", users = [], areas = []) {
    const userList = users.length > 0
        ? users.map(u => `- ${u.username} (${u.role}, Dept: ${u.department || 'General'}, Expertise: ${u.expertise || 'General'})`).join('\n')
        : '- david (admin, Direccion)\n- gonzalo (manager, Operaciones)\n- jose (analyst, Finanzas)';

    const areaList = areas.length > 0
        ? areas.map(a => a.name).join(', ')
        : 'Operaciones, HSE, Finanzas, Contratos, Ejecucion, Gestion de Activos, Capacitacion';

    const prompt = `
    Eres un experto en GTD (Getting Things Done). Se ha identificado que la siguiente idea es un PROYECTO.
    Tu tarea es DESCOMPONERLO en sub-tareas accionables.

    PROYECTO:
    "${projectText}"

    CONTEXTO:
    ${context || 'Sin contexto adicional'}

    EQUIPO DISPONIBLE:
    ${userList}

    AREAS: ${areaList}

    CONTEXTOS GTD DISPONIBLES: @computador, @email, @telefono, @oficina, @calle, @casa, @espera, @compras, @investigar, @reunion, @leer

    REGLAS:
    1. Genera entre 3 y 8 sub-tareas CONCRETAS y ACCIONABLES.
    2. Cada sub-tarea debe ser una accion fisica que una persona puede ejecutar.
    3. EXACTAMENTE UNA sub-tarea debe ser la "proxima accion" (la primera en ejecutarse).
    4. Asigna cada sub-tarea a la persona mas adecuada del equipo.
    5. Estima tiempos realistas.

    Responde UNICAMENTE con JSON (sin markdown, sin backticks):
    {
        "project_name": "Nombre corto del proyecto",
        "objetivo": "Objetivo general del proyecto (1 frase)",
        "sub_tasks": [
            {
                "texto": "Descripcion de la sub-tarea accionable",
                "assigned_to": "username",
                "contexto": "@contexto_gtd",
                "energia": "baja|media|alta",
                "estimated_time": "X horas|dias",
                "priority": "alta|media|baja",
                "es_proxima_accion": true/false
            }
        ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
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
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (e) {
        log.error('Daily report error', { error: e.message });
        return "Error al generar el reporte diario.";
    }
}

module.exports = { generateResponse, processIdea, distillContent, autoAssign, generateDigest, executeWithAgent, decomposeProject, generateDailyReport };
