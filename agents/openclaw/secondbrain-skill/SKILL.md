---
name: secondbrain-api
description: Captura ideas, consulta tareas, genera digests y gestiona el Segundo Cerebro corporativo de Value Strategy Consulting
user-invocable: true
metadata:
  openclaw:
    requires:
      env: ["SECONDBRAIN_URL", "SECONDBRAIN_API_KEY"]
    primaryEnv: "SECONDBRAIN_API_KEY"
---

# SecondBrain API — Value Strategy Consulting

Este skill conecta al agente con el Segundo Cerebro corporativo. Permite capturar ideas por voz/texto, consultar tareas, generar digests y gestionar delegaciones — todo desde WhatsApp, Telegram o cualquier canal.

## Cuando Usar Este Skill

- Cuando el usuario dice algo que parece una idea, tarea, nota o instruccion → **CAPTURAR**
- Cuando pregunta "que tengo pendiente", "mis tareas", "que hay nuevo" → **CONSULTAR**
- Cuando dice "dame el resumen", "digest", "que paso hoy" → **DIGEST**
- Cuando dice "marcar como hecho", "ya termine X" → **COMPLETAR TAREA**
- Cuando dice "delegar a gonzalo", "dile a jose que..." → **CAPTURAR** (la IA detecta delegacion)
- Cuando dice "guardar en memoria", "recuerda que..." → **CONTEXTO**

## Equipo

- **david** (admin, Direccion) — Estrategia, Operaciones, Gestion
- **gonzalo** (manager, Operaciones) — HSE, Ejecucion, Contratos
- **jose** (analyst, Finanzas) — Finanzas, Presupuestos, Analisis

## Endpoints Disponibles

Base URL: Variable de entorno `SECONDBRAIN_URL` (default: `http://localhost:3000`)
Auth: Header `X-API-Key` con valor de `SECONDBRAIN_API_KEY`

### 1. Capturar Idea (lo mas comun — voz/texto)
```
POST /api/external/capture
Body: { "text": "el texto de la idea", "speaker": "david", "source": "whatsapp" }
Response: { success, split, idea/ideas, message }
```
- `speaker` es el username de quien habla (david/gonzalo/jose)
- `source` puede ser: whatsapp, telegram, signal, slack, openclaw
- Si la IA detecta multiples ideas, `split: true` y devuelve array de `ideas`
- IMPORTANTE: Siempre incluir el `speaker` para que la IA sepa quien habla

### 2. Resumen Rapido (que hay pendiente)
```
GET /api/external/summary?username=david
Response: { total_ideas, recent_ideas, pending_delegations, today_checklist }
```
- `username` es opcional, usa el del API key si no se especifica
- `today_checklist` tiene items del dia con estado completado/pendiente

### 3. Generar Digest Diario
```
GET /api/external/digest
Response: { success, digest }
```
- Devuelve un resumen en Markdown de los ultimos 7 dias
- Incluye: acciones urgentes, pipeline CODE, delegaciones, sugerencias

### 4. Listar Ideas Recientes
```
GET /api/ideas?code_stage=organized&para_type=project
Response: [{ id, text, ai_type, ai_category, ai_summary, assigned_to, priority, ... }]
```
- Filtros opcionales: `code_stage` (captured/organized/distilled/expressed), `para_type` (project/area/resource/archive), `area_id`

### 5. Listar Areas de Responsabilidad
```
GET /api/areas
Response: [{ id, name, description, icon, ideas_count, context_count }]
```

### 6. Checklist del Dia (por consultor)
```
GET /api/checklist/david
Response: { date, username, checklist: [{idea_id, text, priority, completed}], waiting }
```

### 7. Marcar Tarea Completada (webhook)
```
POST /api/webhook/openclaw
Body: { "event": "task_completed", "payload": { "username": "david", "idea_id": 42 } }
```

### 8. Resolver Delegacion (webhook)
```
POST /api/webhook/openclaw
Body: { "event": "delegation_completed", "payload": { "waiting_id": 7 } }
```

### 9. Guardar en Memoria/Contexto (webhook)
```
POST /api/webhook/openclaw
Body: { "event": "context_add", "payload": { "key": "clave", "content": "valor", "category": "business" } }
```

### 10. Chat con Agentes IA
```
POST /api/ai/chat
Body: { "message": "pregunta", "agent": "staffing" }
Response: { response: "respuesta del agente" }
```
- Agentes: `staffing`, `training`, `finance`, `compliance`
- Sin `agent` usa el asistente general del Segundo Cerebro

### 11. Delegaciones Pendientes
```
GET /api/waiting-for
Response: [{ id, description, delegated_to, delegated_by, status, area_name }]
```

## Instrucciones de Comportamiento

1. **Captura Automatica**: Si el usuario envía un mensaje que claramente es una idea, tarea o instruccion (no una pregunta sobre el sistema), capturalo AUTOMATICAMENTE con `/api/external/capture`. No preguntes "quieres que lo capture?" — solo hazlo.

2. **Respuesta Concisa**: Despues de capturar, responde con un resumen corto:
   - "Capturado: [resumen]. Asignado a [persona], prioridad [alta/media/baja]."
   - Si hubo split: "Separado en N ideas: 1) ... 2) ..."

3. **Idioma**: Siempre responde en espanol.

4. **Identidad del Hablante**: Identifica quien esta hablando basandote en el canal/contacto y usa el `speaker` correcto. Si no sabes, pregunta "Quien habla?" una sola vez.

5. **Buenos Dias**: Si alguien te saluda por la manana, responde con su checklist del dia (`/api/checklist/{username}`).

6. **Fin del Dia**: Si alguien se despide por la tarde/noche, genera un mini-digest de lo que se logro hoy.

7. **Proactividad en Heartbeat**: Durante el heartbeat, revisa si hay delegaciones vencidas o tareas de alta prioridad sin completar y notifica al usuario apropiado.
