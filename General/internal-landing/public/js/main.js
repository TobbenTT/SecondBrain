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
    initChat(); // Renamed from initAssistant
});

// ─── Section titles mapping ────────────────────────────────────────────────────
const SECTION_META = {
    home: { title: 'Bienvenido', subtitle: 'Hub Interno de Operaciones' },
    overview: { title: 'Dashboard Overview', subtitle: 'Resumen general del ecosistema interno' },
    projects: { title: 'Proyectos', subtitle: 'Ecosistema de aplicaciones y herramientas' },
    archivos: { title: 'Archivos & Documentación', subtitle: 'Biblioteca centralizada de documentos internos' },
    methodologies: { title: 'Metodologías de Trabajo', subtitle: 'Frameworks que guían nuestra ejecución operativa' },
    ideas: { title: 'Ideas & Notas Rápidas', subtitle: 'Captura ideas por texto o voz — se guardan automáticamente' },
    skills: { title: 'Biblioteca de Habilidades', subtitle: 'Conocimiento estático y procedimientos (SOPs)' },
    context: { title: 'Memoria a Largo Plazo', subtitle: 'Gestión del conocimiento y reglas de la IA' }
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
        const ideas = await ideasRes.json();
        const projects = await projRes.json();

        // Update stats
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('homeStatDocs', archivos.length);
        set('homeStatIdeas', ideas.length);
        set('homeStatProjects', projects.length);
        set('statProjects', projects.length);
    } catch (err) {
        console.error('Home data error:', err);
    }
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
    paused: { label: '● Pausado', cls: 'paused' }
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
    if (!confirm('¿Eliminar este proyecto?')) return;
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
        const icon = file.type === 'markdown' ? '📝' : file.type === 'pdf' ? '📕' : '📄';
        const typeLabel = file.extension.replace('.', '').toUpperCase();
        const href = file.hasDynamic ? file.dynamicUrl : `/archivo/${encodeURIComponent(file.name)}`;
        const dynamicBadge = file.hasDynamic ? `<span class="archivo-dynamic-badge">✨ Interactivo</span>` : '';
        const downloadBtn = file.type === 'pdf' ? `<a href="/descargar/${encodeURIComponent(file.name)}" class="archivo-download" title="Descargar" onclick="event.stopPropagation();">⬇</a>` : '';
        const tagsHtml = (file.tags || []).length > 0 ? `<div class="archivo-tags">${file.tags.map(t => `<span class="archivo-tag">#${escapeHtml(t)}</span>`).join('')}</div>` : '';
        return `
            <a href="${href}" class="archivo-card" title="${file.name}" ${file.hasDynamic ? 'target="_blank"' : ''}>
                <div class="archivo-icon ${file.type === 'markdown' ? 'md' : 'pdf'}">${icon}</div>
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

function initIdeas() {
    loadIdeas();
    initSpeechRecognition();
    const btnSave = document.getElementById('btnSaveIdea');
    if (btnSave) btnSave.addEventListener('click', saveIdea);
    const textarea = document.getElementById('ideaTextarea');
    if (textarea) textarea.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') saveIdea(); });
}

function initSpeechRecognition() {
    const btnMic = document.getElementById('btnMic');
    const micStatus = document.getElementById('micStatus');
    const micHint = document.getElementById('micHint');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    console.log('🎤 Inicializando reconocimiento de voz...');
    if (!SpeechRecognition) {
        console.error('❌ El navegador NO soporta SpeechRecognition');
        // If no speech API, check if we can default to Voice Recorder?
        // For now just show error, user can switch mode if implemented or we can auto-switch
        if (btnMic) {
            // Optional: Auto switch to Voice Note mode here?
            console.log('   -> Auto-switching to Voice Notes mode due to lack of API support');
            switchToAudioMode();
            return;
        }
        if (micStatus) micStatus.textContent = '⚠️ Voz no soportada en este navegador';
        if (micHint) micHint.textContent = '⚠️ Usa Chrome o Edge para habilitar el micrófono';
        return;
    }
    console.log('✅ SpeechRecognition soportado');

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        console.log('🟢 Recognition STARTED');
        micAvailable = true;
        isRecording = true;
        const micIcon = document.getElementById('micIcon');
        const micLabel = document.getElementById('micLabel');
        const bm = document.getElementById('btnMic');
        const ms = document.getElementById('micStatus');
        if (micIcon) micIcon.textContent = '🔴';
        if (micLabel) micLabel.textContent = 'Grabando...';
        if (bm) bm.classList.add('recording');
        if (ms) ms.textContent = '🔴 Escuchando...';
    };

    recognition.onresult = (event) => {
        console.log('🗣️ Recognition RESULT event');
        const textarea = document.getElementById('ideaTextarea');
        if (!textarea) return;
        let finalText = '';
        let interimText = '';
        for (let i = 0; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                console.log('   -> Final:', event.results[i][0].transcript);
                finalText += event.results[i][0].transcript + ' ';
            } else {
                console.log('   -> Interim:', event.results[i][0].transcript);
                interimText += event.results[i][0].transcript;
            }
        }
        const existing = textarea.dataset.preRecordingText || '';
        textarea.value = existing + finalText + interimText;
    };

    recognition.onerror = async (event) => {
        console.warn('❌ Speech error details:', event);
        console.warn('   -> Error:', event.error);
        console.warn('   -> Message:', event.message);
        const ms = document.getElementById('micStatus');
        const mh = document.getElementById('micHint');

        if (event.error === 'not-allowed') {
            if (ms) ms.textContent = '🚫 Permiso de micrófono denegado';
            if (mh) mh.textContent = '⚠️ Habilita el micrófono en tu navegador (click en 🔒 en la barra de dirección)';
            stopRecordingUI();
        } else if (event.error === 'no-speech') {
            if (ms) ms.textContent = '🔇 No se detectó voz, sigue hablando...';
        } else if (event.error === 'audio-capture') {
            if (ms) ms.textContent = '🎤 No se encontró micrófono';
            console.error('   -> Audio capture failed. Check microphone connection.');
            stopRecordingUI();

            // Auto switch for audio detection issues
            switchToAudioMode();

        } else if (event.error === 'network') {
            let msg = '🌐 Error de conexión con Google Speech API.';
            try {
                if (navigator.brave && await navigator.brave.isBrave()) {
                    msg = '🦁 Brave bloquea Google Speech. Cambiando a Grabadora de Audio...';
                } else if (navigator.userAgent.includes('Edg/')) {
                    msg = '🌐 Error de red. Cambiando a Grabadora de Audio...';
                } else {
                    msg = '🌐 Error de red. Cambiando a Grabadora de Audio...';
                }
            } catch (e) {
                console.error('Brave check failed', e);
                msg = '🌐 Error de red. Cambiando a Grabadora de Audio...';
            }

            if (ms) ms.textContent = msg;
            console.error('   -> Network error. Switching to Voice Recorder Fallback.');
            stopRecordingUI();

            // 🚀 AUTO-SWITCH TO FALLBACK HERE
            setTimeout(() => {
                switchToAudioMode();
            }, 1500); // Wait a bit for user to read the toast/message

        } else {
            if (ms) ms.textContent = '⚠️ Error: ' + event.error;
            setTimeout(() => { if (ms) ms.textContent = ''; }, 4000);
        }
    };

    recognition.onend = () => {
        console.log('🏁 Recognition ENDED. isRecording:', isRecording, 'micAvailable:', micAvailable);
        if (isRecording && micAvailable) {
            // Auto-restart if still recording
            console.log('   -> Auto-restarting recognition...');
            try { recognition.start(); } catch (e) {
                console.error('   -> Auto-restart FAILED:', e);
                stopRecordingUI();
            }
        } else {
            stopRecordingUI();
        }
    };

    if (btnMic) btnMic.addEventListener('click', toggleRecording);
}

function toggleRecording() {
    console.log('🖱️ Toggle recording clicked. Current isRecording:', isRecording);
    if (isRecording) stopRecording();
    else startRecording();
}

function startRecording() {
    console.log('▶️ Attempting to START recording...');
    if (!recognition) {
        // Fallback if recognition is missing but we didn't switch yet?
        console.error('❌ Recognition object is NULL');
        switchToAudioMode();
        return;
    }
    const textarea = document.getElementById('ideaTextarea');
    if (textarea) textarea.dataset.preRecordingText = textarea.value;
    const micStatus = document.getElementById('micStatus');
    if (micStatus) micStatus.textContent = '⏳ Solicitando acceso al micrófono...';

    try {
        recognition.start();
        console.log('   -> recognition.start() called successfully');
        // onstart will update UI
    } catch (e) {
        console.error('❌ Rec start error:', e);
        if (micStatus) micStatus.textContent = '⚠️ Error al iniciar: ' + e.message;
        // If typical start error, try fallback?
        if (e.message.includes('not supported') || e.message.includes('permission')) {
            // do nothing, let onerror handle it
        } else {
            // switchToAudioMode();
        }
    }
}

function stopRecording() {
    if (!recognition) return;
    isRecording = false;
    micAvailable = false;
    try { recognition.stop(); } catch (e) { }
    stopRecordingUI();
}

function stopRecordingUI() {
    isRecording = false;
    const micIcon = document.getElementById('micIcon');
    const micLabel = document.getElementById('micLabel');
    const bm = document.getElementById('btnMic');
    const ms = document.getElementById('micStatus');
    const textarea = document.getElementById('ideaTextarea');
    if (micIcon) micIcon.textContent = '🎤';
    if (micLabel) micLabel.textContent = 'Micrófono';
    if (bm) bm.classList.remove('recording');
    if (textarea) delete textarea.dataset.preRecordingText;
    // Don't clear status here — let error handlers show their messages
}

async function saveIdea() {
    const textarea = document.getElementById('ideaTextarea');
    const text = textarea?.value?.trim();
    if (!text) return;
    if (isRecording) stopRecording();
    try {
        const res = await fetch('/api/ideas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (res.ok) {
            textarea.value = '';
            showToast('Idea guardada ✓', 'success');
            loadIdeas();
            initHomeData();
        }
    } catch (err) {
        console.error('Save idea error:', err);
        showToast('Error al guardar', 'error');
    }
}

async function loadIdeas() {
    const list = document.getElementById('ideasList');
    const countEl = document.getElementById('ideasCount');
    if (!list) return;
    try {
        const res = await fetch('/api/ideas');
        const ideas = await res.json();
        if (countEl) countEl.textContent = ideas.length;
        if (ideas.length === 0) {
            list.innerHTML = `
                <div class="ideas-empty">
                    <div class="empty-icon">💭</div>
                    <p>Aún no hay ideas guardadas</p>
                    <span>Escribe o usa el micrófono para capturar tu primera idea</span>
                </div>`;
            return;
        }
        list.innerHTML = ideas.map((idea, i) => {
            const date = new Date(idea.createdAt);
            const formatted = date.toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            });

            let contentHtml = `<p>${escapeHtml(idea.text)}</p>`;
            if (idea.audioUrl) {
                contentHtml += `
                    <div class="idea-audio-player">
                        <audio controls src="${idea.audioUrl}"></audio>
                    </div>`;
            }

            // AI Tags
            let tagsHtml = '';
            if (idea.status === 'processed' || idea.ai_type) {
                const tipo = idea.ai_type || 'Idea';
                const cat = idea.ai_category || 'General';
                tagsHtml = `
                    <div class="idea-tags" style="margin-top:8px; display:flex; gap:6px;">
                        <span class="badge badge-type" style="background:#3b82f6;color:white;padding:2px 8px;border-radius:12px;font-size:0.75rem;">${tipo}</span>
                        <span class="badge badge-category" style="background:#10b981;color:white;padding:2px 8px;border-radius:12px;font-size:0.75rem;">${cat}</span>
                    </div>
                `;
            }

            return `
                <div class="idea-card" data-id="${idea.id}" style="animation: fadeSlideIn 0.3s ease ${i * 0.05}s both">
                    <div class="idea-content">
                        ${contentHtml}
                        ${tagsHtml}
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                            <span class="idea-date">${formatted}</span>
                            <button class="btn-process-idea" onclick="processIdea('${idea.id}', '${escapeHtml(idea.text || '').replace(/'/g, "\\'")}')">
                                ${idea.status === 'processed' ? '🔄 Reprocesar' : '⚡ Procesar'}
                            </button>
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
    if (!confirm('¿Eliminar esta idea?')) return;
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
            showToast('Audio guardado correctamente', 'success');
            if (textarea) textarea.value = '';
            loadIdeas();
            initHomeData();
            const ms = document.getElementById('micStatus');
            if (ms) ms.textContent = '✅ Audio guardado';
            setTimeout(() => { if (ms) ms.textContent = ''; }, 2000);
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
    const messagesContainer = document.getElementById('chatMessages');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    // Toggle Logic
    const toggleBtn = document.getElementById('aiToggleBtn');
    const closeBtn = document.getElementById('closeAiBtn');
    const widget = document.getElementById('aiWidget');

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

async function initContext() {
    loadContext();
    const form = document.getElementById('contextForm');
    if (form) form.addEventListener('submit', saveContext);
}

async function loadContext() {
    const tbody = document.querySelector('#contextTable tbody');
    if (!tbody) return;

    try {
        const res = await fetch('/api/ai/context');
        allContext = await res.json();

        if (allContext.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay datos de contexto almacenados.</td></tr>';
            return;
        }

        tbody.innerHTML = allContext.map(item => `
            <tr>
                <td style="font-weight:600;color:var(--text-primary);">${escapeHtml(item.key)}</td>
                <td><div style="max-height:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:300px;">${escapeHtml(item.content)}</div></td>
                <td><span class="badge badge-category">${item.category}</span></td>
                <td>
                    <button class="btn-icon" onclick="editContext('${item.id}')" title="Editar">✏️</button>
                    <button class="btn-icon delete" onclick="deleteContext('${item.id}')" title="Eliminar">🗑</button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error('Error loading context:', err);
        tbody.innerHTML = '<tr><td colspan="4" class="text-error">Error al cargar datos.</td></tr>';
    }
}

async function saveContext(e) {
    e.preventDefault();
    const id = document.getElementById('contextId').value;
    const key = document.getElementById('contextKey').value;
    const category = document.getElementById('contextCategory').value;
    const content = document.getElementById('contextContent').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/ai/context/${id}` : '/api/ai/context';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, content, category })
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
    const item = allContext.find(i => i.id == id); // loose equality for string/int
    if (!item) return;

    document.getElementById('contextId').value = item.id;
    document.getElementById('contextKey').value = item.key;
    document.getElementById('contextCategory').value = item.category;
    document.getElementById('contextContent').value = item.content;
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

function discussSkill(title, content) {
    // Close modal
    const modal = document.getElementById('skillModal');
    if (modal) modal.style.display = 'none';

    // Open AI Widget
    const widget = document.getElementById('aiWidget');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');

    if (widget) widget.classList.add('open');

    // Prepare initial message
    if (input && sendBtn) {
        // Truncate content if too long to avoid token limits (naive approach)
        const truncated = content.length > 2000 ? content.substring(0, 2000) + '... [truncado]' : content;
        const prompt = `Analicemos esta skill: **${title}**\n\nContenido:\n\`\`\`\n${truncated}\n\`\`\`\n\n¿Cómo puedo aplicar esto?`;

        input.value = prompt;
        input.focus();
        // Optional: Auto-send
        // sendBtn.click(); 
    }
}


// Close modal logic
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('skillModal').style.display = 'none';
    });
});

window.onclick = (event) => {
    const modal = document.getElementById('skillModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // ... existing init calls
    initSkills();
});

window.processIdea = processIdea;
window.viewSkill = viewSkill;

