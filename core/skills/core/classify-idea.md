# Skill: Clasificar Idea (GTD Triage) — VSC Second Brain

## Proposito
Determinar rapidamente QUE es una entrada nueva al sistema y DONDE debe ir, asignando un **score de confianza** para activar el filtro Bouncer del Second Brain.

## Preguntas de Clasificacion (en orden)

### 1. ¿Es accionable?
- **NO** → Es referencia, material de apoyo, o basura
  - Si tiene valor futuro → Material de Apoyo / Recurso PARA
  - Si es informacion permanente → Contexto / Memoria
  - Si no tiene valor → Archivar o eliminar
- **SI** → Continuar al paso 2

### 2. ¿Requiere mas de un paso?
- **SI** → Es un **PROYECTO**
  - Definir nombre del proyecto
  - Identificar objetivo/resultado deseado
  - Descomponer en sub-tareas (usar skill: decompose-project)
  - Identificar la PROXIMA ACCION
- **NO** → Es una **TAREA** unica
  - Definir la accion fisica concreta
  - ¿Se puede hacer en menos de 2 minutos? → Hacerla ahora
  - ¿Es para otra persona? → Delegacion (Waiting For)
  - ¿Tiene fecha especifica? → Calendario
  - Lo demas → Lista de Proximas Acciones

### 3. Campos a completar
Para cada elemento clasificado:
- **Tipo**: Tarea, Proyecto, Nota, Meta, Delegacion, Referencia
- **Contexto GTD**: @computador, @email, @telefono, @oficina, @calle, @casa, @espera, @compras, @investigar, @reunion, @leer
- **Energia**: baja (tareas mecanicas), media (requiere atencion), alta (requiere concentracion profunda)
- **Tiempo estimado**: en minutos/horas/dias
- **Tipo de compromiso**: comprometida, esta_semana, algun_dia, tal_vez
- **Area de responsabilidad**: A cual de las areas corporativas pertenece
- **Responsable**: Quien ejecuta, basado en expertise del equipo

## Reglas de Routing
- Si menciona dinero/costos/presupuesto → Finanzas → jose
- Si menciona personal/turnos/dotacion → Operaciones → gonzalo
- Si menciona capacitacion/formacion/competencias → Capacitacion → gonzalo
- Si menciona contratos/cumplimiento/seguridad → Contratos/HSE → gonzalo
- Si es estrategico/vision/direccion → Direccion → jose
- Si es tecnico/desarrollo/codigo → Desarrollo → david

## Score de Confianza (Bouncer)

Asignar un valor `confianza` entre 0.0 y 1.0 que indica que tan seguro esta el clasificador:

| Rango | Significado | Accion del sistema |
|-------|-------------|-------------------|
| 0.8 - 1.0 | Alta confianza — clasificacion clara | Clasificar automaticamente |
| 0.5 - 0.79 | Media — ambiguo pero razonable | Clasificar pero marcar para revision |
| 0.0 - 0.49 | Baja — no se puede determinar | NO clasificar, pedir aclaracion al usuario |

Factores que reducen la confianza:
- Texto muy corto o vago (ej: "eso que dijimos")
- Multiples categorias posibles
- Sin contexto de quien habla o para que
- Mezcla temas distintos en una sola entrada

## Output Esperado

JSON con TODOS los campos de clasificacion GTD completos. Ejemplo:

```json
{
  "tipo": "tarea",
  "nombre": "Revisar contrato de Fireflies.ai antes de renovacion",
  "resumen": "Verificar terminos y costo antes de la renovacion automatica del 15 de marzo",
  "contexto_gtd": "@computador",
  "energia": "media",
  "tiempo_estimado": "30 min",
  "compromiso": "esta_semana",
  "urgencia": "media",
  "area": "Operaciones",
  "responsable": "jose",
  "delegacion": null,
  "siguiente_accion": "Abrir portal de Fireflies y revisar plan actual vs alternativas",
  "confianza": 0.92
}
```

IMPORTANTE: El campo `confianza` es OBLIGATORIO. Sin el, el sistema no puede decidir si clasificar automaticamente o pedir revision humana.
