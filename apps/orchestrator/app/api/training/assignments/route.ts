import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET /api/training/assignments — list all assignments with role & course details
export async function GET() {
    const db = getDb();

    const assignments = db.prepare(`
    SELECT a.id, a.role_id, a.curso_id, a.cantidad_personas, a.estado, 
           a.fecha_asignacion, a.fecha_completado, a.notas,
           r.titulo AS rol_nombre, COALESCE(d.nombre, 'Sin Depto') AS departamento,
           r.categoria, r.headcount_por_turno,
           c.curso_id AS curso_codigo, c.nombre AS curso_nombre, c.fase,
           c.fecha_inicio, c.fecha_fin, c.duracion_dias, c.metodo, c.ubicacion
    FROM asignaciones_training a
    JOIN roles r ON a.role_id = r.id
    LEFT JOIN departamentos d ON r.departamento_id = d.id
    JOIN cursos_capacitacion c ON a.curso_id = c.id
    ORDER BY c.fase ASC, c.fecha_inicio ASC, r.titulo ASC
  `).all();

    const roles = db.prepare(`
    SELECT r.id, r.titulo, r.categoria, COALESCE(d.nombre, 'Sin Depto') AS departamento,
           COALESCE(dot.headcount_total, r.headcount_por_turno) AS headcount_total
    FROM roles r
    LEFT JOIN departamentos d ON r.departamento_id = d.id
    LEFT JOIN dotacion dot ON dot.role_id = r.id
    ORDER BY d.nombre, r.titulo
  `).all();

    const cursos = db.prepare(`
    SELECT id, curso_id, nombre, fase, audiencia, fecha_inicio, fecha_fin,
           duracion_dias, metodo, ubicacion, asistentes_sesion
    FROM cursos_capacitacion
    ORDER BY fase, fecha_inicio
  `).all();

    // Summary stats
    const totalAsignados = db.prepare(`
    SELECT COALESCE(SUM(cantidad_personas), 0) AS total
    FROM asignaciones_training
  `).get() as { total: number };

    const byEstado = db.prepare(`
    SELECT estado, COUNT(*) as count, SUM(cantidad_personas) as personas
    FROM asignaciones_training
    GROUP BY estado
  `).all();

    return NextResponse.json({
        assignments,
        roles,
        cursos,
        summary: {
            total_asignaciones: assignments.length,
            total_personas: totalAsignados.total,
            byEstado,
        }
    });
}

// POST /api/training/assignments — create, update, or delete assignments
export async function POST(req: NextRequest) {
    const db = getDb();
    const body = await req.json();

    if (body.action === 'assign') {
        // Assign workers from a role to a course
        const { role_id, curso_id, cantidad_personas, notas } = body;

        // Check if assignment already exists
        const existing = db.prepare(
            'SELECT id FROM asignaciones_training WHERE role_id = ? AND curso_id = ?'
        ).get(role_id, curso_id) as { id: number } | undefined;

        if (existing) {
            // Update existing
            db.prepare(
                'UPDATE asignaciones_training SET cantidad_personas = ?, notas = ? WHERE id = ?'
            ).run(cantidad_personas, notas || null, existing.id);
        } else {
            // Insert new
            db.prepare(
                'INSERT INTO asignaciones_training (role_id, curso_id, cantidad_personas, notas) VALUES (?, ?, ?, ?)'
            ).run(role_id, curso_id, cantidad_personas, notas || null);
        }

        db.prepare(
            "INSERT INTO audit_log (modulo, accion, detalle) VALUES ('TRAINING', 'ASIGNAR', ?)"
        ).run(`Asignados ${cantidad_personas} trabajadores del rol ${role_id} al curso ${curso_id}`);

        return NextResponse.json({ ok: true, message: 'Asignación guardada' });
    }

    if (body.action === 'update_status') {
        const { id, estado } = body;
        db.prepare('UPDATE asignaciones_training SET estado = ?, fecha_completado = CASE WHEN ? = "COMPLETADO" THEN datetime("now") ELSE NULL END WHERE id = ?')
            .run(estado, estado, id);

        db.prepare(
            "INSERT INTO audit_log (modulo, accion, detalle) VALUES ('TRAINING', 'ACTUALIZAR', ?)"
        ).run(`Asignación ${id} actualizada a estado: ${estado}`);

        return NextResponse.json({ ok: true });
    }

    if (body.action === 'delete') {
        const { id } = body;
        db.prepare('DELETE FROM asignaciones_training WHERE id = ?').run(id);

        db.prepare(
            "INSERT INTO audit_log (modulo, accion, detalle) VALUES ('TRAINING', 'ELIMINAR', ?)"
        ).run(`Asignación ${id} eliminada`);

        return NextResponse.json({ ok: true });
    }

    if (body.action === 'auto_assign') {
        // Auto-assign: for each course, assign all relevant roles based on audiencia
        const cursos = db.prepare('SELECT id, audiencia FROM cursos_capacitacion').all() as Array<{ id: number; audiencia: string }>;
        const roles = db.prepare(`
      SELECT r.id, r.titulo, r.categoria, COALESCE(d.headcount_total, r.headcount_por_turno) AS hc
      FROM roles r LEFT JOIN dotacion d ON d.role_id = r.id
    `).all() as Array<{ id: number; titulo: string; categoria: string; hc: number }>;

        // Clear existing
        db.prepare('DELETE FROM asignaciones_training').run();

        const insert = db.prepare(
            'INSERT INTO asignaciones_training (role_id, curso_id, cantidad_personas) VALUES (?, ?, ?)'
        );

        let count = 0;
        for (const curso of cursos) {
            const aud = curso.audiencia.toLowerCase();
            for (const role of roles) {
                let match = false;
                if (aud.includes('todos')) match = true;
                else if (aud.includes('operador') && (role.categoria === 'Staff' || role.titulo.toLowerCase().includes('operador'))) match = true;
                else if (aud.includes('jt') && role.titulo.toLowerCase().includes('jefe de turno')) match = true;
                else if (aud.includes('molienda') && (role.titulo.toLowerCase().includes('molienda') || role.titulo.toLowerCase().includes('molino'))) match = true;
                else if (aud.includes('flotación') && (role.titulo.toLowerCase().includes('flotación') || role.titulo.toLowerCase().includes('celdas'))) match = true;
                else if (aud.includes('planificador') && role.titulo.toLowerCase().includes('planificador')) match = true;
                else if (aud.includes('senior') && (role.categoria === 'Supervisión' || role.categoria === 'Profesional')) match = true;

                if (match) {
                    insert.run(role.id, curso.id, role.hc);
                    count++;
                }
            }
        }

        db.prepare(
            "INSERT INTO audit_log (modulo, accion, detalle) VALUES ('TRAINING', 'AUTO-ASIGNAR', ?)"
        ).run(`${count} asignaciones automáticas creadas para ${cursos.length} cursos`);

        return NextResponse.json({ ok: true, count });
    }

    if (body.action === 'delete_all') {
        const count = db.prepare('SELECT COUNT(*) as c FROM asignaciones_training').get() as { c: number };
        db.prepare('DELETE FROM asignaciones_training').run();

        db.prepare(
            "INSERT INTO audit_log (modulo, accion, detalle) VALUES ('TRAINING', 'ELIMINAR-TODAS', ?)"
        ).run(`${count.c} asignaciones eliminadas en bulk`);

        return NextResponse.json({ ok: true, deleted: count.c });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
}
