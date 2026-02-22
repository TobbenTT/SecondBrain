"""
Agente QA (Code Reviewer) — Pipeline Software

Toma ideas con execution_status='developed',
revisa codigo con Claude, y:
  - Aprobado  -> execution_status='completed', code_stage='expressed'
  - Rechazado -> execution_status='queued_software' (vuelve a DEV con feedback)

Adaptado de Sistema-OpenClaw/revisor.py
"""
from compartido import log, logger, pensar_con_claude, pensar_con_gemini, pensar_con_local, enviar_whatsapp
from db.connection import get_connection
from db import queries

NOMBRE = "QA"

SISTEMA_QA = """Eres un Code Reviewer Senior experto en Python.
Tu trabajo es revisar el codigo generado y evaluar:

1. **Funcionalidad**: El codigo cumple con los requerimientos?
2. **Errores**: Hay bugs obvios, errores de logica o crashes potenciales?
3. **Seguridad**: Hay vulnerabilidades (inyeccion, paths sin validar, etc)?
4. **Calidad**: El codigo es legible, bien estructurado y documentado?

Responde en este formato EXACTO:

VEREDICTO: APROBADO o RECHAZADO
SCORE: [1-10]
RESUMEN: [1 linea]
DETALLES:
- [punto 1]
- [punto 2]
- [punto 3]

Si RECHAZAS, explica exactamente que hay que corregir."""


def ciclo():
    """Un ciclo de QA: revisa todos los desarrollos pendientes.

    Returns:
        Numero de ideas revisadas.
    """
    db = get_connection()
    tasks = queries.get_ideas_in_status(db, 'built')
    reviewed = 0

    for task in tasks:
        idea_id = task['id']
        text = task['text'] or ''
        code_output = task['execution_output'] or ''

        log(NOMBRE, f"Revisando #{idea_id}: {text[:50]}...", ">")

        try:
            prompt = (
                f"Revisa el siguiente trabajo:\n\n"
                f"REQUERIMIENTO: {text}\n\n"
                f"CODIGO GENERADO:\n{code_output}"
            )
            # Intentar Claude -> Gemini -> Local
            full_prompt = f"{SISTEMA_QA}\n\n---\n\n{prompt}"
            review = pensar_con_claude(prompt, sistema=SISTEMA_QA, max_tokens=2048)
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
                    error="QA: Ningún modelo de IA respondió (Claude sin key, Gemini quota, Local apagado).",
                    agent_name=NOMBRE
                )
                continue

            # Parsear veredicto
            review_upper = review.upper()
            aprobado = (
                "VEREDICTO: APROBADO" in review_upper
                or review_upper.split('\n')[0].strip().endswith("APROBADO")
            )

            if aprobado:
                full_output = f"{code_output}\n\n---\n### Code Review (QA — {motor_review})\n{review}"
                queries.update_execution_status(
                    db, idea_id, 'completed',
                    output=full_output, agent_name=NOMBRE
                )
                log(NOMBRE, f"#{idea_id} APROBADO", "+")
                logger.info("APROBADO: #%d", idea_id)
                enviar_whatsapp(
                    f"✅ *Proyecto SecondBrain — QA Aprobado*\n"
                    f"📋 Tarea #{idea_id}: `{text[:50]}`\n"
                    f"🏆 Código aprobado por {motor_review}.\n"
                    f"📁 Movida a Proyectos."
                )
            else:
                # Rechazado: vuelve a DEV con feedback
                error_msg = f"QA RECHAZADO:\n{review}"
                queries.update_execution_status(
                    db, idea_id, 'queued_software',
                    error=error_msg, agent_name=NOMBRE
                )
                log(NOMBRE, f"#{idea_id} RECHAZADO -> back to DEV", "~")
                logger.warning("RECHAZADO: #%d", idea_id)
                enviar_whatsapp(
                    f"⚠️ *Proyecto SecondBrain — QA Rechazado*\n"
                    f"📋 Tarea #{idea_id}: `{text[:50]}`\n"
                    f"🔄 Devuelta al DEV para corrección."
                )

            reviewed += 1

        except Exception as e:
            logger.exception("Error revisando #%d", idea_id)
            log(NOMBRE, f"Error revisando #{idea_id}: {e}", "!")

    return reviewed
