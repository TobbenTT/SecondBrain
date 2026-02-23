# Skill: Verificar Dotación Crítica
## Metadata
- **skill_id**: verify-critical-staffing
- **version**: 1.2.0
- **author**: The Orchestrator Team
- **source**: github.com/orchestrator-ai/skills
- **category**: Staffing
- **requires**: [departamentos, roles, dotacion]

## Descripción
Verifica que todos los roles marcados como críticos (Supervisión, Gestión) tengan dotación asignada y que el factor de relevo sea adecuado.

## Instrucciones para el Agente
1. Consulta la tabla `roles` filtrando por categoría 'Supervisión' y 'Gestión'
2. Cruza con la tabla `dotacion` para verificar que cada rol crítico tenga headcount asignado
3. Verifica que el `factor_relevo` sea >= 1.15 para turnos rotativos
4. Genera un reporte con:
   - Roles críticos SIN dotación (❌ ALERTA)
   - Roles críticos con factor relevo inadecuado (⚠️ WARNING)
   - Roles críticos OK (✅)

## Query SQL de Referencia
```sql
SELECT r.titulo, r.categoria, r.turno_tipo, 
       d.headcount_total, d.factor_relevo,
       CASE 
         WHEN d.id IS NULL THEN 'SIN_DOTACION'
         WHEN r.turno_tipo = 'Turno Rotativo' AND d.factor_relevo < 1.15 THEN 'RELEVO_BAJO'
         ELSE 'OK'
       END as estado
FROM roles r
LEFT JOIN dotacion d ON d.role_id = r.id
WHERE r.categoria IN ('Supervisión', 'Gestión')
ORDER BY estado DESC, r.titulo;
```

## Output Esperado
Tabla con columnas: Rol | Categoría | Turno | Headcount | Factor Relevo | Estado
