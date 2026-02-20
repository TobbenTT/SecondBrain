import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'orchestrator.db');

// GET /api/database — get database info and table stats
export async function GET() {
    const db = getDb();

    const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all() as Array<{ name: string }>;

    const tableStats = tables.map(t => {
        const count = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get() as { c: number };
        return { name: t.name, rows: count.c };
    });

    const dbSize = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size : 0;
    const lastModified = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).mtime.toISOString() : null;

    // Recent audit log
    const recentLogs = db.prepare(`
    SELECT modulo, accion, detalle, timestamp
    FROM audit_log ORDER BY id DESC LIMIT 15
  `).all();

    return NextResponse.json({
        tables: tableStats,
        totalTables: tables.length,
        totalRows: tableStats.reduce((s, t) => s + t.rows, 0),
        dbSizeBytes: dbSize,
        dbSizeFormatted: dbSize > 1024 * 1024
            ? (dbSize / (1024 * 1024)).toFixed(2) + ' MB'
            : (dbSize / 1024).toFixed(1) + ' KB',
        lastModified,
        dbPath: DB_PATH,
        recentLogs,
    });
}

// POST /api/database — database management actions
export async function POST(req: NextRequest) {
    const db = getDb();
    const body = await req.json();

    if (body.action === 'reset_table') {
        const { table } = body;
        // Safety check: only allow known tables
        const allowed = ['roles', 'departamentos', 'competencias', 'dotacion',
            'cursos_capacitacion', 'gap_analysis', 'horas_capacitacion_rol',
            'reglas_compliance', 'audit_results', 'opex_by_role',
            'opex_by_department', 'resumen_opex', 'asignaciones_training', 'audit_log'];
        if (!allowed.includes(table)) {
            return NextResponse.json({ error: 'Tabla no permitida' }, { status: 400 });
        }
        const count = db.prepare(`SELECT COUNT(*) as c FROM "${table}"`).get() as { c: number };
        db.prepare(`DELETE FROM "${table}"`).run();

        db.prepare(
            "INSERT INTO audit_log (modulo, accion, detalle) VALUES ('SISTEMA', 'RESET-TABLA', ?)"
        ).run(`Tabla ${table} vaciada (${count.c} filas eliminadas)`);

        return NextResponse.json({ ok: true, deleted: count.c, table });
    }

    if (body.action === 'reset_all') {
        const tables = db.prepare(`
      SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != 'audit_log'
    `).all() as Array<{ name: string }>;

        db.pragma('foreign_keys = OFF'); // 🛡️ Disable FKs to allow deleting parents
        let totalDeleted = 0;
        try {
            for (const t of tables) {
                // Try to just delete rows to keep schema
                const count = db.prepare(`SELECT COUNT(*) as c FROM "${t.name}"`).get() as { c: number };
                db.prepare(`DELETE FROM "${t.name}"`).run();
                totalDeleted += count.c;
                // Also reset sequence
                db.prepare(`DELETE FROM sqlite_sequence WHERE name='${t.name}'`).run();
            }
            db.pragma('foreign_keys = ON'); // Re-enable
        } catch (err) {
            db.pragma('foreign_keys = ON');
            throw err;
        }

        db.prepare(
            "INSERT INTO audit_log (modulo, accion, detalle) VALUES ('SISTEMA', 'RESET-TOTAL', ?)"
        ).run(`Base de datos reseteada: ${totalDeleted} filas en ${tables.length} tablas`);

        return NextResponse.json({ ok: true, totalDeleted, tablesCleared: tables.length });
    }

    if (body.action === 'reseed') {
        // Re-run the seed process by calling the existing API endpoints
        // This triggers the database to re-populate from the built-in seed data
        try {
            db.pragma('foreign_keys = OFF'); // 🛡️ Disable FKs
            const tables = db.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all() as Array<{ name: string }>;

            for (const t of tables) {
                // DROP table so initSchema runs again on restart
                db.prepare(`DROP TABLE IF EXISTS "${t.name}"`).run();
            }
            db.pragma('foreign_keys = ON');

            db.prepare(
                "INSERT INTO audit_log (modulo, accion, detalle) VALUES ('SISTEMA', 'RESEED', ?)"
            ).run('Tablas eliminadas para re-siembra. Reinicie el servidor.');

            return NextResponse.json({
                ok: true,
                message: 'Base de datos eliminada. ⚠️ REINICIA EL SERVIDOR (Ctrl+C, npm run dev) para recrear y popular las tablas.'
            });
        } catch (err) {
            db.pragma('foreign_keys = ON');
            return NextResponse.json({ error: String(err) }, { status: 500 });
        }
    }

    if (body.action === 'import_sql') {
        // Execute raw SQL statements (for importing data)
        const { sql } = body;
        if (!sql || typeof sql !== 'string') {
            return NextResponse.json({ error: 'No SQL provided' }, { status: 400 });
        }

        try {
            db.pragma('foreign_keys = OFF'); // 🛡️ Disable FKs for bulk import/delete

            const statements = sql.split(';').filter((s: string) => s.trim().length > 0);
            let executed = 0;

            db.transaction(() => {
                for (const stmt of statements) {
                    const trimmed = stmt.trim();
                    if (trimmed.length > 0) {
                        db.prepare(trimmed).run();
                        executed++;
                    }
                }
            })();

            db.pragma('foreign_keys = ON');

            db.prepare(
                "INSERT INTO audit_log (modulo, accion, detalle) VALUES ('SISTEMA', 'IMPORT-SQL', ?)"
            ).run(`${executed} sentencias SQL ejecutadas`);

            return NextResponse.json({ ok: true, executed });
        } catch (err) {
            db.pragma('foreign_keys = ON');
            return NextResponse.json({ error: String(err) }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
}
