'use client';
import { useEffect, useState } from 'react';
import { exportExcel, exportPDF, fmt } from '@/lib/export';

interface Assignment {
    id: number; role_id: number; curso_id: number; cantidad_personas: number; estado: string;
    fecha_asignacion: string; fecha_completado: string; notas: string;
    rol_nombre: string; departamento: string; categoria: string;
    curso_codigo: string; curso_nombre: string; fase: number;
    fecha_inicio: string; fecha_fin: string; duracion_dias: number; metodo: string; ubicacion: string;
}
interface Role { id: number; titulo: string; categoria: string; departamento: string; headcount_total: number }
interface Curso { id: number; curso_id: string; nombre: string; fase: number; audiencia: string; fecha_inicio: string; fecha_fin: string; duracion_dias: number; metodo: string; ubicacion: string; asistentes_sesion: number }

export default function AsignacionesPage() {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [summary, setSummary] = useState<{ total_asignaciones: number; total_personas: number; byEstado: { estado: string; count: number; personas: number }[] }>({ total_asignaciones: 0, total_personas: 0, byEstado: [] });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formRole, setFormRole] = useState(0);
    const [formCurso, setFormCurso] = useState(0);
    const [formCantidad, setFormCantidad] = useState(1);
    const [formNotas, setFormNotas] = useState('');
    const [filterFase, setFilterFase] = useState<number | null>(null);
    const [autoAssigning, setAutoAssigning] = useState(false);

    const loadData = async () => {
        const res = await fetch('/api/training/assignments');
        const data = await res.json();
        setAssignments(data.assignments || []);
        setRoles(data.roles || []);
        setCursos(data.cursos || []);
        setSummary(data.summary || { total_asignaciones: 0, total_personas: 0, byEstado: [] });
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const assign = async () => {
        if (!formRole || !formCurso) { setToast('⚠️ Selecciona rol y curso'); setTimeout(() => setToast(''), 2000); return; }
        await fetch('/api/training/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'assign', role_id: formRole, curso_id: formCurso, cantidad_personas: formCantidad, notas: formNotas }) });
        setShowForm(false);
        setFormRole(0); setFormCurso(0); setFormCantidad(1); setFormNotas('');
        await loadData();
        setToast('✅ Trabajadores asignados a capacitación');
        setTimeout(() => setToast(''), 3000);
    };

    const updateStatus = async (id: number, estado: string) => {
        await fetch('/api/training/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_status', id, estado }) });
        await loadData();
        setToast(`✅ Estado actualizado a ${estado}`);
        setTimeout(() => setToast(''), 2000);
    };

    const deleteAssignment = async (id: number) => {
        await fetch('/api/training/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) });
        await loadData();
        setToast('🗑️ Asignación eliminada');
        setTimeout(() => setToast(''), 2000);
    };

    const deleteAll = async () => {
        if (!confirm('⚠️ ¿Eliminar TODAS las asignaciones? Esta acción no se puede deshacer.')) return;
        const res = await fetch('/api/training/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete_all' }) });
        const result = await res.json();
        await loadData();
        setToast(`🗑️ ${result.deleted} asignaciones eliminadas`);
        setTimeout(() => setToast(''), 3000);
    };

    const autoAssign = async () => {
        setAutoAssigning(true);
        const res = await fetch('/api/training/assignments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'auto_assign' }) });
        const result = await res.json();
        await loadData();
        setAutoAssigning(false);
        setToast(`✅ ${result.count} asignaciones creadas automáticamente`);
        setTimeout(() => setToast(''), 4000);
    };

    const handleExportExcel = () => {
        if (assignments.length === 0) { setToast('⚠️ No hay asignaciones'); setTimeout(() => setToast(''), 2000); return; }
        const pendientes = assignments.filter(a => a.estado === 'PENDIENTE');
        const enCurso = assignments.filter(a => a.estado === 'EN_CURSO');
        const completados = assignments.filter(a => a.estado === 'COMPLETADO');
        const mapRow = (a: Assignment) => [a.departamento, a.rol_nombre, a.cantidad_personas, a.curso_codigo, a.curso_nombre, `Fase ${a.fase}`, `${a.duracion_dias} días`, a.fecha_inicio, a.fecha_fin, a.metodo, a.ubicacion, a.estado, a.notas || ''];
        const headers = ['Departamento', 'Rol', 'Personas', 'Código Curso', 'Nombre Curso', 'Fase', 'Duración', 'Inicio', 'Fin', 'Método', 'Ubicación', 'Estado', 'Notas'];

        exportExcel('Asignaciones_Training_IS001', [
            { name: 'Resumen', title: 'Resumen de Asignaciones', headers: ['Métrica', 'Valor'], rows: [['Total Asignaciones', summary.total_asignaciones], ['Total Personas', summary.total_personas], ['Pendientes', pendientes.length], ['En Curso', enCurso.length], ['Completados', completados.length]], summaryRow: ['', `${summary.total_personas} trabajadores en programa`] },
            ...(pendientes.length > 0 ? [{ name: 'Pendientes', title: 'Pendientes de Inicio', subtitle: 'Trabajadores que aún no han sido enviados a capacitación', headers, rows: pendientes.map(mapRow), summaryRow: ['SUBTOTAL', '', pendientes.reduce((s, a) => s + a.cantidad_personas, 0), '', '', '', '', '', '', '', '', '', ''] as (string | number)[] }] : []),
            ...(enCurso.length > 0 ? [{ name: 'En Curso', title: 'En Curso', subtitle: 'Trabajadores actualmente en capacitación', headers, rows: enCurso.map(mapRow) }] : []),
            ...(completados.length > 0 ? [{ name: 'Completados', title: 'Completados', subtitle: 'Capacitaciones finalizadas', headers, rows: completados.map(mapRow) }] : []),
        ]);
        setToast('📥 Excel descargado'); setTimeout(() => setToast(''), 2000);
    };

    const handleExportPDF = () => {
        exportPDF('Asignaciones_Training_IS001', '📋 Plan de Asignación de Capacitación', 'IS-001 · Planta Concentradora Los Bronces Línea 3 — Matriz de Asignaciones', [
            {
                stats: [
                    { label: 'Total Asignaciones', value: summary.total_asignaciones, color: '#3b82f6' },
                    { label: 'Personas en Programa', value: summary.total_personas, color: '#10b981' },
                    { label: 'Pendientes', value: assignments.filter(a => a.estado === 'PENDIENTE').length, color: '#f59e0b' },
                    { label: 'Completados', value: assignments.filter(a => a.estado === 'COMPLETADO').length, color: '#8b5cf6' },
                ]
            },
            {
                title: 'Asignaciones por Curso', table: {
                    headers: ['Fase', 'Curso', 'Rol', 'Depto', 'Personas', 'Inicio', 'Fin', 'Estado'],
                    rows: assignments.map(a => [a.fase, a.curso_nombre, a.rol_nombre, a.departamento, a.cantidad_personas, a.fecha_inicio, a.fecha_fin, a.estado]),
                    highlightCol: 4
                }
            },
            { alert: { type: 'warning' as const, text: 'Todos los trabajadores deben completar la capacitación antes del commissioning (01 Agosto 2026). Las asignaciones pendientes deben iniciarse a la brevedad.' } },
        ]);
    };

    const filtered = filterFase != null ? assignments.filter(a => a.fase === filterFase) : assignments;
    const fases = [1, 2, 3, 4, 5, 6, 7];
    const estadoColor = (e: string) => e === 'COMPLETADO' ? 'green' : e === 'EN_CURSO' ? 'blue' : e === 'PENDIENTE' ? 'amber' : 'gray';

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

    return (
        <>
            {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}

            <div className="page-header">
                <div>
                    <h2>📋 Asignaciones de Capacitación</h2>
                    <p>Enviar trabajadores a cursos de entrenamiento</p>
                </div>
                <div className="btn-group">
                    <button className="btn btn-export" onClick={handleExportExcel}>📊 Excel</button>
                    <button className="btn btn-export" onClick={handleExportPDF}>📑 PDF</button>
                    {assignments.length > 0 && (
                        <button className="btn" onClick={deleteAll} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontWeight: 600 }}>🗑️ Borrar Todas</button>
                    )}
                    <button className="btn btn-secondary" onClick={autoAssign} disabled={autoAssigning}>
                        {autoAssigning ? <><div className="spinner" /> Asignando...</> : '🤖 Auto-Asignar'}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Cerrar' : '➕ Asignar Personas'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="card-grid card-grid-4 stagger-children" style={{ marginBottom: '1.5rem' }}>
                <div className="card stat-card blue animate-fade-up">
                    <div className="stat-label">Total Asignaciones</div>
                    <div className="stat-value">{summary.total_asignaciones}</div>
                    <div className="stat-sub">rol-curso combinaciones</div>
                </div>
                <div className="card stat-card green animate-fade-up">
                    <div className="stat-label">Personas en Programa</div>
                    <div className="stat-value">{summary.total_personas}</div>
                    <div className="stat-sub">trabajadores asignados</div>
                </div>
                <div className="card stat-card amber animate-fade-up">
                    <div className="stat-label">Pendientes</div>
                    <div className="stat-value">{summary.byEstado.find(e => e.estado === 'PENDIENTE')?.count || 0}</div>
                    <div className="stat-sub">{summary.byEstado.find(e => e.estado === 'PENDIENTE')?.personas || 0} personas</div>
                </div>
                <div className="card stat-card purple animate-fade-up">
                    <div className="stat-label">Completados</div>
                    <div className="stat-value">{summary.byEstado.find(e => e.estado === 'COMPLETADO')?.count || 0}</div>
                    <div className="stat-sub">{summary.byEstado.find(e => e.estado === 'COMPLETADO')?.personas || 0} personas</div>
                </div>
            </div>

            {/* Assignment Form */}
            {showForm && (
                <div className="card animate-slide-down" style={{ marginBottom: '1.5rem', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>➕ Nueva Asignación</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Rol / Cargo</label>
                            <select value={formRole} onChange={e => { setFormRole(Number(e.target.value)); const r = roles.find(r => r.id === Number(e.target.value)); if (r) setFormCantidad(r.headcount_total); }}
                                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                                <option value={0}>Seleccionar rol...</option>
                                {roles.map(r => <option key={r.id} value={r.id}>{r.departamento} — {r.titulo} ({r.headcount_total} personas)</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Curso</label>
                            <select value={formCurso} onChange={e => setFormCurso(Number(e.target.value))}
                                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                                <option value={0}>Seleccionar curso...</option>
                                {cursos.map(c => <option key={c.id} value={c.id}>F{c.fase}: {c.nombre} ({c.fecha_inicio})</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Personas</label>
                            <input type="number" min={1} value={formCantidad} onChange={e => setFormCantidad(Number(e.target.value))}
                                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.84rem' }} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Notas (opcional)</label>
                            <input type="text" value={formNotas} onChange={e => setFormNotas(e.target.value)} placeholder="Ej: Grupo A, turno día..."
                                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.84rem' }} />
                        </div>
                        <button className="btn btn-primary" onClick={assign} style={{ whiteSpace: 'nowrap' }}>✅ Confirmar Asignación</button>
                    </div>
                </div>
            )}

            {/* Phase filter */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }} className="animate-fade-up">
                <button className={`btn ${filterFase == null ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterFase(null)} style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem' }}>Todas</button>
                {fases.map(f => (
                    <button key={f} className={`btn ${filterFase === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterFase(filterFase === f ? null : f)} style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem' }}>
                        Fase {f}
                    </button>
                ))}
            </div>

            {/* Assignments Table */}
            {filtered.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>Sin asignaciones {filterFase != null ? `en Fase ${filterFase}` : ''}</h3>
                    <p>Usa &quot;➕ Asignar Personas&quot; para enviar trabajadores a un curso, o &quot;🤖 Auto-Asignar&quot; para generar asignaciones automáticas basadas en la audiencia de cada curso.</p>
                </div>
            ) : (
                <div className="table-container" style={{ animationDelay: '200ms' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Fase</th><th>Curso</th><th>Departamento</th><th>Rol</th>
                                <th>Personas</th><th>Inicio</th><th>Fin</th><th>Método</th>
                                <th>Estado</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(a => (
                                <tr key={a.id}>
                                    <td><span className="phase-num" style={{ width: 28, height: 28, fontSize: '0.75rem', display: 'inline-flex', background: ['', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'][a.fase] || '#888' }}>{a.fase}</span></td>
                                    <td><div style={{ fontWeight: 600 }}>{a.curso_nombre}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.curso_codigo}</div></td>
                                    <td><span className="badge blue">{a.departamento}</span></td>
                                    <td style={{ fontWeight: 500 }}>{a.rol_nombre}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-cyan)' }}>{a.cantidad_personas}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{a.fecha_inicio}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{a.fecha_fin}</td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.metodo}</td>
                                    <td>
                                        <select value={a.estado} onChange={e => updateStatus(a.id, e.target.value)}
                                            style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: a.estado === 'COMPLETADO' ? 'rgba(16,185,129,0.12)' : a.estado === 'EN_CURSO' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)', color: a.estado === 'COMPLETADO' ? '#34d399' : a.estado === 'EN_CURSO' ? '#60a5fa' : '#fbbf24', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                                            <option value="PENDIENTE">PENDIENTE</option>
                                            <option value="EN_CURSO">EN CURSO</option>
                                            <option value="COMPLETADO">COMPLETADO</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button onClick={() => deleteAssignment(a.id)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>🗑️</button>
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
