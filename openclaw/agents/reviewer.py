"""
Agente Reviewer — Pipeline de Documentos

Toma ideas con execution_status='reviewing',
revisa la calidad del documento generado con Claude, y:
  - Aprobado  -> execution_status='completed', code_stage='expressed'
  - Rechazado -> execution_status='queued_consulting' (vuelve a Consulting con feedback)
"""
from compartido import log, logger, pensar_con_claude, pensar_con_gemini, pensar_con_local, enviar_whatsapp
from db.connection import get_connection
from db import queries

NOMBRE = "REVIEWER"

SISTEMA_REVIEWER = """Eres un Director de Calidad de Value Strategy Consulting.
Revisas documentos generados por agentes consultores especializados.

Evalua estos 5 criterios:

1. **Completitud**: Cubre todos los aspectos relevantes de la solicitud?
2. **Profesionalismo**: Es presentable directamente a un cliente?
3. **Especificidad**: Tiene datos concretos, numeros y plazos? O es demasiado generico?
4. **Estructura**: Tiene secciones claras, tablas, y formato markdown adecuado?
5. **Proximos Pasos**: Incluye acciones concretas y asignables?

Responde en este formato EXACTO:

VEREDICTO: APROBADO o RECHAZADO
SCORE: [1-10]
RESUMEN: [1 linea]
DETALLES:
- [punto 1]
- [punto 2]
- [punto 3]

Si RECHAZAS, explica exactamente que falta o que mejorar."""


def ciclo():
    """Un ciclo del Reviewer: revisa documentos consulting pendientes.

    Returns:
        Numero de documentos revisados.
    """
    db = get_connection()
    tasks = queries.get_ideas_in_status(db, 'reviewing')
    reviewed = 0

    for task in tasks:
        idea_id = task['id']
        text = task['text'] or ''
        doc_output = task['execution_output'] or ''

        log(NOMBRE, f"Revisando #{idea_id}: {text[:50]}...", ">")

        try:
            prompt = (
                f"Revisa el siguiente documento generado por un agente consultor:\n\n"
                f"SOLICITUD ORIGINAL: {text}\n\n"
                f"DOCUMENTO GENERADO:\n{doc_output}"
            )
            # Intentar Claude -> Gemini -> Local
            full_prompt = f"{SISTEMA_REVIEWER}\n\n---\n\n{prompt}"
            review = pensar_con_claude(prompt, sistema=SISTEMA_REVIEWER, max_tokens=2048)
            motor_review = "Claude"

            if not review:
                log(NOMBRE, f"#{idea_id} — Claude no respondio, intentando Gemini...", "~")
                review = pensar_con_gemini(full_prompt)
                motor_review = "Gemini"

            if not review:
                log(NOMBRE, f"#{idea_id} — Gemini no respondio, intentando local...", "~")
                review = pensar_con_local(full_prompt)
                motor_review = "Local"

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
