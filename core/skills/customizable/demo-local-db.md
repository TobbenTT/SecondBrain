# Skill: Demo Acceso Local DB
## Metadata
- **skill_id**: demo-local-read
- **version**: 1.0.0
- **category**: Core
- **description**: Demuestra que se puede leer la base de datos local (SQLite) desde una skill.
- **requires**: [sqlite_version, audit_log]

## Descripción
Esta skill ejecuta una consulta SQL simple para mostrar que el sistema tiene acceso total a la base de datos local `orchestrator.db`.

## Query SQL de Referencia
```sql
SELECT 
    'Conectado' as estado,
    sqlite_version() as version_sqlite,
    (SELECT count(*) FROM roles) as total_roles,
    (SELECT count(*) FROM audit_log) as total_logs
```
