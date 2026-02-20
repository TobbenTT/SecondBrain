# Skill: Clasificar Idea (GTD Triage)

## Proposito
Determinar rapidamente QUE es una entrada nueva al sistema y DONDE debe ir.

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

## Output Esperado
JSON con todos los campos de clasificacion GTD completos.
