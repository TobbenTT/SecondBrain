# SecondBrain Heartbeat — Automated Checks

Cada vez que el heartbeat se active, ejecuta estas verificaciones en orden:

## 1. Checklist del Dia
- Llama `secondbrain-api` con action=checklist para cada usuario (david, gonzalo, jose)
- Si algun usuario tiene tareas de prioridad ALTA sin completar, notificale por su canal

## 2. Delegaciones Vencidas
- Llama `secondbrain-api` con action=waiting
- Si hay delegaciones pendientes con mas de 3 dias de antiguedad, envia recordatorio al delegado

## 3. Ideas Sin Procesar
- Llama `secondbrain-api` con action=ideas, filters={ code_stage: "captured" }
- Si hay ideas capturadas sin organizar hace mas de 24 horas, notifica al admin (david)

## 4. Digest de Manana (solo si es despues de las 20:00)
- Si el heartbeat cae despues de las 8pm, genera un digest del dia
- Llama `secondbrain-api` con action=digest
- Envia el resultado al canal principal

## Reglas
- NO envies notificaciones fuera de horario laboral (8am - 10pm)
- Si no hay nada urgente, responde HEARTBEAT_OK (silencioso)
- Agrupa multiples notificaciones en un solo mensaje por usuario
- Formato: breve, accionable, en espanol
