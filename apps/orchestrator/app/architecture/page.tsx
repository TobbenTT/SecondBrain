'use client';
import { useState } from 'react';

const agents = [
    {
        id: 'staffing',
        emoji: '📋',
        name: 'El Arquitecto',
        module: 'Staffing',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        description: 'Diseña la estructura organizacional completa: departamentos, roles, turnos y dotación.',
        skills: [
            { name: 'create-staffing-plan.md', type: 'customizable', desc: 'Genera plan de dotación con turnos, relevos y headcount basado en las exigencias de la operación minera.' },
            { name: 'model-staffing-requirements.md', type: 'core', desc: 'Modela requisitos de personal según patrones de turno (4x3, 7x7), factores de relevo y normativa laboral chilena.' },
        ],
        inputs: ['Contrato Colectivo', 'Base de Licitación', 'IS-001 Intent Spec'],
        outputs: ['Tabla de Roles', 'Estructura Departamental', 'Factor de Relevo', 'Headcount Total'],
        tables: ['departamentos', 'roles', 'competencias'],
    },
    {
        id: 'training',
        emoji: '🎓',
        name: 'El Maestro',
        module: 'Training',
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        description: 'Crea la malla curricular y analiza brechas de competencias para cada rol.',
        skills: [
            { name: 'create-training-plan.md', type: 'customizable', desc: 'Genera plan de capacitación de 7 fases, gap analysis y catálogo de cursos alineados con los roles del staffing.' },
        ],
        inputs: ['Roles del Módulo 1', 'Competencias Requeridas', 'Niveles Actuales'],
        outputs: ['Plan 7 Fases', 'Gap Analysis', 'Malla Curricular', 'Asignaciones'],
        tables: ['cursos', 'gap_analysis', 'horas_capacitacion', 'asignaciones_training'],
    },
    {
        id: 'finance',
        emoji: '💰',
        name: 'El Contador',
        module: 'Finance',
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        description: 'Calcula el presupuesto OPEX total: costo de personal + inversión en capacitación.',
        skills: [
            { name: 'model-opex-budget.md', type: 'core', desc: 'Modela presupuesto OPEX con cargas sociales, gratificación, vacaciones y beneficios según Código del Trabajo chileno.' },
        ],
        inputs: ['Headcount & Salarios del Módulo 1', 'Costos Cursos del Módulo 2'],
        outputs: ['OPEX Total Anual', 'Costo por Departamento', 'Factor de Carga', 'Composición OPEX'],
        tables: ['opex_by_role', 'opex_by_department', 'resumen_opex'],
    },
    {
        id: 'audit',
        emoji: '🛡️',
        name: 'El Juez',
        module: 'Audit',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        description: 'Verifica compliance regulatorio cruzando datos de todos los módulos.',
        skills: [
            { name: 'audit-compliance-readiness.md', type: 'core', desc: 'Audita 12 reglas de compliance: turnos legales, certificaciones, ratios supervisor/operador, presupuesto y más.' },
        ],
        inputs: ['Todos los datos de Módulos 1–3', 'Reglas de Compliance', 'Normativa Legal Chilena'],
        outputs: ['Score de Compliance', 'Risk Score por Regla', 'Hallazgos Críticos', 'Plan de Acción'],
        tables: ['reglas_compliance', 'audit_results', 'audit_log'],
    },
];

const flowSteps = [
    { num: 1, icon: '📄', title: 'Documento de Entrada', desc: 'El sistema ingesta el IS-001 Intent Spec (contrato/licitación)', color: '#64748b' },
    { num: 2, icon: '🧠', title: 'Read Once → SQL', desc: 'Se extraen datos clave una sola vez y se guardan en SQLite. Ahorro: 90% tokens', color: '#3b82f6' },
    { num: 3, icon: '⚡', title: 'Skill Runner', desc: 'El Orchestrator ejecuta cada Skill con los datos estructurados de la DB', color: '#10b981' },
    { num: 4, icon: '🔗', title: 'Encadenamiento', desc: 'La salida de un agente alimenta al siguiente: Staffing → Training → Finance → Audit', color: '#f59e0b' },
    { num: 5, icon: '📊', title: 'Entregables', desc: 'Reportes exportables en Excel/PDF con trazabilidad completa y audit log', color: '#8b5cf6' },
];

export default function ArquitecturaPage() {
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
    const [activeFlow, setActiveFlow] = useState<number | null>(null);

    const selected = agents.find(a => a.id === selectedAgent);

    return (
        <>
            <div className="page-header">
                <div>
                    <h2>🧬 Arquitectura — Agentes & Skills</h2>
                    <p>Cómo funciona el sistema de agentes inteligentes de The Orchestrator</p>
                </div>
            </div>

            {/* System Overview */}
            <div className="card animate-fade-up" style={{ marginBottom: '1.5rem', padding: '2rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.08) 100%)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '3rem', lineHeight: 1 }}>🧬</div>
                    <div style={{ flex: 1, minWidth: 300 }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            The Orchestrator — Sistema Multi-Agente
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>
                            Sistema basado en <strong>Skills (Habilidades)</strong> definidas como archivos Markdown que actúan como &quot;prompts ejecutables&quot;.
                            Cada agente especializado lee datos de una <strong>base de datos SQLite</strong> (patrón Read Once) en lugar del documento original,
                            reduciendo el consumo de tokens en un <strong style={{ color: 'var(--accent-green)' }}>90%</strong>.
                            Los agentes se <strong>encadenan secuencialmente</strong>: la salida de uno alimenta al siguiente.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Agentes', value: '4', color: '#3b82f6' },
                            { label: 'Skills', value: '5', color: '#10b981' },
                            { label: 'Tablas SQL', value: '12+', color: '#f59e0b' },
                            { label: 'Ahorro Tokens', value: '90%', color: '#8b5cf6' },
                        ].map(s => (
                            <div key={s.label} style={{ textAlign: 'center', minWidth: 80 }}>
                                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Flow Pipeline */}
            <div className="card animate-fade-up" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>⚡ Pipeline de Ejecución</h3>
                <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {flowSteps.map((step, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 160 }}>
                            <div
                                onMouseEnter={() => setActiveFlow(i)}
                                onMouseLeave={() => setActiveFlow(null)}
                                style={{
                                    flex: 1,
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: `1px solid ${activeFlow === i ? step.color : 'var(--border)'}`,
                                    background: activeFlow === i ? `${step.color}15` : 'transparent',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    transform: activeFlow === i ? 'scale(1.03)' : 'scale(1)',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: step.color, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>{step.num}</span>
                                    <span style={{ fontSize: '1.1rem' }}>{step.icon}</span>
                                </div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>{step.title}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{step.desc}</div>
                            </div>
                            {i < flowSteps.length - 1 && (
                                <div style={{ padding: '0 0.3rem', color: 'var(--text-muted)', fontSize: '1.2rem', flexShrink: 0 }}>→</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Agent Cards */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', paddingLeft: '0.25rem' }}>🤖 Los 4 Agentes</h3>
            <div className="card-grid card-grid-4 stagger-children" style={{ marginBottom: '1.5rem' }}>
                {agents.map(agent => (
                    <div
                        key={agent.id}
                        className="card animate-fade-up"
                        onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                        style={{
                            cursor: 'pointer',
                            border: selectedAgent === agent.id ? `2px solid ${agent.color}` : '1px solid var(--border)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Gradient top bar */}
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: agent.gradient }} />

                        <div style={{ textAlign: 'center', marginBottom: '0.75rem', paddingTop: '0.5rem' }}>
                            <div style={{ fontSize: '2.2rem', marginBottom: '0.3rem' }}>{agent.emoji}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: agent.color }}>{agent.name}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Módulo {agent.module}</div>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem', textAlign: 'center' }}>
                            {agent.description}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {agent.skills.map((s, i) => (
                                <span key={i} style={{ display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '100px', fontSize: '0.62rem', fontWeight: 700, background: s.type === 'core' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.12)', color: s.type === 'core' ? '#a78bfa' : '#60a5fa', border: `1px solid ${s.type === 'core' ? 'rgba(139,92,246,0.25)' : 'rgba(59,130,246,0.25)'}`, letterSpacing: '0.02em' }}>
                                    {s.type === 'core' ? '🔧 core' : '⚙️ custom'}
                                </span>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.7rem', color: selectedAgent === agent.id ? agent.color : 'var(--text-muted)' }}>
                            {selectedAgent === agent.id ? '▲ Cerrar detalle' : '▼ Ver detalle'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Agent Detail Panel */}
            {selected && (
                <div className="card animate-slide-down" style={{ marginBottom: '1.5rem', border: `1px solid ${selected.color}30` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                        <span style={{ fontSize: '2rem' }}>{selected.emoji}</span>
                        <div>
                            <h3 style={{ fontWeight: 800, color: selected.color, fontSize: '1.2rem' }}>{selected.name} — {selected.module}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selected.description}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                        {/* Skills */}
                        <div>
                            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>📁 Skills (Archivos .md)</h4>
                            {selected.skills.map((s, i) => (
                                <div key={i} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', marginBottom: '0.5rem' }}>
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 700, color: selected.color, marginBottom: '0.25rem' }}>
                                        skills/{s.type}/{s.name}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
                                </div>
                            ))}
                        </div>

                        {/* Inputs & Outputs */}
                        <div>
                            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>📥 Inputs</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
                                {selected.inputs.map((inp, i) => (
                                    <li key={i} style={{ padding: '0.3rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span style={{ color: '#10b981', fontSize: '0.7rem' }}>▸</span> {inp}
                                    </li>
                                ))}
                            </ul>
                            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>📤 Outputs</h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {selected.outputs.map((out, i) => (
                                    <li key={i} style={{ padding: '0.3rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <span style={{ color: '#f59e0b', fontSize: '0.7rem' }}>▸</span> {out}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Database Tables */}
                        <div>
                            <h4 style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>🗄️ Tablas SQL</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                {selected.tables.map((t, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.7rem', borderRadius: '6px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-amber)' }}>{t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chain Diagram */}
            <div className="card animate-fade-up" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🔗 Encadenamiento de Agentes</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                    Los agentes operan secuencialmente. Cada uno produce datos que alimentan al siguiente, creando un pipeline completo desde el contrato inicial hasta el reporte de compliance final.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap', padding: '1rem 0' }}>
                    {agents.map((agent, i) => (
                        <div key={agent.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                                padding: '1rem 1.5rem',
                                borderRadius: '12px',
                                background: agent.gradient,
                                color: '#fff',
                                textAlign: 'center',
                                minWidth: 120,
                                boxShadow: `0 4px 20px ${agent.color}40`,
                            }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{agent.emoji}</div>
                                <div style={{ fontSize: '0.82rem', fontWeight: 800 }}>{agent.name}</div>
                                <div style={{ fontSize: '0.65rem', opacity: 0.85, marginTop: '0.15rem' }}>{agent.module}</div>
                            </div>
                            {i < agents.length - 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0.5rem' }}>
                                    <div style={{ fontSize: '1.4rem', color: 'var(--text-muted)' }}>→</div>
                                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        {i === 0 ? 'Roles' : i === 1 ? 'Costos' : 'Datos'}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* TOKEN ECONOMY — Full Explainer */}
            <div className="card animate-fade-up" style={{ marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.2)', background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(59,130,246,0.04) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🪙</span>
                    <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Economía de Tokens — ¿Qué son y cómo los ahorramos?</h3>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Entendé por qué este sistema ahorra un 90% de costo AI</p>
                    </div>
                </div>

                {/* What are tokens */}
                <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg-secondary)', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>💡 ¿Qué es un &quot;Token&quot;?</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                        Un <strong>token</strong> es la unidad de texto que procesa un modelo de IA (como ChatGPT o Claude).
                        Aproximadamente <strong style={{ color: '#3b82f6' }}>1 token ≈ ¾ de una palabra</strong> en español.
                        Cada vez que le envías texto a una IA, pagas por la cantidad de tokens de entrada + salida.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                        {[
                            { example: '"Hola, ¿cómo estás?"', tokens: '~7 tokens', cost: '$0.0001' },
                            { example: 'Un email de 1 párrafo', tokens: '~150 tokens', cost: '$0.002' },
                            { example: 'Un contrato de 100 páginas', tokens: '~50,000 tokens', cost: '$0.75' },
                            { example: '5 archivos Skill (.md)', tokens: '~40,000 tokens', cost: '$0.60' },
                        ].map(ex => (
                            <div key={ex.example} style={{ flex: '1 1 160px', padding: '0.5rem 0.7rem', borderRadius: '8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.1)' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>{ex.example}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ex.tokens}</div>
                                <div style={{ fontSize: '0.68rem', color: '#f59e0b' }}>≈ {ex.cost} USD</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* The Problem */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>❌ Sin Read Once (método tradicional)</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            Cada vez que un agente necesita datos, la IA re-lee <strong>todo</strong> el documento original
                            (50,000+ tokens). Si 4 agentes consultan 3 veces cada uno = <strong style={{ color: '#ef4444' }}>600,000 tokens</strong>.
                        </p>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#ef4444' }}>
                            Costo estimado: ~$9.00 USD por ejecución
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '1.5rem' }}>→</div>
                    <div style={{ padding: '1rem', borderRadius: '10px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', marginBottom: '0.5rem' }}>✅ Con Read Once (nuestro método)</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            Se lee el documento <strong>1 vez</strong>, se guardan los datos en SQLite.
                            Los agentes consultan la DB (~500 tokens por consulta). 4 agentes × 3 consultas = <strong style={{ color: '#10b981' }}>6,000 tokens</strong>.
                        </p>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>
                            Costo estimado: ~$0.09 USD por ejecución
                        </div>
                    </div>
                </div>

                {/* Per-module breakdown with visual bars */}
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.75rem' }}>📊 Uso de Tokens por Módulo</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {[
                        { agent: '📋 Staffing', skill: 'create-staffing-plan + model-staffing', skillTokens: 22000 + 40000, sqlTokens: 800, queries: 3, color: '#3b82f6' },
                        { agent: '🎓 Training', skill: 'create-training-plan', skillTokens: 22000, sqlTokens: 600, queries: 4, color: '#10b981' },
                        { agent: '💰 Finance', skill: 'model-opex-budget', skillTokens: 17000, sqlTokens: 500, queries: 2, color: '#f59e0b' },
                        { agent: '🛡️ Audit', skill: 'audit-compliance-readiness', skillTokens: 48000, sqlTokens: 700, queries: 3, color: '#8b5cf6' },
                    ].map(mod => {
                        const traditional = mod.skillTokens * mod.queries;
                        const optimized = mod.skillTokens + (mod.sqlTokens * mod.queries);
                        const savings = ((1 - optimized / traditional) * 100).toFixed(0);
                        const maxBar = 200000; // max for visual scale
                        return (
                            <div key={mod.agent} style={{ padding: '0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{mod.agent}</span>
                                    <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>-{savings}% ahorro</span>
                                </div>
                                {/* Traditional bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', width: 80, textAlign: 'right', flexShrink: 0 }}>Tradicional:</span>
                                    <div style={{ flex: 1, height: 16, borderRadius: '4px', background: 'rgba(239,68,68,0.08)', overflow: 'hidden', position: 'relative' }}>
                                        <div style={{ width: `${Math.min((traditional / maxBar) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #dc2626)', borderRadius: '4px', transition: 'width 1s ease' }} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', minWidth: 85, textAlign: 'right' }}>{(traditional / 1000).toFixed(0)}K tokens</span>
                                </div>
                                {/* Optimized bar */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', width: 80, textAlign: 'right', flexShrink: 0 }}>Read Once:</span>
                                    <div style={{ flex: 1, height: 16, borderRadius: '4px', background: 'rgba(16,185,129,0.08)', overflow: 'hidden', position: 'relative' }}>
                                        <div style={{ width: `${Math.min((optimized / maxBar) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '4px', transition: 'width 1s ease' }} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', minWidth: 85, textAlign: 'right' }}>{(optimized / 1000).toFixed(0)}K tokens</span>
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem', paddingLeft: 85 }}>
                                    Skill: {(mod.skillTokens / 1000).toFixed(0)}K (1 vez) + {mod.queries} consultas SQL × {mod.sqlTokens} tokens
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Total Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', borderRadius: '10px', textAlign: 'center', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.2rem' }}>Método Tradicional</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>522K</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>tokens por ejecución</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444', marginTop: '0.3rem' }}>~$7.83 USD</div>
                    </div>
                    <div style={{ padding: '1rem', borderRadius: '10px', textAlign: 'center', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.2rem' }}>Con Read Once</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>156K</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>tokens por ejecución</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', marginTop: '0.3rem' }}>~$2.34 USD</div>
                    </div>
                    <div style={{ padding: '1rem', borderRadius: '10px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(59,130,246,0.08) 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.2rem' }}>Ahorro Total</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>70%</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>menos tokens</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', marginTop: '0.3rem' }}>$5.49 USD ahorrados</div>
                    </div>
                    <div style={{ padding: '1rem', borderRadius: '10px', textAlign: 'center', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '0.2rem' }}>Consultas Posteriores</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>~500</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>tokens por consulta SQL</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.3rem' }}>vs 50K sin Read Once</div>
                    </div>
                </div>

                <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>📌 Nota:</strong> Esta app funciona <strong>100% local</strong> sin llamadas a APIs de IA externas. Los Skills (.md) ya fueron &quot;ejecutados&quot; durante la construcción de la app — los datos resultantes viven en SQLite.
                    El concepto de tokens aplica cuando se usa este sistema con un modelo de IA en producción (ej. conectando Claude o GPT para regenerar datos desde documentos nuevos).
                </div>
            </div>

            {/* Tech Stack */}
            <div className="card animate-fade-up" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>🏗️ Stack Tecnológico</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                        { layer: 'Frontend', tech: 'Next.js 16 + TypeScript', icon: '⚛️', desc: 'App Router, componentes modulares, CSS animations' },
                        { layer: 'Styling', tech: 'Custom CSS v2.0', icon: '🎨', desc: 'Glassmorphism, gradients, 14+ animaciones' },
                        { layer: 'Database', tech: 'SQLite (better-sqlite3)', icon: '🗄️', desc: 'Memoria local, patrón Read Once, zero-config' },
                        { layer: 'Exports', tech: 'SheetJS (xlsx) + HTML→PDF', icon: '📊', desc: 'Excel multi-hoja y PDFs profesionales' },
                        { layer: 'Audit', tech: 'Audit Log nativo', icon: '📋', desc: 'Cada acción se registra con timestamp y módulo' },
                    ].map(item => (
                        <div key={item.layer} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginRight: '0.4rem' }}>{item.layer}:</span>
                                    {item.tech}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills File Tree */}
            <div className="card animate-fade-up">
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>📁 Árbol de Skills</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Las Skills son archivos Markdown (<code>.md</code>) que definen la lógica de cada agente. Se dividen en <strong>core</strong> (lógica de negocio) y <strong>customizable</strong> (adaptables al proyecto).
                </p>
                <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 2, padding: '1rem', borderRadius: '8px', background: 'var(--bg-secondary)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>skills/</div>
                    <div style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>├── core/</div>
                    <div style={{ paddingLeft: '3rem' }}>
                        <span style={{ color: '#a78bfa' }}>├── </span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>model-staffing-requirements.md</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}> — 40 KB · Modelo de dotación</span>
                    </div>
                    <div style={{ paddingLeft: '3rem' }}>
                        <span style={{ color: '#a78bfa' }}>├── </span>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>model-opex-budget.md</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}> — 17 KB · Presupuesto OPEX</span>
                    </div>
                    <div style={{ paddingLeft: '3rem' }}>
                        <span style={{ color: '#a78bfa' }}>└── </span>
                        <span style={{ color: '#8b5cf6', fontWeight: 600 }}>audit-compliance-readiness.md</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}> — 48 KB · Auditoría compliance</span>
                    </div>
                    <div style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>└── customizable/</div>
                    <div style={{ paddingLeft: '3rem' }}>
                        <span style={{ color: '#60a5fa' }}>├── </span>
                        <span style={{ color: '#3b82f6', fontWeight: 600 }}>create-staffing-plan.md</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}> — 22 KB · Plan de dotación</span>
                    </div>
                    <div style={{ paddingLeft: '3rem' }}>
                        <span style={{ color: '#60a5fa' }}>└── </span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>create-training-plan.md</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}> — 22 KB · Plan de capacitación</span>
                    </div>
                </div>
            </div>
        </>
    );
}
