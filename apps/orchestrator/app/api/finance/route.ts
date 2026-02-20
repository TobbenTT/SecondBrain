import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();

        const byRole = db.prepare(`
      SELECT p.*, r.titulo as rol, COALESCE(d.nombre, 'Sin Departamento') as departamento
      FROM presupuesto_opex p
      LEFT JOIN roles r ON p.role_id = r.id
      LEFT JOIN departamentos d ON r.departamento_id = d.id
      ORDER BY p.costo_total DESC
    `).all();

        const byDepartment = db.prepare(`
      SELECT COALESCE(d.nombre, 'Sin Asignar') as departamento,
        SUM(p.headcount) as headcount,
        SUM(p.costo_total) as costo_total,
        AVG(p.factor_carga_total) as factor_carga_promedio
      FROM presupuesto_opex p
      LEFT JOIN roles r ON p.role_id = r.id
      LEFT JOIN departamentos d ON r.departamento_id = d.id
      GROUP BY d.id
      ORDER BY costo_total DESC
    `).all();

        const totalStaffing = db.prepare(`
      SELECT SUM(costo_total) as total FROM presupuesto_opex
    `).get() as { total: number } | undefined;

        const totalTraining = db.prepare(`
      SELECT SUM(costo_estimado) as total FROM cursos_capacitacion
    `).get() as { total: number } | undefined;

        const summary = db.prepare(`SELECT * FROM resumen_opex ORDER BY monto_anual DESC`).all();

        return NextResponse.json({
            byRole,
            byDepartment,
            totalStaffing: totalStaffing?.total || 0,
            totalTraining: totalTraining?.total || 0,
            summary,
        });
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
            db.prepare('DELETE FROM presupuesto_opex').run();
            db.prepare('DELETE FROM resumen_opex').run();

            const roles = db.prepare(`
        SELECT r.id, r.salario_base_mensual, dt.headcount_total 
        FROM roles r 
        LEFT JOIN dotacion dt ON dt.role_id = r.id
      `).all() as Array<{ id: number, salario_base_mensual: number, headcount_total: number }>;

            const insertOpex = db.prepare(`INSERT INTO presupuesto_opex 
        (role_id, headcount, salario_base, carga_social_pct, gratificacion_pct, vacaciones_pct, beneficios_pct, factor_carga_total) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

            let totalCostoStaff = 0;
            for (const r of roles) {
                const hc = r.headcount_total || 1;
                const cargaSocial = 0.25;
                const gratificacion = 0.0475;
                const vacaciones = 0.07;
                const beneficios = 0.10;
                const factorCarga = 1 + cargaSocial + gratificacion + vacaciones + beneficios; // ~1.47
                insertOpex.run(r.id, hc, r.salario_base_mensual, cargaSocial, gratificacion, vacaciones, beneficios, factorCarga);
                totalCostoStaff += r.salario_base_mensual * 12 * factorCarga * hc;
            }

            // Training costs
            const totalTrainingCost = (db.prepare('SELECT SUM(costo_estimado) as t FROM cursos_capacitacion').get() as { t: number }).t || 0;

            // Build OPEX summary
            const insertResumen = db.prepare('INSERT INTO resumen_opex (categoria, subcategoria, monto_anual, porcentaje_total) VALUES (?, ?, ?, ?)');
            const grandTotal = totalCostoStaff + totalTrainingCost;

            insertResumen.run('Dotación Personal', 'Salarios + Cargas Sociales', totalCostoStaff, (totalCostoStaff / grandTotal * 100));
            insertResumen.run('Capacitación', 'Programa de Entrenamiento', totalTrainingCost, (totalTrainingCost / grandTotal * 100));
            insertResumen.run('TOTAL OPEX', 'Total Anual', grandTotal, 100);

            db.prepare("INSERT INTO audit_log (modulo, accion, detalle) VALUES ('FINANCE', 'GENERATE', 'Presupuesto OPEX calculado')").run();
            return NextResponse.json({ success: true, message: 'Presupuesto OPEX generado', totalCostoStaff, totalTrainingCost, grandTotal });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
