# Guia para Crear Skills VSC — Second Brain

## Que es una Skill

Una skill es un archivo `.md` que le dice a un agente de IA **exactamente** como ejecutar una tarea especifica. Es un prompt estructurado con secciones estandarizadas que garantizan consistencia y calidad en los resultados.

Las skills se guardan en `core/skills/` organizadas en subcarpetas:
- `core/` — Skills fundamentales del sistema (clasificacion, modelado, auditoria)
- `customizable/` — Skills de generacion de documentos y planes
- `integration/` — Skills que conectan con herramientas externas

---

## Estructura Obligatoria

Toda skill VSC debe tener estas secciones **en este orden**:

### 1. Encabezado (Metadata)

```markdown
# Nombre de la Skill

## Skill ID: identificador-unico
## Version: 1.0.0
## Category: Letra - Nombre de Categoria
## Priority: P1/P2/P3 - Descripcion
```

**Categorias disponibles:**
| Letra | Categoria | Ejemplo |
|-------|-----------|---------|
| A | Document Generation | create-training-plan, create-staffing-plan |
| B | Analysis & Modeling | model-opex-budget, analyze-reliability |
| C | Knowledge Management | capture-knowledge-artifact |
| D | Process Orchestration | orchestrate-or-program |
| L | Compliance Intelligence | audit-compliance-readiness |

**Prioridades:**
- `P1 - Critical` — Core del negocio, se usa frecuentemente
- `P2 - Important` — Complementaria, necesaria para flujos completos
- `P3 - Nice to have` — Utilitaria, no bloquea otros procesos

---

### 2. Purpose (Proposito)

Un parrafo que explica **QUE hace** la skill y **POR QUE importa**. Incluir datos concretos cuando sea posible.

```markdown
## Purpose

Genera planes de capacitacion basados en brechas de competencia para
operaciones industriales. Un personal mal entrenado genera incidentes
de seguridad, dano a equipos y perdidas de produccion estimadas en
$50K-500K por evento.
```

**Reglas:**
- Ser especifico, no generico
- Incluir el impacto de NO hacerlo (datos, costos, riesgos)
- Usar "VSC" como marca, nunca nombres de clientes reales
- Si se necesita un ejemplo de cliente, usar `{client_name}` o "ClienteX"

---

### 3. Intent & Specification (Intencion)

Lista numerada de **exactamente que debe entender y ejecutar** el agente. Esta seccion define el "contrato" entre el usuario y la IA.

```markdown
## Intent & Specification

The AI agent MUST understand that:

1. **Nombre del concepto**: Explicacion detallada de que significa...
2. **Otro concepto**: Explicacion...
3. **Idioma**: Spanish (Latin American) para todos los entregables.
```

**Reglas:**
- Usar "MUST" para obligaciones, "SHOULD" para recomendaciones
- Cada punto debe ser verificable (no ambiguo)
- Incluir siempre el idioma del output

---

### 4. Trigger / Invocation

Como se activa la skill — tanto por comando como por lenguaje natural.

```markdown
## Trigger / Invocation

**Command:** `/nombre-de-la-skill`

### Natural Language Triggers
- "Crea un plan de capacitacion para [planta]"
- "Create a training plan for [facility]"
- "Desarrollar analisis de brechas"

### Aliases
- `/alias-corto`
- `/otro-alias`
```

---

### 5. Input Requirements (Entradas)

Tabla con los datos que necesita la skill para funcionar.

```markdown
## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `staffing_plan` | .xlsx or text | Estructura organizacional con roles y headcount |
| `operating_params` | Text | Horas operacion/año, capacidad planta |

### Optional Inputs

| Input | Format | Description | Default |
|-------|--------|-------------|---------|
| `historical_data` | .xlsx | Datos historicos para calibracion | None |
| `currency` | Text | Moneda del presupuesto | USD |
```

**Reglas:**
- Separar siempre Required vs Optional
- Incluir formato esperado (.xlsx, .docx, text, JSON)
- Para opcionales, incluir valor default

---

### 6. Output Specification (Salidas)

Que entrega la skill — archivos, formatos, estructura.

```markdown
## Output Specification

### Primary Deliverable

**File:** `VSC_{Tipo}_{Proyecto}_{Version}_{Fecha}.xlsx`

| Sheet | Content | Key Columns |
|-------|---------|-------------|
| Summary | Resumen ejecutivo con KPIs | Categoria, Monto, % del Total |
| Detail | Desglose linea por linea | Item, Cantidad, Costo Unitario, Total |
| Variance | Comparacion vs presupuesto anterior | Actual, Budget, Varianza |
```

**Reglas de naming:**
- Deliverables: `VSC_{Tipo}_{Proyecto}_{Version}_{Fecha}.ext`
- Benchmarks: "VSC internal benchmarks" (nunca nombres de empresas)
- Templates: `VSC_Template_{Nombre}_v{X}.{ext}`

---

### 7. Methodology (Metodologia)

El proceso paso a paso que sigue el agente. Esta es la seccion mas importante.

```markdown
## Methodology

### Step 1: Data Collection & Validation
1.1. Verificar que todos los inputs requeridos estan presentes
1.2. Validar formato y completitud de los datos
1.3. Identificar gaps en la informacion y solicitar al usuario

### Step 2: Analysis
2.1. [Pasos especificos del analisis]
2.2. [Calculos con formulas explicitas]

### Step 3: Model Construction
3.1. [Estructura del modelo]
3.2. [Formulas y logica de calculo]

### Step 4: Quality Assurance
4.1. Verificar consistencia interna
4.2. Comparar contra benchmarks VSC internos
4.3. Validar totales y subtotales
```

**Reglas:**
- Cada paso debe ser ejecutable sin ambiguedad
- Incluir formulas cuando hay calculos: `Total = Base × Factor × (1 + Contingencia)`
- Incluir rangos de referencia: "Para mineria, OPEX tipico es 2-7% del RAV"
- Referenciar benchmarks como "VSC internal" no como datos de empresas reales

---

### 8. Quality Criteria (Control de Calidad)

Checklist que el agente usa para verificar su propio output.

```markdown
## Quality Criteria

- [ ] Todos los campos requeridos estan completos
- [ ] Los totales coinciden con la suma de los componentes
- [ ] Los valores estan dentro de rangos razonables (benchmarks VSC)
- [ ] El idioma es consistente (espanol latinoamericano)
- [ ] No hay referencias a empresas reales (solo VSC, ClienteX, {client_name})
- [ ] El archivo sigue la convencion de nombres VSC
```

---

### 9. Inter-Agent Dependencies (Opcional)

Si la skill depende de o alimenta a otras skills.

```markdown
## Inter-Agent Dependencies

### Upstream (necesita datos de):
- `create-staffing-plan` → Proporciona headcount y roles
- `analyze-equipment-criticality` → Proporciona lista de equipos criticos

### Downstream (alimenta a):
- `model-opex-budget` → Usa el plan como input para costos de capacitacion
- `audit-compliance-readiness` → Verifica que training cumpla regulaciones
```

---

## Ejemplo Completo: Skill Minima

```markdown
# Generar Reporte Semanal de Compromisos

## Skill ID: weekly-commitments-report
## Version: 1.0.0
## Category: A - Document Generation
## Priority: P2 - Important

---

## Purpose

Genera un reporte semanal consolidado de todos los compromisos operativos
derivados de reuniones, clasificados por responsable, prioridad y fecha
limite. Permite al equipo de direccion tener visibilidad sobre la ejecucion
de acuerdos y detectar compromisos vencidos o en riesgo.

---

## Intent & Specification

1. **Consolidacion**: Agrupa compromisos de todas las reuniones de los
   ultimos 7 dias en un solo documento.
2. **Clasificacion por estado**: Pendiente, En Progreso, Completado, Vencido.
3. **Alerta de vencimientos**: Destacar compromisos que vencen en las
   proximas 48 horas o que ya estan vencidos.
4. **Idioma**: Espanol latinoamericano.

---

## Trigger / Invocation

**Command:** `/weekly-commitments-report`

### Natural Language Triggers
- "Genera el reporte semanal de compromisos"
- "Dame el resumen de acuerdos de esta semana"

---

## Input Requirements

### Required Inputs

| Input | Format | Description |
|-------|--------|-------------|
| `reuniones` | JSON/DB | Reuniones de los ultimos 7 dias con compromisos |
| `usuarios` | JSON/DB | Lista de responsables del equipo |

---

## Output Specification

**File:** Email HTML + Dashboard section

| Seccion | Contenido |
|---------|-----------|
| Header | Periodo, total reuniones, total compromisos |
| Por Reunion | Titulo, fecha, compromisos con responsable y prioridad |
| Alertas | Compromisos vencidos o proximos a vencer |

---

## Methodology

### Step 1: Recopilacion
1.1. Consultar reuniones de los ultimos 7 dias
1.2. Extraer compromisos de cada reunion

### Step 2: Clasificacion
2.1. Agrupar por reunion
2.2. Clasificar por prioridad (Alta, Media, Baja)
2.3. Calcular dias restantes para cada compromiso

### Step 3: Generacion
3.1. Renderizar HTML con template del sistema
3.2. Enviar por email a destinatarios configurados

---

## Quality Criteria

- [ ] Todas las reuniones de la semana estan incluidas
- [ ] Cada compromiso tiene: tarea, responsable, fecha, prioridad
- [ ] Compromisos vencidos estan claramente marcados
- [ ] El email se renderiza correctamente en Gmail y Outlook
```

---

## Reglas Generales VSC

1. **Nunca usar nombres de empresas reales** — Usar `{client_name}`, "ClienteX", o industrias genericas ("Planta Desalinizadora", "Concentradora Minera")
2. **Siempre incluir VSC como marca** en deliverables y benchmarks
3. **Idioma por defecto**: Espanol latinoamericano
4. **Formulas explicitas** — No decir "calcular costo", decir `Costo = Salario_Base × Factor_Carga × (1 + Contingencia)`
5. **Rangos de referencia** — Siempre incluir benchmarks: "Segun benchmarks VSC internos, el rango tipico es X-Y"
6. **Archivos siguen el patron**: `VSC_{Tipo}_{Proyecto}_{Version}_{Fecha}.ext`
