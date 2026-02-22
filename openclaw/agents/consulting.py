"""
Agente Consulting — Pipeline de Documentos

Toma ideas con execution_status='queued_consulting',
carga skills/SOPs relevantes, y genera documentos profesionales
(planes de dotacion, presupuestos OPEX, auditorias, etc.)

Marca como 'reviewing' para que el Reviewer lo valide.

Replica la logica de ai.js executeWithAgent() pero autonomamente.
"""
import json

from compartido import CONFIG, log, logger, pensar_con_gemini, pensar_con_local, enviar_whatsapp
from db.connection import get_connection
from db import queries
from skills.loader import load_skills

NOMBRE = "CONSULTING"

# Mapeo agente -> metadata + skills (replica AGENT_CATEGORY_MAP de ai.js)
AGENT_SKILLS_MAP = {
    'staffing': {
        'name': 'Staffing Agent — Experto en Planificacion de Dotacion y Turnos',
        'skills': ['customizable/create-staffing-plan.md', 'core/model-staffing-requirements.md']
    },
    'training': {
        'name': 'Training Agent — Experto en Capacitacion y Mallas Curriculares',
        'skills': ['customizable/create-training-plan.md']
    },
    'finance': {
        'name': 'Finance Agent — Analista Financiero de Presupuestos OPEX',
        'skills': ['core/model-opex-budget.md']
    },
    'compliance': {
        'name': 'Compliance Agent — Auditor de Cumplimiento Normativo',
        'skills': ['core/audit-compliance-readiness.md']
    },
    'gtd': {
        'name': 'GTD Agent — Organizador de Productividad',
        'skills': ['core/classify-idea.md', 'core/decompose-project.md',
                   'core/identify-next-action.md', 'core/weekly-review.md']
    },
}


def _build_prompt(agent_key, agent_config, skill_contents, idea_text, context):
    """Construye el prompt del sistema + usuario para el agente consultor."""

    # Bloque de skills como SOPs
    skills_block = ""
    for i, content in enumerate(skill_contents):
        skills_block += f"\n\n=== SKILL {i+1} ===\n{content}\n=== FIN SKILL {i+1} ==="

    system_prompt = f"""ERES EL AGENTE: {agent_config['name']}

TU CONOCIMIENTO PRINCIPAL (SOPs):
{skills_block}

INSTRUCCIONES DE EJECUCION:
1. Analiza la idea/solicitud proporcionada.
2. Usando tu conocimiento de las Skills/SOPs, genera un OUTPUT ESTRUCTURADO y COMPLETO.
3. El output debe ser un documento profesional listo para presentar.
4. Usa formato Markdown con secciones claras, tablas donde aplique, y datos cuantitativos.
5. Se especifico: incluye numeros, plazos, responsables donde sea posible.
6. Incluye una seccion de "Proximos Pasos" al final.
7. Responde en espanol."""

    user_prompt = f"""CONTEXTO ORGANIZACIONAL:
{context}

IDEA/SOLICITUD A EJECUTAR:
"{idea_text}"

Genera un output profesional y completo basado en tus Skills/SOPs."""

    return system_prompt, user_prompt


def _get_skill_paths(task):
    """Obtiene los paths de skills: del mapa o de suggested_skills de la idea."""
    agent_key = task['suggested_agent']
    config = AGENT_SKILLS_MAP.get(agent_key)

    if config:
        return config['skills']

    # Fallback: usar suggested_skills de la idea (JSON array)
    raw = task['suggested_skills']
    if raw:
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            pass

    return []


def ciclo():
    """Un ciclo del Consulting: toma una tarea y genera un documento.

    Returns:
        1 si proceso algo, 0 si no.
    """
    db = get_connection()
    tasks = queries.get_ideas_in_status(db, 'queued_consulting')
    if not tasks:
        return 0

    task = tasks[0]  # FIFO por prioridad (ya ordenado por query)
    idea_id = task['id']
    idea_text = task['text'] or ''
    agent_key = task['suggested_agent'] or 'gtd'

    # Verificar si es re-ejecucion (rechazado por Reviewer)
    error_previo = task['execution_error'] or ''

    # Obtener skills
    skill_paths = _get_skill_paths(task)
    if not skill_paths:
        log(NOMBRE, f"#{idea_id} — sin skills disponibles para '{agent_key}'", "!")
        queries.update_execution_status(
            db, idea_id, 'failed',
            error=f"No hay skills configuradas para agente '{agent_key}'",
            agent_name=f'{NOMBRE}-{agent_key}'
        )
        return 0

    # Marcar en progreso
    queries.update_execution_status(db, idea_id, 'in_progress', agent_name=f'{NOMBRE}-{agent_key}')
    log(NOMBRE, f"#{idea_id} ({agent_key}): {idea_text[:60]}...", ">")

    # Cargar skills
    skill_contents = load_skills(skill_paths)
    if not skill_contents:
        queries.update_execution_status(
            db, idea_id, 'failed',
            error=f"No se pudieron cargar los archivos de skills: {skill_paths}",
            agent_name=f'{NOMBRE}-{agent_key}'
        )
        log(NOMBRE, f"#{idea_id} FAILED — skills no encontradas", "!")
        return 0

    # Cargar contexto
    context = queries.get_context_string(db)

    # Si fue rechazado antes, incluir feedback
    if error_previo:
        idea_text += f"\n\nFEEDBACK DEL REVISOR (corregir estos puntos):\n{error_previo}"

    # Construir prompts
    agent_config = AGENT_SKILLS_MAP.get(agent_key, {'name': f'Agente {agent_key}', 'skills': skill_paths})
    system_prompt, user_prompt = _build_prompt(agent_key, agent_config, skill_contents, idea_text, context)

    # Generar documento con Gemini
    full_prompt = f"{system_prompt}\n\n---\n\n{user_prompt}"
    output = pensar_con_gemini(full_prompt)

    # Fallback a Ollama
    motor = CONFIG["gemini_model"]
    if not output:
        log(NOMBRE, "Gemini no respondio, intentando local...", "~")
        output = pensar_con_local(full_prompt)
        motor = CONFIG["local_model"]

    if output:
        header = f"**Agente:** {agent_config['name']}\n**Motor:** {motor}\n\n---\n\n"
        full_output = header + output
        queries.update_execution_status(
            db, idea_id, 'reviewing',
            output=full_output, agent_name=f'{NOMBRE}-{agent_key}'
        )
        # Guardar como recurso en context_items
        queries.save_context_item(
            db,
            key=f"output-{agent_key}-{idea_id}",
            content=output[:2000],  # Truncar para contexto
            category=agent_key
        )
        log(NOMBRE, f"#{idea_id} documento generado -> Reviewing", "+")
        enviar_whatsapp(
            f"✅ *Proyecto SecondBrain — Documento Generado*\n"
            f"📋 Tarea #{idea_id}: `{idea_text[:50]}`\n"
            f"🏢 Agente: {agent_key}\n"
            f"🔍 Esperando revisión del Reviewer."
        )
        return 1
    else:
        queries.update_execution_status(
            db, idea_id, 'failed',
            error="Ninguno de los modelos de IA genero una respuesta.",
            agent_name=f'{NOMBRE}-{agent_key}'
        )
        log(NOMBRE, f"#{idea_id} FAILED — sin respuesta de IA", "!")
        return 0
