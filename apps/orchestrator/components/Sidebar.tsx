'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/', icon: '📊', label: 'Dashboard', section: 'General' },
    { href: '/staffing', icon: '👥', label: 'Staffing', section: 'Módulos' },
    { href: '/training', icon: '🎓', label: 'Training', section: 'Módulos' },
    { href: '/training/assignments', icon: '📋', label: 'Asignaciones', section: 'Módulos' },
    { href: '/finance', icon: '💰', label: 'Finance', section: 'Módulos' },
    { href: '/audit', icon: '🛡️', label: 'Audit', section: 'Módulos' },
    { href: '/architecture', icon: '🧬', label: 'Arquitectura', section: 'Sistema' },
    { href: '/skills-lab', icon: '🧪', label: 'Skills Lab', section: 'Sistema' },
    { href: '/database', icon: '🗄️', label: 'Base de Datos', section: 'Sistema' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h1>⚙ The Orchestrator</h1>
                <p>IS-001 · Los Bronces L3</p>
            </div>
            <nav className="sidebar-nav">
                {['General', 'Módulos', 'Sistema'].map(section => (
                    <div key={section} className="nav-section">
                        <div className="nav-section-title">{section}</div>
                        {navItems.filter(n => n.section === section).map(item => (
                            <Link key={item.href} href={item.href}
                                className={`nav-link ${pathname === item.href ? 'active' : ''}`}>
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                ))}
            </nav>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block', animation: 'pulse-soft 2s infinite' }} />
                    Phase 4 MVP · v1.0.0
                </div>
                Commissioning: 01 Ago 2026
            </div>
        </aside>
    );
}
