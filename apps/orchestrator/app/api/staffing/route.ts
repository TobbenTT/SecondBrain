import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();
        const roles = db.prepare(`
      SELECT r.*, d.nombre as departamento,
        dt.headcount_total, dt.factor_relevo, dt.personas_por_turno, dt.numero_equipos,
        pt.nombre as patron_turno, pt.horas_semanales_promedio, pt.cumple_regulacion
      FROM roles r
      LEFT JOIN departamentos d ON r.departamento_id = d.id
      LEFT JOIN dotacion dt ON dt.role_id = r.id
      LEFT JOIN patrones_turno pt ON dt.patron_turno_id = pt.id
      ORDER BY r.departamento_id, r.categoria, r.titulo
    `).all();

        const summary = db.prepare(`
      SELECT 
        COUNT(*) as total_roles,
        SUM(dt.headcount_total) as total_headcount,
        SUM(r.salario_base_mensual * dt.headcount_total) as costo_mensual_bruto,
        COUNT(DISTINCT r.departamento_id) as total_departamentos
      FROM roles r
      LEFT JOIN dotacion dt ON dt.role_id = r.id
    `).get();

        const byDepartment = db.prepare(`
      SELECT d.nombre, COUNT(r.id) as roles_count, 
        COALESCE(SUM(dt.headcount_total), 0) as headcount
      FROM departamentos d
      LEFT JOIN roles r ON r.departamento_id = d.id
      LEFT JOIN dotacion dt ON dt.role_id = r.id
      GROUP BY d.id
      ORDER BY headcount DESC
    `).all();

        const shiftPatterns = db.prepare('SELECT * FROM patrones_turno').all();

        return NextResponse.json({ roles, summary, byDepartment, shiftPatterns });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const db = getDb();
        const body = await request.json();
        const { action } = body;

        if (action === 'generate') {
            // Re-calculate dotacion for all roles
            const roles = db.prepare('SELECT id, turno_tipo, headcount_por_turno FROM roles').all() as Array<{ id: number, turno_tipo: string, headcount_por_turno: number }>;
            const updateDot = db.prepare(`UPDATE dotacion SET 
        personas_por_turno = ?, numero_equipos = ?, factor_relevo = ?, headcount_total = ? 
        WHERE role_id = ?`);

            for (const r of roles) {
                const isDia = r.turno_tipo === 'Día';
                const equipos = isDia ? 1 : 4;
                const relevo = isDia ? 1.0 : 1.22;
                const total = isDia ? r.headcount_por_turno : Math.ceil(r.headcount_por_turno * equipos * relevo);
                updateDot.run(r.headcount_por_turno, equipos, relevo, total, r.id);
            }

            db.prepare("INSERT INTO audit_log (modulo, accion, detalle) VALUES ('STAFFING', 'GENERATE', 'Dotación recalculada para todos los roles')").run();
            return NextResponse.json({ success: true, message: 'Dotación recalculada' });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
