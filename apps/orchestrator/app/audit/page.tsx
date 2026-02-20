'use client';
import { useEffect, useState } from 'react';
import { exportExcel, exportPDF, fmt } from '@/lib/export';

interface AuditResult { id: number; regla_id: number; estado: string; score_pct: number; risk_score: number; detalle: string; fecha: string; codigo: string; descripcion: string; dominio: string; fuente_regulacion: string; severidad_1_5: number; probabilidad_deteccion_1_5: number }
interface AuditSummary { total_rules: number; cumple: number; no_cumple: number; parcial: number; no_evaluado: number; score_promedio: number }
interface LogEntry { modulo: string; accion: string; detalle: string; timestamp: string }

export default function AuditPage() {
    const [results, setResults] = useState<AuditResult[]>([]);
    const [summary, setSummary] = useState<AuditSummary | null>(null);
    const [auditLog, setAuditLog] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [checking, setChecking] = useState(false);
    const [toast, setToast] = useState('');

    const loadData = async () => {
        const res = await fetch('/api/audit');
        const data = await res.json();
        setResults(data.results || []);
        setSummary(data.summary);
        setAuditLog(data.auditLog || []);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const runCheck = async () => {
        setChecking(true);
        await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'check' }) });
        await loadData();
        setChecking(false);
        setToast('✅ Compliance check ejecutado');
        setTimeout(() => setToast(''), 3000);
    };

    const score = summary?.score_promedio || 0;
    const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score > 0 ? '#ef4444' : '#64748b';

    const handleExportExcel = () => {
        if (results.length === 0) { setToast('⚠️ Ejecuta check primero'); setTimeout(() => setToast(''), 2000); return; }
        const cumple = results.filter(r => r.estado === 'CUMPLE');
        const noCumple = results.filter(r => r.estado === 'NO_CUMPLE');
        const parcial = results.filter(r => r.estado === 'PARCIAL');
        exportExcel('AuditReport_IS001', [
            {
                name: 'Resumen',
                title: 'Resumen Compliance IS-001',
                headers: ['Métrica', 'Valor'],
                rows: [
                    ['Score General', fmt.pct(score)],
                    ['Total Reglas', results.length],
                    ['Cumple', cumple.length],
                    ['Parcial', parcial.length],
                    ['No Cumple', noCumple.length],
                ],
            },
            ...(noCumple.length > 0 ? [{
                name: 'No Cumple',
                title: 'Hallazgos Críticos (No Cumple)',
                subtitle: 'Requieren acción correctiva inmediata',
                headers: ['Código', 'Regla', 'Dominio', 'Score (%)', 'Risk Score', 'Fuente Regulación', 'Detalle'],
                rows: noCumple.map(r => [r.codigo, r.descripcion, r.dominio, r.score_pct, r.risk_score, r.fuente_regulacion, r.detalle]),
            }] : []),
            ...(parcial.length > 0 ? [{
                name: 'Parcial',
                title: 'Cumplimiento Parcial',
                subtitle: 'Requieren mejoras para cumplimiento total',
                headers: ['Código', 'Regla', 'Dominio', 'Score (%)', 'Risk Score', 'Fuente Regulación', 'Detalle'],
                rows: parcial.map(r => [r.codigo, r.descripcion, r.dominio, r.score_pct, r.risk_score, r.fuente_regulacion, r.detalle]),
            }] : []),
            {
                name: 'Resultados Completos',
                title: 'Resultados de Compliance',
                headers: ['Código', 'Regla', 'Dominio', 'Estado', 'Score (%)', 'Risk Score', 'Fuente Regulación', 'Detalle'],
                rows: results.map(r => [r.codigo, r.descripcion, r.dominio, r.estado, r.score_pct, r.risk_score, r.fuente_regulacion, r.detalle]),
                summaryRow: ['', '', '', `Score: ${fmt.pct(score)}`, '', '', '', ''],
            },
        ]);
        setToast('📥 Excel descargado'); setTimeout(() => setToast(''), 2000);
    };

    const handleExportPDF = () => {
        const cumple = results.filter(r => r.estado === 'CUMPLE').length;
        const noCumple = results.filter(r => r.estado === 'NO_CUMPLE').length;
        const parcial = results.filter(r => r.estado === 'PARCIAL').length;
        exportPDF('AuditReport_IS001_LB3', '🛡️ Reporte de Compliance', 'IS-001 · Planta Concentradora Los Bronces Línea 3 — Auditoría Regulatoria', [
            {
                stats: [
                    { label: 'Score General', value: fmt.pct(score), color: scoreColor },
                    { label: 'Cumple', value: cumple, color: '#10b981' },
                    { label: 'Parcial', value: parcial, color: '#f59e0b' },
                    { label: 'No Cumple', value: noCumple, color: '#ef4444' },
                ]
            },
            {
                title: 'Resultados de Compliance', table: {
                    headers: ['Código', 'Regla', 'Dominio', 'Estado', 'Score', 'Risk', 'Fuente'],
                    rows: results.map(r => [r.codigo, r.descripcion, r.dominio, r.estado, fmt.pct(r.score_pct), r.risk_score, r.fuente_regulacion]),
                    highlightCol: 3
                }
            },
            ...(noCumple > 0 ? [{ title: 'Hallazgos Críticos', text: results.filter(r => r.estado === 'NO_CUMPLE').map(r => `<strong>${r.codigo}</strong>: ${r.detalle}`).join('<br/>') }] : []),
            { alert: { type: (noCumple > 0 ? 'danger' : score >= 80 ? 'info' : 'warning') as 'danger' | 'info' | 'warning', text: noCumple > 0 ? `Se detectaron ${noCumple} incumplimientos regulatorios que requieren acción correctiva inmediata antes del commissioning.` : score >= 80 ? 'El score de compliance es satisfactorio. Mantener monitoreo continuo.' : `Score de compliance por debajo del umbral aceptable (80%). Se requieren ${parcial + noCumple} acciones correctivas.` } },
        ]);
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

    return (
        <>
            {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}

            <div className="page-header">
                <div>
                    <h2>🛡️ Audit — El Juez</h2>
                    <p>Verificación de compliance regulatorio y organizacional</p>
                </div>
                <div className="btn-group">
                    <button className="btn btn-export" onClick={handleExportExcel}>📊 Excel</button>
                    <button className="btn btn-export" onClick={handleExportPDF}>📑 PDF</button>
                    <button className="btn btn-primary" onClick={runCheck} disabled={checking}>
                        {checking ? <><div className="spinner" /> Verificando...</> : '⚡ Compliance Check'}
                    </button>
                </div>
            </div>

            <div className="card-grid card-grid-4 stagger-children" style={{ marginBottom: '1.5rem' }}>
                <div className="card animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                    <div className="gauge-container">
                        <div className="gauge-ring" style={{ background: `conic-gradient(${scoreColor} ${score * 3.6}deg, var(--bg-secondary) 0deg)` }}>
                            <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'var(--bg-card-solid)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="gauge-value" style={{ color: scoreColor }}>{score.toFixed(0)}</div>
                                <div className="gauge-label">% Score</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card stat-card green animate-fade-up">
                    <div className="stat-label">Cumple</div>
                    <div className="stat-value">{summary?.cumple || 0}</div>
                    <div className="stat-sub">reglas aprobadas</div>
                </div>
                <div className="card stat-card amber animate-fade-up">
                    <div className="stat-label">Parcial</div>
                    <div className="stat-value">{summary?.parcial || 0}</div>
                    <div className="stat-sub">requieren acción</div>
                </div>
                <div className="card stat-card red animate-fade-up">
                    <div className="stat-label">No Cumple</div>
                    <div className="stat-value">{summary?.no_cumple || 0}</div>
                    <div className="stat-sub">hallazgos críticos</div>
                </div>
            </div>

            {results.length === 0 ? (
                <div className="card empty-state">
                    <div className="empty-icon">🛡️</div>
                    <h3>Sin resultados de auditoría</h3>
                    <p>Presiona &quot;Compliance Check&quot; para verificar 12 reglas contra los datos actuales.</p>
                </div>
            ) : (
                <div className="table-container" style={{ marginBottom: '1.5rem', animationDelay: '200ms' }}>
                    <table>
                        <thead>
                            <tr><th>Código</th><th>Regla</th><th>Dominio</th><th>Estado</th><th>Score</th><th>Risk</th><th>Fuente</th><th>Detalle</th></tr>
                        </thead>
                        <tbody>
                            {results.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{r.codigo}</td>
                                    <td style={{ maxWidth: '250px' }}>{r.descripcion}</td>
                                    <td><span className="badge blue">{r.dominio}</span></td>
                                    <td><span className={`badge ${r.estado === 'CUMPLE' ? 'green' : r.estado === 'NO_CUMPLE' ? 'red' : r.estado === 'PARCIAL' ? 'amber' : 'gray'}`}>{r.estado}</span></td>
                                    <td style={{ textAlign: 'center', fontWeight: 700, color: r.score_pct >= 80 ? 'var(--accent-green)' : r.score_pct >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>{r.score_pct}%</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: r.risk_score >= 15 ? 'rgba(239,68,68,0.2)' : r.risk_score >= 8 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)', color: r.risk_score >= 15 ? '#f87171' : r.risk_score >= 8 ? '#fbbf24' : '#34d399' }}>
                                            {r.risk_score}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.fuente_regulacion}</td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>{r.detalle}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="card animate-fade-up" style={{ animationDelay: '300ms' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>📋 Audit Log</h3>
                {auditLog.length > 0 ? (
                    <div className="stagger-children">
                        {auditLog.slice(0, 10).map((entry, i) => (
                            <div key={i} className="audit-entry animate-fade-left">
                                <span className="audit-time">{entry.timestamp}</span>
                                <span className="audit-module" style={{ color: entry.modulo === 'AUDIT' ? 'var(--accent-purple)' : entry.modulo === 'STAFFING' ? 'var(--accent-blue)' : entry.modulo === 'TRAINING' ? 'var(--accent-green)' : entry.modulo === 'FINANCE' ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
                                    {entry.modulo}
                                </span>
                                <span style={{ color: 'var(--text-secondary)' }}>{entry.detalle}</span>
                            </div>
                        ))}
                    </div>
                ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Log vacío.</p>}
            </div>
        </>
    );
}
