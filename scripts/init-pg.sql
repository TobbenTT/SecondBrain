-- SecondBrain — PostgreSQL Schema
-- Auto-ejecutado por Docker al crear el container postgres-staging
-- Equivalente al initTables() de database.js pero en PostgreSQL nativo

-- ─── Ideas Table ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ideas (
    id SERIAL PRIMARY KEY,
    text TEXT,
    audio_url TEXT,
    tags TEXT,
    status TEXT DEFAULT 'inbox',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ai_type TEXT,
    ai_category TEXT,
    ai_action TEXT,
    ai_summary TEXT,
    ai_confidence REAL,
    needs_review INTEGER DEFAULT 0,
    created_by TEXT,
    last_reviewed TIMESTAMP,
    review_status TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMP,
    project_id TEXT,
    code_stage TEXT,
    para_type TEXT,
    related_area_id TEXT,
    distilled_summary TEXT,
    expressed_output TEXT,
    assigned_to TEXT,
    estimated_time TEXT,
    priority TEXT,
    suggested_agent TEXT,
    suggested_skills TEXT,
    execution_status TEXT,
    execution_output TEXT,
    execution_error TEXT,
    executed_at TEXT,
    executed_by TEXT,
    contexto TEXT,
    energia TEXT,
    fecha_inicio TEXT,
    fecha_objetivo TEXT,
    fecha_limite TEXT,
    es_fecha_limite TEXT,
    tipo_compromiso TEXT,
    proxima_accion TEXT,
    subproyecto TEXT,
    objetivo TEXT,
    notas TEXT,
    completada TEXT,
    fecha_finalizacion TEXT,
    parent_idea_id INTEGER,
    is_project TEXT,
    source_reunion_id TEXT,
    deleted_at TIMESTAMP
);

-- ─── Context Items ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS context_items (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE,
    content TEXT,
    category TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    para_type TEXT,
    code_stage TEXT,
    source TEXT,
    related_project_id TEXT,
    related_area_id TEXT,
    distilled_summary TEXT
);

-- ─── Areas (PARA — ongoing responsibilities) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS areas (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE,
    description TEXT,
    icon TEXT,
    horizon TEXT DEFAULT 'h2',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Waiting For (GTD delegation tracking) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS waiting_for (
    id SERIAL PRIMARY KEY,
    description TEXT,
    delegated_to TEXT,
    delegated_by TEXT,
    related_idea_id INTEGER,
    related_project_id TEXT,
    related_area_id INTEGER,
    status TEXT DEFAULT 'waiting',
    due_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- ─── Chat History ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    session_id TEXT,
    role TEXT,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Projects ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    url TEXT,
    icon TEXT,
    status TEXT,
    tech TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    related_area_id TEXT,
    horizon TEXT,
    deadline TEXT,
    project_type TEXT,
    client_name TEXT,
    geography TEXT,
    deleted_at TIMESTAMP
);

-- ─── Skills ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    content TEXT,
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash TEXT,
    role TEXT,
    department TEXT,
    expertise TEXT,
    avatar TEXT,
    supabase_uid TEXT,
    twofa_enabled BOOLEAN DEFAULT FALSE,
    twofa_enforced BOOLEAN DEFAULT FALSE,
    last_twofa_at TIMESTAMP,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Inbox Log (audit trail) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inbox_log (
    id SERIAL PRIMARY KEY,
    source TEXT,
    input_text TEXT,
    ai_confidence REAL DEFAULT 0,
    ai_classification TEXT,
    routed_to TEXT,
    needs_review INTEGER DEFAULT 0,
    reviewed INTEGER DEFAULT 0,
    original_idea_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── API Keys ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE,
    name TEXT,
    username TEXT,
    permissions TEXT DEFAULT 'read,write',
    active INTEGER DEFAULT 1,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Herramientas Contratadas (subscriptions) ────────────────────────────────
CREATE TABLE IF NOT EXISTS herramientas_contratadas (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    proveedor TEXT,
    categoria TEXT DEFAULT 'General',
    costo_mensual REAL DEFAULT 0,
    moneda TEXT DEFAULT 'USD',
    frecuencia TEXT DEFAULT 'mensual',
    fecha_inicio TEXT,
    fecha_renovacion TEXT,
    duracion_contrato TEXT,
    fecha_vencimiento TEXT,
    num_licencias INTEGER DEFAULT 1,
    estado TEXT DEFAULT 'activo',
    notas TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Daily Checklist ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_checklist (
    id SERIAL PRIMARY KEY,
    username TEXT,
    idea_id INTEGER,
    date TEXT,
    completed INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    notes TEXT,
    UNIQUE(username, idea_id, date)
);

-- ─── Material de Apoyo ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS material_apoyo (
    id SERIAL PRIMARY KEY,
    title TEXT,
    url TEXT,
    content TEXT,
    tipo TEXT DEFAULT 'referencia',
    related_idea_id INTEGER,
    related_project_id TEXT,
    related_area_id INTEGER,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── GTD Contexts ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gtd_contexts (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE,
    icon TEXT,
    description TEXT,
    active INTEGER DEFAULT 1
);

-- ─── Notification Dismissals ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_dismissals (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    notification_id INTEGER NOT NULL,
    dismissed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, notification_type, notification_id)
);

-- ─── Comments ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    section TEXT,
    highlighted_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Skill Documents ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_documents (
    id SERIAL PRIMARY KEY,
    skill_path TEXT NOT NULL,
    document_name TEXT NOT NULL,
    document_url TEXT,
    description TEXT,
    file_path TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Reuniones (meetings intelligence) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reuniones (
    id SERIAL PRIMARY KEY,
    external_id TEXT UNIQUE,
    titulo TEXT NOT NULL,
    fecha TEXT NOT NULL,
    transcripcion_raw TEXT,
    asistentes TEXT DEFAULT '[]',
    acuerdos TEXT DEFAULT '[]',
    puntos_clave TEXT DEFAULT '[]',
    compromisos TEXT DEFAULT '[]',
    entregables TEXT DEFAULT '[]',
    proxima_reunion TEXT,
    nivel_analisis TEXT,
    temas_detectados TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ─── Reuniones Notifications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reuniones_notifications (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    reunion_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(username, reunion_id)
);

-- ─── Reuniones Email Recipients ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reuniones_email_recipients (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nombre TEXT,
    activo INTEGER DEFAULT 1,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Feedback ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'mejora',
    priority TEXT DEFAULT 'media',
    status TEXT DEFAULT 'abierto',
    admin_response TEXT,
    responded_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ─── Feedback Attachments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback_attachments (
    id SERIAL PRIMARY KEY,
    feedback_id INTEGER NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mimetype TEXT,
    size INTEGER,
    uploaded_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── User Notifications ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_notifications (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    link_section TEXT,
    link_id INTEGER,
    read INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Gallery Photos ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gallery_photos (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT,
    category TEXT DEFAULT 'general',
    uploaded_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Reunion Links ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reunion_links (
    id SERIAL PRIMARY KEY,
    reunion_id INTEGER NOT NULL,
    link_type TEXT NOT NULL,
    link_id TEXT NOT NULL,
    auto_detected INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reunion_id, link_type, link_id)
);

-- ─── OKRs ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS okrs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'objective',
    parent_id INTEGER REFERENCES okrs(id) ON DELETE CASCADE,
    owner TEXT,
    target_value REAL,
    current_value REAL DEFAULT 0,
    unit TEXT,
    status TEXT DEFAULT 'active',
    period TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- ─── OKR Links ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS okr_links (
    id SERIAL PRIMARY KEY,
    okr_id INTEGER NOT NULL REFERENCES okrs(id) ON DELETE CASCADE,
    link_type TEXT NOT NULL,
    link_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(okr_id, link_type, link_id)
);

-- ─── Archivos (registro de uploads en knowledge/) ────────────────────────────
CREATE TABLE IF NOT EXISTS archivos (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    mime_type TEXT,
    hash TEXT,
    has_dynamic BOOLEAN DEFAULT FALSE,
    uploaded_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

-- ─── Reuniones Analisis (tabla de inteligencia-correos, compartida) ───────────
CREATE TABLE IF NOT EXISTS reuniones_analisis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    titulo TEXT NOT NULL,
    transcripcion_raw TEXT,
    asistentes JSONB DEFAULT '[]',
    acuerdos JSONB DEFAULT '[]',
    puntos_clave JSONB DEFAULT '[]',
    compromisos JSONB DEFAULT '[]',
    entregables JSONB DEFAULT '[]',
    proxima_reunion DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ─── 2FA: TOTP Secrets ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_totp_secrets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    secret_encrypted TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ─── 2FA: Recovery Codes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_recovery_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used_at TIMESTAMP
);

-- ─── 2FA: Trusted Devices ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_trusted_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_hash TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    label TEXT,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── 2FA: Login Attempts (risk assessment) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS user_login_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    username TEXT NOT NULL,
    ip_address TEXT,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── Audit Log (security events) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    actor TEXT,
    target TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── WebAuthn Credentials (passkeys) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_webauthn_credentials (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter INTEGER DEFAULT 0,
    device_type TEXT,
    transports TEXT,
    label TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP
);

-- ─── Daily Digests ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_digests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    summary TEXT,
    delivered_via TEXT DEFAULT 'in_app',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ideas indexes
CREATE INDEX IF NOT EXISTS idx_ideas_code_stage ON ideas(code_stage);
CREATE INDEX IF NOT EXISTS idx_ideas_assigned_to ON ideas(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ideas_parent ON ideas(parent_idea_id);
CREATE INDEX IF NOT EXISTS idx_ideas_area ON ideas(related_area_id);
CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_priority ON ideas(priority);
CREATE INDEX IF NOT EXISTS idx_ideas_completada ON ideas(completada);
CREATE INDEX IF NOT EXISTS idx_ideas_created_by ON ideas(created_by);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_execution ON ideas(execution_status);
CREATE INDEX IF NOT EXISTS idx_ideas_needs_review ON ideas(needs_review);
CREATE INDEX IF NOT EXISTS idx_ideas_is_project ON ideas(is_project);
CREATE INDEX IF NOT EXISTS idx_ideas_user_date ON ideas(created_by, created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_review ON ideas(review_status);

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_checklist_user_date ON daily_checklist(username, date);
CREATE INDEX IF NOT EXISTS idx_waiting_status ON waiting_for(status);
CREATE INDEX IF NOT EXISTS idx_waiting_delegated ON waiting_for(delegated_to);
CREATE INDEX IF NOT EXISTS idx_context_para ON context_items(para_type);
CREATE INDEX IF NOT EXISTS idx_context_area ON context_items(related_area_id);
CREATE INDEX IF NOT EXISTS idx_inbox_log_idea ON inbox_log(original_idea_id);
CREATE INDEX IF NOT EXISTS idx_notif_dismiss_user ON notification_dismissals(username, notification_type);
CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_supabase_uid ON users(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_username ON comments(username);
CREATE INDEX IF NOT EXISTS idx_skill_docs_path ON skill_documents(skill_path);
CREATE INDEX IF NOT EXISTS idx_reuniones_fecha ON reuniones(fecha);
CREATE INDEX IF NOT EXISTS idx_reuniones_external ON reuniones(external_id);
CREATE INDEX IF NOT EXISTS idx_reuniones_notif_user ON reuniones_notifications(username);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON feedback(username);
CREATE INDEX IF NOT EXISTS idx_fb_attach_feedback ON feedback_attachments(feedback_id);
CREATE INDEX IF NOT EXISTS idx_user_notif_user ON user_notifications(username, read);
CREATE INDEX IF NOT EXISTS idx_reunion_links_reunion ON reunion_links(reunion_id);
CREATE INDEX IF NOT EXISTS idx_reunion_links_target ON reunion_links(link_type, link_id);
CREATE INDEX IF NOT EXISTS idx_okrs_parent ON okrs(parent_id);
CREATE INDEX IF NOT EXISTS idx_okrs_owner ON okrs(owner);
CREATE INDEX IF NOT EXISTS idx_okrs_status ON okrs(status);
CREATE INDEX IF NOT EXISTS idx_okr_links_okr ON okr_links(okr_id);
CREATE INDEX IF NOT EXISTS idx_okr_links_target ON okr_links(link_type, link_id);
CREATE INDEX IF NOT EXISTS idx_reuniones_analisis_fecha ON reuniones_analisis(fecha);
CREATE INDEX IF NOT EXISTS idx_reuniones_analisis_titulo ON reuniones_analisis(titulo);

-- 2FA indexes
CREATE INDEX IF NOT EXISTS idx_recovery_user ON user_recovery_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_user ON user_trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_lookup ON user_trusted_devices(user_id, device_hash, ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user ON user_login_attempts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON user_login_attempts(ip_address, created_at);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_event ON audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_log(target);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- Archivos indexes
CREATE INDEX IF NOT EXISTS idx_archivos_filename ON archivos(filename);
CREATE INDEX IF NOT EXISTS idx_archivos_hash ON archivos(hash);
CREATE INDEX IF NOT EXISTS idx_archivos_uploaded_by ON archivos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_archivos_deleted ON archivos(deleted_at) WHERE deleted_at IS NOT NULL;

-- WebAuthn indexes
CREATE INDEX IF NOT EXISTS idx_webauthn_user ON user_webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credid ON user_webauthn_credentials(credential_id);

-- Daily digest indexes
CREATE INDEX IF NOT EXISTS idx_digest_user ON daily_digests(user_id, created_at);

-- Soft-delete indexes (partial — only non-null for fast trash queries)
CREATE INDEX IF NOT EXISTS idx_ideas_deleted ON ideas(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_deleted ON feedback(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reuniones_deleted ON reuniones(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_okrs_deleted ON okrs(deleted_at) WHERE deleted_at IS NOT NULL;
