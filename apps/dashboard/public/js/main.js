/* ═══════════════════════════════════════════════════════════════════════════
   VALUE STRATEGY CONSULTING HUB v2.1 — Dashboard Logic
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileSidebar();
    initDate();
    initHomeGreeting();
    initArchivos();
    initPanelActions();
    initIdeas();
    initUpload();
    initProjects();
    initHomeData();
    initThemeToggle();
    initAgents();
    initChat();
    initAreas();
    initWaitingFor();
    initOverviewStats();
    initDigest();
    loadInboxLog();
    initReportability();
    initQuickCapture();
    initGlobalSearch();
    initNotifications();
    initAnalytics();
    initExportImport();
    initVoiceCommands();
});

// ─── Section titles mapping ────────────────────────────────────────────────────
const SECTION_META = {
    home: { title: 'Bienvenido', subtitle: 'Hub Interno de Operaciones' },
    overview: { title: 'Dashboard CODE/PARA', subtitle: 'Pipeline de trabajo y distribución organizativa' },
    projects: { title: 'Proyectos', subtitle: 'Iniciativas con deadline — PARA: Projects' },
    areas: { title: 'Áreas de Responsabilidad', subtitle: 'Responsabilidades continuas — PARA: Areas (Horizonte H2)' },
    archivos: { title: 'Recursos & Documentación', subtitle: 'Material de referencia — PARA: Resources' },
    methodologies: { title: 'Metodologías de Trabajo', subtitle: 'CODE + PARA + GTD — Frameworks operativos' },
    ideas: { title: 'Captura — CODE', subtitle: 'Captura ideas sin filtrar → Organizar → Destilar → Expresar' },
    skills: { title: 'Biblioteca de Habilidades', subtitle: 'Conocimiento estático y procedimientos (SOPs)' },
    context: { title: 'Memoria PARA', subtitle: 'Gestión del conocimiento organizado por Proyectos, Áreas, Recursos y Archivo' },
    waiting: { title: 'A la Espera', subtitle: 'Delegaciones y seguimiento — GTD: Waiting For' },
    reportability: { title: 'Reportabilidad', subtitle: 'Checklist diario y actividad por consultor — Dashboard del equipo' },
    analytics: { title: 'Analytics', subtitle: 'Tendencias, graficos y metricas del equipo — Data-driven decisions' }
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
    const hash = window.location.hash.replace('#', '');
    if (hash && SECTION_META[hash]) switchSection(hash);
}

function switchSection(sectionId) {
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
    history.replaceState(null, '', '#' + sectionId);

    // Lazy-load analytics charts when section is first visible
    if (sectionId === 'analytics') loadAnalytics();
}

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

// ─── Home Data (stats + projects + docs) ───────────────────────────────────────
async function initHomeData() {
    try {
        const [archRes, ideasRes, projRes] = await Promise.all([
            fetch('/api/archivos'), fetch('/api/ideas'), fetch('/api/projects')
        ]);
        const archivos = await archRes.json();
        const ideasData = await ideasRes.json();
        const projects = await projRes.json();

        // Handle paginated or raw response
        const ideasCount = ideasData.pagination ? ideasData.pagination.total : (Array.isArray(ideasData) ? ideasData.length : 0);

        // Update stats
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('homeStatDocs', archivos.length);
        set('homeStatIdeas', ideasCount);
        set('homeStatProjects', projects.length);
        set('statProjects', projects.length);
    } catch (err) {
        console.error('Home data error:', err);
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

                showAgentResult('📅 Plan Semanal', renderMarkdown(data.response));
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
        // Simple MD rendering or just HTML injection
        contentEl.innerHTML = contentHtml;
        modal.style.display = 'flex';
    }
}

function renderMarkdown(text) {
    if (!text) return '';
    // Basic Markdown parser for the agent response
    return text
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
        .replace(/\*(.*)\*/gim, '<i>$1</i>')
        .replace(/^\s*\*\s(.*?)$/gim, '<li>$1</li>') // List items
        .replace(/<\/li>\n<li>/gim, '</li><li>')     // Fix lines
        .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')  // Wrap in ul (naive)
        .replace(/\n/gim, '<br>');
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
// PROJECTS (dynamic, with filters)
// ═══════════════════════════════════════════════════════════════════════════════
let allProjects = [];

async function initProjects() {
    const toggleBtn = document.getElementById('toggleAddProject');
    const addBody = document.getElementById('addProjectBody');
    const addForm = document.getElementById('addProjectForm');
    const searchInput = document.getElementById('projectSearch');

    // Toggle panel
    if (toggleBtn && addBody) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = addBody.style.display === 'none';
            addBody.style.display = isHidden ? 'block' : 'none';
            toggleBtn.textContent = isHidden ? 'Ocultar ↑' : 'Mostrar ↓';
        });
    }

    // Submit new project
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const techRaw = document.getElementById('projTech')?.value || '';
            const project = {
                name: document.getElementById('projName').value,
                url: document.getElementById('projUrl').value,
                description: document.getElementById('projDesc')?.value || '',
                icon: document.getElementById('projIcon')?.value || '📦',
                status: document.getElementById('projStatus')?.value || 'active',
                tech: techRaw.split(',').map(t => t.trim()).filter(t => t)
            };

            try {
                const res = await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(project)
                });
                if (res.ok) {
                    addForm.reset();
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
        renderProjects(allProjects);
    } catch (err) {
        console.error('Load projects error:', err);
    }
}

function filterAndRenderProjects() {
    const query = (document.getElementById('projectSearch')?.value || '').toLowerCase().trim();
    const activeFilter = document.querySelector('[data-pfilter].active')?.dataset.pfilter || 'all';

    let filtered = allProjects;
    if (query) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query) ||
            (p.description || '').toLowerCase().includes(query) ||
            (p.tech || []).some(t => t.toLowerCase().includes(query))
        );
    }
    if (activeFilter !== 'all') {
        filtered = filtered.filter(p => p.status === activeFilter);
    }
    renderProjects(filtered);
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

function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    if (projects.length === 0) {
        grid.innerHTML = `<div class="archivos-empty"><div class="empty-icon">🚀</div><p>No se encontraron proyectos</p></div>`;
        return;
    }

    grid.innerHTML = projects.map(p => {
        const st = STATUS_MAP[p.status] || STATUS_MAP.active;
        const techHtml = (p.tech || []).map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join('');
        return `
            <div class="project-card">
                <div class="project-card-top">
                    <div class="project-icon-lg">${p.icon || '📦'}</div>
                    <span class="badge ${st.cls}">${st.label}</span>
                </div>
                <h3>${escapeHtml(p.name)}</h3>
                <p>${escapeHtml(p.description || 'Sin descripción')}</p>
                <div class="project-tech">${techHtml || '<span class="tech-tag dim">—</span>'}</div>
                <div class="project-footer">
                    <a href="${escapeHtml(p.url)}" target="_blank" class="btn btn-sm">Abrir ↗</a>
                    <button class="project-delete-btn" onclick="deleteProject('${p.id}')" title="Eliminar proyecto">🗑</button>
                </div>
            </div>
        `;
    }).join('');
}

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
    const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
    const statEl = document.getElementById('statArchivos');

    try {
        const response = await fetch('/api/archivos');
        allArchivos = await response.json();
        if (statEl) statEl.textContent = allArchivos.length;

        renderArchivos(allArchivos);
        renderTagFilterBar(allArchivos);

        if (searchInput) searchInput.addEventListener('input', () => filterAndRender());
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
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
    const type = document.querySelector('.filter-btn[data-filter].active')?.dataset.filter || 'all';
    let filtered = allArchivos;
    if (query) {
        filtered = filtered.filter(f =>
            f.name.toLowerCase().includes(query) || f.basename.toLowerCase().includes(query) ||
            (f.tags || []).some(t => t.toLowerCase().includes(query))
        );
    }
    if (type !== 'all') filtered = filtered.filter(f => f.type === type);
    if (activeTagFilter) filtered = filtered.filter(f => (f.tags || []).includes(activeTagFilter));
    renderArchivos(filtered);
}

function renderArchivos(files) {
    const grid = document.getElementById('archivosGrid');
    if (!grid) return;
    if (files.length === 0) {
        grid.innerHTML = `<div class="archivos-empty"><div class="empty-icon">📂</div><p>No se encontraron documentos</p></div>`;
        return;
    }
    grid.innerHTML = files.map(file => {
        const icon = file.type === 'markdown' ? '📝' : file.type === 'pdf' ? '📕' : file.type === 'app' ? '🚀' : '📄';
        const typeLabel = file.extension.replace('.', '').toUpperCase();
        const href = file.hasDynamic ? file.dynamicUrl : `/archivo/${encodeURIComponent(file.name)}`;
        const dynamicBadge = file.hasDynamic ? `<span class="archivo-dynamic-badge">✨ Interactivo</span>` : '';
        const downloadBtn = file.type === 'pdf' ? `<a href="/descargar/${encodeURIComponent(file.name)}" class="archivo-download" title="Descargar" onclick="event.stopPropagation();">⬇</a>` : '';
        const tagsHtml = (file.tags || []).length > 0 ? `<div class="archivo-tags">${file.tags.map(t => `<span class="archivo-tag">#${escapeHtml(t)}</span>`).join('')}</div>` : '';
        const iconClass = file.type === 'markdown' ? 'md' : file.type === 'pdf' ? 'pdf' : file.type === 'app' ? 'app' : '';

        return `
            <a href="${href}" class="archivo-card" title="${file.name}" ${file.hasDynamic ? 'target="_blank"' : ''}>
                <div class="archivo-icon ${iconClass}">${icon}</div>
                <div class="archivo-info">
                    <h4>${escapeHtml(file.basename)} ${dynamicBadge}</h4>
                    <div class="archivo-meta"><span>${typeLabel}</span><span>•</span><span>${file.sizeFormatted}</span></div>
                    ${tagsHtml}
                </div>
                ${downloadBtn}
                <span class="archivo-arrow">→</span>
            </a>
        `;
    }).join('');
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
                const err = await res.json();
                alert('Error: ' + (err.error || 'Upload failed'));
                btnUpload.textContent = 'Subir Archivo ↑';
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Error de conexión');
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
        const res = await fetch(url);
        const data = await res.json();
        let ideas = data.ideas || data;
        const pagination = data.pagination;

        // Client-side filtering for voice (not a DB column)
        if (currentIdeasFilter === 'voice') {
            ideas = ideas.filter(i => i.audioUrl || i.type === 'voice');
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
                if (idea.ai_type) badges.push(`<span class="badge" style="background:#3b82f6;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${idea.ai_type}</span>`);
                if (idea.ai_category) badges.push(`<span class="badge" style="background:#10b981;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${idea.ai_category}</span>`);
                if (idea.para_type) badges.push(`<span class="badge" style="background:#8b5cf6;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">PARA:${idea.para_type}</span>`);
                if (idea.assigned_to) badges.push(`<span class="badge" style="background:#f59e0b;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">👤 ${idea.assigned_to}</span>`);
                if (idea.estimated_time) badges.push(`<span class="badge" style="background:#6366f1;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">⏱ ${idea.estimated_time}</span>`);
                if (idea.priority) {
                    const pColors = { alta: '#ef4444', media: '#f59e0b', baja: '#22c55e' };
                    badges.push(`<span class="badge" style="background:${pColors[idea.priority] || '#6b7280'};color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">${idea.priority}</span>`);
                }
                if (idea.created_by) {
                    badges.push(`<span class="badge" style="background:#6366f1;color:white;padding:2px 8px;border-radius:12px;font-size:0.7rem;">🗣 ${idea.created_by}</span>`);
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
                reviewHtml = `<div class="needs-review-banner">⚠️ Requiere revision humana — <button class="btn-fix" onclick="openFixModal('${idea.id}', '${escapeHtml(idea.ai_type || '')}', '${escapeHtml(idea.ai_category || '')}', '${idea.para_type || ''}', '${idea.assigned_to || ''}', '${idea.priority || ''}')">🔧 Corregir</button></div>`;
            }

            // CODE action buttons based on stage
            let actionBtns = '';
            const safeText = escapeHtml(idea.text || '').replace(/'/g, "\\'");
            const hasAgent = idea.suggested_agent && !['running', 'completed'].includes(idea.execution_status);
            const agentLabels = { staffing: 'Staffing', training: 'Training', finance: 'Finance', compliance: 'Compliance' };

            if (stage === 'captured') {
                actionBtns = `<button class="btn-code-action" onclick="processIdea('${idea.id}', '${safeText}')">⚡ Organizar</button>`;
            } else if (stage === 'organized') {
                actionBtns = `<button class="btn-code-action" onclick="distillIdea('${idea.id}')">💎 Destilar</button>`;
                if (hasAgent) {
                    actionBtns += ` <button class="btn-code-action btn-execute" onclick="openExecuteModal('${idea.id}', '${idea.suggested_agent}')">🤖 Ejecutar con ${agentLabels[idea.suggested_agent] || 'Agente'}</button>`;
                }
            } else if (stage === 'distilled') {
                if (hasAgent) {
                    actionBtns = `<button class="btn-code-action btn-execute" onclick="openExecuteModal('${idea.id}', '${idea.suggested_agent}')">🤖 Ejecutar con ${agentLabels[idea.suggested_agent] || 'Agente'}</button>`;
                } else {
                    actionBtns = `<button class="btn-code-action" onclick="expressIdea('${idea.id}')">🚀 Expresar</button>`;
                }
            }

            // Agent suggestion badge
            let agentBadgeHtml = '';
            if (idea.suggested_agent && stage !== 'expressed') {
                const agentInfo = { staffing: { label: 'Staffing', icon: '👷', color: '#2563eb' }, training: { label: 'Training', icon: '📚', color: '#7c3aed' }, finance: { label: 'Finance', icon: '💰', color: '#059669' }, compliance: { label: 'Compliance', icon: '📋', color: '#dc2626' } }[idea.suggested_agent] || { label: idea.suggested_agent, icon: '🤖', color: '#6b7280' };
                agentBadgeHtml = `<div class="agent-suggestion" style="margin-top:6px;padding:6px 10px;background:rgba(124,58,237,0.08);border-left:3px solid ${agentInfo.color};border-radius:4px;font-size:0.8rem;color:var(--text-secondary);">${agentInfo.icon} Agente: <strong style="color:${agentInfo.color}">${agentInfo.label}</strong></div>`;
            }

            // Execution status
            let executionHtml = '';
            if (idea.execution_status === 'running') {
                executionHtml = `<div class="execution-status running"><span class="spinner-small"></span> Ejecutando agente...</div>`;
            } else if (idea.execution_status === 'completed' && idea.execution_output) {
                const preview = (idea.execution_output || '').substring(0, 120).replace(/</g, '&lt;');
                executionHtml = `<div class="execution-status completed" onclick="showExecutionOutput('${idea.id}')">🚀 <strong>Output generado</strong> — click para ver<div style="margin-top:4px;opacity:0.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${preview}...</div></div>`;
            } else if (idea.execution_status === 'failed') {
                executionHtml = `<div class="execution-status failed">❌ Fallo — <button class="btn-code-action" onclick="openExecuteModal('${idea.id}', '${idea.suggested_agent || ''}')">Reintentar</button></div>`;
            }

            return `
                <div class="idea-card ${idea.needs_review ? 'needs-review' : ''}" data-id="${idea.id}" style="animation: fadeSlideIn 0.3s ease ${i * 0.05}s both">
                    <div class="idea-stage-indicator" style="background:${stageColors[stage]}" title="${stageLabels[stage]}">
                        ${stageIcons[stage]}
                    </div>
                    <div class="idea-content">
                        ${reviewHtml}
                        ${contentHtml}
                        ${tagsHtml}
                        ${confidenceHtml ? `<div style="margin-top:4px;">${confidenceHtml}</div>` : ''}
                        ${distilledHtml}
                        ${agentBadgeHtml}
                        ${executionHtml}
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;flex-wrap:wrap;gap:6px;">
                            <span class="idea-date">${formatted}</span>
                            <div style="display:flex;gap:4px;flex-wrap:wrap;">
                                ${actionBtns}
                            </div>
                        </div>
                    </div>
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
    toast.innerHTML = `<span>${icons[type] || icons.info}</span> ${msg}`;
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
    return div.innerHTML;
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
            // Parse simplified markdown (bold/list)
            let formatted = escapeHtml(text)
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br>');
            content = `<div class="msg-content">${formatted}</div>`;
        }

        div.innerHTML = content;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        appendMessage('user', text);
        input.value = '';

        const agent = document.getElementById('agentSelector')?.value || 'default';

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, agent: agent })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);
            appendMessage('ai', data.response);
        } catch (err) {
            appendMessage('ai', `Error: ${err.message}`);
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
                sel.innerHTML += `<option value="${a.id}">${a.icon || '📂'} ${a.name}</option>`;
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
    if (!grid) return;

    try {
        const res = await fetch('/api/skills');
        const skills = await res.json();

        function renderSkills(filterText = '') {
            grid.innerHTML = '';

            const filtered = skills.filter(s =>
                s.name.toLowerCase().includes(filterText.toLowerCase()) ||
                s.category.toLowerCase().includes(filterText.toLowerCase())
            );

            if (filtered.length === 0) {
                grid.innerHTML = '<div class="empty-state">No se encontraron skills.</div>';
                return;
            }

            filtered.forEach(skill => {
                const card = document.createElement('div');
                card.className = 'skill-card';

                // Format Name: Remove extension, replace dashes with spaces, capitalize
                let displayName = skill.name.replace(/\.md$/i, '').replace(/-/g, ' ');
                displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

                card.onclick = () => viewSkill(skill.path, displayName);

                // Icon based on category
                let icon = '📄';
                if (skill.category === 'core') icon = '🧠';
                else if (skill.category === 'customizable') icon = '🛠️';
                else if (displayName.includes('audit')) icon = '📋';
                else if (displayName.includes('plan')) icon = '📅';

                card.innerHTML = `
                    <div class="skill-icon">${icon}</div>
                    <div class="skill-info">
                        <h3>${displayName}</h3>
                        <span class="skill-category">${skill.category}</span>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        renderSkills();

        if (searchInput) {
            searchInput.addEventListener('input', (e) => renderSkills(e.target.value));
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

    if (modalTitle) {
        modalTitle.innerHTML = `
            <span>${title || 'Sin Título'}</span>
            <button id="btnDiscussSkill" class="btn-icon" style="margin-left:auto;font-size:1.2rem;" title="Discutir con IA">💬</button>
        `;
    }
    if (modalContent) modalContent.innerHTML = '<div class="loading-spinner">Cargando...</div>';
    if (modal) modal.style.display = 'block';

    try {
        const res = await fetch(`/api/skills/content?file=${encodeURIComponent(filePath)}`);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        modalContent.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace; color: #d1d5db;">${data.content}</pre>`;

        // Attach Discuss Handler
        const btnDiscuss = document.getElementById('btnDiscussSkill');
        if (btnDiscuss) {
            btnDiscuss.onclick = () => discussSkill(title, data.content);
        }

    } catch (err) {
        if (modalContent) modalContent.innerHTML = '<div class="error-msg">Error al cargar contenido</div>';
        console.error(err);
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILS & MODALS
// ═══════════════════════════════════════════════════════════════════════════════

// Custom Modal Logic (Promise-based)
function showCustomModal({ title, message, inputPlaceholder = null, isConfirm = false }) {
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
        msgEl.textContent = message;
        if (input) input.value = '';

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

        // Handlers
        const close = (val) => {
            modal.style.display = 'none';
            cleanup();
            resolve(val);
        };

        const onConfirm = () => {
            if (inputPlaceholder !== null && input) close(input.value);
            else close(true);
        };

        const onCancel = () => close(false);

        const onKey = (e) => {
            if (e.key === 'Enter') onConfirm();
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

// Toast Notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
window.showToast = showToast;

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
        if (!skipPreview) {
            const previewRes = await fetch('/api/ai/preview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (previewRes.ok) {
                const preview = await previewRes.json();
                if (btn) btn.innerText = originalText;

                const confirmed = await showVoicePreview(preview, text);
                if (!confirmed) {
                    showToast('Captura cancelada', 'info');
                    return;
                }
            }
        }

        // Step 2: Save — commit to database
        if (btn) btn.innerText = 'Guardando...';
        const res = await fetch('/api/ideas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
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

// ─── Voice Preview Modal ─────────────────────────────────────────────────────
function showVoicePreview(preview, originalText) {
    return new Promise((resolve) => {
        const items = preview.items || [];
        const isSplit = items.length > 1;

        let itemsHtml = items.map((item, idx) => {
            const priorityColors = { alta: '#ef4444', media: '#f59e0b', baja: '#22c55e' };
            const pColor = priorityColors[item.priority] || '#6b7280';
            return `
                <div class="preview-idea-card">
                    ${isSplit ? `<div class="preview-idea-num">#${idx + 1}</div>` : ''}
                    <div class="preview-idea-body">
                        <p class="preview-idea-text">${escapeHtml(item.texto_limpio || item.resumen || '')}</p>
                        <div class="preview-idea-tags">
                            <span class="preview-tag" style="background:#3b82f6;">${item.tipo || '?'}</span>
                            <span class="preview-tag" style="background:#10b981;">${item.categoria || '?'}</span>
                            <span class="preview-tag" style="background:#8b5cf6;">PARA:${item.para_type || '?'}</span>
                            <span class="preview-tag" style="background:${pColor};">${item.priority || 'media'}</span>
                            ${item.assigned_to ? `<span class="preview-tag" style="background:#f59e0b;">→ ${item.assigned_to}</span>` : ''}
                        </div>
                        <p class="preview-idea-action">${item.accion_inmediata || ''}</p>
                        ${item.waiting_for ? `<p class="preview-idea-delegation">⏳ Delegacion: ${item.waiting_for.delegated_to} — ${item.waiting_for.description}</p>` : ''}
                    </div>
                </div>`;
        }).join('');

        const confAvg = items.reduce((sum, i) => sum + (i.confidence || 0), 0) / items.length;
        const confColor = confAvg >= 0.8 ? '#10b981' : confAvg >= 0.6 ? '#f59e0b' : '#ef4444';

        const modalHtml = `
            <div id="voicePreviewModal" class="modal" style="display:flex;z-index:2100;">
                <div class="modal-content" style="max-width:600px;max-height:80vh;display:flex;flex-direction:column;">
                    <h2 class="modal-title">🎤 Preview — La IA entendio esto</h2>
                    ${isSplit ? `<div class="preview-split-banner">La IA detecto <strong>${items.length} ideas</strong> en tu mensaje</div>` : ''}
                    <div class="preview-original">
                        <label>Texto original:</label>
                        <p>${escapeHtml(originalText.substring(0, 200))}${originalText.length > 200 ? '...' : ''}</p>
                    </div>
                    <div class="preview-confidence" style="color:${confColor};">
                        Confianza: ${(confAvg * 100).toFixed(0)}%
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof initIdeas === 'function') initIdeas();
        if (typeof initContext === 'function') initContext();
        if (typeof initChat === 'function') initChat();
        if (typeof initSkills === 'function') initSkills();
    } catch (e) {
        console.error('Initialization error:', e);
    }
});

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

// Close modal logic for generic modals
window.onclick = (event) => {
    const skillModal = document.getElementById('skillModal');
    const customModal = document.getElementById('customModal');
    if (event.target == skillModal && skillModal) skillModal.style.display = 'none';
    if (event.target == customModal && customModal) customModal.style.display = 'none';
};

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

    // Load users for delegation dropdown
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        const sel = document.getElementById('waitingDelegatedTo');
        if (sel) {
            sel.innerHTML = users.map(u => `<option value="${u.username}">${u.username} (${u.role})</option>`).join('');
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
        const [codeRes, paraRes, overviewRes] = await Promise.all([
            fetch('/api/stats/code'),
            fetch('/api/stats/para'),
            fetch('/api/stats/overview')
        ]);

        const code = await codeRes.json();
        const para = await paraRes.json();
        const overview = await overviewRes.json();

        // CODE Pipeline counts
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('codeCaptured', code.captured || 0);
        set('codeOrganized', code.organized || 0);
        set('codeDistilled', code.distilled || 0);
        set('codeExpressed', code.expressed || 0);

        // PARA Distribution counts
        set('paraProjects', para.project || 0);
        set('paraAreas', para.area || 0);
        set('paraResources', para.resource || 0);
        set('paraArchive', para.archive || 0);

        // Overview stats
        set('statProjects', overview.projects || 0);
        set('statAreas', overview.areas || 0);
        set('statContext', overview.context || 0);
        set('statWaiting', overview.waiting || 0);

    } catch (err) {
        console.error('Error loading overview stats:', err);
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
    fetch('/api/users').then(r => r.json()).then(users => {
        const sel = document.getElementById('fixAssignedTo');
        sel.innerHTML = '<option value="">— Sin cambio —</option>';
        users.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.username;
            opt.textContent = `${u.username} (${u.department || u.role})`;
            if (u.username === assignedTo) opt.selected = true;
            sel.appendChild(opt);
        });
    });

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
                // Basic markdown rendering
                content.innerHTML = data.response
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/^### (.*$)/gm, '<h4 style="margin-top:12px;color:var(--accent);">$1</h4>')
                    .replace(/^## (.*$)/gm, '<h3 style="margin-top:16px;color:var(--accent);">$1</h3>')
                    .replace(/^# (.*$)/gm, '<h2 style="margin-top:16px;color:var(--accent);">$1</h2>')
                    .replace(/^- (.*$)/gm, '<li style="margin-left:16px;">$1</li>')
                    .replace(/\n/g, '<br>');
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

    // Load users into selector
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        const sel = document.getElementById('reportUserSelect');
        if (sel) {
            sel.innerHTML = '<option value="">— Seleccionar —</option>';
            users.forEach(u => {
                sel.innerHTML += `<option value="${u.username}">${u.username} — ${u.department || u.role}</option>`;
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
            const initial = u.username.charAt(0).toUpperCase();
            return `
                <div class="team-member-card" onclick="loadChecklist('${u.username}')">
                    <div class="team-member-avatar" style="background:${pctColor}20;color:${pctColor};border:2px solid ${pctColor};">${initial}</div>
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
                        <div class="report-avatar" style="border-color:${pctColor};">${u.username.charAt(0).toUpperCase()}</div>
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
    checkNotifications();
    // Poll every 5 minutes
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

async function checkNotifications() {
    try {
        const res = await fetch('/api/notifications/check');
        const data = await res.json();
        const badge = document.getElementById('notificationBadge');
        const list = document.getElementById('notificationList');

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
            if (data.urgent_tasks.length > 0) {
                html += data.urgent_tasks.map(t => `<div class="notification-item urgent"><span class="notif-icon">🔴</span><span>${escapeHtml((t.ai_summary || t.text || '').substring(0, 60))}</span></div>`).join('');
            }
            if (data.overdue_delegations.length > 0) {
                html += data.overdue_delegations.map(d => `<div class="notification-item warning"><span class="notif-icon">⏳</span><span>Vencida: ${escapeHtml((d.description || '').substring(0, 50))} → ${d.delegated_to}</span></div>`).join('');
            }
            if (data.needs_review.length > 0) {
                html += data.needs_review.map(n => `<div class="notification-item review"><span class="notif-icon">⚠️</span><span>Revisar: ${escapeHtml((n.ai_summary || n.text || '').substring(0, 50))}</span></div>`).join('');
            }
            if (data.total === 0) {
                html = '<div class="notification-empty">Sin notificaciones pendientes</div>';
            }
            list.innerHTML = html;
        }

        // Browser push notification for urgent items
        if (data.urgent_tasks.length > 0 && 'Notification' in window) {
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
    } catch (err) {
        console.error('Notification check error:', err);
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
    if (!window.Chart) return;

    try {
        const res = await fetch('/api/stats/analytics');
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

        // Destroy existing charts
        Object.values(analyticsCharts).forEach(c => c.destroy());
        analyticsCharts = {};

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
        if (ctx4 && data.byType) {
            analyticsCharts.byType = new Chart(ctx4, {
                type: 'doughnut',
                data: {
                    labels: data.byType.map(t => t.ai_type),
                    datasets: [{ data: data.byType.map(t => t.count), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'] }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#9ca3af' } } } }
            });
        }

        // By priority (doughnut)
        const ctx5 = document.getElementById('chartByPriority');
        if (ctx5 && data.byPriority) {
            const priColors = { alta: '#ef4444', media: '#f59e0b', baja: '#22c55e' };
            analyticsCharts.byPriority = new Chart(ctx5, {
                type: 'doughnut',
                data: {
                    labels: data.byPriority.map(p => p.priority),
                    datasets: [{ data: data.byPriority.map(p => p.count), backgroundColor: data.byPriority.map(p => priColors[p.priority] || '#6b7280') }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#9ca3af' } } } }
            });
        }

        // User productivity (stacked bar)
        const ctx6 = document.getElementById('chartUserProductivity');
        if (ctx6 && data.userProductivity) {
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
        }

    } catch (err) {
        console.error('Analytics error:', err);
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
            showToast('Exportando datos...', 'info');
            try {
                const res = await fetch('/api/export');
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `secondbrain_export_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('Datos exportados', 'success');
            } catch (err) {
                showToast('Error al exportar', 'error');
            }
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

        if (previewRes.ok) {
            const preview = await previewRes.json();
            const confirmed = await showVoicePreview(preview, text);
            if (!confirmed) {
                if (hint) hint.textContent = 'Cancelado';
                setTimeout(() => { if (hint) hint.textContent = 'Ctrl+Shift+V desde cualquier seccion'; }, 2000);
                return;
            }
        }

        // Save
        if (hint) hint.textContent = 'Guardando...';
        const res = await fetch('/api/ideas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
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
    { path: 'core/audit-compliance-readiness.md', label: 'Auditoria de Cumplimiento', agent: 'compliance' }
];

function openExecuteModal(ideaId, suggestedAgent) {
    const agents = [
        { key: 'staffing', label: 'Staffing Agent (Dotacion)', icon: '👷' },
        { key: 'training', label: 'Training Agent (Capacitacion)', icon: '📚' },
        { key: 'finance', label: 'Finance Agent (Presupuesto)', icon: '💰' },
        { key: 'compliance', label: 'Compliance Agent (Auditoria)', icon: '📋' }
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
        const data = await res.json();
        if (data.execution_output) {
            const agentLabel = { staffing: '👷 Staffing', training: '📚 Training', finance: '💰 Finance', compliance: '📋 Compliance' }[data.suggested_agent] || '🤖 Agente';
            const header = `<div style="margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border);font-size:0.8rem;color:var(--text-muted);">Ejecutado por: ${agentLabel} | ${data.executed_by || 'system'} | ${data.executed_at || ''}</div>`;
            showAgentResult('🚀 Output de Ejecucion', header + renderMarkdown(data.execution_output));
        }
    } catch (err) {
        showToast('Error al cargar output', 'error');
    }
}

window.openExecuteModal = openExecuteModal;
window.closeExecuteModal = closeExecuteModal;
window.runExecution = runExecution;
window.showExecutionOutput = showExecutionOutput;
window.updateExecSkills = updateExecSkills;

