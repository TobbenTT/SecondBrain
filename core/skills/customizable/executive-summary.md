# Skill: Resumen Ejecutivo para Gerencia
## Metadata
- **skill_id**: executive-summary
- **version**: 1.1.0
- **author**: The Orchestrator Team
- **source**: github.com/orchestrator-ai/skills
- **category**: Reporting
- **requires**: [departamentos, roles, dotacion, cursos_capacitacion, reglas_compliance]

## Descripción
Genera un resumen ejecutivo de alto nivel para presentar a la gerencia, consolidando KPIs de todos los módulos en una vista única.

## Instrucciones para el Agente
1. Extrae los siguientes KPIs:
   - **Staffing**: Total trabajadores, departamentos, ratio supervisión
   - **Training**: Total cursos, días de capacitación, inversión
   - **Finance**: OPEX total estimado, costo promedio por trabajador
   - **Compliance**: Cantidad de reglas, estado general
2. Genera un párrafo ejecutivo con los hallazgos principales
3. Lista los Top 3 riesgos identificados

## Query SQL de Referencia
```sql
SELECT 
  'Total Departamentos' as kpi,
  CAST((SELECT COUNT(*) FROM departamentos) AS TEXT) as valor,
  'Staffing' as modulo
UNION ALL
SELECT 
  'Total Roles Definidos',
  CAST((SELECT COUNT(*) FROM roles) AS TEXT),
  'Staffing'
UNION ALL
SELECT 
  'Roles Turno Rotativo',
  CAST((SELECT COUNT(*) FROM roles WHERE turno_tipo = 'Turno Rotativo') AS TEXT),
  'Staffing'
UNION ALL
SELECT 
  'Roles Día',
  CAST((SELECT COUNT(*) FROM roles WHERE turno_tipo = 'Día') AS TEXT),
  'Staffing'
UNION ALL
SELECT 
  'Headcount Total',
  CAST(COALESCE((SELECT SUM(headcount_total) FROM dotacion), 0) AS TEXT),
  'Staffing'
UNION ALL
SELECT 
  'Factor Relevo Promedio',
  CAST(COALESCE((SELECT ROUND(AVG(factor_relevo), 2) FROM dotacion WHERE factor_relevo > 1), 0) AS TEXT),
  'Staffing'
UNION ALL
SELECT 
  'Total Cursos',
  CAST((SELECT COUNT(*) FROM cursos_capacitacion) AS TEXT),
  'Training'
UNION ALL
SELECT 
  'Total Días Capacitación',
  CAST(COALESCE((SELECT SUM(duracion_dias) FROM cursos_capacitacion), 0) AS TEXT),
  'Training'
UNION ALL
SELECT 
  'Fases de Training',
  CAST(COALESCE((SELECT MAX(fase) FROM cursos_capacitacion), 0) AS TEXT),
  'Training'
UNION ALL
SELECT 
  'Inversión Capacitación (CLP)',
  CAST(COALESCE((SELECT SUM(costo_estimado) FROM cursos_capacitacion), 0) AS TEXT),
  'Training'
UNION ALL
SELECT 
  'Reglas Compliance',
  CAST((SELECT COUNT(*) FROM reglas_compliance) AS TEXT),
  'Audit'
UNION ALL
SELECT 
  'Severidad Promedio',
  CAST(COALESCE((SELECT ROUND(AVG(severidad_1_5), 1) FROM reglas_compliance), 0) AS TEXT),
  'Audit'
```

## Output Esperado
Tabla con: KPI | Valor | Módulo — consolidando datos de Staffing, Training y Audit
