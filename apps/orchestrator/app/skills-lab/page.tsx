'use client';
import { useState, useEffect, useCallback } from 'react';

interface SkillMeta {
    filename: string;
    filepath: string;
    subfolder: string;
    title: string;
    description: string;
    skill_id: string;
    version: string;
    author: string;
    source: string;
    category: string;
    requires: string;
    sql: string;
    raw: string;
    size: number;
}

interface FetchLog {
    timestamp: string;
    source: string;
    from: string;
    status: number;
    latency_ms: number;
    size_bytes: number;
}

interface ExecutionLog {
    timestamp: string;
    skill: string;
    rows_returned: number;
    query_ms: number;
}

const categoryColors: Record<string, string> = {
    'Staffing': '#3b82f6',
    'Training': '#10b981',
    'Finance': '#f59e0b',
    'Reporting': '#8b5cf6',
    'General': '#6b7280',
    'Core': '#3b82f6',
    'Integration': '#8b5cf6',
    'Customizable': '#f59e0b',
};

const categoryIcons: Record<string, string> = {
    'Staffing': '👥',
    'Training': '🎓',
    'Finance': '💰',
    'Reporting': '📊',
    'General': '📄',
    'Core': '⚙️',
    'Integration': '🔗',
    'Customizable': '🎨',
};

export default function SkillsPlayground() {
    const [skills, setSkills] = useState<SkillMeta[]>([]);
    const [selected, setSelected] = useState<SkillMeta | null>(null);
    const [fetchLog, setFetchLog] = useState<FetchLog | null>(null);
    const [executionLog, setExecutionLog] = useState<ExecutionLog | null>(null);
    const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
    const [phase, setPhase] = useState<'idle' | 'fetching' | 'fetched' | 'executing' | 'done'>('idle');
    const [skillSource, setSkillSource] = useState<'github' | 'local'>('github');
    const [githubConnected, setGithubConnected] = useState(false);
    const [repoName, setRepoName] = useState('');
    const [loadingSkills, setLoadingSkills] = useState(false);
    const [apiLatency, setApiLatency] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

    const [terminalLines, setTerminalLines] = useState<string[]>([
        '$ orchestrator-cli --version',
        'The Orchestrator v1.0.0',
        '$ skill-runner init',
        '✓ Skill Runner inicializado',
        '✓ Detectando fuentes de skills...',
        '',
    ]);

    const addTerminal = useCallback((line: string) => {
        setTerminalLines(prev => [...prev, line]);
    }, []);

    const loadSkills = useCallback(async (src: 'github' | 'local') => {
        setLoadingSkills(true);
        setSelected(null);
        setResults(null);
        setFetchLog(null);
        setExecutionLog(null);
        setPhase('idle');

        try {
            const res = await fetch(`/api/skills?source=${src}`);
            const data = await res.json();
            setSkills(data.skills || []);
            setGithubConnected(data.github_connected || false);
            setRepoName(data.repo || '');
            setApiLatency(data.latency_ms || 0);

            if (src === 'github' && data.github_connected) {
                addTerminal(`$ skill-runner connect --repo ${data.repo}`);
                addTerminal(`  → Conectando a GitHub (privado)...`);
                addTerminal(`  → ${data.skills?.length || 0} skills encontradas (${data.latency_ms || 0}ms)`);
                addTerminal(`  ✓ GitHub conectado exitosamente`);
            } else {
                addTerminal(`$ skill-runner source --local ./externo/skills/`);
                addTerminal(`  → ${data.skills?.length || 0} skills locales encontradas`);
                addTerminal(`  ✓ Fuente local configurada`);
            }
            addTerminal('');
        } catch {
            addTerminal('  ✗ Error conectando a fuente de skills');
            addTerminal('');
        }
        setLoadingSkills(false);
    }, [addTerminal]);

    useEffect(() => {
        loadSkills(skillSource);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSourceChange = async (src: 'github' | 'local') => {
        setSkillSource(src);
        await loadSkills(src);
    };

    const handleFetch = async (skill: SkillMeta) => {
        setSelected(null);
        setResults(null);
        setExecutionLog(null);
        setFetchLog(null);
        setPhase('fetching');

        const isGH = skillSource === 'github' && githubConnected;
        if (isGH) {
            addTerminal(`$ curl -H "Authorization: Bearer ghp_***" \\`);
            addTerminal(`    https://api.github.com/repos/${repoName}/contents/${skill.filepath}`);
        } else {
            addTerminal(`$ cat ./externo/skills/${skill.filename}`);
        }
        addTerminal(`  → ${isGH ? 'Descargando de GitHub privado' : 'Leyendo archivo local'}...`);

        const res = await fetch('/api/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'fetch_skill',
                filename: skill.filename,
                filepath: skill.filepath,
                source: skillSource,
            }),
        });
        const data = await res.json();

        if (data.error) {
            addTerminal(`  ✗ Error: ${data.error}`);
            setPhase('idle');
            return;
        }

        setSelected(data.skill);
        setFetchLog(data.fetch_log);
        setPhase('fetched');

        addTerminal(`  → HTTP ${data.fetch_log.status} OK (${data.fetch_log.latency_ms}ms)`);
        addTerminal(`  → Descargado: ${data.fetch_log.size_bytes} bytes`);
        addTerminal(`  → Fuente: ${data.fetch_log.from}`);
        addTerminal(`  ✓ Skill "${data.skill.title}" cargada`);
        if (data.skill.requires) addTerminal(`  → Tablas: ${data.skill.requires}`);
        addTerminal('');
    };

    const handleExecute = async (mode: 'sql' | 'simulate' = 'sql') => {
        if (mode === 'sql' && !selected?.sql) return;
        setPhase('executing');

        if (mode === 'simulate') {
            addTerminal(`$ skill-runner simulate --skill ${selected?.skill_id}`);
            addTerminal(`  → Iniciando agente de simulación...`);
            addTerminal(`  → Leyendo instrucciones de skill...`);

            // Simulate processing time
            await new Promise(r => setTimeout(r, 1500));
            addTerminal(`  → Analizando contexto...`);
            await new Promise(r => setTimeout(r, 1500));
            addTerminal(`  → Generando respuesta...`);
            await new Promise(r => setTimeout(r, 1000));

            setPhase('done');

            // 🧠 Smart Simulation: Parse content to generate realistic message
            let mockMessage = 'Ejecución simulada exitosa';
            let mockAction = 'Análisis general';
            const mockCategory = selected?.category || 'General';

            if (selected) {
                // Remove code blocks for cleaner text analysis
                const text = selected.raw.replace(/```[\s\S]*?```/g, '');

                // Try to find Goal/Objective
                const goalMatch = text.match(/(?:##|###|\*\*)\s*(?:Goal|Objetivo|Propósito|Descripción|Description|Misión)[:\s]*\n+([^#\n]+)/i);
                if (goalMatch && goalMatch[1].length > 5) {
                    mockAction = goalMatch[1].trim().substring(0, 40) + '...';
                } else if (selected.description) {
                    mockAction = selected.description.substring(0, 40) + '...';
                }

                // Try to find Output/Result
                const outputMatch = text.match(/(?:##|###|\*\*)\s*(?:Output|Salida|Resultado|Entregable|Formato)[:\s]*\n+([^#\n]+)/i);
                if (outputMatch && outputMatch[1].length > 5) {
                    mockMessage = `Generado: ${outputMatch[1].trim().substring(0, 60)}...`;
                }
            }

            // Generate MULTI-ROW fake data table based on category
            let fakeRows: any[] = [];
            const rowCount = Math.floor(Math.random() * 5) + 5; // 5-10 rows

            if (mockCategory === 'Staffing' || selected?.title.includes('Staff')) {
                const depts = ['Mina', 'Planta', 'Mantención', 'Admin', 'Seguridad', 'Logística'];
                for (let i = 0; i < rowCount; i++) {
                    fakeRows.push({
                        departamento: depts[i % depts.length],
                        rol_critico: `Operador ${String.fromCharCode(65 + i)}`,
                        dotacion_actual: Math.floor(Math.random() * 50 + 20),
                        brecha: Math.floor(Math.random() * 5 - 2),
                        estado: Math.random() > 0.3 ? 'OK' : 'Crítico'
                    });
                }
            } else if (mockCategory === 'Training' || selected?.title.includes('Capacitación')) {
                const courses = ['Seguridad Vial', 'Manejo de Explosivos', 'Liderazgo', 'Protocolo COVID', 'SAP Básico'];
                for (let i = 0; i < rowCount; i++) {
                    fakeRows.push({
                        curso: courses[i % courses.length],
                        inscritos: Math.floor(Math.random() * 30 + 5),
                        avance_promedio: `${Math.floor(Math.random() * 40 + 60)}%`,
                        costo_estimado: `$${Math.floor(Math.random() * 500 + 100)}k`,
                        status: Math.random() > 0.2 ? 'En curso' : 'Pendiente'
                    });
                }
            } else if (mockCategory === 'Finance' || selected?.title.includes('Costo')) {
                const items = ['Salarios', 'Bonos', 'EPP', 'Capacitación', 'Transporte'];
                for (let i = 0; i < rowCount; i++) {
                    fakeRows.push({
                        item_gasto: items[i % items.length],
                        presupuesto_clp: `$${Math.floor(Math.random() * 50 + 10)}M`,
                        ejecutado_clp: `$${Math.floor(Math.random() * 50 + 10)}M`,
                        variacion: `${(Math.random() * 10 - 5).toFixed(1)}%`,
                        alerta: Math.random() > 0.8 ? 'Sí' : 'No'
                    });
                }
            } else {
                // Generic fallback
                for (let i = 0; i < rowCount; i++) {
                    fakeRows.push({
                        mensaje: i === 0 ? mockMessage : 'Detalle adicional del análisis...',
                        agente: 'Orchestrator AI',
                        accion: mockAction,
                        confianza: `${Math.floor(Math.random() * 10 + 89)}%`,
                        fuente_conocimiento: selected?.requires || 'Base de Conocimiento'
                    });
                }
            }

            setResults(fakeRows);

            setExecutionLog({
                timestamp: new Date().toISOString(),
                skill: selected?.title || 'Unknown',
                rows_returned: rowCount,
                query_ms: Math.floor(Math.random() * 2000 + 1000)
            });

            addTerminal(`  ✓ Simulación completada`);
            addTerminal(`  → Objetivo detectado: ${mockAction}`);
            addTerminal(`  → Generados ${rowCount} registros simulados`);
            addTerminal('');
            return;
        }

        addTerminal(`$ skill-runner execute --skill ${selected?.skill_id}`);
        addTerminal(`  → Parseando SQL query...`);
        addTerminal(`  → Validando: solo SELECT permitido ✓`);
        addTerminal(`  → Ejecutando contra orchestrator.db...`);

        const res = await fetch('/api/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'execute_skill',
                sql: selected?.sql,
                skill_name: selected?.title,
            }),
        });
        const data = await res.json();

        if (data.error) {
            addTerminal(`  ✗ Error: ${data.error}`);
            setPhase('fetched');
            return;
        }

        setResults(data.results);
        setExecutionLog(data.execution_log);
        setPhase('done');

        addTerminal(`  → ${data.execution_log.rows_returned} registros (${data.execution_log.query_ms}ms)`);
        addTerminal(`  ✓ Skill ejecutada exitosamente`);
        addTerminal('');
    };

    const toggleFolder = (folder: string) => {
        setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
    };

    // Filter and Group skills
    const filteredSkills = skills.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = filteredSkills.reduce((acc, s) => {
        const key = s.subfolder || 'root';
        if (!acc[key]) acc[key] = [];
        acc[key].push(s);
        return acc;
    }, {} as Record<string, SkillMeta[]>);

    // Initialize expanded state when skills load
    useEffect(() => {
        if (skills.length > 0) {
            const allFolders = Array.from(new Set(skills.map(s => s.subfolder || 'root')));
            setExpandedFolders(prev => {
                const next = { ...prev };
                allFolders.forEach(f => {
                    if (next[f] === undefined) next[f] = true; // Default expanded
                });
                return next;
            });
        }
    }, [skills]);

    return (
        <div style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '2rem' }}>🧪</span>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #a78bfa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Skills Lab — Pruebas
                    </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Carga y ejecución de Skills desde repositorio GitHub privado o carpeta local.
                </p>
            </div>

            {/* Source Toggle + Connection Status */}
            <div className="card animate-fade-up" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>FUENTE:</span>
                        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <button
                                onClick={() => handleSourceChange('github')}
                                style={{
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: skillSource === 'github' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'var(--bg-secondary)',
                                    color: skillSource === 'github' ? '#fff' : 'var(--text-muted)',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
                                GitHub
                            </button>
                            <button
                                onClick={() => handleSourceChange('local')}
                                style={{
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: skillSource === 'local' ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--bg-secondary)',
                                    color: skillSource === 'local' ? '#fff' : 'var(--text-muted)',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                📁 Local
                            </button>
                        </div>
                    </div>

                    {/* Connection status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {skillSource === 'github' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: githubConnected ? '#10b981' : '#ef4444',
                                    display: 'inline-block',
                                    animation: githubConnected ? 'pulse-soft 2s infinite' : 'none',
                                }}></span>
                                <span style={{ fontSize: '0.7rem', color: githubConnected ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                    {githubConnected ? `Conectado a ${repoName}` : 'Sin conexión GitHub'}
                                </span>
                                {apiLatency > 0 && (
                                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 4 }}>
                                        {apiLatency}ms
                                    </span>
                                )}
                            </div>
                        )}
                        {skillSource === 'local' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>externo/skills/</span>
                            </div>
                        )}
                        <span className="badge" style={{ fontSize: '0.6rem', background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}>
                            {skills.length} skills
                        </span>
                    </div>
                </div>
            </div>

            {/* Flow diagram */}
            <div className="card animate-fade-up" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
                <h3 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>📡 FLUJO DE EJECUCIÓN</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {[
                        { icon: skillSource === 'github' ? '🔒' : '📁', label: skillSource === 'github' ? 'GitHub Privado' : 'Local', sub: skillSource === 'github' ? repoName : 'externo/', color: '#8b5cf6', active: phase === 'idle' },
                        { icon: '→', label: '', sub: '', color: 'transparent', active: false },
                        { icon: '📥', label: 'Fetch Skill', sub: skillSource === 'github' ? 'API + Bearer Token' : 'fs.readFile', color: '#3b82f6', active: phase === 'fetching' },
                        { icon: '→', label: '', sub: '', color: 'transparent', active: false },
                        { icon: '🔍', label: 'Parse & Validate', sub: 'Metadata + SQL', color: '#f59e0b', active: phase === 'fetched' },
                        { icon: '→', label: '', sub: '', color: 'transparent', active: false },
                        { icon: '⚡', label: 'Execute', sub: 'SQLite query', color: '#10b981', active: phase === 'executing' },
                        { icon: '→', label: '', sub: '', color: 'transparent', active: false },
                        { icon: '📊', label: 'Resultado', sub: 'Tabla + Log', color: '#ef4444', active: phase === 'done' },
                    ].map((s, i) => s.label ? (
                        <div key={i} style={{
                            padding: '0.6rem 0.8rem',
                            borderRadius: 10,
                            background: s.active ? `${s.color}22` : 'var(--bg-secondary)',
                            border: `2px solid ${s.active ? s.color : 'transparent'}`,
                            textAlign: 'center',
                            minWidth: 90,
                            transition: 'all 0.3s ease',
                            boxShadow: s.active ? `0 0 20px ${s.color}33` : 'none',
                        }}>
                            <div style={{ fontSize: '1.1rem', marginBottom: 3 }}>{s.icon}</div>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: s.active ? s.color : 'var(--text-secondary)' }}>{s.label}</div>
                            <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)' }}>{s.sub}</div>
                        </div>
                    ) : (
                        <span key={i} style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 300 }}>→</span>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem' }}>
                {/* Left: Skills list */}
                <div>
                    <div className="card animate-fade-up" style={{ padding: '1rem' }}>
                        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            {skillSource === 'github' ? '🔒' : '📁'} Skills
                            {loadingSkills && <span className="spinner" style={{ width: 14, height: 14 }}></span>}
                        </h3>

                        {/* Search Bar */}
                        <div style={{ marginBottom: '1rem' }}>
                            <input
                                type="text"
                                placeholder="🔍 Buscar skill..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: 8,
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.75rem',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', paddingRight: 4 }}>
                            {Object.entries(grouped).map(([folder, folderSkills]) => (
                                <div key={folder} style={{ marginBottom: '0.75rem' }}>
                                    {folder !== 'root' && (
                                        <button
                                            onClick={() => toggleFolder(folder)}
                                            style={{
                                                fontSize: '0.6rem',
                                                fontWeight: 700,
                                                color: 'var(--text-muted)',
                                                textTransform: 'uppercase',
                                                marginBottom: 6,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                width: '100%',
                                                textAlign: 'left'
                                            }}
                                        >
                                            {expandedFolders[folder] ? '📂' : '📁'} {folder}
                                            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 400 }}>({folderSkills.length})</span>
                                        </button>
                                    )}

                                    {(folder === 'root' || expandedFolders[folder]) && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingLeft: folder === 'root' ? 0 : 8 }}>
                                            {folderSkills.map(s => {
                                                const cat = s.category || s.subfolder || 'General';
                                                return (
                                                    <button
                                                        key={s.filepath}
                                                        onClick={() => handleFetch(s)}
                                                        style={{
                                                            padding: '0.6rem 0.75rem',
                                                            borderRadius: 8,
                                                            background: selected?.skill_id === s.skill_id ? `${categoryColors[cat] || '#666'}15` : 'var(--bg-secondary)',
                                                            border: `1.5px solid ${selected?.skill_id === s.skill_id ? categoryColors[cat] || '#666' : 'rgba(255,255,255,0.05)'}`,
                                                            cursor: 'pointer',
                                                            textAlign: 'left',
                                                            transition: 'all 0.2s ease',
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                                                            {categoryIcons[cat] || '📄'} {s.title || s.filename}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                                                            <span style={{ fontSize: '0.5rem', padding: '1px 5px', borderRadius: 4, background: `${categoryColors[cat] || '#666'}22`, color: categoryColors[cat] || '#666', fontWeight: 600 }}>
                                                                {cat}
                                                            </span>
                                                            {s.version && <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>v{s.version}</span>}
                                                            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{(s.size / 1024).toFixed(1)}KB</span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {skills.length === 0 && !loadingSkills && (
                                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    No se encontraron skills
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Detail + Terminal + Results */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Skill detail */}
                    {selected && (
                        <div className="card animate-fade-up" style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4 }}>
                                        {selected.title}
                                    </h3>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>{selected.description}</p>
                                </div>
                                {selected.sql ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleExecute('sql')}
                                        disabled={phase === 'executing'}
                                        style={{ flexShrink: 0, fontSize: '0.78rem' }}
                                    >
                                        {phase === 'executing' ? '⏳ Ejecutando...' : '⚡ Ejecutar SQL'}
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleExecute('simulate')}
                                        disabled={phase === 'executing'}
                                        style={{ flexShrink: 0, fontSize: '0.78rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                                    >
                                        {phase === 'executing' ? '🧠 Pensando...' : '🤖 Simular Agente'}
                                    </button>
                                )}
                            </div>

                            {/* Metadata grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.4rem', marginBottom: '1rem' }}>
                                {[
                                    { label: 'Skill ID', value: selected.skill_id, color: '#3b82f6' },
                                    { label: 'Versión', value: `v${selected.version}`, color: '#10b981' },
                                    { label: 'Categoría', value: selected.category, color: categoryColors[selected.category] || '#666' },
                                    { label: 'Tablas', value: selected.requires || '—', color: '#f59e0b' },
                                    { label: 'Fuente', value: fetchLog?.from || selected.source, color: '#8b5cf6' },
                                    { label: 'Autor', value: selected.author, color: '#6b7280' },
                                    { label: 'Ruta', value: selected.filepath, color: 'var(--text-muted)' },
                                ].map(m => (
                                    <div key={m.label} style={{ padding: '0.4rem 0.6rem', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 1 }}>{m.label}</div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: m.color, wordBreak: 'break-all' }}>{m.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* SQL Preview */}
                            {selected.sql && (
                                <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-muted)' }}>📋 SQL Query extraída:</div>
                                    <pre style={{
                                        background: '#0d1117',
                                        padding: '0.75rem',
                                        borderRadius: 8,
                                        fontSize: '0.65rem',
                                        color: '#e6edf3',
                                        overflow: 'auto',
                                        maxHeight: 180,
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        lineHeight: 1.5,
                                    }}>
                                        {selected.sql}
                                    </pre>
                                </div>
                            )}

                            {!selected.sql && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ padding: '0.75rem', borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '0.75rem', color: '#f59e0b', marginBottom: '1rem' }}>
                                        ⚠️ Esta skill no contiene SQL ejecutable (es un prompt para agente).<br />
                                        Puedes ver las instrucciones y simular la ejecución abajo.
                                    </div>

                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-muted)' }}>📄 Instrucciones del Agente:</div>
                                    <div style={{
                                        background: 'var(--bg-primary)',
                                        padding: '1rem',
                                        borderRadius: 8,
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        lineHeight: 1.6,
                                        maxHeight: 300,
                                        overflow: 'auto',
                                        whiteSpace: 'pre-wrap',
                                    }}>
                                        {selected.raw}
                                    </div>
                                </div>
                            )}

                            {/* Fetch log */}
                            {fetchLog && (
                                <div style={{ marginTop: '0.6rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.4rem' }}>
                                    {[
                                        { label: 'Status', value: `HTTP ${fetchLog.status}`, color: '#10b981' },
                                        { label: 'Latencia', value: `${fetchLog.latency_ms}ms`, color: '#3b82f6' },
                                        { label: 'Tamaño', value: `${fetchLog.size_bytes} bytes`, color: '#f59e0b' },
                                        { label: 'Fuente', value: fetchLog.from, color: '#8b5cf6' },
                                    ].map(l => (
                                        <div key={l.label} style={{ padding: '0.35rem 0.5rem', borderRadius: 6, background: `${l.color}10`, border: `1px solid ${l.color}25` }}>
                                            <div style={{ fontSize: '0.45rem', color: 'var(--text-muted)', fontWeight: 700 }}>{l.label}</div>
                                            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: l.color }}>{l.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Terminal */}
                    <div className="card animate-fade-up" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }}></span>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span>
                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }}></span>
                            </div>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Skill Runner Terminal</span>
                            {skillSource === 'github' && githubConnected && (
                                <span style={{ marginLeft: 'auto', fontSize: '0.55rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
                                    Conectado
                                </span>
                            )}
                        </div>
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: '#0d1117',
                            fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
                            fontSize: '0.62rem',
                            lineHeight: 1.7,
                            maxHeight: 230,
                            overflow: 'auto',
                            color: '#e6edf3',
                        }}>
                            {terminalLines.map((line, i) => (
                                <div key={i} style={{
                                    color: line.startsWith('$') ? '#79c0ff' :
                                        line.includes('✓') ? '#3fb950' :
                                            line.includes('✗') ? '#f85149' :
                                                line.includes('→') ? '#d2a8ff' :
                                                    '#8b949e',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                }}>
                                    {line || '\u00A0'}
                                </div>
                            ))}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ color: '#79c0ff' }}>$ </span>
                                <span style={{
                                    display: 'inline-block', width: 7, height: 14,
                                    background: '#79c0ff', animation: 'pulse-soft 1s infinite',
                                    marginLeft: 2,
                                }}></span>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {results && results.length > 0 && (
                        <div className="card animate-fade-up" style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h3 style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                    📊 Resultado ({results.length} registros)
                                </h3>
                                {executionLog && (
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <span style={{ fontSize: '0.6rem', color: '#10b981' }}>⚡ {executionLog.query_ms}ms</span>
                                        <span style={{ fontSize: '0.6rem', color: '#3b82f6' }}>📋 {executionLog.rows_returned} filas</span>
                                    </div>
                                )}
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            {Object.keys(results[0]).map(key => (
                                                <th key={key} style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((row, i) => (
                                            <tr key={i}>
                                                {Object.values(row).map((val, j) => (
                                                    <td key={j} style={{
                                                        fontSize: '0.68rem',
                                                        color: String(val) === 'OK' ? '#10b981' :
                                                            String(val) === 'SIN_DOTACION' ? '#ef4444' :
                                                                String(val) === 'RELEVO_BAJO' ? '#f59e0b' :
                                                                    'var(--text-secondary)',
                                                        fontWeight: ['OK', 'SIN_DOTACION', 'RELEVO_BAJO'].includes(String(val)) ? 700 : 400,
                                                    }}>
                                                        {String(val) === 'OK' ? '✅ OK' :
                                                            String(val) === 'SIN_DOTACION' ? '❌ Sin Dotación' :
                                                                String(val) === 'RELEVO_BAJO' ? '⚠️ Relevo Bajo' :
                                                                    val === null ? '—' : String(val)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Empty state */}
                    {!selected && (
                        <div className="card animate-fade-up" style={{ padding: '2.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem', opacity: 0.4 }}>🧪</div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>Selecciona una Skill</h3>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>
                                Click en una skill para {skillSource === 'github' ? 'descargarla desde GitHub privado' : 'leerla desde la carpeta local'}, ver su contenido y ejecutarla.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
