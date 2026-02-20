'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  staffing: { total_roles: number; total_headcount: number; costo_mensual_bruto: number; total_departamentos: number } | null;
  training: { totalCursos: number; totalCompetencias: number };
  audit: { score: number; total: number; cumple: number };
  log: Array<{ modulo: string; accion: string; detalle: string; timestamp: string }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [staffRes, trainRes, auditRes] = await Promise.all([
          fetch('/api/staffing').then(r => r.json()),
          fetch('/api/training').then(r => r.json()),
          fetch('/api/audit').then(r => r.json()),
        ]);
        setData({
          staffing: staffRes.summary,
          training: { totalCursos: trainRes.cursos?.length || 0, totalCompetencias: trainRes.competencias?.length || 0 },
          audit: {
            score: auditRes.summary?.score_promedio || 0,
            total: auditRes.summary?.total_rules || 0,
            cumple: auditRes.summary?.cumple || 0,
          },
          log: auditRes.auditLog || [],
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>;

  const modules = [
    { href: '/staffing', icon: '👥', title: 'Staffing', subtitle: 'El Motor', desc: 'Gestión de dotación, turnos y roles operacionales', color: '#3b82f6', stat: data?.staffing ? `${data.staffing.total_headcount} personas` : '—' },
    { href: '/training', icon: '🎓', title: 'Training', subtitle: 'El Flujo', desc: 'Plan de capacitación y análisis de brechas', color: '#10b981', stat: `${data?.training.totalCursos || 0} cursos` },
    { href: '/finance', icon: '💰', title: 'Finance', subtitle: 'El Costo', desc: 'Presupuesto OPEX y carga laboral', color: '#f59e0b', stat: data?.staffing ? `$${(data.staffing.costo_mensual_bruto / 1e6).toFixed(0)}M CLP/mes` : '—' },
    { href: '/audit', icon: '🛡️', title: 'Audit', subtitle: 'El Juez', desc: 'Verificación de compliance regulatorio', color: '#8b5cf6', stat: data?.audit.score ? `${data.audit.score}% score` : 'No evaluado' },
  ];

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>IS-001 — Mining Expansion Project · Los Bronces Línea 3</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Commissioning</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>01 Ago 2026</div>
        </div>
      </div>

      <div className="card-grid card-grid-4 stagger-children" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat-card blue animate-fade-up">
          <div className="stat-label">Headcount Total</div>
          <div className="stat-value">{data?.staffing?.total_headcount || '—'}</div>
          <div className="stat-sub">{data?.staffing?.total_roles || 0} roles definidos</div>
        </div>
        <div className="card stat-card green animate-fade-up">
          <div className="stat-label">Competencias</div>
          <div className="stat-value">{data?.training.totalCompetencias || 0}</div>
          <div className="stat-sub">{data?.training.totalCursos || 0} cursos programados</div>
        </div>
        <div className="card stat-card amber animate-fade-up">
          <div className="stat-label">Costo Mensual Bruto</div>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>${data?.staffing ? (data.staffing.costo_mensual_bruto / 1e6).toFixed(1) : '—'}M</div>
          <div className="stat-sub">CLP (antes cargas sociales)</div>
        </div>
        <div className="card stat-card purple animate-fade-up">
          <div className="stat-label">Compliance Score</div>
          <div className="stat-value">{data?.audit.score || '—'}%</div>
          <div className="stat-sub">{data?.audit.cumple || 0}/{data?.audit.total || 0} reglas cumplen</div>
        </div>
      </div>

      <div className="card-grid card-grid-4 stagger-children" style={{ marginBottom: '2rem' }}>
        {modules.map(m => (
          <Link key={m.href} href={m.href} className="card module-card animate-fade-up" style={{ '--module-color': m.color } as React.CSSProperties}>
            <div className="module-icon" style={{ background: `${m.color}20`, color: m.color }}>{m.icon}</div>
            <h3>{m.title}</h3>
            <div className="module-subtitle">{m.subtitle}</div>
            <p>{m.desc}</p>
            <div style={{ marginTop: '1rem', fontWeight: 700, color: m.color, fontSize: '0.95rem' }}>{m.stat}</div>
          </Link>
        ))}
      </div>

      <div className="card animate-fade-up" style={{ animationDelay: '350ms' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>📋 Audit Log Reciente</h3>
        {data?.log && data.log.length > 0 ? (
          <div className="stagger-children">
            {data.log.slice(0, 8).map((entry, i) => (
              <div key={i} className="audit-entry animate-fade-left">
                <span className="audit-time">{entry.timestamp}</span>
                <span className="audit-module" style={{ color: entry.modulo === 'AUDIT' ? 'var(--accent-purple)' : entry.modulo === 'STAFFING' ? 'var(--accent-blue)' : entry.modulo === 'TRAINING' ? 'var(--accent-green)' : entry.modulo === 'FINANCE' ? 'var(--accent-amber)' : 'var(--text-secondary)' }}>
                  {entry.modulo}
                </span>
                <span style={{ color: 'var(--text-secondary)' }}>{entry.detalle}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No hay entradas en el log todavía. Ejecuta un módulo para ver actividad.</p>
        )}
      </div>
    </>
  );
}
