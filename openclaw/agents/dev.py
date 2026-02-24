"""
Agente DEV (Programador) — Pipeline Software

Toma ideas con execution_status='queued_software',
genera codigo con Gemini (5 reintentos) + fallback Ollama,
y marca como 'developed' para que QA lo revise.

Adaptado de Sistema-OpenClaw/agents/customizable/execution/programador.py (v7.6)
"""
import re
import time

from compartido import CONFIG, log, logger, pensar, pensar_con_local, enviar_whatsapp
from db.connection import get_connection
from db import queries
from skills.loader import load_skill

NOMBRE = "DEV"

# Loaded from core/skills/core/generate-python-code.md (editable SOP)
_DEV_SKILL = load_skill('core/generate-python-code.md') or ""
MAX_INTENTOS_GEMINI = 5
MAX_INTENTOS_CORRECCION = 3
ESPERA_ENTRE_INTENTOS = 3


def _extraer_codigo(respuesta_ia):
    """Extrae bloques de codigo de la respuesta de la IA.

    Busca patron === FILE: nombre.py === ... === ENDFILE ===
    Fallback: bloques markdown ```python ... ```
    """
    # Patron principal: === FILE: nombre.py ===
    patron = r'===\s*FILE:\s*(.*?)\s*===(.*?)===\s*ENDFILE\s*==='
    archivos = re.findall(patron, respuesta_ia, re.DOTALL | re.IGNORECASE)
    if archivos:
        partes = []
        for nombre, contenido in archivos:
            partes.append(f"**Archivo: {nombre.strip()}**\n```python\n{contenido.strip()}\n```")
        return "\n\n".join(partes)

    # Fallback: bloques markdown
    bloques = re.findall(r'```(?:python)?\s*(.*?)```', respuesta_ia, re.DOTALL)
    if bloques:
        return "\n\n".join(f"```python\n{b.strip()}\n```" for b in bloques)

    # Ultimo recurso: texto limpio
    return respuesta_ia.strip()


def _programar_con_ia(requerimiento, error_previo="", es_correccion=False):
    """Genera codigo usando Gemini con reintentos + fallback a Ollama.

    Returns:
        Tuple (codigo: str, es_offline: bool)
    """
    if error_previo:
        prompt = (
            f"{_DEV_SKILL}\n\n"
            f"MODO CORRECCION: Tu codigo anterior fue RECHAZADO. Corrigelo.\n\n"
            f"REQUERIMIENTO ORIGINAL:\n{requerimiento}\n\n"
            f"ERROR O CRITICA:\n{error_previo}\n\n"
            "Genera el codigo corregido completo."
        )
    else:
        prompt = (
            f"{_DEV_SKILL}\n\n"
            f"TAREA:\n{requerimiento}"
        )

    # Correcciones: directo a local
    if es_correccion:
        log(NOMBRE, "Modo CORRECCION — modelo local", ">")
        respuesta = pensar_con_local(prompt)
        return (respuesta, True) if respuesta else ("", True)

    # Ollama primario -> Gemini fallback
    log(NOMBRE, "Generando codigo (Ollama -> Gemini)...", "~")
    respuesta = pensar(prompt, fallback="gemini")
    if respuesta:
        # Detectar si fue local u online
        es_offline = not CONFIG.get("gemini_api_key")  # aproximacion
        log(NOMBRE, "Codigo generado OK", "+")
        return respuesta, es_offline

    return ("", True)


def _elegir_tarea(tasks):
    """Elige la tarea con mayor prioridad.

    Orden: alta > media > baja (ya ordenadas por la query).
    """
    return tasks[0] if tasks else None


def ciclo():
    """Un ciclo del DEV: toma una tarea queued_software y genera codigo.

    Returns:
        1 si proceso algo, 0 si no.
    """
    db = get_connection()
    tasks = queries.get_ideas_in_status(db, 'queued_software')
    if not tasks:
        return 0

    task = _elegir_tarea(tasks)
    if not task:
        return 0

    idea_id = task['id']
    text = task['text'] or ''

    # Verificar si es correccion (tiene error previo de QA)
    error_previo = task['execution_error'] or ''
    es_correccion = 'RECHAZADO' in error_previo or 'REJECTED' in error_previo

    # Verificar limite de correcciones
    if es_correccion:
        fallos = queries.count_previous_failures(db, idea_id)
        if fallos >= MAX_INTENTOS_CORRECCION:
            queries.update_execution_status(
                db, idea_id, 'blocked',
                error=f"BLOQUEADO tras {fallos} correcciones fallidas. Requiere revision manual.",
                agent_name=NOMBRE
            )
            log(NOMBRE, f"#{idea_id} BLOQUEADO tras {fallos} fallos", "X")
            return 0

    # Marcar en progreso
    queries.update_execution_status(db, idea_id, 'in_progress', agent_name=NOMBRE)
    log(NOMBRE, f"#{idea_id}: {text[:60]}...", ">")

    # Generar codigo
    codigo_raw, es_offline = _programar_con_ia(text, error_previo, es_correccion)

    if codigo_raw:
        codigo_formateado = _extraer_codigo(codigo_raw)
        motor = "Ollama local" if es_offline else CONFIG["gemini_model"]
        output = f"**Motor:** {motor}\n\n### Codigo Generado\n\n{codigo_formateado}"
        queries.update_execution_status(db, idea_id, 'developed', output=output, agent_name=NOMBRE)
        log(NOMBRE, f"#{idea_id} -> Developed OK", "+")
        enviar_whatsapp(
            f"✅ *Proyecto SecondBrain — Código Generado*\n"
            f"📋 Tarea #{idea_id}: `{text[:50]}`\n"
            f"⚙️ Motor: {motor}\n"
            f"🔍 Esperando revisión de QA."
        )
        return 1
    else:
        queries.update_execution_status(
            db, idea_id, 'failed',
            error="No se pudo generar codigo con ninguno de los modelos.",
            agent_name=NOMBRE
        )
        log(NOMBRE, f"#{idea_id} FAILED — sin respuesta de IA", "!")
        return 0
