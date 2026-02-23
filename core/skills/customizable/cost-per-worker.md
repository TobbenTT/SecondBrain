# Skill: Análisis de Costo por Trabajador
## Metadata
- **skill_id**: cost-per-worker
- **version**: 1.0.0
- **author**: The Orchestrator Team
- **source**: github.com/orchestrator-ai/skills
- **category**: Finance
- **requires**: [roles, dotacion, departamentos]

## Descripción
Calcula el costo mensual y anual por trabajador incluyendo cargas sociales chilenas, y genera un ranking de los roles más costosos.

## Instrucciones para el Agente
1. Para cada rol, calcula:
   - Sueldo Base Mensual
   - AFP (10.58%)
   - Salud (7%)
   - Seguro Cesantía (2.4%)
   - Mutual (0.95%)
   - Gratificación (tope 4.75 IMM = $172,635)
   - Total Carga Social
   - Factor de Carga (Total / Sueldo Base)
2. Multiplica por headcount para obtener costo total
3. Genera ranking Top 10 roles más costosos

## Query SQL de Referencia
```sql
SELECT r.titulo, 
       d.nombre as departamento,
       r.salario_base_mensual as sueldo_base,
       ROUND(r.salario_base_mensual * 0.1058) as afp,
       ROUND(r.salario_base_mensual * 0.07) as salud,
       ROUND(r.salario_base_mensual * 0.024) as cesantia,
       ROUND(r.salario_base_mensual * 0.0095) as mutual,
       MIN(ROUND(r.salario_base_mensual * 0.0475 * 12), 172635 * 12 / 12) as gratificacion,
       dot.headcount_total,
       ROUND(r.salario_base_mensual * 1.45 * 12 * dot.headcount_total) as costo_anual_total
FROM roles r
JOIN departamentos d ON r.departamento_id = d.id
LEFT JOIN dotacion dot ON dot.role_id = r.id
ORDER BY costo_anual_total DESC
LIMIT 10;
```

## Output Esperado
Tabla con: Ranking | Rol | Depto | Sueldo Base | Cargas | Factor | HC | Costo Anual
