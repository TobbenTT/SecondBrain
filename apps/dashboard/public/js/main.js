/* ═══════════════════════════════════════════════════════════════════════════
   VALUE STRATEGY CONSULTING HUB v2.1 — Dashboard Logic
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    // ─── Critical (UI shell) ────────────────────────────────────────────
    initNavigation();
    initMobileSidebar();
    initDate();
    initHomeGreeting();
    initThemeToggle();
    initQuickCapture();
    initGlobalSearch();
    initNotifications();
    initConsultorUI();
    initPanelActions();
    initHomeData();
    initChat();

    // ─── Deferred (load after first paint) ──────────────────────────────
    requestAnimationFrame(() => {
        initIdeas();
        initUpload();
        initProjects();
        initAreas();
        initWaitingFor();
        initDigest();
        initExportImport();
        initVoiceCommands();
        initSkills();
        initVersionCheck();
        initInactivityLogout();
    });

    // ─── Lazy (loaded on section switch — see _applySectionSwitch) ──────
    // initArchivos → on 'archivos' section
    // initOverviewStats → on 'overview' section
    // initAnalytics → on 'analytics' section
    // initAgents → on 'agents' section
    // loadInboxLog → on 'ideas' section
    // initReportability → on 'reportability' section
    // initInboxTriage → on 'inbox' section
    // initOKRs → on 'okrs' section
    // initNextActions → on 'gtd-board' section

    // ─── Auto-refresh: recarga datos de la sección activa cada 5 min ─────
    setInterval(() => {
        const active = document.querySelector('.nav-link.active');
        if (!active) return;
        const section = active.dataset.section;
        if (section === 'home') { initHomeData(); }
        else if (section === 'overview') { initOverviewStats(); }
        else if (section === 'reportability') { initReportability(); }
        else if (section === 'analytics') { loadAnalytics(); }
        else if (section === 'feedback') { loadFeedback(); }
        else if (section === 'reuniones') { loadReuniones(); }
        else if (section === 'inbox') { loadInboxTriage(); }
        invalidateUsersCache();
    }, 5 * 60 * 1000);
});

// ─── Date helper: parse date-only strings without timezone shift ──────────────
function parseLocalDate(dateStr) {
    if (!dateStr) return new Date(NaN);
    // Strip time+timezone if present: "2026-02-26T00:00:00.000Z" → "2026-02-26"
    const ymd = String(dateStr).substring(0, 10);
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d);
}

// ─── Global Users Cache (eliminates 11 duplicate /api/users fetches) ──────────
const _usersCache = { data: null, ts: 0, promise: null };
const USERS_CACHE_TTL = 30000; // 30s

async function getCachedUsers() {
    const now = Date.now();
    if (_usersCache.data && now - _usersCache.ts < USERS_CACHE_TTL) {
        return _usersCache.data;
    }
    // Deduplicate concurrent requests
    if (_usersCache.promise) return _usersCache.promise;
    _usersCache.promise = fetch('/api/users')
        .then(r => { if (!r.ok) throw new Error('Failed'); return r.json(); })
        .then(users => {
            _usersCache.data = users;
            _usersCache.ts = Date.now();
            _usersCache.promise = null;
            return users;
        })
        .catch(err => {
            _usersCache.promise = null;
            console.warn('Users fetch failed:', err);
            return _usersCache.data || []; // return stale data if available
        });
    return _usersCache.promise;
}

function invalidateUsersCache() {
    _usersCache.data = null;
    _usersCache.ts = 0;
}

// ─── Lazy script loader (Chart.js, D3 loaded on demand) ─────────────────────
const _loadedScripts = {};
function loadScript(url) {
    if (_loadedScripts[url]) return _loadedScripts[url];
    _loadedScripts[url] = new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${url}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = url; s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
    });
    return _loadedScripts[url];
}
const CDN_CHARTJS = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js';
const CDN_D3 = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';

// ─── Section titles mapping ────────────────────────────────────────────────────
const SECTION_META = {
    home: { title: 'Bienvenido', subtitle: 'Hub Interno de Operaciones' },
    overview: { title: 'Dashboard General', subtitle: 'Resumen ejecutivo — Proyectos, indicadores y flujo de trabajo' },
    projects: { title: 'Proyectos', subtitle: 'Iniciativas activas con plazos y responsables asignados' },
    areas: { title: 'Areas de Responsabilidad', subtitle: 'Departamentos y funciones continuas de la organizacion' },
    archivos: { title: 'Recursos y Documentos', subtitle: 'Documentos, archivos y material de referencia del equipo' },
    methodologies: { title: 'Metodologias de Trabajo', subtitle: 'Frameworks operativos: CODE, PARA y GTD' },
    ideas: { title: 'Ideas Capturadas', subtitle: 'Registro de ideas — Capturar, Organizar, Destilar y Expresar' },
    skills: { title: 'Skills', subtitle: 'Procedimientos, conocimiento técnico y buenas prácticas' },
    context: { title: 'Base de Conocimiento', subtitle: 'Información organizada por Proyectos, Áreas, Recursos y Archivo' },
    waiting: { title: 'Delegaciones y Seguimiento', subtitle: 'Tareas delegadas pendientes de respuesta o acción de terceros' },
    reportability: { title: 'Avance del Equipo', subtitle: 'Checklist diario y progreso por consultor' },
    analytics: { title: 'Indicadores y Métricas', subtitle: 'Tendencias, gráficos y estadísticas del equipo' },
    agents: { title: 'Agentes IA', subtitle: 'Agentes especializados para automatizar tareas de negocio' },
    openclaw: { title: 'Monitor de Procesos IA', subtitle: 'Pipeline multi-agente — Seguimiento de tareas automatizadas' },
    inbox: { title: 'Bandeja de Ideas', subtitle: 'Ideas pendientes de clasificar — Revisa, confirma y organiza' },
    okrs: { title: 'OKRs', subtitle: 'Objetivos y Resultados Clave — Vincular proyectos a metas estratégicas' },
    'gtd-board': { title: 'Próximas Acciones (GTD)', subtitle: 'Tareas pendientes filtradas por contexto, energía y responsable' },
    'gtd-projects': { title: 'Proyectos GTD', subtitle: 'Proyectos desglosados en sub-tareas con próxima acción definida' },
    'gtd-report': { title: 'Reporte Diario', subtitle: 'Resumen del día generado por IA — qué pasó, qué falta, quién debe actuar' },
    'revision': { title: 'Revisión de Entregables', subtitle: 'Cola de revisión de Skills y Outputs del equipo consultor' },
    'reuniones': { title: 'Reuniones', subtitle: 'Análisis automatizado de reuniones — Compromisos y participantes' },
    'feedback': { title: 'Sugerencias y Mejoras', subtitle: 'Observaciones del equipo sobre la plataforma' },
    'admin-users': { title: 'Gestión de Usuarios', subtitle: 'Crear, editar y administrar cuentas del equipo' },
    'graph-view': { title: 'Mapa de Conexiones', subtitle: 'Visualización interactiva — Proyectos, Áreas, Reuniones, Ideas, Skills y OKRs' },
    'herramientas': { title: 'Suscripciones y Licencias', subtitle: 'Suscripciones y licencias de software contratadas' },
    'audit-log': { title: 'Registro de Auditoria', subtitle: 'Eventos de seguridad del sistema' },
    'admin-files': { title: 'Gestor de Archivos', subtitle: 'Todos los archivos del sistema — subidos, eliminados y papelera' }
};


// ─── Navigation / Section switching ────────────────────────────────────────────
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchSection(link.dataset.section);
            closeMobileSidebar();
        });
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
        const hash = window.location.hash.replace('#', '');
        if (hash && SECTION_META[hash]) {
            switchSectionSilent(hash);
        }
    });

    const hash = window.location.hash.replace('#', '');
    if (hash && SECTION_META[hash]) switchSection(hash);
}

const _lazyInited = {};

function _applySectionSwitch(sectionId) {
    document.querySelectorAll('.nav-link[data-section]').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    document.querySelectorAll('.dashboard-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById('section-' + sectionId);
    if (section) {
        section.classList.remove('active');
        void section.offsetWidth;
        section.classList.add('active');
    }

    const meta = SECTION_META[sectionId];
    if (meta) {
        const title = document.getElementById('pageTitle');
        const subtitle = document.getElementById('pageSubtitle');
        if (title) title.textContent = meta.title;
        if (subtitle) subtitle.textContent = meta.subtitle;
    }

    // Lazy-load section-specific data
    if (sectionId === 'archivos') { if (!_lazyInited.archivos) { _lazyInited.archivos = true; initArchivos(); } }
    if (sectionId === 'overview') { loadScript(CDN_CHARTJS).then(() => { if (!_lazyInited.overview) { _lazyInited.overview = true; initOverviewStats(); } }); }
    if (sectionId === 'analytics') { loadScript(CDN_CHARTJS).then(() => { if (!_lazyInited.analytics) { _lazyInited.analytics = true; initAnalytics(); } loadAnalytics(); }); }
    if (sectionId === 'openclaw') loadOpenClawStatus();
    if (sectionId === 'agents') { if (!_lazyInited.agents) { _lazyInited.agents = true; initAgents(); } loadAgentsSection(); }
    if (sectionId === 'gtd-board') { if (!_lazyInited.nextActions) { _lazyInited.nextActions = true; initNextActions(); } loadGtdBoard('context'); loadNextActionsPanel(); }
    if (sectionId === 'gtd-projects') loadGtdProjects();
    if (sectionId === 'ideas') { if (!_lazyInited.inboxLog) { _lazyInited.inboxLog = true; loadInboxLog(); } initGtdFilterDropdowns(); }
    if (sectionId === 'revision') { loadReviewQueue(); loadAuditTrail(); }
    if (sectionId === 'reportability') { if (!_lazyInited.reportability) { _lazyInited.reportability = true; initReportability(); } }
    if (sectionId === 'reuniones') loadReuniones();
    if (sectionId === 'feedback') loadFeedback();
    if (sectionId === 'admin-users') loadAdminUsers();
    if (sectionId === 'audit-log') loadAuditLog();
    if (sectionId === 'herramientas') loadHerramientas();
    if (sectionId === 'graph-view') { loadScript(CDN_D3).then(() => loadGraphView()); }
    if (sectionId === 'inbox') { if (!_lazyInited.inbox) { _lazyInited.inbox = true; initInboxTriage(); } loadInboxTriage(); }
    if (sectionId === 'okrs') { if (!_lazyInited.okrs) { _lazyInited.okrs = true; initOKRs(); } loadOKRs(); }
    if (sectionId === 'admin-files') loadAdminFiles();
}

function switchSection(sectionId) {
    _applySectionSwitch(sectionId);
    history.pushState({ section: sectionId }, '', '#' + sectionId);
}

// Same as switchSection but without pushing to history (for popstate handler)
function switchSectionSilent(sectionId) {
    _applySectionSwitch(sectionId);
}

function navigateToSection(id) { switchSection(id); }

// ─── Panel actions + Home quick cards ──────────────────────────────────────────
function initPanelActions() {
    document.querySelectorAll('[data-goto]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('external')) return;
            e.preventDefault();
            switchSection(btn.dataset.goto);
        });
    });
}

// ─── Mobile sidebar ────────────────────────────────────────────────────────────
function initMobileSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (toggle) toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('show');
    });
    if (overlay) overlay.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
}

// ─── Date / Greeting ───────────────────────────────────────────────────────────
function initDate() {
    const dateEl = document.getElementById('headerDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }
}

function initHomeGreeting() {
    const el = document.getElementById('homeGreeting');
    if (!el) return;
    const hour = new Date().getHours();
    let greeting = '¡Buenas noches!';
    if (hour >= 5 && hour < 12) greeting = '¡Buenos días!';
    else if (hour >= 12 && hour < 19) greeting = '¡Buenas tardes!';
    el.textContent = greeting + ' Bienvenido al Hub.';
}

// ─── Home Data ──────────────────────────────────────────────────────────────
async function initHomeData() {
    try {
        // Single request replaces 5 separate fetches (home-counts + gallery + my-dashboard + notifications + users)
        const [bundleRes, allUsers] = await Promise.all([
            fetch('/api/stats/home-bundle'),
            getCachedUsers()
        ]);
        if (!bundleRes.ok) { _initHomeDataFallback(); return; }
        const bundle = await bundleRes.json();

        // 1. Home counts
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('homeStatProjects', bundle.counts.projects);
        set('homeStatDocs', bundle.counts.archivos);
        set('homeStatIdeas', bundle.counts.ideas);
        set('homeStatAreas', bundle.counts.areas);

        // 2. Team (from cached users, no extra fetch)
        _renderHomeTeam(allUsers);

        // 3. Gallery (from bundle)
        _renderHomeGallery(bundle.gallery);

        // 4. My Dashboard (from bundle)
        _renderMyDashboard(bundle.dashboard);

        // 5. Notifications (from bundle)
        _renderNotifications(bundle.notifications);

        // 6. Daily Digest widget
        loadDigestWidget();
    } catch (err) {
        console.error('Home bundle error:', err);
        _initHomeDataFallback();
    }
}

// Fallback: if bundle fails, load individually (backwards compat)
function _initHomeDataFallback() {
    fetch('/api/stats/home-counts').then(r => r.ok ? r.json() : null).then(d => {
        if (!d) return;
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('homeStatProjects', d.projects); set('homeStatDocs', d.archivos);
        set('homeStatIdeas', d.ideas); set('homeStatAreas', d.areas);
    }).catch(() => {});
    loadHomeTeam();
    loadHomeGallery();
    loadMyDashboard();
}

async function loadExecutiveSummary() {
    try {
        const res = await fetch('/api/stats/executive');
        if (!res.ok) return;
        const d = await res.json();
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        // KPI Cards
        set('kpiProjectsActive', d.projectsActive);
        set('kpiProjectsSub', `${d.projectsCompleted} completados de ${d.projectsTotal} totales`);
        const projBar = document.getElementById('kpiProjectsBar');
        if (projBar) projBar.style.width = d.projectCompletionRate + '%';
        const projTrend = document.getElementById('kpiProjectsTrend');
        if (projTrend && d.projectsOverdue > 0) {
            projTrend.innerHTML = `<span class="exec-trend-down">${d.projectsOverdue} vencidos</span>`;
        }

        set('kpiIdeasTotal', d.ideasTotal);
        set('kpiIdeasSub', `${d.ideasProgressRate}% procesadas · ${d.ideasWeek} esta semana`);
        const ideasBar = document.getElementById('kpiIdeasBar');
        if (ideasBar) ideasBar.style.width = d.ideasProgressRate + '%';
        const ideasTrend = document.getElementById('kpiIdeasTrend');
        if (ideasTrend) {
            if (d.ideasTrend > 0) ideasTrend.innerHTML = `<span class="exec-trend-up">+${d.ideasTrend}%</span>`;
            else if (d.ideasTrend < 0) ideasTrend.innerHTML = `<span class="exec-trend-down">${d.ideasTrend}%</span>`;
        }

        set('kpiCompromisos', d.compromisos);
        set('kpiCompromisosSub', `${d.compromisosSemana} de esta semana`);
        const compBar = document.getElementById('kpiCompromisosBar');
        if (compBar && d.compromisos > 0) compBar.style.width = Math.min(100, Math.round(d.compromisosSemana / Math.max(d.compromisos, 1) * 100)) + '%';

        set('kpiReuniones', d.reunionesWeek);
        set('kpiReunionesSub', `${d.reunionesTotal} totales`);
        const reunBar = document.getElementById('kpiReunionesBar');
        if (reunBar && d.reunionesTotal > 0) reunBar.style.width = Math.min(100, Math.round(d.reunionesWeek / Math.max(d.reunionesTotal, 1) * 100)) + '%';

        // Project status chart (doughnut)
        if (window.Chart) {
            const ctx = document.getElementById('execChartProjects');
            if (ctx) {
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Activos', 'Completados', 'Pausados', 'Vencidos'],
                        datasets: [{
                            data: [d.projectsActive, d.projectsCompleted, d.projectsPaused, d.projectsOverdue],
                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false, cutout: '65%',
                        plugins: {
                            legend: { position: 'right', labels: { color: '#9ca3af', padding: 12, font: { size: 11 } } }
                        }
                    }
                });
            }
        }

        // Pipeline bars
        const pipeline = document.getElementById('execPipeline');
        if (pipeline) {
            const stages = [
                { key: 'captured', label: 'Capturadas', count: d.ideasPending, color: '#3b82f6', icon: '📥' },
                { key: 'organized', label: 'Organizadas', count: d.organized, color: '#f59e0b', icon: '📂' },
                { key: 'distilled', label: 'Destiladas', count: d.distilled, color: '#8b5cf6', icon: '💎' },
                { key: 'expressed', label: 'Expresadas', count: d.expressed, color: '#10b981', icon: '🚀' }
            ];
            const maxCount = Math.max(...stages.map(s => s.count), 1);
            pipeline.innerHTML = stages.map(s => {
                const pct = Math.max(Math.round(s.count / maxCount * 100), 4);
                return `<div class="exec-pipe-stage">
                    <div class="exec-pipe-icon">${s.icon}</div>
                    <div class="exec-pipe-info">
                        <div class="exec-pipe-label">${s.label} <strong>${s.count}</strong></div>
                        <div class="exec-pipe-bar-wrap"><div class="exec-pipe-bar" style="width:${pct}%;background:${s.color}"></div></div>
                    </div>
                </div>`;
            }).join('<div class="exec-pipe-arrow">→</div>');
        }

        // Top projects
        const topEl = document.getElementById('execTopProjects');
        if (topEl) {
            if (d.topProjects && d.topProjects.length > 0) {
                const statusColors = { active: '#3b82f6', development: '#f59e0b', beta: '#8b5cf6' };
                topEl.innerHTML = d.topProjects.map(p => {
                    const color = statusColors[p.status] || '#6b7280';
                    const deadline = p.deadline ? new Date(p.deadline).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : '';
                    return `<div class="exec-proj-item hp-clickable" onclick="switchSection('projects')">
                        <span class="exec-proj-icon">${p.icon || '📦'}</span>
                        <span class="exec-proj-name">${escapeHtml(p.name)}</span>
                        <span class="exec-proj-status" style="color:${color}">${p.status}</span>
                        ${deadline ? `<span class="exec-proj-deadline">${deadline}</span>` : ''}
                    </div>`;
                }).join('');
            } else {
                topEl.innerHTML = '<div class="hp-empty">Sin proyectos activos</div>';
            }
        }
    } catch (err) {
        console.error('Executive summary error:', err);
    }
}

// Render helpers (used by bundle and fallback)
function _renderHomeTeam(allUsers) {
    const grid = document.getElementById('homeTeamGrid');
    if (!grid) return;
    const users = (allUsers || []).filter(u => !['usuario', 'cliente'].includes(u.role));
    if (users.length === 0) { grid.innerHTML = '<p style="color:var(--text-muted);">No hay miembros registrados</p>'; return; }
    const roleColors = { admin: '#e74c3c', ceo: '#d4af37', manager: '#f1c40f', analyst: '#3498db', consultor: '#2ecc71', usuario: '#9b59b6', cliente: '#e67e22' };
    grid.innerHTML = users.map(u => `
        <div class="home-team-card">
            <div class="home-team-avatar">${_avatarHtml(u.avatar, u.username, 64)}</div>
            <h4 class="home-team-name">${escapeHtml(u.username)}</h4>
            <span class="home-team-role" style="background:${roleColors[u.role] || '#6b7280'}22;color:${roleColors[u.role] || '#6b7280'};">${escapeHtml(u.role)}</span>
            ${u.department ? `<span class="home-team-dept">${escapeHtml(u.department)}</span>` : ''}
            ${u.expertise ? `<span class="home-team-expertise">${escapeHtml(u.expertise)}</span>` : ''}
        </div>
    `).join('');
}

// ── Gallery state ────────────────────────────────────────────────────────────
let _galleryPhotos = [];
let _galleryFilter = 'all';
let _lightboxIndex = -1;

function _renderHomeGallery(photos) {
    const grid = document.getElementById('homeGalleryGrid');
    if (!grid) return;
    if (photos) _galleryPhotos = photos;

    const filtered = _galleryFilter === 'all'
        ? _galleryPhotos
        : _galleryPhotos.filter(p => p.category === _galleryFilter);

    if (!filtered || filtered.length === 0) {
        const isFiltered = _galleryFilter !== 'all' && _galleryPhotos.length > 0;
        grid.innerHTML = `<div class="gallery-empty">
            <div class="gallery-empty-icon">${isFiltered ? '🔍' : '📸'}</div>
            <p>${isFiltered ? 'Sin fotos en esta categoria' : 'Sin fotos aun — sube la primera!'}</p>
            ${!isFiltered && (window.__USER__?.role === 'admin' || window.__USER__?.role === 'ceo' || window.__USER__?.role === 'manager')
                ? '<button class="btn btn-sm" onclick="openGalleryUpload()" style="margin-top:8px;">+ Subir Foto</button>' : ''}
        </div>`;
        return;
    }
    const canDelete = window.__USER__?.role === 'admin' || window.__USER__?.role === 'ceo';
    grid.innerHTML = filtered.map((p, i) => `
        <div class="gallery-item" onclick="openLightbox(${_galleryPhotos.indexOf(p)})" title="${escapeHtml(p.caption || '')}">
            <img src="${escapeHtml(p.url)}" alt="${escapeHtml(p.caption || 'Foto')}" loading="lazy">
            <div class="gallery-caption">
                <span class="gallery-caption-text">${escapeHtml(p.caption || '')}</span>
                <span class="gallery-category">${escapeHtml(p.category)}</span>
            </div>
            ${canDelete ? `<button class="gallery-delete-btn" onclick="event.stopPropagation(); deleteGalleryPhoto(${p.id})" title="Eliminar">✕</button>` : ''}
        </div>
    `).join('');
}

function openLightbox(index) {
    _lightboxIndex = index;
    const p = _galleryPhotos[index];
    if (!p) return;
    const lb = document.getElementById('galleryLightbox');
    const img = document.getElementById('lightboxImg');
    const info = document.getElementById('lightboxInfo');
    img.src = p.url;
    img.alt = p.caption || 'Foto';
    info.innerHTML = `<div>${escapeHtml(p.caption || '')}</div><span class="gallery-category">${escapeHtml(p.category)}</span>`;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lb = document.getElementById('galleryLightbox');
    lb.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(dir) {
    if (_galleryPhotos.length === 0) return;
    _lightboxIndex = (_lightboxIndex + dir + _galleryPhotos.length) % _galleryPhotos.length;
    const p = _galleryPhotos[_lightboxIndex];
    document.getElementById('lightboxImg').src = p.url;
    document.getElementById('lightboxImg').alt = p.caption || 'Foto';
    document.getElementById('lightboxInfo').innerHTML = `<div>${escapeHtml(p.caption || '')}</div><span class="gallery-category">${escapeHtml(p.category)}</span>`;
}

// Gallery filter tabs
document.addEventListener('click', e => {
    const tab = e.target.closest('.gallery-filter-tab');
    if (!tab) return;
    document.querySelectorAll('.gallery-filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    _galleryFilter = tab.dataset.filter;
    _renderHomeGallery();
});

// Lightbox keyboard navigation
document.addEventListener('keydown', e => {
    const lb = document.getElementById('galleryLightbox');
    if (!lb || !lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
});

// Close lightbox on backdrop click
document.addEventListener('click', e => {
    if (e.target.id === 'galleryLightbox') closeLightbox();
});

async function loadHomeTeam() { _renderHomeTeam(await getCachedUsers()); }

async function loadHomeGallery() {
    try {
        const res = await fetch('/api/gallery');
        if (res.ok) _renderHomeGallery(await res.json());
    } catch (err) { console.error('Gallery error:', err); }
}

function openGalleryUpload() {
    document.getElementById('galleryUploadForm').style.display = 'block';
}

async function uploadGalleryPhoto() {
    const fileInput = document.getElementById('galleryFileInput');
    const caption = document.getElementById('galleryCaptionInput');
    const category = document.getElementById('galleryCategoryInput');
    if (!fileInput.files[0]) { showToast('Selecciona una foto', 'warning'); return; }

    const fd = new FormData();
    fd.append('photo', fileInput.files[0]);
    fd.append('caption', caption.value.trim());
    fd.append('category', category.value);

    try {
        const res = await fetch('/api/gallery', { method: 'POST', body: fd });
        if (res.ok) {
            showToast('Foto subida', 'success');
            fileInput.value = '';
            caption.value = '';
            document.getElementById('galleryUploadForm').style.display = 'none';
            loadHomeGallery();
        } else {
            showToast('Error al subir foto', 'error');
        }
    } catch (err) {
        showToast('Error al subir foto', 'error');
    }
}

async function deleteGalleryPhoto(id) {
    if (!confirm('Eliminar esta foto?')) return;
    try {
        const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Foto eliminada', 'success');
            loadHomeGallery();
        }
    } catch (err) {
        showToast('Error', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERSONAL DASHBOARD (Home)
// ═══════════════════════════════════════════════════════════════════════════════

function _renderMyDashboard(data) {
    if (!data) {
        ['hpTaskList', 'hpDelegations', 'hpReunionsList', 'hpActivityFeed'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = '<div class="hp-empty">Inicia sesión para ver tu dashboard</div>';
        });
        return;
    }

    // Task summary badges
    const summaryEl = document.getElementById('hpTaskSummary');
    if (summaryEl) {
        const s = data.tasks_summary;
        const parts = [];
        if (s.alta) parts.push(`<span class="hp-badge hp-badge-alta">${s.alta} urgente${s.alta > 1 ? 's' : ''}</span>`);
        if (s.media) parts.push(`<span class="hp-badge hp-badge-media">${s.media} media</span>`);
        if (s.baja) parts.push(`<span class="hp-badge hp-badge-baja">${s.baja} baja</span>`);
        summaryEl.innerHTML = parts.join('');
    }

    // Tasks list
    const taskEl = document.getElementById('hpTaskList');
    if (taskEl) {
        if (data.tasks.length === 0) {
            taskEl.innerHTML = '<div class="hp-empty">Sin tareas asignadas</div>';
        } else {
            taskEl.innerHTML = data.tasks.map(t => {
                const label = t.ai_summary || (t.text || '').substring(0, 60);
                const priorityClass = t.priority === 'alta' ? 'hp-priority-alta' : (t.priority === 'media' ? 'hp-priority-media' : 'hp-priority-baja');
                const deadline = t.fecha_limite ? `<span class="hp-deadline">${new Date(t.fecha_limite).toLocaleDateString('es-CL')}</span>` : '';
                return `<div class="hp-task-item hp-clickable ${priorityClass}" onclick="switchSection('ideas')">
                    <div class="hp-task-text">${escapeHtml(label)}</div>
                    <div class="hp-task-meta">
                        ${t.area_name ? `<span class="hp-tag">${escapeHtml(t.area_name)}</span>` : ''}
                        ${t.project_name ? `<span class="hp-tag">${escapeHtml(t.project_name)}</span>` : ''}
                        ${deadline}
                    </div>
                </div>`;
            }).join('');
        }
    }

    // Delegations
    const delEl = document.getElementById('hpDelegations');
    if (delEl) {
        if (data.delegations.length === 0) {
            delEl.innerHTML = '<div class="hp-empty">Sin delegaciones pendientes</div>';
        } else {
            delEl.innerHTML = data.delegations.map(d => {
                const days = Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000);
                return `<div class="hp-deleg-item hp-clickable" onclick="switchSection('waiting')">
                    <div class="hp-deleg-text">${escapeHtml((d.description || '').substring(0, 70))}</div>
                    <div class="hp-task-meta">
                        <span class="hp-tag">→ ${escapeHtml(d.delegated_to)}</span>
                        ${d.area_name ? `<span class="hp-tag">${escapeHtml(d.area_name)}</span>` : ''}
                        <span class="hp-days ${days > 3 ? 'hp-days-overdue' : ''}">${days}d</span>
                    </div>
                </div>`;
            }).join('');
        }
    }

    // Reuniones
    const reunEl = document.getElementById('hpReuniones');
    if (reunEl) {
        if (data.reuniones.length === 0) {
            reunEl.innerHTML = '<div class="hp-empty">Sin reuniones recientes</div>';
        } else {
            reunEl.innerHTML = data.reuniones.map(r => {
                const fecha = r.fecha ? parseLocalDate(r.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : '';
                return `<div class="hp-reunion-item hp-clickable" onclick="switchSection('reuniones')">
                    <span class="hp-reunion-date">${fecha}</span>
                    <span class="hp-reunion-title">${escapeHtml(r.titulo || 'Sin título')}</span>
                </div>`;
            }).join('');
        }
    }

    // Activity feed
    const actEl = document.getElementById('hpActivity');
    if (actEl) {
        if (data.activity.length === 0) {
            actEl.innerHTML = '<div class="hp-empty">Sin actividad reciente</div>';
        } else {
            actEl.innerHTML = data.activity.map(a => {
                const label = a.ai_summary || (a.text || '').substring(0, 50);
                const timeAgo = _timeAgo(a.created_at);
                const stageColors = { captured: '#3498db', organized: '#f39c12', distilled: '#9b59b6', expressed: '#2ecc71' };
                const stageColor = stageColors[a.code_stage] || '#888';
                return `<div class="hp-activity-item hp-clickable" onclick="switchSection('ideas')">
                    <div class="hp-activity-dot" style="background:${stageColor}"></div>
                    <div class="hp-activity-content">
                        <span class="hp-activity-text">${escapeHtml(label)}</span>
                        <span class="hp-activity-meta">${a.assigned_to ? escapeHtml(a.assigned_to) + ' · ' : ''}${a.area_name ? escapeHtml(a.area_name) + ' · ' : ''}${timeAgo}</span>
                    </div>
                </div>`;
            }).join('');
        }
    }
}

async function loadMyDashboard() {
    try {
        const res = await fetch('/api/my-dashboard');
        _renderMyDashboard(res.ok ? await res.json() : null);
    } catch (err) { console.error('My dashboard error:', err); }
}

function _timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY DIGEST WIDGET
// ═══════════════════════════════════════════════════════════════════════════════

async function loadDigestWidget() {
    const container = document.getElementById('digestWidget');
    if (!container) return;
    try {
        const res = await fetch('/api/digest/latest');
        if (!res.ok) return;
        const { digest } = await res.json();
        if (!digest) {
            container.innerHTML = `<div class="digest-empty">
                <span style="font-size:1.5rem;">📋</span>
                <p style="color:var(--text-muted);font-size:0.85rem;margin:8px 0 0;">Sin digest disponible. Se genera automaticamente cada dia a las 8 AM.</p>
            </div>`;
            return;
        }

        const date = new Date(digest.created_at).toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' });
        const via = digest.delivered_via === 'email' ? ' (enviado por email)' : '';
        const contentPreview = (digest.summary || digest.content.substring(0, 200)) + '...';

        container.innerHTML = `
            <div class="digest-card">
                <div class="digest-header">
                    <span class="digest-date">${date}${via}</span>
                    <button class="btn btn-sm" onclick="showFullDigest(${digest.id})" style="font-size:0.75rem;padding:3px 10px;">Ver completo</button>
                </div>
                <div class="digest-preview">${escapeHtml(contentPreview)}</div>
            </div>`;
    } catch (_) {}
}

async function showFullDigest(id) {
    try {
        const res = await fetch('/api/digest/latest');
        if (!res.ok) return;
        const { digest } = await res.json();
        if (!digest) return;

        const content = digest.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/## (.*?)(<br>|$)/g, '<h4 style="margin:12px 0 6px;color:var(--text-primary);">$1</h4>');
        const modal = document.getElementById('genericModal') || createGenericModal();
        modal.querySelector('.modal-title').textContent = 'Digest del Dia';
        modal.querySelector('.modal-body').innerHTML = `<div style="font-size:0.9rem;line-height:1.7;color:var(--text-secondary);">${content}</div>`;
        modal.style.display = 'flex';
    } catch (_) {}
}

function createGenericModal() {
    const modal = document.createElement('div');
    modal.id = 'genericModal';
    modal.className = 'modal';
    modal.innerHTML = `<div class="modal-content" style="max-width:700px;">
        <div class="modal-header"><h3 class="modal-title"></h3><button class="modal-close" onclick="this.closest('.modal').style.display='none'">&times;</button></div>
        <div class="modal-body" style="max-height:70vh;overflow-y:auto;"></div>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    return modal;
}

async function triggerDigestManual() {
    try {
        const res = await fetch('/api/digest/trigger', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        showToast(data.message || 'Digest disparado', 'success');
    } catch (err) {
        showToast('Error', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENTS (Deep Research & Weekly Review)
// ═══════════════════════════════════════════════════════════════════════════════
function initAgents() {
    const btnResearch = document.getElementById('btnDeepResearch');
    const btnReview = document.getElementById('btnWeeklyReview');
    const modal = document.getElementById('agentModal');
    const closeModal = document.getElementById('closeAgentModal');

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => modal.style.display = 'none');
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    if (btnResearch) {
        btnResearch.addEventListener('click', async () => {
            const query = await showCustomModal({
                title: '🕵️ Deep Research Agent',
                message: '¿Qué tema complejo quieres investigar?',
                inputPlaceholder: 'Ej: Impacto de la IA en la logística...'
            });

            if (!query) return;

            showAgentResult('🕵️ Deep Research Agent', 'Iniciando investigación profunda... esto puede tomar unos segundos.');

            try {
                const res = await fetch('/api/ai/research', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query })
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);

                showAgentResult('🕵️ Reporte de Investigación', renderMarkdown(data.response));
            } catch (err) {
                showAgentResult('❌ Error', `Falló la investigación: ${err.message}`);
            }
        });
    }

    if (btnReview) {
        btnReview.addEventListener('click', async () => {
            const confirmed = await showCustomModal({
                title: '📅 Weekly Review',
                message: '¿Iniciar análisis semanal de tus notas y proyectos recientes?',
                isConfirm: true
            });

            if (!confirmed) return;

            showAgentResult('📅 Weekly Review Agent', 'Analizando tus ideas y contexto... por favor espera.');

            try {
                const res = await fetch('/api/ai/review', { method: 'POST' });
                const data = await res.json();
                if (data.error) throw new Error(data.error);

                let reviewHtml = renderMarkdown(data.response);
                // Show stale ideas that should be archived
                if (data.stale_ideas && data.stale_ideas.length > 0) {
                    reviewHtml += `<hr style="margin:1.5rem 0;border-color:rgba(255,255,255,0.1);">`;
                    reviewHtml += `<h3>📦 Ideas estancadas (${data.stale_ideas.length})</h3>`;
                    reviewHtml += `<p style="opacity:0.7;font-size:0.85rem;">Estas ideas llevan +14 dias sin avanzar. Considera archivarlas o reactivarlas:</p>`;
                    reviewHtml += `<ul style="list-style:none;padding:0;">`;
                    data.stale_ideas.forEach(s => {
                        reviewHtml += `<li style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                            <span style="opacity:0.5;font-size:0.75rem;">${s.code_stage}</span>
                            ${escapeHtml(s.ai_summary || s.text)}
                        </li>`;
                    });
                    reviewHtml += `</ul>`;
                }
                showAgentResult('📅 Plan Semanal', reviewHtml);
            } catch (err) {
                showAgentResult('❌ Error', `Falló la revisión: ${err.message}`);
            }
        });
    }
}

function showAgentResult(title, contentHtml) {
    const modal = document.getElementById('agentModal');
    const titleEl = document.getElementById('agentModalTitle');
    const contentEl = document.getElementById('agentModalContent');

    if (modal && titleEl && contentEl) {
        titleEl.textContent = title;
        contentEl.innerHTML = safeHTML(contentHtml);
        modal.style.display = 'flex';
    }
}

// ── Security: Sanitize HTML before injecting into DOM ─────────────────────
function safeHTML(dirty) {
    if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(dirty, {
            ALLOWED_TAGS: ['h1','h2','h3','h4','b','i','em','strong','ul','ol','li','br','p','pre','code','a','span','div','table','thead','tbody','tr','th','td','hr','blockquote'],
            ALLOWED_ATTR: ['href','target','class','style'],
        });
    }
    // Fallback: strip all tags
    const div = document.createElement('div');
    div.textContent = dirty;
    return div.innerHTML;
}

function renderMarkdown(text) {
    if (!text) return '';
    // Escape HTML entities first to prevent injection
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    // Parse tables BEFORE other transforms (work on lines)
    const lines = escaped.split('\n');
    const processed = [];
    let i = 0;
    while (i < lines.length) {
        // Detect table: line with | and next line is separator (|---|)
        if (lines[i].trim().startsWith('|') && lines[i].includes('|')) {
            const tableLines = [];
            while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
                tableLines.push(lines[i].trim());
                i++;
            }
            if (tableLines.length >= 2) {
                let tableHtml = '<table class="md-table">';
                tableLines.forEach((tl, idx) => {
                    // Skip separator row (| --- | --- |)
                    if (/^\|[\s\-:]+\|/.test(tl.replace(/\|[\s\-:]+/g, '|--'))) {
                        if (idx === 1) return; // standard separator after header
                        return;
                    }
                    const cells = tl.split('|').filter((c, ci, arr) => ci > 0 && ci < arr.length - 1);
                    const tag = idx === 0 ? 'th' : 'td';
                    tableHtml += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
                });
                tableHtml += '</table>';
                processed.push(tableHtml);
            } else {
                processed.push(...tableLines);
            }
        } else {
            processed.push(lines[i]);
            i++;
        }
    }

    // Basic Markdown parser for the agent response
    const html = processed.join('\n')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*?)\*/gim, '<i>$1</i>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/^\s*[-*]\s(.*?)$/gim, '<li>$1</li>')
        .replace(/<\/li>\n<li>/gim, '</li><li>')
        .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
        .replace(/\n/gim, '<br>');
    return safeHTML(html);
}

// ═══════════════════════════════════════════════════════════════════════════════
// THEME TOGGLE (dark ↔ light)
// ═══════════════════════════════════════════════════════════════════════════════
function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!btn || !icon) return;

    // Load saved preference
    const saved = localStorage.getItem('vsc-theme');
    if (saved === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        icon.textContent = '☀️';
    }

    btn.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            document.documentElement.removeAttribute('data-theme');
            icon.textContent = '🌙';
            localStorage.setItem('vsc-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            icon.textContent = '☀️';
            localStorage.setItem('vsc-theme', 'light');
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS (segmented: interno / cliente, with filters + edit)
// ═══════════════════════════════════════════════════════════════════════════════
let allProjects = [];
let projectAreas = [];

async function initProjects() {
    const toggleBtn = document.getElementById('toggleAddProject');
    const addBody = document.getElementById('addProjectBody');
    const addForm = document.getElementById('addProjectForm');
    const searchInput = document.getElementById('projectSearch');
    const projType = document.getElementById('projType');
    const clientFields = document.getElementById('apfClientFields');
    const projAreaSelect = document.getElementById('projArea');

    // Load areas for the select
    try {
        const aRes = await fetch('/api/areas');
        if (aRes.ok) {
            projectAreas = await aRes.json();
            if (projAreaSelect) {
                projAreaSelect.innerHTML = '<option value="">— Sin área —</option>' +
                    projectAreas.map(a => `<option value="${a.id}">${escapeHtml(a.name)}</option>`).join('');
            }
        }
    } catch (_) { /* areas optional */ }

    // Toggle panel
    if (toggleBtn && addBody) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = addBody.style.display === 'none';
            addBody.style.display = isHidden ? 'block' : 'none';
            toggleBtn.textContent = isHidden ? 'Ocultar ↑' : 'Mostrar ↓';
        });
    }

    // Toggle client fields based on type
    if (projType && clientFields) {
        projType.addEventListener('change', () => {
            clientFields.style.display = projType.value === 'cliente' ? 'flex' : 'none';
        });
    }

    // Submit new project
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const techRaw = document.getElementById('projTech')?.value || '';
            const project = {
                name: document.getElementById('projName').value,
                url: document.getElementById('projUrl')?.value || '',
                description: document.getElementById('projDesc')?.value || '',
                icon: document.getElementById('projIcon')?.value || '📦',
                status: document.getElementById('projStatus')?.value || 'active',
                tech: techRaw.split(',').map(t => t.trim()).filter(t => t),
                project_type: projType?.value || 'interno',
                client_name: document.getElementById('projClientName')?.value || '',
                geography: document.getElementById('projGeography')?.value || '',
                related_area_id: document.getElementById('projArea')?.value || null,
                horizon: document.getElementById('projHorizon')?.value || '',
                deadline: document.getElementById('projDeadline')?.value || ''
            };

            try {
                const res = await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(project)
                });
                if (res.ok) {
                    addForm.reset();
                    if (clientFields) clientFields.style.display = 'none';
                    loadProjects();
                    initHomeData();
                }
            } catch (err) { console.error('Save project error:', err); }
        });
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', () => filterAndRenderProjects());
    }

    // Type filters (Todos / Internos / Clientes)
    document.querySelectorAll('[data-ptypefilter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-ptypefilter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAndRenderProjects();
        });
    });

    // Status filters
    document.querySelectorAll('[data-pfilter]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-pfilter]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterAndRenderProjects();
        });
    });

    await loadProjects();
}

async function loadProjects() {
    try {
        const res = await fetch('/api/projects');
        allProjects = await res.json();
        updateProjectStats();
        filterAndRenderProjects();
    } catch (err) {
        console.error('Load projects error:', err);
    }
}

function updateProjectStats() {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const active = allProjects.filter(p => p.status === 'active').length;
    const dev = allProjects.filter(p => ['development', 'beta'].includes(p.status)).length;
    const completed = allProjects.filter(p => p.status === 'completed').length;
    const paused = allProjects.filter(p => p.status === 'paused').length;
    const now = new Date().toISOString().slice(0, 10);
    const overdue = allProjects.filter(p => p.deadline && p.deadline < now && !['completed', 'cancelled'].includes(p.status)).length;
    set('projStatActive', active);
    set('projStatDev', dev);
    set('projStatCompleted', completed);
    set('projStatPaused', paused);
    set('projStatOverdue', overdue);

    // Executive summary
    const total = allProjects.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    set('projExecRate', rate + '%');
    const bar = document.getElementById('projExecBar');
    if (bar) bar.style.width = rate + '%';
    set('projExecInternal', allProjects.filter(p => (p.project_type || 'interno') === 'interno').length);
    set('projExecClient', allProjects.filter(p => p.project_type === 'cliente').length);
    set('projExecWithDeadline', allProjects.filter(p => p.deadline).length);
}

function filterAndRenderProjects() {
    const query = (document.getElementById('projectSearch')?.value || '').toLowerCase().trim();
    const statusFilter = document.querySelector('[data-pfilter].active')?.dataset.pfilter || 'all';
    const typeFilter = document.querySelector('[data-ptypefilter].active')?.dataset.ptypefilter || 'all';

    let filtered = allProjects;

    // Type filter
    if (typeFilter !== 'all') {
        filtered = filtered.filter(p => (p.project_type || 'interno') === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Text search
    if (query) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.description || '').toLowerCase().includes(query) ||
            (p.tech || []).some(t => t.toLowerCase().includes(query)) ||
            (p.client_name || '').toLowerCase().includes(query) ||
            (p.area_name || '').toLowerCase().includes(query) ||
            (p.geography || '').toLowerCase().includes(query)
        );
    }

    renderProjects(filtered, typeFilter);
}

const STATUS_MAP = {
    active: { label: '● Activo', cls: 'active' },
    beta: { label: '● Beta', cls: 'beta' },
    development: { label: '● En Desarrollo', cls: 'development' },
    paused: { label: '● Pausado', cls: 'paused' },
    completed: { label: '● Completado', cls: 'completed' },
    review: { label: '● En Revisión', cls: 'review' },
    cancelled: { label: '● Cancelado', cls: 'cancelled' }
};

const HORIZON_MAP = { corto: 'Corto plazo', medio: 'Medio plazo', largo: 'Largo plazo' };

function renderProjectCard(p) {
    const st = STATUS_MAP[p.status] || STATUS_MAP.active;
    const techHtml = (p.tech || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
    const isCliente = (p.project_type || 'interno') === 'cliente';

    // Build meta tags
    let metaHtml = '';
    const metaItems = [];
    if (p.area_name) metaItems.push(`<span class="proj-meta-item">${escapeHtml(p.area_name)}</span>`);
    if (isCliente && p.client_name) metaItems.push(`<span class="proj-meta-item proj-meta-client">${escapeHtml(p.client_name)}</span>`);
    if (p.geography) metaItems.push(`<span class="proj-meta-item">${escapeHtml(p.geography)}</span>`);
    if (p.horizon && HORIZON_MAP[p.horizon]) metaItems.push(`<span class="proj-meta-item">${HORIZON_MAP[p.horizon]}</span>`);
    if (p.deadline) metaItems.push(`<span class="proj-meta-item proj-meta-deadline">${escapeHtml(p.deadline)}</span>`);
    if (metaItems.length) metaHtml = `<div class="proj-meta">${metaItems.join('')}</div>`;

    const urlBtn = p.url ? `<a href="${escapeHtml(p.url)}" target="_blank" class="btn btn-sm">Abrir ↗</a>` : '';

    return `
        <div class="project-card ${isCliente ? 'project-card--cliente' : ''}">
            <div class="project-card-top">
                <div class="project-icon-lg">${p.icon || '📦'}</div>
                <div style="display:flex;gap:6px;align-items:center;">
                    <span class="badge ${st.cls}">${st.label}</span>
                    <button class="proj-edit-btn" onclick="openEditProject('${p.id}')" title="Editar">✏️</button>
                </div>
            </div>
            <h3>${escapeHtml(p.name)}</h3>
            <p>${escapeHtml(p.description || 'Sin descripción')}</p>
            ${metaHtml}
            <div class="project-tech">${techHtml || '<span class="tech-tag dim">—</span>'}</div>
            <div class="project-footer">
                ${urlBtn}
                <button class="project-delete-btn" onclick="deleteProject('${p.id}')" title="Eliminar proyecto">🗑</button>
            </div>
        </div>
    `;
}

function renderProjects(projects, typeFilter) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    if (projects.length === 0) {
        grid.innerHTML = `<div class="archivos-empty"><div class="empty-icon">🚀</div><p>No se encontraron proyectos</p></div>`;
        return;
    }

    // If a specific type is selected, render flat grid
    if (typeFilter && typeFilter !== 'all') {
        grid.innerHTML = `<div class="proj-segment-grid">${projects.map(renderProjectCard).join('')}</div>`;
        return;
    }

    // Segmented view: Internos first, then Clientes
    const internos = projects.filter(p => (p.project_type || 'interno') === 'interno');
    const clientes = projects.filter(p => (p.project_type || 'interno') === 'cliente');

    let html = '';
    if (internos.length) {
        html += `
            <div class="proj-segment-header">
                <span class="proj-segment-title">Proyectos Internos</span>
                <span class="proj-segment-count">${internos.length}</span>
            </div>
            <div class="proj-segment-grid">${internos.map(renderProjectCard).join('')}</div>
        `;
    }
    if (clientes.length) {
        html += `
            <div class="proj-segment-header">
                <span class="proj-segment-title">Proyectos de Clientes</span>
                <span class="proj-segment-count">${clientes.length}</span>
            </div>
            <div class="proj-segment-grid">${clientes.map(renderProjectCard).join('')}</div>
        `;
    }
    grid.innerHTML = html;
}

async function openEditProject(id) {
    const p = allProjects.find(proj => proj.id === id);
    if (!p) return;

    const isCliente = (p.project_type || 'interno') === 'cliente';
    const areasOptions = projectAreas.map(a =>
        `<option value="${a.id}" ${a.id == p.related_area_id ? 'selected' : ''}>${escapeHtml(a.name)}</option>`
    ).join('');

    const horizonOptions = ['', 'corto', 'medio', 'largo'].map(h => {
        const label = h ? HORIZON_MAP[h] : '— Sin definir —';
        return `<option value="${h}" ${(p.horizon || '') === h ? 'selected' : ''}>${label}</option>`;
    }).join('');

    const statusOptions = Object.entries(STATUS_MAP).map(([val, s]) =>
        `<option value="${val}" ${p.status === val ? 'selected' : ''}>${s.label}</option>`
    ).join('');

    const formHtml = `
        <form id="editProjectForm" class="add-project-form" style="padding:0;">
            <div class="apf-row">
                <div class="apf-field">
                    <label>Tipo</label>
                    <select id="editProjType">
                        <option value="interno" ${!isCliente ? 'selected' : ''}>Interno</option>
                        <option value="cliente" ${isCliente ? 'selected' : ''}>Cliente</option>
                    </select>
                </div>
                <div class="apf-field">
                    <label>Estado</label>
                    <select id="editProjStatus">${statusOptions}</select>
                </div>
                <div class="apf-field">
                    <label>Icono</label>
                    <input type="text" id="editProjIcon" value="${p.icon || ''}" maxlength="4">
                </div>
            </div>
            <div class="apf-row">
                <div class="apf-field">
                    <label>Nombre *</label>
                    <input type="text" id="editProjName" value="${escapeHtml(p.name)}" required>
                </div>
                <div class="apf-field">
                    <label>URL</label>
                    <input type="url" id="editProjUrl" value="${escapeHtml(p.url || '')}">
                </div>
            </div>
            <div class="apf-row">
                <div class="apf-field apf-wide">
                    <label>Descripción</label>
                    <input type="text" id="editProjDesc" value="${escapeHtml(p.description || '')}">
                </div>
            </div>
            <div class="apf-row" id="editClientFields" style="display:${isCliente ? 'flex' : 'none'};">
                <div class="apf-field">
                    <label>Cliente</label>
                    <input type="text" id="editProjClient" value="${escapeHtml(p.client_name || '')}">
                </div>
                <div class="apf-field">
                    <label>Geografía</label>
                    <input type="text" id="editProjGeo" value="${escapeHtml(p.geography || '')}">
                </div>
            </div>
            <div class="apf-row">
                <div class="apf-field">
                    <label>Área</label>
                    <select id="editProjArea"><option value="">— Sin área —</option>${areasOptions}</select>
                </div>
                <div class="apf-field">
                    <label>Horizonte</label>
                    <select id="editProjHorizon">${horizonOptions}</select>
                </div>
                <div class="apf-field">
                    <label>Deadline</label>
                    <input type="date" id="editProjDeadline" value="${p.deadline || ''}">
                </div>
            </div>
            <div class="apf-row">
                <div class="apf-field apf-wide">
                    <label>Tecnologías</label>
                    <input type="text" id="editProjTech" value="${escapeHtml((p.tech || []).join(', '))}">
                </div>
            </div>
        </form>
    `;

    const result = await showCustomModal({
        title: `Editar: ${p.name}`,
        message: formHtml,
        isConfirm: true,
        html: true,
        onOpen: () => {
            // Toggle client fields in modal
            const editType = document.getElementById('editProjType');
            const editClientFields = document.getElementById('editClientFields');
            if (editType && editClientFields) {
                editType.addEventListener('change', () => {
                    editClientFields.style.display = editType.value === 'cliente' ? 'flex' : 'none';
                });
            }
        }
    });

    if (!result) return;

    const techRaw = document.getElementById('editProjTech')?.value || '';
    const updated = {
        name: document.getElementById('editProjName')?.value,
        url: document.getElementById('editProjUrl')?.value || '',
        description: document.getElementById('editProjDesc')?.value || '',
        icon: document.getElementById('editProjIcon')?.value || '📦',
        status: document.getElementById('editProjStatus')?.value || 'active',
        tech: techRaw.split(',').map(t => t.trim()).filter(t => t),
        project_type: document.getElementById('editProjType')?.value || 'interno',
        client_name: document.getElementById('editProjClient')?.value || '',
        geography: document.getElementById('editProjGeo')?.value || '',
        related_area_id: document.getElementById('editProjArea')?.value || null,
        horizon: document.getElementById('editProjHorizon')?.value || '',
        deadline: document.getElementById('editProjDeadline')?.value || ''
    };

    try {
        const res = await fetch(`/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        if (res.ok) {
            loadProjects();
            initHomeData();
        }
    } catch (err) { console.error('Edit project error:', err); }
}
window.openEditProject = openEditProject;

async function deleteProject(id) {
    const confirmed = await showCustomModal({
        title: 'Borrar Proyecto',
        message: '¿Seguro que quieres eliminar este proyecto?',
        isConfirm: true
    });
    if (!confirmed) return;
    try {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        loadProjects();
        initHomeData();
    } catch (err) { console.error('Delete project error:', err); }
}
window.deleteProject = deleteProject;

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHIVOS (with tags)
// ═══════════════════════════════════════════════════════════════════════════════
let allArchivos = [];
let activeTagFilter = null;

async function initArchivos() {
    const grid = document.getElementById('archivosGrid');
    const searchInput = document.getElementById('searchInput');
    const statEl = document.getElementById('statArchivos');

    try {
        const response = await fetch('/api/archivos');
        allArchivos = await response.json();
        if (statEl) statEl.textContent = allArchivos.length;

        // Populate filter chip counts
        const counts = { all: allArchivos.length, markdown: 0, pdf: 0, app: 0, other: 0 };
        allArchivos.forEach(f => { if (counts[f.type] !== undefined) counts[f.type]++; else counts.other++; });
        const setCount = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        setCount('archCountAll', counts.all);
        setCount('archCountMd', counts.markdown);
        setCount('archCountPdf', counts.pdf);
        setCount('archCountApp', counts.app);
        setCount('archCountOther', counts.other);

        renderArchivos(allArchivos);
        renderTagFilterBar(allArchivos);

        if (searchInput) searchInput.addEventListener('input', () => filterAndRender());

        // Filter chips (reuse skill-filter-chip class)
        const filterChips = document.querySelectorAll('#archivosFilterChips .skill-filter-chip');
        filterChips.forEach(btn => {
            btn.addEventListener('click', () => {
                filterChips.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                filterAndRender();
            });
        });
    } catch (err) {
        console.error('Error loading archivos:', err);
        if (grid) grid.innerHTML = `<div class="archivos-empty"><div class="empty-icon">⚠️</div><p>Error al cargar documentos</p></div>`;
    }
}

function renderTagFilterBar(files) {
    const bar = document.getElementById('tagFilterBar');
    if (!bar) return;
    const allTags = new Set();
    files.forEach(f => (f.tags || []).forEach(t => allTags.add(t)));
    if (allTags.size === 0) { bar.style.display = 'none'; return; }

    bar.style.display = 'flex';
    bar.innerHTML = `<span class="tag-filter-label">Tags:</span>` +
        Array.from(allTags).map(tag =>
            `<button class="tag-filter-btn${activeTagFilter === tag ? ' active' : ''}" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`
        ).join('') +
        (activeTagFilter ? `<button class="tag-filter-clear" id="clearTagFilter">✕ Limpiar</button>` : '');

    bar.querySelectorAll('.tag-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            activeTagFilter = activeTagFilter === btn.dataset.tag ? null : btn.dataset.tag;
            renderTagFilterBar(allArchivos);
            filterAndRender();
        });
    });
    const clearBtn = bar.querySelector('#clearTagFilter');
    if (clearBtn) clearBtn.addEventListener('click', () => {
        activeTagFilter = null;
        renderTagFilterBar(allArchivos);
        filterAndRender();
    });
}

function filterAndRender() {
    const query = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const activeChip = document.querySelector('#archivosFilterChips .skill-filter-chip.active');
    const type = activeChip ? activeChip.dataset.filter : 'all';
    let filtered = [...allArchivos];

    // Text search
    if (query) {
        filtered = filtered.filter(f =>
            f.name.toLowerCase().includes(query) || f.basename.toLowerCase().includes(query) ||
            (f.tags || []).some(t => t.toLowerCase().includes(query))
        );
    }

    // Type filters
    if (type === 'recent') {
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        filtered = filtered.filter(f => new Date(f.modified).getTime() > sevenDaysAgo);
    } else if (type === 'large') {
        filtered = filtered.filter(f => f.size > 500 * 1024); // > 500KB
    } else if (type === 'other') {
        filtered = filtered.filter(f => f.type !== 'markdown' && f.type !== 'pdf' && f.type !== 'app');
    } else if (type !== 'all') {
        filtered = filtered.filter(f => f.type === type);
    }

    // Tag filter
    if (activeTagFilter) filtered = filtered.filter(f => (f.tags || []).includes(activeTagFilter));

    // Sorting
    const sort = document.getElementById('archSortSelect')?.value || 'date';
    switch (sort) {
        case 'name':      filtered.sort((a, b) => a.basename.localeCompare(b.basename)); break;
        case 'name-desc': filtered.sort((a, b) => b.basename.localeCompare(a.basename)); break;
        case 'date':      filtered.sort((a, b) => new Date(b.modified) - new Date(a.modified)); break;
        case 'date-asc':  filtered.sort((a, b) => new Date(a.modified) - new Date(b.modified)); break;
        case 'size':      filtered.sort((a, b) => b.size - a.size); break;
        case 'size-asc':  filtered.sort((a, b) => a.size - b.size); break;
    }

    renderArchivos(filtered);
}

function renderArchivos(files) {
    const grid = document.getElementById('archivosGrid');
    if (!grid) return;

    const summary = document.getElementById('archivosSummary');
    if (summary) {
        summary.innerHTML = `Mostrando <strong>${files.length}</strong> de ${allArchivos.length} documentos`;
    }

    if (files.length === 0) {
        grid.innerHTML = `<div class="archivos-empty"><div class="empty-icon">📂</div><p>No se encontraron documentos</p></div>`;
        return;
    }

    const typeConfig = {
        markdown: { icon: '📝', label: 'Markdown', color: '#27ae60', abbr: 'MD' },
        pdf:      { icon: '📕', label: 'PDF Document', color: '#e74c3c', abbr: 'PDF' },
        app:      { icon: '🚀', label: 'Guia Interactiva', color: '#9b59b6', abbr: 'APP' },
        other:    { icon: '📄', label: 'Documento', color: '#3498db', abbr: 'TXT' }
    };

    grid.innerHTML = files.map(file => {
        const cfg = typeConfig[file.type] || typeConfig.other;
        const typeClass = file.type === 'markdown' ? 'md' : file.type === 'pdf' ? 'pdf' : file.type === 'app' ? 'app' : 'other';
        // APP type or files with dynamic page: open the interactive version
        const isApp = file.type === 'app';
        const href = (isApp || file.hasDynamic) ? file.dynamicUrl : `/archivo/${encodeURIComponent(file.name)}`;
        const tagsHtml = (file.tags || []).length > 0
            ? `<div class="arc-tags">${file.tags.map(t => `<span class="arc-tag">#${escapeHtml(t)}</span>`).join('')}</div>`
            : '';
        const downloadBtn = file.type === 'pdf'
            ? `<a href="/descargar/${encodeURIComponent(file.name)}" class="arc-action arc-download" title="Descargar PDF" onclick="event.stopPropagation();">Descargar</a>`
            : '';
        // For MD/PDF that have a linked interactive guide, show an extra button
        const interactiveBtn = file.hasDynamic && !isApp
            ? `<a href="${file.dynamicUrl}" class="arc-action arc-download" target="_blank" title="Ver guía interactiva" onclick="event.stopPropagation();">Interactivo</a>`
            : '';
        const dynamicBadge = file.hasDynamic && !isApp ? `<span class="arc-interactive-badge">Interactivo</span>` : '';
        const canDelete = window.__USER__?.role === 'admin' || window.__USER__?.role === 'ceo' || window.__USER__?.role === 'manager';
        const deleteBtn = canDelete && !isApp
            ? `<button class="arc-delete" title="Eliminar" onclick="event.stopPropagation(); deleteArchivo('${escapeHtml(file.name)}')">✕</button>`
            : '';

        return `
            <div class="arc-card arc-${typeClass}">
                ${deleteBtn}
                <div class="arc-header">
                    <span class="arc-type-label">${cfg.abbr}</span>
                    <span class="arc-size">${file.sizeFormatted}</span>
                </div>
                <div class="arc-body">
                    <div class="arc-icon">${cfg.icon}</div>
                    <h4 class="arc-title" title="${escapeHtml(file.name)}">${escapeHtml(file.basename)}</h4>
                    <p class="arc-desc">${cfg.label} ${dynamicBadge}</p>
                    ${tagsHtml}
                </div>
                <div class="arc-footer">
                    <a href="${href}" class="arc-action arc-view" ${(isApp || file.hasDynamic) ? 'target="_blank"' : ''}>Abrir</a>
                    ${file.hasDynamic && !isApp ? `<a href="/archivo/${encodeURIComponent(file.name)}" class="arc-action arc-download" title="Ver archivo original">Original</a>` : ''}
                    ${downloadBtn}
                </div>
            </div>
        `;
    }).join('');
}

async function deleteArchivo(filename) {
    if (!confirm(`¿Eliminar "${filename}"? Esta acción no se puede deshacer.`)) return;
    try {
        const res = await fetch(`/api/archivo/${encodeURIComponent(filename)}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('Archivo eliminado', 'success');
            initArchivos();
        } else {
            showToast(data.error || 'Error al eliminar', 'error');
        }
    } catch {
        showToast('Error al eliminar archivo', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE UPLOAD
// ═══════════════════════════════════════════════════════════════════════════════
function initUpload() {
    const toggleBtn = document.getElementById('toggleUpload');
    const uploadBody = document.getElementById('uploadBody');
    const uploadForm = document.getElementById('uploadForm');
    const uploadFile = document.getElementById('uploadFile');
    const uploadBrowse = document.getElementById('uploadBrowse');
    const dropzone = document.getElementById('uploadDropzone');
    const dropzoneSelected = document.getElementById('dropzoneSelected');
    const dropzoneContent = dropzone?.querySelector('.dropzone-content');
    const selectedFileName = document.getElementById('selectedFileName');
    const clearFile = document.getElementById('clearFile');
    const btnUpload = document.getElementById('btnUpload');
    if (!toggleBtn || !uploadBody) return;

    toggleBtn.addEventListener('click', () => {
        const isHidden = uploadBody.style.display === 'none';
        uploadBody.style.display = isHidden ? 'block' : 'none';
        toggleBtn.textContent = isHidden ? 'Ocultar ↑' : 'Mostrar ↓';
    });
    if (uploadBrowse) uploadBrowse.addEventListener('click', () => uploadFile.click());
    if (uploadFile) uploadFile.addEventListener('change', () => {
        if (uploadFile.files.length > 0) showSelectedFile(uploadFile.files[0].name);
    });

    if (dropzone) {
        ['dragenter', 'dragover'].forEach(evt => {
            dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.add('dragover'); });
        });
        ['dragleave', 'drop'].forEach(evt => {
            dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.remove('dragover'); });
        });
        dropzone.addEventListener('drop', e => {
            if (e.dataTransfer.files.length > 0) {
                uploadFile.files = e.dataTransfer.files;
                showSelectedFile(e.dataTransfer.files[0].name);
            }
        });
    }

    function showSelectedFile(name) {
        if (dropzoneContent) dropzoneContent.style.display = 'none';
        if (dropzoneSelected) dropzoneSelected.style.display = 'flex';
        if (selectedFileName) selectedFileName.textContent = name;
        if (btnUpload) btnUpload.disabled = false;
    }

    if (clearFile) clearFile.addEventListener('click', () => {
        uploadFile.value = '';
        if (dropzoneContent) dropzoneContent.style.display = 'flex';
        if (dropzoneSelected) dropzoneSelected.style.display = 'none';
        if (btnUpload) btnUpload.disabled = true;
    });

    if (uploadForm) uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!uploadFile.files.length) return;
        btnUpload.disabled = true;
        btnUpload.textContent = 'Subiendo...';

        const formData = new FormData();
        formData.append('file', uploadFile.files[0]);
        formData.append('tags', document.getElementById('uploadTags')?.value || '');

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
                uploadFile.value = '';
                document.getElementById('uploadTags').value = '';
                if (dropzoneContent) dropzoneContent.style.display = 'flex';
                if (dropzoneSelected) dropzoneSelected.style.display = 'none';
                btnUpload.textContent = '✓ Subido!';
                setTimeout(() => { btnUpload.textContent = 'Subir Archivo ↑'; }, 2000);
                initArchivos();
                initHomeData();
            } else {
                let msg = 'Error al subir archivo';
                try { const data = await res.json(); msg = data.error || msg; } catch (_) {}
                showToast(msg, 'error');
                btnUpload.textContent = 'Subir Archivo ↑';
            }
        } catch (err) {
            console.error('Upload error:', err);
            showToast('Error de conexión al subir archivo', 'error');
            btnUpload.textContent = 'Subir Archivo ↑';
        }
        btnUpload.disabled = false;
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// IDEAS (text + voice) — FIXED mic handling
// ═══════════════════════════════════════════════════════════════════════════════
let recognition = null;
let isRecording = false;
let micAvailable = false;

function initSpeechRecognition() {
    const btnMic = document.getElementById('btnMic');
    if (!btnMic) return;

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        micAvailable = true;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isRecording = true;
            btnMic.classList.add('recording');
            document.getElementById('micStatus').textContent = '🔴 Escuchando...';
        };

        recognition.onend = () => {
            isRecording = false;
            btnMic.classList.remove('recording');
            document.getElementById('micStatus').textContent = '';
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const textarea = document.getElementById('ideaTextarea');
            if (textarea) {
                textarea.value += (textarea.value ? ' ' : '') + transcript;
                textarea.focus();
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech error:', event.error);
            isRecording = false;
            btnMic.classList.remove('recording');
            document.getElementById('micStatus').textContent = '❌ Error';
        };

        btnMic.addEventListener('click', () => {
            if (recordingMode === 'audio') return; // Handled by other listeners
            if (isRecording) recognition.stop();
            else recognition.start();
        });
    } else {
        btnMic.style.display = 'none';
        console.warn('Speech Recognition not supported');
    }
}

function initIdeas() {
    // 1. Attach Event Listeners (Priority)
    try {
        // Idea Filters
        const filters = document.querySelectorAll('[data-ifilter]');
        if (filters.length > 0) {
            filters.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent default link behavior if any
                    document.querySelectorAll('[data-ifilter]').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    loadIdeas(btn.dataset.ifilter);
                });
            });
        }

        // Save Button
        const btnSave = document.getElementById('btnSaveIdea');
        if (btnSave) btnSave.addEventListener('click', saveIdea);

        // Textarea Shortcut
        const textarea = document.getElementById('ideaTextarea');
        if (textarea) textarea.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'Enter') saveIdea();
        });

    } catch (err) {
        console.error('Error attaching idea listeners:', err);
    }

    // 2. Initialize Components
    try {
        loadIdeas();
    } catch (err) { console.error('Error loading ideas:', err); }

    try {
        initSpeechRecognition();
    } catch (err) { console.error('Error init speech:', err); }


    // Delete All (Admin)
    const btnDeleteAll = document.getElementById('btnDeleteAllIdeas');
    if (btnDeleteAll) {
        btnDeleteAll.addEventListener('click', async () => {
            const firstCheck = await showCustomModal({
                title: '⚠️ ZONA DE PELIGRO',
                message: '¿Estás seguro de que quieres borrar TODAS las ideas? Esta acción no se puede deshacer.',
                isConfirm: true
            });

            if (!firstCheck) return;

            const secondCheck = await showCustomModal({
                title: 'Confirmación Final',
                message: 'Para confirmar, escribe "BORRAR TODO" en el campo de abajo:',
                inputPlaceholder: 'BORRAR TODO'
            });

            if (secondCheck !== 'BORRAR TODO') {
                return showToast('Acción cancelada: Texto incorrecto', 'error');
            }

            try {
                const res = await fetch('/api/ideas', { method: 'DELETE' });
                const data = await res.json();
                if (res.ok) {
                    showToast(data.message, 'success');
                    loadIdeas();
                    initHomeData();
                } else {
                    showToast('Error: ' + data.error, 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Error de conexión', 'error');
            }
        });
    }
}

// ... existing speech functions ...

let currentIdeasPage = 1;
let currentIdeasFilter = 'all';

async function loadIdeas(filter = null, page = null) {
    if (filter !== null) currentIdeasFilter = filter;
    if (page !== null) currentIdeasPage = page;
    const list = document.getElementById('ideasList');
    const countEl = document.getElementById('ideasCount');
    if (!list) return;
    try {
        let url = `/api/ideas?page=${currentIdeasPage}&limit=30`;
        if (['captured', 'organized', 'distilled', 'expressed'].includes(currentIdeasFilter)) {
            url += `&code_stage=${currentIdeasFilter}`;
        }
        if (currentIdeasFilter === 'projects') {
            url += '&is_project=1';
        }
        if (currentIdeasFilter === 'next-actions') {
            url += '&completada=0';
        }
        // GTD dropdown filters
        const fCtx = document.getElementById('filterContexto');
        const fEn = document.getElementById('filterEnergia');
        const fComp = document.getElementById('filterCompromiso');
        const fAssign = document.getElementById('filterAssignee');
        if (fCtx && fCtx.value) url += `&contexto=${encodeURIComponent(fCtx.value)}`;
        if (fEn && fEn.value) url += `&energia=${encodeURIComponent(fEn.value)}`;
        if (fComp && fComp.value) url += `&tipo_compromiso=${encodeURIComponent(fComp.value)}`;
        if (fAssign && fAssign.value) url += `&assigned_to=${encodeURIComponent(fAssign.value)}`;

        const res = await fetch(url);
        const data = await res.json();
        let ideas = data.ideas || data;
        const pagination = data.pagination;

        // Client-side filtering for voice (not a DB column)
        if (currentIdeasFilter === 'voice') {
            ideas = ideas.filter(i => i.audioUrl || i.type === 'voice');
        }
        // Client-side filtering for next-actions (proxima_accion flag)
        if (currentIdeasFilter === 'next-actions') {
            ideas = ideas.filter(i => i.proxima_accion == 1);
        }

        if (countEl) countEl.textContent = pagination ? pagination.total : ideas.length;

        // Update pagination controls
        if (pagination) {
            const prevBtn = document.getElementById('ideasPrevPage');
            const nextBtn = document.getElementById('ideasNextPage');
            const infoEl = document.getElementById('ideasPageInfo');
            if (prevBtn) prevBtn.disabled = pagination.page <= 1;
            if (nextBtn) nextBtn.disabled = pagination.page >= pagination.pages;
            if (infoEl) infoEl.textContent = `Pagina ${pagination.page} de ${pagination.pages}`;
        }

        if (ideas.length === 0) {
            list.innerHTML = `
                <div class="ideas-empty">
                    <div class="empty-icon">💭</div>
                    <p>No hay ideas encontradas con este filtro</p>
                </div>`;
            return;
        }

        list.innerHTML = ideas.map((idea, i) => {
            const date = new Date(idea.createdAt || idea.created_at);
            const formatted = date.toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });

            let contentHtml = `<p>${escapeHtml(idea.text)}</p>`;
            if (idea.audioUrl) {
                contentHtml += `<div class="idea-audio-player"><audio controls src="${idea.audioUrl}"></audio></div>`;
            }

            // CODE Stage indicator
            const stage = idea.code_stage || 'captured';
            const stageIcons = { captured: '📥', organized: '📂', distilled: '💎', expressed: '🚀' };
            const stageLabels = { captured: 'Capturada', organized: 'Organizada', distilled: 'Destilada', expressed: 'Expresada' };
            const stageColors = { captured: '#6b7280', organized: '#3b82f6', distilled: '#f59e0b', expressed: '#10b981' };

            // AI + PARA Tags
            let tagsHtml = '';
            if (idea.ai_type || idea.para_type) {
                const badges = [];
                if (idea.ai_type) badges.push(`<span class="badge" style="background:#3b82f6;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${escapeHtml(idea.ai_type)}</span>`);
                if (idea.ai_category) badges.push(`<span class="badge" style="background:#10b981;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${escapeHtml(idea.ai_category)}</span>`);
                if (idea.para_type) badges.push(`<span class="badge" style="background:#8b5cf6;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">PARA:${escapeHtml(idea.para_type)}</span>`);
                if (idea.assigned_to) badges.push(`<span class="badge" style="background:#f59e0b;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">👤 ${escapeHtml(idea.assigned_to)}</span>`);
                if (idea.estimated_time) badges.push(`<span class="badge" style="background:#6366f1;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">⏱ ${escapeHtml(idea.estimated_time)}</span>`);
                if (idea.priority) {
                    const pColors = { alta: '#ef4444', media: '#f59e0b', baja: '#22c55e' };
                    badges.push(`<span class="badge" style="background:${pColors[idea.priority] || '#6b7280'};color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${escapeHtml(idea.priority)}</span>`);
                }
                if (idea.created_by) {
                    badges.push(`<span class="badge" style="background:#6366f1;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">🗣 ${escapeHtml(idea.created_by)}</span>`);
                }
                // GTD Badges
                if (idea.contexto) {
                    const ctxIcons = {'@computador':'💻','@email':'📧','@telefono':'📱','@oficina':'🏢','@calle':'🚶','@casa':'🏠','@espera':'⏳','@compras':'🛒','@investigar':'🔍','@reunion':'👥','@leer':'📖'};
                    badges.push(`<span class="badge" style="background:#0891b2;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${ctxIcons[idea.contexto]||'📍'} ${escapeHtml(idea.contexto)}</span>`);
                }
                if (idea.energia) {
                    const eColors = { baja: '#22c55e', media: '#f59e0b', alta: '#ef4444' };
                    const eIcons = { baja: '🟢', media: '🟡', alta: '🔴' };
                    badges.push(`<span class="badge" style="background:${eColors[idea.energia]||'#6b7280'};color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${eIcons[idea.energia]||'⚡'} ${escapeHtml(idea.energia)}</span>`);
                }
                if (idea.tipo_compromiso) {
                    const cLabels = { comprometida: '🔒 Comprometida', esta_semana: '📅 Esta Semana', algun_dia: '💭 Algun Dia', tal_vez: '🤷 Tal Vez' };
                    badges.push(`<span class="badge" style="background:#7c3aed;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${escapeHtml(cLabels[idea.tipo_compromiso]||idea.tipo_compromiso)}</span>`);
                }
                if (idea.is_project == 1) {
                    badges.push(`<span class="badge" style="background:#dc2626;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">📂 PROYECTO</span>`);
                }
                if (idea.proxima_accion == 1) {
                    badges.push(`<span class="badge" style="background:#059669;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">🎯 Proxima Accion</span>`);
                }
                if (idea.completada == 1) {
                    badges.push(`<span class="badge" style="background:#6b7280;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">✅ Completada</span>`);
                }
                tagsHtml = `<div class="idea-tags" style="margin-top:8px; display:flex; flex-wrap:wrap; gap:4px;">${badges.join('')}</div>`;
            }

            // Distilled summary if available
            let distilledHtml = '';
            if (idea.distilled_summary) {
                distilledHtml = `<div style="margin-top:6px;padding:6px 10px;background:rgba(245,158,11,0.1);border-left:3px solid #f59e0b;border-radius:4px;font-size:0.8rem;color:var(--text-secondary);">💎 ${escapeHtml(idea.distilled_summary)}</div>`;
            }

            // Confidence badge (Bouncer)
            let confidenceHtml = '';
            if (idea.ai_confidence !== null && idea.ai_confidence !== undefined) {
                const conf = parseFloat(idea.ai_confidence);
                const confColor = conf >= 0.8 ? '#10b981' : conf >= 0.6 ? '#f59e0b' : '#ef4444';
                const confLabel = conf >= 0.8 ? 'Alta' : conf >= 0.6 ? 'Media' : 'Baja';
                confidenceHtml = `<span class="confidence-badge" style="background:${confColor};" title="Confianza IA: ${(conf*100).toFixed(0)}%">🎯 ${confLabel}</span>`;
            }

            // Needs review indicator (Bouncer)
            let reviewHtml = '';
            if (idea.needs_review) {
                reviewHtml = `<div class="needs-review-banner">⚠️ Requiere revision humana — <button class="btn-fix" onclick="openFixModal('${idea.id}', '${escapeHtml(idea.ai_type || '')}', '${escapeHtml(idea.ai_category || '')}', '${escapeHtml(idea.para_type || '')}', '${escapeHtml(idea.assigned_to || '')}', '${escapeHtml(idea.priority || '')}')">🔧 Corregir</button></div>`;
            }

            // CODE action buttons based on stage
            let actionBtns = '';
            const safeText = escapeHtml(idea.text || '').replace(/'/g, "\\'");
            const hasAgent = idea.suggested_agent && !['running', 'completed'].includes(idea.execution_status);
            const agentLabels = { staffing: 'Staffing', training: 'Training', finance: 'Finance', compliance: 'Compliance' };
            const isCompleted = idea.completada == 1;

            if (isCompleted) {
                actionBtns = `<span style="color:#22c55e;font-size:0.8rem;">✅ Completada ${idea.fecha_finalizacion ? new Date(idea.fecha_finalizacion).toLocaleDateString('es-ES') : ''}</span>
                    <button class="btn-code-action" onclick="reopenIdea('${idea.id}')" title="Reabrir tarea" style="margin-left:6px;">🔄 Reabrir</button>`;
            } else if (stage === 'captured') {
                actionBtns = `<button class="btn-code-action" onclick="processIdea('${idea.id}', '${safeText}')">⚡ Organizar</button>`;
            } else if (stage === 'organized') {
                actionBtns = `<button class="btn-code-action" onclick="distillIdea('${idea.id}')">💎 Destilar</button>`;
                if (hasAgent) {
                    actionBtns += ` <button class="btn-code-action btn-execute" onclick="openExecuteModal('${idea.id}', '${escapeHtml(idea.suggested_agent)}')">🤖 Ejecutar con ${escapeHtml(agentLabels[idea.suggested_agent] || 'Agente')}</button>`;
                }
            } else if (stage === 'distilled') {
                if (hasAgent) {
                    actionBtns = `<button class="btn-code-action btn-execute" onclick="openExecuteModal('${idea.id}', '${escapeHtml(idea.suggested_agent)}')">🤖 Ejecutar con ${escapeHtml(agentLabels[idea.suggested_agent] || 'Agente')}</button>`;
                } else {
                    actionBtns = `<button class="btn-code-action" onclick="expressIdea('${idea.id}')">🚀 Expresar</button>`;
                }
            }
            // Add complete + decompose buttons for non-completed ideas
            if (!isCompleted && stage !== 'captured') {
                actionBtns += ` <button class="btn-code-action btn-complete" onclick="completeIdea('${idea.id}')">✅</button>`;
                if (idea.is_project == 1) {
                    actionBtns += ` <button class="btn-code-action" onclick="viewSubtasks('${idea.id}')">📋 Sub-tareas</button>`;
                } else if (!idea.parent_idea_id && idea.ai_type !== 'Referencia' && idea.ai_type !== 'Nota') {
                    actionBtns += ` <button class="btn-code-action" onclick="decomposeIdea('${idea.id}')" title="Convertir en proyecto con sub-tareas">📂→</button>`;
                }
            }

            // AI Summary line (show cleaned summary prominently if different from text)
            let summaryHtml = '';
            if (idea.ai_summary && idea.ai_summary !== idea.text && stage !== 'captured') {
                summaryHtml = `<div class="idea-ai-summary">💡 ${escapeHtml(idea.ai_summary)}</div>`;
            }

            // Objetivo
            let objetivoHtml = '';
            if (idea.objetivo && stage !== 'captured') {
                objetivoHtml = `<div class="idea-objetivo">🎯 ${escapeHtml(idea.objetivo)}</div>`;
            }

            // Agent suggestion badge
            let agentBadgeHtml = '';
            if (idea.suggested_agent && stage !== 'expressed') {
                const agentInfo = { staffing: { label: 'Staffing', icon: '👷', color: '#2563eb' }, training: { label: 'Training', icon: '📚', color: '#7c3aed' }, finance: { label: 'Finance', icon: '💰', color: '#059669' }, compliance: { label: 'Compliance', icon: '📋', color: '#dc2626' } }[idea.suggested_agent] || { label: idea.suggested_agent, icon: '🤖', color: '#6b7280' };
                agentBadgeHtml = `<div class="idea-agent-badge" style="border-left-color:${agentInfo.color};">
                    ${agentInfo.icon} Agente: <strong style="color:${agentInfo.color}">${agentInfo.label}</strong>
                    ${stage !== 'captured' && !['running','completed'].includes(idea.execution_status) ? `<button class="btn-execute-inline" onclick="event.stopPropagation();openExecuteModal('${idea.id}', '${idea.suggested_agent}')">Ejecutar →</button>` : ''}
                </div>`;
            }

            // Execution status
            let executionHtml = '';
            if (idea.execution_status === 'running') {
                executionHtml = `<div class="execution-status running"><span class="spinner-small"></span> Ejecutando agente...</div>`;
            } else if (idea.execution_status === 'completed' && idea.execution_output) {
                const outputPreview = (idea.execution_output || '').substring(0, 120).replace(/</g, '&lt;');
                executionHtml = `<div class="execution-status completed" onclick="event.stopPropagation();showExecutionOutput('${idea.id}')">
                    🚀 <strong>Output generado</strong> — click para ver
                    <div style="margin-top:4px;opacity:0.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${outputPreview}...</div>
                </div>`;
            } else if (idea.execution_status === 'failed') {
                executionHtml = `<div class="execution-status failed">❌ Fallo — <button class="btn-code-action" onclick="openExecuteModal('${idea.id}', '${idea.suggested_agent || ''}')">Reintentar</button></div>`;
            }

            // Inline project sub-task count (lazy loaded on click)
            let projectInlineHtml = '';
            if (idea.is_project == 1 && !isCompleted && stage !== 'captured') {
                projectInlineHtml = `<div class="idea-project-inline" id="projInline-${idea.id}" data-loaded="false">
                    <div class="idea-project-header" onclick="toggleInlineSubtasks('${idea.id}')">
                        <span>📂 Proyecto</span>
                        <span class="idea-project-toggle" id="projToggle-${idea.id}">▸ Ver sub-tareas</span>
                    </div>
                    <div class="idea-project-subtasks" id="projSubs-${idea.id}" style="display:none;"></div>
                </div>`;
            }

            return `
                <div class="idea-card ${idea.needs_review ? 'needs-review' : ''} ${idea.is_project == 1 ? 'is-project-card' : ''}" data-id="${idea.id}" style="animation: fadeSlideIn 0.3s ease ${i * 0.05}s both">
                    <div class="idea-stage-indicator" style="background:${stageColors[stage]}" title="${stageLabels[stage]}">
                        ${stageIcons[stage]}
                    </div>
                    <div class="idea-content">
                        ${reviewHtml}
                        ${summaryHtml}
                        ${contentHtml}
                        ${tagsHtml}
                        ${confidenceHtml ? `<div style="margin-top:4px;">${confidenceHtml}</div>` : ''}
                        ${objetivoHtml}
                        ${distilledHtml}
                        ${projectInlineHtml}
                        ${agentBadgeHtml}
                        ${executionHtml}
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;flex-wrap:wrap;gap:6px;">
                            <span class="idea-date">${formatted}</span>
                            <div style="display:flex;gap:4px;flex-wrap:wrap;">
                                ${actionBtns}
                            </div>
                        </div>
                    </div>
                    <button type="button" class="idea-edit" onclick="event.stopPropagation(); openEditIdeaModal('${idea.id}')" title="Editar idea">✏️</button>
                    <button type="button" class="idea-delete" onclick="deleteIdea('${idea.id}')" title="Eliminar idea">🗑</button>
                </div>`;
        }).join('');
    } catch (err) {
        console.error('Load ideas error:', err);
        list.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;">Error al cargar ideas</p>`;
    }
}

async function deleteIdea(id) {
    const confirmed = await showCustomModal({
        title: 'Borrar Idea',
        message: '¿Estás seguro de que quieres eliminar esta idea?',
        isConfirm: true
    });
    if (!confirmed) return;

    // Animate card out
    const card = document.querySelector(`.idea-card[data-id="${id}"]`);
    if (card) {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px) scale(0.95)';
        card.style.maxHeight = card.offsetHeight + 'px';
        setTimeout(() => { card.style.maxHeight = '0'; card.style.padding = '0 18px'; card.style.marginBottom = '0'; }, 150);
    }
    try {
        const res = await fetch(`/api/ideas/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Idea eliminada', 'info');
            setTimeout(() => { loadIdeas(); initHomeData(); }, 350);
        }
    } catch (err) {
        console.error('Delete idea error:', err);
        showToast('Error al eliminar', 'error');
    }
}
window.deleteIdea = deleteIdea;

// ─── Edit Idea Modal ─────────────────────────────────────────────────────────

let _editIdeaModalOpen = false;
async function openEditIdeaModal(ideaId) {
    if (_editIdeaModalOpen) return;
    _editIdeaModalOpen = true;
    try {
        // Fetch idea + users in parallel (single idea by ID = fast)
        const [ideaRes, allUsers] = await Promise.all([
            fetch(`/api/ideas/${ideaId}`),
            getCachedUsers()
        ]);
        if (!ideaRes.ok) { showToast('Idea no encontrada', 'error'); return; }
        const idea = await ideaRes.json();

        const teamUsers = allUsers.filter(u => !['usuario', 'cliente'].includes(u.role));

        const stage = idea.code_stage || 'captured';
        const isCompleted = idea.completada == 1;
        const stageOpts = [
            { val: 'captured', label: '📥 Capturada', color: '#6366f1' },
            { val: 'organized', label: '📋 Organizada', color: '#3b82f6' },
            { val: 'distilled', label: '💎 Destilada', color: '#8b5cf6' },
            { val: 'expressed', label: '🚀 Expresada', color: '#f59e0b' },
            { val: 'executed', label: '⚡ Ejecutada', color: '#10b981' }
        ];
        const selectStyle = 'width:100%;padding:6px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);';

        const formHtml = `
            <div class="edit-idea-form" style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div>
                        <label style="font-size:0.8rem;color:var(--text-muted);">Estado</label>
                        <select id="_editIdeaStage" style="${selectStyle}">
                            ${stageOpts.map(s => `<option value="${s.val}" ${stage === s.val ? 'selected' : ''}>${s.label}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.8rem;color:var(--text-muted);">Completada</label>
                        <select id="_editIdeaCompletada" style="${selectStyle}">
                            <option value="0" ${!isCompleted ? 'selected' : ''}>❌ No completada</option>
                            <option value="1" ${isCompleted ? 'selected' : ''}>✅ Completada</option>
                        </select>
                    </div>
                </div>

                <label style="font-size:0.8rem;color:var(--text-muted);">Texto / Descripcion</label>
                <textarea id="_editIdeaText" style="min-height:80px;padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:0.9rem;resize:vertical;">${escapeHtml(idea.text || '')}</textarea>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div>
                        <label style="font-size:0.8rem;color:var(--text-muted);">Responsable</label>
                        <select id="_editIdeaAssigned" style="${selectStyle}">
                            <option value="">— Sin asignar —</option>
                            ${teamUsers.map(u => `<option value="${escapeHtml(u.username)}" ${idea.assigned_to === u.username ? 'selected' : ''}>${escapeHtml(u.username)}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.8rem;color:var(--text-muted);">Prioridad</label>
                        <select id="_editIdeaPriority" style="${selectStyle}">
                            <option value="">— Sin prioridad —</option>
                            <option value="alta" ${idea.priority === 'alta' ? 'selected' : ''}>Alta</option>
                            <option value="media" ${idea.priority === 'media' ? 'selected' : ''}>Media</option>
                            <option value="baja" ${idea.priority === 'baja' ? 'selected' : ''}>Baja</option>
                        </select>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div>
                        <label style="font-size:0.8rem;color:var(--text-muted);">Energia</label>
                        <select id="_editIdeaEnergia" style="${selectStyle}">
                            <option value="">—</option>
                            <option value="baja" ${idea.energia === 'baja' ? 'selected' : ''}>Baja</option>
                            <option value="media" ${idea.energia === 'media' ? 'selected' : ''}>Media</option>
                            <option value="alta" ${idea.energia === 'alta' ? 'selected' : ''}>Alta</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.8rem;color:var(--text-muted);">Compromiso</label>
                        <select id="_editIdeaCompromiso" style="${selectStyle}">
                            <option value="">—</option>
                            <option value="comprometida" ${idea.tipo_compromiso === 'comprometida' ? 'selected' : ''}>Comprometida</option>
                            <option value="esta_semana" ${idea.tipo_compromiso === 'esta_semana' ? 'selected' : ''}>Esta semana</option>
                            <option value="algun_dia" ${idea.tipo_compromiso === 'algun_dia' ? 'selected' : ''}>Algun dia</option>
                            <option value="tal_vez" ${idea.tipo_compromiso === 'tal_vez' ? 'selected' : ''}>Tal vez</option>
                        </select>
                    </div>
                </div>

                <label style="font-size:0.8rem;color:var(--text-muted);">Objetivo</label>
                <input id="_editIdeaObjetivo" type="text" value="${escapeHtml(idea.objetivo || '')}" placeholder="Objetivo que apoya esta tarea" style="padding:6px 8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);">

                <label style="font-size:0.8rem;color:var(--text-muted);">Notas</label>
                <textarea id="_editIdeaNotas" style="min-height:50px;padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:0.85rem;resize:vertical;" placeholder="Notas adicionales...">${escapeHtml(idea.notas || '')}</textarea>
            </div>
        `;

        const confirmed = await showCustomModal({
            title: '✏️ Editar Idea',
            message: formHtml,
            html: true,
            isConfirm: true
        });

        if (!confirmed) { _editIdeaModalOpen = false; return; }

        const newCompletada = document.getElementById('_editIdeaCompletada')?.value === '1';
        const body = {
            text: document.getElementById('_editIdeaText')?.value || idea.text,
            assigned_to: document.getElementById('_editIdeaAssigned')?.value || '',
            priority: document.getElementById('_editIdeaPriority')?.value || '',
            energia: document.getElementById('_editIdeaEnergia')?.value || '',
            tipo_compromiso: document.getElementById('_editIdeaCompromiso')?.value || '',
            objetivo: document.getElementById('_editIdeaObjetivo')?.value || '',
            notas: document.getElementById('_editIdeaNotas')?.value || '',
            code_stage: document.getElementById('_editIdeaStage')?.value || stage,
            completada: newCompletada
        };

        const putRes = await fetch(`/api/ideas/${ideaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (putRes.ok) {
            showToast('Idea actualizada', 'success');
            loadIdeas();
        } else {
            const err = await putRes.json();
            showToast(err.error || 'Error al editar', 'error');
        }
    } catch (err) {
        console.error('Edit idea error:', err);
        showToast('Error al editar idea', 'error');
    } finally {
        _editIdeaModalOpen = false;
    }
}
window.openEditIdeaModal = openEditIdeaModal;

// ═══════════════════════════════════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════
function showToast(msg, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
        document.body.appendChild(container);
    }
    const colors = { success: '#16a34a', error: '#dc2626', info: '#3b82f6' };
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.style.cssText = `
        padding: 12px 20px; border-radius: 10px; font-size: 0.88rem; font-weight: 600;
        color: #fff; background: ${colors[type] || colors.info};
        box-shadow: 0 8px 24px rgba(0,0,0,0.25); pointer-events: auto;
        animation: fadeSlideIn 0.3s ease; display: flex; align-items: center; gap: 8px;
    `;
    toast.innerHTML = `<span>${icons[type] || icons.info}</span> ${escapeHtml(msg)}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'all 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE RECORDER FALLBACK (Audio Blobs)
// ═══════════════════════════════════════════════════════════════════════════════
let mediaRecorder = null;
let audioChunks = [];
let recordingMode = 'speech'; // 'speech' or 'audio'

function initVoiceRecorder() {
    // This is called when we switch modes
}

function switchToAudioMode() {
    console.log('🔄 Switching to Audio Recorder Mode');
    recordingMode = 'audio';

    const btnMic = document.getElementById('btnMic');
    const micStatus = document.getElementById('micStatus');
    const micHint = document.getElementById('micHint');
    const micLabel = document.getElementById('micLabel');
    const textarea = document.getElementById('ideaTextarea');

    if (btnMic) {
        btnMic.classList.remove('disabled');
        btnMic.title = 'Mantener para grabar audio (Nota de Voz)';
        // Remove old listeners to avoid conflicts
        const newBtn = btnMic.cloneNode(true);
        btnMic.parentNode.replaceChild(newBtn, btnMic);

        // Add new Audio listeners
        newBtn.addEventListener('mousedown', startAudioRecording);
        newBtn.addEventListener('mouseup', stopAudioRecording);
        newBtn.addEventListener('mouseleave', () => { if (isRecording) stopAudioRecording(); });

        // Touch support for mobile
        newBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startAudioRecording(); });
        newBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopAudioRecording(); });
    }

    if (micStatus) micStatus.textContent = '🎙️ Modo Nota de Voz activado';
    if (micHint) micHint.textContent = 'Mantén presionado el botón para grabar un audio.';
    if (micLabel) micLabel.textContent = 'Grabar Audio';
    if (textarea) textarea.placeholder = 'Escribe una idea o graba un audio...';

    showToast('Modo de voz activado (Offline)', 'info');
}

async function startAudioRecording() {
    if (isRecording) return;
    const ms = document.getElementById('micStatus');
    const micIcon = document.getElementById('micIcon');
    const btnMic = document.getElementById('btnMic');

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) audioChunks.push(event.data);
        };

        mediaRecorder.onstop = uploadVoiceNote;

        mediaRecorder.start();
        isRecording = true;

        if (ms) ms.textContent = '🔴 Grabando audio...';
        if (micIcon) micIcon.textContent = '⏹';
        if (btnMic) btnMic.classList.add('recording');

    } catch (err) {
        console.error('Audio recorder error:', err);
        if (ms) ms.textContent = '❌ Error al acceder al micrófono';
        showToast('Error al acceder al micrófono', 'error');
    }
}

function stopAudioRecording() {
    if (!isRecording || !mediaRecorder) return;
    mediaRecorder.stop();
    isRecording = false;

    const ms = document.getElementById('micStatus');
    const micIcon = document.getElementById('micIcon');
    const btnMic = document.getElementById('btnMic');

    if (ms) ms.textContent = '⏳ Guardando audio...';
    if (micIcon) micIcon.textContent = '🎤';
    if (btnMic) btnMic.classList.remove('recording');

    // Stop all tracks to release mic
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
}

async function uploadVoiceNote() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice_note.webm');

    // Get text if any, or use default title
    const textarea = document.getElementById('ideaTextarea');
    const text = textarea?.value?.trim() || 'Nota de Voz';
    formData.append('text', text);

    try {
        const res = await fetch('/api/ideas/voice', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            if (data.split) {
                showToast(`Voz separada en ${data.count} ideas`, 'success');
            } else {
                showToast('Audio guardado correctamente', 'success');
            }
            if (textarea) textarea.value = '';
            loadIdeas();
            initHomeData();
            const ms = document.getElementById('micStatus');
            if (ms) ms.textContent = data.split ? `✅ ${data.count} ideas creadas` : '✅ Audio guardado';
            setTimeout(() => { if (ms) ms.textContent = ''; }, 3000);
        } else {
            throw new Error('Upload failed');
        }
    } catch (err) {
        console.error('Voice upload failed:', err);
        showToast('Error al guardar audio', 'error');
        const ms = document.getElementById('micStatus');
        if (ms) ms.textContent = '❌ Error al subir';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

// ─── Assistant Logic (Floating Widget) ────────────────────────────────────────
function initChat() {
    // Toggle Logic
    const toggleBtn = document.getElementById('aiToggleBtn');
    let closeBtn = document.getElementById('closeAiBtn');
    const widget = document.getElementById('aiWidget');

    // SELF-HEALING: If widget exists but is empty, restore it
    if (widget && widget.innerHTML.trim() === '') {
        console.warn('AI Widget was empty, repairing...');
        widget.innerHTML = `
        <div class="ai-header">
            <div class="ai-header-title">
                <span>🤖</span>
                <select id="agentSelector" class="agent-selector" title="Seleccionar Agente">
                    <option value="default">Asistente General</option>
                    <option value="staffing">Staffing Agent</option>
                    <option value="training">Training Agent</option>
                    <option value="finance">Finance Agent</option>
                    <option value="compliance">Compliance Agent</option>
                </select>
            </div>
            <button id="closeAiBtn" class="ai-close-btn">&times;</button>
        </div>
        <div class="chat-messages" id="chatMessages">
            <div class="message ai">
                <div class="msg-content">
                    <strong>Asistente ValueStrategy</strong>
                    <p>Hola. Soy tu asistente de operaciones. ¿En qué te ayudo hoy?</p>
                </div>
            </div>
        </div>
        <div class="chat-input-area">
            <input type="text" id="chatInput" placeholder="Escribe tu mensaje..." autocomplete="off">
            <button id="sendBtn">➤</button>
        </div>
        `;
        // Re-query elements after injection
        closeBtn = document.getElementById('closeAiBtn');
    }

    // Re-query input/messages/sendBtn in case they were just created or missing
    const messagesContainer = document.getElementById('chatMessages');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    if (toggleBtn && widget) {
        toggleBtn.addEventListener('click', () => {
            widget.classList.toggle('open');
            if (widget.classList.contains('open') && input) input.focus();
        });
    }

    if (closeBtn && widget) {
        closeBtn.addEventListener('click', () => {
            widget.classList.remove('open');
        });
    }

    if (!messagesContainer || !input || !sendBtn) return;

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = `message ${role}`;

        let content = `<div class="msg-content"><p>${escapeHtml(text)}</p></div>`;
        if (role === 'ai') {
            content = `<div class="msg-content">${renderMarkdown(text)}</div>`;
        }

        div.innerHTML = safeHTML(content);
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'message ai';
        div.id = 'chatTyping';
        div.innerHTML = '<div class="msg-content"><div class="chat-typing"><span></span><span></span><span></span></div></div>';
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function removeTypingIndicator() {
        const el = document.getElementById('chatTyping');
        if (el) el.remove();
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        appendMessage('user', text);
        input.value = '';
        sendBtn.disabled = true;

        const agent = document.getElementById('agentSelector')?.value || 'default';
        showTypingIndicator();

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, agent: agent })
            });
            if (!res.ok) {
                removeTypingIndicator();
                if (res.status === 401) { appendMessage('ai', 'Sesion expirada. Recarga la pagina.'); return; }
                throw new Error(`Servidor respondio ${res.status}`);
            }
            const data = await res.json();

            removeTypingIndicator();
            if (data.error) throw new Error(data.error);
            appendMessage('ai', data.response);
        } catch (err) {
            removeTypingIndicator();
            const msg = err.message.includes('Failed to fetch')
                ? 'No se pudo conectar al servidor. Verifica tu conexion.'
                : `No pude procesar tu mensaje. ${err.message}`;
            appendMessage('ai', msg);
        } finally {
            sendBtn.disabled = false;
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}

async function processIdea(ideaId, text) {
    showToast('Procesando con IA...', 'info');
    try {
        const res = await fetch('/api/ai/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ideaId, text })
        });


        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const analysis = await res.json();

        // Check for valid analysis object
        if (!analysis || typeof analysis !== 'object') {
            throw new Error('Respuesta inválida de la IA');
        }

        // Format output with fallbacks
        const tipo = analysis.tipo || 'Desconocido';
        const categoria = analysis.categoria || 'General';

        showToast(`✅ Idea procesada: ${tipo} (${categoria})`, 'success');

        // Refresh ideas list to show new tags
        loadIdeas();

    } catch (err) {
        console.error('Process Idea Error:', err);
        showToast(`Error: ${err.message}`, 'error');
    }
}
// ─── Context Logic ─────────────────────────────────────────────────────────────
let allContext = [];

let activeContextParaFilter = 'all';

async function initContext() {
    loadContext();
    const form = document.getElementById('contextForm');
    if (form) form.addEventListener('submit', saveContext);

    // PARA tab listeners
    document.querySelectorAll('.para-tab[data-para]').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.para-tab[data-para]').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeContextParaFilter = tab.dataset.para;
            renderContextTable();
        });
    });

    // Load areas for context modal dropdown
    loadAreasForDropdowns();
}

async function loadAreasForDropdowns() {
    try {
        const res = await fetch('/api/areas');
        const areas = await res.json();
        const selects = [document.getElementById('contextAreaId')];
        selects.forEach(sel => {
            if (!sel) return;
            sel.innerHTML = '<option value="">— Ninguna —</option>';
            areas.filter(a => a.status === 'active').forEach(a => {
                sel.innerHTML += `<option value="${a.id}">${escapeHtml(a.icon || '📂')} ${escapeHtml(a.name)}</option>`;
            });
        });
    } catch (err) { console.error('Error loading areas for dropdown:', err); }
}

async function loadContext() {
    try {
        const res = await fetch('/api/ai/context');
        allContext = await res.json();
        renderContextTable();
    } catch (err) {
        console.error('Error loading context:', err);
        const tbody = document.querySelector('#contextTable tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="text-error">Error al cargar datos.</td></tr>';
    }
}

function renderContextTable() {
    const tbody = document.querySelector('#contextTable tbody');
    if (!tbody) return;

    let filtered = allContext;
    if (activeContextParaFilter !== 'all') {
        filtered = allContext.filter(item => item.para_type === activeContextParaFilter);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay datos en esta categoría.</td></tr>';
        return;
    }

    const paraLabels = { project: '🚀 Proyecto', area: '📋 Área', resource: '📚 Recurso', archive: '🗄️ Archivo' };
    const codeLabels = { captured: '📥', organized: '📂', distilled: '💎', expressed: '🚀' };

    tbody.innerHTML = filtered.map(item => {
        const paraLabel = paraLabels[item.para_type] || item.category || '—';
        const codeLabel = codeLabels[item.code_stage] || '📥';
        const distillBtn = item.code_stage !== 'distilled' && item.code_stage !== 'expressed'
            ? `<button class="btn-icon" onclick="distillContext('${item.id}')" title="Destilar con IA">💎</button>` : '';
        const archiveBtn = item.para_type !== 'archive'
            ? `<button class="btn-icon" onclick="archiveContext('${item.id}')" title="Archivar">🗄️</button>` : '';

        return `<tr>
            <td style="font-weight:600;color:var(--text-primary);">${escapeHtml(item.key)}</td>
            <td><div style="max-height:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:250px;" title="${escapeHtml(item.content)}">${escapeHtml(item.distilled_summary || item.content)}</div></td>
            <td><span class="badge badge-para">${paraLabel}</span></td>
            <td><span title="${item.code_stage || 'captured'}">${codeLabel}</span></td>
            <td>
                <button class="btn-icon" onclick="editContext('${item.id}')" title="Editar">✏️</button>
                ${distillBtn}${archiveBtn}
                <button class="btn-icon delete" onclick="deleteContext('${item.id}')" title="Eliminar">🗑</button>
            </td>
        </tr>`;
    }).join('');
}

async function saveContext(e) {
    e.preventDefault();
    const id = document.getElementById('contextId').value;
    const key = document.getElementById('contextKey').value;
    const category = document.getElementById('contextCategory').value;
    const content = document.getElementById('contextContent').value;
    const para_type = document.getElementById('contextParaType')?.value || 'resource';
    const related_area_id = document.getElementById('contextAreaId')?.value || null;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/ai/context/${id}` : '/api/ai/context';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, content, category, para_type, related_area_id })
        });

        if (res.ok) {
            closeContextModal();
            showToast('Contexto guardado', 'success');
            loadContext();
        } else {
            throw new Error('Failed to save');
        }
    } catch (err) {
        showToast('Error al guardar', 'error');
    }
}

async function deleteContext(id) {
    if (!confirm('¿Eliminar este dato de la memoria de la IA?')) return;
    try {
        const res = await fetch(`/api/ai/context/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Dato eliminado', 'info');
            loadContext();
        }
    } catch (err) {
        showToast('Error al eliminar', 'error');
    }
}

function editContext(id) {
    const item = allContext.find(i => i.id == id);
    if (!item) return;

    document.getElementById('contextId').value = item.id;
    document.getElementById('contextKey').value = item.key;
    document.getElementById('contextCategory').value = item.category;
    document.getElementById('contextContent').value = item.content;
    const paraSelect = document.getElementById('contextParaType');
    if (paraSelect) paraSelect.value = item.para_type || 'resource';
    const areaSelect = document.getElementById('contextAreaId');
    if (areaSelect) areaSelect.value = item.related_area_id || '';
    document.getElementById('contextModalTitle').textContent = 'Editar Dato de Contexto';
    openContextModal();
}

function openContextModal() {
    const modal = document.getElementById('contextModal');
    if (modal) modal.style.display = 'block';
}

function closeContextModal() {
    const modal = document.getElementById('contextModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('contextForm').reset();
        document.getElementById('contextId').value = '';
        document.getElementById('contextModalTitle').textContent = 'Nuevo Dato de Contexto';
    }
}

// Expose globals
window.editContext = editContext;
window.deleteContext = deleteContext;
window.openContextModal = openContextModal;
window.closeContextModal = closeContextModal;
window.discussSkill = discussSkill;

// ─── Initialization ───────────────────────────────────────────────────────────────
async function initSkills() {
    const grid = document.getElementById('skillsGrid');
    const searchInput = document.getElementById('skillsSearch');
    const pagination = document.getElementById('skillsPagination');
    if (!grid) return;

    const SKILLS_PER_PAGE = 24;
    let currentPage = 1;
    let activeGroup = 'all';

    const GROUP_META = {
        engineering:    { icon: '⚙️', label: 'Ingeniería & Activos' },
        commissioning:  { icon: '🏗️', label: 'Comisionamiento' },
        compliance:     { icon: '📋', label: 'Cumplimiento' },
        workforce:      { icon: '👥', label: 'Fuerza Laboral' },
        knowledge:      { icon: '📖', label: 'Conocimiento' },
        gtd:            { icon: '🎯', label: 'GTD' },
        communication:  { icon: '📝', label: 'Comunicación' },
        'ai-dev':       { icon: '🤖', label: 'IA & Dev' },
    };

    try {
        const res = await fetch('/api/skills');
        const skills = await res.json();

        // Ensure functionalGroup exists (fallback if server cache stale)
        const CAT_FALLBACK = { core: 'engineering', customizable: 'communication', integration: 'ai-dev' };
        skills.forEach(s => {
            if (!s.functionalGroup) s.functionalGroup = CAT_FALLBACK[s.category] || 'engineering';
        });

        // Update group counters
        const counts = { all: skills.length };
        Object.keys(GROUP_META).forEach(g => { counts[g] = 0; });
        skills.forEach(s => { if (counts[s.functionalGroup] !== undefined) counts[s.functionalGroup]++; });

        const el = id => document.getElementById(id);
        if (el('countAll')) el('countAll').textContent = counts.all;
        if (el('countEngineering')) el('countEngineering').textContent = counts.engineering;
        if (el('countCommissioning')) el('countCommissioning').textContent = counts.commissioning;
        if (el('countCompliance')) el('countCompliance').textContent = counts.compliance;
        if (el('countWorkforce')) el('countWorkforce').textContent = counts.workforce;
        if (el('countKnowledge')) el('countKnowledge').textContent = counts.knowledge;
        if (el('countGtd')) el('countGtd').textContent = counts.gtd;
        if (el('countCommunication')) el('countCommunication').textContent = counts.communication;
        if (el('countAiDev')) el('countAiDev').textContent = counts['ai-dev'];

        // Filter chips (scoped to skills section to avoid collision with Review panel)
        const chips = document.querySelectorAll('#skillsFilters .skill-filter-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                activeGroup = chip.dataset.group;
                currentPage = 1;
                renderSkills();
            });
        });

        function getFiltered() {
            const searchText = (searchInput?.value || '').toLowerCase();
            return skills.filter(s => {
                const matchGroup = activeGroup === 'all' || s.functionalGroup === activeGroup;
                const groupLabel = (GROUP_META[s.functionalGroup] || {}).label || '';
                const matchSearch = !searchText ||
                    s.name.toLowerCase().includes(searchText) ||
                    groupLabel.toLowerCase().includes(searchText);
                return matchGroup && matchSearch;
            });
        }

        function renderPagination(total) {
            if (!pagination) return;
            const totalPages = Math.ceil(total / SKILLS_PER_PAGE);
            if (totalPages <= 1) { pagination.innerHTML = ''; return; }

            let html = `<button ${currentPage <= 1 ? 'disabled' : ''} onclick="window._skillsGoPage(${currentPage - 1})">&#8249;</button>`;
            for (let i = 1; i <= totalPages; i++) {
                if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - currentPage) > 1) {
                    if (i === 3 || i === totalPages - 2) html += '<span class="page-info">...</span>';
                    continue;
                }
                html += `<button class="${i === currentPage ? 'active' : ''}" onclick="window._skillsGoPage(${i})">${i}</button>`;
            }
            html += `<button ${currentPage >= totalPages ? 'disabled' : ''} onclick="window._skillsGoPage(${currentPage + 1})">&#8250;</button>`;
            html += `<span class="page-info">${total} skills</span>`;
            pagination.innerHTML = html;
        }

        window._skillsGoPage = function(page) {
            currentPage = page;
            renderSkills();
            document.getElementById('section-skills')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        function renderSkills() {
            grid.innerHTML = '';
            const filtered = getFiltered();

            if (filtered.length === 0) {
                grid.innerHTML = '<div class="empty-state">No se encontraron skills.</div>';
                if (pagination) pagination.innerHTML = '';
                return;
            }

            const start = (currentPage - 1) * SKILLS_PER_PAGE;
            const pageSkills = filtered.slice(start, start + SKILLS_PER_PAGE);

            pageSkills.forEach(skill => {
                const card = document.createElement('div');
                card.className = 'skill-card';

                let displayName = skill.name.replace(/\.md$/i, '').replace(/-/g, ' ');
                displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

                card.onclick = () => viewSkill(skill.path, displayName);

                const meta = GROUP_META[skill.functionalGroup] || { icon: '📄', label: skill.functionalGroup };
                const catIcon = skill.category === 'core' ? '🧠' : skill.category === 'integration' ? '🔗' : '🛠️';
                const catLabel = skill.category === 'core' ? 'Core' : skill.category === 'integration' ? 'Integration' : 'Customizable';

                card.innerHTML = `
                    <div class="skill-icon">${meta.icon}</div>
                    <div class="skill-info">
                        <h3>${displayName}</h3>
                        <div class="skill-badges">
                            <span class="skill-category">${meta.label}</span>
                            <span class="skill-type-badge skill-type-${skill.category}">${catIcon} ${catLabel}</span>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });

            renderPagination(filtered.length);
        }

        renderSkills();

        if (searchInput) {
            searchInput.addEventListener('input', () => { currentPage = 1; renderSkills(); });
        }

    } catch (err) {
        console.error('Error loading skills:', err);
        grid.innerHTML = '<div class="error-state">Error al cargar skills. check console.</div>';
    }
}

async function viewSkill(filePath, title) {
    console.log('Opening skill:', title, filePath);
    const modal = document.getElementById('skillModal');
    const modalTitle = document.getElementById('skillModalTitle');
    const modalContent = document.getElementById('skillModalContent');
    const pathInput = document.getElementById('skillModalPath');

    if (modalTitle) {
        const isAdmin = window.__USER__ && (window.__USER__.role === 'admin' || window.__USER__.role === 'ceo');
        modalTitle.innerHTML = `
            <span>${escapeHtml(title || 'Sin Título')}</span>
            <div class="skill-modal-actions">
                ${isAdmin ? '<button id="btnEditSkill" class="skill-modal-btn" title="Editar skill">✏️</button>' : ''}
                <button id="btnDiscussSkill" class="skill-modal-btn" title="Discutir con IA">💬</button>
            </div>
        `;
    }
    if (pathInput) pathInput.value = filePath;
    if (modalContent) modalContent.innerHTML = '<div class="loading-spinner">Cargando...</div>';
    if (modal) modal.style.display = 'block';

    // Reset to content tab
    switchSkillTab('content');

    try {
        const res = await fetch(`/api/skills/content?file=${encodeURIComponent(filePath)}`);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        const pre = document.createElement('pre');
        pre.style.cssText = 'white-space: pre-wrap; font-family: monospace; color: #d1d5db;';
        pre.textContent = data.content;
        modalContent.innerHTML = '';
        modalContent.appendChild(pre);

        // Parse sections from markdown for comment section selector
        const sectionSelect = document.getElementById('skillCommentSection');
        if (sectionSelect) {
            const sections = (data.content || '').split('\n')
                .filter(line => /^#{1,3}\s+/.test(line))
                .map(line => line.replace(/^#+\s+/, '').trim());
            sectionSelect.innerHTML = '<option value="">General (todo el skill)</option>' +
                sections.map(s => `<option value="${s}">${s}</option>`).join('');
        }

        // Attach Discuss Handler
        const btnDiscuss = document.getElementById('btnDiscussSkill');
        if (btnDiscuss) {
            btnDiscuss.onclick = () => discussSkill(title, data.content);
        }

        // Attach Edit Handler (admin only)
        const btnEdit = document.getElementById('btnEditSkill');
        if (btnEdit) {
            btnEdit.onclick = () => enterSkillEditMode(filePath, title, data.content);
        }

        // Load comments and documents for this skill
        loadSkillComments(filePath);
        loadSkillDocuments(filePath);

        // Init inline comments and apply highlights
        initInlineComments();
        await _applyInlineHighlights(filePath);

    } catch (err) {
        if (modalContent) modalContent.innerHTML = '<div class="error-msg">Error al cargar contenido</div>';
        console.error(err);
    }
}

// ─── Skill Editing (Admin Only) ──────────────────────────────────────────────

function enterSkillEditMode(filePath, title, currentContent) {
    const modalContent = document.getElementById('skillModalContent');
    if (!modalContent) return;

    switchSkillTab('content');

    modalContent.innerHTML = `
        <textarea id="skillEditTextarea" style="
            width:100%;height:calc(100% - 50px);min-height:400px;
            background:#0a1628;color:#d1d5db;border:1px solid #2a3a52;
            border-radius:8px;padding:12px;font-family:monospace;
            font-size:0.88rem;line-height:1.6;resize:vertical;outline:none;
        ">${escapeHtml(currentContent)}</textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px;">
            <button id="btnCancelEdit" class="btn btn-sm" style="background:#555;box-shadow:none;">Cancelar</button>
            <button id="btnSaveSkill" class="btn btn-sm">Guardar y Publicar</button>
        </div>
    `;

    const textarea = document.getElementById('skillEditTextarea');
    if (textarea) textarea.focus();

    document.getElementById('btnCancelEdit').onclick = () => viewSkill(filePath, title);
    document.getElementById('btnSaveSkill').onclick = () => saveSkillContent(filePath, title);
}

async function saveSkillContent(filePath, title) {
    const textarea = document.getElementById('skillEditTextarea');
    const btnSave = document.getElementById('btnSaveSkill');
    if (!textarea || !btnSave) return;

    const content = textarea.value;
    const originalText = btnSave.innerText;
    btnSave.innerText = 'Guardando...';
    btnSave.disabled = true;

    try {
        const res = await fetch('/api/skills/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file: filePath, content })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Error desconocido');
        }

        if (data.warning) {
            showToast(data.warning, 'info');
        } else {
            showToast(data.message || 'Skill guardado', 'success');
        }

        viewSkill(filePath, title);

    } catch (err) {
        showToast('Error al guardar: ' + err.message, 'error');
        btnSave.innerText = originalText;
        btnSave.disabled = false;
    }
}

window.enterSkillEditMode = enterSkillEditMode;
window.saveSkillContent = saveSkillContent;

// ═══════════════════════════════════════════════════════════════════════════════
// UTILS & MODALS
// ═══════════════════════════════════════════════════════════════════════════════

// Custom Modal Logic (Promise-based)
function showCustomModal({ title, message, inputPlaceholder = null, isConfirm = false, html = false, onOpen = null }) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const titleEl = document.getElementById('customModalTitle');
        const msgEl = document.getElementById('customModalMessage');
        const inputContainer = document.getElementById('customModalInputContainer');
        const input = document.getElementById('customModalInput');
        const btnConfirm = document.getElementById('customModalConfirm');
        const btnCancel = document.getElementById('customModalCancel');

        if (!modal) {
            console.error('Custom modal element not found!');
            return resolve(null);
        }

        titleEl.textContent = title;
        if (html) { msgEl.innerHTML = message; } else { msgEl.textContent = message; }
        if (input) input.value = '';

        // Mark modal as locked (prevent click-outside close) when it has a form/confirm
        modal.dataset.locked = (isConfirm || html) ? '1' : '';

        // Widen modal for form content
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.maxWidth = html ? '480px' : '400px';
            modalContent.style.textAlign = html ? 'left' : 'center';
        }

        // Setup Input
        if (inputPlaceholder !== null && inputContainer) {
            inputContainer.style.display = 'block';
            if (input) {
                input.placeholder = inputPlaceholder;
                setTimeout(() => input.focus(), 100);
            }
        } else if (inputContainer) {
            inputContainer.style.display = 'none';
        }

        modal.style.display = 'flex';
        if (onOpen) setTimeout(() => onOpen(), 0);

        // Handlers
        const close = (val) => {
            modal.style.display = 'none';
            modal.dataset.locked = '';
            if (modalContent) { modalContent.style.maxWidth = '400px'; modalContent.style.textAlign = 'center'; }
            cleanup();
            resolve(val);
        };

        const onConfirm = () => {
            if (inputPlaceholder !== null && input) close(input.value);
            else close(true);
        };

        const onCancel = () => close(false);

        const onKey = (e) => {
            if (e.key === 'Enter' && !html) onConfirm(); // Don't close on Enter when editing forms
            if (e.key === 'Escape') onCancel();
        };

        if (btnConfirm) btnConfirm.onclick = onConfirm;
        if (btnCancel) btnCancel.onclick = onCancel;
        if (input) input.onkeydown = onKey;

        function cleanup() {
            if (btnConfirm) btnConfirm.onclick = null;
            if (btnCancel) btnCancel.onclick = null;
            if (input) input.onkeydown = null;
        }
    });
}
window.showCustomModal = showCustomModal; // Make global just in case

// (showToast defined above in TOAST NOTIFICATIONS section)

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN LOGIC
// ═══════════════════════════════════════════════════════════════════════════════

async function saveIdea(skipPreview = false) {
    const textarea = document.getElementById('ideaTextarea');
    if (!textarea || !textarea.value.trim()) return;

    const btn = document.getElementById('btnSaveIdea');
    const originalText = btn ? btn.innerText : 'Guardar';
    const text = textarea.value.trim();

    try {
        if (btn) btn.innerText = 'Analizando...';

        // Step 1: Preview — show what AI understood before saving
        let cachedPreview = null;
        if (!skipPreview) {
            const previewRes = await fetch('/api/ai/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (previewRes.ok) {
                cachedPreview = await previewRes.json();
                if (btn) btn.innerText = originalText;

                const confirmed = await showVoicePreview(cachedPreview, text);
                if (!confirmed) {
                    showToast('Captura cancelada', 'info');
                    return;
                }
            }
        }

        // Step 2: Save — send preview data to avoid duplicate AI call
        if (btn) btn.innerText = 'Guardando...';
        const res = await fetch('/api/ideas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, previewData: cachedPreview || undefined })
        });

        if (res.ok) {
            const data = await res.json();
            textarea.value = '';
            loadIdeas();
            initHomeData();

            if (data.split) {
                showToast(`Voz separada en ${data.count} ideas`, 'success');
            } else {
                showToast('Idea guardada correctamente', 'success');
            }
        } else {
            const data = await res.json();
            showToast('Error al guardar: ' + data.error, 'error');
        }
        if (btn) btn.innerText = originalText;
    } catch (err) {
        console.error(err);
        showToast('Error de conexion', 'error');
        if (btn) btn.innerText = originalText;
    }
}

// ─── Voice Preview Modal (Enhanced GTD) ─────────────────────────────────────
function showVoicePreview(preview, originalText) {
    return new Promise((resolve) => {
        const items = preview.items || [];
        const isSplit = items.length > 1;

        const ctxIcons = {'@computador':'💻','@email':'📧','@telefono':'📱','@oficina':'🏢','@calle':'🚶','@casa':'🏠','@espera':'⏳','@compras':'🛒','@investigar':'🔍','@reunion':'👥','@leer':'📖'};
        const eIcons = { baja: '🟢', media: '🟡', alta: '🔴' };
        const cLabels = { comprometida: '🔒 Comprometida', esta_semana: '📅 Esta Semana', algun_dia: '💭 Algun Dia', tal_vez: '🤷 Tal Vez' };
        const agentInfo = { staffing: { label: 'Staffing', icon: '👷', color: '#2563eb' }, training: { label: 'Training', icon: '📚', color: '#7c3aed' }, finance: { label: 'Finance', icon: '💰', color: '#059669' }, compliance: { label: 'Compliance', icon: '📋', color: '#dc2626' } };

        let itemsHtml = items.map((item, idx) => {
            const priorityColors = { alta: '#ef4444', media: '#f59e0b', baja: '#22c55e' };
            const pColor = priorityColors[item.priority] || '#6b7280';
            const isProject = item.is_project === true;

            // GTD row
            let gtdHtml = '';
            if (item.contexto || item.energia || item.tipo_compromiso) {
                gtdHtml = `<div class="preview-gtd-row">
                    ${item.contexto ? `<span class="preview-gtd-chip ctx">${ctxIcons[item.contexto] || '📍'} ${item.contexto}</span>` : ''}
                    ${item.energia ? `<span class="preview-gtd-chip energy">${eIcons[item.energia] || '⚡'} ${item.energia}</span>` : ''}
                    ${item.tipo_compromiso ? `<span class="preview-gtd-chip commit">${cLabels[item.tipo_compromiso] || item.tipo_compromiso}</span>` : ''}
                    ${item.estimated_time ? `<span class="preview-gtd-chip time">⏱ ${item.estimated_time}</span>` : ''}
                </div>`;
            }

            // Project badge + sub-tasks tree
            let projectHtml = '';
            if (isProject) {
                const subTasks = item.sub_tasks || [];
                let subTasksTreeHtml = '';
                if (subTasks.length > 0) {
                    subTasksTreeHtml = `<div class="preview-subtasks-tree">
                        ${subTasks.map(st => {
                            const isNext = st.es_proxima_accion === true;
                            return `<div class="preview-subtask ${isNext ? 'is-next' : ''}">
                                <span class="preview-subtask-bullet">${isNext ? '🎯' : '○'}</span>
                                <span class="preview-subtask-text">${escapeHtml(st.texto)}</span>
                                <span class="preview-subtask-meta">
                                    ${st.assigned_to ? `👤 ${st.assigned_to}` : ''}
                                    ${st.contexto ? `${ctxIcons[st.contexto] || ''}` : ''}
                                    ${st.estimated_time ? `⏱ ${st.estimated_time}` : ''}
                                </span>
                            </div>`;
                        }).join('')}
                    </div>`;
                }
                projectHtml = `<div class="preview-project-banner">
                    <div class="preview-project-badge">📂 PROYECTO</div>
                    <span class="preview-project-label">${subTasks.length} sub-tareas identificadas</span>
                </div>
                ${subTasksTreeHtml}`;
            }

            // Agent suggestion
            let agentHtml = '';
            if (item.suggested_agent && agentInfo[item.suggested_agent]) {
                const ai = agentInfo[item.suggested_agent];
                const skillLabels = (item.suggested_skills || []).map(s => s.replace(/\.md$/, '').split('/').pop().replace(/-/g, ' ')).join(', ');
                agentHtml = `<div class="preview-agent-suggestion">
                    <span class="preview-agent-icon" style="color:${ai.color}">${ai.icon}</span>
                    <div class="preview-agent-info">
                        <span class="preview-agent-name">Agente: <strong>${ai.label}</strong></span>
                        ${skillLabels ? `<span class="preview-agent-skills">${skillLabels}</span>` : ''}
                    </div>
                    <span class="preview-agent-label">Disponible despues de guardar</span>
                </div>`;
            }

            // Objetivo
            let objetivoHtml = '';
            if (item.objetivo) {
                objetivoHtml = `<div class="preview-objetivo">🎯 ${escapeHtml(item.objetivo)}</div>`;
            }

            return `
                <div class="preview-idea-card ${isProject ? 'is-project' : ''}">
                    ${isSplit ? `<div class="preview-idea-num">#${idx + 1}</div>` : ''}
                    <div class="preview-idea-body">
                        <p class="preview-idea-text">${escapeHtml(item.texto_limpio || item.resumen || '')}</p>
                        <div class="preview-idea-tags">
                            <span class="preview-tag" style="background:#3b82f6;">${item.tipo || '?'}</span>
                            <span class="preview-tag" style="background:#10b981;">${item.categoria || '?'}</span>
                            <span class="preview-tag" style="background:#8b5cf6;">PARA:${item.para_type || '?'}</span>
                            <span class="preview-tag" style="background:${pColor};">${item.priority || 'media'}</span>
                            ${item.assigned_to ? `<span class="preview-tag" style="background:#f59e0b;">👤 ${item.assigned_to}</span>` : ''}
                        </div>
                        ${gtdHtml}
                        ${projectHtml}
                        <p class="preview-idea-action">▶ ${escapeHtml(item.accion_inmediata || '')}</p>
                        ${objetivoHtml}
                        ${item.waiting_for ? `<p class="preview-idea-delegation">⏳ Delegacion: ${escapeHtml(item.waiting_for.delegated_to)} — ${escapeHtml(item.waiting_for.description)}</p>` : ''}
                        ${agentHtml}
                    </div>
                </div>`;
        }).join('');

        const confAvg = items.reduce((sum, i) => sum + (i.confidence || 0), 0) / items.length;
        const confColor = confAvg >= 0.8 ? '#10b981' : confAvg >= 0.6 ? '#f59e0b' : '#ef4444';
        const confLabel = confAvg >= 0.8 ? 'Alta' : confAvg >= 0.6 ? 'Media' : 'Baja';

        const hasProjects = items.some(i => i.is_project === true);
        const hasAgents = items.some(i => i.suggested_agent);

        const modalHtml = `
            <div id="voicePreviewModal" class="modal" style="display:flex;z-index:2100;">
                <div class="modal-content preview-modal-content">
                    <h2 class="modal-title">🧠 Clasificacion IA</h2>
                    ${isSplit ? `<div class="preview-split-banner">La IA detecto <strong>${items.length} ideas</strong> en tu mensaje</div>` : ''}
                    <div class="preview-summary-strip">
                        <div class="preview-summary-item">
                            <span class="preview-summary-icon" style="color:${confColor}">●</span>
                            <span>Confianza: <strong>${(confAvg * 100).toFixed(0)}%</strong> (${confLabel})</span>
                        </div>
                        ${hasProjects ? '<div class="preview-summary-item"><span class="preview-summary-icon">📂</span><span>Contiene <strong>proyecto(s)</strong></span></div>' : ''}
                        ${hasAgents ? '<div class="preview-summary-item"><span class="preview-summary-icon">🤖</span><span>Agente sugerido</span></div>' : ''}
                    </div>
                    <div class="preview-original">
                        <label>Texto original:</label>
                        <p>${escapeHtml(originalText.substring(0, 300))}${originalText.length > 300 ? '...' : ''}</p>
                    </div>
                    <div class="preview-items-list" style="flex:1;overflow-y:auto;">
                        ${itemsHtml}
                    </div>
                    <div class="preview-actions">
                        <button class="btn" id="previewCancel">Cancelar</button>
                        <button class="btn btn-primary" id="previewConfirm">Guardar ${isSplit ? items.length + ' ideas' : 'Idea'}</button>
                    </div>
                </div>
            </div>`;

        // Inject modal
        const container = document.createElement('div');
        container.innerHTML = modalHtml;
        document.body.appendChild(container.firstElementChild);

        const modal = document.getElementById('voicePreviewModal');
        document.getElementById('previewConfirm').addEventListener('click', () => {
            modal.remove();
            resolve(true);
        });
        document.getElementById('previewCancel').addEventListener('click', () => {
            modal.remove();
            resolve(false);
        });
    });
}

window.saveIdea = saveIdea;

// (Duplicate DOMContentLoaded removed — canonical init is at top of file)

// ═══════════════════════════════════════════════════════════════════════════════
// SKILL DISCUSSION
// ═══════════════════════════════════════════════════════════════════════════════

function discussSkill(title, content) {
    // Close modal
    const modal = document.getElementById('skillModal');
    if (modal) modal.style.display = 'none';

    // Open AI Widget
    const widget = document.getElementById('aiWidget');
    const input = document.getElementById('chatInput');

    // Auto-open widget
    if (widget) {
        widget.classList.add('open');
        const toggle = document.getElementById('aiToggleBtn');
        if (toggle) toggle.style.display = 'none';
    }

    // Prepare initial message
    if (input) {
        // Truncate content if too long to avoid token limits (naive approach)
        const truncated = content.length > 2000 ? content.substring(0, 2000) + '... [truncado]' : content;
        const prompt = `Analicemos esta skill: **${title}**\n\nContenido:\n\`\`\`\n${truncated}\n\`\`\`\n\n¿Cómo puedo aplicar esto?`;

        input.value = prompt;
        input.focus();
    }
}
window.discussSkill = discussSkill;

// Close modal logic for generic modals (using addEventListener to avoid overriding)
window.addEventListener('click', (event) => {
    const skillModal = document.getElementById('skillModal');
    const customModal = document.getElementById('customModal');
    if (event.target == skillModal && skillModal) skillModal.style.display = 'none';
    // Don't close customModal on overlay click when it has a form/confirm (locked)
    if (event.target == customModal && customModal && !customModal.dataset.locked) customModal.style.display = 'none';
});

window.processIdea = processIdea;
window.viewSkill = viewSkill;
window.discussSkill = discussSkill;

function toggleMethodology(btn) {
    const details = btn.nextElementSibling;
    if (details) {
        const isHidden = details.style.display === 'none';
        details.style.display = isHidden ? 'block' : 'none';
        btn.innerHTML = isHidden ? 'Ocultar ↑' : '¿Cómo funciona? ↓';
    }
}
window.toggleMethodology = toggleMethodology;

// ═══════════════════════════════════════════════════════════════════════════════
// AREAS (PARA)
// ═══════════════════════════════════════════════════════════════════════════════
let allAreas = [];

async function initAreas() {
    loadAreas();
    const form = document.getElementById('areaForm');
    if (form) form.addEventListener('submit', saveArea);
}

async function loadAreas() {
    const grid = document.getElementById('areasGrid');
    if (!grid) return;

    try {
        const res = await fetch('/api/areas');
        allAreas = await res.json();

        if (allAreas.length === 0) {
            grid.innerHTML = '<div class="archivos-empty"><div class="empty-icon">📋</div><p>No hay áreas definidas</p></div>';
            return;
        }

        const horizonLabels = { h2: 'H2 — Responsabilidad', h3: 'H3 — Meta', h4: 'H4 — Visión', h5: 'H5 — Misión' };

        grid.innerHTML = allAreas.map(area => {
            const statusClass = area.status === 'active' ? 'active' : 'archived';
            return `
                <div class="area-card ${statusClass}">
                    <div class="area-card-header">
                        <span class="area-icon">${area.icon || '📂'}</span>
                        <div class="area-info">
                            <h3>${escapeHtml(area.name)}</h3>
                            <span class="area-horizon">${horizonLabels[area.horizon] || area.horizon}</span>
                        </div>
                        <span class="badge ${statusClass}">${area.status === 'active' ? '● Activa' : '● Archivada'}</span>
                    </div>
                    <p class="area-desc">${escapeHtml(area.description || 'Sin descripción')}</p>
                    <div class="area-stats">
                        <span>💡 ${area.ideas_count || 0} ideas</span>
                        <span>🧠 ${area.context_count || 0} contexto</span>
                    </div>
                    <div class="area-actions">
                        <button class="btn-icon" onclick="editArea(${area.id})" title="Editar">✏️</button>
                        ${area.status === 'active' ? `<button class="btn-icon delete" onclick="archiveArea(${area.id})" title="Archivar">🗄️</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading areas:', err);
        if (grid) grid.innerHTML = '<div class="archivos-empty"><div class="empty-icon">⚠️</div><p>Error al cargar áreas</p></div>';
    }
}

async function saveArea(e) {
    e.preventDefault();
    const id = document.getElementById('areaId').value;
    const data = {
        name: document.getElementById('areaName').value,
        description: document.getElementById('areaDescription').value,
        icon: document.getElementById('areaIcon').value || '📂',
        horizon: document.getElementById('areaHorizon').value,
        status: 'active'
    };

    try {
        const url = id ? `/api/areas/${id}` : '/api/areas';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method, headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeAreaModal();
            showToast('Área guardada', 'success');
            loadAreas();
            loadAreasForDropdowns();
            initOverviewStats();
        }
    } catch (err) {
        showToast('Error al guardar área', 'error');
    }
}

function editArea(id) {
    const area = allAreas.find(a => a.id == id);
    if (!area) return;
    document.getElementById('areaId').value = area.id;
    document.getElementById('areaName').value = area.name;
    document.getElementById('areaDescription').value = area.description || '';
    document.getElementById('areaIcon').value = area.icon || '';
    document.getElementById('areaHorizon').value = area.horizon || 'h2';
    document.getElementById('areaModalTitle').textContent = 'Editar Área';
    openAreaModal();
}

async function archiveArea(id) {
    const confirmed = await showCustomModal({
        title: 'Archivar Área',
        message: '¿Mover esta área al archivo?',
        isConfirm: true
    });
    if (!confirmed) return;
    try {
        await fetch(`/api/areas/${id}`, { method: 'DELETE' });
        showToast('Área archivada', 'info');
        loadAreas();
        initOverviewStats();
    } catch (err) { showToast('Error', 'error'); }
}

function openAreaModal() {
    const modal = document.getElementById('areaModal');
    if (modal) modal.style.display = 'block';
}

function closeAreaModal() {
    const modal = document.getElementById('areaModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('areaForm').reset();
        document.getElementById('areaId').value = '';
        document.getElementById('areaModalTitle').textContent = 'Nueva Área';
    }
}

window.editArea = editArea;
window.archiveArea = archiveArea;
window.openAreaModal = openAreaModal;
window.closeAreaModal = closeAreaModal;

// ═══════════════════════════════════════════════════════════════════════════════
// WAITING FOR (GTD Delegation)
// ═══════════════════════════════════════════════════════════════════════════════
async function initWaitingFor() {
    loadWaitingFor();
    const form = document.getElementById('waitingForm');
    if (form) form.addEventListener('submit', saveWaitingFor);

    // Load users for delegation dropdown (only ranked members)
    try {
        const allUsers = await getCachedUsers();
        const rankedUsers = allUsers.filter(u => !['usuario', 'cliente'].includes(u.role));
        const sel = document.getElementById('waitingDelegatedTo');
        if (sel) {
            sel.innerHTML = rankedUsers.map(u => `<option value="${escapeHtml(u.username)}">${escapeHtml(u.username)} (${escapeHtml(u.role)})</option>`).join('');
        }
    } catch (err) { console.error('Error loading users:', err); }
}

async function loadWaitingFor() {
    const list = document.getElementById('waitingList');
    if (!list) return;

    try {
        const res = await fetch('/api/waiting-for');
        const items = await res.json();

        if (items.length === 0) {
            list.innerHTML = '<div class="archivos-empty"><div class="empty-icon">✅</div><p>No hay delegaciones pendientes</p></div>';
            return;
        }

        list.innerHTML = items.map(item => {
            const isCompleted = item.status === 'completed';
            const date = new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
            const dueDate = item.due_date ? new Date(item.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : null;

            return `
                <div class="waiting-card ${isCompleted ? 'completed' : ''}">
                    <div class="waiting-info">
                        <p class="waiting-desc">${escapeHtml(item.description)}</p>
                        <div class="waiting-meta">
                            <span>👤 ${escapeHtml(item.delegated_to || '—')}</span>
                            ${item.area_name ? `<span>📋 ${escapeHtml(item.area_name)}</span>` : ''}
                            <span>📅 ${date}</span>
                            ${dueDate ? `<span style="color:var(--warning)">⏰ ${dueDate}</span>` : ''}
                        </div>
                    </div>
                    <div class="waiting-actions">
                        ${!isCompleted ? `<button class="btn-icon" onclick="completeWaiting(${item.id})" title="Marcar completado">✅</button>` : ''}
                        <button class="btn-icon delete" onclick="deleteWaiting(${item.id})" title="Eliminar">🗑</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading waiting-for:', err);
    }
}

async function saveWaitingFor(e) {
    e.preventDefault();
    const data = {
        description: document.getElementById('waitingDesc').value,
        delegated_to: document.getElementById('waitingDelegatedTo').value,
        due_date: document.getElementById('waitingDueDate').value || null
    };

    try {
        const res = await fetch('/api/waiting-for', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeWaitingModal();
            showToast('Delegación creada', 'success');
            loadWaitingFor();
            initOverviewStats();
        }
    } catch (err) { showToast('Error', 'error'); }
}

async function completeWaiting(id) {
    try {
        await fetch(`/api/waiting-for/${id}/complete`, { method: 'PUT' });
        showToast('Delegación completada', 'success');
        loadWaitingFor();
        initOverviewStats();
    } catch (err) { showToast('Error', 'error'); }
}

async function deleteWaiting(id) {
    if (!confirm('¿Eliminar esta delegacion?')) return;
    try {
        await fetch(`/api/waiting-for/${id}`, { method: 'DELETE' });
        showToast('Eliminado', 'info');
        loadWaitingFor();
    } catch (err) { showToast('Error', 'error'); }
}

function openWaitingModal() {
    const modal = document.getElementById('waitingModal');
    if (modal) modal.style.display = 'block';
}

function closeWaitingModal() {
    const modal = document.getElementById('waitingModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('waitingForm').reset();
    }
}

window.completeWaiting = completeWaiting;
window.deleteWaiting = deleteWaiting;
window.openWaitingModal = openWaitingModal;
window.closeWaitingModal = closeWaitingModal;

// ═══════════════════════════════════════════════════════════════════════════════
// OVERVIEW STATS (CODE Pipeline + PARA Distribution)
// ═══════════════════════════════════════════════════════════════════════════════
async function initOverviewStats() {
    try {
        const [codeRes, paraRes, overviewRes, archRes] = await Promise.all([
            fetch('/api/stats/code'),
            fetch('/api/stats/para'),
            fetch('/api/stats/overview'),
            fetch('/api/archivos')
        ]);

        const code = await codeRes.json();
        const para = await paraRes.json();
        const overview = await overviewRes.json();
        const archivos = await archRes.json();

        // CODE Pipeline counts
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('codeCaptured', code.captured || 0);
        set('codeOrganized', code.organized || 0);
        set('codeDistilled', code.distilled || 0);
        set('codeExpressed', code.expressed || 0);

        // PARA Distribution counts
        set('paraProjects', para.project || 0);
        set('paraAreas', para.area || 0);
        set('paraResources', (para.resource || 0) + (Array.isArray(archivos) ? archivos.length : 0));
        set('paraArchive', para.archive || 0);

        // Overview stats
        set('statProjects', overview.projects || 0);
        set('statAreas', overview.areas || 0);
        set('statContext', overview.context || 0);
        set('statWaiting', overview.waiting || 0);

    } catch (err) {
        console.error('Error loading overview stats:', err);
    }

    // Load executive KPIs, team summary, and recent reuniones for overview
    loadExecutiveSummary();
    loadOverviewTeamSummary();
    loadOverviewReuniones();
}

async function loadOverviewTeamSummary() {
    const el = document.getElementById('ovTeamSummary');
    if (!el) return;
    try {
        const res = await fetch('/api/reportability/team-summary');
        if (!res.ok) throw new Error('API error');
        const summary = await res.json();
        if (!Array.isArray(summary) || summary.length === 0) {
            el.innerHTML = '<div class="hp-empty">Sin datos de equipo aun</div>';
            return;
        }
        el.innerHTML = summary.map(u => {
            const pctColor = u.completion_pct >= 80 ? '#10b981' : u.completion_pct >= 50 ? '#f59e0b' : '#ef4444';
            return `
                <div class="ov-team-member" onclick="switchSection('reportability')">
                    <div class="ov-team-avatar" style="border-color:${pctColor};">${_avatarHtml(u.avatar, u.username, 36)}</div>
                    <div class="ov-team-info">
                        <span class="ov-team-name">${escapeHtml(u.username)}</span>
                        <span class="ov-team-dept">${escapeHtml(u.department || u.role)}</span>
                    </div>
                    <div class="ov-team-pct" style="color:${pctColor};">${u.completion_pct}%</div>
                    <div class="ov-team-bar">
                        <div class="ov-team-bar-fill" style="width:${u.completion_pct}%;background:${pctColor};"></div>
                    </div>
                    <div class="ov-team-counts">
                        <span>${u.completed_today}/${u.checklist_total}</span>
                        <span>📋 ${u.total_assigned}</span>
                    </div>
                </div>`;
        }).join('');
    } catch (err) {
        console.error('Overview team summary error:', err);
        el.innerHTML = '<div class="hp-empty">Error al cargar avance</div>';
    }
}

async function loadOverviewReuniones() {
    const el = document.getElementById('ovReunionesRecent');
    if (!el) return;
    try {
        const res = await fetch('/api/reuniones?limit=5');
        if (!res.ok) throw new Error('API error');
        const reuniones = await res.json();
        const list = Array.isArray(reuniones) ? reuniones : (reuniones.reuniones || []);
        if (list.length === 0) {
            el.innerHTML = '<div class="hp-empty">Sin reuniones registradas</div>';
            return;
        }
        el.innerHTML = list.slice(0, 5).map(r => {
            const fecha = r.fecha ? parseLocalDate(r.fecha).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : '';
            const compromisos = r.compromisos ? (typeof r.compromisos === 'string' ? JSON.parse(r.compromisos) : r.compromisos) : [];
            return `
                <div class="ov-reunion-item" onclick="switchSection('reuniones')">
                    <span class="ov-reunion-date">${fecha}</span>
                    <span class="ov-reunion-title">${escapeHtml(r.titulo || 'Sin titulo')}</span>
                    ${compromisos.length > 0 ? `<span class="ov-reunion-badge">${compromisos.length} compromisos</span>` : ''}
                </div>`;
        }).join('');
    } catch (err) {
        console.error('Overview reuniones error:', err);
        el.innerHTML = '<div class="hp-empty">Error al cargar reuniones</div>';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CODE ACTIONS (Distill, Express, Archive Context)
// ═══════════════════════════════════════════════════════════════════════════════
async function distillIdea(id) {
    showToast('Destilando con IA...', 'info');
    try {
        const res = await fetch(`/api/ideas/${id}/distill`, { method: 'POST' });
        const data = await res.json();
        if (data.resumen_destilado) {
            showToast('Idea destilada exitosamente', 'success');
        }
        loadIdeas();
        initOverviewStats();
    } catch (err) {
        showToast('Error al destilar', 'error');
    }
}

async function expressIdea(id) {
    const output = await showCustomModal({
        title: '🚀 Expresar Idea',
        message: '¿Qué creaste con esta idea? (documento, tarea, proyecto, etc.)',
        inputPlaceholder: 'Ej: Documento de propuesta enviado al cliente'
    });
    if (!output) return;

    try {
        await fetch(`/api/ideas/${id}/express`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ output })
        });
        showToast('Idea expresada', 'success');
        loadIdeas();
        initOverviewStats();
    } catch (err) {
        showToast('Error', 'error');
    }
}

async function distillContext(id) {
    showToast('Destilando con IA...', 'info');
    try {
        const res = await fetch(`/api/ai/context/${id}/distill`, { method: 'POST' });
        const data = await res.json();
        if (data.resumen_destilado) {
            showToast('Contexto destilado', 'success');
        }
        loadContext();
    } catch (err) {
        showToast('Error al destilar', 'error');
    }
}

async function archiveContext(id) {
    try {
        await fetch(`/api/ai/context/${id}/archive`, { method: 'POST' });
        showToast('Movido al archivo', 'info');
        loadContext();
    } catch (err) {
        showToast('Error', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FIX BUTTON (Bouncer — human correction)
// ═══════════════════════════════════════════════════════════════════════════════
function openFixModal(ideaId, aiType, aiCategory, paraType, assignedTo, priority) {
    document.getElementById('fixIdeaId').value = ideaId;
    if (aiType) document.getElementById('fixType').value = aiType;
    if (aiCategory) document.getElementById('fixCategory').value = aiCategory;
    if (paraType) document.getElementById('fixParaType').value = paraType;
    if (priority) document.getElementById('fixPriority').value = priority;

    // Load users into the assigned_to dropdown
    getCachedUsers().then(users => {
        const sel = document.getElementById('fixAssignedTo');
        if (!sel) return;
        sel.innerHTML = '<option value="">— Sin cambio —</option>';
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.username;
            opt.textContent = `${u.username} (${u.department || u.role})`;
            if (u.username === assignedTo) opt.selected = true;
            sel.appendChild(opt);
        });
    }).catch(err => console.error('Error loading users:', err));

    document.getElementById('fixModal').style.display = 'flex';
}

function closeFixModal() {
    document.getElementById('fixModal').style.display = 'none';
    document.getElementById('fixForm').reset();
}

document.addEventListener('DOMContentLoaded', () => {
    const fixForm = document.getElementById('fixForm');
    if (fixForm) {
        fixForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const ideaId = document.getElementById('fixIdeaId').value;
            const body = {};
            const type = document.getElementById('fixType').value;
            const cat = document.getElementById('fixCategory').value;
            const para = document.getElementById('fixParaType').value;
            const pri = document.getElementById('fixPriority').value;
            const assigned = document.getElementById('fixAssignedTo').value;

            if (type) body.ai_type = type;
            if (cat) body.ai_category = cat;
            if (para) body.para_type = para;
            if (pri) body.priority = pri;
            if (assigned) body.assigned_to = assigned;

            try {
                await fetch(`/api/ideas/${ideaId}/fix`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                showToast('Clasificacion corregida', 'success');
                closeFixModal();
                loadIdeas();
                initOverviewStats();
                loadInboxLog();
            } catch (err) {
                showToast('Error al corregir', 'error');
            }
        });
    }
});

window.openFixModal = openFixModal;
window.closeFixModal = closeFixModal;

// ═══════════════════════════════════════════════════════════════════════════════
// DIGEST (Tap on Shoulder — proactive summary)
// ═══════════════════════════════════════════════════════════════════════════════
function initDigest() {
    const btn = document.getElementById('btnDigest');
    if (btn) {
        btn.addEventListener('click', generateDigest);
    }
}

async function generateDigest() {
    showToast('Generando digest...', 'info');
    try {
        const res = await fetch('/api/ai/digest', { method: 'POST' });
        const data = await res.json();
        if (data.response) {
            const content = document.getElementById('digestContent');
            if (content) {
                content.innerHTML = renderMarkdown(data.response);
            }
            document.getElementById('digestModal').style.display = 'flex';
            showToast('Digest generado', 'success');
        }
    } catch (err) {
        console.error('Digest error:', err);
        showToast('Error al generar digest', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INBOX LOG (Receipt — audit trail)
// ═══════════════════════════════════════════════════════════════════════════════
let currentInboxPage = 1;

async function loadInboxLog(page = null) {
    if (page !== null) currentInboxPage = page;
    const list = document.getElementById('inboxLogList');
    const countEl = document.getElementById('inboxLogCount');
    if (!list) return;

    try {
        const res = await fetch(`/api/inbox-log?page=${currentInboxPage}&limit=20`);
        const data = await res.json();
        const items = data.items || data;
        const pagination = data.pagination;
        if (countEl) countEl.textContent = `${pagination ? pagination.total : items.length} entradas`;

        // Update pagination controls
        if (pagination) {
            const prevBtn = document.getElementById('inboxPrevPage');
            const nextBtn = document.getElementById('inboxNextPage');
            const infoEl = document.getElementById('inboxPageInfo');
            if (prevBtn) prevBtn.disabled = pagination.page <= 1;
            if (nextBtn) nextBtn.disabled = pagination.page >= pagination.pages;
            if (infoEl) infoEl.textContent = `Pagina ${pagination.page} de ${pagination.pages}`;
        }

        if (items.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:16px;">Sin entradas en el log</p>';
            return;
        }

        list.innerHTML = items.map(item => {
            const date = new Date(item.created_at);
            const formatted = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
            const conf = parseFloat(item.ai_confidence || 0);
            const confColor = conf >= 0.8 ? '#10b981' : conf >= 0.6 ? '#f59e0b' : '#ef4444';

            let classification = '';
            try {
                const cls = JSON.parse(item.ai_classification || '{}');
                classification = [cls.tipo, cls.categoria, cls.para_type].filter(Boolean).join(' / ');
            } catch (e) {
                classification = item.ai_classification || '—';
            }

            return `
                <div class="inbox-log-item ${item.reviewed ? 'reviewed' : ''} ${item.needs_review ? 'needs-review' : ''}">
                    <div class="inbox-log-main">
                        <span class="inbox-log-text">${escapeHtml((item.input_text || '').substring(0, 80))}${item.input_text && item.input_text.length > 80 ? '...' : ''}</span>
                        <span class="inbox-log-classification">${classification}</span>
                    </div>
                    <div class="inbox-log-meta">
                        <span class="confidence-dot" style="background:${confColor};" title="Confianza: ${(conf*100).toFixed(0)}%"></span>
                        <span class="inbox-log-routed">→ ${item.routed_to || 'inbox'}</span>
                        <span class="inbox-log-date">${formatted}</span>
                        ${item.needs_review && !item.reviewed ? `<button class="btn-review" onclick="markInboxReviewed(${item.id})">✓ Revisar</button>` : ''}
                        ${item.reviewed ? '<span class="reviewed-badge">✓</span>' : ''}
                    </div>
                </div>`;
        }).join('');
    } catch (err) {
        console.error('Inbox log error:', err);
        list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">Error al cargar inbox log</p>';
    }
}

async function markInboxReviewed(id) {
    try {
        await fetch(`/api/inbox-log/${id}/review`, { method: 'PUT' });
        showToast('Marcado como revisado', 'success');
        loadInboxLog();
    } catch (err) {
        showToast('Error', 'error');
    }
}

window.markInboxReviewed = markInboxReviewed;

window.distillIdea = distillIdea;
window.expressIdea = expressIdea;
window.distillContext = distillContext;
window.archiveContext = archiveContext;
window.switchSection = switchSection;

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTABILITY (Per-Consultant Checklist + Activity Dashboard)
// ═══════════════════════════════════════════════════════════════════════════════
let currentChecklistUser = null;

async function initReportability() {
    // Set today's date
    const dateEl = document.getElementById('reportDate');
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
    }

    // Load users into selector (only ranked members — exclude usuario/cliente)
    try {
        const allUsers = await getCachedUsers();
        const rankedUsers = allUsers.filter(u => !['usuario', 'cliente'].includes(u.role));
        const sel = document.getElementById('reportUserSelect');
        if (sel) {
            sel.innerHTML = '<option value="">— Seleccionar —</option>';
            rankedUsers.forEach(u => {
                sel.innerHTML += `<option value="${escapeHtml(u.username)}">${escapeHtml(u.username)} — ${escapeHtml(u.department || u.role)}</option>`;
            });
        }
    } catch (err) { console.error('Error loading users for report:', err); }

    // Load team summary
    loadTeamSummary();

    // Bind events
    const btnLoad = document.getElementById('btnLoadChecklist');
    if (btnLoad) {
        btnLoad.addEventListener('click', () => {
            const user = document.getElementById('reportUserSelect')?.value;
            if (!user) { showToast('Selecciona un consultor', 'info'); return; }
            loadChecklist(user);
        });
    }

    const btnFull = document.getElementById('btnFullReport');
    if (btnFull) {
        btnFull.addEventListener('click', loadFullReport);
    }
}

async function loadTeamSummary() {
    const strip = document.getElementById('teamSummaryStrip');
    if (!strip) return;

    try {
        const res = await fetch('/api/reportability/team-summary');
        const summary = await res.json();

        if (summary.length === 0) {
            strip.innerHTML = '<p style="color:var(--text-muted);">No hay usuarios registrados</p>';
            return;
        }

        strip.innerHTML = summary.map(u => {
            const pctColor = u.completion_pct >= 80 ? '#10b981' : u.completion_pct >= 50 ? '#f59e0b' : '#ef4444';
            return `
                <div class="team-member-card" onclick="loadChecklist('${escapeHtml(u.username)}')">
                    <div class="team-member-avatar" style="border:2px solid ${pctColor};">${_avatarHtml(u.avatar, u.username, 40)}</div>
                    <div class="team-member-info">
                        <span class="team-member-name">${u.username}</span>
                        <span class="team-member-dept">${u.department || u.role}</span>
                    </div>
                    <div class="team-member-stats">
                        <div class="team-member-progress">
                            <span class="team-member-pct" style="color:${pctColor};">${u.completion_pct}%</span>
                            <div class="progress-bar-mini">
                                <div class="progress-bar-fill" style="width:${u.completion_pct}%;background:${pctColor};"></div>
                            </div>
                        </div>
                        <div class="team-member-counts">
                            <span title="Completadas hoy">${u.completed_today}/${u.checklist_total}</span>
                            <span title="Total asignadas">📋 ${u.total_assigned}</span>
                            ${u.pending_waiting > 0 ? `<span title="Delegaciones pendientes" style="color:var(--warning);">⏳ ${u.pending_waiting}</span>` : ''}
                        </div>
                    </div>
                </div>`;
        }).join('');
    } catch (err) {
        console.error('Team summary error:', err);
        strip.innerHTML = '<p style="color:var(--text-muted);">Error al cargar resumen</p>';
    }
}

async function loadChecklist(username) {
    currentChecklistUser = username;
    const panel = document.getElementById('checklistPanel');
    const list = document.getElementById('checklistList');
    const titleEl = document.getElementById('checklistTitle');
    const progressEl = document.getElementById('checklistProgress');
    const barEl = document.getElementById('checklistProgressBar');
    const sel = document.getElementById('reportUserSelect');

    if (panel) panel.style.display = 'block';
    if (titleEl) titleEl.textContent = `📋 Checklist Diario — ${username}`;
    if (sel) sel.value = username;
    if (list) list.innerHTML = '<div class="loading-sm"><div class="spinner-sm"></div></div>';

    try {
        const res = await fetch(`/api/checklist/${username}`);
        const data = await res.json();

        // Update progress
        const completed = data.checklist.filter(c => c.completed).length;
        const total = data.checklist.length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        if (progressEl) progressEl.textContent = `${completed}/${total} completadas`;
        if (barEl) barEl.style.width = `${pct}%`;

        if (data.checklist.length === 0) {
            list.innerHTML = `
                <div class="checklist-empty">
                    <div class="empty-icon">✅</div>
                    <p>No hay tareas asignadas a <strong>${username}</strong></p>
                    <small>Las ideas clasificadas como Tarea, Proyecto o Delegacion y asignadas a este consultor apareceran aqui.</small>
                </div>`;
        } else {
            const priorityIcons = { alta: '🔴', media: '🟡', baja: '🟢' };
            list.innerHTML = data.checklist.map(item => {
                const pIcon = priorityIcons[item.priority] || '⚪';
                const areaTag = item.area_name ? `<span class="checklist-area">${item.area_icon || '📋'} ${item.area_name}</span>` : '';
                const typeTag = item.ai_type ? `<span class="checklist-type">${item.ai_type}</span>` : '';
                const completedClass = item.completed ? 'completed' : '';
                const completedTime = item.completed_at ? new Date(item.completed_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

                return `
                    <div class="checklist-item ${completedClass}" data-idea-id="${item.idea_id}">
                        <button class="checklist-toggle" onclick="toggleChecklistItem('${username}', ${item.idea_id})" title="${item.completed ? 'Desmarcar' : 'Completar'}">
                            ${item.completed ? '☑' : '☐'}
                        </button>
                        <div class="checklist-content">
                            <span class="checklist-text">${escapeHtml((item.text || '').substring(0, 120))}</span>
                            <div class="checklist-meta">
                                <span class="checklist-priority">${pIcon}</span>
                                ${typeTag}
                                ${areaTag}
                                ${completedTime ? `<span class="checklist-time">✓ ${completedTime}</span>` : ''}
                            </div>
                        </div>
                    </div>`;
            }).join('');
        }

        // Waiting-for section
        const waitingPanel = document.getElementById('checklistWaiting');
        const waitingList = document.getElementById('checklistWaitingList');
        if (data.waiting && data.waiting.length > 0 && waitingPanel && waitingList) {
            waitingPanel.style.display = 'block';
            waitingList.innerHTML = data.waiting.map(w => {
                const dueDate = w.due_date ? new Date(w.due_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';
                return `
                    <div class="checklist-waiting-item">
                        <span class="waiting-dot">⏳</span>
                        <span class="waiting-text">${escapeHtml(w.description)}</span>
                        ${w.area_name ? `<span class="checklist-area">${w.area_name}</span>` : ''}
                        ${dueDate ? `<span style="color:var(--warning);font-size:0.75rem;">⏰ ${dueDate}</span>` : ''}
                    </div>`;
            }).join('');
        } else if (waitingPanel) {
            waitingPanel.style.display = 'none';
        }

        // Refresh team summary to update percentages
        loadTeamSummary();

    } catch (err) {
        console.error('Checklist error:', err);
        if (list) list.innerHTML = '<p style="color:var(--text-muted);">Error al cargar checklist</p>';
    }
}

async function toggleChecklistItem(username, ideaId) {
    try {
        await fetch(`/api/checklist/${username}/${ideaId}/toggle`, { method: 'PUT' });
        loadChecklist(username);
    } catch (err) {
        showToast('Error al actualizar', 'error');
    }
}

async function loadFullReport() {
    const panel = document.getElementById('fullReportPanel');
    const grid = document.getElementById('reportCardsGrid');
    if (!panel || !grid) return;

    panel.style.display = 'block';
    grid.innerHTML = '<div class="loading-sm"><div class="spinner-sm"></div></div>';

    try {
        const res = await fetch('/api/reportability');
        const report = await res.json();

        if (report.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);">No hay datos para reportar</p>';
            return;
        }

        grid.innerHTML = report.map(entry => {
            const u = entry.user;
            const s = entry.stats;
            const pct = s.checklist_total > 0 ? Math.round((s.completed_today / s.checklist_total) * 100) : 0;
            const pctColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

            // Area breakdown
            let areaHtml = '';
            if (Object.keys(entry.by_area).length > 0) {
                areaHtml = '<div class="report-areas">' +
                    Object.entries(entry.by_area).map(([name, data]) =>
                        `<span class="report-area-tag">${data.icon} ${name}: ${data.count}</span>`
                    ).join('') + '</div>';
            }

            // CODE stage bar
            const total = s.by_stage.captured + s.by_stage.organized + s.by_stage.distilled + s.by_stage.expressed;
            const stageBar = total > 0 ? `
                <div class="report-stage-bar">
                    <div class="stage-segment" style="width:${(s.by_stage.captured/total)*100}%;background:#6b7280;" title="Capturadas: ${s.by_stage.captured}"></div>
                    <div class="stage-segment" style="width:${(s.by_stage.organized/total)*100}%;background:#3b82f6;" title="Organizadas: ${s.by_stage.organized}"></div>
                    <div class="stage-segment" style="width:${(s.by_stage.distilled/total)*100}%;background:#f59e0b;" title="Destiladas: ${s.by_stage.distilled}"></div>
                    <div class="stage-segment" style="width:${(s.by_stage.expressed/total)*100}%;background:#10b981;" title="Expresadas: ${s.by_stage.expressed}"></div>
                </div>` : '';

            // Top 5 assigned items
            const topItems = entry.assigned.slice(0, 5).map(i => {
                const priColor = { alta: '#ef4444', media: '#f59e0b', baja: '#22c55e' };
                return `<div class="report-task-item">
                    <span style="color:${priColor[i.priority] || '#6b7280'};">●</span>
                    <span>${escapeHtml((i.text || '').substring(0, 60))}</span>
                    <span class="report-task-type">${i.ai_type || '—'}</span>
                </div>`;
            }).join('');

            return `
                <div class="report-consultant-card">
                    <div class="report-card-header">
                        <div class="report-avatar" style="border-color:${pctColor};">${_avatarHtml(u.avatar, u.username, 48)}</div>
                        <div class="report-user-info">
                            <h3>${u.username}</h3>
                            <span>${u.department || u.role}</span>
                        </div>
                        <div class="report-pct" style="color:${pctColor};">
                            <span class="report-pct-num">${pct}%</span>
                            <span class="report-pct-label">hoy</span>
                        </div>
                    </div>
                    <div class="report-card-stats">
                        <div class="report-stat"><span class="report-stat-num">${s.total_assigned}</span><span>Asignadas</span></div>
                        <div class="report-stat"><span class="report-stat-num">${s.total_tasks}</span><span>Tareas</span></div>
                        <div class="report-stat"><span class="report-stat-num">${s.completed_today}/${s.checklist_total}</span><span>Hoy</span></div>
                        <div class="report-stat"><span class="report-stat-num">${s.pending_waiting}</span><span>Esperando</span></div>
                    </div>
                    ${stageBar}
                    ${areaHtml}
                    ${topItems ? `<div class="report-tasks-preview"><h4>Ultimas asignaciones</h4>${topItems}</div>` : ''}
                    <button class="btn btn-sm report-btn-checklist" onclick="loadChecklist('${u.username}')">Ver Checklist →</button>
                </div>`;
        }).join('');
    } catch (err) {
        console.error('Full report error:', err);
        grid.innerHTML = '<p style="color:var(--text-muted);">Error al cargar reporte</p>';
    }
}

window.loadChecklist = loadChecklist;
window.toggleChecklistItem = toggleChecklistItem;

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK CAPTURE (sub-5-second voice capture from Home or global shortcut)
// ═══════════════════════════════════════════════════════════════════════════════
let quickRecognition = null;
let quickIsRecording = false;

function initQuickCapture() {
    const input = document.getElementById('quickCaptureInput');
    const btnMic = document.getElementById('quickCaptureMic');
    const btnSend = document.getElementById('quickCaptureSend');
    const hint = document.getElementById('quickCaptureHint');
    if (!input) return;

    // Send on Enter
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            quickCaptureSave(input.value.trim());
        }
    });

    // Send button
    if (btnSend) {
        btnSend.addEventListener('click', () => {
            if (input.value.trim()) quickCaptureSave(input.value.trim());
        });
    }

    // Speech recognition for quick capture
    if (btnMic && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        quickRecognition = new SR();
        quickRecognition.lang = 'es-ES';
        quickRecognition.interimResults = false;

        quickRecognition.onstart = () => {
            quickIsRecording = true;
            if (btnMic) btnMic.classList.add('recording');
            if (hint) hint.textContent = '🔴 Escuchando...';
        };

        quickRecognition.onend = () => {
            quickIsRecording = false;
            if (btnMic) btnMic.classList.remove('recording');
            if (hint) hint.textContent = 'Ctrl+Shift+V desde cualquier seccion';
        };

        quickRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            input.value += (input.value ? ' ' : '') + transcript;
            input.focus();
        };

        quickRecognition.onerror = () => {
            quickIsRecording = false;
            if (btnMic) btnMic.classList.remove('recording');
            if (hint) hint.textContent = '❌ Error de microfono';
        };

        btnMic.addEventListener('click', () => {
            if (quickIsRecording) quickRecognition.stop();
            else quickRecognition.start();
        });
    }

    // Global shortcut: Ctrl+Shift+V → focus quick capture (or switch to home)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'V') {
            e.preventDefault();
            const homeSection = document.getElementById('section-home');
            if (!homeSection || !homeSection.classList.contains('active')) {
                switchSection('home');
            }
            setTimeout(() => {
                const qInput = document.getElementById('quickCaptureInput');
                if (qInput) qInput.focus();
            }, 100);
        }
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGINATION EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    // Ideas pagination
    const ideasPrev = document.getElementById('ideasPrevPage');
    const ideasNext = document.getElementById('ideasNextPage');
    if (ideasPrev) ideasPrev.addEventListener('click', () => { if (currentIdeasPage > 1) loadIdeas(null, currentIdeasPage - 1); });
    if (ideasNext) ideasNext.addEventListener('click', () => loadIdeas(null, currentIdeasPage + 1));

    // Inbox pagination
    const inboxPrev = document.getElementById('inboxPrevPage');
    const inboxNext = document.getElementById('inboxNextPage');
    if (inboxPrev) inboxPrev.addEventListener('click', () => { if (currentInboxPage > 1) loadInboxLog(currentInboxPage - 1); });
    if (inboxNext) inboxNext.addEventListener('click', () => loadInboxLog(currentInboxPage + 1));
});

// ═══════════════════════════════════════════════════════════════════════════════
// OLLAMA STATUS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════
async function checkOllamaStatus() {
    const dot = document.getElementById('ollamaDot');
    const label = document.getElementById('ollamaLabel');
    if (!dot || !label) return;
    try {
        const res = await fetch('/api/ollama/status');
        const data = await res.json();
        if (data.online && data.hasModel) {
            dot.className = 'ollama-dot online';
            label.textContent = `Ollama: ${data.model}`;
        } else if (data.online) {
            dot.className = 'ollama-dot offline';
            label.textContent = `Ollama: sin modelo`;
        } else {
            dot.className = 'ollama-dot offline';
            label.textContent = 'Ollama: offline';
        }
    } catch {
        dot.className = 'ollama-dot offline';
        label.textContent = 'Ollama: offline';
    }
}
checkOllamaStatus();
setInterval(checkOllamaStatus, 60000);

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL SEARCH (Cross-section)
// ═══════════════════════════════════════════════════════════════════════════════
let searchTimeout = null;

function initGlobalSearch() {
    const input = document.getElementById('globalSearchInput');
    const results = document.getElementById('globalSearchResults');
    if (!input || !results) return;

    input.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const q = input.value.trim();
        if (q.length < 2) { results.style.display = 'none'; return; }
        searchTimeout = setTimeout(() => performSearch(q), 300);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim().length >= 2) results.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#globalSearch')) results.style.display = 'none';
    });

    // Ctrl+K shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            input.focus();
            input.select();
        }
        if (e.key === 'Escape') { results.style.display = 'none'; input.blur(); }
    });
}

async function performSearch(q) {
    const results = document.getElementById('globalSearchResults');
    if (!results) return;

    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();

        if (data.total === 0) {
            results.innerHTML = '<div class="search-empty">Sin resultados para "' + escapeHtml(q) + '"</div>';
            results.style.display = 'block';
            return;
        }

        let html = '';
        const r = data.results;

        if (r.ideas.length > 0) {
            html += '<div class="search-group"><span class="search-group-label">💡 Ideas</span>';
            html += r.ideas.slice(0, 5).map(i => `<div class="search-result" onclick="switchSection('ideas')"><span class="search-result-text">${escapeHtml((i.text || '').substring(0, 80))}</span><span class="search-result-meta">${i.ai_type || ''} ${i.para_type || ''}</span></div>`).join('');
            html += '</div>';
        }
        if (r.context.length > 0) {
            html += '<div class="search-group"><span class="search-group-label">🧠 Memoria</span>';
            html += r.context.slice(0, 5).map(c => `<div class="search-result" onclick="switchSection('context')"><span class="search-result-text">${escapeHtml(c.key)}: ${escapeHtml((c.content || '').substring(0, 60))}</span></div>`).join('');
            html += '</div>';
        }
        if (r.areas.length > 0) {
            html += '<div class="search-group"><span class="search-group-label">📋 Areas</span>';
            html += r.areas.slice(0, 3).map(a => `<div class="search-result" onclick="switchSection('areas')"><span class="search-result-text">${a.icon || '📂'} ${escapeHtml(a.name)}</span></div>`).join('');
            html += '</div>';
        }
        if (r.projects.length > 0) {
            html += '<div class="search-group"><span class="search-group-label">🚀 Proyectos</span>';
            html += r.projects.slice(0, 3).map(p => `<div class="search-result" onclick="switchSection('projects')"><span class="search-result-text">${escapeHtml(p.name)}</span></div>`).join('');
            html += '</div>';
        }
        if (r.waiting.length > 0) {
            html += '<div class="search-group"><span class="search-group-label">⏳ Delegaciones</span>';
            html += r.waiting.slice(0, 3).map(w => `<div class="search-result" onclick="switchSection('waiting')"><span class="search-result-text">${escapeHtml((w.description || '').substring(0, 80))}</span></div>`).join('');
            html += '</div>';
        }

        html += `<div class="search-total">${data.total} resultados encontrados</div>`;
        results.innerHTML = html;
        results.style.display = 'block';
    } catch (err) {
        console.error('Search error:', err);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS (Browser Push for Urgent Tasks)
// ═══════════════════════════════════════════════════════════════════════════════
function initNotifications() {
    // First check is done by home-bundle; poll every 5 min after
    if (!window._notifInitialDone) checkNotifications();
    setInterval(checkNotifications, 5 * 60 * 1000);

    const bell = document.getElementById('notificationBell');
    const dropdown = document.getElementById('notificationDropdown');
    if (bell && dropdown) {
        bell.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        });
        document.addEventListener('click', () => { dropdown.style.display = 'none'; });
    }
}

// Called from home-bundle with pre-fetched data
function _renderNotifications(data) {
    if (!data) return;
    window._notifInitialDone = true;
    _applyNotificationData(data);
}

async function checkNotifications() {
    try {
        const res = await fetch('/api/notifications/check');
        const data = await res.json();
        _applyNotificationData(data);
    } catch (err) {
        console.error('Notification check error:', err);
    }
}

function _applyNotificationData(data) {
    try {
        const badge = document.getElementById('notificationBadge');
        const list = document.getElementById('notificationList');

        // Store current notifications for clear-all
        window._currentNotifications = data;

        if (badge) {
            if (data.total > 0) {
                badge.textContent = data.total;
                badge.style.display = 'inline-flex';
            } else {
                badge.style.display = 'none';
            }
        }

        if (list) {
            let html = '';
            if (data.total > 0) {
                html += '<button class="notif-clear-all" onclick="clearAllNotifications(event)">Limpiar todas</button>';
            }
            if (data.urgent_tasks.length > 0) {
                html += data.urgent_tasks.map(t =>
                    `<div class="notification-item urgent">
                        <span class="notif-icon">🔴</span>
                        <span class="notif-text">${escapeHtml((t.ai_summary || t.text || '').substring(0, 60))}</span>
                        <button class="notif-dismiss" onclick="dismissNotification(event, ${t.id}, 'urgent_task')" title="Descartar">✕</button>
                    </div>`
                ).join('');
            }
            if (data.overdue_delegations.length > 0) {
                html += data.overdue_delegations.map(d =>
                    `<div class="notification-item warning">
                        <span class="notif-icon">⏳</span>
                        <span class="notif-text">Vencida: ${escapeHtml((d.description || '').substring(0, 50))} → ${d.delegated_to}</span>
                        <button class="notif-dismiss" onclick="dismissNotification(event, ${d.id}, 'overdue_delegation')" title="Descartar">✕</button>
                    </div>`
                ).join('');
            }
            if (data.needs_review.length > 0) {
                html += data.needs_review.map(n =>
                    `<div class="notification-item review">
                        <span class="notif-icon">⚠️</span>
                        <span class="notif-text">Revisar: ${escapeHtml((n.ai_summary || n.text || '').substring(0, 50))}</span>
                        <button class="notif-dismiss" onclick="dismissNotification(event, ${n.id}, 'needs_review')" title="Descartar">✕</button>
                    </div>`
                ).join('');
            }
            if (data.stale_captures && data.stale_captures.length > 0) {
                html += data.stale_captures.map(s =>
                    `<div class="notification-item warning">
                        <span class="notif-icon">📥</span>
                        <span class="notif-text">Sin procesar: ${escapeHtml((s.text || '').substring(0, 50))}</span>
                        <button class="notif-dismiss" onclick="dismissNotification(event, ${s.id}, 'stale_capture')" title="Descartar">✕</button>
                    </div>`
                ).join('');
            }
            if (data.meeting_ready && data.meeting_ready.length > 0) {
                html += data.meeting_ready.map(m =>
                    `<div class="notification-item info" onclick="switchSection('reuniones')" style="cursor:pointer;">
                        <span class="notif-icon">📅</span>
                        <span class="notif-text">Reunion: ${escapeHtml((m.titulo || '').substring(0, 50))}</span>
                        <button class="notif-dismiss" onclick="dismissNotification(event, ${m.id}, 'meeting_ready')" title="Descartar">✕</button>
                    </div>`
                ).join('');
            }
            if (data.user_notifications && data.user_notifications.length > 0) {
                const typeIcons = { feedback_fixed: '🔧', feedback_rejected: '🔄', comment_on_skill: '💬', comment_on_output: '💬' };
                const typeColors = { feedback_fixed: '#8b5cf6', feedback_rejected: '#ef4444', comment_on_skill: '#3b82f6', comment_on_output: '#f59e0b' };
                html += data.user_notifications.map(n => {
                    const icon = typeIcons[n.type] || '🔔';
                    const color = typeColors[n.type] || '#6366f1';
                    return `<div class="notification-item notif-user" onclick="switchSection('${n.link_section || 'feedback'}')" style="cursor:pointer;border-left:3px solid ${color};">
                        <span class="notif-icon">${icon}</span>
                        <div class="notif-user-content">
                            <strong class="notif-user-title">${escapeHtml(n.title)}</strong>
                            <span class="notif-user-msg">${escapeHtml((n.message || '').substring(0, 100))}</span>
                        </div>
                        <button class="notif-dismiss" onclick="dismissNotification(event, ${n.id}, 'user_notification')" title="Descartar">✕</button>
                    </div>`;
                }).join('');
            }
            if (data.total === 0) {
                html = '<div class="notification-empty">Sin notificaciones pendientes</div>';
            }
            list.innerHTML = html;
        }

        // Toast for new user notifications (dedup)
        if (data.user_notifications && data.user_notifications.length > 0) {
            const newIds = data.user_notifications.map(n => n.id).sort().join(',');
            if (window._lastUserNotifIds !== undefined && newIds !== window._lastUserNotifIds) {
                const latest = data.user_notifications[0];
                showToast(latest.title || 'Nueva notificación', 'info');
            }
            window._lastUserNotifIds = newIds;
        } else {
            window._lastUserNotifIds = '';
        }

        // Browser push notification for urgent items (dedup: only notify on new items)
        if (data.urgent_tasks.length > 0 && 'Notification' in window) {
            const currentIds = data.urgent_tasks.map(t => t.id).sort().join(',');
            if (currentIds !== window._lastNotifiedIds) {
                window._lastNotifiedIds = currentIds;
                if (Notification.permission === 'default') {
                    Notification.requestPermission();
                }
                if (Notification.permission === 'granted') {
                    new Notification('SecondBrain — Tareas Urgentes', {
                        body: `${data.urgent_tasks.length} tarea(s) de alta prioridad pendientes`,
                        icon: '/favicon.ico'
                    });
                }
            }
        } else {
            window._lastNotifiedIds = null;
        }
    } catch (err) {
        console.error('Notification check error:', err);
    }
}

async function dismissNotification(event, id, type) {
    event.stopPropagation();
    try {
        const item = event.target.closest('.notification-item');
        if (item) {
            item.style.opacity = '0';
            item.style.transform = 'translateX(20px)';
            item.style.transition = 'all 0.25s ease';
        }
        await fetch(`/api/notifications/${id}/dismiss`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type })
        });
        setTimeout(() => checkNotifications(), 300);
    } catch (err) {
        console.error('Dismiss error:', err);
    }
}

async function clearAllNotifications(event) {
    event.stopPropagation();
    const data = window._currentNotifications;
    if (!data) return;

    const notifications = [];
    data.urgent_tasks.forEach(t => notifications.push({ id: t.id, type: 'urgent_task' }));
    data.overdue_delegations.forEach(d => notifications.push({ id: d.id, type: 'overdue_delegation' }));
    data.stale_captures.forEach(s => notifications.push({ id: s.id, type: 'stale_capture' }));
    data.needs_review.forEach(n => notifications.push({ id: n.id, type: 'needs_review' }));

    if (notifications.length === 0) return;

    try {
        await fetch('/api/notifications/clear-all', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notifications })
        });
        checkNotifications();
        showToast('Notificaciones descartadas', 'success');
    } catch (err) {
        console.error('Clear all error:', err);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS (Trend Charts)
// ═══════════════════════════════════════════════════════════════════════════════
let analyticsCharts = {};

async function initAnalytics() {
    // Charts will be loaded when the analytics section becomes visible
}

async function loadAnalytics() {
    if (!window.Chart) {
        document.querySelectorAll('#section-analytics canvas').forEach(c => {
            c.parentElement.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);">Chart.js no disponible. Verifica tu conexion a internet.</div>';
        });
        return;
    }

    try {
        const res = await fetch('/api/stats/analytics');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const chartDefaults = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#9ca3af' } } },
            scales: {
                x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(156,163,175,0.1)' } },
                y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(156,163,175,0.1)' } }
            }
        };

        // Destroy existing charts and reset canvases
        Object.values(analyticsCharts).forEach(c => c.destroy());
        analyticsCharts = {};
        document.querySelectorAll('#section-analytics canvas').forEach(canvas => {
            canvas.removeAttribute('width');
            canvas.removeAttribute('height');
            canvas.removeAttribute('style');
        });

        // Ideas per day
        const ctx1 = document.getElementById('chartIdeasPerDay');
        if (ctx1 && data.ideasPerDay) {
            analyticsCharts.ideasPerDay = new Chart(ctx1, {
                type: 'bar',
                data: {
                    labels: data.ideasPerDay.map(d => d.date?.substring(5) || ''),
                    datasets: [{ label: 'Ideas', data: data.ideasPerDay.map(d => d.count), backgroundColor: '#3b82f6', borderRadius: 4 }]
                },
                options: chartDefaults
            });
        }

        // Completion rate
        const ctx2 = document.getElementById('chartCompletionRate');
        if (ctx2 && data.completionPerDay) {
            analyticsCharts.completion = new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: data.completionPerDay.map(d => d.date?.substring(5) || ''),
                    datasets: [{ label: 'Tasa %', data: data.completionPerDay.map(d => d.rate), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.3 }]
                },
                options: chartDefaults
            });
        }

        // Active areas (horizontal bar)
        const ctx3 = document.getElementById('chartActiveAreas');
        if (ctx3 && data.activeAreas) {
            analyticsCharts.areas = new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: data.activeAreas.map(a => a.name),
                    datasets: [{ label: 'Ideas', data: data.activeAreas.map(a => a.idea_count), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'] }]
                },
                options: { ...chartDefaults, indexAxis: 'y' }
            });
        }

        // By type (doughnut)
        const ctx4 = document.getElementById('chartByType');
        if (ctx4 && data.byType && data.byType.length > 0) {
            analyticsCharts.byType = new Chart(ctx4, {
                type: 'doughnut',
                data: {
                    labels: data.byType.map(t => t.ai_type),
                    datasets: [{ data: data.byType.map(t => t.count), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'] }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#9ca3af' } } } }
            });
        } else if (ctx4) {
            ctx4.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.85rem;">Sin datos de tipos aun</div>';
        }

        // By priority (doughnut)
        const ctx5 = document.getElementById('chartByPriority');
        if (ctx5 && data.byPriority && data.byPriority.length > 0) {
            const priColors = { alta: '#ef4444', media: '#f59e0b', baja: '#22c55e' };
            analyticsCharts.byPriority = new Chart(ctx5, {
                type: 'doughnut',
                data: {
                    labels: data.byPriority.map(p => p.priority),
                    datasets: [{ data: data.byPriority.map(p => p.count), backgroundColor: data.byPriority.map(p => priColors[p.priority] || '#6b7280') }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#9ca3af' } } } }
            });
        } else if (ctx5) {
            ctx5.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.85rem;">Sin datos de prioridad aun</div>';
        }

        // User productivity (stacked bar)
        const ctx6 = document.getElementById('chartUserProductivity');
        if (ctx6 && data.userProductivity && data.userProductivity.length > 0) {
            analyticsCharts.userProd = new Chart(ctx6, {
                type: 'bar',
                data: {
                    labels: data.userProductivity.map(u => u.username),
                    datasets: [
                        { label: 'Ideas creadas', data: data.userProductivity.map(u => u.ideas_created), backgroundColor: '#3b82f6' },
                        { label: 'Destiladas', data: data.userProductivity.map(u => u.distilled), backgroundColor: '#f59e0b' },
                        { label: 'Expresadas', data: data.userProductivity.map(u => u.expressed), backgroundColor: '#10b981' }
                    ]
                },
                options: { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: true, labels: { color: '#9ca3af' } } } }
            });
        } else if (ctx6) {
            ctx6.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:0.85rem;">Sin datos de productividad aun</div>';
        }

        // CODE flow pipeline (visual funnel)
        const pipeline = document.getElementById('codeFlowPipeline');
        if (pipeline && data.codeFlow) {
            const stageMap = { captured: 'Capturada', organized: 'Organizada', distilled: 'Destilada', expressed: 'Expresada' };
            const stageColors = { captured: '#3b82f6', organized: '#f59e0b', distilled: '#8b5cf6', expressed: '#10b981' };
            const stageIcons = { captured: '📥', organized: '📂', distilled: '🧪', expressed: '🚀' };
            const stages = ['captured', 'organized', 'distilled', 'expressed'];
            const counts = {};
            data.codeFlow.forEach(r => { counts[r.code_stage] = r.count; });
            const total = stages.reduce((s, k) => s + (counts[k] || 0), 0) || 1;

            pipeline.innerHTML = stages.map((key, i) => {
                const count = counts[key] || 0;
                const pct = Math.round(count / total * 100);
                return `
                    <div class="cfp-stage">
                        <div class="cfp-icon">${stageIcons[key]}</div>
                        <div class="cfp-bar-wrap">
                            <div class="cfp-bar" style="width:${Math.max(pct, 4)}%;background:${stageColors[key]}"></div>
                        </div>
                        <div class="cfp-label">${stageMap[key]}</div>
                        <div class="cfp-count">${count} <span style="color:var(--text-muted);font-size:0.75rem">(${pct}%)</span></div>
                    </div>
                    ${i < stages.length - 1 ? '<div class="cfp-arrow">→</div>' : ''}
                `;
            }).join('');
        }

    } catch (err) {
        console.error('Analytics error:', err);
        showToast('Error cargando analytics: ' + err.message, 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT / IMPORT
// ═══════════════════════════════════════════════════════════════════════════════
function initExportImport() {
    const btnExport = document.getElementById('btnExportData');
    const importInput = document.getElementById('importFileInput');

    if (btnExport) {
        btnExport.addEventListener('click', async () => {
            const choice = await showCustomModal({
                title: '📦 Exportar Datos',
                message: `
                    <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
                        <button id="_expJSON" class="btn btn-sm" style="padding:12px;font-size:0.95rem;background:var(--bg-tertiary);border:1px solid var(--border);border-radius:8px;cursor:pointer;text-align:left;color:var(--text-primary);">
                            📄 <strong>JSON</strong> — Datos crudos (backup / importar)
                        </button>
                        <button id="_expExcel" class="btn btn-sm" style="padding:12px;font-size:0.95rem;background:linear-gradient(135deg,#10B981,#059669);border:none;border-radius:8px;cursor:pointer;text-align:left;color:#fff;">
                            📊 <strong>Excel con KPIs</strong> — Reporte ejecutivo con graficos, metricas y datos por hoja
                        </button>
                    </div>
                `,
                html: true,
                isConfirm: false,
                onOpen: () => {
                    document.getElementById('_expJSON')?.addEventListener('click', async () => {
                        document.getElementById('customModal').style.display = 'none';
                        showToast('Exportando JSON...', 'info');
                        try {
                            const res = await fetch('/api/export');
                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `secondbrain_export_${new Date().toISOString().split('T')[0]}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                            showToast('Datos exportados (JSON)', 'success');
                        } catch (err) { showToast('Error al exportar', 'error'); }
                    });
                    document.getElementById('_expExcel')?.addEventListener('click', async () => {
                        document.getElementById('customModal').style.display = 'none';
                        showToast('Generando reporte Excel...', 'info');
                        try {
                            const res = await fetch('/api/export-excel');
                            if (!res.ok) throw new Error('Export failed');
                            const blob = await res.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `SecondBrain_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
                            a.click();
                            URL.revokeObjectURL(url);
                            showToast('Reporte Excel exportado', 'success');
                        } catch (err) { showToast('Error al exportar Excel', 'error'); }
                    });
                }
            });
        });
    }

    if (importInput) {
        importInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const confirmed = await showCustomModal({
                title: '📥 Importar Datos',
                message: `¿Importar datos desde "${file.name}"? Esto agregara registros nuevos sin borrar los existentes.`,
                isConfirm: true
            });
            if (!confirmed) { importInput.value = ''; return; }

            try {
                const text = await file.text();
                const json = JSON.parse(text);
                const dataToImport = json.data || json;

                const res = await fetch('/api/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: dataToImport })
                });
                const result = await res.json();
                if (result.success) {
                    showToast(`Importado: ${result.imported.ideas} ideas, ${result.imported.context} contexto, ${result.imported.areas} areas`, 'success');
                    loadIdeas();
                    loadContext();
                    loadAreas();
                    initOverviewStats();
                }
            } catch (err) {
                showToast('Error al importar: formato invalido', 'error');
            }
            importInput.value = '';
        });
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE COMMANDS (Navigation by voice)
// ═══════════════════════════════════════════════════════════════════════════════
let voiceCommandRecognition = null;
let voiceCommandActive = false;

function initVoiceCommands() {
    const btn = document.getElementById('btnVoiceCommands');
    if (!btn) return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        btn.style.display = 'none';
        return;
    }

    btn.addEventListener('click', toggleVoiceCommands);
}

function toggleVoiceCommands() {
    const btn = document.getElementById('btnVoiceCommands');
    if (voiceCommandActive) {
        voiceCommandRecognition.stop();
        voiceCommandActive = false;
        if (btn) btn.textContent = '🎤 Voz';
        showToast('Comandos de voz desactivados', 'info');
        return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceCommandRecognition = new SR();
    voiceCommandRecognition.lang = 'es-ES';
    voiceCommandRecognition.continuous = true;
    voiceCommandRecognition.interimResults = false;

    voiceCommandRecognition.onstart = () => {
        voiceCommandActive = true;
        if (btn) btn.textContent = '🔴 Escuchando...';
        showToast('Comandos de voz activados. Di "ir a [seccion]", "buscar [tema]", o "capturar [idea]"', 'info');
    };

    voiceCommandRecognition.onend = () => {
        voiceCommandActive = false;
        if (btn) btn.textContent = '🎤 Voz';
    };

    voiceCommandRecognition.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        if (!last.isFinal) return;
        const cmd = last[0].transcript.toLowerCase().trim();
        handleVoiceCommand(cmd);
    };

    voiceCommandRecognition.onerror = () => {
        voiceCommandActive = false;
        if (btn) btn.textContent = '🎤 Voz';
    };

    voiceCommandRecognition.start();
}

function handleVoiceCommand(cmd) {
    const sectionMap = {
        'inicio': 'home', 'home': 'home', 'casa': 'home',
        'overview': 'overview', 'resumen': 'overview',
        'proyectos': 'projects', 'proyecto': 'projects',
        'areas': 'areas', 'area': 'areas',
        'archivos': 'archivos', 'recursos': 'archivos', 'documentos': 'archivos',
        'ideas': 'ideas', 'captura': 'ideas',
        'memoria': 'context', 'contexto': 'context',
        'espera': 'waiting', 'delegaciones': 'waiting',
        'reportabilidad': 'reportability', 'reporte': 'reportability',
        'analytics': 'analytics', 'analiticas': 'analytics', 'graficos': 'analytics'
    };

    // Navigation: "ir a [seccion]"
    const navMatch = cmd.match(/(?:ir a|abrir|mostrar|navegar a)\s+(.+)/);
    if (navMatch) {
        const target = navMatch[1].trim();
        const section = sectionMap[target];
        if (section) {
            switchSection(section);
            showToast(`Navegando a ${target}`, 'success');
            return;
        }
    }

    // Search: "buscar [tema]"
    const searchMatch = cmd.match(/(?:buscar|busca|encontrar)\s+(.+)/);
    if (searchMatch) {
        const q = searchMatch[1].trim();
        const input = document.getElementById('globalSearchInput');
        if (input) {
            input.value = q;
            input.dispatchEvent(new Event('input'));
            input.focus();
            showToast(`Buscando: ${q}`, 'info');
        }
        return;
    }

    // Capture: "capturar [idea]"
    const captureMatch = cmd.match(/(?:capturar|anotar|guardar|nueva idea)\s+(.+)/);
    if (captureMatch) {
        const text = captureMatch[1].trim();
        quickCaptureSave(text);
        showToast(`Capturando: ${text}`, 'info');
        return;
    }

    showToast(`Comando no reconocido: "${cmd}"`, 'info');
}

async function quickCaptureSave(text) {
    const input = document.getElementById('quickCaptureInput');
    const hint = document.getElementById('quickCaptureHint');
    if (hint) hint.textContent = 'Analizando...';

    try {
        // Preview first
        const previewRes = await fetch('/api/ai/preview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        let cachedPreview = null;
        if (previewRes.ok) {
            cachedPreview = await previewRes.json();
            const confirmed = await showVoicePreview(cachedPreview, text);
            if (!confirmed) {
                if (hint) hint.textContent = 'Cancelado';
                setTimeout(() => { if (hint) hint.textContent = 'Ctrl+Shift+V desde cualquier seccion'; }, 2000);
                return;
            }
        }

        // Save — send preview data to avoid duplicate AI call
        if (hint) hint.textContent = 'Guardando...';
        const res = await fetch('/api/ideas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, previewData: cachedPreview || undefined })
        });

        if (res.ok) {
            const data = await res.json();
            if (input) input.value = '';
            if (data.split) {
                showToast(`${data.count} ideas capturadas desde Home`, 'success');
                if (hint) hint.textContent = `✅ ${data.count} ideas creadas`;
            } else {
                showToast('Idea capturada desde Home', 'success');
                if (hint) hint.textContent = '✅ Capturada';
            }
            setTimeout(() => { if (hint) hint.textContent = 'Ctrl+Shift+V desde cualquier seccion'; }, 3000);
            // Refresh data in background
            loadIdeas();
            initHomeData();
        }
    } catch (err) {
        console.error('Quick capture error:', err);
        showToast('Error al capturar', 'error');
        if (hint) hint.textContent = '❌ Error';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTOMATION PIPELINE — Execute Ideas with Agents
// ═══════════════════════════════════════════════════════════════════════════════

const AVAILABLE_SKILLS = [
    { path: 'customizable/create-staffing-plan.md', label: 'Plan de Dotacion', agent: 'staffing' },
    { path: 'core/model-staffing-requirements.md', label: 'Modelo Requerimientos Personal', agent: 'staffing' },
    { path: 'customizable/create-training-plan.md', label: 'Plan de Capacitacion', agent: 'training' },
    { path: 'core/model-opex-budget.md', label: 'Modelo Presupuesto OPEX', agent: 'finance' },
    { path: 'core/audit-compliance-readiness.md', label: 'Auditoria de Cumplimiento', agent: 'compliance' },
    { path: 'core/classify-idea.md', label: 'Clasificar Idea (GTD)', agent: 'gtd' },
    { path: 'core/decompose-project.md', label: 'Descomponer Proyecto', agent: 'gtd' },
    { path: 'core/identify-next-action.md', label: 'Identificar Proxima Accion', agent: 'gtd' },
    { path: 'core/weekly-review.md', label: 'Revision Semanal', agent: 'gtd' }
];

function openExecuteModal(ideaId, suggestedAgent) {
    const agents = [
        { key: 'staffing', label: 'Staffing Agent (Dotacion)', icon: '👷' },
        { key: 'training', label: 'Training Agent (Capacitacion)', icon: '📚' },
        { key: 'finance', label: 'Finance Agent (Presupuesto)', icon: '💰' },
        { key: 'compliance', label: 'Compliance Agent (Auditoria)', icon: '📋' },
        { key: 'gtd', label: 'GTD Agent (Productividad)', icon: '🎯' }
    ];

    const agentOptions = agents.map(a =>
        `<option value="${a.key}" ${a.key === suggestedAgent ? 'selected' : ''}>${a.icon} ${a.label}</option>`
    ).join('');

    const agentTags = { staffing: 'Dotación', training: 'Capacitación', finance: 'Finanzas', compliance: 'Auditoría' };
    const skillCheckboxes = AVAILABLE_SKILLS.map(s => {
        const isRelevant = s.agent === suggestedAgent;
        return `<label class="skill-checkbox ${isRelevant ? 'relevant' : ''}" data-agent="${s.agent}">
            <input type="checkbox" name="exec_skill" value="${s.path}" ${isRelevant ? 'checked' : ''}>
            <span class="skill-label">${s.label}</span>
            <span class="skill-agent-tag">${agentTags[s.agent] || s.agent}</span>
        </label>`;
    }).join('');

    const modalHtml = `
    <div id="executeModal" class="modal" style="display:flex;z-index:2100;">
        <div class="modal-content" style="max-width:520px;">
            <span class="close-modal" onclick="closeExecuteModal()">&times;</span>
            <h2 class="modal-title">🤖 Ejecutar Idea con Agente</h2>
            <div style="padding:0 8px;">
                <div style="margin-bottom:16px;">
                    <label style="font-weight:600;font-size:0.82rem;margin-bottom:6px;display:block;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Agente</label>
                    <select id="execAgentSelect" class="form-input" onchange="updateExecSkills(this.value)" style="width:100%;padding:10px 14px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;color:var(--text-primary);font-size:0.9rem;">
                        ${agentOptions}
                    </select>
                </div>
                <div style="margin-bottom:16px;">
                    <label style="font-weight:600;font-size:0.82rem;margin-bottom:8px;display:block;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Skills a utilizar</label>
                    <div id="execSkillsList" style="display:flex;flex-direction:column;gap:8px;">
                        ${skillCheckboxes}
                    </div>
                </div>
                <p style="font-size:0.76rem;color:var(--text-muted);margin:12px 0 0;">Las skills seleccionadas se usarán como SOPs de contexto para el agente.</p>
                <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--border);">
                    <button class="btn" onclick="closeExecuteModal()" style="padding:8px 20px;">Cancelar</button>
                    <button class="btn btn-primary btn-execute" id="btnRunExecution" onclick="runExecution('${ideaId}')" style="padding:8px 24px;">🚀 Ejecutar</button>
                </div>
            </div>
        </div>
    </div>`;

    let container = document.getElementById('executeModalContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'executeModalContainer';
        document.body.appendChild(container);
    }
    container.innerHTML = modalHtml;
}

function updateExecSkills(agentKey) {
    const container = document.getElementById('execSkillsList');
    if (!container) return;
    container.querySelectorAll('.skill-checkbox').forEach(label => {
        const input = label.querySelector('input');
        const isRelevant = label.dataset.agent === agentKey;
        input.checked = isRelevant;
        label.classList.toggle('relevant', isRelevant);
    });
}

async function runExecution(ideaId) {
    const agent = document.getElementById('execAgentSelect')?.value;
    const skills = Array.from(document.querySelectorAll('input[name="exec_skill"]:checked')).map(cb => cb.value);

    if (!agent) return showToast('Selecciona un agente', 'error');
    if (skills.length === 0) return showToast('Selecciona al menos una skill', 'error');

    const btn = document.getElementById('btnRunExecution');
    if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-small"></span> Ejecutando...'; }

    closeExecuteModal();
    showToast('Ejecutando agente... esto puede tomar unos segundos', 'info');

    try {
        const res = await fetch(`/api/ideas/${ideaId}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent, skills })
        });
        const data = await res.json();

        if (data.success) {
            showToast('Ejecucion completada', 'success');
            showAgentResult('🚀 Output Generado', renderMarkdown(data.output));
            loadIdeas();
            if (typeof initHomeData === 'function') initHomeData();
        } else {
            showToast(`Error: ${data.error || 'Ejecucion fallida'}`, 'error');
            loadIdeas();
        }
    } catch (err) {
        console.error('Execution error:', err);
        showToast('Error de ejecucion', 'error');
        loadIdeas();
    }
}

function closeExecuteModal() {
    const modal = document.getElementById('executeModal');
    if (modal) modal.remove();
}

async function showExecutionOutput(ideaId) {
    try {
        const res = await fetch(`/api/ideas/${ideaId}/execution-output`);
        if (!res.ok) {
            showToast(`Error ${res.status} al cargar output`, 'error');
            return;
        }
        const data = await res.json();
        if (!data.execution_output) {
            showToast('No hay output disponible', 'warning');
            return;
        }

        const agentLabel = { staffing: '👷 Staffing', training: '📚 Training', finance: '💰 Finance', compliance: '📋 Compliance' }[data.suggested_agent] || '🤖 Agente';
        const executedDate = data.executed_at ? new Date(data.executed_at).toLocaleString('es-ES') : '';
        const renderedOutput = renderMarkdown(data.execution_output);

        // Store raw output for copy/download
        window._lastExecOutput = data.execution_output;
        window._lastExecAgent = data.suggested_agent || 'agent';

        // Remove any existing modal first
        const existing = document.getElementById('execOutputModal');
        if (existing) existing.remove();

        const modalDiv = document.createElement('div');
        modalDiv.id = 'execOutputModal';
        modalDiv.className = 'modal';
        modalDiv.style.cssText = 'display:flex;z-index:2100;';
        const reviewBadge = data.review_status === 'approved' ? '<span class="review-badge approved">Aprobado</span>'
            : data.review_status === 'needs_changes' ? '<span class="review-badge needs-changes">Requiere Cambios</span>'
            : '<span class="review-badge pending">Pendiente de Revision</span>';

        modalDiv.innerHTML = `
            <div class="modal-content exec-output-modal">
                <div class="exec-output-header">
                    <div class="exec-output-title">
                        <span class="exec-output-icon">🚀</span>
                        <div>
                            <h2>Output de Ejecucion ${reviewBadge}</h2>
                            <span class="exec-output-meta">${agentLabel} | ${data.executed_by || 'system'} | ${executedDate}</span>
                        </div>
                    </div>
                    <div class="exec-output-actions">
                        <button class="btn-exec-action" onclick="copyExecutionOutput()" title="Copiar al portapapeles">📋 Copiar</button>
                        <button class="btn-exec-action" onclick="downloadExecutionOutput('${ideaId}')" title="Descargar como Markdown">⬇ Descargar</button>
                        <span class="close-modal" onclick="document.getElementById('execOutputModal').remove()">&times;</span>
                    </div>
                </div>
                <div class="exec-output-body" id="execOutputBody">
                    ${renderedOutput}
                </div>
                <div class="exec-review-section" id="execReviewSection">
                    <h3>Revision</h3>
                    <div class="exec-review-actions">
                        <button class="btn btn-success" onclick="reviewApprove(${ideaId})">Aprobar</button>
                        <button class="btn btn-warning" onclick="reviewNeedsChanges(${ideaId})">Requiere Cambios</button>
                    </div>
                    <div class="exec-review-comments" id="execComments-${ideaId}">
                        <div class="loading-sm"><div class="spinner-sm"></div></div>
                    </div>
                    <div class="comment-form">
                        <textarea id="execCommentInput-${ideaId}" rows="2" placeholder="Comentario sobre este output..."></textarea>
                        <button class="btn btn-sm" onclick="submitOutputComment(${ideaId})">Enviar</button>
                    </div>
                </div>
            </div>`;

        // Click outside modal to close
        modalDiv.addEventListener('click', (e) => {
            if (e.target === modalDiv) modalDiv.remove();
        });

        document.body.appendChild(modalDiv);
        loadOutputComments(ideaId);
    } catch (err) {
        console.error('showExecutionOutput error:', err);
        showToast('Error al cargar output: ' + err.message, 'error');
    }
}

function copyExecutionOutput() {
    if (window._lastExecOutput) {
        navigator.clipboard.writeText(window._lastExecOutput).then(() => {
            showToast('Copiado al portapapeles', 'success');
        }).catch(() => {
            showToast('Error al copiar', 'error');
        });
    }
}

function downloadExecutionOutput(ideaId) {
    if (window._lastExecOutput) {
        const blob = new Blob([window._lastExecOutput], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `output-${window._lastExecAgent}-${ideaId}.md`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Descargando...', 'info');
    }
}

window.copyExecutionOutput = copyExecutionOutput;
window.downloadExecutionOutput = downloadExecutionOutput;

window.openExecuteModal = openExecuteModal;
window.closeExecuteModal = closeExecuteModal;
window.runExecution = runExecution;
window.showExecutionOutput = showExecutionOutput;
window.updateExecSkills = updateExecSkills;

// ═══════════════════════════════════════════════════════════════════════════════
// GTD — Getting Things Done Features
// ═══════════════════════════════════════════════════════════════════════════════

let gtdFilterDropdownsLoaded = false;

async function initGtdFilterDropdowns() {
    if (gtdFilterDropdownsLoaded) return;
    gtdFilterDropdownsLoaded = true;
    try {
        // Load GTD contexts
        const ctxRes = await fetch('/api/gtd/contexts');
        const contexts = await ctxRes.json();
        const ctxSelect = document.getElementById('filterContexto');
        if (ctxSelect && contexts.length) {
            contexts.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.name;
                opt.textContent = `${c.icon} ${c.name}`;
                ctxSelect.appendChild(opt);
            });
        }
        // Load users for assignee filter (only ranked members)
        {
            const allUsers = await getCachedUsers();
            const rankedUsers = allUsers.filter(u => !['usuario', 'cliente'].includes(u.role));
            const assignSelect = document.getElementById('filterAssignee');
            if (assignSelect && rankedUsers.length) {
                rankedUsers.forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u.username;
                    opt.textContent = `👤 ${u.username}`;
                    assignSelect.appendChild(opt);
                });
            }
        }
    } catch (err) {
        console.error('GTD filter init error:', err);
    }
}

function applyGtdFilters() {
    currentIdeasPage = 1;
    loadIdeas();
}

function clearGtdFilters() {
    ['filterContexto', 'filterEnergia', 'filterCompromiso', 'filterAssignee'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    loadIdeas('all');
}

// ─── Inline Sub-tasks Toggle (lazy load) ────────────────────────────────────
async function toggleInlineSubtasks(ideaId) {
    const container = document.getElementById(`projSubs-${ideaId}`);
    const toggle = document.getElementById(`projToggle-${ideaId}`);
    const wrapper = document.getElementById(`projInline-${ideaId}`);
    if (!container) return;

    // Toggle visibility
    if (container.style.display !== 'none') {
        container.style.display = 'none';
        if (toggle) toggle.textContent = '▸ Ver sub-tareas';
        return;
    }

    container.style.display = 'block';
    if (toggle) toggle.textContent = '▾ Ocultar';

    // Lazy load on first open
    if (wrapper && wrapper.dataset.loaded === 'false') {
        container.innerHTML = '<div style="padding:8px;font-size:0.78rem;color:var(--text-muted);">Cargando...</div>';
        try {
            const res = await fetch(`/api/ideas/${ideaId}/subtasks`);
            const subs = await res.json();
            wrapper.dataset.loaded = 'true';

            if (subs.length === 0) {
                container.innerHTML = '<div style="padding:6px 0;font-size:0.78rem;color:var(--text-muted);">Sin sub-tareas. Usa 📂→ para descomponer.</div>';
                return;
            }

            const done = subs.filter(s => s.completada == 1).length;
            const total = subs.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const ctxIcons = {'@computador':'💻','@email':'📧','@telefono':'📱','@oficina':'🏢','@calle':'🚶','@casa':'🏠','@espera':'⏳','@compras':'🛒','@investigar':'🔍','@reunion':'👥','@leer':'📖'};

            container.innerHTML = `
                <div class="inline-progress">
                    <div class="inline-progress-info"><span>${done}/${total}</span><span>${pct}%</span></div>
                    <div class="inline-progress-bar"><div class="inline-progress-fill" style="width:${pct}%"></div></div>
                </div>
                ${subs.map(st => {
                    const isNext = st.proxima_accion == 1;
                    const isDone = st.completada == 1;
                    return `<div class="inline-subtask ${isDone ? 'done' : ''} ${isNext ? 'next' : ''}">
                        <input type="checkbox" ${isDone ? 'checked disabled' : ''} onchange="completeIdea('${st.id}')" style="accent-color:#059669;cursor:pointer;">
                        <span class="inline-subtask-text">${isNext ? '🎯 ' : ''}${escapeHtml(st.text)}</span>
                        <span class="inline-subtask-meta">
                            ${st.assigned_to ? `👤${st.assigned_to}` : ''}
                            ${st.contexto ? ctxIcons[st.contexto] || '' : ''}
                        </span>
                    </div>`;
                }).join('')}
            `;
        } catch (err) {
            container.innerHTML = '<div style="padding:6px 0;font-size:0.78rem;color:#ef4444;">Error al cargar</div>';
        }
    }
}
window.toggleInlineSubtasks = toggleInlineSubtasks;

// ─── Complete Task ──────────────────────────────────────────────────────────
async function completeIdea(ideaId) {
    try {
        const res = await fetch(`/api/ideas/${ideaId}/complete`, { method: 'POST' });
        if (res.ok) {
            showToast('Tarea completada', 'success');
            loadIdeas();
        } else {
            showToast('Error al completar', 'error');
        }
    } catch (err) {
        showToast('Error de red', 'error');
    }
}

async function reopenIdea(ideaId) {
    try {
        const res = await fetch(`/api/ideas/${ideaId}/reopen`, { method: 'POST' });
        if (res.ok) {
            showToast('Tarea reabierta', 'success');
            loadIdeas();
        } else {
            showToast('Error al reabrir', 'error');
        }
    } catch (err) {
        showToast('Error de red', 'error');
    }
}

// ─── Decompose Idea into Project ────────────────────────────────────────────
async function decomposeIdea(ideaId) {
    if (!confirm('¿Convertir esta idea en un PROYECTO con sub-tareas?')) return;
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = '⏳';
    try {
        const res = await fetch(`/api/ideas/${ideaId}/decompose`, { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success) {
            showToast(`Proyecto "${data.project_name}" creado con ${data.count} sub-tareas`, 'success');
            loadIdeas();
        } else {
            showToast(data.error || 'Error al descomponer', 'error');
        }
    } catch (err) {
        showToast('Error de red', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '📂→';
    }
}

// ─── View Sub-tasks of a Project ────────────────────────────────────────────
async function viewSubtasks(ideaId) {
    try {
        const res = await fetch(`/api/ideas/${ideaId}/subtasks`);
        const subtasks = await res.json();

        const subtaskHtml = subtasks.length === 0
            ? '<p style="color:var(--text-muted);">No hay sub-tareas. Usa el boton "📂→" para descomponer.</p>'
            : subtasks.map(st => {
                const isNext = st.proxima_accion == 1;
                const isDone = st.completada == 1;
                const ctxIcons = {'@computador':'💻','@email':'📧','@telefono':'📱','@oficina':'🏢','@calle':'🚶','@casa':'🏠','@espera':'⏳','@compras':'🛒','@investigar':'🔍','@reunion':'👥','@leer':'📖'};
                const eIcons = { baja: '🟢', media: '🟡', alta: '🔴' };
                return `<div class="subtask-item ${isDone ? 'done' : ''} ${isNext ? 'next-action' : ''}" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;background:${isDone ? 'rgba(34,197,94,0.08)' : isNext ? 'rgba(5,150,105,0.1)' : 'var(--bg-secondary)'};border:1px solid ${isNext ? '#059669' : 'var(--border)'};margin-bottom:6px;">
                    <input type="checkbox" ${isDone ? 'checked disabled' : ''} onchange="completeIdea('${st.id}')" style="width:18px;height:18px;accent-color:#059669;cursor:pointer;">
                    <div style="flex:1;">
                        <div style="font-size:0.88rem;${isDone ? 'text-decoration:line-through;opacity:0.6;' : ''}">${isNext ? '🎯 ' : ''}${escapeHtml(st.text)}</div>
                        <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">
                            ${st.assigned_to ? `<span class="badge" style="background:#f59e0b;color:white;padding:1px 6px;border-radius:8px;font-size:0.65rem;">👤 ${st.assigned_to}</span>` : ''}
                            ${st.contexto ? `<span class="badge" style="background:#0891b2;color:white;padding:1px 6px;border-radius:8px;font-size:0.65rem;">${ctxIcons[st.contexto]||'📍'} ${st.contexto}</span>` : ''}
                            ${st.energia ? `<span class="badge" style="background:#6b7280;color:white;padding:1px 6px;border-radius:8px;font-size:0.65rem;">${eIcons[st.energia]||'⚡'} ${st.energia}</span>` : ''}
                            ${st.estimated_time ? `<span class="badge" style="background:#6366f1;color:white;padding:1px 6px;border-radius:8px;font-size:0.65rem;">⏱ ${st.estimated_time}</span>` : ''}
                        </div>
                    </div>
                </div>`;
            }).join('');

        const done = subtasks.filter(s => s.completada == 1).length;
        const total = subtasks.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        const modalHtml = `
        <div id="subtasksModal" class="modal" style="display:flex;z-index:2100;">
            <div class="modal-content" style="max-width:600px;">
                <span class="close-modal" onclick="document.getElementById('subtasksModal').remove()">&times;</span>
                <h2 class="modal-title">📂 Sub-tareas del Proyecto</h2>
                <div style="margin-bottom:12px;">
                    <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-muted);margin-bottom:4px;">
                        <span>${done}/${total} completadas</span>
                        <span>${pct}%</span>
                    </div>
                    <div style="background:var(--bg-tertiary);border-radius:6px;height:8px;overflow:hidden;">
                        <div style="background:#059669;height:100%;width:${pct}%;border-radius:6px;transition:width 0.3s;"></div>
                    </div>
                </div>
                <div style="max-height:400px;overflow-y:auto;padding-right:4px;">
                    ${subtaskHtml}
                </div>
            </div>
        </div>`;

        let container = document.getElementById('subtasksModalContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'subtasksModalContainer';
            document.body.appendChild(container);
        }
        container.innerHTML = modalHtml;
    } catch (err) {
        showToast('Error al cargar sub-tareas', 'error');
    }
}

// ─── GTD Board — Proximas Acciones agrupadas ────────────────────────────────
async function loadGtdBoard(groupBy = 'context') {
    const container = document.getElementById('gtdBoardColumns');
    const effContainer = document.getElementById('gtdEffectiveness');
    if (!container) return;

    // Toggle active button
    ['gtdViewContext','gtdViewEnergy','gtdViewAssignee','gtdViewCompromiso'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
    });
    const activeId = { context: 'gtdViewContext', energy: 'gtdViewEnergy', assignee: 'gtdViewAssignee', compromiso: 'gtdViewCompromiso' }[groupBy];
    if (activeId) document.getElementById(activeId)?.classList.add('active');

    container.innerHTML = '<div class="loading-sm"><div class="spinner-sm"></div></div>';

    try {
        const [effRes, ideasRes] = await Promise.all([
            fetch('/api/gtd/effectiveness'),
            fetch('/api/ideas?limit=100&completada=0')
        ]);
        const eff = await effRes.json();
        const ideasData = await ideasRes.json();
        const ideas = ideasData.ideas || [];

        // Effectiveness summary
        if (effContainer) {
            effContainer.innerHTML = `
                <div class="gtd-eff-card"><span class="gtd-eff-icon">📂</span><span class="gtd-eff-number">${eff.activeProjects || 0}</span><span class="gtd-eff-label">Proyectos Activos</span></div>
                <div class="gtd-eff-card"><span class="gtd-eff-icon">🎯</span><span class="gtd-eff-number">${eff.nextActions?.length || 0}</span><span class="gtd-eff-label">Proximas Acciones</span></div>
                <div class="gtd-eff-card"><span class="gtd-eff-icon">📋</span><span class="gtd-eff-number">${ideas.length}</span><span class="gtd-eff-label">Tareas Pendientes</span></div>
                <div class="gtd-eff-card"><span class="gtd-eff-icon">👥</span><span class="gtd-eff-number">${eff.byAssignee?.length || 0}</span><span class="gtd-eff-label">Consultores Activos</span></div>
            `;
        }

        // Group ideas
        const groups = {};
        let groupField, labelMap;

        if (groupBy === 'context') {
            groupField = 'contexto';
            labelMap = {'@computador':'💻 Computador','@email':'📧 Email','@telefono':'📱 Telefono','@oficina':'🏢 Oficina','@calle':'🚶 Calle','@casa':'🏠 Casa','@espera':'⏳ Espera','@compras':'🛒 Compras','@investigar':'🔍 Investigar','@reunion':'👥 Reunion','@leer':'📖 Leer'};
        } else if (groupBy === 'energy') {
            groupField = 'energia';
            labelMap = { baja: '🟢 Baja Energia', media: '🟡 Media Energia', alta: '🔴 Alta Energia' };
        } else if (groupBy === 'assignee') {
            groupField = 'assigned_to';
            labelMap = {};
        } else if (groupBy === 'compromiso') {
            groupField = 'tipo_compromiso';
            labelMap = { comprometida: '🔒 Comprometida', esta_semana: '📅 Esta Semana', algun_dia: '💭 Algun Dia', tal_vez: '🤷 Tal Vez' };
        }

        const fallbackLabels = {
            context: '📍 Sin Contexto',
            energy: '⚡ Sin Energia',
            assignee: '👤 Sin Persona',
            compromiso: '📌 Sin Compromiso'
        };
        const fallbackLabel = fallbackLabels[groupBy] || 'Sin Asignar';

        ideas.forEach(idea => {
            const key = idea[groupField] || '_sin_asignar';
            if (!groups[key]) groups[key] = [];
            groups[key].push(idea);
        });

        if (Object.keys(groups).length === 0) {
            container.innerHTML = '<div class="ideas-empty"><div class="empty-icon">🎯</div><p>No hay tareas pendientes</p></div>';
            return;
        }

        container.innerHTML = Object.entries(groups).map(([key, items]) => {
            const label = key === '_sin_asignar' ? fallbackLabel : ((labelMap && labelMap[key]) || `👤 ${key}`);
            const itemsHtml = items.slice(0, 15).map(idea => {
                const isNext = idea.proxima_accion == 1;
                const isAlta = idea.priority === 'alta';
                const extraClass = isNext ? 'next-action' : (isAlta ? 'priority-alta' : '');
                const badges = [];
                if (idea.assigned_to) badges.push(`<span class="gtd-mini-badge">👤 ${escapeHtml(idea.assigned_to)}</span>`);
                if (idea.estimated_time) badges.push(`<span class="gtd-mini-badge badge-time">⏱ ${escapeHtml(idea.estimated_time)}</span>`);
                if (isAlta) badges.push(`<span class="gtd-mini-badge badge-alta">ALTA</span>`);

                return `<div class="gtd-board-item ${extraClass}" draggable="true" data-id="${idea.id}"
                    ondragstart="onDragStart(event, '${idea.id}')" ondragend="onDragEnd(event)"
                    onclick="viewSubtasks('${idea.parent_idea_id || idea.id}')">
                    <div class="gtd-item-row">
                        <input type="checkbox" class="gtd-item-checkbox" onclick="event.stopPropagation();completeIdea('${idea.id}')">
                        <span class="gtd-item-text">${isNext ? '🎯 ' : ''}${escapeHtml((idea.ai_summary || idea.text || '').substring(0, 100))}</span>
                    </div>
                    ${badges.length ? `<div class="gtd-item-badges">${badges.join('')}</div>` : ''}
                </div>`;
            }).join('');

            const moreCount = items.length > 15 ? `<div class="gtd-item-badges" style="justify-content:center;padding:4px;"><span class="gtd-mini-badge">+${items.length - 15} mas</span></div>` : '';

            return `<div class="gtd-board-column"
                ondragover="onDragOver(event)" ondragleave="onDragLeave(event)"
                ondrop="onDrop(event, '${key === '_sin_asignar' ? '' : key}', '${groupField}')">
                <div class="gtd-board-column-header">
                    <span>${label}</span>
                    <span class="gtd-board-count">${items.length}</span>
                </div>
                <div class="gtd-board-column-body">${itemsHtml}${moreCount}</div>
            </div>`;
        }).join('');

    } catch (err) {
        console.error('GTD Board error:', err);
        container.innerHTML = '<p style="color:var(--text-muted);">Error al cargar el tablero GTD</p>';
    }
}

// ─── GTD Projects List ──────────────────────────────────────────────────────
async function loadGtdProjects() {
    const container = document.getElementById('gtdProjectsList');
    const countEl = document.getElementById('gtdProjectsCount');
    if (!container) return;

    container.innerHTML = '<div class="loading-sm"><div class="spinner-sm"></div></div>';

    try {
        const res = await fetch('/api/ideas?is_project=1&limit=50&sort=priority');
        const data = await res.json();
        const projects = (data.ideas || []);

        if (countEl) countEl.textContent = projects.length;

        if (projects.length === 0) {
            container.innerHTML = '<div class="ideas-empty"><div class="empty-icon">📂</div><p>No hay proyectos GTD. Las ideas tipo "Proyecto" apareceran aqui automaticamente.</p></div>';
            return;
        }

        // For each project, get subtasks
        const projectCards = await Promise.all(projects.map(async (proj) => {
            let subtasksHtml = '';
            let progressHtml = '';
            try {
                const subRes = await fetch(`/api/ideas/${proj.id}/subtasks`);
                const subs = await subRes.json();
                const done = subs.filter(s => s.completada == 1).length;
                const total = subs.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                const nextAction = subs.find(s => s.proxima_accion == 1 && s.completada != 1);

                progressHtml = total > 0 ? `
                    <div style="margin-top:8px;">
                        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-muted);">
                            <span>${done}/${total} sub-tareas</span><span>${pct}%</span>
                        </div>
                        <div style="background:var(--bg-tertiary);border-radius:4px;height:6px;margin-top:2px;">
                            <div style="background:#059669;height:100%;width:${pct}%;border-radius:4px;"></div>
                        </div>
                    </div>` : '';

                if (nextAction) {
                    subtasksHtml = `<div style="margin-top:6px;padding:6px 10px;background:rgba(5,150,105,0.08);border-left:3px solid #059669;border-radius:4px;font-size:0.8rem;">
                        🎯 <strong>Proxima:</strong> ${escapeHtml(nextAction.text.substring(0, 100))}
                        ${nextAction.assigned_to ? ` — 👤 ${nextAction.assigned_to}` : ''}
                    </div>`;
                }
            } catch (e) { /* ignore subtask errors */ }

            const isDone = proj.completada == 1;
            const prioColors = { alta: '#ef4444', media: '#f59e0b', baja: '#3b82f6' };
            const prioLabels = { alta: 'ALTA', media: 'MEDIA', baja: 'BAJA' };
            const prioColor = prioColors[proj.priority] || null;
            return `<div class="idea-card ${isDone ? 'completed-project' : ''}" style="opacity:${isDone ? '0.6' : '1'};${proj.priority === 'alta' && !isDone ? 'border-left:3px solid #ef4444;' : ''}">
                <div class="idea-stage-indicator" style="background:${isDone ? '#22c55e' : (prioColor || '#dc2626')}">📂</div>
                <div class="idea-content">
                    <p style="font-weight:600;">${escapeHtml(proj.ai_summary || proj.text)}</p>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">
                        ${prioColor ? `<span class="badge" style="background:${prioColor};color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${prioLabels[proj.priority]}</span>` : ''}
                        ${proj.ai_category ? `<span class="badge" style="background:#10b981;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${proj.ai_category}</span>` : ''}
                        ${proj.assigned_to ? `<span class="badge" style="background:#f59e0b;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">👤 ${proj.assigned_to}</span>` : ''}
                        ${isDone ? '<span class="badge" style="background:#22c55e;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">✅ Completado</span>' : ''}
                    </div>
                    ${progressHtml}
                    ${subtasksHtml}
                    <div style="margin-top:8px;display:flex;gap:6px;">
                        ${proj.execution_output ? `<button class="btn-code-action" onclick="event.stopPropagation();showExecutionOutput('${proj.id}')">🚀 Ver Output</button>` : ''}
                        <button class="btn-code-action" onclick="viewSubtasks('${proj.id}')">📋 Ver Sub-tareas</button>
                        ${!isDone ? `<button class="btn-code-action btn-complete" onclick="completeIdea('${proj.id}')">✅ Completar</button>` : ''}
                    </div>
                </div>
            </div>`;
        }));

        container.innerHTML = projectCards.join('');
    } catch (err) {
        console.error('GTD Projects error:', err);
        container.innerHTML = '<p style="color:var(--text-muted);">Error al cargar proyectos</p>';
    }
}

// ─── Daily Report ───────────────────────────────────────────────────────────
async function generateDailyReport() {
    const btn = document.getElementById('btnDailyReport');
    const content = document.getElementById('dailyReportContent');
    const stats = document.getElementById('dailyReportStats');
    if (!content) return;

    if (btn) { btn.disabled = true; btn.textContent = '⏳ Generando...'; }
    content.innerHTML = '<div class="loading-sm"><div class="spinner-sm"></div></div>';

    try {
        const res = await fetch('/api/gtd/daily-report');
        const data = await res.json();

        if (stats && data.stats) {
            stats.innerHTML = `
                <div class="gtd-eff-card"><span class="gtd-eff-number">${data.stats.ideas_today}</span><span class="gtd-eff-label">Ideas Hoy</span></div>
                <div class="gtd-eff-card"><span class="gtd-eff-number">${data.stats.completed_today}</span><span class="gtd-eff-label">Completadas Hoy</span></div>
                <div class="gtd-eff-card"><span class="gtd-eff-number">${data.stats.active_projects}</span><span class="gtd-eff-label">Proyectos Activos</span></div>
                <div class="gtd-eff-card"><span class="gtd-eff-number">${data.stats.pending_delegations}</span><span class="gtd-eff-label">Delegaciones</span></div>
            `;
        }

        content.innerHTML = renderMarkdown(data.report || 'No se pudo generar el reporte.');
    } catch (err) {
        content.innerHTML = '<p style="color:#ef4444;">Error al generar el reporte diario.</p>';
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = '🔄 General'; }
    }
}

async function loadSelectedBriefing() {
    const select = document.getElementById('briefingUserSelect');
    const username = select?.value;
    if (!username) return showToast('Selecciona un usuario primero', 'error');
    await loadUserBriefing(username);
}

// Populate briefing user dropdown
(async function populateBriefingUsers() {
    try {
        const users = await getCachedUsers();
        const ranked = users.filter(u => !['usuario', 'cliente'].includes(u.role));
        const sel = document.getElementById('briefingUserSelect');
        if (sel) {
            ranked.forEach(u => {
                const opt = document.createElement('option');
                opt.value = u.username;
                opt.textContent = `${u.username} (${u.role})`;
                sel.appendChild(opt);
            });
        }
    } catch (_) {}
})();

// Expose GTD functions globally
window.completeIdea = completeIdea;
window.reopenIdea = reopenIdea;
window.decomposeIdea = decomposeIdea;
window.viewSubtasks = viewSubtasks;
window.loadGtdBoard = loadGtdBoard;
window.loadGtdProjects = loadGtdProjects;
window.generateDailyReport = generateDailyReport;
window.applyGtdFilters = applyGtdFilters;
window.clearGtdFilters = clearGtdFilters;
window.initGtdFilterDropdowns = initGtdFilterDropdowns;

// ═══════════════════════════════════════════════════════════════════════════════
// OPENCLAW MONITOR
// ═══════════════════════════════════════════════════════════════════════════════

// Toggle explainer panel
const ocToggle = document.getElementById('toggleOcExplainer');
const ocBody = document.getElementById('ocExplainerBody');
if (ocToggle && ocBody) {
    const hidden = localStorage.getItem('ocExplainerHidden') === '1';
    if (hidden) { ocBody.style.display = 'none'; ocToggle.textContent = 'Mostrar'; }
    ocToggle.addEventListener('click', () => {
        const isHidden = ocBody.style.display === 'none';
        ocBody.style.display = isHidden ? '' : 'none';
        ocToggle.textContent = isHidden ? 'Ocultar' : 'Mostrar';
        localStorage.setItem('ocExplainerHidden', isHidden ? '0' : '1');
    });
}

const OC_AGENT_META = {
    PM:         { icon: '📋', label: 'Project Manager', color: '#6366f1' },
    DEV:        { icon: '💻', label: 'Developer',       color: '#10b981' },
    BUILDER:    { icon: '🔨', label: 'Builder',         color: '#f59e0b' },
    QA:         { icon: '🔍', label: 'Quality Assurance',color: '#8b5cf6' },
    CONSULTING: { icon: '📊', label: 'Consulting',      color: '#06b6d4' },
    REVIEWER:   { icon: '📝', label: 'Reviewer',        color: '#ec4899' }
};

async function loadOpenClawStatus() {
    try {
        const res = await fetch('/api/openclaw/status');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        renderOpenClawPipeline(data.pipeline);
        renderOpenClawAgents(data.agents);
        renderOpenClawActivity(data.activity);
        const el = document.getElementById('ocProjectsBuilt');
        if (el) el.textContent = data.projects_built || 0;
    } catch (err) {
        console.error('OpenClaw status error:', err);
    }
}

function renderOpenClawPipeline(p) {
    if (!p) return;
    const map = {
        ocPending: p.pending, ocQueued: p.queued, ocInProgress: p.in_progress,
        ocDeveloped: p.developed, ocBuilt: p.built, ocReviewing: p.reviewing,
        ocCompleted: p.completed, ocFailed: p.failed, ocBlocked: p.blocked
    };
    Object.entries(map).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || 0;
    });
}

function renderOpenClawAgents(agents) {
    const container = document.getElementById('openclawAgents');
    if (!container) return;

    if (!agents || agents.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;width:100%;">Los agentes aun no han procesado ideas. Asigna ideas a agentes desde la seccion Captura o ejecuta el pipeline OpenClaw.</p>';
        return;
    }

    // Build cards for all known agents
    const knownAgents = ['PM', 'DEV', 'BUILDER', 'QA', 'CONSULTING', 'REVIEWER'];
    const agentMap = {};
    agents.forEach(a => { agentMap[a.agent] = a; });

    container.innerHTML = knownAgents.map(name => {
        const meta = OC_AGENT_META[name] || { icon: '🤖', label: name, color: '#6b7280' };
        const a = agentMap[name];
        const lastActive = a ? timeAgo(a.last_active) : 'Inactivo';
        const count = a ? a.total_processed : 0;
        const isActive = a && a.last_active && (Date.now() - new Date(a.last_active + 'Z').getTime()) < 5 * 60 * 1000;

        return `
            <div class="stat-card" style="border-left:3px solid ${meta.color};">
                <div class="stat-icon" style="font-size:1.5rem;">${meta.icon}</div>
                <div class="stat-info">
                    <span class="stat-number">${count}</span>
                    <span class="stat-label">${meta.label}</span>
                    <span style="font-size:0.7rem;color:var(--text-muted);">
                        ${isActive ? '<span style="color:#10b981;">●</span>' : '<span style="color:#6b7280;">●</span>'} ${lastActive}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function renderOpenClawActivity(activity) {
    const container = document.getElementById('openclawActivity');
    if (!container) return;

    if (!activity || activity.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);text-align:center;">Sin actividad registrada.</p>';
        return;
    }

    const STATUS_ICONS = {
        queued_software: '📋', queued_consulting: '📋',
        in_progress: '⚙️', developed: '💻', built: '🔨',
        reviewing: '🔍', completed: '✅', failed: '❌', blocked: '🚫'
    };

    container.innerHTML = activity.map(a => {
        const icon = STATUS_ICONS[a.execution_status] || '📌';
        const title = a.ai_summary || (a.text || '').substring(0, 80);
        const agent = a.executed_by || '—';
        const when = a.executed_at ? timeAgo(a.executed_at) : '';

        return `
            <div class="inbox-log-item" style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border);">
                <span style="font-size:1.1rem;">${icon}</span>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:0.85rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">#${a.id} — ${escapeHtml(title)}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">
                        <span class="badge ${a.execution_status}" style="font-size:0.65rem;padding:1px 6px;">${a.execution_status}</span>
                        por <strong>${escapeHtml(agent)}</strong> · ${when}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const now = Date.now();
    const then = new Date(dateStr + (dateStr.includes('Z') ? '' : 'Z')).getTime();
    const diff = Math.max(0, now - then);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `hace ${days}d`;
}

window.loadOpenClawStatus = loadOpenClawStatus;

// ═══════════════════════════════════════════════════════════════════════════════
// REVISION — Review Queue, Comments, Skill Tabs
// ═══════════════════════════════════════════════════════════════════════════════

let _reviewData = null;
let _reviewSkillsCache = [];
let _reviewSkillCommentMap = {};
let _revSkillCategory = 'all';
let _revSkillPage = 1;
const REV_SKILLS_PER_PAGE = 15;
let _auditTimeline = [];

async function loadReviewQueue() {
    try {
        const [reviewRes, skillsRes] = await Promise.all([
            fetch('/api/review/queue'),
            fetch('/api/skills')
        ]);

        if (!reviewRes.ok || !skillsRes.ok) {
            const errMsg = !reviewRes.ok ? `Review API: ${reviewRes.status}` : `Skills API: ${skillsRes.status}`;
            throw new Error(errMsg);
        }

        const reviewData = await reviewRes.json();
        const skills = Array.isArray(skillsRes) ? skillsRes : await skillsRes.json();
        _reviewData = reviewData;

        // Stats
        const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        const stats = reviewData.stats || {};
        el('revStatOutputs', stats.total_outputs || 0);
        el('revStatPending', stats.pending_review || 0);
        el('revStatApproved', stats.approved || 0);
        el('revStatChanges', stats.needs_changes || 0);

        // Output filter chip counts
        el('revChipAll', stats.total_outputs || 0);
        el('revChipPending', stats.pending_review || 0);
        el('revChipApproved', stats.approved || 0);
        el('revChipChanges', stats.needs_changes || 0);

        // Build skill comment map and cache
        _reviewSkillCommentMap = {};
        (reviewData.skill_comments || []).forEach(sc => { _reviewSkillCommentMap[sc.target_id] = sc.comment_count; });
        _reviewSkillsCache = Array.isArray(skills) ? skills : [];

        // Skill category counts
        const sCounts = { all: _reviewSkillsCache.length, core: 0, customizable: 0, integration: 0 };
        _reviewSkillsCache.forEach(s => { if (sCounts[s.category] !== undefined) sCounts[s.category]++; });
        el('revSkillAll', sCounts.all);
        el('revSkillCore', sCounts.core);
        el('revSkillCustom', sCounts.customizable);
        el('revSkillInteg', sCounts.integration);

        // Render skills list
        _revSkillCategory = 'all';
        _revSkillPage = 1;
        renderReviewSkills();

        // Render outputs list
        renderReviewOutputs(reviewData.outputs || [], reviewData.output_comments || []);

    } catch (err) {
        console.error('loadReviewQueue error:', err);
        // Show error in UI instead of infinite spinner
        const skillsList = document.getElementById('reviewSkillsList');
        if (skillsList) skillsList.innerHTML = `<div class="empty-state">Error cargando skills: ${err.message}</div>`;
        const outputsList = document.getElementById('reviewOutputsList');
        if (outputsList) outputsList.innerHTML = `<div class="empty-state">Error cargando outputs: ${err.message}</div>`;
    }
}

function renderReviewOutputs(outputs, outputComments) {
    const list = document.getElementById('reviewOutputsList');
    if (!list) return;

    const commentMap = {};
    (outputComments || []).forEach(oc => { commentMap[oc.target_id] = oc.comment_count; });

    if (!outputs || outputs.length === 0) {
        list.innerHTML = '<div class="empty-state">No hay outputs pendientes de revision.</div>';
        return;
    }

    list.innerHTML = outputs.map(o => {
        const badge = o.review_status === 'approved' ? '<span class="review-badge approved">Aprobado</span>'
            : o.review_status === 'needs_changes' ? '<span class="review-badge needs-changes">Requiere Cambios</span>'
            : '<span class="review-badge pending">Pendiente</span>';
        const agentLabel = o.suggested_agent || o.executed_by || 'agente';
        const commentCount = commentMap[String(o.id)] || 0;
        const commentBadge = commentCount > 0 ? `<span class="review-badge reviewed">${commentCount} com.</span>` : '';
        const date = o.executed_at ? new Date(o.executed_at).toLocaleDateString('es-ES') : '';

        return `<div class="review-item" onclick="showExecutionOutput(${o.id})">
            <div class="review-item-info">
                <span class="review-item-icon">📄</span>
                <div>
                    <strong>#${o.id}: ${(o.ai_summary || o.text || '').substring(0, 60)}</strong>
                    <span class="review-item-meta">${agentLabel} | ${date}</span>
                </div>
            </div>
            <div class="review-item-actions">
                ${badge} ${commentBadge}
            </div>
        </div>`;
    }).join('');
}

function filterReviewOutputs(filter) {
    if (!_reviewData) return;
    // Update active chip
    document.querySelectorAll('#reviewOutputFilters .skill-filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.filter === filter);
    });
    let filtered = _reviewData.outputs;
    if (filter === 'pending') filtered = filtered.filter(o => !o.review_status);
    else if (filter === 'approved') filtered = filtered.filter(o => o.review_status === 'approved');
    else if (filter === 'needs_changes') filtered = filtered.filter(o => o.review_status === 'needs_changes');
    renderReviewOutputs(filtered, _reviewData.output_comments);
}

// ─── Skill Tabs ─────────────────────────────────────────────────────────────

function switchSkillTab(tab) {
    const tabs = document.querySelectorAll('#skillTabs .review-tab');
    tabs.forEach((t, i) => {
        const tabNames = ['content', 'documents', 'comments'];
        if (tabNames[i] === tab) t.classList.add('active');
        else t.classList.remove('active');
    });

    ['skillTabContent', 'skillTabDocuments', 'skillTabComments'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const activePanel = document.getElementById(
        tab === 'content' ? 'skillTabContent' :
        tab === 'documents' ? 'skillTabDocuments' : 'skillTabComments'
    );
    if (activePanel) activePanel.style.display = 'block';
}

async function loadSkillComments(skillPath) {
    const container = document.getElementById('skillCommentsList');
    if (!container) return;
    container.innerHTML = '<div class="loading-sm"><div class="spinner-sm"></div></div>';

    try {
        const res = await fetch(`/api/comments?target_type=skill&target_id=${encodeURIComponent(skillPath)}`);
        const comments = await res.json();
        renderCommentsList(container, comments, 'skill', skillPath);
    } catch (err) {
        container.innerHTML = '<div class="error-msg">Error al cargar comentarios</div>';
    }
}

function _docIcon(name) {
    const ext = (name || '').split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📕';
    if (ext === 'docx') return '📘';
    if (ext === 'md') return '📝';
    if (ext === 'txt') return '📄';
    return '📎';
}

async function loadSkillDocuments(skillPath) {
    const container = document.getElementById('skillDocsList');
    if (!container) return;
    container.innerHTML = '<div class="loading-sm"><div class="spinner-sm"></div></div>';

    const isAdminOrMgr = window.__USER__ && ['admin', 'manager'].includes(window.__USER__.role);

    try {
        const res = await fetch(`/api/skill-documents?skill=${encodeURIComponent(skillPath)}`);
        const docs = await res.json();

        if (docs.length === 0) {
            container.innerHTML = '<div class="empty-state" style="padding:16px;">No hay documentos vinculados a este skill.</div>';
            return;
        }

        container.innerHTML = docs.map(d => {
            const icon = _docIcon(d.document_name);
            const downloadBtn = d.file_path
                ? `<a href="/api/skill-documents/download/${d.id}" class="btn-icon-sm" title="Descargar">⬇️</a>`
                : '';
            const linkBtn = d.document_url
                ? `<a href="${d.document_url}" target="_blank" class="btn-icon-sm" title="Abrir enlace">🔗</a>`
                : '';
            const deleteBtn = isAdminOrMgr
                ? `<button class="btn-icon-sm" onclick="event.stopPropagation();deleteSkillDocument(${d.id})" title="Eliminar">🗑️</button>`
                : '';
            const date = d.created_at ? new Date(d.created_at).toLocaleDateString('es-ES') : '';

            return `<div class="skill-doc-item">
                <span class="skill-doc-icon">${icon}</span>
                <div class="skill-doc-info">
                    <strong>${d.document_name}</strong>
                    ${d.description ? `<p>${d.description}</p>` : ''}
                </div>
                <div class="skill-doc-meta">
                    <span>${d.created_by || ''}</span>
                    <span>${date}</span>
                    ${downloadBtn}${linkBtn}${deleteBtn}
                </div>
            </div>`;
        }).join('');
    } catch (err) {
        container.innerHTML = '<div class="error-msg">Error al cargar documentos</div>';
    }
}

function toggleSkillDocUpload() {
    const form = document.getElementById('skillDocUploadForm');
    if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function uploadSkillDocument() {
    const skillPath = document.getElementById('skillModalPath')?.value;
    const fileInput = document.getElementById('skillDocFile');
    const descInput = document.getElementById('skillDocDescription');
    const statusEl = document.getElementById('skillDocUploadStatus');

    if (!skillPath || !fileInput?.files?.length) {
        if (statusEl) statusEl.textContent = 'Selecciona un archivo';
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('skill_path', skillPath);
    if (descInput?.value.trim()) formData.append('description', descInput.value.trim());

    if (statusEl) statusEl.textContent = 'Subiendo...';

    try {
        const res = await fetch('/api/skill-documents/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Error al subir');

        showToast(`Documento "${data.document_name}" subido`, 'success');
        fileInput.value = '';
        if (descInput) descInput.value = '';
        if (statusEl) statusEl.textContent = '';
        document.getElementById('skillDocUploadForm').style.display = 'none';
        loadSkillDocuments(skillPath);
    } catch (err) {
        if (statusEl) statusEl.textContent = err.message;
        showToast('Error: ' + err.message, 'error');
    }
}

async function deleteSkillDocument(docId) {
    if (!confirm('Eliminar este documento?')) return;
    const skillPath = document.getElementById('skillModalPath')?.value;

    try {
        const res = await fetch(`/api/skill-documents/${docId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
        showToast('Documento eliminado', 'success');
        if (skillPath) loadSkillDocuments(skillPath);
    } catch (err) {
        showToast('Error al eliminar documento', 'error');
    }
}

window.toggleSkillDocUpload = toggleSkillDocUpload;
window.uploadSkillDocument = uploadSkillDocument;
window.deleteSkillDocument = deleteSkillDocument;

async function submitSkillComment() {
    const skillPath = document.getElementById('skillModalPath')?.value;
    const input = document.getElementById('skillCommentInput');
    const sectionSelect = document.getElementById('skillCommentSection');
    if (!skillPath || !input || !input.value.trim()) return;

    const section = sectionSelect?.value || null;

    try {
        const res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_type: 'skill', target_id: skillPath, content: input.value.trim(), section })
        });
        if (!res.ok) throw new Error('Failed');
        input.value = '';
        if (sectionSelect) sectionSelect.value = '';
        loadSkillComments(skillPath);
        showToast('Comentario enviado', 'success');
    } catch (err) {
        showToast('Error al enviar comentario', 'error');
    }
}

// ─── Inline Comments (text selection → comment) ─────────────────────────────

let _inlinePopover = null;
let _inlineSelectedText = '';

function initInlineComments() {
    const contentArea = document.getElementById('skillModalContent');
    if (!contentArea) return;

    // Remove old listeners to avoid duplicates
    contentArea.removeEventListener('mouseup', _handleContentMouseUp);
    contentArea.addEventListener('mouseup', _handleContentMouseUp);

    // Close popover when clicking outside
    document.addEventListener('mousedown', (e) => {
        if (_inlinePopover && !_inlinePopover.contains(e.target)) {
            _cancelInlineComment();
        }
    });
}

function _handleContentMouseUp(e) {
    const sel = window.getSelection();
    const text = sel ? sel.toString().trim() : '';

    if (!text || text.length < 3) {
        return;
    }

    // Don't show popover if clicking inside existing popover
    if (_inlinePopover && _inlinePopover.contains(e.target)) return;

    _inlineSelectedText = text;
    _showInlinePopover(e);
}

function _showInlinePopover(e) {
    _removeInlinePopover();

    // Append inside the .modal (z-index: 2000) so it's above the overlay
    const modalEl = document.getElementById('skillModal');
    if (!modalEl) return;

    const modalContent = modalEl.querySelector('.modal-content');
    if (!modalContent) return;

    const modalRect = modalContent.getBoundingClientRect();
    const popover = document.createElement('div');
    popover.className = 'inline-comment-popover';

    const truncated = _inlineSelectedText.length > 120
        ? _inlineSelectedText.substring(0, 120) + '...'
        : _inlineSelectedText;

    popover.innerHTML = `
        <div class="popover-header">
            <span class="popover-icon">💬</span>
            <span>Comentar seleccion</span>
            <button class="popover-close" onclick="_cancelInlineComment()">&times;</button>
        </div>
        <div class="popover-quote">"${escapeHtml(truncated)}"</div>
        <button class="inline-comment-btn" onclick="event.stopPropagation(); _expandInlineForm()">
            Agregar comentario
        </button>
    `;

    // Fixed position anchored to the right edge of the modal
    const topPos = Math.max(modalRect.top + 40, Math.min(e.clientY - 30, modalRect.bottom - 220));

    // Check if there's space to the right
    const spaceRight = window.innerWidth - modalRect.right;
    if (spaceRight >= 320) {
        // Float to the right of the modal (Jira style)
        popover.style.left = (modalRect.right + 12) + 'px';
    } else {
        // Inside the modal at the right edge
        popover.style.left = (modalRect.right - 310) + 'px';
    }
    popover.style.top = topPos + 'px';

    modalEl.appendChild(popover);
    _inlinePopover = popover;
}

function _expandInlineForm() {
    if (!_inlinePopover) return;

    const truncated = _inlineSelectedText.length > 120
        ? _inlineSelectedText.substring(0, 120) + '...'
        : _inlineSelectedText;

    _inlinePopover.innerHTML = `
        <div class="popover-header">
            <span class="popover-icon">💬</span>
            <span>Nuevo comentario</span>
            <button class="popover-close" onclick="_cancelInlineComment()">&times;</button>
        </div>
        <div class="popover-quote">"${escapeHtml(truncated)}"</div>
        <div class="inline-comment-form">
            <textarea id="inlineCommentText" placeholder="Escribe tu comentario..." autofocus></textarea>
            <div class="actions">
                <button class="btn-cancel" onclick="_cancelInlineComment()">Cancelar</button>
                <button class="btn-send" onclick="_submitInlineComment()">Enviar</button>
            </div>
        </div>
    `;

    setTimeout(() => {
        const ta = document.getElementById('inlineCommentText');
        if (ta) ta.focus();
    }, 50);
}

async function _submitInlineComment() {
    const textarea = document.getElementById('inlineCommentText');
    const skillPath = document.getElementById('skillModalPath')?.value;
    if (!textarea || !textarea.value.trim() || !skillPath) return;

    try {
        const res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target_type: 'skill',
                target_id: skillPath,
                content: textarea.value.trim(),
                highlighted_text: _inlineSelectedText
            })
        });
        if (!res.ok) throw new Error('Failed');

        _cancelInlineComment();
        showToast('Comentario inline enviado', 'success');

        // Refresh highlights and comments
        await _applyInlineHighlights(skillPath);
        loadSkillComments(skillPath);
    } catch (err) {
        showToast('Error al enviar comentario', 'error');
    }
}

function _removeInlinePopover() {
    if (_inlinePopover) {
        _inlinePopover.remove();
        _inlinePopover = null;
    }
}

function _cancelInlineComment() {
    _removeInlinePopover();
    _inlineSelectedText = '';
}

// ─── Highlight existing comments on skill content ───────────────────────────

async function _applyInlineHighlights(skillPath) {
    const contentEl = document.getElementById('skillModalContent');
    if (!contentEl) return;

    try {
        const res = await fetch(`/api/comments?target_type=skill&target_id=${encodeURIComponent(skillPath)}`);
        const comments = await res.json();
        const highlighted = comments.filter(c => c.highlighted_text);

        if (highlighted.length === 0) return;

        // Group by highlighted_text
        const groups = {};
        highlighted.forEach(c => {
            const key = c.highlighted_text;
            if (!groups[key]) groups[key] = [];
            groups[key].push(c);
        });

        // Walk through text nodes and wrap matches
        const pre = contentEl.querySelector('pre');
        if (!pre) return;

        const fullText = pre.textContent;
        const fragments = [];
        let lastIndex = 0;

        // Collect all match ranges, sorted by position
        const matches = [];
        for (const [text, cmts] of Object.entries(groups)) {
            let searchFrom = 0;
            while (true) {
                const idx = fullText.indexOf(text, searchFrom);
                if (idx === -1) break;
                matches.push({ start: idx, end: idx + text.length, text, count: cmts.length, ids: cmts.map(c => c.id) });
                searchFrom = idx + text.length;
                break; // Only highlight first occurrence per unique text
            }
        }

        if (matches.length === 0) return;
        matches.sort((a, b) => a.start - b.start);

        // Build new content with <mark> tags (avoid overlaps)
        let html = '';
        let cursor = 0;
        for (const m of matches) {
            if (m.start < cursor) continue; // Skip overlapping
            html += escapeHtml(fullText.substring(cursor, m.start));
            html += `<mark class="inline-comment-highlight" data-comment-ids="${m.ids.join(',')}" title="${m.count} comentario${m.count > 1 ? 's' : ''}" onclick="_scrollToInlineComment(${m.ids[0]})">${escapeHtml(m.text)}</mark>`;
            cursor = m.end;
        }
        html += escapeHtml(fullText.substring(cursor));

        pre.innerHTML = html;
    } catch (err) {
        console.error('Error applying inline highlights:', err);
    }
}

function _scrollToInlineComment(commentId) {
    // Switch to comments tab and scroll to the comment
    switchSkillTab('comments');
    setTimeout(() => {
        const commentEl = document.querySelector(`.comment-item[data-comment-id="${commentId}"]`);
        if (commentEl) {
            commentEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            commentEl.style.outline = '2px solid #f59e0b';
            setTimeout(() => { commentEl.style.outline = ''; }, 2000);
        }
    }, 200);
}

// Navigate from comment → highlighted text in content tab
function _goToHighlightedText(text) {
    switchSkillTab('content');
    setTimeout(() => {
        const contentEl = document.getElementById('skillModalContent');
        if (!contentEl) return;

        // Look for a <mark> highlight first
        const marks = contentEl.querySelectorAll('mark.inline-comment-highlight');
        for (const mark of marks) {
            if (mark.textContent.includes(text.substring(0, 40))) {
                mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
                mark.style.outline = '2px solid #6366f1';
                mark.style.background = 'rgba(99, 102, 241, 0.3)';
                setTimeout(() => { mark.style.outline = ''; mark.style.background = ''; }, 2500);
                return;
            }
        }

        // Fallback: search raw text in the <pre> element
        const pre = contentEl.querySelector('pre');
        if (!pre) return;
        const fullText = pre.textContent;
        const idx = fullText.indexOf(text.substring(0, 60));
        if (idx === -1) return;

        // Create a temporary highlight via Range
        const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
        let charCount = 0;
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const nodeLen = node.textContent.length;
            if (charCount + nodeLen > idx) {
                const range = document.createRange();
                const startOffset = idx - charCount;
                range.setStart(node, Math.min(startOffset, nodeLen));
                range.setEnd(node, Math.min(startOffset + Math.min(text.length, 80), nodeLen));

                const tempMark = document.createElement('span');
                tempMark.style.cssText = 'background:rgba(99,102,241,0.35);border-radius:2px;outline:2px solid #6366f1;';
                range.surroundContents(tempMark);
                tempMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => { tempMark.replaceWith(...tempMark.childNodes); }, 2500);
                return;
            }
            charCount += nodeLen;
        }
    }, 150);
}

// Navigate from comment → section heading in content tab
function _goToSection(sectionName) {
    switchSkillTab('content');
    setTimeout(() => {
        const contentEl = document.getElementById('skillModalContent');
        if (!contentEl) return;
        const pre = contentEl.querySelector('pre');
        if (!pre) return;

        // Find the heading text in the pre content
        const lines = pre.textContent.split('\n');
        const targetLine = lines.findIndex(l => l.replace(/^#+\s+/, '').trim() === sectionName);
        if (targetLine === -1) return;

        // Use TreeWalker to find and highlight
        const searchText = lines[targetLine].trim();
        const fullText = pre.textContent;
        const idx = fullText.indexOf(searchText);
        if (idx === -1) return;

        const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
        let charCount = 0;
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const nodeLen = node.textContent.length;
            if (charCount + nodeLen > idx) {
                const range = document.createRange();
                const startOffset = idx - charCount;
                range.setStart(node, Math.min(startOffset, nodeLen));
                range.setEnd(node, Math.min(startOffset + searchText.length, nodeLen));
                const tempMark = document.createElement('span');
                tempMark.style.cssText = 'background:rgba(99,102,241,0.35);border-radius:2px;outline:2px solid #6366f1;';
                range.surroundContents(tempMark);
                tempMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => { tempMark.replaceWith(...tempMark.childNodes); }, 2500);
                return;
            }
            charCount += nodeLen;
        }
    }, 150);
}

// Expose to window
window._expandInlineForm = _expandInlineForm;
window._submitInlineComment = _submitInlineComment;
window._removeInlinePopover = _removeInlinePopover;
window._cancelInlineComment = _cancelInlineComment;
window._scrollToInlineComment = _scrollToInlineComment;
window._goToHighlightedText = _goToHighlightedText;
window._goToSection = _goToSection;

// ─── Output Review Actions ──────────────────────────────────────────────────

async function reviewApprove(ideaId) {
    try {
        const res = await fetch(`/api/review/${ideaId}/approve`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed');
        showToast('Output aprobado', 'success');
        // Update badge in modal
        const modal = document.getElementById('execOutputModal');
        if (modal) modal.remove();
        loadReviewQueue();
    } catch (err) {
        showToast('Error al aprobar', 'error');
    }
}

async function reviewNeedsChanges(ideaId) {
    const feedback = document.getElementById(`execCommentInput-${ideaId}`)?.value || '';
    try {
        const res = await fetch(`/api/review/${ideaId}/needs-changes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback })
        });
        if (!res.ok) throw new Error('Failed');
        showToast('Marcado como requiere cambios', 'success');
        const modal = document.getElementById('execOutputModal');
        if (modal) modal.remove();
        loadReviewQueue();
    } catch (err) {
        showToast('Error al marcar cambios', 'error');
    }
}

// ─── Output Comments ────────────────────────────────────────────────────────

async function loadOutputComments(ideaId) {
    const container = document.getElementById(`execComments-${ideaId}`);
    if (!container) return;

    try {
        const res = await fetch(`/api/comments?target_type=output&target_id=${ideaId}`);
        const comments = await res.json();
        renderCommentsList(container, comments, 'output', String(ideaId));
    } catch (err) {
        container.innerHTML = '<div class="error-msg">Error al cargar comentarios</div>';
    }
}

async function submitOutputComment(ideaId) {
    const input = document.getElementById(`execCommentInput-${ideaId}`);
    if (!input || !input.value.trim()) return;

    try {
        const res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_type: 'output', target_id: String(ideaId), content: input.value.trim() })
        });
        if (!res.ok) throw new Error('Failed');
        input.value = '';
        loadOutputComments(ideaId);
        showToast('Comentario enviado', 'success');
    } catch (err) {
        showToast('Error al enviar comentario', 'error');
    }
}

// ─── Shared comment renderer ────────────────────────────────────────────────

function renderCommentsList(container, comments, targetType, targetId) {
    if (!comments || comments.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding:12px;font-size:0.85rem;">No hay comentarios aun.</div>';
        return;
    }

    container.innerHTML = comments.map(c => {
        const date = new Date(c.created_at).toLocaleString('es-ES');
        const canDelete = window.__USER__ && (window.__USER__.username === c.username || window.__USER__.role === 'admin' || window.__USER__.role === 'ceo');
        const safeTargetId = escapeHtml(String(targetId));
        const deleteBtn = canDelete ? `<button class="btn-icon-danger" data-comment-id="${c.id}" data-target-type="${escapeHtml(targetType)}" data-target-id="${safeTargetId}" onclick="event.stopPropagation(); deleteComment(this.dataset.commentId, this.dataset.targetType, this.dataset.targetId)" title="Eliminar">🗑️</button>` : '';
        const sectionBadge = c.section ? `<span class="comment-section-badge">${escapeHtml(c.section)}</span>` : '';
        const quoteBadge = c.highlighted_text ? `<div class="comment-quote" onclick="_goToHighlightedText('${escapeHtml(c.highlighted_text.replace(/'/g, "\\'").replace(/\n/g, ' '))}')" title="Click para ver en el contenido" style="cursor:pointer;">"${escapeHtml(c.highlighted_text.length > 120 ? c.highlighted_text.substring(0, 120) + '...' : c.highlighted_text)}"</div>` : '';
        const sectionLink = c.section ? `<span class="comment-section-link" onclick="_goToSection('${escapeHtml(c.section.replace(/'/g, "\\'"))}')" title="Ir a seccion">📍</span>` : '';
        const avatarHtml = _avatarHtml(c.avatar, c.username, 28);
        return `<div class="comment-item" data-comment-id="${c.id}">
            <div class="comment-header">
                <span class="comment-avatar">${avatarHtml}</span>
                <strong>${escapeHtml(c.username)}</strong>
                <span class="comment-role">${escapeHtml(c.role || '')}</span>
                ${sectionBadge}${sectionLink}
                <span class="comment-date">${date}</span>
                ${deleteBtn}
            </div>
            ${quoteBadge}
            <div class="comment-body">${escapeHtml(c.content)}</div>
        </div>`;
    }).join('');
}

async function deleteComment(commentId, targetType, targetId) {
    try {
        const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed');
        showToast('Comentario eliminado', 'success');
        // Reload comments for the appropriate context
        if (targetType === 'skill') loadSkillComments(targetId);
        else if (targetType === 'output') loadOutputComments(parseInt(targetId));
    } catch (err) {
        showToast('Error al eliminar comentario', 'error');
    }
}

// ─── Consultor UI restrictions ──────────────────────────────────────────────

function initConsultorUI() {
    if (!window.__USER__ || window.__USER__.role !== 'consultor') return;

    // Hide elements that consultors cannot use
    const selectorsToHide = [
        '.ideas-input-panel',           // New idea input
        '#btnDeleteAllIdeas',           // Delete all ideas
        '.upload-panel',                // File upload
        '#btnExportData',              // Export
        '#btnImportData',              // Import
        '.add-project-panel',          // Add project
        '#quickCaptureBar',            // Quick capture bar
        '#aiToggleBtn',                // AI widget toggle
        '#aiWidget',                   // AI widget
    ];

    selectorsToHide.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.style.display = 'none';
    });

    // Hide nav sections not relevant for consultor
    const navToHide = ['openclaw', 'analytics'];
    navToHide.forEach(section => {
        const link = document.querySelector(`.nav-link[data-section="${section}"]`);
        if (link) link.style.display = 'none';
    });

    // Auto-navigate to revision section
    const hash = window.location.hash.replace('#', '');
    if (!hash || !SECTION_META[hash]) {
        switchSection('revision');
    }
}

// ─── Audit Trail ────────────────────────────────────────────────────────────

async function loadAuditTrail() {
    const container = document.getElementById('auditTrailList');
    if (!container) return;
    container.innerHTML = '<div class="loading-sm"><div class="spinner-sm"></div></div>';

    try {
        const res = await fetch('/api/review/audit');
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();

        _auditTimeline = [];

        (data.review_actions || []).forEach(r => {
            _auditTimeline.push({
                date: r.reviewed_at,
                type: 'review',
                icon: r.review_status === 'approved' ? '✅' : '🔄',
                user: r.reviewed_by,
                action: r.review_status === 'approved' ? 'Aprobado' : 'Requiere cambios',
                detail: (r.ai_summary || r.text || '').substring(0, 80),
                agent: r.suggested_agent || r.executed_by,
                ideaId: r.id
            });
        });

        (data.comments || []).forEach(c => {
            _auditTimeline.push({
                date: c.created_at,
                type: 'comment',
                icon: '💬',
                user: c.username,
                action: `Comentario en ${c.target_type}`,
                detail: c.content.substring(0, 80),
                section: c.section,
                targetType: c.target_type,
                targetId: c.target_id
            });
        });

        _auditTimeline.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderAuditTimeline('all');

    } catch (err) {
        console.error('Audit trail error:', err);
        container.innerHTML = `<div class="empty-state">Error al cargar auditoria: ${err.message}</div>`;
    }
}

function renderAuditTimeline(filter) {
    const container = document.getElementById('auditTrailList');
    if (!container) return;

    const filtered = filter === 'all' ? _auditTimeline : _auditTimeline.filter(t => t.type === filter);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding:12px;">No hay actividad de auditoria registrada.</div>';
        return;
    }

    container.innerHTML = filtered.map(t => {
        const date = new Date(t.date).toLocaleString('es-ES');
        const sectionTag = t.section ? `<span class="comment-section-badge">${t.section}</span>` : '';
        const agentTag = t.agent ? `<span class="comment-role">${t.agent}</span>` : '';

        // Build click handler for navigation
        let clickAttr = '';
        if (t.type === 'comment' && t.targetType === 'skill' && t.targetId) {
            const safePath = escapeHtml(t.targetId).replace(/'/g, "\\'");
            const safeLabel = escapeHtml(t.targetId.split('/').pop().replace('.md', '')).replace(/'/g, "\\'");
            clickAttr = `onclick="viewSkill('${safePath}','${safeLabel}')" style="cursor:pointer;"`;
        }

        return `<div class="audit-item" ${clickAttr}>
            <span class="audit-icon">${t.icon}</span>
            <div class="audit-info">
                <div class="audit-header">
                    <strong>${t.user}</strong> ${t.action} ${agentTag} ${sectionTag}
                </div>
                <div class="audit-detail">${t.detail}${t.detail.length >= 80 ? '...' : ''}</div>
            </div>
            <span class="audit-date">${date}</span>
        </div>`;
    }).join('');
}

function filterAuditTrail(filter) {
    document.querySelectorAll('#auditFilters .skill-filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.audit === filter);
    });
    renderAuditTimeline(filter);
}

// Expose functions globally
window.loadReviewQueue = loadReviewQueue;
window.filterReviewOutputs = filterReviewOutputs;
window.switchSkillTab = switchSkillTab;
window.submitSkillComment = submitSkillComment;
window.reviewApprove = reviewApprove;
window.reviewNeedsChanges = reviewNeedsChanges;
window.submitOutputComment = submitOutputComment;
window.deleteComment = deleteComment;
window.loadAuditTrail = loadAuditTrail;
window.filterAuditTrail = filterAuditTrail;
window.filterReviewSkills = filterReviewSkills;
window.filterReviewSkillCategory = filterReviewSkillCategory;
window._revSkillsGoPage = _revSkillsGoPage;
window.loadAgentsSection = loadAgentsSection;
window.seedDemoData = seedDemoData;

// ─── Render Review Skills (with category filter + pagination) ────────────────

function _getFilteredRevSkills() {
    const searchVal = (document.getElementById('reviewSkillSearch')?.value || '').toLowerCase().trim();
    return _reviewSkillsCache.filter(s => {
        const matchCat = _revSkillCategory === 'all' || s.category === _revSkillCategory;
        const name = s.name.replace(/\.md$/i, '').replace(/-/g, ' ').toLowerCase();
        const matchSearch = !searchVal || name.includes(searchVal) || (s.category || '').toLowerCase().includes(searchVal);
        return matchCat && matchSearch;
    });
}

function renderReviewSkills() {
    const skillsList = document.getElementById('reviewSkillsList');
    const pagination = document.getElementById('reviewSkillsPagination');
    if (!skillsList) return;

    const filtered = _getFilteredRevSkills();

    if (filtered.length === 0) {
        skillsList.innerHTML = '<div class="empty-state">No se encontraron skills.</div>';
        if (pagination) pagination.innerHTML = '';
        return;
    }

    const totalPages = Math.ceil(filtered.length / REV_SKILLS_PER_PAGE);
    if (_revSkillPage > totalPages) _revSkillPage = totalPages;
    const start = (_revSkillPage - 1) * REV_SKILLS_PER_PAGE;
    const pageItems = filtered.slice(start, start + REV_SKILLS_PER_PAGE);

    skillsList.innerHTML = pageItems.map(s => {
        let displayName = s.name.replace(/\.md$/i, '').replace(/-/g, ' ');
        displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        const commentCount = _reviewSkillCommentMap[s.path] || 0;
        const badge = commentCount > 0 ? `<span class="review-badge reviewed">${commentCount} comentario${commentCount > 1 ? 's' : ''}</span>` : '';
        const icon = s.category === 'core' ? '🧠' : s.category === 'integration' ? '🔗' : '🛠️';
        return `<div class="review-item" onclick="viewSkill('${s.path}', '${displayName.replace(/'/g, "\\'")}')">
            <div class="review-item-info">
                <span class="review-item-icon">${icon}</span>
                <div>
                    <strong>${displayName}</strong>
                    <span class="review-item-meta">${s.category}</span>
                </div>
            </div>
            <div class="review-item-actions">
                ${badge}
                <button class="btn btn-sm" onclick="event.stopPropagation(); viewSkill('${s.path}', '${displayName.replace(/'/g, "\\'")}')">Revisar</button>
            </div>
        </div>`;
    }).join('');

    // Pagination
    if (pagination) {
        if (totalPages <= 1) { pagination.innerHTML = ''; return; }
        let html = `<button ${_revSkillPage <= 1 ? 'disabled' : ''} onclick="_revSkillsGoPage(${_revSkillPage - 1})">&#8249;</button>`;
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="${i === _revSkillPage ? 'active' : ''}" onclick="_revSkillsGoPage(${i})">${i}</button>`;
        }
        html += `<button ${_revSkillPage >= totalPages ? 'disabled' : ''} onclick="_revSkillsGoPage(${_revSkillPage + 1})">&#8250;</button>`;
        html += `<span class="page-info">${filtered.length} skills</span>`;
        pagination.innerHTML = html;
    }
}

function _revSkillsGoPage(page) {
    _revSkillPage = page;
    renderReviewSkills();
}

function filterReviewSkillCategory(cat) {
    document.querySelectorAll('#reviewSkillFilters .skill-filter-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.category === cat);
    });
    _revSkillCategory = cat;
    _revSkillPage = 1;
    renderReviewSkills();
}

function filterReviewSkills() {
    _revSkillPage = 1;
    renderReviewSkills();
}

window.navigateToSection = navigateToSection;

// ═══════════════════════════════════════════════════════════════════════════════
// AGENTES SECTION
// ═══════════════════════════════════════════════════════════════════════════════

const BUSINESS_AGENT_ICONS = {
    staffing: '👥', training: '📚', finance: '💰', compliance: '📋', gtd: '🎯'
};

async function loadAgentsSection() {
    try {
        const res = await fetch('/api/agents');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();

        // Business agents
        const bizGrid = document.getElementById('businessAgentsGrid');
        if (bizGrid && data.business) {
            bizGrid.innerHTML = data.business.map(a => {
                const icon = BUSINESS_AGENT_ICONS[a.key] || '🤖';
                const skillBadge = a.skillExists
                    ? `<span class="agent-skill-badge" onclick="event.stopPropagation(); viewSkill('${a.skillPath}', '${a.name}')" title="Ver skill">📄 ${a.skillFile}</span>`
                    : `<span class="agent-skill-badge missing">📄 ${a.skillFile} (no encontrado)</span>`;
                return `<div class="agent-card">
                    <div class="agent-card-header">
                        <span class="agent-card-icon">${icon}</span>
                        <div class="agent-card-info">
                            <strong>${a.name}</strong>
                            <span class="agent-card-role">${a.role}</span>
                        </div>
                    </div>
                    <div class="agent-card-footer">${skillBadge}</div>
                </div>`;
            }).join('');
        }

        // Execution agents
        const execGrid = document.getElementById('executionAgentsGrid');
        if (execGrid && data.execution) {
            execGrid.innerHTML = data.execution.map(a => {
                const isActive = a.last_active && (Date.now() - new Date(a.last_active + (a.last_active.includes('Z') ? '' : 'Z')).getTime()) < 300000;
                const statusDot = isActive ? '<span style="color:#10b981;">●</span>' : '<span style="color:#6b7280;">●</span>';
                const lastActive = a.last_active ? timeAgo(a.last_active) : 'Sin actividad';
                return `<div class="agent-card" style="border-left:3px solid ${a.color};">
                    <div class="agent-card-header">
                        <span class="agent-card-icon">${a.icon}</span>
                        <div class="agent-card-info">
                            <strong>${a.name}</strong>
                            <span class="agent-card-role">${a.role}</span>
                        </div>
                    </div>
                    <div class="agent-card-stats">
                        <div class="agent-stat"><span class="agent-stat-num">${a.total_processed}</span><span>Procesados</span></div>
                        <div class="agent-stat"><span class="agent-stat-num" style="color:#10b981;">${a.completed}</span><span>Completados</span></div>
                        <div class="agent-stat"><span class="agent-stat-num" style="color:#ef4444;">${a.failed}</span><span>Fallidos</span></div>
                    </div>
                    <div class="agent-card-footer">
                        ${statusDot} <span style="font-size:0.75rem;color:var(--text-muted);">${lastActive}</span>
                    </div>
                </div>`;
            }).join('');
        }
    } catch (err) {
        console.error('Agents section error:', err);
        const bizGrid = document.getElementById('businessAgentsGrid');
        if (bizGrid) bizGrid.innerHTML = '<div class="empty-state">Error cargando agentes</div>';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA (Admin)
// ═══════════════════════════════════════════════════════════════════════════════

async function seedDemoData() {
    const btn = document.getElementById('btnSeedData');
    if (!btn) return;
    if (!confirm('Esto insertará proyectos e ideas de ejemplo en la base de datos. ¿Continuar?')) return;

    btn.disabled = true;
    btn.textContent = '⏳ Sembrando...';

    try {
        const res = await fetch('/api/admin/seed', { method: 'POST' });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Error');

        showToast(`Datos sembrados: ${data.seeded.projects} proyectos, ${data.seeded.ideas} ideas, ${data.seeded.waiting_for} delegaciones`, 'success');
        btn.textContent = '✅ Datos sembrados';

        // Refresh current section data
        setTimeout(() => location.reload(), 1500);
    } catch (err) {
        showToast('Error al sembrar datos: ' + err.message, 'error');
        btn.disabled = false;
        btn.textContent = '🌱 Sembrar datos de ejemplo';
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REUNIONES (Meetings Intelligence)
// ═══════════════════════════════════════════════════════════════════════════════

let _reunionesPage = 1;
const REUNIONES_LIMIT = 20;

async function loadReuniones() {
    // Load email recipients panel if admin
    if (window.__USER__ && (window.__USER__.role === 'admin' || window.__USER__.role === 'ceo')) loadEmailRecipients();
    try {
        // Build query
        const params = new URLSearchParams({ page: _reunionesPage, limit: REUNIONES_LIMIT });
        const search = document.getElementById('reunionesSearch');
        const from = document.getElementById('reunionesFrom');
        const to = document.getElementById('reunionesTo');
        const participant = document.getElementById('reunionesParticipant');
        if (search && search.value) params.set('search', search.value);
        if (from && from.value) params.set('from', from.value);
        if (to && to.value) params.set('to', to.value);
        if (participant && participant.value) params.set('participant', participant.value);

        // Load stats and list in parallel (not sequential)
        const [statsRes, listRes] = await Promise.all([
            fetch('/api/reuniones/stats/summary'),
            fetch(`/api/reuniones?${params}`)
        ]);

        if (statsRes.ok) {
            const stats = await statsRes.json();
            const s = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
            s('reunStatTotal', stats.total_reuniones);
            s('reunStatWeek', stats.this_week);
            s('reunStatCompromisos', stats.total_compromisos);
            s('reunStatWithCompromisos', stats.total_with_compromisos);
        }

        const data = await listRes.json();
        renderReuniones(data.reuniones);
        updateReunionesPagination(data.pagination);
        populateParticipantFilter();
    } catch (err) {
        console.error('Load reuniones error:', err);
        const list = document.getElementById('reunionesList');
        if (list) list.innerHTML = '<div class="notification-empty">Error al cargar reuniones</div>';
    }
}

function renderReuniones(reuniones) {
    const list = document.getElementById('reunionesList');
    if (!list) return;

    if (!reuniones || reuniones.length === 0) {
        list.innerHTML = `<div class="notification-empty">
            <p>No hay reuniones registradas.</p>
            <p style="font-size:0.85rem;color:var(--text-muted);">Las reuniones se importan automaticamente desde Fireflies.ai via webhook.</p>
        </div>`;
        return;
    }

    list.innerHTML = reuniones.map(r => {
        const fecha = parseLocalDate(r.fecha).toLocaleDateString('es-ES', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
        const rawAsistentes = r.asistentes || [];
        const nombresCortos = rawAsistentes.map(a => _participantDisplayName(a));
        const MAX_SHOW = 3;
        const asistentes = nombresCortos.length === 0
            ? 'Sin identificar'
            : nombresCortos.length <= MAX_SHOW
                ? nombresCortos.join(', ')
                : nombresCortos.slice(0, MAX_SHOW).join(', ') + ` +${nombresCortos.length - MAX_SHOW} más`;
        const numCompromisos = (r.compromisos || []).length;
        const numAcuerdos = (r.acuerdos || []).length;
        const nivel = r.nivel_analisis || '';

        const deleteBtn = (window.__USER__?.role === 'admin' || window.__USER__?.role === 'ceo')
            ? `<button class="reunion-delete-btn" title="Eliminar reunion" onclick="event.stopPropagation(); deleteReunion(${r.id}, '${escapeHtml(r.titulo).replace(/'/g, "\\'")}')">✕</button>`
            : '';

        return `
        <div class="reunion-card" onclick="openReunionDetail(${r.id})">
            <div class="reunion-card-header">
                <span class="reunion-title">${escapeHtml(r.titulo)}</span>
                <span style="display:flex;align-items:center;gap:8px;">
                    <span class="reunion-date">${fecha}</span>
                    ${deleteBtn}
                </span>
            </div>
            <div class="reunion-card-meta">
                <span class="reunion-badge">Participantes: ${escapeHtml(asistentes)}</span>
                ${nivel ? `<span class="reunion-nivel">${escapeHtml(nivel)}</span>` : ''}
            </div>
            <div class="reunion-card-stats">
                <span class="reunion-stat">Acuerdos: ${numAcuerdos}</span>
                <span class="reunion-stat">Compromisos: ${numCompromisos}</span>
                ${r.proxima_reunion ? `<span class="reunion-stat">Proxima: ${r.proxima_reunion}</span>` : ''}
            </div>
        </div>`;
    }).join('');
}

async function deleteReunion(id, titulo) {
    if (!confirm(`¿Eliminar la reunion "${titulo}"?`)) return;
    try {
        const res = await fetch(`/api/reuniones/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('Reunion eliminada', 'success');
            loadReuniones();
        } else {
            showToast(data.error || 'Error al eliminar', 'error');
        }
    } catch (err) {
        showToast('Error al eliminar reunion', 'error');
    }
}

async function openReunionDetail(id) {
    try {
        const [reunionRes, systemUsers] = await Promise.all([
            fetch(`/api/reuniones/${id}`),
            getCachedUsers()
        ]);
        const r = await reunionRes.json();

        document.getElementById('reunionModalTitle').textContent = r.titulo;

        const fechaFmt = parseLocalDate(r.fecha).toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const puntosHtml = (r.puntos_clave || []).length > 0
            ? r.puntos_clave.map(p => `<li>${escapeHtml(p)}</li>`).join('')
            : '<li style="color:var(--text-muted);">Sin puntos clave</li>';

        const acuerdosHtml = (r.acuerdos || []).length > 0
            ? r.acuerdos.map(a => `<li>${escapeHtml(a)}</li>`).join('')
            : '<li style="color:var(--text-muted);">Sin acuerdos registrados</li>';

        const prioridadColor = { Alta: '#ef4444', Media: '#f59e0b', Baja: '#22c55e' };
        const compromisosHtml = (r.compromisos || []).length > 0
            ? r.compromisos.map(c => {
                const color = prioridadColor[c.prioridad] || '#6b7280';
                return `<div class="compromiso-card" style="border-left-color:${color};">
                    <strong>${escapeHtml(c.quien || 'Sin asignar')}</strong>: ${escapeHtml(c.tarea)}
                    <br><small style="color:var(--text-muted);">Fecha: ${escapeHtml(c.cuando || 'Por definir')} | Prioridad: <span style="color:${color};font-weight:600;">${escapeHtml(c.prioridad || 'Media')}</span></small>
                </div>`;
            }).join('')
            : '<p style="color:var(--text-muted);">Sin compromisos registrados</p>';

        const entregablesHtml = (r.entregables || []).length > 0
            ? `<h3>Entregables</h3><ul>${r.entregables.map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`
            : '';

        const temasHtml = (r.temas_detectados && r.temas_detectados.length > 0)
            ? `<div style="margin-bottom:16px;display:flex;flex-wrap:wrap;gap:6px;">
                ${r.temas_detectados.map(t => `<span style="background:var(--bg-tertiary);color:var(--text-secondary);padding:3px 10px;border-radius:12px;font-size:0.8rem;">${escapeHtml(t)}</span>`).join('')}
               </div>`
            : '';

        const transcripcionHtml = r.transcripcion_raw
            ? `<details style="margin-top:16px;">
                <summary style="cursor:pointer;font-weight:600;color:var(--text-secondary);padding:8px 0;">
                    📜 Ver Transcripcion Completa
                </summary>
                <div style="margin-top:8px;padding:16px;background:var(--bg-secondary);border-radius:8px;max-height:400px;overflow-y:auto;white-space:pre-wrap;font-size:0.85rem;line-height:1.6;color:var(--text-secondary);">${escapeHtml(r.transcripcion_raw)}</div>
               </details>`
            : '';

        document.getElementById('reunionModalContent').innerHTML = `
            <div style="margin-bottom:16px;display:flex;gap:16px;flex-wrap:wrap;color:var(--text-secondary);">
                <span><strong>Fecha:</strong> ${fechaFmt}</span>
                ${r.nivel_analisis ? `<span><strong>Nivel:</strong> ${escapeHtml(r.nivel_analisis)}</span>` : ''}
            </div>
            ${temasHtml}
            <div style="margin-bottom:16px;">
                <strong>Participantes:</strong>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">
                ${(r.asistentes || []).map(a => {
                    const nameLower = a.toLowerCase().replace(/[._@]/g, ' ').trim();
                    const matched = systemUsers.find(u => u.username.toLowerCase() === nameLower || a.toLowerCase().includes(u.username.toLowerCase()) || u.username.toLowerCase().includes(nameLower.split(' ')[0]));
                    const avatar = matched ? _avatarHtml(matched.avatar, matched.username, 24) : '';
                    return `<span class="reunion-participant-badge">${avatar} ${escapeHtml(a)}</span>`;
                }).join('') || '<span style="color:var(--text-muted);">No identificados</span>'}
                </div>
            </div>
            <h3>Resumen / Puntos Clave</h3>
            <ul>${puntosHtml}</ul>
            <h3>Acuerdos</h3>
            <ul>${acuerdosHtml}</ul>
            <h3>Compromisos</h3>
            ${compromisosHtml}
            ${entregablesHtml}
            ${r.proxima_reunion ? `<div style="margin-top:16px;padding:10px;background:var(--bg-secondary);border-radius:6px;"><strong>Proxima reunion:</strong> ${r.proxima_reunion}</div>` : ''}
            <div style="margin-top:16px;">
                <button class="btn btn-primary" onclick="generateTasksFromMeeting(${id})" id="btnGenTasks_${id}">
                    📥 Generar Tareas al Inbox
                </button>
                <small style="color:var(--text-muted);margin-left:8px;">Crea tareas en el inbox desde compromisos, acuerdos y entregables</small>
            </div>
            ${transcripcionHtml}
            <div class="reunion-links-section" id="reunionLinksSection" data-reunion-id="${id}"></div>
        `;

        document.getElementById('reunionModal').style.display = 'flex';

        // Load related projects/areas
        loadReunionLinks(id);
    } catch (err) {
        console.error('Reunion detail error:', err);
        showToast('Error al cargar detalle de reunion', 'error');
    }
}

async function loadReunionLinks(reunionId) {
    const section = document.getElementById('reunionLinksSection');
    if (!section) return;
    try {
        const res = await fetch(`/api/reuniones/${reunionId}/links`);
        if (!res.ok) return;
        const links = await res.json();
        const projects = links.filter(l => l.link_type === 'project');
        const areas = links.filter(l => l.link_type === 'area');
        const isAdmin = window.__USER__ && ['admin', 'manager'].includes(window.__USER__.role);

        if (projects.length === 0 && areas.length === 0 && !isAdmin) {
            section.innerHTML = '';
            return;
        }

        let html = '';
        if (projects.length > 0 || isAdmin) {
            html += `<h4>Proyectos Relacionados</h4><div class="reunion-link-badges">`;
            html += projects.map(l => `
                <span class="reunion-link-badge type-project">
                    🚀 ${escapeHtml(l.name || l.link_id)}
                    ${l.auto_detected ? '<small style="opacity:0.5;">(auto)</small>' : ''}
                    ${isAdmin ? `<span class="link-remove" data-link-id="${l.id}" data-reunion-id="${reunionId}" onclick="removeReunionLink(this)">✕</span>` : ''}
                </span>
            `).join('');
            if (isAdmin) html += `<button class="reunion-add-link-btn" onclick="addReunionLinkPrompt(${reunionId}, 'project')">+ Proyecto</button>`;
            html += `</div>`;
        }
        if (areas.length > 0 || isAdmin) {
            html += `<h4>Areas Relacionadas</h4><div class="reunion-link-badges">`;
            html += areas.map(l => `
                <span class="reunion-link-badge type-area">
                    📋 ${escapeHtml(l.name || l.link_id)}
                    ${l.auto_detected ? '<small style="opacity:0.5;">(auto)</small>' : ''}
                    ${isAdmin ? `<span class="link-remove" data-link-id="${l.id}" data-reunion-id="${reunionId}" onclick="removeReunionLink(this)">✕</span>` : ''}
                </span>
            `).join('');
            if (isAdmin) html += `<button class="reunion-add-link-btn" onclick="addReunionLinkPrompt(${reunionId}, 'area')">+ Area</button>`;
            html += `</div>`;
        }
        section.innerHTML = html;
    } catch (err) {
        console.error('Load reunion links error:', err);
    }
}

async function addReunionLinkPrompt(reunionId, linkType) {
    try {
        const endpoint = linkType === 'project' ? '/api/projects' : '/api/areas';
        const res = await fetch(endpoint);
        if (!res.ok) return;
        const items = await res.json();
        const list = Array.isArray(items) ? items : (items.projects || items.areas || []);

        if (list.length === 0) {
            showToast(`No hay ${linkType === 'project' ? 'proyectos' : 'areas'} disponibles`, 'warning');
            return;
        }

        const options = list.map(i => `${i.id} — ${i.name}`).join('\n');
        const choice = prompt(`Selecciona ${linkType === 'project' ? 'proyecto' : 'area'} (escribe el ID):\n\n${options}`);
        if (!choice) return;

        const linkId = choice.split(' ')[0].trim();
        const addRes = await fetch(`/api/reuniones/${reunionId}/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ link_type: linkType, link_id: linkId })
        });
        if (addRes.ok) {
            showToast('Vinculo agregado', 'success');
            loadReunionLinks(reunionId);
        } else {
            const err = await addRes.json();
            showToast(err.error || 'Error al vincular', 'error');
        }
    } catch (err) {
        showToast('Error al agregar vinculo', 'error');
    }
}

async function removeReunionLink(el) {
    const linkId = el.dataset.linkId;
    const reunionId = el.dataset.reunionId;
    if (!confirm('Eliminar este vinculo?')) return;
    try {
        const res = await fetch(`/api/reuniones/${reunionId}/links/${linkId}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Vinculo eliminado', 'success');
            loadReunionLinks(reunionId);
        }
    } catch (err) {
        showToast('Error', 'error');
    }
}

function filterReuniones() {
    _reunionesPage = 1;
    loadReuniones();
}

function clearReunionesFilters() {
    ['reunionesSearch', 'reunionesFrom', 'reunionesTo'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const part = document.getElementById('reunionesParticipant');
    if (part) part.value = '';
    filterReuniones();
}

function reunionesChangePage(delta) {
    _reunionesPage += delta;
    if (_reunionesPage < 1) _reunionesPage = 1;
    loadReuniones();
}

function updateReunionesPagination(pagination) {
    if (!pagination) return;
    const info = document.getElementById('reunionesPageInfo');
    const prev = document.getElementById('reunionesPrevPage');
    const next = document.getElementById('reunionesNextPage');
    if (info) info.textContent = `Pagina ${pagination.page} de ${pagination.totalPages || 1}`;
    if (prev) prev.disabled = pagination.page <= 1;
    if (next) next.disabled = pagination.page >= pagination.totalPages;
}

function _participantDisplayName(name) {
    if (name && name.includes('@')) {
        return name.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    return name;
}

async function populateParticipantFilter() {
    const select = document.getElementById('reunionesParticipant');
    if (!select || select.options.length > 1) return; // already populated
    try {
        const res = await fetch('/api/reuniones/participants');
        if (!res.ok) return;
        const names = await res.json();
        const currentValue = select.value;
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = _participantDisplayName(name);
            select.appendChild(opt);
        });
        if (currentValue) select.value = currentValue;
    } catch { /* ignore */ }
}

// ─── Email Recipients Management (Admin) ─────────────────────────────────────

function openAddRecipientForm() {
    const form = document.getElementById('addRecipientForm');
    if (form) { form.style.display = 'block'; document.getElementById('newRecipientEmail').focus(); }
}

async function loadEmailRecipients() {
    const list = document.getElementById('emailRecipientsList');
    if (!list) return;
    try {
        const res = await fetch('/api/reuniones/email-recipients/all');
        if (!res.ok) return;
        const data = await res.json();
        if (!data.recipients || data.recipients.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:16px;">No hay destinatarios configurados. Agrega emails para recibir reportes de reuniones.</p>';
            return;
        }
        list.innerHTML = data.recipients.map(r => `
            <div class="recipient-row" ${!r.activo ? 'style="opacity:0.5;"' : ''}>
                <div class="recipient-info">
                    <span>${r.activo ? '📧' : '🚫'}</span>
                    <span class="email">${escapeHtml(r.email)}</span>
                    ${r.nombre ? `<span class="name">(${escapeHtml(r.nombre)})</span>` : ''}
                </div>
                <div class="recipient-actions">
                    <button class="btn btn-sm btn-primary" onclick="toggleRecipient(${r.id}, ${r.activo ? 0 : 1})">
                        ${r.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button class="btn btn-sm" onclick="deleteRecipient(${r.id}, '${escapeHtml(r.email)}')" style="color:#e74c3c;border-color:rgba(231,76,60,0.3);">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Load recipients error:', err);
    }
}

async function addEmailRecipient() {
    const emailInput = document.getElementById('newRecipientEmail');
    const nameInput = document.getElementById('newRecipientName');
    const email = emailInput?.value?.trim();
    const nombre = nameInput?.value?.trim();
    if (!email || !email.includes('@')) {
        showToast('Ingresa un email valido', 'error');
        return;
    }
    try {
        const res = await fetch('/api/reuniones/email-recipients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, nombre })
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.error || 'Error al agregar', 'error'); return; }
        showToast(`Email ${email} agregado`, 'success');
        emailInput.value = '';
        nameInput.value = '';
        document.getElementById('addRecipientForm').style.display = 'none';
        loadEmailRecipients();
    } catch (err) {
        showToast('Error de conexion', 'error');
    }
}

async function toggleRecipient(id, activo) {
    try {
        await fetch(`/api/reuniones/email-recipients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activo: !!activo })
        });
        loadEmailRecipients();
    } catch (err) {
        showToast('Error al actualizar', 'error');
    }
}

async function deleteRecipient(id, email) {
    if (!confirm(`Eliminar ${email} de los destinatarios?`)) return;
    try {
        await fetch(`/api/reuniones/email-recipients/${id}`, { method: 'DELETE' });
        showToast(`${email} eliminado`, 'success');
        loadEmailRecipients();
    } catch (err) {
        showToast('Error al eliminar', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEEDBACK SECTION
// ═══════════════════════════════════════════════════════════════════════════════

let _allFeedback = [];
let _fbFilter = 'all';
let _fbPendingFiles = []; // Files queued for upload

const FB_STATUS_LABELS = {
    abierto: { label: 'Abierto', color: '#3b82f6' },
    en_progreso: { label: 'En Progreso', color: '#f59e0b' },
    corregido: { label: 'Corregido', color: '#8b5cf6' },
    resuelto: { label: 'Resuelto', color: '#10b981' },
    descartado: { label: 'Descartado', color: '#6b7280' }
};

const FB_CATEGORY_LABELS = {
    mejora: { label: 'Mejora', icon: '✨' },
    bug: { label: 'Bug', icon: '🐛' },
    feature: { label: 'Feature', icon: '🚀' },
    otro: { label: 'Otro', icon: '💬' }
};

const FB_PRIORITY_ICONS = { baja: '🟢', media: '🟡', alta: '🔴' };

const FB_FILE_ICONS = {
    pdf: '📕', txt: '📄', docx: '📘', xlsx: '📊',
    default: '📎'
};

function _isImage(name) { return /\.(jpg|jpeg|png|gif|webp)$/i.test(name); }
function _fileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    return FB_FILE_ICONS[ext] || FB_FILE_ICONS.default;
}
function _formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

// ─── File Upload: Drag & Drop + Preview ─────────────────────────────────────
function initFbUploadZone() {
    const zone = document.getElementById('fbUploadZone');
    const input = document.getElementById('fbFiles');
    if (!zone || !input) return;

    input.addEventListener('change', () => {
        _addFbFiles(Array.from(input.files));
        input.value = '';
    });

    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        _addFbFiles(Array.from(e.dataTransfer.files));
    });
}

function _addFbFiles(files) {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.docx', '.xlsx'];
    for (const f of files) {
        if (_fbPendingFiles.length >= 5) { showToast('Maximo 5 archivos', 'warning'); break; }
        const ext = '.' + f.name.split('.').pop().toLowerCase();
        if (!allowed.includes(ext)) { showToast(`${f.name}: tipo no permitido`, 'warning'); continue; }
        if (f.size > 10 * 1024 * 1024) { showToast(`${f.name}: max 10MB`, 'warning'); continue; }
        _fbPendingFiles.push(f);
    }
    _renderFbPreviews();
}

function _renderFbPreviews() {
    const container = document.getElementById('fbPreviews');
    const prompt = document.getElementById('fbUploadPrompt');
    if (!container) return;

    if (_fbPendingFiles.length === 0) {
        container.innerHTML = '';
        if (prompt) prompt.style.display = '';
        return;
    }
    if (prompt) prompt.style.display = _fbPendingFiles.length >= 5 ? 'none' : '';

    container.innerHTML = _fbPendingFiles.map((f, i) => {
        if (_isImage(f.name)) {
            const url = URL.createObjectURL(f);
            return `<div class="fb-preview-item">
                <img src="${url}" alt="${escapeHtml(f.name)}">
                <button type="button" class="fb-preview-remove" onclick="_removeFbFile(${i})">×</button>
                <span class="fb-preview-name">${escapeHtml(f.name.length > 15 ? f.name.substring(0, 12) + '...' : f.name)}</span>
            </div>`;
        }
        return `<div class="fb-preview-item fb-preview-file">
            <span class="fb-preview-icon">${_fileIcon(f.name)}</span>
            <button type="button" class="fb-preview-remove" onclick="_removeFbFile(${i})">×</button>
            <span class="fb-preview-name">${escapeHtml(f.name.length > 15 ? f.name.substring(0, 12) + '...' : f.name)}</span>
            <span class="fb-preview-size">${_formatSize(f.size)}</span>
        </div>`;
    }).join('');
}

function _removeFbFile(index) {
    _fbPendingFiles.splice(index, 1);
    _renderFbPreviews();
}
window._removeFbFile = _removeFbFile;

// ─── Load & Render ──────────────────────────────────────────────────────────
async function loadFeedback() {
    const list = document.getElementById('feedbackList');
    if (!list) return;

    try {
        const res = await fetch('/api/feedback');
        _allFeedback = await res.json();

        const counts = { all: _allFeedback.length, abierto: 0, en_progreso: 0, corregido: 0, resuelto: 0 };
        _allFeedback.forEach(fb => { if (counts[fb.status] !== undefined) counts[fb.status]++; });
        const setC = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        setC('fbCountAll', counts.all);
        setC('fbCountOpen', counts.abierto);
        setC('fbCountProgress', counts.en_progreso);
        setC('fbCountFixed', counts.corregido);
        setC('fbCountResolved', counts.resuelto);

        renderFeedback();
    } catch (err) {
        console.error('Feedback load error:', err);
        if (list) list.innerHTML = '<div class="archivos-empty"><div class="empty-icon">⚠️</div><p>Error al cargar feedback</p></div>';
    }
}

async function downloadFeedback() {
    try {
        const res = await fetch('/api/feedback/export');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback_export_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Feedback descargado', 'success');
    } catch (err) {
        console.error('Download feedback error:', err);
        showToast('Error al descargar feedback', 'error');
    }
}

function filterFeedback(status) {
    _fbFilter = status;
    document.querySelectorAll('#feedbackFilters .skill-filter-chip').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.fbfilter === status);
    });
    renderFeedback();
}

function renderFeedback() {
    const list = document.getElementById('feedbackList');
    if (!list) return;

    let items = [..._allFeedback];
    if (_fbFilter !== 'all') items = items.filter(fb => fb.status === _fbFilter);
    const prioOrder = { alta: 0, media: 1, baja: 2 };
    items.sort((a, b) => (prioOrder[a.priority] ?? 1) - (prioOrder[b.priority] ?? 1));

    if (items.length === 0) {
        list.innerHTML = `<div class="archivos-empty"><div class="empty-icon">💬</div><p>${_fbFilter === 'all' ? 'No hay feedback aun. Se el primero en enviar una sugerencia.' : 'No hay feedback con este estado.'}</p></div>`;
        return;
    }

    const isAdmin = window.__USER__ && ['admin', 'manager'].includes(window.__USER__.role);

    list.innerHTML = items.map(fb => {
        const st = FB_STATUS_LABELS[fb.status] || FB_STATUS_LABELS.abierto;
        const cat = FB_CATEGORY_LABELS[fb.category] || FB_CATEGORY_LABELS.otro;
        const pri = FB_PRIORITY_ICONS[fb.priority] || '🟡';
        const date = new Date(fb.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' });
        const canDelete = isAdmin || (window.__USER__ && window.__USER__.username === fb.username);

        // Attachments indicator
        const attachCount = fb.attachment_count || 0;
        const attachHtml = attachCount > 0
            ? `<div class="fb-attachments" id="fbAttach_${fb.id}">
                   <button class="fb-attach-toggle" onclick="loadFbAttachments(${fb.id})">📎 ${attachCount} adjunto${attachCount > 1 ? 's' : ''} — ver</button>
               </div>`
            : '';

        let responseHtml = '';
        if (fb.admin_response) {
            responseHtml = `<div class="fb-response">
                <span class="fb-response-by">↩ ${escapeHtml(fb.responded_by || 'Admin')}</span>
                <p>${escapeHtml(fb.admin_response)}</p>
            </div>`;
        }

        let actionsHtml = '';
        if (isAdmin) {
            actionsHtml = `<div class="fb-actions">
                <select class="fb-status-select" onchange="updateFeedbackStatus(${fb.id}, this.value)">
                    <option value="abierto" ${fb.status === 'abierto' ? 'selected' : ''}>Abierto</option>
                    <option value="en_progreso" ${fb.status === 'en_progreso' ? 'selected' : ''}>En Progreso</option>
                    <option value="corregido" ${fb.status === 'corregido' ? 'selected' : ''}>Corregido ✓</option>
                    <option value="resuelto" ${fb.status === 'resuelto' ? 'selected' : ''}>Resuelto</option>
                    <option value="descartado" ${fb.status === 'descartado' ? 'selected' : ''}>Descartado</option>
                </select>
                <button class="btn-icon-sm" onclick="openRespondModal(${fb.id})" title="Responder">↩</button>
                ${canDelete ? `<button class="btn-icon-sm delete" onclick="deleteFeedback(${fb.id})" title="Eliminar">🗑</button>` : ''}
            </div>`;
        } else if (canDelete) {
            actionsHtml = `<div class="fb-actions">
                <button class="btn-icon-sm delete" onclick="deleteFeedback(${fb.id})" title="Eliminar">🗑</button>
            </div>`;
        }

        // Reporter can reject a "corregido" fix
        let rejectHtml = '';
        const isReporter = window.__USER__ && window.__USER__.username === fb.username;
        if (fb.status === 'corregido' && isReporter) {
            rejectHtml = `<div class="fb-reject-fix">
                <p>Este feedback fue marcado como corregido. ¿Funciona correctamente?</p>
                <button class="fb-reject-btn fb-reject-ok" onclick="confirmFeedbackFix(${fb.id})">✅ Sí, funciona</button>
                <button class="fb-reject-btn fb-reject-no" onclick="rejectFeedbackFix(${fb.id})">❌ No resuelto</button>
            </div>`;
        }

        return `<div class="feedback-card fb-status-${fb.status}">
            <div class="fb-header">
                <h3>${escapeHtml(fb.title)}</h3>
                <span class="fb-status-badge" style="background:${st.color};">${st.label}</span>
            </div>
            <p class="fb-content">${escapeHtml(fb.content)}</p>
            <div class="fb-meta">
                <span class="fb-category">${cat.icon} ${cat.label}</span>
                <span>${pri} ${fb.priority}</span>
                <span>👤 ${escapeHtml(fb.username)}</span>
                <span>📅 ${date}</span>
            </div>
            ${attachHtml}
            ${rejectHtml}
            ${responseHtml}
            ${actionsHtml}
        </div>`;
    }).join('');
}

// ─── Load & show attachments for a feedback card ────────────────────────────
async function loadFbAttachments(fbId) {
    const container = document.getElementById(`fbAttach_${fbId}`);
    if (!container) return;

    try {
        const res = await fetch(`/api/feedback/${fbId}/attachments`);
        const attachments = await res.json();

        const isAdmin = window.__USER__ && ['admin', 'manager'].includes(window.__USER__.role);
        const fb = _allFeedback.find(f => f.id === fbId);
        const isAuthor = fb && window.__USER__ && window.__USER__.username === fb.username;

        container.innerHTML = `<div class="fb-attach-list">
            ${attachments.map(a => {
                const canDel = isAdmin || isAuthor;
                const delBtn = canDel ? `<button class="fb-attach-del" onclick="deleteFbAttachment(${a.id}, ${fbId})" title="Eliminar">×</button>` : '';
                if (_isImage(a.original_name)) {
                    return `<div class="fb-attach-item">
                        <img src="/api/feedback/attachment/${a.id}" alt="${escapeHtml(a.original_name)}" onclick="openFbLightbox('/api/feedback/attachment/${a.id}')">
                        ${delBtn}
                    </div>`;
                }
                return `<div class="fb-attach-item fb-attach-file" onclick="window.open('/api/feedback/attachment/${a.id}','_blank')">
                    <span class="fb-attach-icon">${_fileIcon(a.original_name)}</span>
                    <span class="fb-attach-name">${escapeHtml(a.original_name)}</span>
                    <span class="fb-attach-size">${_formatSize(a.size)}</span>
                    ${delBtn}
                </div>`;
            }).join('')}
        </div>`;
    } catch (err) {
        container.innerHTML = '<span style="color:var(--text-muted);font-size:0.8rem;">Error al cargar adjuntos</span>';
    }
}

async function deleteFbAttachment(attachId, fbId) {
    if (!confirm('Eliminar este adjunto?')) return;
    try {
        const res = await fetch(`/api/feedback/attachment/${attachId}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Adjunto eliminado', 'info');
            loadFeedback();
        }
    } catch (err) {
        showToast('Error al eliminar adjunto', 'error');
    }
}

// ─── Lightbox ───────────────────────────────────────────────────────────────
function openFbLightbox(src) {
    const lb = document.getElementById('fbLightbox');
    const img = document.getElementById('fbLightboxImg');
    if (lb && img) { img.src = src; lb.style.display = 'flex'; }
}
function closeFbLightbox() {
    const lb = document.getElementById('fbLightbox');
    if (lb) { lb.style.display = 'none'; document.getElementById('fbLightboxImg').src = ''; }
}

// ─── Feedback queue for bulk submissions ─────────────────────────────────────
let _fbQueue = [];

function _renderFbQueue() {
    const list = document.getElementById('fbQueueList');
    if (!list) return;
    if (_fbQueue.length === 0) { list.style.display = 'none'; list.innerHTML = ''; return; }
    list.style.display = 'block';
    const catIcons = { mejora: '💡', bug: '🐛', feature: '🚀', otro: '📝' };
    const prioColors = { alta: '#ef4444', media: '#f59e0b', baja: '#22c55e' };
    list.innerHTML = `<div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:6px;font-weight:600;">En cola (${_fbQueue.length}):</div>` +
        _fbQueue.map((item, i) => `<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg-card);border-radius:8px;margin-bottom:4px;border-left:3px solid ${prioColors[item.priority] || '#666'};">
            <span>${catIcons[item.category] || '📝'}</span>
            <div style="flex:1;min-width:0;">
                <div style="font-weight:600;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(item.title)}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(item.content.substring(0, 80))}${item.content.length > 80 ? '...' : ''}</div>
            </div>
            <button type="button" onclick="_fbQueue.splice(${i},1);_renderFbQueue();_updateFbButtons();" style="background:none;border:none;cursor:pointer;font-size:1rem;padding:2px;" title="Quitar">✕</button>
        </div>`).join('');
}

function _updateFbButtons() {
    const btn = document.getElementById('btnSaveFeedback');
    const uploadZone = document.getElementById('fbUploadZone');
    if (_fbQueue.length > 0) {
        if (btn) btn.textContent = `Enviar ${_fbQueue.length + 1} Feedbacks`;
        if (uploadZone) uploadZone.style.display = 'none';
    } else {
        if (btn) btn.textContent = 'Enviar Feedback';
        if (uploadZone) uploadZone.style.display = '';
    }
}

function queueFeedbackItem() {
    const title = document.getElementById('fbTitle')?.value?.trim();
    const content = document.getElementById('fbContent')?.value?.trim();
    if (!title || !content) { showToast('Titulo y descripcion requeridos', 'error'); return; }
    if (title.length > 200) { showToast('Titulo muy largo (max 200)', 'error'); return; }

    _fbQueue.push({
        title,
        content,
        category: document.getElementById('fbCategory')?.value || 'mejora',
        priority: document.getElementById('fbPriority')?.value || 'media'
    });

    // Clear form fields for next item
    document.getElementById('fbTitle').value = '';
    document.getElementById('fbContent').value = '';
    document.getElementById('fbTitle').focus();
    _renderFbQueue();
    _updateFbButtons();
    showToast(`Agregado a la cola (${_fbQueue.length})`, 'success');
}

// ─── Modal open/close ───────────────────────────────────────────────────────
function openFeedbackModal() {
    _fbPendingFiles = [];
    _fbQueue = [];
    _renderFbPreviews();
    _renderFbQueue();
    _updateFbButtons();
    const m = document.getElementById('feedbackModal');
    if (m) m.style.display = 'block';
}

function closeFeedbackModal() {
    const m = document.getElementById('feedbackModal');
    if (m) {
        m.style.display = 'none';
        document.getElementById('feedbackForm')?.reset();
        _fbPendingFiles = [];
        _fbQueue = [];
        _renderFbPreviews();
        _renderFbQueue();
        _updateFbButtons();
    }
}

function openRespondModal(id) {
    document.getElementById('fbRespondId').value = id;
    document.getElementById('fbResponseText').value = '';
    const m = document.getElementById('feedbackRespondModal');
    if (m) m.style.display = 'block';
}

function closeFeedbackRespondModal() {
    const m = document.getElementById('feedbackRespondModal');
    if (m) m.style.display = 'none';
}

// ─── Save new feedback (single with files OR bulk without files) ─────────────
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        initFbUploadZone();

        const form = document.getElementById('feedbackForm');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btnSaveFeedback');
            if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

            try {
                // Collect current form item
                const currentTitle = document.getElementById('fbTitle').value.trim();
                const currentContent = document.getElementById('fbContent').value.trim();
                const currentCategory = document.getElementById('fbCategory').value;
                const currentPriority = document.getElementById('fbPriority').value;

                if (!currentTitle || !currentContent) {
                    showToast('Titulo y descripcion requeridos', 'error');
                    return;
                }

                const currentItem = { title: currentTitle, content: currentContent, category: currentCategory, priority: currentPriority };

                if (_fbQueue.length > 0) {
                    // ─── Bulk mode: send all queued + current via /api/feedback/bulk ───
                    const allItems = [..._fbQueue, currentItem];
                    const res = await fetch('/api/feedback/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items: allItems })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        closeFeedbackModal();
                        showToast(`${data.created} feedbacks enviados`, 'success');
                        if (data.errors?.length > 0) showToast(data.errors.join('; '), 'warning');
                        loadFeedback();
                    } else {
                        showToast(data.error || 'Error', 'error');
                    }
                } else {
                    // ─── Single mode: use FormData (supports attachments) ───
                    const fd = new FormData();
                    fd.append('title', currentTitle);
                    fd.append('content', currentContent);
                    fd.append('category', currentCategory);
                    fd.append('priority', currentPriority);
                    _fbPendingFiles.forEach(f => fd.append('attachments', f));

                    const res = await fetch('/api/feedback', { method: 'POST', body: fd });
                    if (res.ok) {
                        closeFeedbackModal();
                        showToast(_fbPendingFiles.length > 0 ? 'Feedback enviado con adjuntos' : 'Feedback enviado', 'success');
                        _fbPendingFiles = [];
                        loadFeedback();
                    } else {
                        const err = await res.json();
                        showToast(err.error || 'Error', 'error');
                    }
                }
            } catch (err) {
                showToast('Error de conexion', 'error');
            } finally {
                if (btn) { btn.disabled = false; _updateFbButtons(); }
            }
        });
    });
})();

async function updateFeedbackStatus(id, status) {
    try {
        const res = await fetch(`/api/feedback/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            showToast('Estado actualizado', 'success');
            loadFeedback();
        }
    } catch (err) {
        showToast('Error al actualizar', 'error');
    }
}

async function rejectFeedbackFix(id) {
    try {
        const res = await fetch(`/api/feedback/${id}/reject-fix`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            showToast('Feedback reabierto — el equipo será notificado', 'info');
            loadFeedback();
        } else {
            const data = await res.json();
            showToast(data.error || 'Error al rechazar', 'error');
        }
    } catch (err) {
        showToast('Error al rechazar corrección', 'error');
    }
}

async function confirmFeedbackFix(id) {
    try {
        const res = await fetch(`/api/feedback/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'resuelto' })
        });
        if (res.ok) {
            showToast('Feedback confirmado como resuelto', 'success');
            loadFeedback();
        }
    } catch (err) {
        showToast('Error al confirmar', 'error');
    }
}

async function submitFeedbackResponse() {
    const id = document.getElementById('fbRespondId').value;
    const response = document.getElementById('fbResponseText').value;
    if (!response.trim()) return;

    try {
        const res = await fetch(`/api/feedback/${id}/respond`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response })
        });
        if (res.ok) {
            closeFeedbackRespondModal();
            showToast('Respuesta enviada', 'success');
            loadFeedback();
        }
    } catch (err) {
        showToast('Error al responder', 'error');
    }
}

async function deleteFeedback(id) {
    if (!confirm('Eliminar este feedback?')) return;
    try {
        const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Feedback eliminado', 'info');
            loadFeedback();
        }
    } catch (err) {
        showToast('Error al eliminar', 'error');
    }
}

window.filterFeedback = filterFeedback;
window.openFeedbackModal = openFeedbackModal;
window.closeFeedbackModal = closeFeedbackModal;
window.openRespondModal = openRespondModal;
window.closeFeedbackRespondModal = closeFeedbackRespondModal;
window.updateFeedbackStatus = updateFeedbackStatus;
window.submitFeedbackResponse = submitFeedbackResponse;
window.deleteFeedback = deleteFeedback;
window.loadFbAttachments = loadFbAttachments;
window.deleteFbAttachment = deleteFbAttachment;
window.openFbLightbox = openFbLightbox;
window.closeFbLightbox = closeFbLightbox;

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE & ADMIN USERS
// ═══════════════════════════════════════════════════════════════════════════════

function _avatarHtml(avatar, username, size = 40) {
    const src = avatar || '/img/vsc.png';
    return `<img src="${src}" alt="${username || '?'}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
}

// ─── Profile Modal (self-edit) ──────────────────────────────────────────────
async function openProfileModal() {
    const modal = document.getElementById('profileModal');
    if (!modal) return;

    try {
        const res = await fetch('/api/profile');
        const p = await res.json();

        document.getElementById('profileUsername').textContent = p.username;
        const roleBadge = document.getElementById('profileRole');
        roleBadge.textContent = p.role;
        roleBadge.className = 'profile-role-badge role-' + (p.role || 'user');
        document.getElementById('profileDepartment').value = p.department || '';
        document.getElementById('profileExpertise').value = p.expertise || '';

        const preview = document.getElementById('profileAvatarPreview');
        if (preview) preview.innerHTML = _avatarHtml(p.avatar, p.username, 96);

        modal.style.display = 'block';
        loadTwofaStatus(); // Load 2FA status when profile opens
    } catch (err) {
        showToast('Error al cargar perfil', 'error');
    }
}

function closeProfileModal() {
    const m = document.getElementById('profileModal');
    if (m) m.style.display = 'none';
}

// Profile form submit
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('profileForm');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const res = await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        department: document.getElementById('profileDepartment').value,
                        expertise: document.getElementById('profileExpertise').value
                    })
                });
                if (res.ok) {
                    showToast('Perfil actualizado', 'success');
                    window.__USER__.department = document.getElementById('profileDepartment').value;
                    window.__USER__.expertise = document.getElementById('profileExpertise').value;
                }
            } catch (err) {
                showToast('Error al guardar', 'error');
            }
        });

        // Profile avatar upload
        const avatarInput = document.getElementById('profileAvatarInput');
        if (avatarInput) avatarInput.addEventListener('change', async () => {
            if (!avatarInput.files[0]) return;
            const fd = new FormData();
            fd.append('avatar', avatarInput.files[0]);
            try {
                const res = await fetch('/api/profile/avatar', { method: 'PUT', body: fd });
                const data = await res.json();
                if (res.ok && data.avatar) {
                    showToast('Foto actualizada', 'success');
                    window.__USER__.avatar = data.avatar;
                    // Update sidebar avatar
                    const sidebar = document.getElementById('sidebarAvatar');
                    if (sidebar) sidebar.innerHTML = `<img src="${data.avatar}" alt="avatar">`;
                    // Update preview
                    const preview = document.getElementById('profileAvatarPreview');
                    if (preview) preview.innerHTML = _avatarHtml(data.avatar, window.__USER__.username, 80);
                }
            } catch (err) {
                showToast('Error al subir foto', 'error');
            }
            avatarInput.value = '';
        });
    });
})();

async function changeOwnPassword() {
    const current = document.getElementById('profileCurrentPw').value;
    const newPw = document.getElementById('profileNewPw').value;
    if (!current || !newPw || newPw.length < 8) {
        showToast('Ingresa contraseña actual y nueva (min 8 caracteres)', 'warning');
        return;
    }
    try {
        const res = await fetch('/api/profile/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: current, newPassword: newPw })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Contraseña actualizada', 'success');
            document.getElementById('profileCurrentPw').value = '';
            document.getElementById('profileNewPw').value = '';
        } else {
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error al cambiar contraseña', 'error');
    }
}

// ─── 2FA Management (Profile) ───────────────────────────────────────────────

async function loadTwofaStatus() {
    const container = document.getElementById('twofaContent');
    if (!container) return;
    try {
        const res = await fetch('/api/twofa/status');
        if (!res.ok) { container.innerHTML = '<div style="color:#ef4444;padding:12px;">Error al cargar estado 2FA</div>'; return; }
        const data = await res.json();

        if (!data.available) {
            container.innerHTML = '<div style="color:#94a3b8;padding:12px;">2FA no disponible en este entorno</div>';
            return;
        }

        if (!data.enabled) {
            container.innerHTML = `
                <div style="padding:8px 0;">
                    <p style="color:#64748b;font-size:0.85rem;margin-bottom:12px;">Protege tu cuenta con un segundo factor de autenticacion usando Google Authenticator o Microsoft Authenticator.</p>
                    ${data.enforced ? '<div style="background:#fef3c7;color:#92400e;padding:8px 12px;border-radius:6px;font-size:0.85rem;margin-bottom:12px;">Tu administrador requiere 2FA para tu cuenta.</div>' : ''}
                    <button class="btn btn-sm" onclick="setupTwofa()" style="background:#0052cc;color:#fff;">Activar 2FA</button>
                </div>`;
            return;
        }

        // 2FA is enabled
        let devicesHtml = '';
        if (data.trustedDevices.length > 0) {
            devicesHtml = '<div style="margin-top:12px;"><strong style="font-size:0.8rem;color:#64748b;">Dispositivos confiables:</strong><ul style="list-style:none;padding:0;margin:8px 0;">';
            for (const d of data.trustedDevices) {
                const exp = new Date(d.expires_at);
                const expStr = exp < new Date() ? '<span style="color:#ef4444;">expirado</span>' : `hasta ${exp.toLocaleDateString()}`;
                devicesHtml += `<li style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:0.85rem;">
                    <span>${d.label || 'Dispositivo'} <span style="color:#94a3b8;">(${d.ip_address})</span> — ${expStr}</span>
                    <button class="btn btn-sm" onclick="removeTrustedDevice(${d.id})" style="font-size:0.75rem;padding:2px 8px;background:#fee2e2;color:#b91c1c;border:none;cursor:pointer;">X</button>
                </li>`;
            }
            devicesHtml += '</ul></div>';
        }

        // Passkeys section
        let passkeysHtml = '';
        if (data.passkeysAvailable) {
            const pkList = (data.passkeys || []).map(pk =>
                `<li style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f1f5f9;font-size:0.85rem;">
                    <span>&#x1F511; ${escapeHtml(pk.label)} <span style="color:#94a3b8;font-size:0.75rem;">${pk.last_used ? 'Usado ' + new Date(pk.last_used).toLocaleDateString() : 'Nunca usado'}</span></span>
                    <button class="btn btn-sm" onclick="removePasskey(${pk.id})" style="font-size:0.75rem;padding:2px 8px;background:#fee2e2;color:#b91c1c;border:none;cursor:pointer;">X</button>
                </li>`
            ).join('');
            passkeysHtml = `<div style="margin-top:12px;">
                <strong style="font-size:0.8rem;color:#64748b;">Passkeys (Windows Hello, Touch ID):</strong>
                ${pkList ? '<ul style="list-style:none;padding:0;margin:8px 0;">' + pkList + '</ul>' : '<p style="font-size:0.8rem;color:#94a3b8;margin:6px 0;">Sin passkeys registradas</p>'}
                <button class="btn btn-sm" onclick="registerPasskey()" style="background:#f0f4ff;color:#0052cc;font-size:0.8rem;margin-top:4px;">+ Agregar Passkey</button>
            </div>`;
        }

        container.innerHTML = `
            <div style="padding:8px 0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                    <span style="background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:600;">2FA Activo</span>
                    ${data.enforced ? '<span style="background:#dbeafe;color:#2563eb;padding:4px 10px;border-radius:20px;font-size:0.75rem;">Requerido por admin</span>' : ''}
                </div>
                <p style="color:#64748b;font-size:0.85rem;">Codigos de recuperacion restantes: <strong>${data.recoveryCodesRemaining}</strong></p>
                ${devicesHtml}
                ${passkeysHtml}
                <div style="margin-top:16px;padding-top:12px;border-top:1px solid #e2e8f0;">
                    <button class="btn btn-sm" onclick="disableTwofa()" style="background:#fee2e2;color:#b91c1c;font-size:0.8rem;" ${data.enforced ? 'disabled title="Obligatorio por admin"' : ''}>Desactivar 2FA</button>
                </div>
            </div>`;
    } catch (err) {
        container.innerHTML = '<div style="color:#ef4444;padding:12px;">Error de conexion</div>';
    }
}

let _twofaQrTimer = null;

async function setupTwofa() {
    const container = document.getElementById('twofaContent');
    container.innerHTML = '<div style="text-align:center;padding:20px;color:#94a3b8;">Generando codigo QR...</div>';
    if (_twofaQrTimer) { clearInterval(_twofaQrTimer); _twofaQrTimer = null; }
    try {
        const res = await fetch('/api/twofa/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        if (!res.ok) { showToast(data.error || 'Error', 'error'); loadTwofaStatus(); return; }

        const expiresAt = Date.now() + 3 * 60 * 1000; // 3 min from now

        container.innerHTML = `
            <div style="padding:8px 0;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                    <span style="font-size:0.85rem;font-weight:600;color:#1a202c;">Paso 1: Escanea el codigo QR</span>
                    <span id="twofaQrTimer" style="font-size:0.75rem;font-weight:600;color:#f59e0b;background:#fefce8;padding:3px 10px;border-radius:12px;"></span>
                </div>
                <div style="text-align:center;margin-bottom:12px;padding:16px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
                    <img src="${data.qrCodeDataUrl}" alt="QR Code" style="width:180px;height:180px;">
                </div>
                <details style="margin-bottom:16px;">
                    <summary style="font-size:0.8rem;color:#94a3b8;cursor:pointer;">No puedes escanear? Ingresa esta clave manual</summary>
                    <div style="background:#f1f5f9;padding:10px 14px;border-radius:6px;font-family:'Courier New',monospace;font-size:0.8rem;word-break:break-all;margin-top:8px;cursor:pointer;letter-spacing:1px;" onclick="navigator.clipboard.writeText('${data.manualEntryKey}');showToast('Clave copiada','success');" title="Click para copiar">${data.manualEntryKey} <span style="color:#94a3b8;font-size:0.7rem;">&#x1F4CB;</span></div>
                </details>
                <div style="margin-bottom:8px;">
                    <span style="font-size:0.85rem;font-weight:600;color:#1a202c;">Paso 2: Ingresa el codigo de 6 digitos</span>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <input type="text" id="twofaVerifyCode" placeholder="000000" maxlength="6" style="flex:1;padding:12px 14px;border:2px solid #e2e8f0;border-radius:8px;font-size:1.4rem;font-family:'Courier New',monospace;text-align:center;letter-spacing:6px;outline:none;transition:border-color 0.2s;" inputmode="numeric" onfocus="this.style.borderColor='#0052cc'" onblur="this.style.borderColor='#e2e8f0'">
                    <button class="btn btn-sm" onclick="verifyTwofaSetup()" style="background:#0052cc;color:#fff;padding:12px 20px;font-size:0.9rem;">Verificar</button>
                </div>
                <div style="text-align:right;margin-top:8px;">
                    <a href="#" onclick="loadTwofaStatus();return false;" style="font-size:0.8rem;color:#94a3b8;text-decoration:none;">Cancelar</a>
                </div>
            </div>`;

        document.getElementById('twofaVerifyCode').focus();

        // Enter key submits
        document.getElementById('twofaVerifyCode').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') verifyTwofaSetup();
        });

        // Countdown timer — QR expires in 10 min
        function updateTimer() {
            const el = document.getElementById('twofaQrTimer');
            if (!el) { clearInterval(_twofaQrTimer); _twofaQrTimer = null; return; }
            const remaining = Math.max(0, expiresAt - Date.now());
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            el.textContent = `Expira en ${mins}:${secs.toString().padStart(2, '0')}`;
            if (remaining <= 2 * 60 * 1000) el.style.color = '#ef4444'; // red when < 2 min
            if (remaining <= 0) {
                clearInterval(_twofaQrTimer);
                _twofaQrTimer = null;
                container.innerHTML = `
                    <div style="text-align:center;padding:20px;">
                        <p style="color:#ef4444;font-weight:600;margin-bottom:12px;">El codigo QR expiro</p>
                        <button class="btn btn-sm" onclick="setupTwofa()" style="background:#0052cc;color:#fff;">Generar nuevo QR</button>
                    </div>`;
            }
        }
        updateTimer();
        _twofaQrTimer = setInterval(updateTimer, 1000);
    } catch (err) {
        showToast('Error al generar QR', 'error');
        loadTwofaStatus();
    }
}

async function verifyTwofaSetup() {
    const code = document.getElementById('twofaVerifyCode')?.value;
    if (!code || code.length < 6) { showToast('Ingresa el codigo de 6 digitos', 'warning'); return; }
    try {
        const res = await fetch('/api/twofa/verify-setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: code })
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.error || 'Codigo invalido', 'error'); return; }

        if (_twofaQrTimer) { clearInterval(_twofaQrTimer); _twofaQrTimer = null; }

        // Show recovery codes
        const container = document.getElementById('twofaContent');
        const codesText = data.recoveryCodes.join('\n');
        const codesGrid = data.recoveryCodes.map((c, i) =>
            `<div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:#fff;border:1px solid #e2e8f0;border-radius:6px;">
                <span style="color:#94a3b8;font-size:0.7rem;font-weight:600;min-width:16px;">${i + 1}.</span>
                <code style="font-family:'Courier New',monospace;font-size:0.95rem;font-weight:600;color:#1a202c;letter-spacing:1px;">${c}</code>
            </div>`
        ).join('');

        container.innerHTML = `
            <div style="padding:12px 0;">
                <div style="background:#dcfce7;padding:14px;border-radius:10px;margin-bottom:16px;text-align:center;display:flex;align-items:center;justify-content:center;gap:8px;">
                    <span style="font-size:1.3rem;">&#x2705;</span>
                    <span style="color:#16a34a;font-weight:700;font-size:0.95rem;">2FA activado correctamente</span>
                </div>
                <div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:10px;padding:20px;margin-bottom:16px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                        <span style="font-size:1.2rem;">&#x26A0;</span>
                        <span style="font-weight:700;color:#92400e;font-size:0.95rem;">Codigos de recuperacion</span>
                    </div>
                    <p style="font-size:0.82rem;color:#78350f;margin-bottom:14px;line-height:1.5;">Guarda estos codigos en un lugar seguro. Si pierdes tu telefono, los necesitaras para acceder. <strong>No se mostraran de nuevo.</strong></p>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:16px;">
                        ${codesGrid}
                    </div>
                    <button class="btn btn-sm" onclick="navigator.clipboard.writeText(\`${codesText}\`);this.textContent='Copiados!';this.style.background='#16a34a';setTimeout(()=>{this.textContent='Copiar todos los codigos';this.style.background='#92400e';},2000);" style="width:100%;background:#92400e;color:#fff;padding:10px;border-radius:8px;font-weight:600;font-size:0.85rem;border:none;cursor:pointer;transition:background 0.2s;">Copiar todos los codigos</button>
                </div>
                <button class="btn btn-sm" onclick="loadTwofaStatus()" style="width:100%;background:#0052cc;color:#fff;padding:10px;border-radius:8px;font-weight:600;font-size:0.9rem;border:none;cursor:pointer;">He guardado mis codigos</button>
            </div>`;
        showToast('2FA activado', 'success');
    } catch (err) {
        showToast('Error al verificar', 'error');
    }
}

async function disableTwofa() {
    const pw = prompt('Ingresa tu contrasena actual para desactivar 2FA:');
    if (!pw) return;
    try {
        const res = await fetch('/api/twofa/disable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: pw })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('2FA desactivado', 'success');
            loadTwofaStatus();
        } else {
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error al desactivar 2FA', 'error');
    }
}

async function removeTrustedDevice(id) {
    try {
        const res = await fetch(`/api/twofa/trusted-devices/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Dispositivo eliminado', 'success');
            loadTwofaStatus();
        }
    } catch (err) {
        showToast('Error', 'error');
    }
}

// ─── Passkey Management ────────────────────────────────────────────────────

async function registerPasskey() {
    try {
        const beginRes = await fetch('/api/twofa/passkey/register-begin', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        if (!beginRes.ok) { const d = await beginRes.json(); showToast(d.error || 'Error', 'error'); return; }
        const options = await beginRes.json();

        const credential = await SimpleWebAuthnBrowser.startRegistration({ optionsJSON: options });

        const label = prompt('Nombre para esta passkey (ej: "Laptop oficina"):', 'Mi passkey') || 'Passkey';
        const endRes = await fetch('/api/twofa/passkey/register-end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential, label })
        });
        const result = await endRes.json();
        if (result.success) {
            showToast('Passkey registrada: ' + result.label, 'success');
            loadTwofaStatus();
        } else {
            showToast(result.error || 'Error', 'error');
        }
    } catch (err) {
        if (err.name === 'NotAllowedError') showToast('Operacion cancelada', 'info');
        else showToast('Error: ' + err.message, 'error');
    }
}

async function removePasskey(id) {
    if (!confirm('Eliminar esta passkey?')) return;
    try {
        const res = await fetch(`/api/twofa/passkey/${id}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Passkey eliminada', 'success');
            loadTwofaStatus();
        }
    } catch (err) {
        showToast('Error', 'error');
    }
}

// ─── Admin Users Management ─────────────────────────────────────────────────
let _adminUsers = [];

async function loadAdminUsers() {
    const tbody = document.getElementById('adminUsersTbody');
    if (!tbody) return;

    try {
        _adminUsers = await getCachedUsers();

        // Stats bar
        const statsBar = document.getElementById('auStatsBar');
        if (statsBar) {
            const roleCounts = { admin: 0, ceo: 0, manager: 0, analyst: 0, consultor: 0, usuario: 0, cliente: 0 };
            _adminUsers.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });
            statsBar.innerHTML = `
                <div class="au-stat"><span class="au-stat-num">${_adminUsers.length}</span><span class="au-stat-label">Total</span></div>
                <div class="au-stat au-stat-admin"><span class="au-stat-num">${roleCounts.admin}</span><span class="au-stat-label">Admins</span></div>
                <div class="au-stat au-stat-ceo"><span class="au-stat-num">${roleCounts.ceo}</span><span class="au-stat-label">CEO</span></div>
                <div class="au-stat au-stat-manager"><span class="au-stat-num">${roleCounts.manager}</span><span class="au-stat-label">Managers</span></div>
                <div class="au-stat au-stat-analyst"><span class="au-stat-num">${roleCounts.analyst}</span><span class="au-stat-label">Analysts</span></div>
                <div class="au-stat au-stat-consultor"><span class="au-stat-num">${roleCounts.consultor}</span><span class="au-stat-label">Consultores</span></div>
                <div class="au-stat au-stat-usuario"><span class="au-stat-num">${roleCounts.usuario}</span><span class="au-stat-label">Usuarios</span></div>
                <div class="au-stat au-stat-cliente"><span class="au-stat-num">${roleCounts.cliente}</span><span class="au-stat-label">Clientes</span></div>
            `;
        }

        renderAdminUsersTable(_adminUsers);
    } catch (err) {
        console.error('Load admin users error:', err);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-muted);">Error al cargar usuarios</td></tr>';
    }
}

function renderAdminUsersTable(users) {
    const tbody = document.getElementById('adminUsersTbody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">No se encontraron usuarios</td></tr>';
        return;
    }

    const roleLabels = { admin: 'Admin', ceo: 'CEO', manager: 'Manager', analyst: 'Analyst', consultor: 'Consultor', usuario: 'Usuario', cliente: 'Cliente' };

    tbody.innerHTML = users.map(u => {
        const date = u.created_at ? new Date(u.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        return `<tr class="au-row" data-user-id="${u.id}">
            <td>
                <div class="au-user-cell">
                    ${_avatarHtml(u.avatar, u.username, 36)}
                    <span class="au-username">${escapeHtml(u.username)}${u.locked_until && new Date(u.locked_until) > new Date() ? ' <span style="background:#fee2e2;color:#b91c1c;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;">Bloqueado</span>' : ''}</span>
                </div>
            </td>
            <td><span class="au-cell-text" style="font-size:0.82rem;opacity:0.8">${escapeHtml(u.email || '—')}</span></td>
            <td>
                <select class="au-role-select role-${escapeHtml(u.role)}" data-user-id="${u.id}" data-original="${escapeHtml(u.role)}" onchange="changeUserRole(this)">
                    ${['admin','ceo','manager','analyst','consultor','usuario','cliente'].map(r =>
                        `<option value="${r}" ${r === u.role ? 'selected' : ''}>${roleLabels[r]}</option>`
                    ).join('')}
                </select>
            </td>
            <td><span class="au-cell-text">${escapeHtml(u.department || '—')}</span></td>
            <td><span class="au-cell-text">${escapeHtml(u.expertise || '—')}</span></td>
            <td><span class="au-cell-date">${date}</span></td>
            <td>
                <div class="au-actions">
                    ${u.locked_until && new Date(u.locked_until) > new Date() ? `<button class="au-btn-edit" onclick="unlockUser(${u.id}, '${escapeHtml(u.username)}')" title="Desbloquear" style="color:#e74c3c;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg></button>` : ''}
                    <button class="au-btn-edit" onclick="openUserEditModal(${u.id})" title="Editar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="au-btn-delete" onclick="deleteAdminUser(${u.id}, '${escapeHtml(u.username)}')" title="Eliminar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function filterAdminUsers() {
    const search = (document.getElementById('auSearchInput')?.value || '').toLowerCase();
    const roleFilter = document.getElementById('auFilterRole')?.value || '';
    const filtered = _adminUsers.filter(u => {
        const matchSearch = !search || u.username.toLowerCase().includes(search)
            || (u.email || '').toLowerCase().includes(search)
            || (u.department || '').toLowerCase().includes(search)
            || (u.expertise || '').toLowerCase().includes(search);
        const matchRole = !roleFilter || u.role === roleFilter;
        return matchSearch && matchRole;
    });
    renderAdminUsersTable(filtered);
}

async function changeUserRole(select) {
    const userId = select.dataset.userId;
    const newRole = select.value;
    const originalRole = select.dataset.original;
    if (newRole === originalRole) return;

    const user = _adminUsers.find(u => u.id === parseInt(userId));
    if (!user) return;

    try {
        const res = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole, department: user.department, expertise: user.expertise })
        });
        if (res.ok) {
            invalidateUsersCache();
            select.dataset.original = newRole;
            select.className = `au-role-select role-${newRole}`;
            user.role = newRole;
            // Update stats
            const statsBar = document.getElementById('auStatsBar');
            if (statsBar) {
                const roleCounts = { admin: 0, ceo: 0, manager: 0, analyst: 0, consultor: 0, usuario: 0, cliente: 0 };
                _adminUsers.forEach(u => { if (roleCounts[u.role] !== undefined) roleCounts[u.role]++; });
                statsBar.querySelector('.au-stat-admin .au-stat-num').textContent = roleCounts.admin;
                statsBar.querySelector('.au-stat-ceo .au-stat-num').textContent = roleCounts.ceo;
                statsBar.querySelector('.au-stat-manager .au-stat-num').textContent = roleCounts.manager;
                statsBar.querySelector('.au-stat-analyst .au-stat-num').textContent = roleCounts.analyst;
                statsBar.querySelector('.au-stat-consultor .au-stat-num').textContent = roleCounts.consultor;
                statsBar.querySelector('.au-stat-usuario .au-stat-num').textContent = roleCounts.usuario;
                statsBar.querySelector('.au-stat-cliente .au-stat-num').textContent = roleCounts.cliente;
            }
            showToast(`Rol de ${user.username} cambiado a ${newRole}`, 'success');
        } else {
            select.value = originalRole;
            showToast('Error al cambiar rol', 'error');
        }
    } catch (err) {
        select.value = originalRole;
        showToast('Error de conexion', 'error');
    }
}

function openUserEditModal(userId) {
    const modal = document.getElementById('userEditModal');
    if (!modal) return;

    const titleEl = document.getElementById('userEditTitle');
    const usernameInput = document.getElementById('userEditUsername');
    const emailInput = document.getElementById('userEditEmail');
    const emailGroup = document.getElementById('userEditEmailGroup');
    const pwInput = document.getElementById('userEditPassword');
    const pwLabel = document.getElementById('userEditPwLabel');
    const idInput = document.getElementById('userEditId');
    const preview = document.getElementById('userEditAvatarPreview');

    if (userId) {
        // Edit mode
        const u = _adminUsers.find(x => x.id === userId);
        if (!u) return;
        if (titleEl) titleEl.textContent = `Editar: ${u.username}`;
        if (idInput) idInput.value = u.id;
        if (usernameInput) { usernameInput.value = u.username; usernameInput.disabled = true; }
        if (emailInput) { emailInput.value = u.email || ''; emailInput.disabled = true; }
        if (emailGroup) emailGroup.style.display = u.email ? '' : 'none';
        if (pwInput) pwInput.placeholder = 'Dejar vacio para no cambiar';
        if (pwLabel) pwLabel.textContent = 'Nueva Contraseña (opcional)';
        document.getElementById('userEditRole').value = u.role || 'analyst';
        document.getElementById('userEditDepartment').value = u.department || '';
        document.getElementById('userEditExpertise').value = u.expertise || '';
        if (preview) preview.innerHTML = _avatarHtml(u.avatar, u.username, 70);
    } else {
        // Create mode
        if (titleEl) titleEl.textContent = 'Nuevo Usuario';
        if (idInput) idInput.value = '';
        if (usernameInput) { usernameInput.value = ''; usernameInput.disabled = false; }
        if (emailInput) { emailInput.value = ''; emailInput.disabled = false; }
        if (emailGroup) emailGroup.style.display = '';
        if (pwInput) pwInput.placeholder = 'Min 4 caracteres';
        if (pwLabel) pwLabel.textContent = 'Contraseña';
        document.getElementById('userEditRole').value = 'analyst';
        document.getElementById('userEditDepartment').value = '';
        document.getElementById('userEditExpertise').value = '';
        if (preview) preview.innerHTML = _avatarHtml(null, '?', 70);
    }

    modal.style.display = 'block';
}

function closeUserEditModal() {
    const m = document.getElementById('userEditModal');
    if (m) m.style.display = 'none';
}

// User edit form + avatar upload
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('userEditForm');
        if (form) form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('userEditId').value;
            const isEdit = !!id;

            const payload = {
                role: document.getElementById('userEditRole').value,
                department: document.getElementById('userEditDepartment').value,
                expertise: document.getElementById('userEditExpertise').value
            };

            if (isEdit) {
                const pw = document.getElementById('userEditPassword').value;
                if (pw) payload.newPassword = pw;
            } else {
                payload.username = document.getElementById('userEditUsername').value;
                payload.email = (document.getElementById('userEditEmail')?.value || '').trim();
                payload.password = document.getElementById('userEditPassword').value;
                if (!payload.email || !payload.password || payload.password.length < 8) {
                    showToast('Email y contraseña (mín 8) son requeridos', 'warning');
                    return;
                }
                if (!payload.username) payload.username = payload.email.split('@')[0];
            }

            try {
                const url = isEdit ? `/api/users/${id}` : '/api/users';
                const method = isEdit ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if (res.ok) {
                    closeUserEditModal();
                    showToast(isEdit ? 'Usuario actualizado' : 'Usuario creado', 'success');
                    loadAdminUsers();
                } else {
                    showToast(data.error || 'Error', 'error');
                }
            } catch (err) {
                showToast('Error de conexion', 'error');
            }
        });

        // Admin avatar upload for user being edited
        const avatarInput = document.getElementById('userEditAvatarInput');
        if (avatarInput) avatarInput.addEventListener('change', async () => {
            const id = document.getElementById('userEditId').value;
            if (!id || !avatarInput.files[0]) {
                if (!id) showToast('Guarda el usuario primero, luego sube la foto', 'info');
                return;
            }
            const fd = new FormData();
            fd.append('avatar', avatarInput.files[0]);
            try {
                const res = await fetch(`/api/users/${id}/avatar`, { method: 'PUT', body: fd });
                const data = await res.json();
                if (res.ok && data.avatar) {
                    showToast('Foto actualizada', 'success');
                    const preview = document.getElementById('userEditAvatarPreview');
                    if (preview) preview.innerHTML = _avatarHtml(data.avatar, '', 70);
                    loadAdminUsers();
                }
            } catch (err) {
                showToast('Error al subir foto', 'error');
            }
            avatarInput.value = '';
        });
    });
})();

async function deleteAdminUser(id, username) {
    if (!confirm(`Eliminar al usuario "${username}"? Esta accion no se puede deshacer.`)) return;
    try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
            invalidateUsersCache();
            showToast('Usuario eliminado', 'info');
            loadAdminUsers();
        } else {
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error al eliminar', 'error');
    }
}

window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.changeOwnPassword = changeOwnPassword;
window.setupTwofa = setupTwofa;
window.verifyTwofaSetup = verifyTwofaSetup;
window.disableTwofa = disableTwofa;
window.removeTrustedDevice = removeTrustedDevice;
window.loadTwofaStatus = loadTwofaStatus;
async function unlockUser(userId, username) {
    if (!confirm(`Desbloquear la cuenta de ${username}?`)) return;
    try {
        const res = await fetch(`/api/users/${userId}/unlock`, { method: 'PUT' });
        if (res.ok) {
            showToast(`Cuenta de ${username} desbloqueada`, 'success');
            _usersCache = null;
            loadAdminUsers();
        } else {
            const data = await res.json();
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error al desbloquear', 'error');
    }
}

// ─── Audit Log ──────────────────────────────────────────────────────────────

const _auditEventLabels = {
    login_success: 'Login exitoso',
    login_failure: 'Login fallido',
    account_lock: 'Cuenta bloqueada',
    account_unlock: 'Cuenta desbloqueada',
    password_change: 'Cambio de password',
    '2fa_enable': '2FA activado',
    '2fa_disable': '2FA desactivado',
    '2fa_success': '2FA exitoso',
    '2fa_failure': '2FA fallido',
    user_create: 'Usuario creado',
    user_delete: 'Usuario eliminado',
    role_change: 'Cambio de rol',
    enforce_2fa: '2FA forzado',
    api_key_create: 'API key creada',
    api_key_delete: 'API key eliminada'
};

const _auditEventColors = {
    login_success: '#27ae60', login_failure: '#e74c3c',
    account_lock: '#c0392b', account_unlock: '#2ecc71',
    password_change: '#f39c12', '2fa_enable': '#3498db',
    '2fa_disable': '#e67e22', '2fa_success': '#27ae60',
    '2fa_failure': '#e74c3c', user_create: '#2ecc71',
    user_delete: '#e74c3c', role_change: '#9b59b6',
    enforce_2fa: '#3498db', api_key_create: '#1abc9c',
    api_key_delete: '#e74c3c'
};

let _auditDebounce = null;
async function loadAuditLog() {
    clearTimeout(_auditDebounce);
    _auditDebounce = setTimeout(_doLoadAuditLog, 300);
}

async function _doLoadAuditLog() {
    const tbody = document.getElementById('auditLogTbody');
    if (!tbody) return;

    const eventType = document.getElementById('auditFilterEvent')?.value || '';
    const actor = document.getElementById('auditFilterActor')?.value?.trim() || '';
    const from = document.getElementById('auditFilterFrom')?.value || '';
    const to = document.getElementById('auditFilterTo')?.value || '';

    const params = new URLSearchParams();
    if (eventType) params.set('event_type', eventType);
    if (actor) params.set('actor', actor);
    if (from) params.set('from', from);
    if (to) params.set('to', to + 'T23:59:59');
    params.set('limit', '200');

    try {
        const res = await fetch('/api/audit-log?' + params.toString());
        if (!res.ok) throw new Error('Failed to fetch');
        const rows = await res.json();

        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">Sin eventos</td></tr>';
            return;
        }

        tbody.innerHTML = rows.map(r => {
            const date = new Date(r.created_at).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const label = _auditEventLabels[r.event_type] || r.event_type;
            const color = _auditEventColors[r.event_type] || '#888';
            let detailsStr = '';
            if (r.details) {
                try {
                    const d = typeof r.details === 'string' ? JSON.parse(r.details) : r.details;
                    detailsStr = Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
                } catch (_) { detailsStr = String(r.details); }
            }
            return `<tr>
                <td style="font-size:0.82rem;white-space:nowrap;">${date}</td>
                <td><span style="background:${color}15;color:${color};padding:3px 8px;border-radius:4px;font-size:0.78rem;font-weight:600;">${escapeHtml(label)}</span></td>
                <td style="font-size:0.82rem;">${escapeHtml(r.actor || '—')}</td>
                <td style="font-size:0.82rem;">${escapeHtml(r.target || '—')}</td>
                <td style="font-size:0.82rem;opacity:0.7;">${escapeHtml(r.ip_address || '—')}</td>
                <td style="font-size:0.78rem;opacity:0.7;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(detailsStr)}">${escapeHtml(detailsStr || '—')}</td>
            </tr>`;
        }).join('');
    } catch (err) {
        console.error('Load audit log error:', err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--text-muted);">Error al cargar auditoria</td></tr>';
    }
}

window.unlockUser = unlockUser;
window.loadAuditLog = loadAuditLog;
window.loadAdminUsers = loadAdminUsers;
window.openUserEditModal = openUserEditModal;
window.closeUserEditModal = closeUserEditModal;
window.deleteAdminUser = deleteAdminUser;
window.filterAdminUsers = filterAdminUsers;
window.changeUserRole = changeUserRole;
window.loadGraphView = loadGraphView;
window.resetGraphZoom = resetGraphZoom;
window.searchGraphNode = searchGraphNode;
window.toggleGraphType = toggleGraphType;


// ═══════════════════════════════════════════════════════════════════════════════
// GRAPH VIEW — Obsidian-style force-directed graph
// ═══════════════════════════════════════════════════════════════════════════════

const GRAPH_TYPES = {
    project: { color: '#2ecc71', label: 'Proyectos', icon: '🎯' },
    area:    { color: '#9b59b6', label: 'Áreas', icon: '📂' },
    idea:    { color: '#3498db', label: 'Ideas', icon: '💡' },
    reunion: { color: '#e74c3c', label: 'Reuniones', icon: '📅' },
    skill:   { color: '#e67e22', label: 'Skills', icon: '🔧' },
    okr:     { color: '#f1c40f', label: 'OKRs', icon: '🏆' },
    user:    { color: '#1abc9c', label: 'Usuarios', icon: '👤' }
};
const USER_ROLE_COLORS = {
    admin:     '#e74c3c',
    manager:   '#f39c12',
    analyst:   '#3498db',
    consultor: '#2ecc71'
};

let _graphSim = null;
let _graphData = null;
let _graphZoom = null;
let _graphActiveTypes = new Set(Object.keys(GRAPH_TYPES));
let _graphDaysFilter = 0;

async function loadGraphView(days) {
    const container = document.getElementById('graphContainer');
    if (!container) return;

    if (days !== undefined) _graphDaysFilter = days;

    // Show loading
    const svg = d3.select('#graphSvg');
    svg.selectAll('*').remove();
    const rect = container.getBoundingClientRect();
    const width = rect.width || 900;
    const height = rect.height || 600;
    svg.attr('width', width).attr('height', height);

    try {
        const url = _graphDaysFilter > 0 ? `/api/graph?days=${_graphDaysFilter}` : '/api/graph';
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API ${res.status}`);
        _graphData = await res.json();
        _graphActiveTypes = new Set(Object.keys(GRAPH_TYPES));

        // Render filter buttons with counts
        const counts = _graphData.counts || {};
        const filtersEl = document.getElementById('graphFilters');
        if (filtersEl) {
            const timeOpts = [
                { val: 0, label: 'Todo' },
                { val: 7, label: '7d' },
                { val: 30, label: '30d' },
                { val: 90, label: '90d' }
            ];
            const timeHtml = `<select class="graph-time-select" onchange="loadGraphView(parseInt(this.value))">
                ${timeOpts.map(o => `<option value="${o.val}" ${o.val === _graphDaysFilter ? 'selected' : ''}>${o.label}</option>`).join('')}
            </select>`;
            const btnHtml = Object.entries(GRAPH_TYPES).map(([type, cfg]) => {
                const cnt = counts[type] || 0;
                return `<button class="graph-filter-btn active" data-type="${type}" style="--gf-color:${cfg.color}" onclick="toggleGraphType('${type}', this)">
                    ${cfg.icon} ${cfg.label} <span class="graph-filter-count">(${cnt})</span>
                </button>`;
            }).join('');
            filtersEl.innerHTML = timeHtml + btnHtml;
        }

        // Render legend
        const legendEl = document.getElementById('graphLegend');
        if (legendEl) {
            const typeLegend = Object.entries(GRAPH_TYPES).filter(([k]) => k !== 'user').map(([, cfg]) =>
                `<div class="graph-legend-item">
                    <div class="graph-legend-dot" style="background:${cfg.color}"></div>
                    <span>${cfg.label}</span>
                </div>`
            ).join('');
            const roleLegend = Object.entries(USER_ROLE_COLORS).map(([role, color]) =>
                `<div class="graph-legend-item">
                    <div class="graph-legend-dot" style="background:${color}"></div>
                    <span>${role.charAt(0).toUpperCase() + role.slice(1)}</span>
                </div>`
            ).join('');
            legendEl.innerHTML = typeLegend + roleLegend;
        }

        _renderGraph(width, height);
    } catch (err) {
        svg.append('text').attr('x', width / 2).attr('y', height / 2)
            .attr('text-anchor', 'middle').attr('class', 'graph-label')
            .text('Error cargando grafo: ' + err.message);
    }
}

function _renderGraph(width, height) {
    if (!_graphData) return;
    const svg = d3.select('#graphSvg');
    svg.selectAll('*').remove();

    // Filter by active types
    const nodes = _graphData.nodes.filter(n => _graphActiveTypes.has(n.type));
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = _graphData.edges.filter(e => nodeIds.has(e.source?.id || e.source) && nodeIds.has(e.target?.id || e.target));

    // Deep copy for D3 mutation
    const simNodes = nodes.map(d => ({ ...d }));
    const simEdges = edges.map(d => ({ ...d }));

    // Compute connection counts for sizing
    const connCount = {};
    simEdges.forEach(e => {
        const s = typeof e.source === 'object' ? e.source.id : e.source;
        const t = typeof e.target === 'object' ? e.target.id : e.target;
        connCount[s] = (connCount[s] || 0) + 1;
        connCount[t] = (connCount[t] || 0) + 1;
    });
    function nodeRadius(d) {
        const c = connCount[d.id] || 0;
        return Math.max(5, Math.min(22, 5 + c * 1.8));
    }

    // Create zoom group
    const g = svg.append('g');

    _graphZoom = d3.zoom()
        .scaleExtent([0.1, 5])
        .on('zoom', (event) => g.attr('transform', event.transform));
    svg.call(_graphZoom);

    // Edges
    const edgeG = g.append('g').attr('class', 'graph-edges');
    const link = edgeG.selectAll('line')
        .data(simEdges)
        .join('line')
        .attr('class', 'graph-edge');

    // Nodes group
    const nodeG = g.append('g').attr('class', 'graph-nodes');
    const node = nodeG.selectAll('g')
        .data(simNodes)
        .join('g')
        .attr('class', 'graph-node')
        .call(d3.drag()
            .on('start', _dragStart)
            .on('drag', _dragging)
            .on('end', _dragEnd));

    // Color resolver: users get role-based colors, others use type color
    function nodeColor(d) {
        if (d.type === 'user' && d.data?.role) return USER_ROLE_COLORS[d.data.role] || GRAPH_TYPES.user.color;
        return GRAPH_TYPES[d.type]?.color || '#888';
    }

    // Circle for each node
    node.append('circle')
        .attr('r', d => nodeRadius(d))
        .attr('fill', d => nodeColor(d))
        .attr('stroke', d => nodeColor(d))
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', d => nodeRadius(d) * 0.4);

    // Labels (only for bigger nodes or non-ideas)
    node.filter(d => d.type !== 'idea' || (connCount[d.id] || 0) >= 3)
        .append('text')
        .attr('class', 'graph-label')
        .attr('dy', d => nodeRadius(d) + 12)
        .text(d => d.label ? (d.label.length > 25 ? d.label.substring(0, 25) + '…' : d.label) : '');

    // Tooltip & highlight
    const tooltip = d3.select('#graphTooltip');

    node.on('mouseenter', function (event, d) {
        const conns = connCount[d.id] || 0;
        const typeCfg = GRAPH_TYPES[d.type] || {};
        tooltip
            .style('display', 'block')
            .style('left', (event.clientX + 12) + 'px')
            .style('top', (event.clientY - 10) + 'px')
            .html(`
                <div style="font-weight:700;color:${d.type === 'user' && d.data?.role ? (USER_ROLE_COLORS[d.data.role] || typeCfg.color) : (typeCfg.color || '#fff')};margin-bottom:4px">${typeCfg.icon || ''} ${escapeHtml(d.label || '')}</div>
                <div style="color:var(--text-muted);font-size:0.75rem">${d.type === 'user' && d.data?.role ? d.data.role.charAt(0).toUpperCase() + d.data.role.slice(1) : (typeCfg.label || d.type)} · ${conns} conexion${conns !== 1 ? 'es' : ''}</div>
            `);

        // Highlight connected nodes and edges
        const connected = new Set();
        connected.add(d.id);
        simEdges.forEach(e => {
            const sId = typeof e.source === 'object' ? e.source.id : e.source;
            const tId = typeof e.target === 'object' ? e.target.id : e.target;
            if (sId === d.id) connected.add(tId);
            if (tId === d.id) connected.add(sId);
        });

        node.classed('dimmed', n => !connected.has(n.id));
        node.classed('highlighted', n => n.id === d.id);
        link.classed('dimmed', e => {
            const sId = typeof e.source === 'object' ? e.source.id : e.source;
            const tId = typeof e.target === 'object' ? e.target.id : e.target;
            return sId !== d.id && tId !== d.id;
        });
        link.classed('highlighted', e => {
            const sId = typeof e.source === 'object' ? e.source.id : e.source;
            const tId = typeof e.target === 'object' ? e.target.id : e.target;
            return sId === d.id || tId === d.id;
        });
    })
    .on('mousemove', function (event) {
        tooltip
            .style('left', (event.clientX + 12) + 'px')
            .style('top', (event.clientY - 10) + 'px');
    })
    .on('mouseleave', function () {
        tooltip.style('display', 'none');
        node.classed('dimmed', false).classed('highlighted', false);
        link.classed('dimmed', false).classed('highlighted', false);
    })
    .on('click', function (event, d) {
        // Navigate to the entity's section
        const sectionMap = {
            project: 'projects', area: 'areas', idea: 'ideas',
            reunion: 'reuniones', skill: 'skills', okr: 'okrs', user: 'admin-users'
        };
        const sec = sectionMap[d.type];
        if (sec) switchSection(sec);
    });

    // Force simulation
    if (_graphSim) _graphSim.stop();
    _graphSim = d3.forceSimulation(simNodes)
        .force('link', d3.forceLink(simEdges).id(d => d.id).distance(90).strength(0.4))
        .force('charge', d3.forceManyBody().strength(-140))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => nodeRadius(d) + 3))
        .force('x', d3.forceX(width / 2).strength(0.03))
        .force('y', d3.forceY(height / 2).strength(0.03))
        .on('tick', () => {
            link
                .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

    function _dragStart(event, d) {
        if (!event.active) _graphSim.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
    }
    function _dragging(event, d) {
        d.fx = event.x; d.fy = event.y;
    }
    function _dragEnd(event, d) {
        if (!event.active) _graphSim.alphaTarget(0);
        d.fx = null; d.fy = null;
    }
}

function toggleGraphType(type, btn) {
    if (_graphActiveTypes.has(type)) {
        _graphActiveTypes.delete(type);
        btn.classList.remove('active');
    } else {
        _graphActiveTypes.add(type);
        btn.classList.add('active');
    }
    const container = document.getElementById('graphContainer');
    const rect = container.getBoundingClientRect();
    _renderGraph(rect.width || 900, rect.height || 600);
}

function resetGraphZoom() {
    const svg = d3.select('#graphSvg');
    if (_graphZoom) {
        svg.transition().duration(500).call(_graphZoom.transform, d3.zoomIdentity);
    }
}

function searchGraphNode(query) {
    if (!_graphData || !query.trim()) {
        d3.selectAll('.graph-node').classed('dimmed', false).classed('highlighted', false);
        d3.selectAll('.graph-edge').classed('dimmed', false).classed('highlighted', false);
        return;
    }
    const q = query.toLowerCase().trim();
    const matchIds = new Set();
    _graphData.nodes.forEach(n => {
        if ((n.label || '').toLowerCase().includes(q)) matchIds.add(n.id);
    });

    if (matchIds.size === 0) {
        d3.selectAll('.graph-node').classed('dimmed', true).classed('highlighted', false);
        d3.selectAll('.graph-edge').classed('dimmed', true).classed('highlighted', false);
        return;
    }

    d3.selectAll('.graph-node').classed('dimmed', d => !matchIds.has(d.id)).classed('highlighted', d => matchIds.has(d.id));
    d3.selectAll('.graph-edge').classed('dimmed', true).classed('highlighted', false);

    // Center on first match
    const firstMatch = d3.selectAll('.graph-node').filter(d => matchIds.has(d.id)).datum();
    if (firstMatch && _graphZoom) {
        const svg = d3.select('#graphSvg');
        const container = document.getElementById('graphContainer');
        const rect = container.getBoundingClientRect();
        const transform = d3.zoomIdentity
            .translate(rect.width / 2, rect.height / 2)
            .scale(1.5)
            .translate(-firstMatch.x, -firstMatch.y);
        svg.transition().duration(600).call(_graphZoom.transform, transform);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INBOX TRIAGE
// ═══════════════════════════════════════════════════════════════════════════════

function initInboxTriage() {
    // Update badge on load
    updateInboxBadge();
}

async function updateInboxBadge() {
    try {
        const res = await fetch('/api/inbox/pending');
        if (!res.ok) return;
        const data = await res.json();
        const badge = document.getElementById('inboxBadge');
        if (badge) {
            const count = data.needs_review?.length || 0;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-flex' : 'none';
        }
    } catch (_) {}
}

async function loadInboxTriage() {
    try {
        const [inboxRes, allUsers] = await Promise.all([
            fetch('/api/inbox/pending'),
            getCachedUsers()
        ]);
        const data = await inboxRes.json();
        const rankedUsers = allUsers.filter(u => !['usuario', 'cliente'].includes(u.role));

        // Stats
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('inboxStatTotal', data.total || 0);
        set('inboxStatReview', data.needs_review?.length || 0);
        set('inboxStatAuto', data.auto_routed?.length || 0);
        set('inboxReviewCount', data.needs_review?.length || 0);
        set('inboxAutoCount', data.auto_routed?.length || 0);

        // Render needs_review
        const reviewList = document.getElementById('inboxReviewList');
        if (reviewList) {
            if (!data.needs_review?.length) {
                reviewList.innerHTML = '<p style="color:var(--text-muted);padding:16px;">No hay items pendientes de revision.</p>';
            } else {
                reviewList.innerHTML = data.needs_review.map(item => renderInboxItem(item, rankedUsers, true)).join('');
            }
        }

        // Render auto-routed
        const autoList = document.getElementById('inboxAutoList');
        if (autoList) {
            if (!data.auto_routed?.length) {
                autoList.innerHTML = '<p style="color:var(--text-muted);padding:16px;">No hay items auto-clasificados.</p>';
            } else {
                autoList.innerHTML = data.auto_routed.map(item => renderInboxItem(item, rankedUsers, false)).join('');
            }
        }
    } catch (err) {
        console.error('Inbox triage error:', err);
    }
}

function renderInboxItem(item, users, showActions) {
    const conf = item.ai_confidence ? `${Math.round(item.ai_confidence * 100)}%` : 'N/A';
    const confColor = item.ai_confidence >= 0.6 ? '#22c55e' : item.ai_confidence >= 0.3 ? '#f59e0b' : '#ef4444';
    const typeLabel = item.ai_type || 'Sin clasificar';
    const catLabel = item.ai_category || '';
    const date = new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    const sourceLabel = item.source ? `<span class="inbox-source">${escapeHtml(item.source)}</span>` : '';

    const userOpts = users.map(u => `<option value="${u.username}"${item.assigned_to === u.username ? ' selected' : ''}>${u.username}</option>`).join('');
    const typeOpts = ['Tarea', 'Proyecto', 'Idea', 'Referencia', 'Admin', 'Reunion']
        .map(t => `<option value="${t}"${typeLabel === t ? ' selected' : ''}>${t}</option>`).join('');

    const actions = showActions ? `
        <div class="inbox-actions">
            <select class="inbox-select" id="inboxType_${item.id}" title="Tipo">${typeOpts}</select>
            <select class="inbox-select" id="inboxAssign_${item.id}" title="Asignar a">
                <option value="">Sin asignar</option>${userOpts}
            </select>
            <select class="inbox-select" id="inboxPriority_${item.id}" title="Prioridad">
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="baja">Baja</option>
            </select>
            <button class="btn btn-sm" onclick="approveInboxItem(${item.id})" title="Aprobar y mover a Organizado">✅ Aprobar</button>
        </div>` : '';

    return `
        <div class="inbox-item" data-id="${item.id}">
            <div class="inbox-item-header">
                <span class="inbox-confidence" style="color:${confColor};font-weight:700;">${conf}</span>
                <span class="inbox-type-badge">${escapeHtml(typeLabel)}</span>
                ${catLabel ? `<span class="inbox-cat-badge">${escapeHtml(catLabel)}</span>` : ''}
                ${sourceLabel}
                <span style="color:var(--text-muted);font-size:0.78rem;margin-left:auto;">${date}</span>
            </div>
            <div class="inbox-item-text">${escapeHtml(item.text || item.ai_summary || '(sin texto)')}</div>
            ${item.ai_summary && item.text !== item.ai_summary ? `<div class="inbox-summary">${escapeHtml(item.ai_summary)}</div>` : ''}
            ${actions}
        </div>`;
}

async function approveInboxItem(id) {
    const typeEl = document.getElementById(`inboxType_${id}`);
    const assignEl = document.getElementById(`inboxAssign_${id}`);
    const prioEl = document.getElementById(`inboxPriority_${id}`);

    try {
        const res = await fetch(`/api/inbox/${id}/approve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ai_type: typeEl?.value || null,
                assigned_to: assignEl?.value || null,
                priority: prioEl?.value || 'media',
                is_project: typeEl?.value === 'Proyecto'
            })
        });
        if (res.ok) {
            showToast('Item aprobado y movido a Organizado', 'success');
            const el = document.querySelector(`.inbox-item[data-id="${id}"]`);
            if (el) el.remove();
            updateInboxBadge();
            // Update counts
            const reviewCount = document.getElementById('inboxReviewCount');
            if (reviewCount) reviewCount.textContent = Math.max(0, parseInt(reviewCount.textContent) - 1);
        } else {
            showToast('Error al aprobar', 'error');
        }
    } catch (err) {
        showToast('Error de conexion', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OKRs
// ═══════════════════════════════════════════════════════════════════════════════

function initOKRs() {}

async function loadOKRs() {
    const container = document.getElementById('okrsList');
    if (!container) return;

    try {
        const res = await fetch('/api/okrs');
        if (!res.ok) throw new Error('Failed');
        const objectives = await res.json();

        if (!objectives.length) {
            container.innerHTML = '<p style="color:var(--text-muted);padding:16px;">No hay objetivos definidos. Crea el primero con "+ Nuevo Objetivo".</p>';
            return;
        }

        container.innerHTML = objectives.map(obj => {
            const krs = obj.key_results || [];
            const progress = krs.length
                ? Math.round(krs.reduce((sum, kr) => sum + (kr.target_value ? (kr.current_value / kr.target_value) * 100 : 0), 0) / krs.length)
                : 0;
            const progressColor = progress >= 70 ? '#22c55e' : progress >= 40 ? '#f59e0b' : '#ef4444';

            const krsHtml = krs.map(kr => {
                const krProg = kr.target_value ? Math.round((kr.current_value / kr.target_value) * 100) : 0;
                return `
                    <div class="okr-kr-item">
                        <div class="okr-kr-header">
                            <span class="okr-kr-title">${escapeHtml(kr.title)}</span>
                            <span class="okr-kr-progress">${kr.current_value || 0}/${kr.target_value || '?'} ${escapeHtml(kr.unit || '')}</span>
                        </div>
                        <div class="okr-progress-bar">
                            <div class="okr-progress-fill" style="width:${Math.min(100, krProg)}%;background:${krProg >= 70 ? '#22c55e' : krProg >= 40 ? '#f59e0b' : '#ef4444'};"></div>
                        </div>
                        <div class="okr-kr-actions">
                            <button class="btn-icon" onclick="updateKRProgress(${kr.id})" title="Actualizar progreso">📊</button>
                            <button class="btn-icon" onclick="deleteOKR(${kr.id})" title="Eliminar">🗑️</button>
                        </div>
                    </div>`;
            }).join('');

            return `
                <div class="okr-objective" data-okr-id="${obj.id}">
                    <div class="okr-obj-header">
                        <div>
                            <h3 class="okr-obj-title">${escapeHtml(obj.title)}</h3>
                            ${obj.description ? `<p class="okr-obj-desc">${escapeHtml(obj.description)}</p>` : ''}
                            ${obj.owner ? `<span class="okr-owner">👤 ${escapeHtml(obj.owner)}</span>` : ''}
                            ${obj.period ? `<span class="okr-period">📅 ${escapeHtml(obj.period)}</span>` : ''}
                        </div>
                        <div class="okr-obj-progress" style="color:${progressColor};font-weight:700;">${progress}%</div>
                    </div>
                    <div class="okr-progress-bar okr-obj-bar">
                        <div class="okr-progress-fill" style="width:${Math.min(100, progress)}%;background:${progressColor};"></div>
                    </div>
                    <div class="okr-krs">${krsHtml || '<p style="color:var(--text-muted);font-size:0.85rem;padding:8px 0;">Sin Key Results. Agrega uno.</p>'}</div>
                    <div class="okr-obj-actions">
                        <button class="btn btn-sm" onclick="addKeyResult(${obj.id})" style="font-size:0.78rem;padding:6px 12px;">+ Key Result</button>
                        <button class="btn btn-sm" onclick="linkOKR(${obj.id})" style="font-size:0.78rem;padding:6px 12px;background:var(--bg-secondary);color:var(--text-primary);box-shadow:none;">🔗 Vincular</button>
                        <button class="btn-icon" onclick="deleteOKR(${obj.id})" title="Eliminar objetivo">🗑️</button>
                    </div>
                </div>`;
        }).join('');
    } catch (err) {
        container.innerHTML = '<p style="color:var(--danger);padding:16px;">Error al cargar OKRs</p>';
    }
}

async function openCreateOKR() {
    const result = await showCustomModal({
        title: 'Nuevo Objetivo (OKR)',
        html: true,
        isConfirm: true,
        message: `
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div><label style="font-weight:600;">Titulo del Objetivo</label>
                <input id="okrTitle" type="text" style="width:100%;padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);" placeholder="Ej: Aumentar presencia digital"></div>
                <div><label style="font-weight:600;">Descripcion</label>
                <textarea id="okrDesc" style="width:100%;padding:8px;min-height:60px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);" placeholder="Detalle del objetivo..."></textarea></div>
                <div style="display:flex;gap:12px;">
                    <div style="flex:1;"><label style="font-weight:600;">Responsable</label>
                    <input id="okrOwner" type="text" style="width:100%;padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);" placeholder="username"></div>
                    <div style="flex:1;"><label style="font-weight:600;">Periodo</label>
                    <input id="okrPeriod" type="text" style="width:100%;padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);" placeholder="Q1 2026"></div>
                </div>
            </div>`
    });

    if (result === true) {
        const title = document.getElementById('okrTitle')?.value?.trim();
        if (!title) return showToast('Titulo requerido', 'error');
        try {
            const res = await fetch('/api/okrs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: document.getElementById('okrDesc')?.value?.trim() || '',
                    owner: document.getElementById('okrOwner')?.value?.trim() || '',
                    period: document.getElementById('okrPeriod')?.value?.trim() || ''
                })
            });
            if (res.ok) { showToast('Objetivo creado', 'success'); loadOKRs(); }
            else showToast('Error al crear', 'error');
        } catch (_) { showToast('Error de conexion', 'error'); }
    }
}

async function addKeyResult(objectiveId) {
    const result = await showCustomModal({
        title: 'Nuevo Key Result',
        html: true,
        isConfirm: true,
        message: `
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div><label style="font-weight:600;">Key Result</label>
                <input id="krTitle" type="text" style="width:100%;padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);" placeholder="Ej: Publicar 12 posts en LinkedIn"></div>
                <div style="display:flex;gap:12px;">
                    <div style="flex:1;"><label style="font-weight:600;">Meta</label>
                    <input id="krTarget" type="number" style="width:100%;padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);" placeholder="12"></div>
                    <div style="flex:1;"><label style="font-weight:600;">Unidad</label>
                    <input id="krUnit" type="text" style="width:100%;padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);" placeholder="posts"></div>
                </div>
            </div>`
    });

    if (result === true) {
        const title = document.getElementById('krTitle')?.value?.trim();
        if (!title) return showToast('Titulo requerido', 'error');
        try {
            const res = await fetch('/api/okrs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    type: 'key_result',
                    parent_id: objectiveId,
                    target_value: parseFloat(document.getElementById('krTarget')?.value) || null,
                    unit: document.getElementById('krUnit')?.value?.trim() || ''
                })
            });
            if (res.ok) { showToast('Key Result creado', 'success'); loadOKRs(); }
            else showToast('Error al crear', 'error');
        } catch (_) { showToast('Error de conexion', 'error'); }
    }
}

async function updateKRProgress(krId) {
    const result = await showCustomModal({
        title: 'Actualizar Progreso',
        inputPlaceholder: 'Nuevo valor actual...',
        isConfirm: true
    });
    if (result !== null && result !== false) {
        try {
            const res = await fetch(`/api/okrs/${krId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_value: parseFloat(result) || 0 })
            });
            if (res.ok) { showToast('Progreso actualizado', 'success'); loadOKRs(); }
        } catch (_) { showToast('Error', 'error'); }
    }
}

async function deleteOKR(id) {
    const confirmed = await showCustomModal({ title: 'Eliminar?', message: 'Esta accion no se puede deshacer.', isConfirm: true });
    if (confirmed) {
        try {
            await fetch(`/api/okrs/${id}`, { method: 'DELETE' });
            showToast('Eliminado', 'success');
            loadOKRs();
        } catch (_) { showToast('Error', 'error'); }
    }
}

async function linkOKR(okrId) {
    const result = await showCustomModal({
        title: 'Vincular a Proyecto/Area',
        html: true,
        isConfirm: true,
        message: `
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div><label style="font-weight:600;">Tipo</label>
                <select id="linkType" style="width:100%;padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);">
                    <option value="project">Proyecto</option>
                    <option value="area">Area</option>
                </select></div>
                <div><label style="font-weight:600;">ID</label>
                <input id="linkId" type="text" style="width:100%;padding:8px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);" placeholder="ID del proyecto o area"></div>
            </div>`
    });
    if (result === true) {
        try {
            await fetch(`/api/okrs/${okrId}/links`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    link_type: document.getElementById('linkType')?.value,
                    link_id: document.getElementById('linkId')?.value
                })
            });
            showToast('Vinculado', 'success');
            loadOKRs();
        } catch (_) { showToast('Error', 'error'); }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEXT ACTIONS (enhanced panel in GTD Board)
// ═══════════════════════════════════════════════════════════════════════════════

function initNextActions() {}

async function loadNextActionsPanel() {
    try {
        const res = await fetch('/api/next-actions');
        if (!res.ok) return;
        const actions = await res.json();

        // Inject a "Next Actions Summary" strip at top of GTD board
        const toolbar = document.querySelector('.gtd-board-toolbar');
        if (!toolbar) return;

        let strip = document.getElementById('nextActionsSummary');
        if (!strip) {
            strip = document.createElement('div');
            strip.id = 'nextActionsSummary';
            strip.className = 'next-actions-strip';
            toolbar.parentNode.insertBefore(strip, toolbar.nextSibling);
        }

        if (!actions.length) {
            strip.innerHTML = '<p style="color:var(--text-muted);padding:12px;">No hay proximas acciones marcadas.</p>';
            return;
        }

        strip.innerHTML = `
            <h3 style="margin:0 0 12px 0;font-size:0.95rem;">⚡ Proximas Acciones (${actions.length})</h3>
            <div class="next-actions-grid">
                ${actions.map(a => {
                    const pri = a.priority === 'alta' ? '🔴' : a.priority === 'media' ? '🟡' : '🟢';
                    const proj = a.project_name ? `<span class="na-project">← ${escapeHtml(a.project_name)}</span>` : '';
                    const person = a.assigned_to ? `<span class="na-person">👤 ${escapeHtml(a.assigned_to)}</span>` : '';
                    const deadline = a.fecha_limite ? `<span class="na-deadline">📅 ${a.fecha_limite}</span>` : '';
                    return `
                        <div class="next-action-card" draggable="true" data-id="${a.id}"
                             ondragstart="onDragStart(event, ${a.id})"
                             ondragend="onDragEnd(event)">
                            <div class="na-header">${pri} ${escapeHtml(a.text || '(sin texto)')}</div>
                            <div class="na-meta">${proj} ${person} ${deadline}</div>
                            <button class="na-complete-btn" onclick="completeNextAction(${a.id})">✅ Completar</button>
                        </div>`;
                }).join('')}
            </div>`;
    } catch (err) {
        console.error('Next actions error:', err);
    }
}

async function completeNextAction(id) {
    try {
        const res = await fetch(`/api/next-actions/${id}/complete`, { method: 'PUT' });
        if (res.ok) {
            showToast('Accion completada — siguiente accion promovida', 'success');
            loadNextActionsPanel();
            loadGtdBoard(document.querySelector('.skill-filter-chip.active')?.textContent?.includes('Contexto') ? 'context' : 'context');
        } else {
            showToast('Error al completar', 'error');
        }
    } catch (_) { showToast('Error de conexion', 'error'); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEETING → TASKS
// ═══════════════════════════════════════════════════════════════════════════════

async function generateTasksFromMeeting(reunionId) {
    const btn = document.getElementById(`btnGenTasks_${reunionId}`);
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Generando...'; }

    try {
        const res = await fetch(`/api/reuniones/${reunionId}/generate-tasks`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            showToast(`${data.created} tareas creadas en el Inbox`, 'success');
            if (btn) btn.textContent = `✅ ${data.created} tareas creadas`;
            updateInboxBadge();
        } else if (res.status === 409) {
            showToast(data.error || 'Las tareas ya fueron generadas', 'warning');
            if (btn) { btn.disabled = true; btn.textContent = `⚠️ Ya generadas (${data.already_created})`; }
        } else {
            showToast(data.error || 'Error al generar', 'error');
            if (btn) { btn.disabled = false; btn.textContent = '📥 Generar Tareas al Inbox'; }
        }
    } catch (err) {
        showToast('Error de conexion', 'error');
        if (btn) { btn.disabled = false; btn.textContent = '📥 Generar Tareas al Inbox'; }
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// KANBAN DRAG & DROP
// ═══════════════════════════════════════════════════════════════════════════════

let _draggedId = null;

function onDragStart(event, id) {
    _draggedId = id;
    event.dataTransfer.effectAllowed = 'move';
    event.target.classList.add('dragging');
}

function onDragEnd(event) {
    _draggedId = null;
    event.target.classList.remove('dragging');
}

function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('drag-over');
}

function onDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

async function onDrop(event, newValue, field) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    if (!_draggedId) return;

    try {
        const body = {};
        body[field] = newValue;
        const res = await fetch(`/api/ideas/${_draggedId}/gtd`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (res.ok) {
            showToast('Tarea movida', 'success');
            const activeView = document.querySelector('.skill-filter-chip.active');
            const viewType = activeView?.id?.replace('gtdView', '').toLowerCase() || 'context';
            loadGtdBoard(viewType === 'compromiso' ? 'compromiso' : viewType);
        }
    } catch (_) { showToast('Error al mover', 'error'); }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REUSABLE MICROPHONE BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

function attachMicButton(targetInput, buttonContainer) {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mic-inline-btn';
    btn.title = 'Hablar para escribir';
    btn.innerHTML = '🎤';
    let active = false;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'es-ES';
    rec.interimResults = false;

    rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        if (targetInput.tagName === 'INPUT' || targetInput.tagName === 'TEXTAREA') {
            targetInput.value += (targetInput.value ? ' ' : '') + text;
        }
        targetInput.focus();
    };
    rec.onstart = () => { active = true; btn.classList.add('recording'); };
    rec.onend = () => { active = false; btn.classList.remove('recording'); };
    rec.onerror = () => { active = false; btn.classList.remove('recording'); };

    btn.addEventListener('click', () => {
        if (active) rec.stop(); else rec.start();
    });

    (buttonContainer || targetInput.parentNode).appendChild(btn);
}

// Attach mic buttons to project description and waiting-for description
function initMicButtons() {
    const projDesc = document.getElementById('projDesc');
    if (projDesc) attachMicButton(projDesc);

    const waitingDesc = document.getElementById('waitingDescription');
    if (waitingDesc) attachMicButton(waitingDesc);
}

// Call after DOM is ready
document.addEventListener('DOMContentLoaded', () => { setTimeout(initMicButtons, 500); });

// ═══════════════════════════════════════════════════════════════════════════════
// DAILY BRIEFING PER USER
// ═══════════════════════════════════════════════════════════════════════════════

async function loadUserBriefing(username) {
    try {
        const res = await fetch(`/api/gtd/briefing/${username}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();

        const content = document.getElementById('dailyReportContent');
        if (content) {
            content.innerHTML = `<div class="markdown-content">${data.briefing.replace(/\n/g, '<br>').replace(/### (.*)/g, '<h3>$1</h3>').replace(/## (.*)/g, '<h2>$1</h2>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/_(.*?)_/g, '<em>$1</em>')}</div>`;
        }
        const stats = document.getElementById('dailyReportStats');
        if (stats && data.stats) {
            stats.innerHTML = `
                <div class="gtd-stat-chip">📋 ${data.stats.total} tareas</div>
                <div class="gtd-stat-chip">⚡ ${data.stats.next_actions} proximas</div>
                <div class="gtd-stat-chip">⚠️ ${data.stats.overdue} vencidas</div>
                <div class="gtd-stat-chip">⏳ ${data.stats.waiting} esperando</div>`;
        }
    } catch (err) {
        showToast('Error al cargar briefing', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERRAMIENTAS CONTRATADAS (Admin — Tools/Subscriptions)
// ═══════════════════════════════════════════════════════════════════════════════

const HERR_CATEGORIAS_COLORS = {
    Productividad: '#3498db', Infraestructura: '#e67e22', Comunicaciones: '#2ecc71',
    Desarrollo: '#9b59b6', 'Diseño': '#e91e63', Operaciones: '#00bcd4',
    RRHH: '#ff9800', Seguridad: '#f44336', Otro: '#607d8b'
};

async function loadHerramientas() {
    try {
        const [resHerr, resStats] = await Promise.all([
            fetch('/api/herramientas'),
            fetch('/api/herramientas/resumen')
        ]);
        const { herramientas } = await resHerr.json();
        const stats = await resStats.json();

        // Stats
        const statsEl = document.getElementById('herrStats');
        if (statsEl) {
            const proxRen = stats.proxima_renovacion
                ? `${stats.proxima_renovacion.nombre} (${new Date(stats.proxima_renovacion.fecha_renovacion).toLocaleDateString('es-ES')})`
                : 'N/A';
            statsEl.innerHTML = `
                <div class="herr-stat"><div class="herr-stat-val">${stats.total_activas}</div><div class="herr-stat-label">HERRAMIENTAS ACTIVAS</div></div>
                <div class="herr-stat"><div class="herr-stat-val">$${stats.total_mensual.toLocaleString()}</div><div class="herr-stat-label">COSTO MENSUAL</div></div>
                <div class="herr-stat"><div class="herr-stat-val">$${stats.total_anual.toLocaleString()}</div><div class="herr-stat-label">COSTO ANUAL</div></div>
                <div class="herr-stat"><div class="herr-stat-val herr-stat-small">${proxRen}</div><div class="herr-stat-label">PROXIMA RENOVACION</div></div>
            `;
        }

        // Table
        const tbody = document.getElementById('herrTableBody');
        if (!tbody) return;
        if (!herramientas || herramientas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:2rem;color:var(--text-muted);">No hay suscripciones registradas. Agrega la primera.</td></tr>';
            return;
        }
        tbody.innerHTML = herramientas.map(h => {
            const catColor = HERR_CATEGORIAS_COLORS[h.categoria] || '#607d8b';
            const estadoBadge = h.estado === 'activo'
                ? '<span class="herr-badge herr-activo">Activo</span>'
                : h.estado === 'cancelado'
                    ? '<span class="herr-badge herr-cancelado">Cancelado</span>'
                    : '<span class="herr-badge herr-inactivo">Inactivo</span>';
            const renovacion = h.fecha_renovacion
                ? new Date(h.fecha_renovacion).toLocaleDateString('es-ES')
                : '-';
            const costoLabel = `$${(h.costo_mensual || 0).toLocaleString()} ${h.moneda || 'USD'}/${h.frecuencia === 'anual' ? 'año' : 'mes'}`;
            const duracion = h.duracion_contrato || '-';
            let vencimiento = '-';
            if (h.fecha_vencimiento) {
                const vDate = new Date(h.fecha_vencimiento);
                const hoy = new Date();
                const diasRestantes = Math.ceil((vDate - hoy) / (1000 * 60 * 60 * 24));
                vencimiento = vDate.toLocaleDateString('es-ES');
                if (diasRestantes < 0) {
                    vencimiento = `<span style="color:#ef4444;font-weight:600">${vencimiento} (Vencido)</span>`;
                } else if (diasRestantes <= 30) {
                    vencimiento = `<span style="color:#f59e0b;font-weight:600">${vencimiento} (${diasRestantes}d)</span>`;
                }
            }
            return `<tr class="${h.estado !== 'activo' ? 'herr-row-inactive' : ''}">
                <td><strong>${escapeHtml(h.nombre)}</strong></td>
                <td>${escapeHtml(h.proveedor || '-')}</td>
                <td><span class="herr-cat-badge" style="background:${catColor}20;color:${catColor};border:1px solid ${catColor}40">${escapeHtml(h.categoria)}</span></td>
                <td>${costoLabel}</td>
                <td style="text-align:center">${h.num_licencias || 1}</td>
                <td>${escapeHtml(duracion)}</td>
                <td>${vencimiento}</td>
                <td>${renovacion}</td>
                <td>${estadoBadge}</td>
                <td>
                    <button class="herr-btn-edit" onclick="openHerramientaModal(${h.id})" title="Editar">✏️</button>
                    <button class="herr-btn-del" onclick="deleteHerramienta(${h.id}, '${escapeHtml(h.nombre).replace(/'/g, "\\'")}')" title="Eliminar">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    } catch (err) {
        console.error('Load herramientas error:', err);
    }
}

let _herrCache = [];
async function openHerramientaModal(id) {
    const modal = document.getElementById('herrModal');
    const title = document.getElementById('herrModalTitle');
    if (!modal) return;

    // Reset form
    document.getElementById('herrForm').reset();
    document.getElementById('herrId').value = '';
    document.getElementById('herrEstado').value = 'activo';

    if (id) {
        title.textContent = 'Editar Suscripción';
        try {
            const res = await fetch('/api/herramientas');
            const { herramientas } = await res.json();
            const h = herramientas.find(x => x.id === id);
            if (h) {
                document.getElementById('herrId').value = h.id;
                document.getElementById('herrNombre').value = h.nombre || '';
                document.getElementById('herrProveedor').value = h.proveedor || '';
                document.getElementById('herrCategoria').value = h.categoria || 'General';
                document.getElementById('herrCosto').value = h.costo_mensual || 0;
                document.getElementById('herrFrecuencia').value = h.frecuencia || 'mensual';
                document.getElementById('herrMoneda').value = h.moneda || 'USD';
                document.getElementById('herrLicencias').value = h.num_licencias || 1;
                document.getElementById('herrFechaInicio').value = h.fecha_inicio || '';
                document.getElementById('herrFechaRenovacion').value = h.fecha_renovacion || '';
                document.getElementById('herrDuracion').value = h.duracion_contrato || '';
                document.getElementById('herrFechaVencimiento').value = h.fecha_vencimiento || '';
                document.getElementById('herrEstado').value = h.estado || 'activo';
                document.getElementById('herrNotas').value = h.notas || '';
            }
        } catch (err) { console.error(err); }
    } else {
        title.textContent = 'Agregar Suscripción';
    }
    modal.style.display = 'flex';
}

function closeHerramientaModal() {
    const modal = document.getElementById('herrModal');
    if (modal) modal.style.display = 'none';
}

async function saveHerramienta(e) {
    e.preventDefault();
    const id = document.getElementById('herrId').value;
    const body = {
        nombre: document.getElementById('herrNombre').value.trim(),
        proveedor: document.getElementById('herrProveedor').value.trim(),
        categoria: document.getElementById('herrCategoria').value,
        costo_mensual: parseFloat(document.getElementById('herrCosto').value) || 0,
        frecuencia: document.getElementById('herrFrecuencia').value,
        moneda: document.getElementById('herrMoneda').value,
        num_licencias: parseInt(document.getElementById('herrLicencias').value) || 1,
        fecha_inicio: document.getElementById('herrFechaInicio').value || null,
        fecha_renovacion: document.getElementById('herrFechaRenovacion').value || null,
        duracion_contrato: document.getElementById('herrDuracion').value || null,
        fecha_vencimiento: document.getElementById('herrFechaVencimiento').value || null,
        estado: document.getElementById('herrEstado').value,
        notas: document.getElementById('herrNotas').value.trim()
    };

    if (!body.nombre) { showToast('Nombre es requerido', 'error'); return; }

    try {
        const url = id ? `/api/herramientas/${id}` : '/api/herramientas';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success || data.id) {
            showToast(id ? 'Suscripción actualizada' : 'Suscripción agregada', 'success');
            closeHerramientaModal();
            loadHerramientas();
        } else {
            showToast(data.error || 'Error al guardar', 'error');
        }
    } catch (err) {
        showToast('Error al guardar suscripción', 'error');
    }
}

async function deleteHerramienta(id, nombre) {
    if (!confirm(`Eliminar "${nombre}"? Esta accion no se puede deshacer.`)) return;
    try {
        const res = await fetch(`/api/herramientas/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            showToast('Suscripción eliminada', 'success');
            loadHerramientas();
        } else {
            showToast(data.error || 'Error al eliminar', 'error');
        }
    } catch (err) {
        showToast('Error al eliminar suscripción', 'error');
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// VERSION CHECK — Detect server restarts and prompt user to reload
// ═══════════════════════════════════════════════════════════════════════════

function initVersionCheck() {
    let knownBuild = null;

    async function checkVersion() {
        try {
            const res = await fetch('/health', { signal: AbortSignal.timeout(5000) });
            if (!res.ok) return;
            const data = await res.json();
            if (!data.build) return;

            if (knownBuild === null) {
                knownBuild = data.build;
                return;
            }

            if (data.build !== knownBuild) {
                showUpdateBanner();
            }
        } catch (_) { /* offline or timeout — skip */ }
    }

    // Check every 30 seconds
    checkVersion();
    setInterval(checkVersion, 30000);
}

// ═══════════════════════════════════════════════════════════════════════════
// INACTIVITY LOGOUT — Auto-logout after 10 minutes of no activity
// ═══════════════════════════════════════════════════════════════════════════

function initInactivityLogout() {
    const IDLE_LIMIT = 10 * 60 * 1000;   // 10 minutes
    const WARNING_AT = 9 * 60 * 1000;    // show warning at 9 minutes
    let idleTimer = null;
    let warningTimer = null;
    let warningShown = false;

    function resetIdle() {
        clearTimeout(idleTimer);
        clearTimeout(warningTimer);
        if (warningShown) {
            const banner = document.getElementById('idleWarningBanner');
            if (banner) banner.remove();
            warningShown = false;
        }
        warningTimer = setTimeout(showIdleWarning, WARNING_AT);
        idleTimer = setTimeout(doLogout, IDLE_LIMIT);
    }

    function showIdleWarning() {
        if (document.getElementById('idleWarningBanner')) return;
        warningShown = true;
        const banner = document.createElement('div');
        banner.id = 'idleWarningBanner';
        banner.innerHTML = `
            <div class="idle-warning-banner">
                <span>⏰ Tu sesión se cerrará en 1 minuto por inactividad</span>
                <button onclick="document.getElementById('idleWarningBanner').remove()">Seguir trabajando</button>
            </div>
        `;
        document.body.prepend(banner);
    }

    function doLogout() {
        window.location.href = '/logout';
    }

    ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
        document.addEventListener(evt, resetIdle, { passive: true });
    });

    resetIdle();
}

function showUpdateBanner() {
    if (document.getElementById('updatePopup')) return;

    const overlay = document.createElement('div');
    overlay.id = 'updatePopup';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:100000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);animation:upFadeIn .3s ease-out;';
    overlay.innerHTML = `
        <div style="background:var(--bg-panel,#1e2030);border:1px solid var(--border,#2e3150);border-radius:16px;padding:32px 36px;max-width:420px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:upScaleIn .3s ease-out;">
            <div style="font-size:3rem;margin-bottom:12px;">🚀</div>
            <h3 style="margin:0 0 8px;font-size:1.3rem;color:var(--text-primary,#fff);">Nueva versión disponible</h3>
            <p style="margin:0 0 24px;color:var(--text-muted,#8b8fa3);font-size:0.9rem;line-height:1.5;">Se ha actualizado la plataforma con mejoras y correcciones. Recarga para obtener la última versión.</p>
            <div style="display:flex;gap:12px;justify-content:center;">
                <button onclick="location.reload()" style="background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;border:none;padding:10px 28px;border-radius:10px;font-size:0.95rem;font-weight:600;cursor:pointer;transition:transform .15s,box-shadow .15s;">Recargar ahora</button>
                <button onclick="document.getElementById('updatePopup').remove()" style="background:rgba(255,255,255,0.08);color:var(--text-muted,#8b8fa3);border:1px solid var(--border,#2e3150);padding:10px 20px;border-radius:10px;font-size:0.9rem;cursor:pointer;transition:background .15s;">Más tarde</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Re-show every 5 minutes if dismissed
    overlay.querySelector('button:last-child').addEventListener('click', () => {
        setTimeout(showUpdateBanner, 5 * 60 * 1000);
    });
}

// ─── Admin File Manager ─────────────────────────────────────────────────────

let _afCurrentTab = 'active';
let _afAllFiles = [];
let _afTrashFiles = [];

function switchAdminFilesTab(tab) {
    _afCurrentTab = tab;
    document.getElementById('afTabActive').className = tab === 'active' ? 'filter-chip active' : 'filter-chip';
    document.getElementById('afTabTrash').className = tab === 'trash' ? 'filter-chip active' : 'filter-chip';
    document.getElementById('afActivePanel').style.display = tab === 'active' ? '' : 'none';
    document.getElementById('afTrashPanel').style.display = tab === 'trash' ? '' : 'none';
    const searchWrap = document.getElementById('afSearchWrap');
    if (searchWrap) searchWrap.style.display = tab === 'active' ? '' : 'none';
    if (tab === 'active') loadAdminFilesActive();
    else loadAdminFilesTrash();
}

function loadAdminFiles() {
    loadAdminFilesActive();
    // Preload trash count for tab badge
    fetch('/api/admin/files/trash').then(r => r.json()).then(files => {
        _afTrashFiles = files;
        _afUpdateTrashCount(files.length);
    }).catch(() => {});
}

function _afUpdateSummary(files) {
    const el = id => document.getElementById(id);
    el('afStatTotal').textContent = files.length;
    const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    el('afStatSize').textContent = _afFormatBytes(totalBytes);
    const dynCount = files.filter(f => f.hasDynamic).length;
    el('afStatDynamic').textContent = dynCount;
    const countEl = document.getElementById('afTabActiveCount');
    if (countEl) countEl.textContent = files.length;
}

function _afUpdateTrashCount(count) {
    const el = document.getElementById('afStatTrash');
    if (el) el.textContent = count;
    const countEl = document.getElementById('afTabTrashCount');
    if (countEl) countEl.textContent = count || '';
}

function _afFormatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function filterAdminFiles() {
    const q = (document.getElementById('afSearchInput')?.value || '').toLowerCase();
    const filtered = q ? _afAllFiles.filter(f => f.name.toLowerCase().includes(q)) : _afAllFiles;
    renderAdminFilesActive(filtered);
}

function _afFileIcon(ext) {
    const map = { '.pdf': '📕', '.md': '📘', '.docx': '📓', '.txt': '📝', '.app': '⚡' };
    return map[ext] || '📄';
}

function _afExtBadge(ext) {
    const map = {
        '.pdf': ['rgba(239,68,68,0.15)', '#ef4444', 'PDF'],
        '.md': ['rgba(59,130,246,0.15)', '#3b82f6', 'MD'],
        '.docx': ['rgba(139,92,246,0.15)', '#8b5cf6', 'DOCX'],
        '.txt': ['rgba(245,158,11,0.15)', '#f59e0b', 'TXT'],
        '.app': ['rgba(34,197,94,0.15)', '#22c55e', 'APP']
    };
    const m = map[ext];
    if (m) return `<span class="af-type-badge" style="background:${m[0]};color:${m[1]};">${m[2]}</span>`;
    return `<span class="af-type-badge" style="background:rgba(255,255,255,0.06);color:var(--text-muted);">${escapeHtml(ext)}</span>`;
}

function renderAdminFilesActive(files) {
    const tbody = document.getElementById('afActiveTbody');
    if (!tbody) return;

    if (files.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">Sin archivos</td></tr>';
        return;
    }

    tbody.innerHTML = files.map(f => {
        const date = f.modified ? new Date(f.modified).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
        const encoded = encodeURIComponent(f.name);
        const safeName = escapeHtml(f.name).replace(/'/g, "\\'");
        const uploaderTip = f.uploadedBy ? `\nSubido por: ${f.uploadedBy}` : '';
        let actions = '';

        if (f.type === 'app' && f.dynamicUrl) {
            actions += `<a href="${f.dynamicUrl}" target="_blank" class="af-icon-btn af-view" title="Abrir">▶</a>`;
        } else if (f.extension !== '.app') {
            actions += `<a href="/archivo/${encoded}" target="_blank" class="af-icon-btn af-view" title="Ver">👁</a>`;
        }

        if (f.hasDynamic && f.dynamicUrl && f.type !== 'app') {
            actions += `<a href="${f.dynamicUrl}" target="_blank" class="af-icon-btn af-dynamic" title="Pagina dinamica">⚡</a>`;
        }

        if (f.extension !== '.app') {
            actions += `<a href="/descargar/${encoded}" class="af-icon-btn af-download" title="Descargar">⬇</a>`;
            actions += `<button onclick="adminDeleteFile('${safeName}')" class="af-icon-btn af-delete" title="Eliminar">🗑</button>`;
        }

        return `<tr class="au-row">
            <td><div class="af-file-name"><span class="af-file-icon">${_afFileIcon(f.extension)}</span><span class="af-file-text" title="${escapeHtml(f.name)}${uploaderTip}">${escapeHtml(f.name)}</span></div></td>
            <td>${_afExtBadge(f.extension)}</td>
            <td style="font-size:0.82rem;white-space:nowrap;">${escapeHtml(f.sizeFormatted)}</td>
            <td style="font-size:0.82rem;white-space:nowrap;">${date}</td>
            <td><div class="af-actions-cell">${actions}</div></td>
        </tr>`;
    }).join('');
}

async function loadAdminFilesActive() {
    const tbody = document.getElementById('afActiveTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;"><div class="spinner-sm"></div></td></tr>';
    try {
        const res = await fetch('/api/archivos');
        if (!res.ok) throw new Error('Failed');
        _afAllFiles = await res.json();
        _afUpdateSummary(_afAllFiles);
        renderAdminFilesActive(_afAllFiles);
    } catch (err) {
        console.error('Admin files load error:', err);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">Error al cargar archivos</td></tr>';
    }
}

async function adminDeleteFile(filename) {
    if (!confirm(`Mover "${filename}" a la papelera?`)) return;
    try {
        const res = await fetch(`/api/archivo/${encodeURIComponent(filename)}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Archivo movido a papelera', 'success');
            loadAdminFiles();
        } else {
            const data = await res.json();
            showToast(data.error || 'Error al eliminar', 'error');
        }
    } catch (err) {
        showToast('Error al eliminar archivo', 'error');
    }
}

async function loadAdminFilesTrash() {
    const tbody = document.getElementById('afTrashTbody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;"><div class="spinner-sm"></div></td></tr>';
    try {
        const res = await fetch('/api/admin/files/trash');
        if (!res.ok) throw new Error('Failed');
        const files = await res.json();
        _afTrashFiles = files;
        _afUpdateTrashCount(files.length);
        if (files.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">🗑️ Papelera vacia</td></tr>';
            return;
        }
        tbody.innerHTML = files.map(f => {
            const ext = '.' + (f.originalName.split('.').pop() || '').toLowerCase();
            const date = new Date(f.deletedAt).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            const safeName = escapeHtml(f.trashName).replace(/'/g, "\\'");
            return `<tr class="au-row">
                <td><div class="af-file-name"><span class="af-file-icon">${_afFileIcon(ext)}</span><span class="af-file-text" title="${escapeHtml(f.originalName)}">${escapeHtml(f.originalName)}</span></div></td>
                <td>${_afExtBadge(ext)}</td>
                <td style="font-size:0.82rem;white-space:nowrap;">${escapeHtml(f.sizeFormatted)}</td>
                <td style="font-size:0.82rem;white-space:nowrap;">${date}</td>
                <td><div class="af-actions-cell">
                    <button onclick="restoreTrashFile('${safeName}')" class="af-icon-btn af-restore" title="Restaurar">↩</button>
                    <button onclick="deleteTrashFile('${safeName}')" class="af-icon-btn af-delete" title="Eliminar permanentemente">🗑</button>
                </div></td>
            </tr>`;
        }).join('');
    } catch (err) {
        console.error('Trash load error:', err);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted);">Error al cargar papelera</td></tr>';
    }
}

async function restoreTrashFile(trashName) {
    if (!confirm('Restaurar este archivo?')) return;
    try {
        const res = await fetch('/api/admin/files/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trashName })
        });
        const data = await res.json();
        if (res.ok) {
            showToast('Archivo restaurado: ' + data.filename, 'success');
            loadAdminFiles();
            switchAdminFilesTab('active');
        } else {
            showToast(data.error || 'Error al restaurar', 'error');
        }
    } catch (err) {
        showToast('Error al restaurar archivo', 'error');
    }
}

async function deleteTrashFile(trashName) {
    if (!confirm('Eliminar PERMANENTEMENTE este archivo?\nEsta accion NO se puede deshacer.')) return;
    try {
        const res = await fetch(`/api/admin/files/trash/${encodeURIComponent(trashName)}`, { method: 'DELETE' });
        if (res.ok) {
            showToast('Archivo eliminado permanentemente', 'success');
            loadAdminFilesTrash();
        } else {
            const data = await res.json();
            showToast(data.error || 'Error', 'error');
        }
    } catch (err) {
        showToast('Error al eliminar', 'error');
    }
}

window.switchAdminFilesTab = switchAdminFilesTab;
window.filterAdminFiles = filterAdminFiles;
window.adminDeleteFile = adminDeleteFile;
window.restoreTrashFile = restoreTrashFile;
window.deleteTrashFile = deleteTrashFile;

