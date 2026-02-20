'use client';
import { useEffect, useState, useRef } from 'react';

interface TableInfo { name: string; rows: number }
interface LogEntry { modulo: string; accion: string; detalle: string; timestamp: string }
interface DbInfo {
    tables: TableInfo[];
    totalTables: number;
    totalRows: number;
    dbSizeFormatted: string;
    dbPath: string;
    lastModified: string;
    recentLogs: LogEntry[];
}

export default function DatabasePage() {
    const [info, setInfo] = useState<DbInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [sqlInput, setSqlInput] = useState('');
    const [executing, setExecuting] = useState(false);
    const [sqlResult, setSqlResult] = useState('');
    const [uploadStats, setUploadStats] = useState<{ name: string; size: string } | null>(null);
    const largeFileContentRef = useRef<string | null>(null); // Store large files outside state to avoid re-renders
    const fileRef = useRef<HTMLInputElement>(null);

    const load = async () => {
        const res = await fetch('/api/database');
        const data = await res.json();
        setInfo(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const resetTable = async (table: string) => {
        if (!confirm(`⚠️ ¿Vaciar tabla "${table}"? Los datos se perderán.`)) return;
        const res = await fetch('/api/database', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset_table', table }) });
        const result = await res.json();
        await load();
        setToast(`🗑️ Tabla "${table}" vaciada (${result.deleted} filas eliminadas)`);
        setTimeout(() => setToast(''), 3000);
    };

    const resetAll = async () => {
        if (!confirm('⚠️ ¿VACIAR TODA la base de datos? Se eliminarán TODOS los datos (excepto el audit log). Esta acción no se puede deshacer.')) return;
        if (!confirm('🔴 Confirmar: ¿Estás seguro? Se perderán todos los datos generados.')) return;
        await fetch('/api/database', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset_all' }) });
        await load();
        setToast('🗑️ Base de datos vaciada completamente');
        setTimeout(() => setToast(''), 4000);
    };

    const reseed = async () => {
        if (!confirm('🔄 ¿Reinicializar la base de datos con datos de semilla? Primero se borran todos los datos actuales.')) return;
        const res = await fetch('/api/database', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reseed' }) });
        const result = await res.json();
        await load();
        setToast(`🔄 ${result.message}`);
        setTimeout(() => setToast(''), 6000);
    };

    const executeSQL = async () => {
        const contentToRun = largeFileContentRef.current || sqlInput;
        if (!contentToRun?.trim()) return;

        setExecuting(true);
        setSqlResult('');
        try {
            const res = await fetch('/api/database', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'import_sql', sql: contentToRun }) });
            const result = await res.json();
            if (result.error) {
                setSqlResult(`❌ Error: ${result.error}`);
            } else {
                setSqlResult(`✅ ${result.executed} sentencias ejecutadas correctamente`);
                await load();
                // Clear after success if it was a file
                if (largeFileContentRef.current) {
                    setUploadStats(null);
                    largeFileContentRef.current = null;
                }
            }
        } catch (err) {
            setSqlResult(`❌ Error: ${err}`);
        }
        setExecuting(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const sizeKB = (file.size / 1024).toFixed(1);
        setUploadStats({ name: file.name, size: `${sizeKB} KB` });

        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;

            // Optimization: If file > 500KB, don't show in textarea to avoid freeze
            if (content.length > 500000) {
                largeFileContentRef.current = content;
                setSqlInput(`-- El archivo "${file.name}" es demasiado grande para previsualizar (${sizeKB} KB).\n-- Se ejecutará directamente al presionar "Ejecutar SQL".`);
                setToast(`📄 Archivo cargado en memoria (${sizeKB} KB)`);
            } else {
                largeFileContentRef.current = null; // Use textarea
                setSqlInput(content);
                setToast(`📄 Archivo "${file.name}" cargado`);
            }
            setTimeout(() => setToast(''), 3000);
        };
        reader.readAsText(file);
    };

    const tableIcon = (name: string): string => {
        if (name.includes('roles') || name.includes('dotacion') || name.includes('departamento')) return '👥';
        if (name.includes('curso') || name.includes('training') || name.includes('gap') || name.includes('hora') || name.includes('asignacion')) return '🎓';
        if (name.includes('opex') || name.includes('resumen')) return '💰';
        if (name.includes('audit') || name.includes('regla') || name.includes('compliance')) return '🛡️';
        if (name.includes('competencia')) return '📋';
        return '📦';
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

    return (
        <>
            {toast && <div className="toast-container"><div className="toast">{toast}</div></div>}

            <div className="page-header">
                <div>
                    <h2>🗄️ Base de Datos</h2>
                    <p>Gestión, importación y reset de datos del sistema</p>
                </div>
                <div className="btn-group">
                    <button className="btn btn-secondary" onClick={reseed}>🔄 Re-Seed</button>
                    <button className="btn" onClick={resetAll} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontWeight: 600 }}>
                        🗑️ Vaciar Todo
                    </button>
                </div>
            </div>

            {/* Database Stats */}
            <div className="card-grid card-grid-4 stagger-children" style={{ marginBottom: '1.5rem' }}>
                <div className="card stat-card blue animate-fade-up">
                    <div className="stat-label">Tablas</div>
                    <div className="stat-value">{info?.totalTables}</div>
                    <div className="stat-sub">en SQLite local</div>
                </div>
                <div className="card stat-card green animate-fade-up">
                    <div className="stat-label">Total Filas</div>
                    <div className="stat-value">{info?.totalRows.toLocaleString()}</div>
                    <div className="stat-sub">registros activos</div>
                </div>
                <div className="card stat-card amber animate-fade-up">
                    <div className="stat-label">Tamaño DB</div>
                    <div className="stat-value">{info?.dbSizeFormatted}</div>
                    <div className="stat-sub">orchestrator.db</div>
                </div>
                <div className="card stat-card purple animate-fade-up">
                    <div className="stat-label">Última Modificación</div>
                    <div className="stat-value" style={{ fontSize: '1rem' }}>{info?.lastModified ? new Date(info.lastModified).toLocaleTimeString('es-CL') : '—'}</div>
                    <div className="stat-sub">{info?.lastModified ? new Date(info.lastModified).toLocaleDateString('es-CL') : ''}</div>
                </div>
            </div>

            <div className="card-grid card-grid-2" style={{ marginBottom: '1.5rem' }}>
                {/* Tables Overview */}
                <div className="card animate-fade-up">
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📊 Tablas del Sistema</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {info?.tables.map(t => (
                            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.7rem', borderRadius: '8px', background: 'var(--bg-secondary)', transition: 'all 0.2s ease' }}>
                                <span style={{ fontSize: '1rem' }}>{tableIcon(t.name)}</span>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 600, flex: 1, color: 'var(--text-primary)' }}>{t.name}</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: t.rows > 0 ? 'var(--accent-green)' : 'var(--text-muted)', minWidth: 50, textAlign: 'right' }}>
                                    {t.rows} filas
                                </span>
                                <button onClick={() => resetTable(t.name)}
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', borderRadius: '6px', padding: '0.15rem 0.4rem', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 600 }}
                                    title={`Vaciar tabla ${t.name}`}>
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Audit Log */}
                <div className="card animate-fade-up">
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📋 Actividad Reciente (Audit Log)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 400, overflowY: 'auto' }}>
                        {info?.recentLogs.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Sin actividad registrada</div>
                        )}
                        {info?.recentLogs.map((log, i) => (
                            <div key={i} style={{ padding: '0.5rem 0.7rem', borderRadius: '8px', background: 'var(--bg-secondary)', fontSize: '0.78rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                    <span className={`badge ${log.modulo === 'STAFFING' ? 'blue' : log.modulo === 'TRAINING' ? 'green' : log.modulo === 'FINANCE' ? 'amber' : log.modulo === 'AUDIT' ? 'purple' : 'blue'}`}
                                        style={{ fontSize: '0.62rem' }}>
                                        {log.modulo}
                                    </span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.75rem' }}>{log.accion}</span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                        {new Date(log.timestamp).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                                    </span>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', paddingLeft: '0.25rem' }}>{log.detalle}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SQL Import Section */}
            <div className="card animate-fade-up" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>📥 Importar Datos (SQL)</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Sube un archivo <code>.sql</code> o escribe sentencias SQL directamente para importar datos nuevos.
                    Soporta <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>, <code>CREATE TABLE</code>.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <input type="file" ref={fileRef} accept=".sql,.txt,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        📄 Subir Archivo SQL
                    </button>
                    {uploadStats && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                            ✅ {uploadStats.name} ({uploadStats.size})
                        </span>
                    )}
                </div>

                <textarea
                    value={sqlInput}
                    onChange={e => setSqlInput(e.target.value)}
                    placeholder={'-- Escribe sentencias SQL aquí o sube un archivo\n-- Ejemplo:\nINSERT INTO departamentos (nombre) VALUES (\'Nuevo Depto\');\nUPDATE roles SET headcount_por_turno = 5 WHERE id = 1;'}
                    spellCheck="false"
                    autoCorrect="off"
                    autoCapitalize="off"
                    autoComplete="off"
                    style={{
                        width: '100%', minHeight: 160, padding: '0.75rem', borderRadius: '8px',
                        border: '1px solid var(--border)', background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.82rem',
                        resize: 'vertical', lineHeight: 1.5,
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={executeSQL} disabled={executing || !sqlInput.trim()}>
                        {executing ? <><div className="spinner" /> Ejecutando...</> : '⚡ Ejecutar SQL'}
                    </button>
                    {sqlInput.trim() && (
                        <button className="btn btn-secondary" onClick={() => { setSqlInput(''); setUploadStats(null); setSqlResult(''); largeFileContentRef.current = null; }}>
                            ✕ Limpiar
                        </button>
                    )}
                    {sqlResult && (
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: sqlResult.startsWith('✅') ? 'var(--accent-green)' : '#f87171' }}>
                            {sqlResult}
                        </span>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card animate-fade-up">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>⚡ Acciones Rápidas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                    {[
                        { icon: '👥', title: 'Regenerar Staffing', desc: 'Vaciar y regenerar desde el módulo Staffing', tables: ['roles', 'departamentos', 'competencias', 'dotacion'] },
                        { icon: '🎓', title: 'Regenerar Training', desc: 'Vaciar cursos, gaps y asignaciones', tables: ['cursos_capacitacion', 'gap_analysis', 'horas_capacitacion_rol', 'asignaciones_training'] },
                        { icon: '💰', title: 'Regenerar Finance', desc: 'Vaciar cálculos de OPEX', tables: ['opex_by_role', 'opex_by_department', 'resumen_opex'] },
                        { icon: '🛡️', title: 'Regenerar Audit', desc: 'Vaciar resultados de compliance', tables: ['reglas_compliance', 'audit_results'] },
                    ].map(action => (
                        <button key={action.title}
                            className="card"
                            onClick={async () => {
                                if (!confirm(`¿Vaciar las tablas de ${action.title.replace('Regenerar ', '')}?\n\nTablas: ${action.tables.join(', ')}`)) return;
                                for (const t of action.tables) {
                                    await fetch('/api/database', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reset_table', table: t }) });
                                }
                                await load();
                                setToast(`🔄 ${action.title} completado — ve al módulo para regenerar datos`);
                                setTimeout(() => setToast(''), 4000);
                            }}
                            style={{
                                cursor: 'pointer', textAlign: 'left', padding: '1rem',
                                border: '1px solid var(--border)', transition: 'all 0.2s ease',
                            }}
                        >
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>{action.icon}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>{action.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{action.desc}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.35rem' }}>
                                {action.tables.join(', ')}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}
