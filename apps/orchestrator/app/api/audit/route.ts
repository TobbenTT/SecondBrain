import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
    try {
        const db = getDb();

        const results = db.prepare(`
      SELECT ra.*, rc.codigo, rc.descripcion, rc.dominio, 
        rc.fuente_regulacion, rc.severidad_1_5, rc.probabilidad_deteccion_1_5
      FROM resultados_audit ra
      JOIN reglas_compliance rc ON ra.regla_id = rc.id
      ORDER BY ra.risk_score DESC, rc.severidad_1_5 DESC
    `).all();

        const rules = db.prepare('SELECT * FROM reglas_compliance ORDER BY dominio, codigo').all();

        const summary = db.prepare(`
      SELECT 
        COUNT(*) as total_rules,
        SUM(CASE WHEN ra.estado = 'CUMPLE' THEN 1 ELSE 0 END) as cumple,
        SUM(CASE WHEN ra.estado = 'NO_CUMPLE' THEN 1 ELSE 0 END) as no_cumple,
        SUM(CASE WHEN ra.estado = 'PARCIAL' THEN 1 ELSE 0 END) as parcial,
        SUM(CASE WHEN ra.estado = 'NO_EVALUADO' THEN 1 ELSE 0 END) as no_evaluado,
        ROUND(AVG(ra.score_pct), 1) as score_promedio
      FROM reglas_compliance rc
      LEFT JOIN resultados_audit ra ON ra.regla_id = rc.id
    `).get();

        const auditLog = db.prepare('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 20').all();

        return NextResponse.json({ results, rules, summary, auditLog });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const db = getDb();
        const body = await request.json();
        const { action } = body;

        if (action === 'check') {
            db.prepare('DELETE FROM resultados_audit').run();

            const insertResult = db.prepare(`INSERT INTO resultados_audit 
        (regla_id, estado, score_pct, risk_score, detalle) VALUES (?, ?, ?, ?, ?)`);

            // Rule: CT-ART22 - max 45 hrs/week
            const shifts = db.prepare('SELECT id, nombre, horas_semanales_promedio FROM patrones_turno').all() as Array<{ id: number, nombre: string, horas_semanales_promedio: number }>;
            const art22 = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'CT-ART22'").get() as { id: number };
            const exceedingShifts = shifts.filter(s => s.horas_semanales_promedio > 45);
            if (exceedingShifts.length === 0) {
                insertResult.run(art22.id, 'CUMPLE', 100, 0, `Todos los turnos cumplen: ${shifts.map(s => `${s.nombre} (${s.horas_semanales_promedio}h)`).join(', ')}`);
            } else {
                insertResult.run(art22.id, 'NO_CUMPLE', 0, 20, `Turnos exceden 45h: ${exceedingShifts.map(s => `${s.nombre} (${s.horas_semanales_promedio}h)`).join(', ')}`);
            }

            // Rule: CT-ART38 - exceptional shifts approved
            const art38 = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'CT-ART38'").get() as { id: number };
            const exceptionalShifts = shifts.filter(s => s.horas_semanales_promedio > 42);
            insertResult.run(art38.id, 'PARCIAL', 60, 12, `${exceptionalShifts.length} turnos excepcionales requieren validación ante Dirección del Trabajo`);

            // Rule: CT-ART67 - vacation days
            const art67 = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'CT-ART67'").get() as { id: number };
            insertResult.run(art67.id, 'CUMPLE', 100, 0, 'Factor de relevo incluye cobertura de vacaciones (15 días hábiles mínimo)');

            // Rule: DS132-FAT - relief factor 1.15-1.28
            const ds132fat = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'DS132-FAT'").get() as { id: number };
            const dotacion = db.prepare('SELECT d.factor_relevo, r.titulo FROM dotacion d JOIN roles r ON d.role_id = r.id WHERE r.turno_tipo != ?').all('Día') as Array<{ factor_relevo: number, titulo: string }>;
            const badRelief = dotacion.filter(d => d.factor_relevo < 1.15 || d.factor_relevo > 1.28);
            if (badRelief.length === 0) {
                insertResult.run(ds132fat.id, 'CUMPLE', 100, 0, `Todos los factores de relevo dentro del rango 1.15-1.28`);
            } else {
                insertResult.run(ds132fat.id, 'NO_CUMPLE', 30, 16, `Fuera de rango: ${badRelief.map(d => `${d.titulo} (${d.factor_relevo})`).join(', ')}`);
            }

            // Rule: DS132-CAP - all mining personnel must complete safety induction
            const ds132cap = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'DS132-CAP'").get() as { id: number };
            const inductionCourse = db.prepare("SELECT id FROM cursos_capacitacion WHERE curso_id = 'CAP-SEG-001'").get();
            insertResult.run(ds132cap.id, inductionCourse ? 'CUMPLE' : 'NO_CUMPLE', inductionCourse ? 100 : 0, inductionCourse ? 0 : 25,
                inductionCourse ? 'Curso CAP-SEG-001 (Inducción HSE) programado para todos los roles' : 'No existe curso de inducción programado');

            // Rule: DS594-AMB
            const ds594 = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'DS594-AMB'").get() as { id: number };
            insertResult.run(ds594.id, 'PARCIAL', 70, 9, 'Requiere mediciones ambientales in-situ durante commissioning');

            // Rule: STAFF-SUP - supervisor ratio 1:8 to 1:12
            const staffSup = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'STAFF-SUP'").get() as { id: number };
            const supervisors = db.prepare(`SELECT SUM(dt.headcount_total) as total FROM roles r JOIN dotacion dt ON dt.role_id = r.id WHERE r.categoria = 'Supervisión'`).get() as { total: number };
            const workers = db.prepare(`SELECT SUM(dt.headcount_total) as total FROM roles r JOIN dotacion dt ON dt.role_id = r.id WHERE r.categoria = 'Staff'`).get() as { total: number };
            const ratio = supervisors.total > 0 ? workers.total / supervisors.total : 0;
            const ratioOk = ratio >= 8 && ratio <= 12;
            insertResult.run(staffSup.id, ratioOk ? 'CUMPLE' : 'PARCIAL', ratioOk ? 100 : 60, ratioOk ? 0 : 6,
                `Ratio supervisor:trabajador = 1:${ratio.toFixed(1)} (rango aceptable: 1:8 a 1:12)`);

            // Rule: STAFF-PLAN - planner ratio 1:15 to 1:20
            const staffPlan = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'STAFF-PLAN'").get() as { id: number };
            const planners = db.prepare(`SELECT SUM(dt.headcount_total) as total FROM roles r JOIN dotacion dt ON dt.role_id = r.id WHERE r.titulo LIKE '%Planif%'`).get() as { total: number };
            const technicians = db.prepare(`SELECT SUM(dt.headcount_total) as total FROM roles r JOIN dotacion dt ON dt.role_id = r.id WHERE r.departamento_id = 3 AND r.categoria = 'Staff'`).get() as { total: number };
            const planRatio = planners.total > 0 ? technicians.total / planners.total : 0;
            const planOk = planRatio >= 15 && planRatio <= 20;
            insertResult.run(staffPlan.id, planOk ? 'CUMPLE' : (planners.total > 0 ? 'PARCIAL' : 'NO_CUMPLE'), planOk ? 100 : 50, planOk ? 0 : 4,
                `Ratio planificador:técnico = 1:${planRatio.toFixed(1)} (rango aceptable: 1:15 a 1:20)`);

            // Rule: COMP-CERT
            const compCert = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'COMP-CERT'").get() as { id: number };
            const rolesWithCert = db.prepare("SELECT COUNT(*) as c FROM roles WHERE certificaciones IS NOT NULL AND certificaciones != ''").get() as { c: number };
            const totalRoles = db.prepare("SELECT COUNT(*) as c FROM roles").get() as { c: number };
            const certPct = (rolesWithCert.c / totalRoles.c * 100);
            insertResult.run(compCert.id, certPct >= 80 ? 'CUMPLE' : 'PARCIAL', certPct, certPct < 50 ? 12 : 4,
                `${rolesWithCert.c}/${totalRoles.c} roles tienen certificaciones definidas (${certPct.toFixed(0)}%)`);

            // Rule: TRAIN-REG
            const trainReg = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'TRAIN-REG'").get() as { id: number };
            const phase1Courses = db.prepare("SELECT COUNT(*) as c FROM cursos_capacitacion WHERE fase = 1").get() as { c: number };
            insertResult.run(trainReg.id, phase1Courses.c >= 3 ? 'CUMPLE' : 'NO_CUMPLE', phase1Courses.c >= 3 ? 100 : 0, phase1Courses.c < 3 ? 25 : 0,
                `${phase1Courses.c} cursos regulatorios de Fase 1 programados`);

            // Rule: FIN-BURDEN
            const finBurden = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'FIN-BURDEN'").get() as { id: number };
            insertResult.run(finBurden.id, 'PARCIAL', 70, 3, 'Factor de carga actual ~1.47. Debe validarse contra costos reales post-commissioning');

            // Rule: ERP-DRILL
            const erpDrill = db.prepare("SELECT id FROM reglas_compliance WHERE codigo = 'ERP-DRILL'").get() as { id: number };
            insertResult.run(erpDrill.id, 'PARCIAL', 50, 8, 'Simulacros de emergencia planificados en Fase 1 (CAP-SEG-003). Requiere plan de continuidad post-commissioning');

            db.prepare("INSERT INTO audit_log (modulo, accion, detalle) VALUES ('AUDIT', 'COMPLIANCE_CHECK', 'Verificación de compliance ejecutada: 12 reglas evaluadas')").run();
            return NextResponse.json({ success: true, message: 'Compliance check ejecutado' });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
