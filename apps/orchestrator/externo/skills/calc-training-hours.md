# Skill: Calcular Horas Training por Departamento
## Metadata
- **skill_id**: calc-training-hours
- **version**: 2.0.1
- **author**: The Orchestrator Team
- **source**: github.com/orchestrator-ai/skills
- **category**: Training
- **requires**: [cursos_capacitacion, roles, departamentos]

## Descripción
Calcula el total de horas de capacitación que cada departamento necesita, sumando la duración de todos los cursos asignados a los roles de ese departamento.

## Instrucciones para el Agente
1. Obtén todos los cursos de la tabla `cursos_capacitacion`
2. Por cada departamento, calcula:
   - Total de cursos aplicables (según audiencia)
   - Total de días de capacitación
   - Total de horas estimadas (días × 8 hrs)
   - Costo total de capacitación
3. Ordena por horas de mayor a menor

## Query SQL de Referencia
```sql
SELECT d.nombre as departamento,
       COUNT(DISTINCT c.id) as total_cursos,
       SUM(c.duracion_dias) as total_dias,
       SUM(c.duracion_dias) * 8 as total_horas,
       SUM(c.costo_estimado) as costo_total,
       COUNT(DISTINCT r.id) as roles_impactados
FROM departamentos d
JOIN roles r ON r.departamento_id = d.id
CROSS JOIN cursos_capacitacion c
WHERE c.audiencia LIKE '%todos%' 
   OR c.audiencia LIKE '%operador%'
   OR c.audiencia LIKE '%' || LOWER(r.categoria) || '%'
GROUP BY d.id, d.nombre
ORDER BY total_horas DESC;
```

## Output Esperado
Tabla con: Departamento | Cursos | Días | Horas | Costo | Roles Impactados
