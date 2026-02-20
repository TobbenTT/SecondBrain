'use client';
import { useEffect, useState } from 'react';
import { exportExcel, exportPDF, fmt } from '@/lib/export';

interface Curso { id: number; curso_id: string; nombre: string; audiencia: string; duracion_dias: number; metodo: string; proveedor: string; fecha_inicio: string; fecha_fin: string; costo_estimado: number; prerequisitos: string; fase: number }
interface GapEntry { id: number; comp_id: string; competencia_nombre: string; categoria: string; rol_nombre: string; nivel_requerido: number; nivel_actual: number; brecha: number; clasificacion_brecha: string; metodo_entrenamiento: string; horas_estimadas: number }
interface HorasResumen { titulo: string; categoria: string; total_horas: number; total_gaps: number; gaps_criticos: number }
interface Fase { num: number; nombre: string; fechas: string; color: string }

export default function TrainingPage() {
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [gaps, setGaps] = useState<GapEntry[]>([]);
    const [horas, setHoras] = useState<HorasResumen[]>([]);
    const [fases, setFases] = useState<Fase[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [toast, setToast] = useState('');
    const [tab, setTab] = useState<'timeline' | 'gaps' | 'cursos'>('timeline');

    const loadData = async () => {
        const res = await fetch('/api/training');
        const data = await res.json();
        setCursos(data.cursos || []);
        setGaps(data.gapAnalysis || []);
        setHoras(data.horasResumen || []);
        setFases(data.fases || []);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const generate = async () => {
        setGenerating(true);
        await fetch('/api/training', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate' }) });
        await loadData();
        setGenerating(false);
        setToast('✅ Plan de capacitación generado');
        setTimeout(() => setToast(''), 3000);
    };

    const totalHoras = horas.reduce((s, h) => s + h.total_horas, 0);
    const totalGapsCriticos = horas.reduce((s, h) => s + h.gaps_criticos, 0);
    const totalCosto = cursos.reduce((s, c) => s + c.costo_estimado, 0);

    const handleExportCursosExcel = () => {
        exportExcel('TrainingPlan_IS001_Cursos', [
            {
                name: 'Resumen',
                title: 'Resumen Plan de Capacitación',
                headers: ['Métrica', 'Valor'],
                rows: [
                    ['Cursos Programados', cursos.length],
                    ['Horas Totales Requeridas', fmt.num(totalHoras)],
                    ['Brechas Críticas', totalGapsCriticos],
                    ['Inversión Estimada', fmt.clp(totalCosto)],
                ],
            },
            {
                name: 'Fases',
                title: 'Fases del Programa',
                headers: ['Fase', 'Nombre', 'Fechas', 'Nº Cursos'],
                rows: fases.map(f => [f.num, f.nombre, f.fechas, cursos.filter(c => c.fase === f.num).length]),
            },
            {
                name: 'Catálogo Cursos',
                title: 'Catálogo de Cursos',
                subtitle: 'Detalle de todos los cursos del programa de formación',
                headers: ['Fase', 'Código', 'Curso', 'Audiencia', 'Días', 'Método', 'Proveedor', 'Inicio', 'Fin', 'Costo (CLP)', 'Prerequisitos'],
                rows: cursos.map(c => [c.fase, c.curso_id, c.nombre, c.audiencia, c.duracion_dias, c.metodo, c.proveedor, c.fecha_inicio, c.fecha_fin, c.costo_estimado, c.prerequisitos || '—']),
                summaryRow: ['', '', '', '', cursos.reduce((s, c) => s + c.duracion_dias, 0) + ' días total', '', '', '', '', totalCosto, ''],
            },
        ]);
        setToast('📥 Excel descargado'); setTimeout(() => setToast(''), 2000);
    };

    const handleExportGapsExcel = () => {
        if (gaps.length === 0) { setToast('⚠️ Genera el plan primero'); setTimeout(() => setToast(''), 2000); return; }
        const criticos = gaps.filter(g => g.clasificacion_brecha === 'Crítica');
        exportExcel('GapAnalysis_IS001', [
            {
                name: 'Resumen',
                title: 'Resumen Gap Analysis',
                headers: ['Métrica', 'Valor'],
                rows: [
                    ['Total Brechas Detectadas', gaps.length],
                    ['Brechas Críticas', criticos.length],
                    ['Horas Totales Requeridas', fmt.num(totalHoras)],
                ],
            },
            {
                name: 'Horas por Rol',
                title: 'Horas de Capacitación por Rol',
                headers: ['Rol', 'Categoría', 'Horas Totales', 'Total Gaps', 'Gaps Críticos'],
                rows: horas.map(h => [h.titulo, h.categoria, h.total_horas, h.total_gaps, h.gaps_criticos]),
                summaryRow: ['TOTAL', '', totalHoras, gaps.length, criticos.length],
            },
            ...(criticos.length > 0 ? [{
                name: 'Brechas Críticas',
                title: 'Brechas Críticas (Acción Inmediata)',
                headers: ['Rol', 'Competencia', 'Categoría', 'Nivel Req.', 'Nivel Act.', 'Brecha', 'Método', 'Horas'],
                rows: criticos.map(g => [g.rol_nombre, g.competencia_nombre, g.categoria, g.nivel_requerido, g.nivel_actual, g.brecha, g.metodo_entrenamiento, g.horas_estimadas]),
            }] : []),
            {
                name: 'Detalle Completo',
                title: 'Gap Analysis Completo',
                headers: ['Rol', 'Competencia', 'Categoría', 'Nivel Requerido', 'Nivel Actual', 'Brecha', 'Clasificación', 'Método', 'Horas Estimadas'],
                rows: gaps.map(g => [g.rol_nombre, g.competencia_nombre, g.categoria, g.nivel_requerido, g.nivel_actual, g.brecha, g.clasificacion_brecha, g.metodo_entrenamiento, g.horas_estimadas]),
            },
        ]);
        setToast('📥 Excel Gap Analysis descargado'); setTimeout(() => setToast(''), 2000);
    };

    const handleExportPDF = () => {
        exportPDF('TrainingPlan_IS001_LB3', '🎓 Plan de Capacitación', 'IS-001 · Planta Concentradora Los Bronces Línea 3 — Programa de Formación', [
            {
                stats: [
                    { label: 'Cursos Programados', value: cursos.length, color: '#10b981' },
                    { label: 'Horas Totales', value: fmt.num(totalHoras), color: '#3b82f6' },
                    { label: 'Brechas Críticas', value: totalGapsCriticos, color: '#ef4444' },
                    { label: 'Inversión', value: fmt.clp(totalCosto), color: '#f59e0b' },
                ]
            },
            {
                title: 'Fases del Programa (7 Fases)', table: {
                    headers: ['Fase', 'Nombre', 'Fechas', 'Cursos'],
                    rows: fases.map(f => [f.num, f.nombre, f.fechas, cursos.filter(c => c.fase === f.num).length])
                }
            },
            {
                title: 'Catálogo de Cursos', table: {
                    headers: ['Fase', 'Código', 'Curso', 'Audiencia', 'Días', 'Método', 'Proveedor', 'Costo'],
                    rows: cursos.map(c => [c.fase, c.curso_id, c.nombre, c.audiencia, c.duracion_dias, c.metodo, c.proveedor, c.costo_estimado > 0 ? fmt.clp(c.costo_estimado) : 'Interno']),
                }
            },
            ...(gaps.length > 0 ? [{
                title: 'Resumen de Horas por Rol', table: {
                    headers: ['Rol', 'Categoría', 'Horas Totales', 'Gaps', 'Críticos'],
                    rows: horas.map(h => [h.titulo, h.categoria, h.total_horas, h.total_gaps, h.gaps_criticos]),
                    highlightCol: 2
                }
            }] : []),
            { alert: { type: 'danger' as const, text: 'COMMISSIONING: 01 Agosto 2026 — Todos los operadores deben tener autorización/competencia demostrada antes de esta fecha. El incumplimiento pone en riesgo el startup de la línea.' } },
        ]);
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

    return (
        <>
            {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}

            <div className="page-header">
                <div>
                    <h2>🎓 Training — El Flujo</h2>
                    <p>Plan de capacitación, análisis de brechas y calendario de formación</p>
                </div>
                <div className="btn-group">
                    <button className="btn btn-export" onClick={handleExportCursosExcel}>📊 Cursos Excel</button>
                    {gaps.length > 0 && <button className="btn btn-export" onClick={handleExportGapsExcel}>📊 Gaps Excel</button>}
                    <button className="btn btn-export" onClick={handleExportPDF}>📑 PDF</button>
                    <button className="btn btn-primary" onClick={generate} disabled={generating}>
                        {generating ? <><div className="spinner" /> Generando...</> : '⚡ Generar Plan'}
                    </button>
                </div>
            </div>

            <div className="card-grid card-grid-4 stagger-children" style={{ marginBottom: '1.5rem' }}>
                <div className="card stat-card green animate-fade-up">
                    <div className="stat-label">Cursos Programados</div>
                    <div className="stat-value">{cursos.length}</div>
                    <div className="stat-sub">en 7 fases</div>
                </div>
                <div className="card stat-card blue animate-fade-up">
                    <div className="stat-label">Horas de Capacitación</div>
                    <div className="stat-value">{fmt.num(totalHoras)}</div>
                    <div className="stat-sub">hrs totales requeridas</div>
                </div>
                <div className="card stat-card amber animate-fade-up">
                    <div className="stat-label">Brechas Críticas</div>
                    <div className="stat-value">{totalGapsCriticos}</div>
                    <div className="stat-sub">requieren atención inmediata</div>
                </div>
                <div className="card stat-card purple animate-fade-up">
                    <div className="stat-label">Inversión en Capacitación</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>{fmt.millions(totalCosto)}</div>
                    <div className="stat-sub">CLP estimado</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }} className="animate-fade-up" >
                {[
                    { key: 'timeline' as const, label: '📅 Fases del Programa' },
                    { key: 'gaps' as const, label: '🔍 Análisis de Brechas' },
                    { key: 'cursos' as const, label: '📚 Cursos' }
                ].map(t => (
                    <button key={t.key} className={`btn ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t.key)}>{t.label}</button>
                ))}
            </div>

            {tab === 'timeline' && (
                <div className="card-grid card-grid-2 stagger-children">
                    <div className="card animate-fade-up">
                        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Fases del Programa</h3>
                        <div className="phase-timeline stagger-children">
                            {fases.map(f => {
                                const faseCursos = cursos.filter(c => c.fase === f.num);
                                return (
                                    <div key={f.num} className="phase-item">
                                        <div className="phase-num" style={{ background: f.color }}>{f.num}</div>
                                        <div className="phase-info">
                                            <div className="phase-name">{f.nombre}</div>
                                            <div className="phase-dates">{f.fechas}</div>
                                        </div>
                                        <div className="phase-courses">{faseCursos.length} cursos</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                            🚨 COMMISSIONING: 01 Ago 2026 — Todos los operadores deben tener autorización
                        </div>
                    </div>

                    <div className="card animate-fade-up">
                        <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Horas de Capacitación por Rol</h3>
                        {horas.length > 0 ? horas.map((h, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid rgba(45,53,85,0.3)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{h.titulo}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.total_gaps} brechas · {h.gaps_criticos} críticas</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>{h.total_horas}h</div>
                                </div>
                                <div className="progress-bar-bg" style={{ width: 120 }}>
                                    <div className="progress-bar-fill" style={{ width: `${Math.min(h.total_horas / 800 * 100, 100)}%`, background: h.gaps_criticos > 5 ? 'var(--accent-red)' : h.gaps_criticos > 2 ? 'var(--accent-amber)' : 'var(--accent-green)' }} />
                                </div>
                            </div>
                        )) : <div className="empty-state"><div className="empty-icon">📊</div><p>Genera el plan para ver horas por rol</p></div>}
                    </div>
                </div>
            )}

            {tab === 'gaps' && (
                <div className="table-container" style={{ maxHeight: '600px', overflow: 'auto' }}>
                    {gaps.length > 0 ? (
                        <table>
                            <thead>
                                <tr><th>Rol</th><th>Competencia</th><th>Categoría</th><th>Req.</th><th>Act.</th><th>Brecha</th><th>Clasificación</th><th>Método</th><th>Horas</th></tr>
                            </thead>
                            <tbody>
                                {gaps.slice(0, 50).map(g => (
                                    <tr key={g.id}>
                                        <td style={{ fontWeight: 600 }}>{g.rol_nombre}</td>
                                        <td>{g.competencia_nombre}</td>
                                        <td><span className="badge blue">{g.categoria}</span></td>
                                        <td style={{ textAlign: 'center' }}>{g.nivel_requerido}</td>
                                        <td style={{ textAlign: 'center' }}>{g.nivel_actual}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 700, color: g.brecha >= 3 ? 'var(--accent-red)' : g.brecha === 2 ? 'var(--accent-amber)' : 'var(--accent-green)' }}>{g.brecha}</td>
                                        <td><span className={`badge ${g.clasificacion_brecha === 'Crítica' ? 'red' : g.clasificacion_brecha === 'Significativa' ? 'amber' : 'green'}`}>{g.clasificacion_brecha}</span></td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g.metodo_entrenamiento}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 600 }}>{g.horas_estimadas}h</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <div className="card empty-state"><div className="empty-icon">🔍</div><h3>Sin análisis de brechas</h3><p>Presiona &quot;Generar Plan&quot; para crear el gap analysis automáticamente.</p></div>}
                </div>
            )}

            {tab === 'cursos' && (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Fase</th><th>Código</th><th>Curso</th><th>Audiencia</th><th>Días</th><th>Método</th><th>Proveedor</th><th>Inicio</th><th>Fin</th><th>Costo</th></tr>
                        </thead>
                        <tbody>
                            {cursos.map(c => (
                                <tr key={c.id}>
                                    <td><span className="phase-num" style={{ width: 28, height: 28, fontSize: '0.75rem', display: 'inline-flex', background: fases.find(f => f.num === c.fase)?.color || '#888' }}>{c.fase}</span></td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{c.curso_id}</td>
                                    <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.audiencia}</td>
                                    <td style={{ textAlign: 'center' }}>{c.duracion_dias}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{c.metodo}</td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.proveedor}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{c.fecha_inicio}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{c.fecha_fin}</td>
                                    <td style={{ textAlign: 'right', fontWeight: c.costo_estimado > 0 ? 600 : 400, color: c.costo_estimado > 0 ? 'var(--accent-amber)' : 'var(--text-muted)' }}>
                                        {c.costo_estimado > 0 ? fmt.millions(c.costo_estimado) : 'Interno'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
