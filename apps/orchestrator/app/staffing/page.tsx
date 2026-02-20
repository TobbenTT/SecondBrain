'use client';
import { useEffect, useState } from 'react';
import { exportExcel, exportPDF, fmt } from '@/lib/export';

interface Role {
    id: number; titulo: string; categoria: string; departamento: string; turno_tipo: string;
    headcount_total: number; salario_base_mensual: number; patron_turno: string;
    horas_semanales_promedio: number; factor_relevo: number; personas_por_turno: number;
    experiencia_minima: string; certificaciones: string;
}
interface Summary { total_roles: number; total_headcount: number; costo_mensual_bruto: number; total_departamentos: number }
interface DeptStat { nombre: string; roles_count: number; headcount: number }

export default function StaffingPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [byDept, setByDept] = useState<DeptStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [toast, setToast] = useState('');
    const [filterDept, setFilterDept] = useState('Todos');

    const loadData = async () => {
        const res = await fetch('/api/staffing');
        const data = await res.json();
        setRoles(data.roles);
        setSummary(data.summary);
        setByDept(data.byDepartment);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const generate = async () => {
        setGenerating(true);
        await fetch('/api/staffing', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate' }) });
        await loadData();
        setGenerating(false);
        setToast('✅ Dotación recalculada');
        setTimeout(() => setToast(''), 3000);
    };

    const handleExportExcel = () => {
        const headers = ['Departamento', 'Título', 'Categoría', 'Turno', 'Por Turno', 'Factor Relevo', 'Headcount Total', 'Salario Base (CLP)', 'Experiencia', 'Certificaciones'];
        exportExcel('Dotacion_IS001_LB3', [
            {
                name: 'Resumen',
                title: 'Resumen Dotación IS-001',
                headers: ['Métrica', 'Valor'],
                rows: [
                    ['Headcount Total', summary?.total_headcount || 0],
                    ['Roles Definidos', summary?.total_roles || 0],
                    ['Departamentos', summary?.total_departamentos || 0],
                    ['Costo Mensual Bruto', fmt.clp(summary?.costo_mensual_bruto || 0)],
                ],
            },
            {
                name: 'Por Departamento',
                title: 'Distribución por Departamento',
                headers: ['Departamento', 'Roles', 'Headcount'],
                rows: byDept.map(d => [d.nombre, d.roles_count, d.headcount]),
                summaryRow: ['TOTAL', summary?.total_roles || 0, summary?.total_headcount || 0],
            },
            {
                name: 'Detalle por Rol',
                title: 'Dotación Detallada por Rol',
                subtitle: 'Planta Concentradora Los Bronces Línea 3',
                headers,
                rows: roles.map(r => [r.departamento, r.titulo, r.categoria, r.patron_turno, r.personas_por_turno, r.factor_relevo?.toFixed(2), r.headcount_total, r.salario_base_mensual, r.experiencia_minima, r.certificaciones || '—']),
                summaryRow: ['TOTAL', '', '', '', '', '', summary?.total_headcount || 0, summary?.costo_mensual_bruto || 0, '', ''],
            },
        ]);
        setToast('📥 Excel descargado');
        setTimeout(() => setToast(''), 2000);
    };

    const handleExportPDF = () => {
        exportPDF('Dotacion_IS001_LB3', '📋 Plan de Dotación Operacional', 'IS-001 · Planta Concentradora Los Bronces Línea 3', [
            {
                stats: [
                    { label: 'Headcount Total', value: summary?.total_headcount || 0, color: '#3b82f6' },
                    { label: 'Roles Definidos', value: summary?.total_roles || 0, color: '#10b981' },
                    { label: 'Departamentos', value: summary?.total_departamentos || 0, color: '#8b5cf6' },
                    { label: 'Costo Mensual Bruto', value: fmt.millions(summary?.costo_mensual_bruto || 0) + ' CLP', color: '#f59e0b' },
                ]
            },
            {
                title: 'Distribución por Departamento', table: {
                    headers: ['Departamento', 'Roles', 'Headcount'],
                    rows: byDept.map(d => [d.nombre, d.roles_count, d.headcount])
                }
            },
            {
                title: 'Dotación Detallada por Rol', table: {
                    headers: ['Departamento', 'Título', 'Categoría', 'Turno', 'Por Turno', 'Relevo', 'HC Total', 'Salario Base'],
                    rows: roles.map(r => [r.departamento, r.titulo, r.categoria, r.patron_turno, r.personas_por_turno, r.factor_relevo?.toFixed(2), r.headcount_total, fmt.clp(r.salario_base_mensual)]),
                    highlightCol: 6
                }
            },
            { alert: { type: 'info', text: 'Factor de relevo estándar: 1.22x para turnos rotativos (4 equipos) · 1.0x para horario administrativo · Basado en Art. 22/38 Código del Trabajo' } },
        ]);
    };

    const filteredRoles = filterDept === 'Todos' ? roles : roles.filter(r => r.departamento === filterDept);

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

    return (
        <>
            {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}

            <div className="page-header">
                <div>
                    <h2>👥 Staffing — El Motor</h2>
                    <p>Dotación operacional, turnos y estructura organizacional</p>
                </div>
                <div className="btn-group">
                    <button className="btn btn-export" onClick={handleExportExcel}>📊 Excel</button>
                    <button className="btn btn-export" onClick={handleExportPDF}>📑 PDF</button>
                    <button className="btn btn-primary" onClick={generate} disabled={generating}>
                        {generating ? <><div className="spinner" /> Calculando...</> : '⚡ Recalcular Dotación'}
                    </button>
                </div>
            </div>

            <div className="card-grid card-grid-4 stagger-children" style={{ marginBottom: '1.5rem' }}>
                <div className="card stat-card blue animate-fade-up">
                    <div className="stat-label">Headcount Total</div>
                    <div className="stat-value">{summary?.total_headcount || 0}</div>
                    <div className="stat-sub">personas en dotación</div>
                </div>
                <div className="card stat-card green animate-fade-up">
                    <div className="stat-label">Roles Definidos</div>
                    <div className="stat-value">{summary?.total_roles || 0}</div>
                    <div className="stat-sub">en {summary?.total_departamentos || 0} departamentos</div>
                </div>
                <div className="card stat-card amber animate-fade-up">
                    <div className="stat-label">Costo Mensual Bruto</div>
                    <div className="stat-value" style={{ fontSize: '1.5rem' }}>{fmt.millions(summary?.costo_mensual_bruto || 0)}</div>
                    <div className="stat-sub">CLP (sin cargas sociales)</div>
                </div>
                <div className="card stat-card purple animate-fade-up">
                    <div className="stat-label">Departamentos</div>
                    <div className="stat-value">{summary?.total_departamentos || 0}</div>
                    <div className="stat-sub">áreas operacionales</div>
                </div>
            </div>

            <div className="card animate-fade-up" style={{ marginBottom: '1.5rem', animationDelay: '200ms' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Distribución por Departamento</h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }} className="stagger-children">
                    {byDept.map(d => (
                        <div key={d.nombre} onClick={() => setFilterDept(d.nombre === filterDept ? 'Todos' : d.nombre)}
                            className={`dept-chip ${filterDept === d.nombre ? 'active' : ''}`}>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem', color: filterDept === d.nombre ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>{d.headcount}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.nombre}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{d.roles_count} roles</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="table-container" style={{ animationDelay: '300ms' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Departamento</th><th>Título</th><th>Categoría</th><th>Turno</th>
                            <th>Por Turno</th><th>Relevo</th><th>Headcount</th><th>Salario Base</th>
                            <th>Experiencia</th><th>Certificaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRoles.map(r => (
                            <tr key={r.id}>
                                <td><span className="badge blue">{r.departamento}</span></td>
                                <td style={{ fontWeight: 600 }}>{r.titulo}</td>
                                <td><span className={`badge ${r.categoria === 'Gestión' ? 'purple' : r.categoria === 'Supervisión' ? 'amber' : r.categoria === 'Profesional' ? 'green' : 'gray'}`}>{r.categoria}</span></td>
                                <td style={{ fontSize: '0.8rem' }}>{r.patron_turno}</td>
                                <td style={{ textAlign: 'center' }}>{r.personas_por_turno}</td>
                                <td style={{ textAlign: 'center' }}>{r.factor_relevo?.toFixed(2)}</td>
                                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent-cyan)' }}>{r.headcount_total}</td>
                                <td style={{ textAlign: 'right' }}>{fmt.millions(r.salario_base_mensual)}</td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.experiencia_minima}</td>
                                <td style={{ fontSize: '0.75rem' }}>{r.certificaciones || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
