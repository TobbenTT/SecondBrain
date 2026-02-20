import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();

        const cursos = db.prepare(`
      SELECT * FROM cursos_capacitacion ORDER BY fase, fecha_inicio
    `).all();

        const competencias = db.prepare(`SELECT * FROM competencias ORDER BY comp_id`).all();

        const gapAnalysis = db.prepare(`
      SELECT pc.*, c.comp_id, c.nombre as competencia_nombre, c.categoria,
        r.titulo as rol_nombre
      FROM plan_capacitacion pc
      JOIN competencias c ON pc.competencia_id = c.id
      JOIN roles r ON pc.role_id = r.id
      ORDER BY pc.brecha DESC, c.comp_id
    `).all();

        const horasResumen = db.prepare(`
      SELECT r.titulo, r.categoria,
        COALESCE(SUM(pc.horas_estimadas), 0) as total_horas,
        COUNT(pc.id) as total_gaps,
        SUM(CASE WHEN pc.brecha >= 3 THEN 1 ELSE 0 END) as gaps_criticos
      FROM roles r
      LEFT JOIN plan_capacitacion pc ON pc.role_id = r.id
      GROUP BY r.id
      HAVING total_gaps > 0
      ORDER BY total_horas DESC
    `).all();

        const fases = [
            { num: 1, nombre: 'Compliance y Seguridad', fechas: '07–16 Mar 2026', color: '#ef4444' },
            { num: 2, nombre: 'Fundamentos de Proceso', fechas: '18–28 Mar 2026', color: '#f97316' },
            { num: 3, nombre: 'Equipos Específicos L3', fechas: '01–15 Abr 2026', color: '#eab308' },
            { num: 4, nombre: 'Sistemas DCS/SAP', fechas: '20 Abr–12 May 2026', color: '#22c55e' },
            { num: 5, nombre: 'SOPs + Ops Anormales', fechas: '18 May–11 Jun 2026', color: '#3b82f6' },
            { num: 6, nombre: 'OJT Supervisado', fechas: '15 Jun–18 Jul 2026', color: '#8b5cf6' },
            { num: 7, nombre: 'Evaluación y Autorización', fechas: '20–24 Jul 2026', color: '#ec4899' },
        ];

        return NextResponse.json({ cursos, competencias, gapAnalysis, horasResumen, fases });
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
            // Auto-generate training gap analysis from roles × competencias
            db.prepare('DELETE FROM plan_capacitacion').run();

            const roles = db.prepare(`SELECT id, titulo, nivel_competencia FROM roles WHERE turno_tipo = 'Turno Rotativo'`).all() as Array<{ id: number, titulo: string, nivel_competencia: string }>;
            const comps = db.prepare('SELECT id, comp_id, categoria FROM competencias').all() as Array<{ id: number, comp_id: string, categoria: string }>;

            const insertPlan = db.prepare(`INSERT INTO plan_capacitacion 
        (role_id, competencia_id, nivel_requerido, nivel_actual, clasificacion_brecha, metodo_entrenamiento, horas_estimadas, prioridad_training) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

            const nivelMap: Record<string, number> = {
                'Experto': 5, 'Avanzado': 4, 'Competente': 3, 'Básico': 2, 'Conocimiento': 1
            };

            for (const role of roles) {
                const nivelBase = nivelMap[role.nivel_competencia] || 3;
                for (const comp of comps) {
                    const requerido = comp.categoria === 'Seguridad' ? Math.min(nivelBase + 1, 5) : nivelBase;
                    // New hires start at level 1
                    const actual = 1;
                    const brecha = requerido - actual;
                    if (brecha <= 0) continue;

                    const clasificacion = brecha >= 3 ? 'Crítica' : brecha === 2 ? 'Significativa' : 'Menor';
                    const horas = brecha >= 3 ? 40 : brecha === 2 ? 24 : 8;
                    const metodo = brecha >= 3 ? 'Aula + Práctica + OJT' : brecha === 2 ? 'Aula + Práctica' : 'E-Learning + Evaluación';
                    const prior = comp.categoria === 'Seguridad' ? 'Pre-ingreso' : 'Pre-commissioning';

                    insertPlan.run(role.id, comp.id, requerido, actual, clasificacion, metodo, horas, prior);
                }
            }

            db.prepare("INSERT INTO audit_log (modulo, accion, detalle) VALUES ('TRAINING', 'GENERATE', 'Plan de capacitación generado automáticamente desde roles × competencias')").run();
            return NextResponse.json({ success: true, message: 'Plan de capacitación generado' });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
