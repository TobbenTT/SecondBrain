"""
Agente Reviewer — Pipeline de Documentos

Toma ideas con execution_status='reviewing',
revisa la calidad del documento generado con Claude, y:
  - Aprobado  -> execution_status='completed', code_stage='expressed'
  - Rechazado -> execution_status='queued_consulting' (vuelve a Consulting con feedback)
"""
from compartido import log, logger, pensar, enviar_whatsapp
from db.connection import get_connection
from db import queries
from skills.loader import load_skill

NOMBRE = "REVIEWER"

# Loaded from core/skills/core/review-document-quality.md (editable SOP)
SISTEMA_REVIEWER = load_skill('core/review-document-quality.md') or """Eres un Director de Calidad.
Evalua: Completitud, Profesionalismo, Especificidad, Estructura, Proximos Pasos.
Responde: VEREDICTO: APROBADO/RECHAZADO, SCORE: [1-10], RESUMEN, DETALLES."""


def ciclo():
    """Un ciclo del Reviewer: revisa documentos consulting pendientes.

    Returns:
        Numero de documentos revisados.
    """
    db = get_connection()
    tasks = queries.get_ideas_in_status(db, 'reviewing')
    reviewed = 0

    MAX_DOC_CHARS = 8000  # ~2000 tokens — truncate large docs to save tokens

    for task in tasks:
        idea_id = task['id']
        text = task['text'] or ''
        doc_output = task['execution_output'] or ''

        if len(doc_output) > MAX_DOC_CHARS:
            logger.info("Truncating doc for review #%d: %d -> %d chars", idea_id, len(doc_output), MAX_DOC_CHARS)
            doc_output = doc_output[:MAX_DOC_CHARS] + "\n\n[... TRUNCADO para review ...]"

        log(NOMBRE, f"Revisando #{idea_id}: {text[:50]}...", ">")

        try:
            prompt = (
                f"Revisa el siguiente documento generado por un agente consultor:\n\n"
                f"SOLICITUD ORIGINAL: {text}\n\n"
                f"DOCUMENTO GENERADO:\n{doc_output}"
            )
            # Ollama primario -> Claude fallback -> Gemini fallback
            review = pensar(prompt, sistema=SISTEMA_REVIEWER, max_tokens=2048, fallback="claude")
            motor_review = "Ollama/Cloud"

            if not review:
                log(NOMBRE, f"#{idea_id} — Ningun modelo respondio, marcando failed", "!")
                logger.warning("SKIP #%d: ningún modelo de IA respondió (Claude/Gemini/Local)", idea_id)
                queries.update_execution_status(
                    db, idea_id, 'failed',
                    error="REVIEWER: Ningún modelo de IA respondió (Claude sin key, Gemini quota, Local apagado).",
                    agent_name=NOMBRE
                )
                continue

            review_upper = review.upper()
            aprobado = (
                "VEREDICTO: APROBADO" in review_upper
                or review_upper.split('\n')[0].strip().endswith("APROBADO")
            )

            if aprobado:
                full_output = f"{doc_output}\n\n---\n### Quality Review (Reviewer — {motor_review})\n{review}"
                queries.update_execution_status(
                    db, idea_id, 'completed',
                    output=full_output, agent_name=NOMBRE
                )
                log(NOMBRE, f"#{idea_id} APROBADO", "+")
                logger.info("APROBADO: #%d (consulting)", idea_id)
                enviar_whatsapp(
                    f"✅ *Proyecto SecondBrain — Documento Aprobado*\n"
                    f"📋 Tarea #{idea_id}: `{text[:50]}`\n"
                    f"🏆 Aprobado por Reviewer ({motor_review}).\n"
                    f"📁 Movida a Proyectos."
                )
            else:
                error_msg = f"REVIEWER RECHAZADO:\n{review}"
                queries.update_execution_status(
                    db, idea_id, 'queued_consulting',
                    error=error_msg, agent_name=NOMBRE
                )
                log(NOMBRE, f"#{idea_id} RECHAZADO -> back to Consulting", "~")
                logger.warning("RECHAZADO: #%d (consulting)", idea_id)
                enviar_whatsapp(
                    f"⚠️ *Proyecto SecondBrain — Documento Rechazado*\n"
                    f"📋 Tarea #{idea_id}: `{text[:50]}`\n"
                    f"🔄 Devuelta a Consulting para corrección."
                )

            reviewed += 1

        except Exception as e:
            logger.exception("Error revisando #%d", idea_id)
            log(NOMBRE, f"Error revisando #{idea_id}: {e}", "!")

    return reviewed
