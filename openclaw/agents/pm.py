"""
Agente PM (Project Manager) — Router de Ideas

Escanea ideas con code_stage='organized' y execution_status=NULL,
y las rutea al pipeline correcto:
  - queued_consulting: si tiene suggested_agent, ai_category conocida, o keywords consulting
  - queued_software: si es de tipo Software/Desarrollo
  - Skip: solo si no aplica a ningun pipeline (queda para procesamiento manual)
"""
from compartido import log, logger
from db.connection import get_connection
from db import queries

NOMBRE = "PM"

# Agentes validos para pipeline consulting
CONSULTING_AGENTS = {'staffing', 'training', 'finance', 'compliance', 'gtd'}

# Mapeo ai_category -> agente (replica AGENT_CATEGORY_MAP del dashboard ai.js)
CATEGORY_AGENT_MAP = {
    'operaciones': 'staffing',
    'capacitacion': 'training',
    'finanzas': 'finance',
    'contratos': 'compliance',
    'hse': 'compliance',
}

# Keywords de consulting por agente (para detectar en texto libre)
CONSULTING_KEYWORDS = {
    'staffing': ['dotacion', 'personal', 'turnos', 'roster', 'plantilla',
                 'contratacion', 'headcount', 'manning', 'shift'],
    'training': ['capacitacion', 'entrenamiento', 'formacion', 'competencias',
                 'malla curricular', 'training', 'cursos', 'certificacion'],
    'finance':  ['presupuesto', 'opex', 'budget', 'costos', 'gastos', 'financiero',
                 'costo', 'inversion'],
    'compliance': ['cumplimiento', 'compliance', 'auditoria', 'regulacion',
                   'normativo', 'permiso', 'legal'],
}

# Palabras clave que indican pipeline de software
# Nota: 'desarrollo' fue removido por ser ambiguo en español (equipo de desarrollo != desarrollo software)
SOFTWARE_KEYWORDS = ['software', 'codigo', 'script', 'programa',
                     'api', 'endpoint', 'frontend', 'backend', 'deploy',
                     'desarrollo software', 'desarrollo web']


def _detect_agent_from_category(idea):
    """Detecta agente por ai_category (replica logica del dashboard)."""
    category = (idea['ai_category'] or '').lower().strip()
    return CATEGORY_AGENT_MAP.get(category)


def _detect_agent_from_keywords(idea):
    """Detecta agente analizando keywords en el texto de la idea."""
    text = (idea['text'] or '').lower()
    for agent_key, keywords in CONSULTING_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            return agent_key
    return None


def _is_software_task(idea):
    """Determina si una idea es para el pipeline de software."""
    category = (idea['ai_category'] or '').lower()
    ai_type = (idea['ai_type'] or '').lower()
    text = (idea['text'] or '').lower()

    if 'software' in category or 'desarrollo' in category:
        return True
    if ai_type in ('software', 'desarrollo'):
        return True
    return any(kw in text for kw in SOFTWARE_KEYWORDS)


def ciclo():
    """Un ciclo del PM: rutea ideas pendientes al pipeline correcto.

    Returns:
        Numero de ideas ruteadas.
    """
    db = get_connection()
    ideas = queries.get_routable_ideas(db)
    routed = 0

    for idea in ideas:
        idea_id = idea['id']
        agent = idea['suggested_agent']
        skills = idea['suggested_skills']

        # 1. Consulting: tiene agente sugerido explicitamente
        if agent and agent in CONSULTING_AGENTS:
            queries.update_execution_status(db, idea_id, 'queued_consulting', agent_name=NOMBRE)
            log(NOMBRE, f"#{idea_id} -> Consulting ({agent})", ">")
            routed += 1
            continue

        # 2. Consulting: detectado por ai_category
        detected = _detect_agent_from_category(idea)
        if detected:
            db.execute("UPDATE ideas SET suggested_agent = ? WHERE id = ?", [detected, idea_id])
            db.commit()
            queries.update_execution_status(db, idea_id, 'queued_consulting', agent_name=NOMBRE)
            log(NOMBRE, f"#{idea_id} -> Consulting ({detected}, por categoria)", ">")
            routed += 1
            continue

        # 3. Consulting: ai_type o ai_category es explicitamente 'Consulting'
        ai_type = (idea['ai_type'] or '').lower()
        ai_cat = (idea['ai_category'] or '').lower()
        if ai_type == 'consulting' or ai_cat == 'consulting':
            detected_kw = _detect_agent_from_keywords(idea)
            if detected_kw:
                db.execute("UPDATE ideas SET suggested_agent = ? WHERE id = ?", [detected_kw, idea_id])
                db.commit()
            queries.update_execution_status(db, idea_id, 'queued_consulting', agent_name=NOMBRE)
            log(NOMBRE, f"#{idea_id} -> Consulting ({detected_kw or 'generic'}, tipo explicito)", ">")
            routed += 1
            continue

        # 4. Software: detectado por tipo o keywords
        if _is_software_task(idea):
            queries.update_execution_status(db, idea_id, 'queued_software', agent_name=NOMBRE)
            log(NOMBRE, f"#{idea_id} -> Software Pipeline", ">")
            routed += 1
            continue

        # 5. Consulting: detectado por keywords en texto libre
        detected = _detect_agent_from_keywords(idea)
        if detected:
            db.execute("UPDATE ideas SET suggested_agent = ? WHERE id = ?", [detected, idea_id])
            db.commit()
            queries.update_execution_status(db, idea_id, 'queued_consulting', agent_name=NOMBRE)
            log(NOMBRE, f"#{idea_id} -> Consulting ({detected}, por keywords)", ">")
            routed += 1
            continue

        # 6. Consulting: tiene skills sugeridas pero no agente explicito
        if skills and skills.strip() and skills.strip() != '[]':
            queries.update_execution_status(db, idea_id, 'queued_consulting', agent_name=NOMBRE)
            log(NOMBRE, f"#{idea_id} -> Consulting (skills detectadas)", ">")
            routed += 1
            continue

        # Else: skip, necesita ruteo manual desde el dashboard

    # 7. Retry: re-encolar ideas fallidas que se pueden reintentar
    failed = queries.get_retryable_failed_ideas(db)
    for idea in failed:
        idea_id = idea['id']
        agent = idea['suggested_agent']
        error = idea['execution_error'] or ''

        # Determinar a que cola reenviar
        if agent and agent in CONSULTING_AGENTS:
            queue = 'queued_consulting'
        elif _is_software_task(idea):
            queue = 'queued_software'
        else:
            continue

        # Marcar retry en el error para tracking
        new_error = f"{error}\n[RETRY] Re-encolada por PM"
        queries.update_execution_status(
            db, idea_id, queue,
            error=new_error, agent_name=NOMBRE
        )
        log(NOMBRE, f"#{idea_id} RETRY -> {queue}", "~")
        routed += 1

    if routed > 0:
        logger.info("[PM] Ruteadas %d ideas en este ciclo", routed)
    return routed
