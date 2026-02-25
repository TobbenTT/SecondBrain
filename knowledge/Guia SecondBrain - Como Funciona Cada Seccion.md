# SecondBrain — Guia Completa de Uso

## Que es SecondBrain?

SecondBrain es un hub de productividad corporativa que combina las metodologias **GTD (Getting Things Done)**, **PARA (Projects, Areas, Resources, Archive)** y **CODE (Capture, Organize, Distill, Express)** para gestionar ideas, proyectos, delegaciones y reuniones de forma inteligente.

---

## Secciones Principales

### 1. Home (Inicio)

Vista ejecutiva con tarjetas de resumen:
- **Proyectos activos** — cantidad de proyectos en desarrollo
- **Ideas capturadas** — total de ideas en el sistema
- **Archivos** — documentos en la base de conocimiento
- **Areas activas** — areas de responsabilidad vigentes
- **Resumen ejecutivo** — metricas clave, tendencias semanales, proyectos con deadline

---

### 2. Ideas (Bandeja de Entrada)

La bandeja de entrada inteligente donde llegan todas las ideas capturadas.

**Como funciona:**
1. Captura una idea por texto o audio
2. La IA clasifica automaticamente: tipo, categoria, prioridad, accion sugerida
3. Cada idea pasa por el flujo **CODE**:
   - **Captured** — recien capturada, sin procesar
   - **Organized** — clasificada y asignada a un area/proyecto
   - **Distilled** — resumida, con accion clara definida
   - **Expressed** — ejecutada, resultado documentado

**Filtros disponibles:** etapa CODE, tipo PARA, area, persona asignada, contexto GTD, nivel de energia

**Acciones sobre ideas:**
- Asignar a persona, area o proyecto
- Definir prioridad (alta/media/baja), contexto (@computador, @oficina...) y energia
- Marcar como proxima accion
- Descomponer en sub-tareas (crea un proyecto GTD)
- Ejecutar via agente IA

---

### 3. Delegaciones (A la Espera)

Seguimiento de tareas delegadas a terceros (metodologia GTD "Waiting For").

**Como funciona:**
1. Click **"+ Nueva Delegacion"**
2. Describe que se espera, selecciona a quien se delego y fecha limite
3. La delegacion aparece en la lista con estado "Esperando"
4. Cuando la persona responde/completa, marca como completada

**Para que sirve:**
- No perder de vista compromisos que dependen de otros
- Saber cuantas cosas tienes esperando respuesta
- Hacer seguimiento sistematico en reuniones

**Campos:**
- Descripcion de lo delegado
- Persona delegada (seleccion del equipo)
- Fecha limite (opcional)
- Estado: esperando / completado

---

### 4. OKRs (Objetivos y Resultados Clave)

Sistema para definir y medir metas estrategicas (Objectives & Key Results).

**Como funciona:**
1. Crea un **Objetivo** — la meta cualitativa (ej: "Mejorar la eficiencia operativa")
2. Agrega **Key Results** — metricas cuantificables que miden el progreso
   - Ejemplo: "Reducir tiempos de entrega de 5 a 3 dias" (meta: 3, unidad: dias)
3. Actualiza el progreso periodicamente
4. Vincula proyectos, ideas o areas al objetivo

**Barra de progreso (colores):**
- **Verde (>=70%)** — en buen camino
- **Amarillo (40-70%)** — atencion, avanzando lento
- **Rojo (<40%)** — en riesgo, requiere accion

**Campos de un Objetivo:**
- Titulo del objetivo
- Descripcion
- Responsable (owner)
- Periodo (ej: Q1 2026)

**Campos de un Key Result:**
- Descripcion del resultado clave
- Meta numerica (target_value)
- Unidad de medida (ej: dias, %, unidades)
- Valor actual (se actualiza manualmente)

---

### 5. Proximas Acciones (GTD Board)

Tablero Kanban de tareas pendientes organizadas por diferentes criterios.

**Como funciona:**
Las ideas marcadas como "Proxima Accion" aparecen aqui organizadas en columnas.

**4 vistas de agrupacion:**
1. **Contexto** — donde necesitas estar para hacer la tarea
   - @computador, @email, @telefono, @oficina, @calle, @casa, @espera, @compras, @investigar, @reunion, @leer
2. **Energia** — nivel de energia mental requerido
   - Baja (tareas simples), Media, Alta (tareas que requieren concentracion)
3. **Persona** — quien es responsable de la tarea
4. **Compromiso** — nivel de compromiso asumido
   - Comprometida, Esta Semana, Algun Dia, Tal Vez

**Tarjetas de efectividad** (arriba del tablero):
- Proyectos activos
- Proximas acciones pendientes
- Tareas pendientes totales
- Consultores activos

**Acciones:**
- Marcar tarea como completada (checkbox)
- Arrastrar entre columnas para cambiar contexto
- Ver detalles de la idea

---

### 6. Proyectos GTD

Proyectos desglosados en sub-tareas con seguimiento de progreso.

**Como funciona:**
1. Cuando una idea se marca como "Proyecto" (is_project=1), aparece aqui
2. Cada proyecto puede descomponerse en sub-tareas (via "Descomponer con IA")
3. Una sub-tarea se marca como "Proxima Accion" — la siguiente tarea a ejecutar
4. Al completar una sub-tarea, la siguiente se promueve automaticamente

**Ordenamiento:** Prioridad descendente (Alta → Media → Baja → Sin prioridad)

**Que muestra cada tarjeta:**
- Titulo del proyecto
- Badge de prioridad (ALTA rojo, MEDIA amarillo, BAJA azul)
- Categoria y persona asignada
- Barra de progreso (sub-tareas completadas / total)
- Proxima accion destacada en verde

**Como crear un proyecto GTD:**
1. Desde Ideas, crea una idea tipo proyecto
2. Click "Descomponer" — la IA genera sub-tareas automaticamente
3. Cada sub-tarea hereda el contexto del proyecto
4. Define cual es la proxima accion

---

### 7. Reuniones

Inteligencia de reuniones con analisis automatico de transcripciones.

**Como funciona:**
1. Las reuniones se capturan automaticamente desde Fireflies (transcripcion)
2. La IA analiza la transcripcion y extrae:
   - **Asistentes** — quienes participaron
   - **Puntos clave** — temas principales discutidos
   - **Acuerdos** — decisiones tomadas
   - **Compromisos** — tareas asignadas con responsable
   - **Entregables** — documentos o productos esperados

**Filtros:** busqueda por texto, participante, rango de fechas

**Funcionalidades:**
- Ver detalle completo de cada reunion
- Vincular reuniones a proyectos y areas
- Exportar minutas por email a destinatarios registrados
- Estadisticas: total reuniones, compromisos pendientes

---

### 8. Proyectos (Portafolio)

Gestion de proyectos corporativos con estados y deadlines.

**Estados:** Activo, En Desarrollo, Beta, Pausado, Completado, Cancelado

**Campos:**
- Nombre, descripcion, URL, icono
- Area relacionada, horizonte temporal
- Tipo de proyecto, cliente, geografia
- Deadline (fecha limite)

---

### 9. Areas de Responsabilidad (PARA)

Areas permanentes de responsabilidad (metodologia PARA).

**Diferencia con Proyectos:**
- **Proyecto** = tiene fecha de fin, es temporal
- **Area** = es continua, sin fecha de fin (ej: "Operaciones", "HSE", "Finanzas")

**Areas predefinidas:** Operaciones, HSE, Finanzas, Contratos, Ejecucion, Gestion de Activos, Capacitacion, Desarrollo Profesional

---

### 10. Archivos (Base de Conocimiento)

Documentos de referencia almacenados en el sistema. Incluye guias, manuales, material de apoyo y cualquier recurso util para el equipo.

---

### 11. Analytics

Dashboard analitico con graficos y metricas:
- Ideas por dia/semana (tendencia)
- Tasa de completado del checklist diario
- Ideas por area activa
- Flujo CODE (cuantas ideas en cada etapa)
- Clasificacion por tipo y prioridad
- Productividad por usuario

---

### 12. Feedback

Sistema para que los usuarios envien sugerencias, reportar bugs o solicitar mejoras.

**Categorias:** Mejora, Bug, Sugerencia, Pregunta
**Prioridades:** Alta, Media, Baja
**Estados:** Abierto, En Progreso, Corregido, Resuelto, Cerrado, Rechazado

---

### 13. Galeria

Galeria de fotos del equipo y eventos, organizada por categorias.

---

## Metodologias Integradas

### GTD (Getting Things Done)
- **Capturar** — toda idea va a la bandeja de entrada
- **Clarificar** — la IA clasifica automaticamente
- **Organizar** — asignar contexto, energia, persona
- **Reflexionar** — reporte diario, analytics
- **Ejecutar** — proximas acciones, tablero kanban

### PARA (Projects, Areas, Resources, Archive)
- **Projects** — con fecha de fin
- **Areas** — responsabilidades continuas
- **Resources** — material de referencia
- **Archive** — ideas archivadas

### CODE (Capture, Organize, Distill, Express)
- **Captured** — idea recien capturada
- **Organized** — clasificada y asignada
- **Distilled** — resumida y con accion clara
- **Expressed** — ejecutada y documentada

---

## Roles de Usuario

| Rol | Permisos |
|-----|----------|
| **Admin** | Todo: gestionar usuarios, proyectos, configuracion, papelera |
| **Manager** | Gestionar ideas, proyectos, reuniones, delegar |
| **Analyst** | Crear ideas, ver analytics, feedback |
| **Consultor** | Ver todo (solo lectura), no puede borrar ni modificar |

---

## Tips de Productividad

1. **Revisa la bandeja de entrada diariamente** — procesa cada idea (clasificar, delegar o archivar)
2. **Define siempre la proxima accion** — cada proyecto debe tener una siguiente tarea clara
3. **Usa contextos** — cuando estes en @oficina, filtra por ese contexto y ejecuta
4. **Revisa delegaciones semanalmente** — haz seguimiento de lo que esperas de otros
5. **Actualiza OKRs mensualmente** — mide progreso real vs meta
6. **Exporta feedback regularmente** — para no perder sugerencias del equipo
