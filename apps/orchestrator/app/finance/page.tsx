'use client';
import { useEffect, useState } from 'react';
import { exportExcel, exportPDF, fmt } from '@/lib/export';

interface OpexByRole { id: number; rol: string; departamento: string; headcount: number; salario_base: number; factor_carga_total: number; costo_anual_pp: number; costo_total: number }
interface OpexByDept { departamento: string; headcount: number; costo_total: number; factor_carga_promedio: number }
interface ResumenOpex { id: number; categoria: string; subcategoria: string; monto_anual: number; porcentaje_total: number }

export default function FinancePage() {
    const [byRole, setByRole] = useState<OpexByRole[]>([]);
    const [byDept, setByDept] = useState<OpexByDept[]>([]);
    const [summary, setSummary] = useState<ResumenOpex[]>([]);
    const [totalStaffing, setTotalStaffing] = useState(0);
    const [totalTraining, setTotalTraining] = useState(0);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [toast, setToast] = useState('');

    const loadData = async () => {
        const res = await fetch('/api/finance');
        const data = await res.json();
        setByRole(data.byRole || []);
        setByDept(data.byDepartment || []);
        setSummary(data.summary || []);
        setTotalStaffing(data.totalStaffing || 0);
        setTotalTraining(data.totalTraining || 0);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const generate = async () => {
        setGenerating(true);
        const res = await fetch('/api/finance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'generate' }) });
        const result = await res.json();
        await loadData();
        setGenerating(false);
        setToast(`✅ OPEX calculado: ${fmt.billions(result.grandTotal)} CLP`);
        setTimeout(() => setToast(''), 4000);
    };

    const grandTotal = totalStaffing + totalTraining;

    const handleExportExcel = () => {
        if (byRole.length === 0) { setToast('⚠️ Calcula OPEX primero'); setTimeout(() => setToast(''), 2000); return; }
        const avgFactor = byDept.length > 0 ? (byDept.reduce((s, d) => s + d.factor_carga_promedio, 0) / byDept.length).toFixed(2) : '—';
        exportExcel('OPEX_IS001_LB3', [
            {
                name: 'Resumen',
                title: 'Resumen Presupuesto OPEX',
                headers: ['Métrica', 'Valor'],
                rows: [
                    ['Costo Total Staffing (Anual)', fmt.clp(totalStaffing)],
                    ['Inversión Capacitación', fmt.clp(totalTraining)],
                    ['OPEX Total Anual', fmt.clp(grandTotal)],
                    ['Factor de Carga Promedio', avgFactor + 'x'],
                ],
            },
            ...(summary.length > 0 ? [{
                name: 'Composición OPEX',
                title: 'Composición OPEX',
                headers: ['Categoría', 'Subcategoría', 'Monto Anual (CLP)', '% del Total'],
                rows: summary.map(s => [s.categoria, s.subcategoria, Math.round(s.monto_anual), fmt.pct(s.porcentaje_total)]),
            }] : []),
            {
                name: 'Por Departamento',
                title: 'Costo por Departamento',
                headers: ['Departamento', 'Headcount', 'Costo Total Anual (CLP)', 'Factor Carga Prom.'],
                rows: byDept.map(d => [d.departamento, d.headcount, Math.round(d.costo_total), d.factor_carga_promedio.toFixed(2) + 'x']),
                summaryRow: ['TOTAL', byDept.reduce((s, d) => s + d.headcount, 0), Math.round(byDept.reduce((s, d) => s + d.costo_total, 0)), avgFactor + 'x'],
            },
            {
                name: 'Detalle por Rol',
                title: 'Detalle OPEX por Rol',
                subtitle: 'Costo fully-loaded por persona y total por rol',
                headers: ['Departamento', 'Rol', 'Headcount', 'Salario Base (CLP)', 'Factor Carga', 'Costo Anual/pp (CLP)', 'Costo Total (CLP)'],
                rows: byRole.map(r => [r.departamento, r.rol, r.headcount, Math.round(r.salario_base), r.factor_carga_total.toFixed(2) + 'x', Math.round(r.costo_anual_pp), Math.round(r.costo_total)]),
                summaryRow: ['TOTAL', '', byRole.reduce((s, r) => s + r.headcount, 0), '', '', '', Math.round(totalStaffing)],
            },
        ]);
        setToast('📥 Excel descargado'); setTimeout(() => setToast(''), 2000);
    };

    const handleExportPDF = () => {
        exportPDF('OPEX_IS001_LB3', '💰 Presupuesto OPEX Anual', 'IS-001 · Planta Concentradora Los Bronces Línea 3 — Modelo Financiero', [
            {
                stats: [
                    { label: 'Costo Staffing', value: fmt.billions(totalStaffing) + ' CLP', color: '#3b82f6' },
                    { label: 'Inversión Capacitación', value: fmt.millions(totalTraining) + ' CLP', color: '#10b981' },
                    { label: 'OPEX Total', value: fmt.billions(grandTotal) + ' CLP', color: '#f59e0b' },
                    { label: 'Factor Carga Prom.', value: byDept.length > 0 ? (byDept.reduce((s, d) => s + d.factor_carga_promedio, 0) / byDept.length).toFixed(2) + 'x' : '—', color: '#8b5cf6' },
                ]
            },
            ...(summary.length > 0 ? [{ title: 'Resumen OPEX', table: { headers: ['Categoría', 'Subcategoría', 'Monto Anual (CLP)', '% Total'], rows: summary.map(s => [s.categoria, s.subcategoria, fmt.clp(s.monto_anual), fmt.pct(s.porcentaje_total)]) } }] : []),
            {
                title: 'Costo por Departamento', table: {
                    headers: ['Departamento', 'Headcount', 'Costo Total (CLP)', 'Factor Carga Prom.'],
                    rows: byDept.map(d => [d.departamento, d.headcount, fmt.clp(d.costo_total), d.factor_carga_promedio.toFixed(2) + 'x']),
                    highlightCol: 2
                }
            },
            {
                title: 'Detalle por Rol', table: {
                    headers: ['Depto', 'Rol', 'HC', 'Salario Base', 'Factor', 'Costo/pp', 'Costo Total'],
                    rows: byRole.map(r => [r.departamento, r.rol, r.headcount, fmt.clp(r.salario_base), r.factor_carga_total.toFixed(2) + 'x', fmt.clp(r.costo_anual_pp), fmt.clp(r.costo_total)])
                }
            },
            { alert: { type: 'warning' as const, text: 'Factor de carga incluye: Cargas sociales (25%), Gratificación legal (4.75%), Vacaciones (7%), Beneficios (10%). Base legal: Código del Trabajo, Art. 41 y siguientes.' } },
        ]);
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

    return (
        <>
            {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}

            <div className="page-header">
                <div>
                    <h2>💰 Finance — El Costo</h2>
                    <p>Presupuesto OPEX, carga laboral y costo por departamento</p>
                </div>
                <div className="btn-group">
                    <button className="btn btn-export" onClick={handleExportExcel}>📊 Excel</button>
                    <button className="btn btn-export" onClick={handleExportPDF}>📑 PDF</button>
                    <button className="btn btn-primary" onClick={generate} disabled={generating}>
                        {generating ? <><div className="spinner" /> Calculando...</> : '⚡ Calcular OPEX'}
                    </button>
                </div>
            </div>

            <div className="card-grid card-grid-4 stagger-children" style={{ marginBottom: '1.5rem' }}>
                <div className="card stat-card amber animate-fade-up">
                    <div className="stat-label">Costo Total Staffing</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>{fmt.billions(totalStaffing)}</div>
                    <div className="stat-sub">CLP/año (fully loaded)</div>
                </div>
                <div className="card stat-card green animate-fade-up">
                    <div className="stat-label">Inversión Capacitación</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>{fmt.millions(totalTraining)}</div>
                    <div className="stat-sub">CLP (programa completo)</div>
                </div>
                <div className="card stat-card blue animate-fade-up">
                    <div className="stat-label">OPEX Total Anual</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>{fmt.billions(grandTotal)}</div>
                    <div className="stat-sub">CLP estimado</div>
                </div>
                <div className="card stat-card purple animate-fade-up">
                    <div className="stat-label">Factor de Carga Prom.</div>
                    <div className="stat-value">{byDept.length > 0 ? (byDept.reduce((s, d) => s + d.factor_carga_promedio, 0) / byDept.length).toFixed(2) : '—'}x</div>
                    <div className="stat-sub">sobre salario bruto</div>
                </div>
            </div>

            {byRole.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-icon">💰</div>
                    <h3>Sin datos de presupuesto</h3>
                    <p>Presiona &quot;Calcular OPEX&quot; para generar el modelo financiero desde los datos de staffing.</p>
                </div>
            ) : (
                <>
                    <div className="card-grid card-grid-2 stagger-children" style={{ marginBottom: '1.5rem' }}>
                        <div className="card animate-fade-up">
                            <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Resumen OPEX</h3>
                            {summary.map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderBottom: s.categoria === 'TOTAL OPEX' ? 'none' : '1px solid rgba(45,53,85,0.3)', fontWeight: s.categoria === 'TOTAL OPEX' ? 700 : 400 }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem' }}>{s.categoria}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.subcategoria}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: s.categoria === 'TOTAL OPEX' ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>
                                            {s.monto_anual >= 1e9 ? fmt.billions(s.monto_anual) : fmt.millions(s.monto_anual)} CLP
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmt.pct(s.porcentaje_total)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="card animate-fade-up">
                            <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Costo por Departamento</h3>
                            {byDept.map((d, i) => {
                                const pct = grandTotal > 0 ? (d.costo_total / grandTotal * 100) : 0;
                                return (
                                    <div key={i} style={{ marginBottom: '0.85rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{d.departamento}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--accent-amber)' }}>{fmt.millions(d.costo_total)} ({d.headcount} FTE)</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div className="progress-bar-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent-amber), var(--accent-red))' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="table-container" style={{ animationDelay: '300ms' }}>
                        <table>
                            <thead>
                                <tr><th>Departamento</th><th>Rol</th><th>HC</th><th>Salario Base</th><th>Factor</th><th>Costo/pp</th><th>Costo Total</th></tr>
                            </thead>
                            <tbody>
                                {byRole.map(r => (
                                    <tr key={r.id}>
                                        <td><span className="badge blue">{r.departamento}</span></td>
                                        <td style={{ fontWeight: 600 }}>{r.rol}</td>
                                        <td style={{ textAlign: 'center' }}>{r.headcount}</td>
                                        <td style={{ textAlign: 'right' }}>{fmt.millions(r.salario_base)}</td>
                                        <td style={{ textAlign: 'center', color: r.factor_carga_total > 1.5 ? 'var(--accent-amber)' : 'var(--text-primary)' }}>{r.factor_carga_total.toFixed(2)}x</td>
                                        <td style={{ textAlign: 'right' }}>{fmt.millions(r.costo_anual_pp)}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-cyan)' }}>{fmt.millions(r.costo_total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </>
    );
}
