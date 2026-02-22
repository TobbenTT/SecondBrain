"""
Conftest — Setup de mocks y fixtures antes de importar OpenClaw.
"""
import os
import sys
import sqlite3
import tempfile
from unittest.mock import MagicMock, patch

# ── Env vars ANTES de cualquier import de OpenClaw ───────────────────────────
os.environ["GEMINI_API_KEY"] = "test-gemini-key"
os.environ["ANTHROPIC_API_KEY"] = "test-claude-key"
os.environ["DB_PATH"] = ":memory:"
os.environ["TTS_ENABLED"] = "false"
os.environ["INTERVALO_PM"] = "1"
os.environ["INTERVALO_DEV"] = "1"
os.environ["INTERVALO_QA"] = "1"
os.environ["INTERVALO_CONSULTING"] = "1"
os.environ["INTERVALO_BUILDER"] = "1"
os.environ["INTERVALO_REVIEWER"] = "1"

# Skills dir apunta al real de SecondBrain
_project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ["SKILLS_DIR"] = os.path.join(_project_root, "core", "skills")

# ── Mock de google.genai ANTES de imports ────────────────────────────────────
_mock_genai_module = MagicMock()
_mock_genai_client = MagicMock()
_mock_response = MagicMock()
_mock_response.text = "Mocked Gemini response"
_mock_genai_client.models.generate_content.return_value = _mock_response
_mock_genai_module.Client.return_value = _mock_genai_client
_mock_google = MagicMock()
_mock_google.genai = _mock_genai_module
sys.modules['google'] = _mock_google
sys.modules['google.genai'] = _mock_genai_module

# ── Mock de anthropic ANTES de imports ───────────────────────────────────────
_mock_anthropic_module = MagicMock()
_mock_anthropic_client = MagicMock()
_mock_claude_content = MagicMock()
_mock_claude_content.text = "VEREDICTO: APROBADO\nSCORE: 8\nRESUMEN: Todo bien\nDETALLES:\n- OK"
_mock_claude_response = MagicMock()
_mock_claude_response.content = [_mock_claude_content]
_mock_anthropic_client.messages.create.return_value = _mock_claude_response
_mock_anthropic_module.Anthropic.return_value = _mock_anthropic_client
sys.modules['anthropic'] = _mock_anthropic_module

# ── Mock modulos opcionales ──────────────────────────────────────────────────
sys.modules['gtts'] = MagicMock()
sys.modules['playsound'] = MagicMock()
sys.modules['twilio'] = MagicMock()
sys.modules['twilio.rest'] = MagicMock()

import pytest


# ── Schema matching SecondBrain's database.js ────────────────────────────────
SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS ideas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    audio_url TEXT,
    tags TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ai_type TEXT,
    ai_category TEXT,
    ai_action TEXT,
    ai_summary TEXT,
    code_stage TEXT DEFAULT 'captured',
    para_type TEXT,
    related_area_id INTEGER,
    suggested_area TEXT,
    suggested_project TEXT,
    assigned_to TEXT,
    estimated_time TEXT,
    priority TEXT DEFAULT 'media',
    contexto TEXT,
    energia TEXT,
    tipo_compromiso TEXT,
    proxima_accion TEXT,
    is_project INTEGER DEFAULT 0,
    parent_idea_id INTEGER,
    ai_confidence REAL,
    needs_review INTEGER DEFAULT 0,
    created_by TEXT,
    last_reviewed DATETIME,
    suggested_agent TEXT,
    suggested_skills TEXT,
    execution_status TEXT,
    execution_output TEXT,
    execution_error TEXT,
    executed_at DATETIME,
    executed_by TEXT
);

CREATE TABLE IF NOT EXISTS context_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE,
    content TEXT,
    category TEXT DEFAULT 'general',
    para_type TEXT DEFAULT 'resource',
    code_stage TEXT DEFAULT 'captured',
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    distilled_summary TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'viewer',
    department TEXT,
    expertise TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    icon TEXT DEFAULT '📋',
    horizon TEXT DEFAULT 'h2',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    url TEXT,
    icon TEXT,
    status TEXT,
    tech TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    related_area_id TEXT,
    horizon TEXT,
    deadline TEXT
);
"""

SEED_SQL = """
INSERT INTO users (username, role, department, expertise)
VALUES ('david', 'admin', 'Direccion', 'Estrategia,Operaciones');

INSERT INTO users (username, role, department, expertise)
VALUES ('gonzalo', 'manager', 'Operaciones', 'HSE,Ejecucion');

INSERT INTO users (username, role, department, expertise)
VALUES ('jose', 'analyst', 'Finanzas', 'Finanzas,Analisis');

INSERT INTO areas (name, description) VALUES ('Operaciones', 'Gestion operativa');
INSERT INTO areas (name, description) VALUES ('HSE', 'Salud, Seguridad y Medio Ambiente');
INSERT INTO areas (name, description) VALUES ('Finanzas', 'Presupuestos OPEX');
INSERT INTO areas (name, description) VALUES ('Capacitacion', 'Planes de capacitacion');

INSERT INTO context_items (key, content, category)
VALUES ('empresa', 'Value Strategy Consulting - Consultoria minera en Chile', 'business');
"""


@pytest.fixture
def test_db():
    """In-memory SQLite with SecondBrain schema for testing."""
    db = sqlite3.connect(":memory:")
    db.row_factory = sqlite3.Row
    db.executescript(SCHEMA_SQL)
    db.executescript(SEED_SQL)
    yield db
    db.close()


@pytest.fixture
def db_with_ideas(test_db):
    """Test DB pre-loaded with sample ideas in various states."""
    test_db.executescript("""
        -- Idea organizada con agente sugerido (consulting)
        INSERT INTO ideas (id, text, code_stage, suggested_agent, suggested_skills, priority)
        VALUES (1, 'Necesitamos plan de dotacion para proyecto ACME', 'organized',
                'staffing', '["customizable/create-staffing-plan.md"]', 'alta');

        -- Idea organizada tipo software
        INSERT INTO ideas (id, text, code_stage, ai_category, ai_type, priority)
        VALUES (2, 'Desarrollar script Python para calcular KPIs', 'organized',
                'Software', 'Software', 'media');

        -- Idea organizada sin agente ni tipo software
        INSERT INTO ideas (id, text, code_stage, priority)
        VALUES (3, 'Revisar contrato con proveedor', 'organized', 'baja');

        -- Idea ya en pipeline software (queued)
        INSERT INTO ideas (id, text, code_stage, execution_status, priority)
        VALUES (4, 'Crear API REST para inventario', 'organized',
                'queued_software', 'media');

        -- Idea developed (para BUILDER)
        INSERT INTO ideas (id, text, code_stage, execution_status, execution_output, priority)
        VALUES (5, 'Script de backup automatico', 'distilled', 'developed',
                '**Archivo: main.py**
```python
print("backup completed")
```', 'alta');

        -- Idea en consulting pipeline (queued)
        INSERT INTO ideas (id, text, code_stage, execution_status, suggested_agent, priority)
        VALUES (6, 'Presupuesto OPEX Q3', 'organized',
                'queued_consulting', 'finance', 'alta');

        -- Idea reviewing (para Reviewer)
        INSERT INTO ideas (id, text, code_stage, execution_status, execution_output, suggested_agent, priority)
        VALUES (7, 'Plan de capacitacion equipo HSE', 'distilled', 'reviewing',
                '## Plan de Capacitacion\n1. Fase 1\n2. Fase 2', 'training', 'media');

        -- Idea completada
        INSERT INTO ideas (id, text, code_stage, execution_status, execution_output, priority)
        VALUES (8, 'Tarea terminada', 'expressed', 'completed', 'Output final', 'media');

        -- Idea con skills sugeridas pero sin agente
        INSERT INTO ideas (id, text, code_stage, suggested_skills, priority)
        VALUES (9, 'Auditar cumplimiento normativo', 'organized',
                '["core/audit-compliance-readiness.md"]', 'alta');

        -- Idea built (para QA)
        INSERT INTO ideas (id, text, code_stage, execution_status, execution_output, priority)
        VALUES (10, 'API de inventario', 'distilled', 'built',
                '**Archivo: main.py**
```python
print("api running")
```

---
### Build Report (BUILDER)
**Archivos escritos:** 1
- main.py
**venv:** OK | **pip install:** OK | **Syntax:** OK
**Tipo:** Script (exit code 0)', 'alta');
    """)
    yield test_db


@pytest.fixture
def mock_gemini():
    """Access to the mocked Gemini client."""
    return _mock_genai_client


@pytest.fixture
def mock_claude():
    """Access to the mocked Claude client."""
    return _mock_anthropic_client


@pytest.fixture
def mock_claude_content():
    """Access to mock Claude response content (to change text)."""
    return _mock_claude_content
